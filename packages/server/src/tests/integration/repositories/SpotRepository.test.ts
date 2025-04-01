import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Spot } from '../../../domain/models/spot/Spot';
import { SpotRepositoryImpl } from '../../../infrastructure/persistence/cloudflareD1/repositories/SpotRepositoryImpl';

// モックデータ
const mockSpots = [
  {
    id: 'spot-1',
    name: 'Secret Garden',
    description: 'A beautiful secret garden in the heart of the city',
    latitude: '35.6895',
    longitude: '139.6917',
    address: '東京都新宿区XX町X-XX',
    userId: 'user-1',
    hiddenGemRating: 4,
    specialExperience: 'You can see fireflies in summer',
    bestSeasons: JSON.stringify(['春', '夏']),
    bestTimeOfDay: JSON.stringify(['朝', '夕方']),
    visitCount: 42,
    saveCount: 15,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30, // 30日前
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 15, // 15日前
  },
  {
    id: 'spot-2',
    name: 'Mountain View Café',
    description: 'Café with a stunning view of the mountains',
    latitude: '35.6585',
    longitude: '139.7454',
    address: '東京都目黒区XX町X-X',
    userId: 'user-2',
    hiddenGemRating: 5,
    specialExperience: 'The owner sometimes plays jazz piano in the evening',
    bestSeasons: JSON.stringify(['秋', '冬']),
    bestTimeOfDay: JSON.stringify(['昼', '夕方']),
    visitCount: 78,
    saveCount: 34,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20, // 20日前
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5日前
  },
];

// カテゴリ関連のモックデータ
const mockSpotCategories = [
  { spotId: 'spot-1', categoryId: 'nature' },
  { spotId: 'spot-1', categoryId: 'photo' },
  { spotId: 'spot-2', categoryId: 'food' },
  { spotId: 'spot-2', categoryId: 'culture' },
];

// 写真のモックデータ
const mockPhotos = [
  {
    id: 'photo-1',
    spotId: 'spot-1',
    url: '/api/images/spot1-1.jpg',
    caption: 'Garden entrance',
    createdAt: Date.now(),
  },
  {
    id: 'photo-2',
    spotId: 'spot-1',
    url: '/api/images/spot1-2.jpg',
    caption: 'Pond view',
    createdAt: Date.now(),
  },
  {
    id: 'photo-3',
    spotId: 'spot-2',
    url: '/api/images/spot2-1.jpg',
    caption: 'Café interior',
    createdAt: Date.now(),
  },
  {
    id: 'photo-4',
    spotId: 'spot-2',
    url: '/api/images/spot2-2.jpg',
    caption: 'Mountain view',
    createdAt: Date.now(),
  },
];

// D1データベースのモック
const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  innerJoin: vi.fn(),
  groupBy: vi.fn(),
  orderBy: vi.fn(),
};

// selectクエリのモックセットアップ関数
function setupMockSelect(returnValue: any[]) {
  const mockSelect = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue(returnValue),
  };

  mockDb.select.mockReturnValue(mockSelect);
  return mockSelect;
}

