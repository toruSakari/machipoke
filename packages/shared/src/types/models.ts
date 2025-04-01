import { z } from 'zod';

// ユーザーモデル
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(1).max(50),
  profileImageUrl: z.string().url().optional(),
  hometown: z.string().optional(),
  expertAreas: z.array(z.string()).optional(),
  bio: z.string().max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  trustScore: z.number().min(0).max(100).optional(),
});

export type User = z.infer<typeof UserSchema>;

// スポットモデル
export const SpotSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
  categoryIds: z.array(z.string()),
  userId: z.string().uuid(), // 投稿したユーザーのID
  photos: z.array(z.string().url()).min(1), // 写真のURL配列
  bestSeasons: z.array(z.enum(['春', '夏', '秋', '冬'])).optional(),
  bestTimeOfDay: z.array(z.enum(['朝', '昼', '夕方', '夜'])).optional(),
  hiddenGemRating: z.number().min(1).max(5), // 穴場度合い
  specialExperience: z.string().max(1000).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  visitCount: z.number().default(0),
  saveCount: z.number().default(0),
});

export type Spot = z.infer<typeof SpotSchema>;

// カテゴリモデル
export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  iconName: z.string().optional(),
});

export type Category = z.infer<typeof CategorySchema>;

// コメントモデル
export const CommentSchema = z.object({
  id: z.string().uuid(),
  spotId: z.string().uuid(),
  userId: z.string().uuid(),
  content: z.string().min(1).max(1000),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Comment = z.infer<typeof CommentSchema>;

// 保存リストモデル
export const SavedListSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  spotIds: z.array(z.string().uuid()),
  isPublic: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SavedList = z.infer<typeof SavedListSchema>;
