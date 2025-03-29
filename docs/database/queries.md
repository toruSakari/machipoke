# マチポケ 一般的なクエリサンプル

このドキュメントでは、マチポケアプリケーションで頻繁に使用されるSQLクエリのサンプルを提供します。これらのクエリは、開発者がデータアクセスパターンを理解し、効率的なコードを書くための参考として使用できます。

## ユーザー関連クエリ

### ユーザー情報の取得（プロフィール情報を含む）

```sql
SELECT 
  u.*,
  p.bio,
  p.website,
  p.social_links,
  p.preferences
FROM 
  users u
LEFT JOIN 
  profiles p ON u.id = p.user_id
WHERE 
  u.id = ?;
```

### ユーザーが投稿したスポット一覧

```sql
SELECT 
  s.*,
  (SELECT url FROM spot_photos WHERE spot_id = s.id AND is_primary = true LIMIT 1) as primary_photo_url,
  COUNT(DISTINCT c.id) as comment_count,
  COUNT(DISTINCT sv.id) as visit_count
FROM 
  spots s
LEFT JOIN 
  comments c ON s.id = c.spot_id
LEFT JOIN 
  spot_visits sv ON s.id = sv.spot_id AND sv.visit_status = 'visited'
WHERE 
  s.submitted_by = ?
GROUP BY 
  s.id
ORDER BY 
  s.created_at DESC;
```

### ユーザーの信頼性スコア更新

```sql
UPDATE users
SET 
  trust_score = (
    SELECT 
      (COUNT(DISTINCT s.id) * 10 + 
       COUNT(DISTINCT c.id) * 2 + 
       COUNT(DISTINCT sp.id) * 3) / 10.0
    FROM 
      users u
    LEFT JOIN 
      spots s ON u.id = s.submitted_by
    LEFT JOIN 
      comments c ON u.id = c.user_id
    LEFT JOIN 
      spot_photos sp ON u.id = sp.user_id
    WHERE 
      u.id = ?
  ),
  updated_at = CURRENT_TIMESTAMP
WHERE 
  id = ?;
```

## スポット関連クエリ

### 地理的範囲内のスポット検索

```sql
SELECT 
  s.*,
  GROUP_CONCAT(DISTINCT c.name) as categories,
  COUNT(DISTINCT com.id) as comment_count,
  COUNT(DISTINCT sp.id) as photo_count
FROM 
  spots s
LEFT JOIN 
  spot_categories sc ON s.id = sc.spot_id
LEFT JOIN 
  categories c ON sc.category_id = c.id
LEFT JOIN 
  comments com ON s.id = com.spot_id
LEFT JOIN 
  spot_photos sp ON s.id = sp.spot_id
WHERE 
  s.latitude BETWEEN ? AND ? 
  AND s.longitude BETWEEN ? AND ?
  AND (? IS NULL OR sc.category_id = ?)
GROUP BY 
  s.id
ORDER BY 
  s.hidden_level ASC, 
  (SELECT COUNT(*) FROM spot_visits WHERE spot_id = s.id AND visit_status = 'visited') DESC;
```

### スポット詳細（関連情報を含む）

```sql
-- スポット基本情報
SELECT * FROM spots WHERE id = ?;

-- スポットのカテゴリ
SELECT 
  c.* 
FROM 
  categories c
JOIN 
  spot_categories sc ON c.id = sc.category_id
WHERE 
  sc.spot_id = ?;

-- スポットの写真
SELECT * FROM spot_photos WHERE spot_id = ? ORDER BY is_primary DESC, created_at DESC;

-- スポットのコメント（ネスト構造）
WITH RECURSIVE comments_tree AS (
  SELECT 
    c.*, 
    0 as level, 
    c.id as root_id,
    u.display_name,
    u.avatar_url
  FROM 
    comments c
  JOIN 
    users u ON c.user_id = u.id
  WHERE 
    c.spot_id = ? 
    AND c.parent_id IS NULL
  
  UNION ALL
  
  SELECT 
    c.*, 
    ct.level + 1, 
    ct.root_id,
    u.display_name,
    u.avatar_url
  FROM 
    comments c
  JOIN 
    comments_tree ct ON c.parent_id = ct.id
  JOIN 
    users u ON c.user_id = u.id
)
SELECT * FROM comments_tree ORDER BY root_id, level, created_at;

-- 近隣スポット
SELECT 
  s.*,
  (SELECT url FROM spot_photos WHERE spot_id = s.id AND is_primary = true LIMIT 1) as primary_photo_url,
  (6371 * acos(cos(radians(?)) * cos(radians(s.latitude)) * cos(radians(s.longitude) - radians(?)) + sin(radians(?)) * sin(radians(s.latitude)))) AS distance
FROM 
  spots s
WHERE 
  s.id != ?
ORDER BY 
  distance
LIMIT 5;
```

### カテゴリ別スポット検索

```sql
SELECT 
  s.*,
  (SELECT url FROM spot_photos WHERE spot_id = s.id AND is_primary = true LIMIT 1) as primary_photo_url
FROM 
  spots s
JOIN 
  spot_categories sc ON s.id = sc.spot_id
WHERE 
  sc.category_id = ?
  OR sc.category_id IN (SELECT id FROM categories WHERE parent_id = ?)
ORDER BY 
  s.created_at DESC;
```

## 保存リスト関連クエリ

