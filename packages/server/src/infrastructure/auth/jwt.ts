import { jwtDecode } from 'jwt-decode';
import { Env } from '../../types/bindings';
import { ERROR_CODES } from '@machipoke/shared';

/**
 * JWTトークンからユーザーIDを取得
 */
export function getUserIdFromToken(token: string): string | null {
  try {
    const decoded = jwtDecode<{ sub: string }>(token);
    return decoded.sub;
  } catch (error) {
    return null;
  }
}

/**
 * 認証ミドルウェア
 * トークンが有効であれば、コンテキストにユーザーIDとisAuthenticatedフラグを設定
 */
export async function authMiddleware(
  request: Request,
  env: Env
): Promise<{ userId?: string; isAuthenticated: boolean }> {
  // Authorizationヘッダーからトークンを取得
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAuthenticated: false };
  }

  const token = authHeader.split(' ')[1];

  try {
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return { isAuthenticated: false };
    }

    // TODO: 本来はここでJWTの検証を行う
    // Cloudflare Workers環境ではJWT検証ライブラリが制限されるため、
    // 実装方法については検討が必要

    return {
      userId,
      isAuthenticated: true,
    };
  } catch (error) {
    return { isAuthenticated: false };
  }
}

/**
 * 認証エラーを生成
 */
export function createAuthError(code = ERROR_CODES.UNAUTHORIZED) {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code,
        message: 'Authentication required',
      },
    }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
