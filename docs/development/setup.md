# マチポケ 開発環境セットアップガイド

このドキュメントでは、マチポケプロジェクトの開発環境のセットアップ方法を説明します。

## 前提条件

以下のツールがインストールされていることを確認してください：

- Node.js (v20以上)
- npm (v10以上) または yarn (v4以上)
- Git
- Cloudflare Wrangler CLI (v3以上)

## リポジトリのクローン

```bash
git clone https://github.com/your-organization/machipoke.git
cd machipoke
```

## 依存関係のインストール

モノレポ全体の依存関係をインストールします：

```bash
# npmを使用する場合
npm install

# yarnを使用する場合
yarn install
```

## 環境変数の設定

1. ルートディレクトリに `.env.example` ファイルをコピーして `.env` ファイルを作成します：

```bash
cp .env.example .env
```

2. `.env` ファイルを編集して、必要な環境変数を設定します：

```
# API設定
API_URL=http://localhost:8787

# 認証設定
AUTH_SECRET=your-auth-secret

# Cloudflare設定
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token

# Mapbox設定
MAPBOX_ACCESS_TOKEN=your-mapbox-access-token
```

## 開発サーバーの起動

### フロントエンド開発サーバー

```bash
# ルートディレクトリから
npm run dev:client

# または clientディレクトリから直接
cd packages/client
npm run dev
```

フロントエンド開発サーバーは通常 `http://localhost:3000` で起動します。

### バックエンド開発サーバー

```bash
# ルートディレクトリから
npm run dev:server

# または serverディレクトリから直接
cd packages/server
npm run dev
```

バックエンド開発サーバーは通常 `http://localhost:8787` で起動します。

## データベースのセットアップ

ローカル開発では、Cloudflare D1のローカル開発モードを使用します：

```bash
cd packages/server
npx wrangler d1 create machipoke-dev
```

マイグレーションを実行するには：

```bash
npx wrangler d1 migrations apply machipoke-dev
```

## ビルドコマンド

プロジェクト全体をビルドするには：

```bash
# ルートディレクトリから
npm run build
```

## テストの実行

```bash
# すべてのテストを実行
npm test

# 特定のパッケージのテストを実行
npm run test:client
npm run test:server
```

## トラブルシューティング

開発環境のセットアップ中に問題が発生した場合は、[GitHub Issues](https://github.com/your-organization/machipoke/issues)を確認するか、新しいIssueを作成してください。

## 次のステップ

環境のセットアップが完了したら、以下のドキュメントを参照して開発を開始してください：

- [開発ワークフロー](./workflow.md)
- [コーディング規約](./coding-standards.md)
- [フロントエンド開発ガイド](./frontend-guide.md)
- [バックエンド開発ガイド](./backend-guide.md)
