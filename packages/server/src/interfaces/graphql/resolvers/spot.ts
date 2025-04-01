import { builder } from '../schema';
import { SpotType } from '../types/spot';
import { Spot } from '../../../domain/models/spot/Spot';
import { SpotRepositoryImpl } from '../../../infrastructure/persistence/cloudflareD1/repositories/SpotRepositoryImpl';
import { getDb } from '../../../infrastructure/persistence/cloudflareD1/db';

// スポット関連のクエリ
builder.queryFields((t) => ({
  // IDによるスポット取得
  spot: t.field({
    type: SpotType,
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_, args, context) => {
      const db = getDb(context.env);
      const spotRepository = new SpotRepositoryImpl(db);

      const spot = await spotRepository.findById(args.id);

      // アクセス時に訪問カウントを増やす
      if (spot) {
        void spotRepository.incrementVisitCount(spot.id);
      }

      return spot;
    },
  }),

  // スポット検索
  searchSpots: t.field({
    type: 'SpotSearchResult',
    args: {
      input: t.arg({ type: 'SpotSearchInput', required: true }),
    },
    resolve: async (_, args, context) => {
      const db = getDb(context.env);
      const spotRepository = new SpotRepositoryImpl(db);

      const { limit, offset } = args.input;

      // スポット検索
      const spots = await spotRepository.search({
        query: args.input.query,
        categoryIds: args.input.categoryIds,
        nearbyLatitude: args.input.nearbyLatitude,
        nearbyLongitude: args.input.nearbyLongitude,
        radiusKm: args.input.radiusKm,
        limit,
        offset,
        sortBy: args.input.sortBy,
      });

      // 総件数取得
      const totalCount = await spotRepository.count({
        query: args.input.query,
        categoryIds: args.input.categoryIds,
        nearbyLatitude: args.input.nearbyLatitude,
        nearbyLongitude: args.input.nearbyLongitude,
        radiusKm: args.input.radiusKm,
      });

      return {
        spots,
        totalCount,
        offset,
      };
    },
  }),

  // ユーザーのスポット一覧
  userSpots: t.field({
    type: [SpotType],
    args: {
      userId: t.arg.string({ required: true }),
      limit: t.arg.int({ defaultValue: 20 }),
      offset: t.arg.int({ defaultValue: 0 }),
    },
    resolve: async (_, args, context) => {
      const db = getDb(context.env);
      const spotRepository = new SpotRepositoryImpl(db);

      return spotRepository.findByUserId(args.userId, {
        limit: args.limit,
        offset: args.offset,
      });
    },
  }),

  // カテゴリ別スポット一覧
  categorySpots: t.field({
    type: [SpotType],
    args: {
      categoryId: t.arg.string({ required: true }),
      limit: t.arg.int({ defaultValue: 20 }),
      offset: t.arg.int({ defaultValue: 0 }),
    },
    resolve: async (_, args, context) => {
      const db = getDb(context.env);
      const spotRepository = new SpotRepositoryImpl(db);

      return spotRepository.findByCategoryId(args.categoryId, {
        limit: args.limit,
        offset: args.offset,
      });
    },
  }),

  // 近隣スポット一覧
  nearbySpots: t.field({
    type: [SpotType],
    args: {
      latitude: t.arg.float({ required: true }),
      longitude: t.arg.float({ required: true }),
      radiusKm: t.arg.float({ defaultValue: 10 }),
      limit: t.arg.int({ defaultValue: 20 }),
      offset: t.arg.int({ defaultValue: 0 }),
    },
    resolve: async (_, args, context) => {
      const db = getDb(context.env);
      const spotRepository = new SpotRepositoryImpl(db);

      return spotRepository.findNearby({
        latitude: args.latitude,
        longitude: args.longitude,
        radiusKm: args.radiusKm,
        limit: args.limit,
        offset: args.offset,
      });
    },
  }),
}));

