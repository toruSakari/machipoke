# Cloudflare 環境設定ガイド

このドキュメントでは、マチポケプロジェクトのCloudflareサービスのセットアップと設定について詳細に説明します。

## 目次

1. [Cloudflareアカウント設定](#cloudflareアカウント設定)
2. [ドメイン設定](#ドメイン設定)
3. [Cloudflare D1データベース](#cloudflare-d1データベース)
4. [Cloudflare KVストレージ](#cloudflare-kvストレージ)
5. [Cloudflare R2ストレージ](#cloudflare-r2ストレージ)
6. [Cloudflare Workers](#cloudflare-workers)
7. [Cloudflare Pages](#cloudflare-pages)
8. [セキュリティ設定](#セキュリティ設定)
9. [モニタリングとアナリティクス](#モニタリングとアナリティクス)
10. [コスト管理](#コスト管理)

## Cloudflareアカウント設定

### アカウント作成

1. [Cloudflareのサインアップページ](https://dash.cloudflare.com/sign-up)にアクセス
2. メールアドレスとパスワードを入力して登録
3. 2要素認証を有効にして、アカウントを保護

### チームメンバーの招待

1. Cloudflareダッシュボードの「Members」タブを選択
2. 「Invite」ボタンをクリック
3. メンバーのメールアドレスと権限レベルを設定
4. 招待メールを送信

### APIトークンの作成

CI/CDパイプラインやデプロイメント用のAPIトークンを作成します：

1. Cloudflareダッシュボードの「API Tokens」を選択
2. 「Create Token」をクリック
3. 「Edit Cloudflare Workers」テンプレートを選択
4. アクセス権を設定：
   - アカウントリソース: Include - マチポケアカウント
   - ゾーンリソース: Include - machipoke.com
   - 権限: 
     - Workers Scripts: Edit
     - Workers Routes: Edit
     - Workers KV Storage: Edit
     - Workers R2 Storage: Edit
     - Account Settings: Read
5. トークン名を設定（例: `machipoke-deployment-token`）
6. トークンを作成し、安全に保管

## ドメイン設定

### ドメインの追加

1. Cloudflareダッシュボードで「Add a Site」をクリック
2. ドメイン名（`machipoke.com`）を入力
3. プランを選択（推奨: Pro以上）
4. DNSレコードの確認
5. ネームサーバーの更新指示に従う

### 環境別サブドメインの設定

各環境用にDNSレコードを設定します：

#### 本番環境

```
Type    Name               Content                              TTL     Proxy status
A       machipoke.com      Workers経由で処理                      Auto    Proxied
A       api                Workers経由で処理                      Auto    Proxied
CNAME   www                machipoke.com                        Auto    Proxied
CNAME   images             machipoke-images.r2.dev              Auto    Proxied
```

#### ステージング環境

```
Type    Name               Content                              TTL     Proxy status
A       staging            Workers経由で処理                      Auto    Proxied
A       api-staging        Workers経由で処理                      Auto    Proxied
```

#### 開発環境

```
Type    Name               Content                              TTL     Proxy status
A       dev                Workers経由で処理                      Auto    Proxied
A       api-dev            Workers経由で処理                      Auto    Proxied
```

### SSLモードの設定

1. 「SSL/TLS」セクションに移動
2. 「Full (strict)」モードを選択
3. 「Edge Certificates」で次の設定を有効化:
   - Always Use HTTPS
   - Minimum TLS Version: TLS 1.2
   - Opportunistic Encryption
   - TLS 1.3
   - Automatic HTTPS Rewrites

## Cloudflare D1データベース

D1はCloudflareのサーバーレスSQLデータベースです。

### データベースの作成

```bash
# プロダクションデータベースの作成
npx wrangler d1 create machipoke-prod

# ステージングデータベースの作成
npx wrangler d1 create machipoke-staging

# 開発データベースの作成
npx wrangler d1 create machipoke-dev
```

### データベース情報の確認

```bash
# データベース情報の表示
npx wrangler d1 info machipoke-prod
```

### マイグレーションの作成

```bash
# マイグレーションファイルの作成
npx wrangler d1 migrations create add-spots-table
```

これにより、`migrations/[timestamp]_add-spots-table.sql` ファイルが作成されます。

### マイグレーションスクリプトの例

```sql
-- マイグレーションアップファイル: migrations/[timestamp]_add-spots-table.sql
CREATE TABLE IF NOT EXISTS spots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  hidden_level INTEGER NOT NULL DEFAULT 1,
  created_by_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (created_by_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_spots_created_by ON spots(created_by_id);
CREATE INDEX IF NOT EXISTS idx_spots_location ON spots(latitude, longitude);
```

### マイグレーションの適用

```bash
# プロダクションデータベースにマイグレーションを適用
npx wrangler d1 migrations apply machipoke-prod

# ステージングデータベースにマイグレーションを適用
npx wrangler d1 migrations apply machipoke-staging

# 開発データベースにマイグレーションを適用
npx wrangler d1 migrations apply machipoke-dev
```

### データのエクスポート/インポート

```bash
# データをエクスポート
npx wrangler d1 export machipoke-prod > machipoke-data.sql

# データをインポート
npx wrangler d1 import machipoke-staging ./machipoke-data.sql
```

## Cloudflare KVストレージ

KVはキー・バリューストアで、セッション情報やキャッシュなどに利用します。

### KVネームスペースの作成

```bash
# プロダクション用KVの作成
npx wrangler kv:namespace create MACHIPOKE_KV_PROD

# ステージング用KVの作成
npx wrangler kv:namespace create MACHIPOKE_KV_STAGING

# 開発用KVの作成
npx wrangler kv:namespace create MACHIPOKE_KV_DEV
```

### KVへのデータ追加

```bash
# KVに値を追加
npx wrangler kv:key put --namespace-id=<namespace-id> "config:api_version" "v1"

# TTL付きで値を追加（86400秒 = 24時間）
npx wrangler kv:key put --namespace-id=<namespace-id> "session:123" '{"user":"user1"}' --ttl=86400
```

### KVの値を取得

```bash
# KVから値を取得
npx wrangler kv:key get --namespace-id=<namespace-id> "config:api_version"
```

### ワーカーでのKV設定

`wrangler.toml`ファイルで、KVをバインドします：

```toml
[[kv_namespaces]]
binding = "KV"
id = "your-kv-namespace-id"
```

## Cloudflare R2ストレージ

R2はS3互換のオブジェクトストレージで、画像などのファイル保存に利用します。

### R2バケットの作成

```bash
# プロダクション用バケットの作成
npx wrangler r2 bucket create machipoke-images-prod

# ステージング用バケットの作成
npx wrangler r2 bucket create machipoke-images-staging

# 開発用バケットの作成
npx wrangler r2 bucket create machipoke-images-dev
```

### CORSの設定

```bash
# CORS設定ファイルの作成
cat > cors.json << EOL
{
  "CorsRules": [
    {
      "AllowedOrigins": ["https://machipoke.com", "https://staging.machipoke.com", "https://dev.machipoke.com"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOL

# CORSポリシーの適用
npx wrangler r2 bucket cors set machipoke-images-prod --config=cors.json
npx wrangler r2 bucket cors set machipoke-images-staging --config=cors.json
npx wrangler r2 bucket cors set machipoke-images-dev --config=cors.json
```

### ワーカーでのR2設定

`wrangler.toml`ファイルで、R2をバインドします：

```toml
[[r2_buckets]]
binding = "R2"
bucket_name = "machipoke-images-prod"
```

### パブリックR2バケットの設定

パブリックアクセスが必要な場合は、R2バケットをパブリックに設定します：

1. Cloudflareダッシュボードで「R2」を選択
2. 対象バケットの「Configuration」タブを開く
3. 「Public Access」を「Enabled」に設定
4. パブリックURLを確認（例: `https://pub-xxxx.r2.dev/`）

## Cloudflare Workers

Workersは、サーバーレスJavaScript実行環境です。

### ワーカーの作成と設定

```bash
# ワーカープロジェクトの初期化
npx wrangler init packages/server
```

### ワーカー設定ファイル（wrangler.toml）

```toml
name = "machipoke-api"
main = "./dist/index.js"
compatibility_date = "2023-10-01"

# 本番環境設定
[env.production]
route = "api.machipoke.com/*"
workers_dev = false
[[env.production.d1_databases]]
binding = "DB"
database_name = "machipoke-prod"
database_id = "your-prod-database-id"
[[env.production.kv_namespaces]]
binding = "KV"
id = "your-prod-kv-id"
[[env.production.r2_buckets]]
binding = "R2"
bucket_name = "machipoke-images-prod"

# ステージング環境設定
[env.staging]
route = "api-staging.machipoke.com/*"
workers_dev = false
[[env.staging.d1_databases]]
binding = "DB"
database_name = "machipoke-staging"
database_id = "your-staging-database-id"
[[env.staging.kv_namespaces]]
binding = "KV"
id = "your-staging-kv-id"
[[env.staging.r2_buckets]]
binding = "R2"
bucket_name = "machipoke-images-prod"

# ステージング環境設定
[env.staging]
route = "api-staging.machipoke.com/*"
workers_dev = false
[[env.staging.d1_databases]]
binding = "DB"
database_name = "machipoke-staging"
database_id = "your-staging-database-id"
[[env.staging.kv_namespaces]]
binding = "KV"
id = "your-staging-kv-id"
[[env.staging.r2_buckets]]
binding = "R2"
bucket_name = "machipoke-images-staging"

# 開発環境設定
[env.development]
route = "api-dev.machipoke.com/*"
workers_dev = false
[[env.development.d1_databases]]
binding = "DB"
database_name = "machipoke-dev"
database_id = "your-dev-database-id"
[[env.development.kv_namespaces]]
binding = "KV"
id = "your-dev-kv-id"
[[env.development.r2_buckets]]
binding = "R2"
bucket_name = "machipoke-images-dev"
```

### ワーカーのデプロイ

```bash
# 開発環境へのデプロイ
npx wrangler deploy --env=development

# ステージング環境へのデプロイ
npx wrangler deploy --env=staging

# 本番環境へのデプロイ
npx wrangler deploy --env=production
```

### 環境変数の設定

```bash
# 開発環境の環境変数を設定
npx wrangler secret put AUTH_SECRET --env=development

# ステージング環境の環境変数を設定
npx wrangler secret put AUTH_SECRET --env=staging

# 本番環境の環境変数を設定
npx wrangler secret put AUTH_SECRET --env=production
```

### ワーカーのログ確認

```bash
# 開発環境のログを確認
npx wrangler tail --env=development

# ステージング環境のログを確認
npx wrangler tail --env=staging

# 本番環境のログを確認
npx wrangler tail --env=production
```

## Cloudflare Pages

Cloudflare Pagesは静的サイトやサーバーレンダリングアプリケーションをホスティングするサービスです。

### Pagesプロジェクトの作成

1. Cloudflareダッシュボードで「Workers & Pages」を選択
2. 「Create a project」をクリック
3. 「Connect to Git」を選択
4. GitHubアカウントを認証
5. 対象のリポジトリを選択
6. 次の設定を行う：
   - Project name: `machipoke-frontend`
   - Production branch: `main`
   - Build command: `cd packages/client && npm run build`
   - Build output directory: `packages/client/dist`
   - Root directory: `/`

### 環境変数の設定

Pagesダッシュボードから環境変数を設定します：

1. プロジェクトを選択
2. 「Settings > Environment variables」を選択
3. 「Add variable」をクリック
4. 環境変数の名前と値を入力
5. 必要に応じて「Encrypt」オプションを選択
6. 「Environment」リストから必要な環境を選択
   - Production: 本番環境用
   - Preview: ステージング環境用
   - Development: 開発環境用
7. 「Save」をクリック

### 検証環境の設定

Gitのブランチやタグごとに検証環境を設定します：

1. 「Settings > Builds & deployments」を選択
2. 「Preview deployments」セクションで「Configure preview deployments」をクリック
3. 以下のように設定：
   - 「All commits」: オフ
   - 「Pull requests from any branch」: オン
   - 「Pull requests from specific branches」: オン
   - Branch names: `develop`, `release/*`
4. 「Save」をクリック

### カスタムドメインの設定

Pagesプロジェクトにカスタムドメインを設定します：

1. プロジェクトを選択
2. 「Settings > Custom domains」を選択
3. 「Set up a custom domain」をクリック
4. 各環境用のドメインを追加：
   - 本番環境: `machipoke.com`
   - ステージング環境: `staging.machipoke.com`
   - 開発環境: `dev.machipoke.com`
5. 「Validate」をクリックして確認
6. 「Activate domain」をクリック

### Functionsの設定

SSRや動的エッジ処理を有効にするため、Pages Functionsを設定します：

1. `packages/client/functions` ディレクトリを作成
2. `_middleware.ts` ファイルを作成

```typescript
// packages/client/functions/_middleware.ts
import { Context } from '@cloudflare/workers-types';

export const onRequest = async ({ request, next, env }: Context) => {
  // リクエストURLの取得
  const url = new URL(request.url);

  // CORSヘッダーの設定
  const response = await next();
  const newResponse = new Response(response.body, response);
  
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  
  return newResponse;
};
```

3. SSR用のサーバーサイドパスを作成します：

```typescript
// packages/client/functions/[[path]].ts
import { renderToString } from 'react-dom/server';
import { createServerRouter } from '../src/routes';
import { Context } from '@cloudflare/workers-types';

export const onRequest = async ({ request, params, env }: Context) => {
  try {
    // ルートURLからパスを取得
    const url = new URL(request.url);
    const path = url.pathname;

    // SSR処理
    const { html, headers } = await renderOnServer(path, request, env);

    // レスポンスを返す
    return new Response(html, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        ...headers,
      },
    });
  } catch (error) {
    return new Response(`Server Error: ${error.message}`, { status: 500 });
  }
};

async function renderOnServer(path, request, env) {
  // ここにSSRの処理ロジックを実装
  // 実装はプロジェクトによって異なる
}
```

## セキュリティ設定

### Webアプリケーションファイアウォール（WAF）

Cloudflare WAFは、一般的な攻撃からアプリケーションを保護します：

1. Cloudflareダッシュボードの「Security > WAF」を選択
2. 以下の設定を有効化：
   - Cross-site Scripting (XSS) Attacks: 有効
   - SQL Injection Attacks: 有効
   - Remote File Inclusion (RFI): 有効
   - Local File Inclusion (LFI): 有効
   - Sensitive Data Detection: 有効

### CORS設定

WorkersでのCORS設定例：

```typescript
app.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      'https://machipoke.com',
      'https://staging.machipoke.com',
      'https://dev.machipoke.com',
    ];
    
    // 開発環境ではローカルホストも許可
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000');
    }
    
    // originがnullの場合（サーバー間リクエストなど）も許可
    if (!origin) return true;
    
    return allowedOrigins.includes(origin);
  },
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));
```

### セキュリティヘッダー

```typescript
// セキュリティ関連ヘッダーの設定
app.use('*', async (c, next) => {
  await next();
  
  c.res.headers.set('X-Content-Type-Options', 'nosniff');
  c.res.headers.set('X-Frame-Options', 'DENY');
  c.res.headers.set('X-XSS-Protection', '1; mode=block');
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  c.res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  c.res.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://images.machipoke.com data:;");
});
```

### レートリミティング

APIリクエストにレートリミットを設定：

```typescript
// Cloudflare Workers KVを使用したレートリミットの実装
app.use('*', async (c, next) => {
  const ip = c.req.headers.get('CF-Connecting-IP') || 'unknown';
  const endpoint = new URL(c.req.url).pathname;
  const key = `ratelimit:${ip}:${endpoint}`;
  
  // KVから現在のレート情報を取得
  const rateInfo = await c.env.KV.get(key, 'json') || { count: 0, timestamp: Date.now() };
  
  // 前回のリクエストから60秒以上経過していればリセット
  if (Date.now() - rateInfo.timestamp > 60000) {
    rateInfo.count = 0;
    rateInfo.timestamp = Date.now();
  }
  
  // このエンドポイントのリクエスト制限をチェック
  if (rateInfo.count >= 100) { // 1分間に100リクエストまで
    return c.json({ error: 'Rate limit exceeded' }, 429);
  }
  
  // カウントを増やしてKVに保存
  rateInfo.count++;
  await c.env.KV.put(key, JSON.stringify(rateInfo), { expirationTtl: 60 });
  
  return next();
});
```

## モニタリングとアナリティクス

### ワーカーのログモニタリング

Cloudflare Workersのログを確認する方法：

1. Cloudflareダッシュボードの「Workers & Pages」を選択
2. 対象のワーカーを選択
3. 「Logs」タブを選択

ログの固定化：

```typescript
// 標準的なロギング形式を設定
const logger = {
  info: (message, data) => {
    console.log(JSON.stringify({ level: 'info', message, data, timestamp: new Date().toISOString() }));
  },
  error: (message, error, data) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message || String(error),
      stack: error?.stack,
      data,
      timestamp: new Date().toISOString()
    }));
  },
  warn: (message, data) => {
    console.warn(JSON.stringify({ level: 'warn', message, data, timestamp: new Date().toISOString() }));
  },
  debug: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(JSON.stringify({ level: 'debug', message, data, timestamp: new Date().toISOString() }));
    }
  }
};

// 使用例
app.onError((err, c) => {
  logger.error('Request error', err, {
    url: c.req.url,
    method: c.req.method,
    headers: Object.fromEntries(c.req.headers.entries()),
  });
  
  return c.json({ error: 'Internal Server Error' }, 500);
});
```

### アプリケーションアナリティクス

CloudflareのWeb Analyticsを設定する手順：

1. Cloudflareダッシュボードの「Web Analytics」を選択
2. 「Add a site」をクリック
3. サイト名（例：`machipoke.com`）を入力
4. 「Add」をクリック

JavaScriptスニペットは自動的に挿入されますが、必要に応じて手動で追加することもできます：

```html
<!-- Cloudflare Web Analytics -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "your-token"}'></script>
<!-- End Cloudflare Web Analytics -->
```

### カスタムアナリティクス

Google Analyticsなどのカスタムアナリティクスを使用する場合は、ルートコンポーネントなどにスニペットを追加します：

```typescript
// src/layouts/RootLayout.tsx
import React, { useEffect } from 'react';

export const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Google Analytics初期化コードをここに追加
    if (typeof window !== 'undefined') {
      // GA初期化コードを実行
    }
  }, []);

  return (
    <div className="app-root">
      {/* 共通ヘッダーやナビゲーション */}
      <main>{children}</main>
      {/* 共通フッター */}
    </div>
  );
};
```

## コスト管理

Cloudflareの各サービスには無料制限および料金が設定されています。適切に管理する必要があります。

### ワーカーの制限

Cloudflare Workersの無料制限：
- 1日ひ10万リクエスト
- 128MBのKVストレージ
- エッジロケーション（Bandwidthは制限なし）

コストを削減するベストプラクティス：

1. 適切なキャッシング戦略を実装
   ```typescript
   // カスタムキャッシュ制御
   app.get('/api/spots/:id', async (c) => {
     const spotId = c.req.param('id');
     const cacheKey = `spot:${spotId}`;
     
     // KVからキャッシュを取得
     const cachedSpot = await c.env.KV.get(cacheKey, 'json');
     if (cachedSpot) {
       return c.json(cachedSpot);
     }
     
     // DBからデータを取得
     const spot = await c.env.DB.prepare(`SELECT * FROM spots WHERE id = ?`)
       .bind(spotId)
       .first();
     
     if (!spot) {
       return c.json({ error: 'Spot not found' }, 404);
     }
     
     // キャッシュに保存（1時間）
     await c.env.KV.put(cacheKey, JSON.stringify(spot), { expirationTtl: 3600 });
     
     return c.json(spot);
   });
   ```

2. ワーカーの実行時間を最適化
   - 不要な処理を最小化
   - 非同期処理を活用
   - コストが高い処理を特定

3. R2ストレージの利用最適化
   - 保存する画像の圧縮とサイズ最適化
   - 不要な画像の定期的なクリーンアップ

### 使用量のモニタリング

Cloudflareダッシュボードから各サービスの使用量を確認できます：

1. 「Analytics」タブを選択
2. 「Workers」セクションでリクエスト数とCPU時間を確認
3. 「R2」セクションでストレージ使用量とリクエスト数を確認
4. 「Pages」セクションでビルド時間とデプロイ回数を確認

### 予算アラートの設定

1. Cloudflareダッシュボードの「Account」タブを選択
2. 「Billing」を選択
3. 「Payment History」タブを選択
4. 「Spending Alerts」を選択
5. 「Add Alert」をクリックし、予算のしきい値を設定

## まとめと参考リソース

### 実装チェックリスト

- [ ] Cloudflareアカウントのセットアップ
- [ ] ドメインの追加とDNS設定
- [ ] D1データベースの作成とマイグレーション
- [ ] KVネームスペースの作成
- [ ] R2バケットの作成とCORS設定
- [ ] Workersの作成とデプロイ
- [ ] Pagesプロジェクトの作成と設定
- [ ] 環境変数の設定
- [ ] セキュリティ設定
- [ ] モニタリングとアナリティクスの設定
- [ ] 使用量とコストの管理

### 公式ドキュメント

- [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 ドキュメント](https://developers.cloudflare.com/d1/)
- [Cloudflare KV ドキュメント](https://developers.cloudflare.com/kv/)
- [Cloudflare R2 ドキュメント](https://developers.cloudflare.com/r2/)
- [Wrangler CLI ドキュメント](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Drizzle ORM ドキュメント](https://orm.drizzle.team/)
- [Hono フレームワーク ドキュメント](https://hono.dev/)

### 参考チュートリアル

- [Cloudflare WorkersでサーバーレスAPIを構築する](https://developers.cloudflare.com/workers/tutorials/build-a-serverless-api/)
- [Cloudflare PagesでReactアプリをデプロイする](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-application/)
- [R2を使用した画像アップロード](https://developers.cloudflare.com/r2/examples/public-objects-js/)
- [D1データベースの使用方法](https://developers.cloudflare.com/d1/get-started/)
- [Cloudflare WorkersのSSR実装](https://developers.cloudflare.com/workers/tutorials/build-a-slackbot/)