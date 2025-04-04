# マチポケ データベース概要

## 使用技術

マチポケでは以下のデータベース技術を使用します：

- **Cloudflare D1**: SQLiteベースのサーバーレスSQL データベース。主要なリレーショナルデータの保存に使用。
- **Cloudflare KV**: キーバリューストアで、主にキャッシュやセッションデータの保存に使用。
- **Cloudflare R2**: オブジェクトストレージで、ユーザーがアップロードした写真などのバイナリデータの保存に使用。

## データモデルの概要

マチポケのデータモデルは以下の主要エンティティで構成されています。詳細な定義は[アーキテクチャドキュメントのデータモデル](/docs/architecture/data-model.md)を参照してください。

1. **ユーザー (Users)**: アプリケーションのユーザーアカウント情報
2. **スポット (Spots)**: 共有される場所の情報
3. **カテゴリ (Categories)**: スポットの分類
4. **コメント (Comments)**: スポットに対するユーザーコメント
5. **保存リスト (SavedLists)**: ユーザーのカスタムスポットコレクション

## データアクセスパターン

主要なデータアクセスパターンは以下の通りです：

1. **地理的検索**: 
   - 特定の地理的範囲内のスポットを検索
   - 現在地周辺のスポットを検索

2. **カテゴリベース検索**:
   - 特定のカテゴリに属するスポットを検索
   - 複数のカテゴリフィルタの組み合わせ

3. **ユーザー関連データアクセス**:
   - ユーザーが投稿したスポット一覧
   - ユーザーの保存リスト
   - ユーザーが訪問/訪問したいスポット

4. **スポット詳細表示**:
   - スポットの基本情報と写真
   - 関連コメントと返信
   - 関連する近隣スポット

## パフォーマンス考慮事項

1. **インデックス設計**:
   - 位置情報検索のための地理的インデックス
   - よく使用されるフィルターに対するインデックス
   - 複合インデックスの活用

2. **キャッシング戦略**:
   - 頻繁にアクセスされるデータ（人気スポット、カテゴリリストなど）のKVキャッシュ
   - リクエストレベルのキャッシング

3. **クエリ最適化**:
   - N+1問題の回避
   - 複雑なクエリのストアドプロシージャ化（D1の制約内で）

## 関連ドキュメント

- [データベースER図](/docs/database/er-diagram.md)
- [スキーマ定義](/docs/database/schema.md)
- [マイグレーション](/docs/database/migrations.md)
- [データベースクエリ例](/docs/database/queries.md)
