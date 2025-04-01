import { Hono } from 'hono';
import { Env } from '../../types/bindings';
import { getAppConfig } from '../../config/app';
import { R2StorageService } from '../../infrastructure/persistence/cloudflareR2/storage';

// アップロードAPI用のHonoインスタンス
export const uploadRouter = new Hono<{ Bindings: Env }>();

// 画像アップロードエンドポイント
uploadRouter.post('/images', async (c) => {
  try {
    // 認証チェック
    const appContext = c.get('appContext');
    if (!appContext.isAuthenticated) {
      return c.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        401
      );
    }

    // Content-Typeのチェック
    const contentType = c.req.header('Content-Type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return c.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'マルチパートフォームデータが必要です',
          },
        },
        400
      );
    }

    // フォームデータの解析
    const formData = await c.req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return c.json(
        {
          success: false,
          error: {
            code: 'FILE_REQUIRED',
            message: 'ファイルが必要です',
          },
        },
        400
      );
    }

    // アプリケーション設定
    const config = getAppConfig(c.env);

    // ファイルタイプのチェック
    if (!config.upload.allowedTypes.includes(file.type)) {
      return c.json(
        {
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: `サポートされていないファイル形式です。サポートされている形式: ${config.upload.allowedTypes.join(
              ', '
            )}`,
          },
        },
        400
      );
    }

    // ファイルサイズのチェック
    const maxSizeBytes = config.upload.maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return c.json(
        {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: `ファイルサイズが大きすぎます。最大サイズ: ${config.upload.maxSizeMB}MB`,
          },
        },
        400
      );
    }

    // ファイルの読み込み
    const buffer = await file.arrayBuffer();

    // ストレージサービスの初期化
    const storageService = new R2StorageService(c.env);

    // ファイルのアップロード
    const fileUrl = await storageService.uploadFile(buffer, file.name, file.type);

    return c.json({
      success: true,
      data: {
        url: fileUrl,
        filename: file.name,
        contentType: file.type,
        size: file.size,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);

    return c.json(
      {
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: 'ファイルのアップロードに失敗しました',
        },
      },
      500
    );
  }
});

// 画像取得エンドポイント
uploadRouter.get('/images/:filename', async (c) => {
  const filename = c.req.param('filename');

  if (!filename) {
    return c.json(
      {
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'ファイル名が必要です',
        },
      },
      400
    );
  }

  const storageService = new R2StorageService(c.env);
  return storageService.getFile(filename);
});
