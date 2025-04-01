import { eq, and, like, desc, asc, inArray, sql } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { Spot } from '../../../../domain/models/spot/Spot';
import { SpotRepository, SpotSearchParams } from '../../../../domain/repositories/SpotRepository';
import * as schema from '../schema';
import { getBoundingBox } from '@machipoke/shared';

/**
 * D1データベースを使用したSpotRepositoryの実装
 */
export class SpotRepositoryImpl implements SpotRepository {
  constructor(private readonly db: DrizzleD1Database<typeof schema>) {}

  /**
   * IDによるスポット取得
   */
  async findById(id: string): Promise<Spot | null> {
    // スポット情報を取得
    const spotResult = await this.db
      .select()
      .from(schema.spots)
      .where(eq(schema.spots.id, id))
      .limit(1);
    if (!spotResult.length) return null;

    const spot = spotResult[0];

    // スポットのカテゴリIDを取得
    const categoryResults = await this.db
      .select({
        categoryId: schema.spotCategories.categoryId,
      })
      .from(schema.spotCategories)
      .where(eq(schema.spotCategories.spotId, id));

    const categoryIds = categoryResults.map((row) => row.categoryId);

    // スポットの写真を取得
    const photoResults = await this.db
      .select({
        url: schema.photos.url,
      })
      .from(schema.photos)
      .where(eq(schema.photos.spotId, id));

    const photos = photoResults.map((row) => row.url);

    return Spot.create({
      id: spot.id,
      name: spot.name,
      description: spot.description,
      latitude: parseFloat(spot.latitude),
      longitude: parseFloat(spot.longitude),
      address: spot.address,
      categoryIds,
      userId: spot.userId,
      photos,
      bestSeasons: spot.bestSeasons ? JSON.parse(spot.bestSeasons) : null,
      bestTimeOfDay: spot.bestTimeOfDay ? JSON.parse(spot.bestTimeOfDay) : null,
      hiddenGemRating: spot.hiddenGemRating,
      specialExperience: spot.specialExperience,
      visitCount: spot.visitCount ?? 0,
      saveCount: spot.saveCount ?? 0,
      createdAt: spot.createdAt ? new Date(spot.createdAt) : new Date(),
      updatedAt: spot.updatedAt ? new Date(spot.updatedAt) : new Date(),
    });
  }

  /**
   * 条件に基づくスポット検索
   */
  async search(params: SpotSearchParams): Promise<Spot[]> {
    const {
      query,
      categoryIds,
      userId,
      nearbyLatitude,
      nearbyLongitude,
      radiusKm,
      limit = 20,
      offset = 0,
      sortBy = 'newest',
    } = params;

    // 基本クエリ
    let spotsQuery = this.db.select().from(schema.spots);

    // 検索条件を追加
    const conditions = [];

    // テキスト検索
    if (query) {
      conditions.push(
        or(
          like(schema.spots.name, `%${query}%`),
          like(schema.spots.description, `%${query}%`),
          like(schema.spots.address, `%${query}%`)
        )
      );
    }

    // ユーザーIDによるフィルタリング
    if (userId) {
      conditions.push(eq(schema.spots.userId, userId));
    }

    // 位置情報による検索
    if (nearbyLatitude && nearbyLongitude && radiusKm) {
      const bbox = getBoundingBox(nearbyLatitude, nearbyLongitude, radiusKm);

      // SQLiteでは緯度経度を文字列として保存しているため、キャストが必要
      conditions.push(
        and(
          sql`CAST(${schema.spots.latitude} AS REAL) >= ${bbox.minLat}`,
          sql`CAST(${schema.spots.latitude} AS REAL) <= ${bbox.maxLat}`,
          sql`CAST(${schema.spots.longitude} AS REAL) >= ${bbox.minLon}`,
          sql`CAST(${schema.spots.longitude} AS REAL) <= ${bbox.maxLon}`
        )
      );
    }

    // 条件をクエリに適用
    if (conditions.length > 0) {
      spotsQuery = spotsQuery.where(and(...conditions));
    }

    // カテゴリによるフィルタリング
    // カテゴリIDが指定されている場合は、spotCategoriesテーブルと結合して検索
    if (categoryIds && categoryIds.length > 0) {
      spotsQuery = spotsQuery
        .innerJoin(
          schema.spotCategories,
          and(
            eq(schema.spots.id, schema.spotCategories.spotId),
            inArray(schema.spotCategories.categoryId, categoryIds)
          )
        )
        .groupBy(schema.spots.id);
    }

    // ソート順の適用
    switch (sortBy) {
      case 'popular':
        spotsQuery = spotsQuery.orderBy(desc(schema.spots.visitCount));
        break;
      case 'hiddenGem':
        spotsQuery = spotsQuery.orderBy(desc(schema.spots.hiddenGemRating));
        break;
      case 'newest':
      default:
        spotsQuery = spotsQuery.orderBy(desc(schema.spots.createdAt));
        break;
    }

    // ページネーション
    spotsQuery = spotsQuery.limit(limit).offset(offset);

    // クエリ実行
    const spotResults = await spotsQuery;

    // 結果が空の場合は早期リターン
    if (!spotResults.length) return [];

    // スポットIDの配列を作成
    const spotIds = spotResults.map((spot) => spot.id);

    // カテゴリIDを一括取得
    const categoryResults = await this.db
      .select({
        spotId: schema.spotCategories.spotId,
        categoryId: schema.spotCategories.categoryId,
      })
      .from(schema.spotCategories)
      .where(inArray(schema.spotCategories.spotId, spotIds));

    // スポットID別にカテゴリIDをグループ化
    const categoryIdsBySpotId: Record<string, string[]> = {};
    for (const row of categoryResults) {
      if (!categoryIdsBySpotId[row.spotId]) {
        categoryIdsBySpotId[row.spotId] = [];
      }
      categoryIdsBySpotId[row.spotId].push(row.categoryId);
    }

    // 写真を一括取得
    const photoResults = await this.db
      .select({
        spotId: schema.photos.spotId,
        url: schema.photos.url,
      })
      .from(schema.photos)
      .where(inArray(schema.photos.spotId, spotIds));

    // スポットID別に写真URLをグループ化
    const photosBySpotId: Record<string, string[]> = {};
    for (const row of photoResults) {
      if (!photosBySpotId[row.spotId]) {
        photosBySpotId[row.spotId] = [];
      }
      photosBySpotId[row.spotId].push(row.url);
    }

    // スポットエンティティに変換して返す
    return spotResults.map((spot) => {
      const spotId = spot.id;
      const photos = photosBySpotId[spotId] || [];
      const categoryIds = categoryIdsBySpotId[spotId] || [];

      return Spot.create({
        id: spot.id,
        name: spot.name,
        description: spot.description,
        latitude: parseFloat(spot.latitude),
        longitude: parseFloat(spot.longitude),
        address: spot.address,
        categoryIds,
        userId: spot.userId,
        photos,
        bestSeasons: spot.bestSeasons ? JSON.parse(spot.bestSeasons) : null,
        bestTimeOfDay: spot.bestTimeOfDay ? JSON.parse(spot.bestTimeOfDay) : null,
        hiddenGemRating: spot.hiddenGemRating,
        specialExperience: spot.specialExperience,
        visitCount: spot.visitCount ?? 0,
        saveCount: spot.saveCount ?? 0,
        createdAt: spot.createdAt ? new Date(spot.createdAt) : new Date(),
        updatedAt: spot.updatedAt ? new Date(spot.updatedAt) : new Date(),
      });
    });
  }

