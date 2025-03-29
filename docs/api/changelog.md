# マチポケ API 変更履歴

このドキュメントでは、マチポケAPIの変更履歴を時系列で記録しています。各リリースの変更内容、追加機能、非推奨化された機能などを確認できます。

## バージョン履歴

## v1.0.0 (2025-03-28) - 初期リリース

マチポケAPIの初期リリースです。MVP（最小実行可能製品）の機能セットを提供します。

### 追加されたもの

#### スキーマ / 型定義

- `User` - ユーザー情報を表す型
- `Spot` - 地元のスポット情報を表す型
- `Category` - スポットのカテゴリを表す型
- `SpotImage` - スポット画像情報を表す型
- `Comment` - スポットへのコメントを表す型
- `SavedList` - ユーザーが保存したスポットのリストを表す型

#### クエリ

- `spot(id: ID!)` - IDによるスポット取得
- `nearbySpots(latitude: Float!, longitude: Float!, radius: Float, limit: Int)` - 位置情報に基づく近隣スポット検索
- `spotsByCategory(categoryId: ID!, limit: Int, offset: Int)` - カテゴリによるスポット検索
- `searchSpots(query: String!, filters: SpotFiltersInput, limit: Int, offset: Int)` - キーワードによるスポット検索
- `categories` - 全カテゴリのリスト取得
- `me` - 現在認証されているユーザー情報の取得

#### ミューテーション

- `createSpot(input: CreateSpotInput!)` - 新規スポット作成
- `updateSpot(id: ID!, input: UpdateSpotInput!)` - スポット情報更新
- `deleteSpot(id: ID!)` - スポット削除
- `uploadSpotImage(spotId: ID!, file: File!, caption: String, isPrimary: Boolean)` - スポット画像アップロード
- `createComment(spotId: ID!, content: String!)` - スポットへのコメント追加
- `updateProfile(input: UpdateProfileInput!)` - ユーザープロフィール更新
- `saveSpot(spotId: ID!, listId: ID)` - スポットをリストに保存
- `removeSavedSpot(spotId: ID!, listId: ID)` - 保存済みスポットの削除

#### 入力型

- `CreateSpotInput` - スポット作成入力データ
- `UpdateSpotInput` - スポット更新入力データ
- `SpotFiltersInput` - スポット検索フィルター
- `UpdateProfileInput` - プロフィール更新入力データ

### 技術的詳細

- GraphQL API (Pothos GraphQL)
- JWT認証
- Cloudflare Workersでのエッジデプロイ
- Cloudflare D1をプライマリデータストアとして使用
- Cloudflare KVをキャッシュとして使用
- Cloudflare R2を画像ストレージとして使用

## v1.0.1 (計画中) - バグ修正と小規模改善

### 修正予定

- パフォーマンス最適化のためのインデックス追加
- エラーメッセージの改善
- N+1問題の解決のためのDataLoaderの最適化

### 追加予定

- クエリパフォーマンスのモニタリング
- レート制限の詳細情報をレスポンスヘッダーに追加

## v1.1.0 (計画中) - 機能拡張

### 追加予定

#### 新しいフィールド

- `Spot.visitCount` - スポットへの訪問カウント
- `User.reputation` - ユーザーの信頼性スコア
- `Spot.location` - 位置情報を構造化したオブジェクト

#### 新しいクエリ

- `popularSpots(limit: Int, offset: Int)` - 人気スポットのリスト取得
- `recommendedSpots(limit: Int)` - ユーザーへのおすすめスポット

#### 新しいミューテーション

- `markVisited(spotId: ID!)` - スポットを訪問済みとしてマーク
- `rateSpot(spotId: ID!, rating: Int!)` - スポットの評価を追加/更新

### 非推奨化予定

- `Spot.latitude` および `Spot.longitude` - `Spot.location` オブジェクトに移行予定（v1.3.0で削除予定）

## v2.0.0 (計画中) - メジャーアップデート

### 追加予定

#### 新機能

- リアルタイムサブスクリプション - 近隣の新規スポット通知、コメント更新など
- 高度なユーザー権限システム - モデレーター機能
- 地域ベースのコンテンツ管理
- AI駆動のコンテンツ推薦

#### 新しいスキーマ型

- `Event` - 地域イベント情報
- `Route` - 複数スポットを含む推奨ルート
- `Badge` - ユーザーの実績バッジ

### 破壊的変更

- 認証システムの刷新 - より強固なセキュリティのための新トークン形式
- 一部のIDタイプの変更 - UUIDからより効率的な形式へ
  
### マイグレーションガイド

各メジャーバージョンのリリース時に、前バージョンからの移行ガイドを提供します。ガイドには以下の内容が含まれます：

- 破壊的変更の詳細な説明
- コード例を含む移行ステップ
- 新機能の活用方法

---

## 変更履歴フォーマット

APIの変更履歴は以下のフォーマットに従って記録されます：

```
## vX.Y.Z (YYYY-MM-DD) - リリース名

### 追加されたもの
- 新しいクエリ、ミューテーション、型、フィールドなど

### 変更されたもの
- 既存機能の変更点

### 非推奨化されたもの
- 非推奨となった機能と、その代替手段

### 修正されたもの
- バグ修正

### 削除されたもの
- 削除された機能（事前に非推奨化されたもの）

### セキュリティ
- セキュリティ関連の修正
```

---

## 注意事項

- 非推奨化されたフィールドは、指定された期間（通常6ヶ月以上）の移行期間を経て削除されます
- バージョン番号は[セマンティックバージョニング](https://semver.org/)に従います
  - メジャーバージョン（X）：破壊的変更を含む場合
  - マイナーバージョン（Y）：後方互換性のある機能追加の場合
  - パッチバージョン（Z）：後方互換性のあるバグ修正の場合
- すべての変更は、リリース前に内部テストと限定的な開発者プレビューを通じて検証されます