describe('SpotRepository Integration Tests', () => {
  let spotRepository: SpotRepositoryImpl;

  beforeEach(() => {
    // テスト前にモックをリセット
    vi.resetAllMocks();

    // リポジトリインスタンスを作成
    spotRepository = new SpotRepositoryImpl(mockDb as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('findById', () => {
    it('should find a spot by id with categories and photos', async () => {
      // スポット情報のモック
      const mockSpot = mockSpots[0];
      const mockSelect = setupMockSelect([mockSpot]);

      // カテゴリ情報のモック
      const categorySelect = setupMockSelect(
        mockSpotCategories.filter((sc) => sc.spotId === mockSpot.id)
      );

      // 写真情報のモック
      const photoSelect = setupMockSelect(mockPhotos.filter((p) => p.spotId === mockSpot.id));

      // テスト対象の実行
      const result = await spotRepository.findById(mockSpot.id);

      // 期待する結果の検証
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockSelect.from).toHaveBeenCalled();
      expect(mockSelect.where).toHaveBeenCalled();

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Spot);
      expect(result?.id).toBe(mockSpot.id);
      expect(result?.name).toBe(mockSpot.name);
      expect(result?.latitude).toBeCloseTo(parseFloat(mockSpot.latitude));
      expect(result?.longitude).toBeCloseTo(parseFloat(mockSpot.longitude));

      // カテゴリと写真が関連付けられていることを確認
      expect(categorySelect).toBeDefined();
      expect(photoSelect).toBeDefined();
    });

    it('should return null when spot not found', async () => {
      // 空の結果をモック
      setupMockSelect([]);

      // テスト対象の実行
      const result = await spotRepository.findById('non-existent-id');

      // 期待する結果の検証
      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('search', () => {
    it('should search spots with provided parameters', async () => {
      // スポット検索のモック
      const mockSelect = setupMockSelect(mockSpots);

      // カテゴリ情報のモック
      setupMockSelect(mockSpotCategories);

      // 写真情報のモック
      setupMockSelect(mockPhotos);

      // 検索パラメータ
      const searchParams = {
        query: 'café',
        categoryIds: ['food'],
        limit: 10,
        offset: 0,
        sortBy: 'popular' as const,
      };

      // テスト対象の実行
      const result = await spotRepository.search(searchParams);

      // 期待する結果の検証
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockSelect.from).toHaveBeenCalled();

      expect(result.length).toBe(mockSpots.length);
      expect(result[0]).toBeInstanceOf(Spot);
    });
  });

  describe('create', () => {
    it('should create a new spot with categories and photos', async () => {
      // モックの設定
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      // 作成するスポットオブジェクト
      const spot = Spot.create({
        id: 'new-spot-id',
        name: 'New Spot',
        description: 'A new amazing spot',
        latitude: 35.6585,
        longitude: 139.7454,
        categoryIds: ['nature', 'photo'],
        userId: 'user-1',
        photos: ['/api/images/new-spot-1.jpg', '/api/images/new-spot-2.jpg'],
        hiddenGemRating: 4,
      });

      // テスト対象の実行
      const result = await spotRepository.create(spot);

      // 期待する結果の検証
      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toBe(spot);
    });
  });

  describe('update', () => {
    it('should update an existing spot', async () => {
      // モックの設定
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      });

      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      // 更新するスポットオブジェクト
      const spot = Spot.create({
        id: 'existing-spot-id',
        name: 'Updated Spot Name',
        description: 'Updated description',
        latitude: 35.6585,
        longitude: 139.7454,
        categoryIds: ['nature', 'culture'],
        userId: 'user-1',
        photos: ['/api/images/updated-1.jpg'],
        hiddenGemRating: 5,
      });

      // テスト対象の実行
      const result = await spotRepository.update(spot);

      // 期待する結果の検証
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.delete).toHaveBeenCalled(); // カテゴリや写真の削除
      expect(mockDb.insert).toHaveBeenCalled(); // 新しいカテゴリや写真の挿入
      expect(result).toBe(spot);
    });
  });

  describe('delete', () => {
    it('should delete a spot and related data', async () => {
      // モックの設定
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      const spotId = 'spot-to-delete';

      // テスト対象の実行
      const result = await spotRepository.delete(spotId);

      // 期待する結果の検証
      expect(mockDb.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('incrementVisitCount', () => {
    it('should increment visit count', async () => {
      // モックの設定
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      });

      const spotId = 'spot-1';

      // テスト対象の実行
      await spotRepository.incrementVisitCount(spotId);

      // 期待する結果の検証
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('incrementSaveCount', () => {
    it('should increment save count', async () => {
      // モックの設定
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      });

      const spotId = 'spot-1';

      // テスト対象の実行
      await spotRepository.incrementSaveCount(spotId);

      // 期待する結果の検証
      expect(mockDb.update).toHaveBeenCalled();
    });
  });
});
