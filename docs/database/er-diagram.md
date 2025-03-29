# マチポケ ER図（エンティティ関連図）

このドキュメントでは、マチポケアプリケーションのデータベースモデルのエンティティ関連図（ER図）を提供します。

## ER図

以下は、マチポケのデータベースモデルを表すER図です。この図は [Mermaid](https://mermaid-js.github.io/) 記法で記述されています。

```mermaid
erDiagram
    USERS ||--o{ PROFILES : has
    USERS ||--o{ SPOTS : submits
    USERS ||--o{ COMMENTS : writes
    USERS ||--o{ SPOT_VISITS : records
    USERS ||--o{ SAVED_LISTS : creates
    USERS ||--o{ SPOT_PHOTOS : uploads
    
    SPOTS ||--o{ SPOT_PHOTOS : contains
    SPOTS ||--o{ COMMENTS : receives
    SPOTS ||--o{ SPOT_VISITS : tracked_in
    SPOTS }o--o{ CATEGORIES : categorized_by
    SPOTS }o--o{ SAVED_LISTS : included_in
    
    CATEGORIES ||--o{ CATEGORIES : has_subcategory
    
    COMMENTS ||--o{ COMMENTS : replies_to
    
    SAVED_LISTS ||--o{ SAVED_LIST_SPOTS : contains
    SPOTS ||--o{ SAVED_LIST_SPOTS : belongs_to
    
    SPOT_CATEGORIES }o--|| SPOTS : belongs_to
    SPOT_CATEGORIES }o--|| CATEGORIES : belongs_to
    
    USERS {
        string id PK
        string email
        string display_name
        string avatar_url
        string home_location
        string expertise_areas
        float trust_score
        timestamp created_at
        timestamp updated_at
    }
    
    PROFILES {
        string user_id PK,FK
        string bio
        string website
        json social_links
        json preferences
        timestamp created_at
        timestamp updated_at
    }
    
    SPOTS {
        string id PK
        string name
        string description
        float latitude
        float longitude
        string address
        integer hidden_level
        string best_season
        string best_time
        string tips
        string submitted_by FK
        timestamp created_at
        timestamp updated_at
    }
    
    CATEGORIES {
        string id PK
        string name
        string description
        string icon
        string parent_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    SPOT_CATEGORIES {
        string spot_id PK,FK
        string category_id PK,FK
    }
    
    SPOT_PHOTOS {
        string id PK
        string spot_id FK
        string user_id FK
        string url
        string r2_key
        string caption
        boolean is_primary
        timestamp created_at
    }
    
    COMMENTS {
        string id PK
        string spot_id FK
        string user_id FK
        string content
        string parent_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    SPOT_VISITS {
        string id PK
        string spot_id FK
        string user_id FK
        string visit_status
        timestamp visited_at
        string notes
        timestamp created_at
        timestamp updated_at
    }
    
    SAVED_LISTS {
        string id PK
        string user_id FK
        string name
        string description
        boolean is_public
        timestamp created_at
        timestamp updated_at
    }
    
    SAVED_LIST_SPOTS {
        string list_id PK,FK
        string spot_id PK,FK
        timestamp added_at
        string notes
    }
```

## エンティティの説明

### ユーザー関連エンティティ

1. **USERS**
   - アプリケーションのユーザーアカウント情報を格納
   - 主要属性: ID、メールアドレス、表示名、信頼性スコア

2. **PROFILES**
   - ユーザーの詳細なプロフィール情報を格納
   - USERSとの1対1の関係

### コンテンツ関連エンティティ

3. **SPOTS**
   - 共有された場所の基本情報を格納
   - 位置情報（緯度・経度）、説明、特徴などを含む

4. **CATEGORIES**
   - スポットのカテゴリ情報を格納
   - 自己参照関係により階層構造（親-子カテゴリ）をサポート

5. **SPOT_PHOTOS**
   - スポットに関連付けられた写真情報を格納
   - 実際の画像データはR2ストレージに保存され、参照キーを保持

6. **COMMENTS**
   - スポットに対するコメントを格納
   - 自己参照関係によりネスト構造（返信）をサポート

### ユーザーアクション関連エンティティ

7. **SPOT_VISITS**
   - ユーザーによるスポットの訪問履歴または「行きたい」マークを管理
   - ユーザーとスポットの関係を追跡

8. **SAVED_LISTS**
   - ユーザーが作成したスポットのコレクション
   - プライベートまたは公開設定が可能

### 関連テーブル（中間テーブル）

9. **SPOT_CATEGORIES**
   - スポットとカテゴリ間の多対多関係を管理
   - 複合主キーを使用

10. **SAVED_LIST_SPOTS**
    - 保存リストとスポット間の多対多関係を管理
    - 追加日時やメモなどの属性を持つ

## 主要なリレーションシップ

1. **ユーザーとコンテンツの関係**:
   - ユーザーはスポットを投稿する (1対多)
   - ユーザーは写真をアップロードする (1対多)
   - ユーザーはコメントを書く (1対多)

2. **コンテンツ間の関係**:
   - スポットは複数のカテゴリに属する (多対多)
   - スポットは複数の写真を持つ (1対多)
   - スポットは複数のコメントを受け取る (1対多)
   - コメントは階層構造を持つ (自己参照)

3. **ユーザーアクション**:
   - ユーザーはスポットを訪問/訪問希望としてマークする (多対多)
   - ユーザーは保存リストを作成し、スポットを追加する (多対多)

## 設計上の特記事項

1. **複合主キーと外部キー**:
   - 中間テーブル（SPOT_CATEGORIES, SAVED_LIST_SPOTS）は複合主キーを使用
   - 参照整合性を維持するために外部キー制約を適用

2. **自己参照関係**:
   - CATEGORIES: 親子関係を表現するための自己参照
   - COMMENTS: ネストされたコメントのための自己参照

3. **地理情報データ**:
   - SPOTSテーブルは位置情報（緯度・経度）を格納
   - 地理的検索を高速化するためのインデックスを適用

4. **タイムスタンプフィールド**:
   - ほとんどのテーブルは作成日時と更新日時を追跡
   - 変更履歴とデータの鮮度を管理

## 注意事項

- このER図は論理データモデルを表現しており、実装時の物理的な制約やパフォーマンスの考慮事項によって、実際のスキーマは若干異なる場合があります。
- Cloudflare D1の制約により、特定のSQLite機能や拡張機能が使用できない場合があります。
