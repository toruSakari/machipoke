# マチポケ データベーススキーマ

このドキュメントでは、マチポケアプリケーションで使用される Cloudflare D1 データベーススキーマを定義します。

## テーブル構造

### users（ユーザー）

ユーザーアカウントの情報を格納します。

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  home_location TEXT,
  expertise_areas TEXT,
  trust_score REAL DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### profiles（プロフィール情報）

ユーザーのプロフィールに関する追加情報を格納します。

```sql
CREATE TABLE profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  website TEXT,
  social_links JSON,
  preferences JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### categories（カテゴリ）

スポットのカテゴリマスターデータを格納します。

```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id TEXT REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
```

### spots（スポット）

共有された場所の情報を格納します。

```sql
CREATE TABLE spots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  address TEXT,
  hidden_level INTEGER DEFAULT 3,
  best_season TEXT,
  best_time TEXT,
  tips TEXT,
  submitted_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_spots_location ON spots(latitude, longitude);
CREATE INDEX idx_spots_submitted_by ON spots(submitted_by);
```

### spot_categories（スポットとカテゴリの関連付け）

スポットとカテゴリの多対多関係を管理します。

```sql
CREATE TABLE spot_categories (
  spot_id TEXT REFERENCES spots(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (spot_id, category_id)
);

CREATE INDEX idx_spot_categories_spot_id ON spot_categories(spot_id);
CREATE INDEX idx_spot_categories_category_id ON spot_categories(category_id);
```

### spot_photos（スポット写真）

スポットに関連する写真情報を格納します。

```sql
CREATE TABLE spot_photos (
  id TEXT PRIMARY KEY,
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  url TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_spot_photos_spot_id ON spot_photos(spot_id);
```

### comments（コメント）

スポットに対するコメントを格納します。

```sql
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  parent_id TEXT REFERENCES comments(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_spot_id ON comments(spot_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
```

### spot_visits（スポット訪問）

ユーザーのスポット訪問記録を格納します。

```sql
CREATE TABLE spot_visits (
  id TEXT PRIMARY KEY,
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  visit_status TEXT NOT NULL, -- 'visited', 'want_to_visit'
  visited_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(spot_id, user_id)
);

CREATE INDEX idx_spot_visits_spot_id ON spot_visits(spot_id);
CREATE INDEX idx_spot_visits_user_id ON spot_visits(user_id);
```

### saved_lists（保存リスト）

ユーザーのカスタムスポットコレクションを格納します。

```sql
CREATE TABLE saved_lists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_saved_lists_user_id ON saved_lists(user_id);
```

### saved_list_spots（保存リストのスポット）

保存リストとスポットの関連付けを管理します。

```sql
CREATE TABLE saved_list_spots (
  list_id TEXT REFERENCES saved_lists(id) ON DELETE CASCADE,
  spot_id TEXT REFERENCES spots(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  PRIMARY KEY (list_id, spot_id)
);

CREATE INDEX idx_saved_list_spots_list_id ON saved_list_spots(list_id);
CREATE INDEX idx_saved_list_spots_spot_id ON saved_list_spots(spot_id);
```

## リレーションシップ

- ユーザー (1) - (*) スポット（投稿者として）
- ユーザー (1) - (*) コメント
- ユーザー (1) - (*) スポット訪問
- ユーザー (1) - (*) 保存リスト
- スポット (1) - (*) スポット写真
- スポット (1) - (*) コメント
- スポット (*) - (*) カテゴリ
- スポット (*) - (*) 保存リスト
- カテゴリ (1) - (*) サブカテゴリ
- コメント (1) - (*) 返信コメント

## 注意事項

- すべての主キーは UUID または CUID 形式のテキスト値を使用
- Cloudflare D1 の制約に合わせた設計（サポートされている型と機能を考慮）
- インデックスは頻繁に使用されるクエリパターンに基づいて設計
