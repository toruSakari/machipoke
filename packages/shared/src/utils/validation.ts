import { z } from 'zod';
import { ERROR_CODES } from '../constants';

/**
 * ZodスキーマによるバリデーションとAPIエラー形式への変換
 */
export function validateWithZod<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  // エラーの詳細情報を整形
  const details: Record<string, string[]> = {};

  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!details[path]) {
      details[path] = [];
    }
    details[path].push(err.message);
  });

  return {
    success: false,
    error: {
      code: ERROR_CODES.INVALID_INPUT,
      message: 'バリデーションエラーが発生しました',
      details,
    },
  };
}
