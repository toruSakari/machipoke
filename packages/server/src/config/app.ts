import { Env } from '../types/bindings';

/**
 * アプリケーション設定
 */
export function getAppConfig(env: Env) {
  const isDevelopment = env.NODE_ENV === 'development';

  return {
    // 環境設定
    isDevelopment,
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',

    // APIおよびクライアント設定
    apiEndpoint: env.API_ENDPOINT || '/api',
    clientUrl: env.CLIENT_URL || 'http://localhost:5173',

    // 認証設定
    auth: {
      jwtSecret: env.JWT_SECRET,
      jwtExpiresIn: env.JWT_EXPIRES_IN || '7d',
    },

    // CORS設定
    cors: {
      allowedOrigins: isDevelopment
        ? ['http://localhost:5173', 'http://localhost:3000']
        : [env.CLIENT_URL].filter(Boolean),
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400, // 24時間
    },

    // キャッシュ設定
    cache: {
      defaultTtl: 60 * 5, // 5分
    },

    // アップロード設定
    upload: {
      maxSizeMB: 5,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },
  };
}

export type AppConfig = ReturnType<typeof getAppConfig>;
