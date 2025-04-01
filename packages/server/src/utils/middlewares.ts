import { Context } from 'hono';
import { cors } from 'hono/cors';
import { Env, AppContext } from '../types/bindings';
import { getAppConfig } from '../config/app';
import { authMiddleware } from '../infrastructure/auth/jwt';

/**
 * CORSミドルウェアを取得
 */
export function getCorsMiddleware(env: Env) {
  const config = getAppConfig(env);

  return cors({
    origin: config.cors.allowedOrigins,
    allowMethods: config.cors.allowedMethods,
    allowHeaders: config.cors.allowedHeaders,
    maxAge: config.cors.maxAge,
  });
}

/**
 * コンテキストミドルウェア
 * 認証情報とenv変数をコンテキストに設定
 */
export async function contextMiddleware(c: Context<{ Bindings: Env }>) {
  const { env } = c;

  // 認証情報を取得
  const { userId, isAuthenticated } = await authMiddleware(c.req.raw, env);

  // AppContextをセット
  const appContext: AppContext = {
    env,
    userId,
    isAuthenticated,
  };

  c.set('appContext', appContext);

  // 次のミドルウェアに進む
  await c.next();
}

/**
 * エラーハンドリングミドルウェア
 */
export async function errorMiddleware(c: Context, next: () => Promise<void>) {
  try {
    await next();
  } catch (error) {
    console.error('Unhandled error:', error);

    return c.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'サーバーでエラーが発生しました',
        },
      },
      500
    );
  }
}
