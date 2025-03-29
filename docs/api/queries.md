# マチポケ API クエリ操作ガイド

このドキュメントでは、マチポケGraphQL APIで提供されるクエリ操作の詳細と使用例を説明します。各クエリの目的、パラメータ、レスポンス形式、そして実用的な例を提供します。

## 目次

- [ユーザー関連クエリ](#ユーザー関連クエリ)
  - [me - 現在のユーザー情報取得](#me---現在のユーザー情報取得)
  - [user - 特定ユーザーの情報取得](#user---特定ユーザーの情報取得)
- [スポット関連クエリ](#スポット関連クエリ)
  - [spot - 特定スポットの詳細取得](#spot---特定スポットの詳細取得)
  - [nearbySpots - 近隣スポットの検索](#nearbyspots---近隣スポットの検索)
  - [spotsByCategory - カテゴリ別スポット取得](#spotsbycategory---カテゴリ別スポット取得)
  - [searchSpots - キーワードによるスポット検索](#searchspots---キーワードによるスポット検索)
- [カテゴリ関連クエリ](#カテゴリ関連クエリ)
  - [categories - カテゴリ一覧取得](#categories---カテゴリ一覧取得)
  - [category - 特定カテゴリの詳細取得](#category---特定カテゴリの詳細取得)
- [コメント関連クエリ](#コメント関連クエリ)
  - [comments - スポットのコメント取得](#comments---スポットのコメント取得)
- [保存リスト関連クエリ](#保存リスト関連クエリ)
  - [savedLists - 保存リスト一覧取得](#savedlists---保存リスト一覧取得)
  - [savedList - 特定保存リストの詳細取得](#savedlist---特定保存リストの詳細取得)
- [パフォーマンスの最適化](#パフォーマンスの最適化)
- [エラー処理](#エラー処理)

## ユーザー関連クエリ

### me - 現在のユーザー情報取得

認証されたユーザー自身の情報を取得するクエリです。このクエリは認証が必要です。

#### リクエスト例

```graphql
query GetCurrentUser {
  me {
    id
    name
    email
    avatarUrl
    bio
    location
    expertAreas
    trustScore
    createdAt
    updatedAt
  }
}
```

#### レスポンス例

```json
{
  "data": {
    "me": {
      "id": "user_01H2X5JKWQ5T...",
      "name": "山田太郎",
      "email": "user@example.com",
      "avatarUrl": "https://example.com/avatar.jpg",
      "bio": "地元の名所探しが趣味です。",
      "location": "東京都渋谷区",
      "expertAreas": "東京,神奈川",
      "trustScore": 85,
      "createdAt": "2023-01-15T09:30:00Z",
      "updatedAt": "2023-04-20T14:45:00Z"
    }
  }
}
```

#### 注意事項

- 認証されていない場合は `null` が返されます。
- 取得するフィールドは必要に応じて選択できます。

### user - 特定ユーザーの情報取得

IDを指定して特定のユーザー情報を取得するクエリです。

#### リクエスト例

```graphql
query GetUser($userId: ID!) {
  user(id: $userId) {
    id
    name
    avatarUrl
    bio
    location
    expertAreas
    trustScore
    createdAt
  }
}
```

#### 変数例

```json
{
  "userId": "user_01H2X5JKWQ5T..."
}
```

#### レスポンス例

```json
{
  "data": {
    "user": {
      "id": "user_01H2X5JKWQ5T...",
      "name": "山田太郎",
      "avatarUrl": "https://example.com/avatar.jpg",
      "bio": "地元の名所探しが趣味です。",
      "location": "東京都渋谷区",
      "expertAreas": "東京,神奈川",
      "trustScore": 85,
      "createdAt": "2023-01-15T09:30:00Z"
    }
  }
}
```

#### 注意事項

- ユーザーが存在しない場合は `null` が返されます。
- メールアドレスなどの一部の情報は、一般ユーザーには公開されません。

## スポット関連クエリ

### spot - 特定スポットの詳細取得

IDを指定して特定のスポット情報を取得するクエリです。

#### リクエスト例

```graphql
query GetSpot($spotId: ID!) {
  spot(id: $spotId) {
    id
    name
    description
    latitude
    longitude
    address
    bestSeason
    bestTimeOfDay
    hiddenGemScore
    specialExperience
    category {
      id
      name
      iconName
    }
    createdBy {
      id
      name
      avatarUrl
      trustScore
    }
    images {
      id
      imageUrl
      caption
      isPrimary
    }
    comments(limit: 3) {
      id
      content
      user {
        id
        name
        avatarUrl
      }
      createdAt
    }
    createdAt
    updatedAt
  }
}
```

#### 変数例

```json
{
  "spotId": "spot_01H2X7KJ5P7T..."
}
```

#### レスポンス例

```json
{
  "data": {
    "spot": {
      "id": "spot_01H2X7KJ5P7T...",
      "name": "隠れた桜の名所",
      "description": "地元の人だけが知る桜の名所。混雑しておらず、ゆっくり花見ができます。",
      "latitude": 35.712189,
      "longitude": 139.770516,
      "address": "東京都文京区...",
      "bestSeason": "春（3月下旬〜4月上旬）",
      "bestTimeOfDay": "午前中",
      "hiddenGemScore": 4,
      "specialExperience": "早朝に訪れると、朝日に照らされた桜を独り占めできます。",
      "category": {
        "id": "cat_nature",
        "name": "自然",
        "iconName": "tree"
      },
      "createdBy": {
        "id": "user_01H2X5JKWQ5T...",
        "name": "山田太郎",
        "avatarUrl": "https://example.com/avatar.jpg",
        "trustScore": 85
      },
      "images": [
        {
          "id": "img_01H3T9PKL...",
          "imageUrl": "https://cdn.machipoke.app/spots/...",
          "caption": "満開の桜",
          "isPrimary": true
        },
        {
          "id": "img_01H3T9PKM...",
          "imageUrl": "https://cdn.machipoke.app/spots/...",
          "caption": "桜のトンネル",
          "isPrimary": false
        }
      ],
      "comments": [
        {
          "id": "com_01H4R6J...",
          "content": "先週行ってきました。本当に素晴らしい場所です！",
          "user": {
            "id": "user_01H2X5JKWQ5U...",
            "name": "佐藤花子",
            "avatarUrl": "https://example.com/avatars/..."
          },
          "createdAt": "2023-04-02T10:15:00Z"
        }
      ],
      "createdAt": "2023-03-15T08:30:00Z",
      "updatedAt": "2023-03-20T14:45:00Z"
    }
  }
}
```

#### 注意事項

- スポットが存在しない場合は `null` が返されます。
- コメントはデフォルトで最新順に返されます。
- 画像は `isPrimary` フラグの有無、その後は作成日時順にソートされます。

### nearbySpots - 近隣スポットの検索

指定した位置情報を基に、近隣のスポットを検索するクエリです。

#### リクエスト例

```graphql
query GetNearbySpots(
  $latitude: Float!
  $longitude: Float!
  $radius: Float
  $limit: Int
) {
  nearbySpots(
    latitude: $latitude
    longitude: $longitude
    radius: $radius
    limit: $limit
  ) {
    id
    name
    description
    latitude
    longitude
    hiddenGemScore
    category {
      id
      name
      iconName
    }
    images(limit: 1) {
      imageUrl
      isPrimary
    }
    distance # 検索位置からの距離（km）
  }
}
```

#### 変数例

```json
{
  "latitude": 35.6809591,
  "longitude": 139.7673068,
  "radius": 3,
  "limit": 10
}
```

#### レスポンス例

```json
{
  "data": {
    "nearbySpots": [
      {
        "id": "spot_01H2X7KJ5P7T...",
        "name": "隠れた桜の名所",
        "description": "地元の人だけが知る桜の名所。混雑しておらず、ゆっくり花見ができます。",
        "latitude": 35.712189,
        "longitude": 139.770516,
        "hiddenGemScore": 4,
        "category": {
          "id": "cat_nature",
          "name": "自然",
          "iconName": "tree"
        },
        "images": [
          {
            "imageUrl": "https://cdn.machipoke.app/spots/...",
            "isPrimary": true
          }
        ],
        "distance": 1.2
      },
      // 他のスポット...
    ]
  }
}
```

#### パラメータ

| 名前 | 型 | 必須 | デフォルト値 | 説明 |
|-----|-----|-----|------------|------|
| `latitude` | Float | はい | - | 検索の中心となる緯度 |
| `longitude` | Float | はい | - | 検索の中心となる経度 |
| `radius` | Float | いいえ | 5 | 検索半径（km） |
| `limit` | Int | いいえ | 20 | 取得する最大数 |

#### 注意事項

- 近隣のスポットは距離順にソートされます。
- `distance` フィールドにはクエリポイントからの距離（km）が含まれます。
- デフォルトの検索半径は5kmです。
- 検索半径が大きい場合、処理に時間がかかることがあります。

### spotsByCategory - カテゴリ別スポット取得

特定のカテゴリに属するスポットを取得するクエリです。

#### リクエスト例

```graphql
query GetSpotsByCategory(
  $categoryId: ID!
  $limit: Int
  $offset: Int
) {
  spotsByCategory(
    categoryId: $categoryId
    limit: $limit
    offset: $offset
  ) {
    id
    name
    description
    hiddenGemScore
    bestSeason
    images(limit: 1) {
      imageUrl
    }
    createdAt
  }
}
```

#### 変数例

```json
{
  "categoryId": "cat_nature",
  "limit": 10,
  "offset": 0
}
```

#### レスポンス例

```json
{
  "data": {
    "spotsByCategory": [
      {
        "id": "spot_01H2X7KJ5P7T...",
        "name": "隠れた桜の名所",
        "description": "地元の人だけが知る桜の名所。混雑しておらず、ゆっくり花見ができます。",
        "hiddenGemScore": 4,
        "bestSeason": "春（3月下旬〜4月上旬）",
        "images": [
          {
            "imageUrl": "https://cdn.machipoke.app/spots/..."
          }
        ],
        "createdAt": "2023-03-15T08:30:00Z"
      },
      // 他のスポット...
    ]
  }
}
```

#### パラメータ

| 名前 | 型 | 必須 | デフォルト値 | 説明 |
|-----|-----|-----|------------|------|
| `categoryId` | ID | はい | - | カテゴリID |
| `limit` | Int | いいえ | 20 | 取得する最大数 |
| `offset` | Int | いいえ | 0 | スキップする件数（ページネーション用） |

#### 注意事項

- スポットはデフォルトで作成日時の降順（最新順）にソートされます。
- ページネーションには、`limit` と `offset` パラメータを使用します。

### searchSpots - キーワードによるスポット検索

キーワードとフィルター条件によるスポット検索クエリです。

#### リクエスト例

```graphql
query SearchSpots(
  $query: String!
  $filters: SpotFiltersInput
  $limit: Int
  $offset: Int
) {
  searchSpots(
    query: $query
    filters: $filters
    limit: $limit
    offset: $offset
  ) {
    id
    name
    description
    hiddenGemScore
    category {
      id
      name
    }
    images(limit: 1) {
      imageUrl
    }
    createdAt
  }
}
```

#### 変数例

```json
{
  "query": "桜",
  "filters": {
    "categories": ["cat_nature"],
    "hiddenGemScoreMin": 3,
    "bestSeason": "SPRING"
  },
  "limit": 10,
  "offset": 0
}
```

#### レスポンス例

```json
{
  "data": {
    "searchSpots": [
      {
        "id": "spot_01H2X7KJ5P7T...",
        "name": "隠れた桜の名所",
        "description": "地元の人だけが知る桜の名所。混雑しておらず、ゆっくり花見ができます。",
        "hiddenGemScore": 4,
        "category": {
          "id": "cat_nature",
          "name": "自然"
        },
        "images": [
          {
            "imageUrl": "https://cdn.machipoke.app/spots/..."
          }
        ],
        "createdAt": "2023-03-15T08:30:00Z"
      },
      // 他のスポット...
    ]
  }
}
```

#### フィルターオプション

`SpotFiltersInput` は以下のフィルタリングオプションを提供します：

```graphql
input SpotFiltersInput {
  categories: [ID!]        # カテゴリIDのリスト
  hiddenGemScoreMin: Int   # 最小穴場度合い (1-5)
  bestSeason: Season       # 訪問のベストシーズン
}
```

#### パラメータ

| 名前 | 型 | 必須 | デフォルト値 | 説明 |
|-----|-----|-----|------------|------|
| `query` | String | はい | - | 検索キーワード |
| `filters` | SpotFiltersInput | いいえ | null | フィルター条件 |
| `limit` | Int | いいえ | 20 | 取得する最大数 |
| `offset` | Int | いいえ | 0 | スキップする件数（ページネーション用） |

#### 注意事項

- 検索結果は関連性スコアの高い順にソートされます。
- フルテキスト検索では、スポット名と説明文の両方が検索対象となります。
- 複数のキーワードはスペースで区切ることができます（例: "桜 公園"）。

## カテゴリ関連クエリ

### categories - カテゴリ一覧取得

利用可能なカテゴリの一覧を取得するクエリです。

#### リクエスト例

```graphql
query GetCategories {
  categories {
    id
    name
    description
    iconName
  }
}
```

#### レスポンス例

```json
{
  "data": {
    "categories": [
      {
        "id": "cat_nature",
        "name": "自然",
        "description": "公園、庭園、山、海などの自然スポット",
        "iconName": "tree"
      },
      {
        "id": "cat_food",
        "name": "グルメ",
        "description": "レストラン、カフェ、屋台など",
        "iconName": "restaurant"
      },
      {
        "id": "cat_culture",
        "name": "文化",
        "description": "美術館、博物館、寺社仏閣など",
        "iconName": "museum"
      },
      // 他のカテゴリ...
    ]
  }
}
```

#### 注意事項

- カテゴリーはアプリケーション全体で共通のため、この結果はキャッシュすることが推奨されます。
- カテゴリは通常、管理者のみが追加・変更可能です。

### category - 特定カテゴリの詳細取得

IDを指定して特定のカテゴリ情報を取得するクエリです。

#### リクエスト例

```graphql
query GetCategory($categoryId: ID!) {
  category(id: $categoryId) {
    id
    name
    description
    iconName
    spots(limit: 5) {
      id
      name
      images(limit: 1) {
        imageUrl
      }
    }
  }
}
```

#### 変数例

```json
{
  "categoryId": "cat_nature"
}
```

#### レスポンス例

```json
{
  "data": {
    "category": {
      "id": "cat_nature",
      "name": "自然",
      "description": "公園、庭園、山、海などの自然スポット",
      "iconName": "tree",
      "spots": [
        {
          "id": "spot_01H2X7KJ5P7T...",
          "name": "隠れた桜の名所",
          "images": [
            {
              "imageUrl": "https://cdn.machipoke.app/spots/..."
            }
          ]
        },
        // 他のスポット...
      ]
    }
  }
}
```

## コメント関連クエリ

### comments - スポットのコメント取得

特定のスポットに対するコメントを取得するクエリです。

#### リクエスト例

```graphql
query GetSpotComments(
  $spotId: ID!
  $limit: Int
  $offset: Int
) {
  comments(
    spotId: $spotId
    limit: $limit
    offset: $offset
  ) {
    id
    content
    user {
      id
      name
      avatarUrl
    }
    createdAt
    updatedAt
  }
}
```

#### 変数例

```json
{
  "spotId": "spot_01H2X7KJ5P7T...",
  "limit": 10,
  "offset": 0
}
```

#### レスポンス例

```json
{
  "data": {
    "comments": [
      {
        "id": "com_01H4R6J...",
        "content": "先週行ってきました。本当に素晴らしい場所です！",
        "user": {
          "id": "user_01H2X5JKWQ5U...",
          "name": "佐藤花子",
          "avatarUrl": "https://example.com/avatars/..."
        },
        "createdAt": "2023-04-02T10:15:00Z",
        "updatedAt": "2023-04-02T10:15:00Z"
      },
      // 他のコメント...
    ]
  }
}
```

#### パラメータ

| 名前 | 型 | 必須 | デフォルト値 | 説明 |
|-----|-----|-----|------------|------|
| `spotId` | ID | はい | - | スポットID |
| `limit` | Int | いいえ | 10 | 取得する最大数 |
| `offset` | Int | いいえ | 0 | スキップする件数（ページネーション用） |

#### 注意事項

- コメントはデフォルトで作成日時の降順（最新順）にソートされます。
- ページネーションには、`limit` と `offset` パラメータを使用します。

## 保存リスト関連クエリ

### savedLists - 保存リスト一覧取得

ユーザーの保存リスト一覧を取得するクエリです。

#### リクエスト例

```graphql
query GetSavedLists($userId: ID) {
  savedLists(userId: $userId) {
    id
    name
    description
    isPublic
    user {
      id
      name
    }
    spots(limit: 3) {
      id
      name
      images(limit: 1) {
        imageUrl
      }
    }
    createdAt
    updatedAt
  }
}
```

#### 変数例

```json
{
  "userId": "user_01H2X5JKWQ5T..."  // 省略すると現在の認証ユーザーのリストを取得
}
```

#### レスポンス例

```json
{
  "data": {
    "savedLists": [
      {
        "id": "list_01H5P8...",
        "name": "行きたい場所",
        "description": "いつか訪れたい穴場スポット",
        "isPublic": true,
        "user": {
          "id": "user_01H2X5JKWQ5T...",
          "name": "山田太郎"
        },
        "spots": [
          {
            "id": "spot_01H2X7KJ5P7T...",
            "name": "隠れた桜の名所",
            "images": [
              {
                "imageUrl": "https://cdn.machipoke.app/spots/..."
              }
            ]
          },
          // 他のスポット...
        ],
        "createdAt": "2023-03-01T12:30:00Z",
        "updatedAt": "2023-04-15T09:45:00Z"
      },
      // 他のリスト...
    ]
  }
}
```

#### パラメータ

| 名前 | 型 | 必須 | デフォルト値 | 説明 |
|-----|-----|-----|------------|------|
| `userId` | ID | いいえ | null | ユーザーID（省略すると現在の認証ユーザー） |

#### 注意事項

- `userId` を指定しない場合は、現在認証されているユーザーの保存リストが返されます。
- 他のユーザーのリストを取得する場合、非公開リストは含まれません。
- 認証されていないユーザーは、公開リストのみ閲覧できます。

### savedList - 特定保存リストの詳細取得

IDを指定して特定の保存リストの詳細を取得するクエリです。

#### リクエスト例

```graphql
query GetSavedList($listId: ID!) {
  savedList(id: $listId) {
    id
    name
    description
    isPublic
    user {
      id
      name
      avatarUrl
    }
    spots {
      id
      name
      description
      hiddenGemScore
      category {
        name
        iconName
      }
      images(limit: 1) {
        imageUrl
      }
      savedListItem {
        note
        visitedAt
        isVisited
      }
    }
    createdAt
    updatedAt
  }
}
```

#### 変数例

```json
{
  "listId": "list_01H5P8..."
}
```

#### レスポンス例

```json
{
  "data": {
    "savedList": {
      "id": "list_01H5P8...",
      "name": "行きたい場所",
      "description": "いつか訪れたい穴場スポット",
      "isPublic": true,
      "user": {
        "id": "user_01H2X5JKWQ5T...",
        "name": "山田太郎",
        "avatarUrl": "https://example.com/avatar.jpg"
      },
      "spots": [
        {
          "id": "spot_01H2X7KJ5P7T...",
          "name": "隠れた桜の名所",
          "description": "地元の人だけが知る桜の名所。混雑しておらず、ゆっくり花見ができます。",
          "hiddenGemScore": 4,
          "category": {
            "name": "自然",
            "iconName": "tree"
          },
          "images": [
            {
              "imageUrl": "https://cdn.machipoke.app/spots/..."
            }
          ],
          "savedListItem": {
            "note": "次の春に訪れたい",
            "visitedAt": null,
            "isVisited": false
          }
        },
        // 他のスポット...
      ],
      "createdAt": "2023-03-01T12:30:00Z",
      "updatedAt": "2023-04-15T09:45:00Z"
    }
  }
}
```

#### 注意事項

- 非公開のリストは、リストの所有者または管理者のみがアクセスできます。
- `savedListItem` フィールドには、そのリスト特有のスポット情報（メモ、訪問日時、訪問済みフラグなど）が含まれます。

## パフォーマンスの最適化

GraphQLの柔軟性を活かして、パフォーマンスを最適化するためのポイントを以下に示します：

1. **必要なフィールドのみを要求する**

   クエリで必要なフィールドのみを指定することで、データ転送量とサーバー負荷を減らします。

   ```graphql
   # 良い例：必要なフィールドのみを指定
   query {
     nearbySpots(latitude: 35.6809591, longitude: 139.7673068) {
       id
       name
       images(limit: 1) {
         imageUrl
       }
     }
   }
   ```

2. **ネストされたリレーションを制限する**

   深いネストでデータを取得する際は、`limit` パラメータを活用して取得数を制限します。

   ```graphql
   # 良い例：リレーションの取得数を制限
   query {
     spot(id: "spot_01H2X7KJ5P7T...") {
       name
       comments(limit: 5) {  # コメントは最初の5件のみ
         content
       }
       images(limit: 3) {    # 画像は最初の3枚のみ
         imageUrl
       }
     }
   }
   ```

3. **複数のリクエストをバッチ処理する**

   関連する複数のクエリを単一のリクエストにまとめることで、ネットワークオーバーヘッドを削減します。

   ```graphql
   # 良い例：複数のデータを一度に取得
   query {
     spot(id: "spot_01H2X7KJ5P7T...") {
       name
       description
     }
     categories {
       id
       name
     }
     nearbySpots(latitude: 35.6809591, longitude: 139.7673068, limit: 3) {
       name
     }
   }
   ```

## エラー処理

クエリ実行時に発生する可能性のある主なエラーは以下の通りです：

### 一般的なエラーコード

| エラーコード | 説明 | 対処法 |
|------------|------|-------|
| `UNAUTHENTICATED` | 認証が必要です | ユーザーをログインページにリダイレクト |
| `FORBIDDEN` | アクセス権限がありません | 適切な権限を持つユーザーでログインするよう促す |
| `NOT_FOUND` | リソースが見つかりません | ID指定の誤りがないか確認 |
| `BAD_USER_INPUT` | 入力パラメータが不正です | エラーメッセージに従って入力を修正 |
| `QUERY_COMPLEXITY_EXCEEDED` | クエリの複雑度が高すぎます | クエリをシンプルにするか、複数のリクエストに分割 |
| `RATE_LIMITED` | リクエスト制限を超えました | 一定時間後に再試行 |
| `INTERNAL_SERVER_ERROR` | サーバー内部エラー | サポートに連絡し、後ほど再試行 |

### エラーレスポンスの形式

エラーが発生した場合、GraphQLは以下の形式でエラーを返します：

```json
{
  "errors": [
    {
      "message": "リソースが見つかりません",
      "extensions": {
        "code": "NOT_FOUND",
        "http": {
          "status": 404
        }
      }
    }
  ]
}
```

### エラーハンドリングの例

クライアントサイドでのエラーハンドリングの例です：

```typescript
// Apollo Clientでのエラーハンドリング
const { loading, error, data } = useQuery(GET_SPOT, {
  variables: { spotId },
  onError: (error) => {
    // エラーコードによる処理分岐
    const code = error.graphQLErrors?.[0]?.extensions?.code;
    
    switch (code) {
      case 'NOT_FOUND':
        showNotification('スポットが見つかりませんでした');
        break;
      case 'UNAUTHENTICATED':
        redirectToLogin();
        break;
      default:
        showNotification('エラーが発生しました。時間をおいて再試行してください');
    }
  }
});
```

### トラブルシューティング

一般的なエラーに対するトラブルシューティングのヒントです：

1. **認証エラー（UNAUTHENTICATED）**
   - トークンの有効期限が切れていないか確認
   - リフレッシュトークンを使用してトークンを更新

2. **入力エラー（BAD_USER_INPUT）**
   - 必須フィールドがすべて含まれているか確認
   - IDの形式が正しいか確認
   - 位置情報の値が有効な範囲内か確認

3. **レート制限エラー（RATE_LIMITED）**
   - リクエストの送信頻度を下げる
   - キャッシュを活用して重複リクエストを減らす

詳細なエラー処理については[エラー処理ドキュメント](./error-handling.md)を参照してください。