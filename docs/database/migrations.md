# マチポケ データベースマイグレーション戦略

このドキュメントでは、マチポケアプリケーションのデータベーススキーマの変更管理（マイグレーション）戦略について説明します。

## マイグレーションの基本原則

1. **バージョン管理**: すべてのスキーマ変更は連番付きのマイグレーションファイルとして管理します
2. **冪等性**: マイグレーションは何度実行しても同じ結果になるよう設計します
3. **前方互換性**: 既存データへの影響を最小限に抑えます
4. **ロールバック対応**: 各マイグレーションに対応するロールバック手順を定義します

## マイグレーションファイルの構成

マイグレーションファイルは以下の命名規則に従います：

```
YYYYMMDD_HHMMSS_description.sql
```

例：`20240330_120000_create_initial_tables.sql`

各マイグレーションファイルは以下の構造を持ちます：

```sql
-- migration: up
-- 上方向マイグレーション（スキーマの変更を適用）
CREATE TABLE ...

-- migration: down
-- 下方向マイグレーション（スキーマの変更を元に戻す）
DROP TABLE ...
```

## Cloudflare D1との統合

Cloudflare D1はワークフロー用のネイティブマイグレーションツールを提供していますが、これを拡張して以下の機能を実装します：

1. **マイグレーション実行ステータスの追跡**:
   ```sql
   CREATE TABLE migrations (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **マイグレーション適用コマンド**:
   ```bash
   wrangler d1 execute <DATABASE_NAME> --file=./migrations/YYYYMMDD_HHMMSS_description.sql
   ```

3. **カスタムマイグレーションスクリプト**:
   Node.jsベースのスクリプトを作成して、マイグレーションの自動適用と検証を行います。

## マイグレーションのワークフロー

1. **新しいマイグレーションの作成**:
   ```bash
   npm run db:migration:create -- --name create_new_table
   ```
   このコマンドは、タイムスタンプ付きの新しいマイグレーションファイルを生成します。

2. **マイグレーションファイルの編集**:
   生成されたファイルに、必要なスキーマ変更とロールバック手順を記述します。

3. **ローカル環境でのテスト**:
   ```bash
   npm run db:migrate
   ```
   このコマンドは、まだ適用されていないすべてのマイグレーションを順番に適用します。

4. **本番環境への適用**:
   ```bash
   npm run db:migrate -- --environment production
   ```
   本番環境のみに適用する場合は、環境フラグを指定します。

5. **ロールバック（必要な場合）**:
   ```bash
   npm run db:rollback
   ```
   このコマンドは、最後に適用されたマイグレーションをロールバックします。

## マイグレーションベストプラクティス

1. **小さな変更に分割**:
   大きなスキーマ変更は、複数の小さなマイグレーションに分割します。

2. **データ損失の回避**:
   カラムの削除や型の変更を行う場合は、一時的な中間状態を作成して、データを保持します。

   例：
   ```sql
   -- 1. 新しいカラムを追加
   ALTER TABLE users ADD COLUMN new_email TEXT;
   
   -- 2. データを移行
   UPDATE users SET new_email = email;
   
   -- 3. 古いカラムを削除
   ALTER TABLE users DROP COLUMN email;
   
   -- 4. 新しいカラムをリネーム
   ALTER TABLE users RENAME COLUMN new_email TO email;
   ```

3. **インデックスの管理**:
   大きなテーブルへのインデックス追加は、パフォーマンスに影響を与える可能性があるため、オフピーク時に行います。

4. **ドキュメント化**:
   各マイグレーションの目的と影響を、コメントとして明確に記述します。

## 初期データの投入

初期データ（シードデータ）は、次の方法で管理します：

1. **シードスクリプトの作成**:
   ```bash
   npm run db:seed:create -- --name basic_categories
   ```

2. **シードデータの適用**:
   ```bash
   npm run db:seed
   ```

シードデータは主に以下のデータに使用します：
- カテゴリのマスターデータ
- システム設定
- テスト用のダミーデータ（開発環境のみ）

## マイグレーション履歴の管理

マイグレーション履歴を確認するコマンド：
```bash
npm run db:migration:status
```

このコマンドは、適用済みのマイグレーションと未適用のマイグレーションのリストを表示します。
