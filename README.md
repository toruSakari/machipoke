# マチポケ - 地元の人だけが知る場所を共有するプラットフォーム

## サービス概要

「マチポケ」は、地元の人や訪れた人が発見した隠れた名所、穴場スポット、特別な場所を共有するためのプラットフォームです。一般的な観光ガイドやレビューサイトでは見つけられない、本当に価値のある場所の情報を集め、共有することで、旅行者や地域探索者に新しい発見の喜びを提供します。

## ドキュメント構成

詳細な情報は以下のドキュメントを参照してください：

### アーキテクチャ
- [アーキテクチャ概要](/docs/architecture/overview.md) - システム構成と設計原則
- [フロントエンド設計](/docs/architecture/frontend.md) - UI実装の詳細
- [バックエンド設計](/docs/architecture/backend.md) - サーバーサイド実装の詳細
- [API設計](/docs/architecture/api.md) - GraphQL APIの設計と実装
- [認証システム](/docs/architecture/authentication.md) - 認証フローと実装
- [データモデル](/docs/architecture/data-model.md) - 主要なデータ構造
- [ストレージ戦略](/docs/architecture/storage.md) - データストレージの方針

### API
- [API概要](/docs/api/overview.md) - GraphQL APIの基本情報
- [スキーマ定義](/docs/api/schema.md) - APIスキーマの詳細
- [クエリ一覧](/docs/api/queries.md) - 利用可能なクエリ
- [ミューテーション一覧](/docs/api/mutations.md) - 利用可能なミューテーション
- [認証](/docs/api/authentication.md) - API認証の方法
- [ページネーション](/docs/api/pagination.md) - ページネーションの実装
- [エラーハンドリング](/docs/api/error-handling.md) - エラー処理の方法
- [レート制限](/docs/api/rate-limiting.md) - APIレート制限の設定
- [バージョニング](/docs/api/versioning.md) - APIバージョン管理
- [変更履歴](/docs/api/changelog.md) - API変更履歴

### データベース
- [データベース概要](/docs/database/overview.md) - データベース設計と原則
- [ERダイアグラム](/docs/database/er-diagram.md) - エンティティ関連図
- [スキーマ定義](/docs/database/schema.md) - テーブル定義
- [クエリ例](/docs/database/queries.md) - 一般的なクエリ例
- [マイグレーション](/docs/database/migrations.md) - データベースマイグレーション

### 開発ガイド
- [環境セットアップ](/docs/development/setup.md) - 開発環境の構築方法
- [開発ワークフロー](/docs/development/workflow.md) - 開発プロセスの流れ
- [コーディング規約](/docs/development/coding-standards.md) - コード規約
- [バックエンドガイド](/docs/development/backend-guide.md) - バックエンド開発ガイド
- [フロントエンドガイド](/docs/development/frontend-guide.md) - フロントエンド開発ガイド
- [テストガイド](/docs/development/testing.md) - テスト方法

### デプロイメント
- [デプロイガイド](/docs/deployment/deployment-guide.md) - デプロイ手順
- [CI/CD設定](/docs/deployment/ci-cd-guide.md) - 継続的インテグレーション/デリバリー
- [Cloudflare設定](/docs/deployment/cloudflare-setup.md) - Cloudflareの設定方法
- [パフォーマンス最適化](/docs/deployment/performance-optimization.md) - パフォーマンス最適化ガイド
- [バックアップとリカバリー](/docs/deployment/backup-recovery-guide.md) - データバックアップとリカバリー

## MVP（最小実行可能製品）の範囲

初期リリースでは以下の機能に絞り込みます：

1. 基本的なユーザー登録・ログイン
2. スポットの登録（位置情報、説明、写真1枚）
3. 地図ベースでのスポット閲覧
4. シンプルなカテゴリフィルター
5. スポット詳細表示

このMVPを素早くリリースして、ユーザーフィードバックを基に機能を拡張していくアプローチを採用します。

## 開発環境のセットアップ

開発環境のセットアップ手順は[こちら](/docs/development/setup.md)を参照してください。
