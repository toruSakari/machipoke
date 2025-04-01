import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { User } from '../../../domain/models/user/User';
import { UserRepositoryImpl } from '../../../infrastructure/persistence/cloudflareD1/repositories/UserRepositoryImpl';

// モックデータ
const mockUsers = [
  {
    id: 'user-1',
    email: 'user1@example.com',
    displayName: 'User One',
    profileImageUrl: null,
    hometown: '東京都渋谷区',
    expertAreas: JSON.stringify(['東京', '大阪']),
    bio: 'User 1 Bio',
    trustScore: 70,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10日前
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5日前
  },
  {
    id: 'user-2',
    email: 'user2@example.com',
    displayName: 'User Two',
    profileImageUrl: 'https://example.com/user2.jpg',
    hometown: '大阪府大阪市',
    expertAreas: JSON.stringify(['大阪', '京都']),
    bio: 'User 2 Bio',
    trustScore: 85,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5日前
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2日前
  },
];

// D1データベースのモック
const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

// selectクエリのモックセットアップ関数
function setupMockSelect(returnValue: any[]) {
  const mockSelect = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue(returnValue),
  };

  mockDb.select.mockReturnValue(mockSelect);
  return mockSelect;
}

describe('UserRepository Integration Tests', () => {
  let userRepository: UserRepositoryImpl;

  beforeEach(() => {
    // テスト前にモックをリセット
    vi.resetAllMocks();

    // リポジトリインスタンスを作成
    userRepository = new UserRepositoryImpl(mockDb as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      // モックの設定
      const mockUser = mockUsers[0];
      const mockSelect = setupMockSelect([mockUser]);

      // テスト対象の実行
      const result = await userRepository.findById(mockUser.id);

      // 期待する結果の検証
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockSelect.from).toHaveBeenCalled();
      expect(mockSelect.where).toHaveBeenCalled();
      expect(mockSelect.limit).toHaveBeenCalledWith(1);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe(mockUser.id);
      expect(result?.email).toBe(mockUser.email);
      expect(result?.displayName).toBe(mockUser.displayName);
    });

    it('should return null when user not found', async () => {
      // 空の結果をモック
      setupMockSelect([]);

      // テスト対象の実行
      const result = await userRepository.findById('non-existent-id');

      // 期待する結果の検証
      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      // モックの設定
      const mockUser = mockUsers[0];
      const mockSelect = setupMockSelect([mockUser]);

      // テスト対象の実行
      const result = await userRepository.findByEmail(mockUser.email);

      // 期待する結果の検証
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockSelect.from).toHaveBeenCalled();
      expect(mockSelect.where).toHaveBeenCalled();
      expect(mockSelect.limit).toHaveBeenCalledWith(1);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe(mockUser.id);
      expect(result?.email).toBe(mockUser.email);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      // モックの設定
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      // 作成するユーザーオブジェクト
      const user = User.create({
        id: 'new-user-id',
        email: 'newuser@example.com',
        displayName: 'New User',
        profileImageUrl: 'https://example.com/newuser.jpg',
        hometown: '京都府京都市',
        expertAreas: ['京都', '奈良'],
        bio: 'New User Bio',
        trustScore: 50,
      });

      // テスト対象の実行
      const result = await userRepository.create(user);

      // 期待する結果の検証
      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toBe(user);
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      // モックの設定
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      });

      // 更新するユーザーオブジェクト
      const user = User.create({
        id: 'existing-user-id',
        email: 'existinguser@example.com',
        displayName: 'Updated Name',
        bio: 'Updated Bio',
      });

      // テスト対象の実行
      const result = await userRepository.update(user);

      // 期待する結果の検証
      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toBe(user);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      // モックの設定
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      const userId = 'user-to-delete';

      // テスト対象の実行
      const result = await userRepository.delete(userId);

      // 期待する結果の検証
      expect(mockDb.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should return all users with pagination', async () => {
      // モックの設定
      const mockSelect = setupMockSelect(mockUsers);

      // テスト対象の実行
      const result = await userRepository.findAll({ limit: 10, offset: 0 });

      // 期待する結果の検証
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockSelect.from).toHaveBeenCalled();
      expect(mockSelect.limit).toHaveBeenCalledWith(10);
      expect(mockSelect.offset).toHaveBeenCalledWith(0);

      expect(result).toHaveLength(mockUsers.length);
      expect(result[0]).toBeInstanceOf(User);
      expect(result[0].id).toBe(mockUsers[0].id);
      expect(result[1].id).toBe(mockUsers[1].id);
    });
  });
});