### ユーザーの保存リスト一覧

```sql
SELECT 
  sl.*,
  COUNT(DISTINCT sls.spot_id) as spot_count,
  (
    SELECT 
      url 
    FROM 
      spot_photos sp
    JOIN 
      saved_list_spots sls2 ON sp.spot_id = sls2.spot_id
    WHERE 
      sls2.list_id = sl.id AND sp.is_primary = true
    LIMIT 1
  ) as cover_photo_url
FROM 
  saved_lists sl
LEFT JOIN 
  saved_list_spots sls ON sl.id = sls.list_id
WHERE 
  sl.user_id = ?
GROUP BY 
  sl.id
ORDER BY 
  sl.updated_at DESC;
```

### 保存リスト内のスポット一覧

```sql
SELECT 
  s.*,
  sls.added_at,
  sls.notes,
  (SELECT url FROM spot_photos WHERE spot_id = s.id AND is_primary = true LIMIT 1) as primary_photo_url
FROM 
  saved_list_spots sls
JOIN 
  spots s ON sls.spot_id = s.id
WHERE 
  sls.list_id = ?
ORDER BY 
  sls.added_at DESC;
```

## 統計・分析クエリ

### カテゴリ別スポット数

```sql
SELECT 
  c.id,
  c.name,
  COUNT(DISTINCT sc.spot_id) as spot_count
FROM 
  categories c
LEFT JOIN 
  spot_categories sc ON c.id = sc.category_id
GROUP BY 
  c.id
ORDER BY 
  spot_count DESC;
```

### 最もアクティブなユーザートップ10

```sql
SELECT 
  u.id,
  u.display_name,
  u.avatar_url,
  COUNT(DISTINCT s.id) as spot_count,
  COUNT(DISTINCT c.id) as comment_count,
  COUNT(DISTINCT sp.id) as photo_count,
  u.trust_score
FROM 
  users u
LEFT JOIN 
  spots s ON u.id = s.submitted_by
LEFT JOIN 
  comments c ON u.id = c.user_id
LEFT JOIN 
  spot_photos sp ON u.id = sp.user_id
GROUP BY 
  u.id
ORDER BY 
  (spot_count + comment_count + photo_count) DESC
LIMIT 10;
```

### エリア別人気スポット

```sql
SELECT 
  ROUND(latitude, 2) as lat_group,
  ROUND(longitude, 2) as lng_group,
  COUNT(*) as spot_count,
  AVG(
    SELECT COUNT(*) FROM spot_visits WHERE spot_id = spots.id AND visit_status = 'visited'
  ) as avg_visits
FROM 
  spots
GROUP BY 
  lat_group, lng_group
HAVING 
  spot_count > 1
ORDER BY 
  avg_visits DESC;
```

## データメンテナンスクエリ

### 未使用カテゴリの特定

```sql
SELECT 
  c.id,
  c.name
FROM 
  categories c
LEFT JOIN 
  spot_categories sc ON c.id = sc.category_id
WHERE 
  sc.category_id IS NULL;
```

### 古い（更新されていない）スポットの特定

```sql
SELECT 
  s.id,
  s.name,
  s.updated_at,
  u.email as submitter_email
FROM 
  spots s
JOIN 
  users u ON s.submitted_by = u.id
WHERE 
  s.updated_at < DATE('now', '-1 year')
  AND (
    SELECT MAX(created_at) FROM comments WHERE spot_id = s.id
  ) < DATE('now', '-6 months');
```

### 重複スポット候補の検出

```sql
SELECT 
  s1.id as spot1_id,
  s1.name as spot1_name,
  s2.id as spot2_id,
  s2.name as spot2_name,
  (6371 * acos(cos(radians(s1.latitude)) * cos(radians(s2.latitude)) * cos(radians(s2.longitude) - radians(s1.longitude)) + sin(radians(s1.latitude)) * sin(radians(s2.latitude)))) AS distance
FROM 
  spots s1
JOIN 
  spots s2 ON s1.id < s2.id
WHERE 
  (6371 * acos(cos(radians(s1.latitude)) * cos(radians(s2.latitude)) * cos(radians(s2.longitude) - radians(s1.longitude)) + sin(radians(s1.latitude)) * sin(radians(s2.latitude)))) < 0.05
ORDER BY 
  distance;
```

## クエリ使用上の注意

1. **パラメータ化**:
   - すべてのクエリは、SQLインジェクション攻撃を防ぐために、パラメータ化して使用してください。
   - サンプルでは `?` プレースホルダーを使用していますが、実際の実装ではORM（Drizzle）の機能を使用してください。

2. **インデックスの活用**:
   - WHERE句やJOIN条件で使用されるカラムにはインデックスが作成されていることを確認してください。
   - 特に位置情報検索やID検索は頻繁に使用されるため、適切なインデックスが重要です。

3. **ページネーション**:
   - 大量のデータを返す可能性のあるクエリには、常にLIMITとOFFSETを使用してページネーションを実装してください。

4. **N+1問題の回避**:
   - 関連データを取得する際は、個別のクエリを繰り返し実行するのではなく、JOINやサブクエリを使用してください。

5. **Cloudflare D1の制約**:
   - D1はSQLiteベースであるため、一部の高度なSQLite機能や空間関数が制限される場合があります。
   - 複雑な空間計算は、必要に応じてアプリケーションレベルで実装してください。
