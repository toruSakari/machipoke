// Cloudflare Workers用のバインディング定義
export interface Env {
  // Cloudflare D1データベース
  DB: D1Database;

  // Cloudflare KVストア
  CACHE: KVNamespace;

  // Cloudflare R2バケット
  IMAGES: R2Bucket;

  // 環境変数
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  API_ENDPOINT: string;
  CLIENT_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  // 他の環境変数をここに追加
}

// アプリケーションコンテキスト型
export interface AppContext {
  env: Env;
  userId?: string;
  isAuthenticated: boolean;
}
