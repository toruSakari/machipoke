# マチポケ デプロイメントガイド

このドキュメントでは、マチポケアプリケーションのデプロイ方法と関連する設定について説明します。

## 目次

1. [デプロイメント概要](#デプロイメント概要)
2. [環境設定](#環境設定)
3. [フロントエンドのデプロイ](#フロントエンドのデプロイ)
4. [バックエンドのデプロイ](#バックエンドのデプロイ)
5. [データベースのセットアップ](#データベースのセットアップ)
6. [ストレージのセットアップ](#ストレージのセットアップ)
7. [CI/CDパイプライン](#cicdパイプライン)
8. [環境別デプロイ設定](#環境別デプロイ設定)
9. [デプロイ後の確認](#デプロイ後の確認)
10. [ロールバック手順](#ロールバック手順)
11. [トラブルシューティング](#トラブルシューティング)

## デプロイメント概要

マチポケは以下のコンポーネントで構成されています：

- **フロントエンド**: React + React Router v7（SSR対応）
- **バックエンド**: Cloudflare Workers + Hono
- **データベース**: Cloudflare D1（リレーショナルデータ）
- **キャッシュ**: Cloudflare KV
- **画像ストレージ**: Cloudflare R2

デプロイはCloudflare Pagesとワークフローを使用して自動化されています。

## 環境設定

マチポケでは以下の環境が設定されています：

1. **開発環境（Development）**: `dev.machipoke.com`
   - 開発中の機能テスト用
   - `develop` ブランチにマージ時に自動デプロイ

2. **ステージング環境（Staging）**: `staging.machipoke.com`
   - リリース前の最終確認用
   - `release/*` ブランチからのPull Requestをマージ時に自動デプロイ

3. **本番環境（Production）**: `machipoke.com`
   - エンドユーザー向け環境
   - `main` ブランチにマージ時に自動デプロイ

## 環境変数の設定

各環境ごとに以下の環境変数を設定する必要があります：

```bash
# API設定
API_URL=https://api.machipoke.com  # 本番環境の例
API_VERSION=v1

# 認証
AUTH_DOMAIN=auth.machipoke.com
AUTH_CLIENT_ID=your-auth-client-id
AUTH_AUDIENCE=your-auth-audience

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your-account-id

# Mapbox（地図表示用）
MAPBOX_ACCESS_TOKEN=your-mapbox-token
MAPBOX_STYLE=mapbox://styles/mapbox/streets-v11

# 画像配信
IMAGE_CDN_URL=https://images.machipoke.com
```

### 環境変数の設定方法

#### Cloudflare Dashboardから設定

1. Cloudflare Dashboardにログイン
2. Workers & Pagesセクションに移動
3. 対象プロジェクトを選択
4. 「Settings > Environment variables」を開く
5. 必要な環境変数を追加

## フロントエンドのデプロイ

フロントエンドはCloudflare Pagesにデプロイされます。

### 手動デプロイ（開発時）

```bash
# プロジェクトのルートディレクトリで実行
cd packages/client

# 本番用ビルドを作成
npm run build

# Cloudflare Pagesにデプロイ
npx wrangler pages publish dist --project-name=machipoke-frontend
```

### 設定ファイル

Cloudflare Pagesの設定は、プロジェクトルートの`wrangler.toml`ファイルで管理されます：

```toml
# wrangler.toml
name = "machipoke-frontend"
route = ''
type = "webpack"
account_id = "your-account-id"
workers_dev = true
compatibility_date = "2023-10-01"

[site]
bucket = "dist"
entry-point = "packages/client"

[env.production]
routes = [
  { pattern = "machipoke.com/*", zone_id = "your-zone-id" }
]

[env.staging]
routes = [
  { pattern = "staging.machipoke.com/*", zone_id = "your-zone-id" }
]

[env.development]
routes = [
  { pattern = "dev.machipoke.com/*", zone_id = "your-zone-id" }
]
```

## バックエンドのデプロイ

バックエンドはCloudflare Workersにデプロイされます。

### 手動デプロイ（開発時）

```bash
# プロジェクトのルートディレクトリで実行
cd packages/server

# 本番用ビルド
npm run build

# 開発環境へのデプロイ
npm run deploy:dev

# ステージング環境へのデプロイ
npm run deploy:staging

# 本番環境へのデプロイ
npm run deploy:prod
```

### 設定ファイル

バックエンドの設定は、`packages/server/wrangler.toml`で管理されます：

```toml
# packages/server/wrangler.toml
name = "machipoke-api"
main = "./dist/index.js"
compatibility_date = "2023-10-01"

[build]
command = "npm run build"

[build.upload]
format = "service-worker"

# D1データベース設定
[[d1_databases]]
binding = "DB"
database_name = "machipoke-prod"
database_id = "your-database-id"

# KVストア設定
[[kv_namespaces]]
binding = "KV"
id = "your-kv-namespace-id"

# R2バケット設定
[[r2_buckets]]
binding = "R2"
bucket_name = "machipoke-images"

# 本番環境設定
[env.production]
route = "api.machipoke.com/*"
[[env.production.d1_databases]]
binding = "DB"
database_name = "machipoke-prod"
database_id = "your-prod-database-id"

# ステージング環境設定
[env.staging]
route = "api-staging.machipoke.com/*"
[[env.staging.d1_databases]]
binding = "DB"
database_name = "machipoke-staging"
database_id = "your-staging-database-id"

# 開発環境設定
[env.development]
route = "api-dev.machipoke.com/*"
[[env.development.d1_databases]]
binding = "DB"
database_name = "machipoke-dev"
database_id = "your-dev-database-id"
```

## データベースのセットアップ

Cloudflare D1の初期設定手順：

### データベースの作成

```bash
# 新しいD1データベースを作成
npx wrangler d1 create machipoke-prod
npx wrangler d1 create machipoke-staging
npx wrangler d1 create machipoke-dev
```

### マイグレーションの適用

```bash
# マイグレーションディレクトリに移動
cd packages/server/migrations

# 本番環境にマイグレーションを適用
npx wrangler d1 migrations apply machipoke-prod

# ステージング環境にマイグレーションを適用
npx wrangler d1 migrations apply machipoke-staging

# 開発環境にマイグレーションを適用
npx wrangler d1 migrations apply machipoke-dev
```

### 新しいマイグレーションの作成

```bash
# 新しいマイグレーションファイルを作成
npx wrangler d1 migrations create add-new-table
```

## ストレージのセットアップ

### R2バケットの作成

画像保存用のR2バケットを作成：

```bash
# R2バケットを作成
npx wrangler r2 bucket create machipoke-images

# 開発用バケットの作成（オプション）
npx wrangler r2 bucket create machipoke-images-dev
```

### R2バケットのCORSポリシー設定

```bash
# CORSポリシー設定ファイルの作成
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
npx wrangler r2 bucket cors set machipoke-images --config=cors.json
```

## CI/CDパイプライン

GitHubリポジトリとCloudflareの連携により、CI/CDパイプラインが構築されています。

### GitHub Actions設定

プロジェクトの`.github/workflows/deploy.yml`：

```yaml
name: Deploy

on:
  push:
    branches:
      - main
      - develop
      - 'release/**'
  pull_request:
    branches:
      - main
      - develop

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build backend
        working-directory: ./packages/server
        run: npm run build
      - name: Deploy to development
        if: github.ref == 'refs/heads/develop'
        working-directory: ./packages/server
        run: npm run deploy:dev
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      - name: Deploy to staging
        if: startsWith(github.ref, 'refs/heads/release/')
        working-directory: ./packages/server
        run: npm run deploy:staging
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        working-directory: ./packages/server
        run: npm run deploy:prod
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build frontend
        working-directory: ./packages/client
        run: npm run build
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: machipoke-frontend
          directory: ./packages/client/dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

## 環境別デプロイ設定

### 開発環境（Development）

- **フロントエンド**: https://dev.machipoke.com
- **バックエンド**: https://api-dev.machipoke.com
- **ブランチ**: develop
- **データベース**: machipoke-dev
- **トリガー**: `develop` ブランチへのプッシュ

### ステージング環境（Staging）

- **フロントエンド**: https://staging.machipoke.com
- **バックエンド**: https://api-staging.machipoke.com
- **ブランチ**: release/*
- **データベース**: machipoke-staging
- **トリガー**: `release/*` ブランチからのPull Requestがマージされたとき

### 本番環境（Production）

- **フロントエンド**: https://machipoke.com
- **バックエンド**: https://api.machipoke.com
- **ブランチ**: main
- **データベース**: machipoke-prod
- **トリガー**: `main` ブランチへのプッシュ

## デプロイ後の確認

各環境へのデプロイ後、以下の確認を行います：

### 基本チェック項目

- [ ] フロントエンドが正しくロードされる
- [ ] バックエンドAPIが応答する
- [ ] 認証システムが機能している
- [ ] 地図表示機能が正常に動作する
- [ ] スポットデータが表示される
- [ ] 画像アップロードが機能する

### 自動化されたチェック

E2Eテストスイートを実行して、主要な機能が正常に動作することを確認します：

```bash
# E2Eテストの実行
npm run test:e2e
```

## ロールバック手順

デプロイ後に問題が発生した場合のロールバック手順：

### バックエンドのロールバック

```bash
# 特定のバージョンにロールバック
npx wrangler rollback --env=production --version=1.2.3
```

### フロントエンドのロールバック

Cloudflare Pagesダッシュボードから、前のデプロイを選択し「Rollback to this deployment」を選択します。

### データベースのロールバック

データベースの変更が必要な場合：

1. ロールバック用のマイグレーションスクリプトを適用
2. バックアップからの復元（重大な問題の場合）

## トラブルシューティング

### 一般的な問題

#### 1. デプロイに失敗する

- Cloudflare APIトークンの権限が適切か確認
- ビルドエラーがないか確認
- デプロイプロセスのログを確認

#### 2. APIが応答しない

- ワーカールートが正しく設定されているか確認
- 環境変数が正しく設定されているか確認
- ワーカーのログでエラーを確認

#### 3. データベースの接続エラー

- D1バインディングが正しく設定されているか確認
- データベースIDが環境変数と一致しているか確認

#### 4. 画像がロードされない

- R2バケットのCORS設定を確認
- R2バインディングが正しく設定されているか確認
- 画像URLのパスが正しいか確認

### デバッグ方法

#### ログの確認

Cloudflare Dashboardの「Workers」セクションでログを確認できます：

1. Cloudflare Dashboardにログイン
2. 「Workers & Pages」を選択
3. 対象のワーカーを選択
4. 「Logs」タブを開く

#### リクエストの監視

```bash
# ワーカーのリクエスト監視（ローカル開発）
npx wrangler tail
```

#### 環境変数の確認

```bash
# 環境変数一覧を表示
npx wrangler secret list
```

## 付録

### 有用なコマンド集

```bash
# ローカルでワーカーを実行
npx wrangler dev

# プロダクション環境変数を設定
npx wrangler secret put API_KEY --env=production

# D1データベースの情報を表示
npx wrangler d1 info machipoke-prod

# R2バケットの内容を一覧表示
npx wrangler r2 list machipoke-images
```

### 参考リンク

- [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 ドキュメント](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 ドキュメント](https://developers.cloudflare.com/r2/)
- [Wrangler CLIリファレンス](https://developers.cloudflare.com/workers/wrangler/commands/)
