import { Env } from '../../../types/bindings';

/**
 * ファイルのMIMEタイプを取得
 */
function getMimeType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

/**
 * R2ストレージサービス
 */
export class R2StorageService {
  constructor(private readonly env: Env) {}

  /**
   * ファイルをアップロード
   */
  async uploadFile(file: ArrayBuffer, filename: string, contentType?: string): Promise<string> {
    try {
      const uniqueFilename = `${Date.now()}-${filename}`;
      const mimeType = contentType || getMimeType(filename);

      // R2にファイルをアップロード
      await this.env.IMAGES.put(uniqueFilename, file, {
        httpMetadata: {
          contentType: mimeType,
        },
      });

      // アップロードされたファイルのURLを返す
      // 実際のプロジェクトでは、CloudflareのR2パブリックURLまたはプロキシURLを設定する
      return `/api/images/${uniqueFilename}`;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('ファイルのアップロードに失敗しました');
    }
  }

  /**
   * ファイルを取得
   */
  async getFile(filename: string): Promise<Response> {
    try {
      const file = await this.env.IMAGES.get(filename);

      if (!file) {
        return new Response('ファイルが見つかりません', { status: 404 });
      }

      const headers = new Headers();
      file.writeHttpMetadata(headers);
      headers.set('etag', file.httpEtag);

      return new Response(file.body, {
        headers,
      });
    } catch (error) {
      console.error('File get error:', error);
      return new Response('ファイルの取得に失敗しました', { status: 500 });
    }
  }

  /**
   * ファイルを削除
   */
  async deleteFile(filename: string): Promise<boolean> {
    try {
      await this.env.IMAGES.delete(filename);
      return true;
    } catch (error) {
      console.error('File delete error:', error);
      return false;
    }
  }
}
