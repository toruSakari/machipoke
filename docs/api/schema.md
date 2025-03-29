# マチポケ GraphQL API スキーマ

このドキュメントでは、マチポケアプリケーションのGraphQL APIスキーマの詳細を説明します。スキーマはクエリ、ミューテーション、型定義から構成されています。

## 目次

- [スカラー型](#スカラー型)
- [オブジェクト型](#オブジェクト型)
- [入力型](#入力型)
- [クエリ](#クエリ)
- [ミューテーション](#ミューテーション)
- [列挙型](#列挙型)

## スカラー型

GraphQLの基本的なスカラー型に加えて、マチポケでは以下のカスタムスカラー型を定義しています。

| 型名 | 説明 |
|------|------|
| `ID` | 一意識別子 |
| `String` | UTF-8文字列 |
| `Int` | 符号付き32ビット整数 |
| `Float` | 符号付き倍精度浮動小数点数 |
| `Boolean` | `true`または`false` |
| `DateTime` | ISO 8601形式の日時文字列 (`2023-04-01T12:00:00Z`) |
| `JSON` | JSONオブジェクト |

## オブジェクト型

### User

ユーザー情報を表すオブジェクト型です。

```graphql
type User {
  id: ID!
  email: String!
  name: String!
  avatarUrl: String
  bio: String
  location: String
  expertAreas: String
  trustScore: Int
  spots: [Spot!]
  savedLists: [SavedList!]
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Spot

地元の人だけが知る場所の情報を表すオブジェクト型です。

```graphql
type Spot {
  id: ID!
  name: String!
  description: String
  latitude: Float!
  longitude: Float!
  address: String
  bestSeason: String
  bestTimeOfDay: String
  hiddenGemScore: Int
  specialExperience: String
  category: Category!
  createdBy: User!
  images: [SpotImage!]
  comments: [Comment!]
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### SpotImage

スポットの画像情報を表すオブジェクト型です。

```graphql
type SpotImage {
  id: ID!
  imageUrl: String!
  caption: String
  isPrimary: Boolean!
  createdAt: DateTime!
}
```

### Category

スポットのカテゴリを表すオブジェクト型です。

```graphql
type Category {
  id: ID!
  name: String!
  description: String
  iconName: String
  spots: [Spot!]
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Comment

スポットへのコメントを表すオブジェクト型です。

```graphql
type Comment {
  id: ID!
  content: String!
  user: User!
  spot: Spot!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### SavedList

ユーザーの保存リストを表すオブジェクト型です。

```graphql
type SavedList {
  id: ID!
  name: String!
  description: String
  user: User!
  isPublic: Boolean!
  spots: [Spot!]
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### SavedListItem

保存リスト内の個別のスポットアイテムを表すオブジェクト型です。

```graphql
type SavedListItem {
  id: ID!
  spot: Spot!
  note: String
  visitedAt: DateTime
  isVisited: Boolean!
  createdAt: DateTime!
}
```

### AuthResult

認証オペレーションの結果を表すオブジェクト型です。

```graphql
type AuthResult {
  success: Boolean!
  token: String
  refreshToken: String
  user: User
  error: String
}
```

## 入力型

### CreateSpotInput

スポット作成時の入力データを表す入力型です。

```graphql
input CreateSpotInput {
  name: String!
  description: String
  latitude: Float!
  longitude: Float!
  address: String
  categoryId: ID!
  bestSeason: String
  bestTimeOfDay: String
  hiddenGemScore: Int
  specialExperience: String
}
```

### UpdateSpotInput

スポット更新時の入力データを表す入力型です。

```graphql
input UpdateSpotInput {
  name: String
  description: String
  address: String
  categoryId: ID
  bestSeason: String
  bestTimeOfDay: String
  hiddenGemScore: Int
  specialExperience: String
}
```

### SpotFiltersInput

スポット検索時のフィルター条件を表す入力型です。

```graphql
input SpotFiltersInput {
  categories: [ID!]
  hiddenGemScoreMin: Int
  bestSeason: String
}
```

### CreateUserInput

ユーザー登録時の入力データを表す入力型です。

```graphql
input CreateUserInput {
  email: String!
  password: String!
  name: String!
  avatarUrl: String
  bio: String
  location: String
}
```

### LoginInput

ログイン時の入力データを表す入力型です。

```graphql
input LoginInput {
  email: String!
  password: String!
}
```

### CreateCommentInput

コメント作成時の入力データを表す入力型です。

```graphql
input CreateCommentInput {
  spotId: ID!
  content: String!
}
```

### CreateSavedListInput

保存リスト作成時の入力データを表す入力型です。

```graphql
input CreateSavedListInput {
  name: String!
  description: String
  isPublic: Boolean
}
```

### UpdateSavedListInput

保存リスト更新時の入力データを表す入力型です。

```graphql
input UpdateSavedListInput {
  name: String
  description: String
  isPublic: Boolean
}
```

### AddSpotToSavedListInput

保存リストにスポットを追加する際の入力データを表す入力型です。

```graphql
input AddSpotToSavedListInput {
  listId: ID!
  spotId: ID!
  note: String
  isVisited: Boolean
  visitedAt: DateTime
}
```

## クエリ

マチポケAPIがサポートする主要なクエリ操作です。

```graphql
type Query {
  # ユーザー関連
  me: User
  user(id: ID!): User
  
  # スポット関連
  spot(id: ID!): Spot
  nearbySpots(
    latitude: Float!
    longitude: Float!
    radius: Float = 5
    limit: Int = 20
  ): [Spot!]!
  spotsByCategory(
    categoryId: ID!
    limit: Int = 20
    offset: Int = 0
  ): [Spot!]!
  searchSpots(
    query: String!
    filters: SpotFiltersInput
    limit: Int = 20
    offset: Int = 0
  ): [Spot!]!
  
  # カテゴリ関連
  categories: [Category!]!
  category(id: ID!): Category
  
  # コメント関連
  comments(
    spotId: ID!
    limit: Int = 10
    offset: Int = 0
  ): [Comment!]!
  
  # 保存リスト関連
  savedLists(userId: ID): [SavedList!]!
  savedList(id: ID!): SavedList
}
```

## ミューテーション

マチポケAPIがサポートする主要なミューテーション操作です。

```graphql
type Mutation {
  # 認証関連
  register(input: CreateUserInput!): AuthResult!
  login(input: LoginInput!): AuthResult!
  logout: Boolean!
  refreshToken(refreshToken: String!): AuthResult!
  
  # スポット関連
  createSpot(input: CreateSpotInput!): Spot!
  updateSpot(id: ID!, input: UpdateSpotInput!): Spot!
  deleteSpot(id: ID!): Boolean!
  uploadSpotImage(
    spotId: ID!
    file: File!
    caption: String
    isPrimary: Boolean = false
  ): SpotImage!
  
  # コメント関連
  createComment(input: CreateCommentInput!): Comment!
  updateComment(id: ID!, content: String!): Comment!
  deleteComment(id: ID!): Boolean!
  
  # 保存リスト関連
  createSavedList(input: CreateSavedListInput!): SavedList!
  updateSavedList(id: ID!, input: UpdateSavedListInput!): SavedList!
  deleteSavedList(id: ID!): Boolean!
  addSpotToSavedList(input: AddSpotToSavedListInput!): SavedListItem!
  removeSpotFromSavedList(listId: ID!, spotId: ID!): Boolean!
  
  # ユーザー関連
  updateUserProfile(
    name: String
    bio: String
    location: String
    expertAreas: String
    avatarUrl: String
  ): User!
}
```

## 列挙型

### UserRole

ユーザーのロールを表す列挙型です。

```graphql
enum UserRole {
  USER
  CONTRIBUTOR
  MODERATOR
  ADMIN
}
```

### SpotSortOrder

スポットのソート順を表す列挙型です。

```graphql
enum SpotSortOrder {
  CREATED_DESC
  CREATED_ASC
  HIDDEN_GEM_DESC
  HIDDEN_GEM_ASC
  NAME_ASC
  NAME_DESC
}
```

### Season

スポットのベストシーズンを表す列挙型です。

```graphql
enum Season {
  SPRING
  SUMMER
  AUTUMN
  WINTER
  ALL_YEAR
}
```

## ディレクティブ

マチポケAPIでは以下のディレクティブを使用しています。

| ディレクティブ | 説明 |
|--------------|------|
| `@requireAuth` | 認証が必要なフィールドに適用されます。オプションでロールを指定できます。 |
| `@deprecated` | 非推奨のフィールドに適用されます。代替フィールドの情報を含めることができます。 |

例:

```graphql
type User {
  # 管理者ロールのみアクセス可能
  role: UserRole @requireAuth(roles: ["ADMIN"])
  
  # 非推奨フィールド
  profileImage: String @deprecated(reason: "Use avatarUrl instead")
}
```

## エラー処理

GraphQLエラーは以下の形式で返されます。特定のエラーコードと詳細情報が含まれます。

```json
{
  "errors": [
    {
      "message": "エラーメッセージ",
      "extensions": {
        "code": "ERROR_CODE",
        "http": {
          "status": 400
        }
      }
    }
  ]
}
```

主なエラーコードは以下の通りです：

| コード | 説明 |
|--------|------|
| `UNAUTHENTICATED` | 認証されていない（ログインが必要） |
| `FORBIDDEN` | 権限がない |
| `BAD_USER_INPUT` | 入力データが不正 |
| `NOT_FOUND` | リソースが見つからない |
| `BUSINESS_RULE_VIOLATION` | ビジネスルール違反 |
| `INTERNAL_SERVER_ERROR` | サーバー内部エラー |

詳細なエラー情報については[エラー処理ドキュメント](./error-handling.md)を参照してください。

## スキーマの取得

完全なGraphQLスキーマ定義は、以下のエンドポイントで利用できます：

```
https://api.machipoke.app/graphql
```

また、GraphiQLインターフェースを通じてスキーマを対話的に探索することもできます（開発環境のみ）。

```
http://localhost:8787/graphql
```

## 参考リソース

- [クエリ例](./queries.md)
- [ミューテーション例](./mutations.md)
- [認証](./authentication.md)
- [ページネーション](./pagination.md)
