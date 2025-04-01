import { Hono } from 'hono';
import { createYoga } from 'graphql-yoga';
import { Env } from './types/bindings';
import { getAppConfig } from './config/app';
import { getDb } from './infrastructure/persistence/cloudflareD1/db';
import { contextMiddleware, errorMiddleware, getCorsMiddleware } from './utils/middlewares';
import { buildSchema } from './interfaces/graphql/schema';
import { uploadRouter } from './interfaces/api/upload';

// Honoアプリケーションの作成
const app = new Hono<{ Bindings: Env }>();

// ミドルウェアの設定
app.use('*', errorMiddleware);
app.use('*', async (c, next) => {
  // CORSミドルウェアを動的に設定
  const corsMiddleware = getCorsMiddleware(c.env);
  await corsMiddleware(c, next);
});
app.use('*', contextMiddleware);

// ヘルスチェックエンドポイント
app.get('/health', (c) => c.json({ status: 'ok' }));

// GraphQL APIのセットアップ
app.use('/graphql', async (c) => {
  const appContext = c.get('appContext');
  const config = getAppConfig(c.env);

  // データベース接続
  const db = getDb(c.env);

  // GraphQLスキーマ
  const schema = buildSchema();

  // GraphQL Yogaのセットアップ
  const yoga = createYoga({
    schema,
    context: {
      ...appContext,
      db,
    },
    graphqlEndpoint: '/graphql',
    landingPage: config.isDevelopment,
    cors: config.cors,
  });

  // GraphQLリクエストを処理
  return yoga.fetch(c.req.raw);
});

// ファイルアップロードAPI
app.route('/api', uploadRouter);

// REST APIエンドポイント（将来的に必要な場合）
app.get('/api/v1/categories', async (c) => {
  const { CATEGORIES } = await import('@machipoke/shared');
  return c.json(CATEGORIES);
});

// 404エラーハンドラ
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'リクエストされたリソースが見つかりませんでした',
      },
    },
    404
  );
});

// Cloudflare Workersのエントリーポイント
export default {
  fetch: app.fetch,
};
