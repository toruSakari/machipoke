import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createTestYoga, mockUsers, mockUserRepository } from './setup';

describe('User GraphQL Queries', () => {
  let yoga: any;

  beforeEach(() => {
    // モックをリセット
    vi.resetAllMocks();

    // テスト用のGraphQL Yogaを作成
    yoga = createTestYoga();

    // UserRepositoryのモックをセットアップ
    mockUserRepository.findById.mockImplementation((id) => {
      return Promise.resolve(mockUsers.find((user) => user.id === id) || null);
    });

    mockUserRepository.findAll.mockResolvedValue(mockUsers);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('me query', () => {
    it('should return the current user when authenticated', async () => {
      // GraphQLのクエリを実行
      const response = await yoga.fetch('http://yoga/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query Me {
              me {
                id
                email
                displayName
                profileImageUrl
                hometown
                expertAreas
                bio
                trustScore
                createdAt
                updatedAt
              }
            }
          `,
        }),
      });

      // レスポンスをJSON形式に変換
      const result = await response.json();

      // エラーがないことを確認
      expect(result.errors).toBeUndefined();

      // データの検証
      const user = result.data.me;
      expect(user).toBeDefined();
      expect(user.id).toBe('test-user-1'); // テスト用のユーザーID
      expect(user.email).toBe(mockUsers[0].email);
      expect(user.displayName).toBe(mockUsers[0].displayName);
    });

    it('should return null when not authenticated', async () => {
      // 認証されていないコンテキストでYogaを作成
      yoga = createTestYoga({ isAuthenticated: false, userId: undefined });

      // GraphQLのクエリを実行
      const response = await yoga.fetch('http://yoga/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query Me {
              me {
                id
                email
                displayName
              }
            }
          `,
        }),
      });

      // レスポンスをJSON形式に変換
      const result = await response.json();

      // エラーがないことを確認
      expect(result.errors).toBeUndefined();

      // ユーザーがnullであることを確認
      expect(result.data.me).toBeNull();
    });
  });

  describe('user query', () => {
    it('should return a user by ID', async () => {
      const targetUser = mockUsers[1]; // 2番目のユーザー

      // GraphQLのクエリを実行
      const response = await yoga.fetch('http://yoga/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetUser($id: String!) {
              user(id: $id) {
                id
                email
                displayName
                profileImageUrl
                hometown
                expertAreas
                bio
                trustScore
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            id: targetUser.id,
          },
        }),
      });

      // レスポンスをJSON形式に変換
      const result = await response.json();

      // エラーがないことを確認
      expect(result.errors).toBeUndefined();

      // データの検証
      const user = result.data.user;
      expect(user).toBeDefined();
      expect(user.id).toBe(targetUser.id);
      expect(user.email).toBe(targetUser.email);
      expect(user.displayName).toBe(targetUser.displayName);
      expect(user.hometown).toBe(targetUser.hometown);
    });

    it('should return null when user not found', async () => {
      // GraphQLのクエリを実行
      const response = await yoga.fetch('http://yoga/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetUser($id: String!) {
              user(id: $id) {
                id
                email
                displayName
              }
            }
          `,
          variables: {
            id: 'non-existent-user',
          },
        }),
      });

      // レスポンスをJSON形式に変換
      const result = await response.json();

      // エラーがないことを確認
      expect(result.errors).toBeUndefined();

      // ユーザーがnullであることを確認
      expect(result.data.user).toBeNull();
    });
  });

  describe('users query', () => {
    it('should return a list of users with pagination', async () => {
      // GraphQLのクエリを実行
      const response = await yoga.fetch('http://yoga/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetUsers($limit: Int, $offset: Int) {
              users(limit: $limit, offset: $offset) {
                id
                email
                displayName
              }
            }
          `,
          variables: {
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
      const users = result.data.users;
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBe(mockUsers.length);

      // 各ユーザーの検証
      users.forEach((user: any, index: number) => {
        expect(user.id).toBe(mockUsers[index].id);
        expect(user.email).toBe(mockUsers[index].email);
        expect(user.displayName).toBe(mockUsers[index].displayName);
      });
    });
  });
});