// スポット関連のミューテーション
builder.mutationFields((t) => ({
  // スポット作成
  createSpot: t.field({
    type: SpotType,
    args: {
      input: t.arg({ type: 'CreateSpotInput', required: true }),
    },
    resolve: async (_, args, context) => {
      // 認証チェック
      if (!context.isAuthenticated || !context.userId) {
        throw new Error('認証が必要です');
      }

      const db = getDb(context.env);
      const spotRepository = new SpotRepositoryImpl(db);

      // 新規スポットの作成
      const spot = Spot.create({
        id: crypto.randomUUID(),
        name: args.input.name,
        description: args.input.description,
        latitude: args.input.latitude,
        longitude: args.input.longitude,
        address: args.input.address || null,
        categoryIds: args.input.categoryIds,
        userId: context.userId,
        photos: args.input.photos,
        bestSeasons: args.input.bestSeasons || null,
        bestTimeOfDay: args.input.bestTimeOfDay || null,
        hiddenGemRating: args.input.hiddenGemRating,
        specialExperience: args.input.specialExperience || null,
      });

      return spotRepository.create(spot);
    },
  }),

  // スポット更新
  updateSpot: t.field({
    type: SpotType,
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: 'UpdateSpotInput', required: true }),
    },
    resolve: async (_, args, context) => {
      // 認証チェック
      if (!context.isAuthenticated || !context.userId) {
        throw new Error('認証が必要です');
      }

      const db = getDb(context.env);
      const spotRepository = new SpotRepositoryImpl(db);

      // 更新対象のスポットを取得
      const existingSpot = await spotRepository.findById(args.id);
      if (!existingSpot) {
        throw new Error(`スポットが見つかりません: ${args.id}`);
      }

      // スポットの所有者チェック
      if (existingSpot.userId !== context.userId) {
        throw new Error('このスポットを編集する権限がありません');
      }

      // スポット情報を更新
      const updatedSpot = existingSpot.update({
        name: args.input.name,
        description: args.input.description,
        address: args.input.address,
        categoryIds: args.input.categoryIds,
        photos: args.input.photos,
        bestSeasons: args.input.bestSeasons,
        bestTimeOfDay: args.input.bestTimeOfDay,
        hiddenGemRating: args.input.hiddenGemRating,
        specialExperience: args.input.specialExperience,
      });

      return spotRepository.update(updatedSpot);
    },
  }),

  // スポット削除
  deleteSpot: t.field({
    type: 'Boolean',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_, args, context) => {
      // 認証チェック
      if (!context.isAuthenticated || !context.userId) {
        throw new Error('認証が必要です');
      }

      const db = getDb(context.env);
      const spotRepository = new SpotRepositoryImpl(db);

      // 削除対象のスポットを取得
      const existingSpot = await spotRepository.findById(args.id);
      if (!existingSpot) {
        throw new Error(`スポットが見つかりません: ${args.id}`);
      }

      // スポットの所有者チェック
      if (existingSpot.userId !== context.userId) {
        throw new Error('このスポットを削除する権限がありません');
      }

      // スポットの削除
      return spotRepository.delete(args.id);
    },
  }),

  // スポット訪問
  visitSpot: t.field({
    type: 'Boolean',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_, args, context) => {
      // 認証チェック（訪問はログインなしでもカウントするオプションもあり）

      const db = getDb(context.env);
      const spotRepository = new SpotRepositoryImpl(db);

      // スポットの存在確認
      const existingSpot = await spotRepository.findById(args.id);
      if (!existingSpot) {
        throw new Error(`スポットが見つかりません: ${args.id}`);
      }

      // 訪問カウントをインクリメント
      await spotRepository.incrementVisitCount(args.id);

      // ログインユーザーの場合は訪問履歴を記録
      if (context.isAuthenticated && context.userId) {
        // TODO: 訪問履歴テーブルに記録
        // ここではSpotVisitsテーブルにレコードを追加する実装を省略
      }

      return true;
    },
  }),

  // スポット保存
  saveSpot: t.field({
    type: 'Boolean',
    args: {
      id: t.arg.string({ required: true }),
      listId: t.arg.string(), // 保存リストID（省略時はデフォルトリストに保存）
    },
    resolve: async (_, args, context) => {
      // 認証チェック
      if (!context.isAuthenticated || !context.userId) {
        throw new Error('認証が必要です');
      }

      const db = getDb(context.env);
      const spotRepository = new SpotRepositoryImpl(db);

      // スポットの存在確認
      const existingSpot = await spotRepository.findById(args.id);
      if (!existingSpot) {
        throw new Error(`スポットが見つかりません: ${args.id}`);
      }

      // 保存カウントをインクリメント
      await spotRepository.incrementSaveCount(args.id);

      // TODO: 保存リストに追加（実装は省略）
      // SavedListsテーブルとSavedListSpotsテーブルを更新する処理

      return true;
    },
  }),
}));
