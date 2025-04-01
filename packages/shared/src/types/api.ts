import { z } from 'zod';
import { UserSchema, SpotSchema, CategorySchema, CommentSchema, SavedListSchema } from './models';

// ユーザー関連API
export const CreateUserInputSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  trustScore: true,
});

export const UpdateUserInputSchema = UserSchema.omit({
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  trustScore: true,
}).partial();

// スポット関連API
export const CreateSpotInputSchema = SpotSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  visitCount: true,
  saveCount: true,
});

export const UpdateSpotInputSchema = SpotSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  visitCount: true,
  saveCount: true,
}).partial();

// スポット検索パラメータ
export const SearchSpotsParamsSchema = z.object({
  query: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  nearbyLatitude: z.number().optional(),
  nearbyLongitude: z.number().optional(),
  radiusKm: z.number().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['newest', 'popular', 'hiddenGem']).optional(),
});

// コメント関連API
export const CreateCommentInputSchema = CommentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 保存リスト関連API
export const CreateSavedListInputSchema = SavedListSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateSavedListInputSchema = SavedListSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// API レスポンス型
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
};
