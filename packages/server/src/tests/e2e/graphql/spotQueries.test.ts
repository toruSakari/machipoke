import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  createTestYoga,
  mockSpots,
  mockSpotRepository,
  mockUserRepository,
  mockUsers,
} from './setup';

describe('Spot GraphQL Queries', () => {
  let yoga: any;

  beforeEach(() => {
    // モックをリセット
    vi.resetAllMocks();

    // テスト用のGraphQL Yogaを作成
    yoga = createTestYoga();

    // SpotRepositoryのモックをセットアップ
    mockSpotRepository.findById.mockImplementation((id) => {
      return Promise.resolve(mockSpots.find((spot) => spot.id === id) || null);
    });

    mockSpotRepository.search.mockResolvedValue(mockSpots);
    mockSpotRepository.count.mockResolvedValue(mockSpots.length);

    mockSpotRepository.findByUserId.mockImplementation((userId) => {
      return Promise.resolve(mockSpots.filter((spot) => spot.userId === userId));
    });

    mockSpotRepository.findByCategoryId.mockImplementation((categoryId) => {
      return Promise.resolve(mockSpots.filter((spot) => spot.categoryIds.includes(categoryId)));
    });

    mockSpotRepository.findNearby.mockResolvedValue(mockSpots);

    // UserRepositoryのモックをセットアップ（Spot.userフィールド用）
    mockUserRepository.findById.mockImplementation((id) => {
      return Promise.resolve(mockUsers.find((user) => user.id === id) || null);
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('spot query', () => {
    it('should return a spot by ID', async () => {
      const targetSpot = mockSpots[0];

      // GraphQLのクエリを実行
      const response = await yoga.fetch('http://yoga/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetSpot($id: String!) {
              spot(id: $id) {
                id
                name
                description
                latitude
                longitude
                address
                categoryIds
                userId
                photos
                bestSeasons
                bestTimeOfDay
                hiddenGemRating
                specialExperience
                visitCount
                saveCount
                createdAt
                updatedAt
                user {
                  id
                  displayName
                }
              }
            }
          `,
          variables: {
            id: targetSpot.id,
          },
        }),
      });

      // レスポンスをJSON形式に変換
      const result = await response.json();

      // エラーがないことを確認
      expect(result.errors).toBeUndefined();

      // データの検証
      const spot = result.data.spot;
      expect(spot).toBeDefined();
      expect(spot.id).toBe(targetSpot.id);
      expect(spot.name).toBe(targetSpot.name);
      expect(spot.description).toBe(targetSpot.description);
      expect(spot.latitude).toBe(targetSpot.latitude);
      expect(spot.longitude).toBe(targetSpot.longitude);
      expect(spot.address).toBe(targetSpot.address);
      expect(spot.categoryIds).toEqual(targetSpot.categoryIds);
      expect(spot.userId).toBe(targetSpot.userId);
      expect(spot.photos).toEqual(targetSpot.photos);
      expect(spot.hiddenGemRating).toBe(targetSpot.hiddenGemRating);

      // 関連ユーザーの検証
      expect(spot.user).toBeDefined();
      expect(spot.user.id).toBe(targetSpot.userId);

      // 訪問カウントがインクリメントされることを確認
      expect(mockSpotRepository.incrementVisitCount).toHaveBeenCalledWith(targetSpot.id);
    });

    it('should return null when spot not found', async () => {
      // GraphQLのクエリを実行
      const response = await yoga.fetch('http://yoga/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetSpot($id: String!) {
              spot(id: $id) {
                id
                name
                description
              }
            }
          `,
          variables: {
            id: 'non-existent-spot',
          },
        }),
      });

      // レスポンスをJSON形式に変換
      const result = await response.json();

      // エラーがないことを確認
      expect(result.errors).toBeUndefined();

      // スポットがnullであることを確認
      expect(result.data.spot).toBeNull();
    });
  });

  describe('searchSpots query', () => {
    it('should search spots with provided parameters', async () => {
      // GraphQLのクエリを実行
      const response = await yoga.fetch('http://yoga/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query SearchSpots($input: SpotSearchInput!) {
              searchSpots(input: $input) {
                spots {
                  id
                  name
                  description
                }
                totalCount
                hasMore
              }
            }
          `,
          variables: {
            input: {
              query: 'test',
              categoryIds: ['nature'],
              limit: 10,
              offset: 0,
              sortBy: 'newest',
            },
          },
        }),
      });

      // レスポンスをJSON形式に変換
      const result = await response.json();

      // エラーがないことを確認
      expect(result.errors).toBeUndefined();

      // データの検証
      const searchResult = result.data.searchSpots;
      expect(searchResult).toBeDefined();
      expect(searchResult.spots).toBeDefined();
      expect(Array.isArray(searchResult.spots)).toBe(true);
      expect(searchResult.spots.length).toBe(mockSpots.length);
      expect(searchResult.totalCount).toBe(mockSpots.length);
      expect(searchResult.hasMore).toBe(false); // テストデータの件数が少ないので

      // 検索パラメータが正しく渡されていることを確認
      expect(mockSpotRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'test',
          categoryIds: ['nature'],
          limit: 10,
          offset: 0,
          sortBy: 'newest',
        })
      );
    });
  });

  describe('userSpots query', () => {
    it('should return spots by user ID', async () => {
      const userId = mockUsers[0].id;
      const userSpots = mockSpots.filter((spot) => spot.userId === userId);

      // GraphQLのクエリを実行
      const response = await yoga.fetch('http://yoga/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetUserSpots($userId: String!, $limit: Int, $offset: Int) {
              userSpots(userId: $userId, limit: $limit, offset: $offset) {
                id
                name
                description
              }
            }
          `,
          variables: {
            userId,
            limit: 10,
            offset: 0,
          },
        }),
      });

      // レスポンスをJSON形式に変換
      const result = await response.json();

      // エラーがないことを確認
      expect(result.errors).toBeUndefined();

      // データの検証
      const spots = result.data.userSpots;
      expect(spots).toBeDefined();
      expect(Array.isArray(spots)).toBe(true);
      expect(spots.length).toBe(userSpots.length);

      // ユーザーIDが正しく渡されていることを確認
      expect(mockSpotRepository.findByUserId).toHaveBeenCalledWith(userId, expect.any(Object));
    });
  });

  describe('categorySpots query', () => {
    it('should return spots by category ID', async () => {
      const categoryId = 'nature';
      const categorySpots = mockSpots.filter((spot) => spot.categoryIds.includes(categoryId));

      // GraphQLのクエリを実行
      const response = await yoga.fetch('http://yoga/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetCategorySpots($categoryId: String!, $limit: Int, $offset: Int) {
              categorySpots(categoryId: $categoryId, limit: $limit, offset: $offset) {
                id
                name
                description
              }
            }
          `,
          variables: {
            categoryId,
            limit: 10,
            offset: 0,
          },
        }),
      });

      // レスポンスをJSON形式に変換
      const result = await response.json();

      // エラーがないことを確認
      expect(result.errors).toBeUndefined();

      // データの検証
      const spots = result.data.categorySpots;
      expect(spots).toBeDefined();
      expect(Array.isArray(spots)).toBe(true);
      expect(spots.length).toBe(categorySpots.length);

      // カテゴリIDが正しく渡されていることを確認
      expect(mockSpotRepository.findByCategoryId).toHaveBeenCalledWith(
        categoryId,
        expect.any(Object)
      );
    });
  });

  describe('nearbySpots query', () => {
    it('should return spots nearby a location', async () => {
      const latitude = 35.6895;
      const longitude = 139.6917;
      const radiusKm = 5;

      // GraphQLのクエリを実行
      const response = await yoga.fetch('http://yoga/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetNearbySpots($latitude: Float!, $longitude: Float!, $radiusKm: Float, $limit: Int, $offset: Int) {
              nearbySpots(latitude: $latitude, longitude: $longitude, radiusKm: $radiusKm, limit: $limit, offset: $offset) {
                id
                name
                description
                latitude
                longitude
              }
            }
          `,
          variables: {
            latitude,
            longitude,
            radiusKm,
            limit: 10,
            offset: 0,
          },
        }),
      });

      // レスポンスをJSON形式に変換
      const result = await response.json();

      // エラーがないことを確認
      expect(result.errors).toBeUndefined();

      // データの検証
      const spots = result.data.nearbySpots;
      expect(spots).toBeDefined();
      expect(Array.isArray(spots)).toBe(true);
      expect(spots.length).toBe(mockSpots.length);

      // 位置情報パラメータが正しく渡されていることを確認
      expect(mockSpotRepository.findNearby).toHaveBeenCalledWith({
        latitude,
        longitude,
        radiusKm,
        limit: 10,
        offset: 0,
      });
    });
  });
});
