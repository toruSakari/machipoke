import { createYoga } from 'graphql-yoga';
import { buildSchema } from '../../../interfaces/graphql/schema';
import { User } from '../../../domain/models/user/User';
import { Spot } from '../../../domain/models/spot/Spot';

// テスト用のモックユーザー
export const mockUsers = [
  User.create({
    id: 'test-user-1',
    email: 'user1@example.com',
    displayName: 'Test User 1',
    profileImageUrl: null,
    hometown: '東京都渋谷区',
    expertAreas: ['東京', '大阪'],
    bio: 'Test user 1 bio',
    trustScore: 75,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-15'),
  }),
  User.create({
    id: 'test-user-2',
    email: 'user2@example.com',
    displayName: 'Test User 2',
    profileImageUrl: 'https://example.com/user2.jpg',
    hometown: '大阪府大阪市',
    expertAreas: ['大阪', '京都'],
    bio: 'Test user 2 bio',
    trustScore: 90,
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2023-02-15'),
  }),
];

// テスト用のモックスポット
export const mockSpots = [
  Spot.create({
    id: 'test-spot-1',
    name: 'Test Spot 1',
    description: 'This is test spot 1',
    latitude: 35.6895,
    longitude: 139.6917,
    address: '東京都新宿区XX町X-XX',
    categoryIds: ['nature', 'photo'],
    userId: 'test-user-1',
    photos: ['/api/images/test-spot-1-1.jpg', '/api/images/test-spot-1-2.jpg'],
    bestSeasons: ['春', '夏'],
    bestTimeOfDay: ['朝', '夕方'],
    hiddenGemRating: 4,
    specialExperience: 'Special experience at test spot 1',
    visitCount: 42,
    saveCount: 15,
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2023-03-15'),
  }),
  Spot.create({
    id: 'test-spot-2',
    name: 'Test Spot 2',
    description: 'This is test spot 2',
    latitude: 35.6585,
    longitude: 139.7454,
    address: '東京都目黒区XX町X-X',
    categoryIds: ['food', 'culture'],
    userId: 'test-user-2',
    photos: ['/api/images/test-spot-2-1.jpg', '/api/images/test-spot-2-2.jpg'],
    bestSeasons: ['秋', '冬'],
    bestTimeOfDay: ['昼', '夕方'],
    hiddenGemRating: 5,
    specialExperience: 'Special experience at test spot 2',
    visitCount: 78,
    saveCount: 34,
    createdAt: new Date('2023-04-01'),
    updatedAt: new Date('2023-04-15'),
  }),
];

// モックリポジトリ
export const mockUserRepository = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findAll: vi.fn(),
  count: vi.fn(),
};

export const mockSpotRepository = {
  findById: vi.fn(),
  search: vi.fn(),
  count: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findByCategoryId: vi.fn(),
  findByUserId: vi.fn(),
  findNearby: vi.fn(),
  incrementVisitCount: vi.fn(),
  incrementSaveCount: vi.fn(),
};

// モックDB
export const mockDb = {
  // リポジトリ作成時にモックメソッドをセットアップ
};

// モックEnv
export const mockEnv = {
  DB: mockDb,
  CACHE: {},
  IMAGES: {},
  JWT_SECRET: 'test-secret',
  JWT_EXPIRES_IN: '7d',
  API_ENDPOINT: 'http://localhost:8787/api',
  CLIENT_URL: 'http://localhost:5173',
  NODE_ENV: 'test',
};

// テスト用のGraphQL Yogaを作成
export function createTestYoga(context = {}) {
  // GraphQLスキーマを構築
  const schema = buildSchema();

  // GraphQL Yogaのセットアップ
  return createYoga({
    schema,
    context: {
      env: mockEnv,
      isAuthenticated: true,
      userId: 'test-user-1',
      ...context,
    },
  });
}

import { vi } from 'vitest';
