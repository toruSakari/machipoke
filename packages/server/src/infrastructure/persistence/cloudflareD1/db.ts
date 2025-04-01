import { drizzle } from 'drizzle-orm/d1';
import { Env } from '../../../types/bindings';
import * as schema from './schema';

/**
 * D1データベース接続を取得
 */
export function getDb(env: Env) {
  return drizzle(env.DB, { schema });
}

/**
 * D1データベースとスキーマをエクスポート
 */
export { schema };
