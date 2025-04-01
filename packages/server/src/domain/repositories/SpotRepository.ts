import { Spot } from '../models/spot/Spot';

/**
 * スポット検索パラメータ
 */
export interface SpotSearchParams {
  query?: string;
  categoryIds?: string[];
  userId?: string;
  nearbyLatitude?: number;
  nearbyLongitude?: number;
  radiusKm?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'newest' | 'popular' | 'hiddenGem';
}

/**
 * スポットリポジトリインターフェース
 */
export interface SpotRepository {
  /**
   * IDによるスポット取得
   */
  findById(id: string): Promise<Spot | null>;

  /**
   * 条件に基づくスポット検索
   */
  search(params: SpotSearchParams): Promise<Spot[]>;

  /**
   * 検索条件に合致するスポット数を取得
   */
  count(params: Omit<SpotSearchParams, 'limit' | 'offset' | 'sortBy'>): Promise<number>;

  /**
   * スポットの作成
   */
  create(spot: Spot): Promise<Spot>;

  /**
   * スポットの更新
   */
  update(spot: Spot): Promise<Spot>;

  /**
   * スポットの削除
   */
  delete(id: string): Promise<boolean>;

  /**
   * カテゴリに基づくスポット取得
   */
  findByCategoryId(
    categoryId: string,
    params: {
      limit?: number;
      offset?: number;
    }
  ): Promise<Spot[]>;

  /**
   * ユーザーに基づくスポット取得
   */
  findByUserId(
    userId: string,
    params: {
      limit?: number;
      offset?: number;
    }
  ): Promise<Spot[]>;

  /**
   * 位置情報に基づく近隣スポットの取得
   */
  findNearby(params: {
    latitude: number;
    longitude: number;
    radiusKm: number;
    limit?: number;
    offset?: number;
  }): Promise<Spot[]>;

  /**
   * 訪問数のインクリメント
   */
  incrementVisitCount(id: string): Promise<void>;

  /**
   * 保存数のインクリメント
   */
  incrementSaveCount(id: string): Promise<void>;
}