  /**
   * 検索条件に合致するスポット数を取得
   */
  async count(params: Omit<SpotSearchParams, 'limit' | 'offset' | 'sortBy'>): Promise<number> {
    const { query, categoryIds, userId, nearbyLatitude, nearbyLongitude, radiusKm } = params;

    // 基本クエリ
    let countQuery = this.db
      .select({ count: sql`count(DISTINCT ${schema.spots.id})` })
      .from(schema.spots);

    // 検索条件を追加
    const conditions = [];

    // テキスト検索
    if (query) {
      conditions.push(
        or(
          like(schema.spots.name, `%${query}%`),
          like(schema.spots.description, `%${query}%`),
          like(schema.spots.address, `%${query}%`)
        )
      );
    }

    // ユーザーIDによるフィルタリング
    if (userId) {
      conditions.push(eq(schema.spots.userId, userId));
    }

    // 位置情報による検索
    if (nearbyLatitude && nearbyLongitude && radiusKm) {
      const bbox = getBoundingBox(nearbyLatitude, nearbyLongitude, radiusKm);

      conditions.push(
        and(
          sql`CAST(${schema.spots.latitude} AS REAL) >= ${bbox.minLat}`,
          sql`CAST(${schema.spots.latitude} AS REAL) <= ${bbox.maxLat}`,
          sql`CAST(${schema.spots.longitude} AS REAL) >= ${bbox.minLon}`,
          sql`CAST(${schema.spots.longitude} AS REAL) <= ${bbox.maxLon}`
        )
      );
    }

    // 条件をクエリに適用
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }

    // カテゴリによるフィルタリング
    if (categoryIds && categoryIds.length > 0) {
      countQuery = countQuery.innerJoin(
        schema.spotCategories,
        and(
          eq(schema.spots.id, schema.spotCategories.spotId),
          inArray(schema.spotCategories.categoryId, categoryIds)
        )
      );
    }

    // クエリ実行
    const result = await countQuery;
    return result[0]?.count ?? 0;
  }

  /**
   * スポットの作成
   */
  async create(spot: Spot): Promise<Spot> {
    // トランザクションで一連の処理を実行することが理想だが、
    // D1はトランザクションをサポートしていないため、順次処理を行う

    // スポット情報を保存
    const spotData = {
      id: spot.id,
      name: spot.name,
      description: spot.description,
      latitude: spot.latitude.toString(),
      longitude: spot.longitude.toString(),
      address: spot.address,
      userId: spot.userId,
      hiddenGemRating: spot.hiddenGemRating,
      specialExperience: spot.specialExperience,
      bestSeasons: spot.bestSeasons ? JSON.stringify(spot.bestSeasons) : null,
      bestTimeOfDay: spot.bestTimeOfDay ? JSON.stringify(spot.bestTimeOfDay) : null,
      visitCount: spot.visitCount,
      saveCount: spot.saveCount,
      createdAt: spot.createdAt.getTime(),
      updatedAt: spot.updatedAt.getTime(),
    };

    await this.db.insert(schema.spots).values(spotData);

    // カテゴリ関連を保存
    for (const categoryId of spot.categoryIds) {
      await this.db.insert(schema.spotCategories).values({
        spotId: spot.id,
        categoryId,
      });
    }

    // 写真を保存
    for (const url of spot.photos) {
      await this.db.insert(schema.photos).values({
        id: crypto.randomUUID(),
        spotId: spot.id,
        url,
        caption: null,
        createdAt: spot.createdAt.getTime(),
      });
    }

    return spot;
  }

  /**
   * スポットの更新
   */
  async update(spot: Spot): Promise<Spot> {
    // スポット情報を更新
    const spotData = {
      name: spot.name,
      description: spot.description,
      address: spot.address,
      hiddenGemRating: spot.hiddenGemRating,
      specialExperience: spot.specialExperience,
      bestSeasons: spot.bestSeasons ? JSON.stringify(spot.bestSeasons) : null,
      bestTimeOfDay: spot.bestTimeOfDay ? JSON.stringify(spot.bestTimeOfDay) : null,
      updatedAt: spot.updatedAt.getTime(),
    };

    await this.db.update(schema.spots).set(spotData).where(eq(schema.spots.id, spot.id));

    // カテゴリ関連を更新（一度削除して再作成）
    await this.db.delete(schema.spotCategories).where(eq(schema.spotCategories.spotId, spot.id));

    for (const categoryId of spot.categoryIds) {
      await this.db.insert(schema.spotCategories).values({
        spotId: spot.id,
        categoryId,
      });
    }

    // 写真を更新（一度削除して再作成）
    // 本番環境では写真の差分更新を検討すべき
    await this.db.delete(schema.photos).where(eq(schema.photos.spotId, spot.id));

    for (const url of spot.photos) {
      await this.db.insert(schema.photos).values({
        id: crypto.randomUUID(),
        spotId: spot.id,
        url,
        caption: null,
        createdAt: new Date().getTime(),
      });
    }

    return spot;
  }

  /**
   * スポットの削除
   */
  async delete(id: string): Promise<boolean> {
    // 関連するデータを先に削除
    await this.db.delete(schema.photos).where(eq(schema.photos.spotId, id));
    await this.db.delete(schema.spotCategories).where(eq(schema.spotCategories.spotId, id));
    await this.db.delete(schema.comments).where(eq(schema.comments.spotId, id));
    await this.db.delete(schema.savedListSpots).where(eq(schema.savedListSpots.spotId, id));
    await this.db.delete(schema.spotVisits).where(eq(schema.spotVisits.spotId, id));

    // スポット本体を削除
    await this.db.delete(schema.spots).where(eq(schema.spots.id, id));

    return true;
  }

  /**
   * カテゴリに基づくスポット取得
   */
  async findByCategoryId(
    categoryId: string,
    params: { limit?: number; offset?: number }
  ): Promise<Spot[]> {
    return this.search({
      categoryIds: [categoryId],
      limit: params.limit,
      offset: params.offset,
    });
  }

  /**
   * ユーザーに基づくスポット取得
   */
  async findByUserId(userId: string, params: { limit?: number; offset?: number }): Promise<Spot[]> {
    return this.search({
      userId,
      limit: params.limit,
      offset: params.offset,
    });
  }

  /**
   * 位置情報に基づく近隣スポットの取得
   */
  async findNearby(params: {
    latitude: number;
    longitude: number;
    radiusKm: number;
    limit?: number;
    offset?: number;
  }): Promise<Spot[]> {
    return this.search({
      nearbyLatitude: params.latitude,
      nearbyLongitude: params.longitude,
      radiusKm: params.radiusKm,
      limit: params.limit,
      offset: params.offset,
    });
  }

  /**
   * 訪問数のインクリメント
   */
  async incrementVisitCount(id: string): Promise<void> {
    await this.db
      .update(schema.spots)
      .set({
        visitCount: sql`${schema.spots.visitCount} + 1`,
        updatedAt: new Date().getTime(),
      })
      .where(eq(schema.spots.id, id));
  }

  /**
   * 保存数のインクリメント
   */
  async incrementSaveCount(id: string): Promise<void> {
    await this.db
      .update(schema.spots)
      .set({
        saveCount: sql`${schema.spots.saveCount} + 1`,
        updatedAt: new Date().getTime(),
      })
      .where(eq(schema.spots.id, id));
  }
}

// SQLiteのOR演算子
function or(...conditions: any[]) {
  return sql`(${sql.join(conditions, ' OR ')})`;
}
