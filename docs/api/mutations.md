# マチポケ API ミューテーション操作ガイド

このドキュメントでは、マチポケGraphQL APIで提供されるミューテーション操作の詳細と使用例を説明します。ミューテーションはデータの作成、更新、削除などの変更操作を行うためのものです。

## 目次

- [認証関連ミューテーション](#認証関連ミューテーション)
  - [register - ユーザー登録](#register---ユーザー登録)
  - [login - ログイン](#login---ログイン)
  - [logout - ログアウト](#logout---ログアウト)
  - [refreshToken - トークン更新](#refreshtoken---トークン更新)
- [スポット関連ミューテーション](#スポット関連ミューテーション)
  - [createSpot - スポット作成](#createspot---スポット作成)
  - [updateSpot - スポット更新](#updatespot---スポット更新)
  - [deleteSpot - スポット削除](#deletespot---スポット削除)
  - [uploadSpotImage - スポット画像アップロード](#uploadspotimage---スポット画像アップロード)
- [コメント関連ミューテーション](#コメント関連ミューテーション)
  - [createComment - コメント作成](#createcomment---コメント作成)
  - [updateComment - コメント更新](#updatecomment---コメント更新)
  - [deleteComment - コメント削除](#deletecomment---コメント削除)
- [保存リスト関連ミューテーション](#保存リスト関連ミューテーション)
  - [createSavedList - 保存リスト作成](#createsavedlist---保存リスト作成)
  - [updateSavedList - 保存リスト更新](#updatesavedlist---保存リスト更新)
  - [deleteSavedList - 保存リスト削除](#deletesavedlist---保存リスト削除)
  - [addSpotToSavedList - リストにスポット追加](#addspojtosavedlist---リストにスポット追加)
  - [removeSpotFromSavedList - リストからスポット削除](#removespotfromsavedlist---リストからスポット削除)
- [ユーザープロフィール関連ミューテーション](#ユーザープロフィール関連ミューテーション)
  - [updateUserProfile - プロフィール更新](#updateuserprofile---プロフィール更新)
- [エラー処理](#エラー処理)
- [ベストプラクティス](#ベストプラクティス)

## 認証関連ミューテーション

### register - ユーザー登録

新規ユーザーアカウントを登録するミューテーションです。

#### リクエスト例

```graphql
mutation Register($input: CreateUserInput!) {
  register(input: $input) {
    success
    token
    refreshToken
    user {
      id
      name
      email
    }
    error
  }
}
```

#### 変数例

```json
{
  "input": {
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "山田太郎",
    "location": "東京都渋谷区"
  }
}
```

#### レスポンス例

```json
{
  "data": {
    "register": {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "8f7d9a6b-4e7c-4b0f-8f7d-9a6b4e7c4b0f",
      "user": {
        "id": "user_01H2X5JKWQ5T...",
        "name": "山田太郎",
        "email": "user@example.com"
      },
      "error": null
    }
  }
}
```

#### 入力フィールド

`CreateUserInput` には以下のフィールドが含まれます：

| フィールド | 型 | 必須 | 説明 |
|----------|-----|-----|------|
| `email` | String | はい | メールアドレス（一意） |
| `password` | String | はい | パスワード（8文字以上） |
| `name` | String | はい | ユーザー名 |
| `avatarUrl` | String | いいえ | アバター画像URL |
| `bio` | String | いいえ | 自己紹介 |
| `location` | String | いいえ | 居住地・拠点 |

#### 注意事項

- メールアドレスは一意である必要があります。既に登録されているメールアドレスを使用した場合はエラーが返されます。
- パスワードは8文字以上である必要があります。
- 登録成功時は認証トークン（JWT）とリフレッシュトークンが返されます。

### login - ログイン

登録済みのユーザーアカウントにログインするミューテーションです。

#### リクエスト例

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    success
    token
    refreshToken
    user {
      id
      name
      email
      avatarUrl
    }
    error
  }
}
```

#### 変数例

```json
{
  "input": {
    "email": "user@example.com",
    "password": "securePassword123"
  }
}
```

#### レスポンス例

```json
{
  "data": {
    "login": {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "8f7d9a6b-4e7c-4b0f-8f7d-9a6b4e7c4b0f",
      "user": {
        "id": "user_01H2X5JKWQ5T...",
        "name": "山田太郎",
        "email": "user@example.com",
        "avatarUrl": "https://example.com/avatar.jpg"
      },
      "error": null
    }
  }
}
```

#### 入力フィールド

`LoginInput` には以下のフィールドが含まれます：

| フィールド | 型 | 必須 | 説明 |
|----------|-----|-----|------|
| `email` | String | はい | メールアドレス |
| `password` | String | はい | パスワード |

#### 注意事項

- ログイン失敗時は `success: false` と適切なエラーメッセージが返されます。
- ログイン成功時は認証トークン（JWT）とリフレッシュトークンが返されます。
- 認証トークンはデフォルトで24時間有効です。

### logout - ログアウト

現在のセッションからログアウトするミューテーションです。

#### リクエスト例

```graphql
mutation Logout {
  logout
}
```

#### レスポンス例

```json
{
  "data": {
    "logout": true
  }
}
```

#### 注意事項

- このミューテーションはサーバー側でセッションとトークンを無効化します。
- クライアント側でも保存されているトークンを削除する必要があります。
- 認証が必要なミューテーションです。

### refreshToken - トークン更新

リフレッシュトークンを使用して新しい認証トークンを取得するミューテーションです。

#### リクエスト例

```graphql
mutation RefreshToken($refreshToken: String!) {
  refreshToken(refreshToken: $refreshToken) {
    success
    token
    refreshToken
    error
  }
}
```

#### 変数例

```json
{
  "refreshToken": "8f7d9a6b-4e7c-4b0f-8f7d-9a6b4e7c4b0f"
}
```

#### レスポンス例

```json
{
  "data": {
    "refreshToken": {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // 新しいアクセストークン
      "refreshToken": "8f7d9a6b-4e7c-4b0f-8f7d-9a6b4e7c4b0f", // 同じリフレッシュトークン
      "error": null
    }
  }
}
```

#### 注意事項

- リフレッシュトークンが無効または期限切れの場合は、再度ログインする必要があります。
- リフレッシュトークンはデフォルトで30日間有効です。

## スポット関連ミューテーション

### createSpot - スポット作成

新しいスポットを作成するミューテーションです。認証が必要です。

#### リクエスト例

```graphql
mutation CreateSpot($input: CreateSpotInput!) {
  createSpot(input: $input) {
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
    }
    createdAt
  }
}
```

#### 変数例

```json
{
  "input": {
    "name": "隠れた桜の名所",
    "description": "地元の人だけが知る桜の名所。混雑しておらず、ゆっくり花見ができます。",
    "latitude": 35.712189,
    "longitude": 139.770516,
    "address": "東京都文京区...",
    "categoryId": "cat_nature",
    "bestSeason": "春（3月下旬〜4月上旬）",
    "bestTimeOfDay": "午前中",
    "hiddenGemScore": 4,
    "specialExperience": "早朝に訪れると、朝日に照らされた桜を独り占めできます。"
  }
}
```

#### レスポンス例

```json
{
  "data": {
    "createSpot": {
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
        "name": "自然"
      },
      "createdAt": "2023-06-15T08:30:00Z"
    }
  }
}
```

#### 入力フィールド

`CreateSpotInput` には以下のフィールドが含まれます：

| フィールド | 型 | 必須 | 説明 |
|----------|-----|-----|------|
| `name` | String | はい | スポット名 |
| `description` | String | いいえ | 詳細説明 |
| `latitude` | Float | はい | 緯度 |
| `longitude` | Float | はい | 経度 |
| `address` | String | いいえ | 住所 |
| `categoryId` | ID | はい | カテゴリID |
| `bestSeason` | String | いいえ | 訪問のベストシーズン |
| `bestTimeOfDay` | String | いいえ | 訪問のベスト時間帯 |
| `hiddenGemScore` | Int | いいえ | 穴場度合い（1-5） |
| `specialExperience` | String | いいえ | 特別な体験ができるポイント |

#### 注意事項

- 認証されたユーザーのみが実行できます。
- スポットの位置情報（緯度・経度）は必須です。
- カテゴリIDは有効な既存のカテゴリを指定する必要があります。
- スポット作成者はリクエストを行ったユーザーに自動的に設定されます。

### updateSpot - スポット更新

既存のスポット情報を更新するミューテーションです。認証が必要です。

#### リクエスト例

```graphql
mutation UpdateSpot($id: ID!, $input: UpdateSpotInput!) {
  updateSpot(id: $id, input: $input) {
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
    }
    updatedAt
  }
}
```

#### 変数例

```json
{
  "id": "spot_01H2X7KJ5P7T...",
  "input": {
    "name": "隠れた桜の名所（地元民おすすめ）",
    "description": "地元の人だけが知る桜の名所。混雑しておらず、ゆっくり花見ができます。最近カフェもオープンしました。",
    "bestSeason": "春（3月下旬〜4月上旬）",
    "hiddenGemScore": 5,
    "specialExperience": "早朝に訪れると、朝日に照らされた桜を独り占めできます。新設されたカフェで朝食も楽しめます。"
  }
}
```

#### レスポンス例

```json
{
  "data": {
    "updateSpot": {
      "id": "spot_01H2X7KJ5P7T...",
      "name": "隠れた桜の名所（地元民おすすめ）",
      "description": "地元の人だけが知る桜の名所。混雑しておらず、ゆっくり花見ができます。最近カフェもオープンしました。",
      "latitude": 35.712189,
      "longitude": 139.770516,
      "address": "東京都文京区...",
      "bestSeason": "春（3月下旬〜4月上旬）",
      "bestTimeOfDay": "午前中",
      "hiddenGemScore": 5,
      "specialExperience": "早朝に訪れると、朝日に照らされた桜を独り占めできます。新設されたカフェで朝食も楽しめます。",
      "category": {
        "id": "cat_nature",
        "name": "自然"
      },
      "updatedAt": "2023-06-18T09:45:00Z"
    }
  }
}
```

#### 入力フィールド

`UpdateSpotInput` には以下のフィールドが含まれます：

| フィールド | 型 | 必須 | 説明 |
|----------|-----|-----|------|
| `name` | String | いいえ | スポット名 |
| `description` | String | いいえ | 詳細説明 |
| `address` | String | いいえ | 住所 |
| `categoryId` | ID | いいえ | カテゴリID |
| `bestSeason` | String | いいえ | 訪問のベストシーズン |
| `bestTimeOfDay` | String | いいえ | 訪問のベスト時間帯 |
| `hiddenGemScore` | Int | いいえ | 穴場度合い（1-5） |
| `specialExperience` | String | いいえ | 特別な体験ができるポイント |

#### 注意事項

- 認証されたユーザーのみが実行できます。
- スポットの作成者、またはモデレーター/管理者のみが更新できます。
- 更新したいフィールドのみを含めることができます。含まれていないフィールドは変更されません。
- 位置情報（緯度・経度）は更新できません。位置を変更する場合は新しいスポットを作成してください。

### deleteSpot - スポット削除

既存のスポットを削除するミューテーションです。認証が必要です。

#### リクエスト例

```graphql
mutation DeleteSpot($id: ID!) {
  deleteSpot(id: $id)
}
```

#### 変数例

```json
{
  "id": "spot_01H2X7KJ5P7T..."
}
```

#### レスポンス例

```json
{
  "data": {
    "deleteSpot": true
  }
}
```

#### 注意事項

- 認証されたユーザーのみが実行できます。
- スポットの作成者、またはモデレーター/管理者のみが削除できます。
- 削除に成功した場合は `true` が返されます。
- スポットに関連する画像、コメント、保存リストアイテムも削除されます。

### uploadSpotImage - スポット画像アップロード

スポットに画像をアップロードするミューテーションです。認証が必要です。

#### リクエスト例

```graphql
mutation UploadSpotImage(
  $spotId: ID!
  $file: File!
  $caption: String
  $isPrimary: Boolean
) {
  uploadSpotImage(
    spotId: $spotId
    file: $file
    caption: $caption
    isPrimary: $isPrimary
  ) {
    id
    imageUrl
    caption
    isPrimary
    createdAt
  }
}
```

#### 変数例

このミューテーションは `multipart/form-data` 形式でファイルをアップロードするため、変数は以下のように設定します：

```javascript
// クライアント側の例（Apollo Client）
const [uploadImage] = useMutation(UPLOAD_SPOT_IMAGE_MUTATION);

// ファイル選択後の処理
const handleFileUpload = async (file) => {
  const result = await uploadImage({
    variables: {
      spotId: "spot_01H2X7KJ5P7T...",
      file: file,
      caption: "満開の桜",
      isPrimary: true
    }
  });
};
```

#### レスポンス例

```json
{
  "data": {
    "uploadSpotImage": {
      "id": "img_01H3T9PKL...",
      "imageUrl": "https://cdn.machipoke.app/spots/spot_01H2X7KJ5P7T.../img_01H3T9PKL...",
      "caption": "満開の桜",
      "isPrimary": true,
      "createdAt": "2023-06-20T10:30:00Z"
    }
  }
}
```

#### パラメータ

| 名前 | 型 | 必須 | デフォルト値 | 説明 |
|-----|-----|-----|------------|------|
| `spotId` | ID | はい | - | 画像を追加するスポットID |
| `file` | File | はい | - | アップロードする画像ファイル |
| `caption` | String | いいえ | null | 画像の説明 |
| `isPrimary` | Boolean | いいえ | false | メイン画像かどうか |

#### 注意事項

- 認証されたユーザーのみが実行できます。
- スポットの作成者、またはモデレーター/管理者のみが画像をアップロードできます。
- サポートされる画像フォーマット: JPEG、PNG、WebP。
- 最大ファイルサイズ: 5MB。
- `isPrimary` を `true` に設定すると、既存のメイン画像は `isPrimary: false` に更新されます。
- 保存された画像は Cloudflare R2 ストレージに保存され、CDN を通じて配信されます。

## コメント関連ミューテーション

### createComment - コメント作成

スポットに新しいコメントを追加するミューテーションです。認証が必要です。

#### リクエスト例

```graphql
mutation CreateComment($input: CreateCommentInput!) {
  createComment(input: $input) {
    id
    content
    user {
      id
      name
      avatarUrl
    }
    spot {
      id
      name
    }
    createdAt
  }
}
```

#### 変数例

```json
{
  "input": {
    "spotId": "spot_01H2X7KJ5P7T...",
    "content": "先週行ってきました。朝早くに訪れたところ、人も少なく素晴らしい桜を見ることができました！カフェのモーニングセットもおすすめです。"
  }
}
```

#### レスポンス例

```json
{
  "data": {
    "createComment": {
      "id": "com_01H4R6J...",
      "content": "先週行ってきました。朝早くに訪れたところ、人も少なく素晴らしい桜を見ることができました！カフェのモーニングセットもおすすめです。",
      "user": {
        "id": "user_01H2X5JKWQ5U...",
        "name": "佐藤花子",
        "avatarUrl": "https://example.com/avatars/..."
      },
      "spot": {
        "id": "spot_01H2X7KJ5P7T...",
        "name": "隠れた桜の名所（地元民おすすめ）"
      },
      "createdAt": "2023-06-22T15:45:00Z"
    }
  }
}
```

#### 入力フィールド

`CreateCommentInput` には以下のフィールドが含まれます：

| フィールド | 型 | 必須 | 説明 |
|----------|-----|-----|------|
| `spotId` | ID | はい | コメントするスポットID |
| `content` | String | はい | コメント内容 |

#### 注意事項

- 認証されたユーザーのみが実行できます。
- コメント内容は5文字以上1000文字以下である必要があります。
- コメント作成者はリクエストを行ったユーザーに自動的に設定されます。

### updateComment - コメント更新

既存のコメントを更新するミューテーションです。認証が必要です。

#### リクエスト例

```graphql
mutation UpdateComment($id: ID!, $content: String!) {
  updateComment(id: $id, content: $content) {
    id
    content
    updatedAt
  }
}
```

#### 変数例

```json
{
  "id": "com_01H4R6J...",
  "content": "先週行ってきました。朝早くに訪れたところ、人も少なく素晴らしい桜を見ることができました！カフェのモーニングセットもおすすめです。次は満開の時期に行ってみたいです。"
}
```

#### レスポンス例

```json
{
  "data": {
    "updateComment": {
      "id": "com_01H4R6J...",
      "content": "先週行ってきました。朝早くに訪れたところ、人も少なく素晴らしい桜を見ることができました！カフェのモーニングセットもおすすめです。次は満開の時期に行ってみたいです。",
      "updatedAt": "2023-06-22T16:30:00Z"
    }
  }
}
```

#### 注意事項

- 認証されたユーザーのみが実行できます。
- コメントの作成者、またはモデレーター/管理者のみが更新できます。
- コメント内容は5文字以上1000文字以下である必要があります。
- コメント作成から24時間以内のみ更新可能です（モデレーター/管理者を除く）。

### deleteComment - コメント削除

既存のコメントを削除するミューテーションです。認証が必要です。

#### リクエスト例

```graphql
mutation DeleteComment($id: ID!) {
  deleteComment(id: $id)
}
```

#### 変数例

```json
{
  "id": "com_01H4R6J..."
}
```

#### レスポンス例

```json
{
  "data": {
    "deleteComment": true
  }
}
```

#### 注意事項

- 認証されたユーザーのみが実行できます。
- コメントの作成者、またはモデレーター/管理者のみが削除できます。
- 削除に成功した場合は `true` が返されます。

## 保存リスト関連ミューテーション

### createSavedList - 保存リスト作成

新しい保存リストを作成するミューテーションです。認証が必要です。

#### リクエスト例

```graphql
mutation CreateSavedList($input: CreateSavedListInput!) {
  createSavedList(input: $input) {
    id
    name
    description
    isPublic
    user {
      id
      name
    }
    createdAt
  }
}
```

#### 変数例

```json
{
  "input": {
    "name": "行きたい桜スポット",
    "description": "今年の春に訪れたい桜の名所リスト",
    "isPublic": true
  }
}
```

#### レスポンス例

```json
{
  "data": {
    "createSavedList": {
      "id": "list_01H5P8...",
      "name": "行きたい桜スポット",
      "description": "今年の春に訪れたい桜の名所リスト",
      "isPublic": true,
      "user": {
        "id": "user_01H2X5JKWQ5T...",
        "name": "山田太郎"
      },
      "createdAt": "2023-06-25T11:20:00Z"
    }
  }
}
```

#### 入力フィールド

`CreateSavedListInput` には以下のフィールドが含まれます：

| フィールド | 型 | 必須 | 説明 |
|----------|-----|-----|------|
| `name` | String | はい | リスト名 |
| `description` | String | いいえ | リストの説明 |
| `isPublic` | Boolean | いいえ | 公開リストかどうか |

#### 注意事項

- 認証されたユーザーのみが実行できます。
- リスト名は3文字以上50文字以下である必要があります。
- `isPublic` のデフォルト値は `false` です（非公開リスト）。
- リストの所有者はリクエストを行ったユーザーに自動的に設定されます。

### updateSavedList - 保存リスト更新

既存の保存リストを更新するミューテーションです。認証が必要です。

#### リクエスト例

```graphql
mutation UpdateSavedList($id: ID!, $input: UpdateSavedListInput!) {
  updateSavedList(id: $id, input: $input) {
    id
    name
    description
    isPublic
    updatedAt
  }
}
```

#### 変数例

```json
{
  "id": "list_01H5P8...",
  "input": {
    "name": "東京の桜スポット",
    "description": "東京都内の桜の名所コレクション",
    "isPublic": true
  }
}
```

#### レスポンス例

```json
{
  "data": {
    "updateSavedList": {
      "id": "list_01H5P8...",
      "name": "東京の桜スポット",
      "description": "東京都内の桜の名所コレクション",
      "isPublic": true,
      "updatedAt": "2023-06-26T09:15:00Z"
    }
  }
}
```

#### 入力フィールド

`UpdateSavedListInput` には以下のフィールドが含まれます：

| フィールド | 型 | 必須 | 説明 |
|----------|-----|-----|------|
| `name` | String | いいえ | リスト名 |
| `description` | String | いいえ | リストの説明 |
| `isPublic` | Boolean | いいえ | 公開リストかどうか |

#### 注意事項

- 認証されたユーザーのみが実行できます。
- リストの所有者のみが更新できます。
- 更新したいフィールドのみを含めることができます。含まれていないフィールドは変更されません。

### deleteSavedList - 保存リスト削除

既存の保存リストを削除するミューテーションです。認証が必要です。

#### リクエスト例

```graphql
mutation DeleteSavedList($id: ID!) {
  deleteSavedList(id: $id)
}
```

#### 変数例

```json
{
  "id": "list_01H5P8..."
}
```

#### レスポンス例

```json
{
  "data": {
    "deleteSavedList": true
  }
}
```

#### 注意事項

- 認証されたユーザーのみが実行できます。
- リストの所有者のみが削除できます。
- 削除に成功した場合は `true` が返されます。
- リストに関連するすべての保存アイテムも削除されます。

### addSpotToSavedList - リストにスポット追加

保存リストにスポットを追加するミューテーションです。認証が必要です。

#### リクエスト例

```graphql
mutation AddSpotToSavedList($input: AddSpotToSavedListInput!) {
  addSpotToSavedList(input: $input) {
    id
    note
    isVisited
    visitedAt
    spot {
      id
      name
    }
    createdAt
  }
}
```

#### 変数例

```json
{
  "input": {
    "listId": "list_01H5P8...",
    "spotId": "spot_01H2X7KJ5P7T...",
    "note": "次の春に訪れたい",
    "isVisited": false
  }
}
```

#### レスポンス例

```json
{
  "data": {
    "addSpotToSavedList": {
      "id": "item_01H6T9...",
      "note": "次の春に訪れたい",
      "isVisited": false,
      "visitedAt": null,
      "spot": {
        "id": "spot_01H2X7KJ5P7T...",
        "name": "隠れた桃の名所"
      },
      "createdAt": "2023-06-27T13:45:00Z"
    }
  }
}
```

#### 入力フィールド

`AddSpotToSavedListInput` には以下のフィールドが含まれます：

| フィールド | 型 | 必須 | 説明 |
|----------|-----|-----|------|
| `listId` | ID | はい | 保存リストID |
| `spotId` | ID | はい | スポットID |
| `note` | String | いいえ | メモ（個人用） |
| `isVisited` | Boolean | いいえ | 訪問済みかどうか |
| `visitedAt` | DateTime | いいえ | 訪問日時 |

#### 注意事項

- 認証されたユーザーのみが実行できます。
- リストの所有者のみがスポットを追加できます。
- 同じスポットが既にリストに存在する場合、そのアイテムが更新されます。

### removeSpotFromSavedList - リストからスポット削除

保存リストからスポットを削除するミューテーションです。認証が必要です。

#### リクエスト例

```graphql
mutation RemoveSpotFromSavedList($listId: ID!, $spotId: ID!) {
  removeSpotFromSavedList(listId: $listId, spotId: $spotId)
}
```

#### 変数例

```json
{
  "listId": "list_01H5P8...",
  "spotId": "spot_01H2X7KJ5P7T..."
}
```

#### レスポンス例

```json
{
  "data": {
    "removeSpotFromSavedList": true
  }
}
```

#### 注意事項

- 認証されたユーザーのみが実行できます。
- リストの所有者のみがスポットを削除できます。
- 削除に成功した場合は `true` が返されます。
- スポットがリストに存在しない場合でもエラーは発生せず、`true` が返されます。

## ユーザープロフィール関連ミューテーション

### updateUserProfile - プロフィール更新

自分のユーザープロフィールを更新するミューテーションです。認証が必要です。

#### リクエスト例

```graphql
mutation UpdateUserProfile(
  $name: String
  $bio: String
  $location: String
  $expertAreas: String
  $avatarUrl: String
) {
  updateUserProfile(
    name: $name
    bio: $bio
    location: $location
    expertAreas: $expertAreas
    avatarUrl: $avatarUrl
  ) {
    id
    name
    bio
    location
    expertAreas
    avatarUrl
    updatedAt
  }
}
```

#### 変数例

```json
{
  "name": "山田太郎",
  "bio": "地元の名所探しが趣味です。特に桜の名所に詳しいです。",
  "location": "東京都渋谷区",
  "expertAreas": "東京,神奈川,埼玉"
}
```

#### レスポンス例

```json
{
  "data": {
    "updateUserProfile": {
      "id": "user_01H2X5JKWQ5T...",
      "name": "山田太郎",
      "bio": "地元の名所探しが趣味です。特に桜の名所に詳しいです。",
      "location": "東京都渋谷区",
      "expertAreas": "東京,神奈川,埼玉",
      "avatarUrl": "https://example.com/avatar.jpg",
      "updatedAt": "2023-06-30T10:20:00Z"
    }
  }
}
```

#### パラメータ

| 名前 | 型 | 必須 | デフォルト値 | 説明 |
|-----|-----|-----|------------|------|
| `name` | String | いいえ | - | ユーザー名 |
| `bio` | String | いいえ | - | 自己紹介 |
| `location` | String | いいえ | - | 居住地・拠点 |
| `expertAreas` | String | いいえ | - | 得意なエリア（カンマ区切り） |
| `avatarUrl` | String | いいえ | - | アバター画像URL |

#### 注意事項

- 認証されたユーザーのみが実行できます。
- 自分のプロフィールのみを更新できます。
- 更新したいフィールドのみを含めることができます。含まれていないフィールドは変更されません。
- ユーザー名は2文字以上50文字以下である必要があります。
- `avatarUrl` は別途アップロードした画像URLを指定します。画像アップロードには別のエンドポイントを使用します。

## エラー処理

ミューテーション実行時に発生する可能性のある主なエラーは以下の通りです：

#### リクエスト例

```graphql
mutation UpdateUserProfile(
  $name: String
  $bio: String
  $location: String
  $expertAreas: String
  $avatarUrl: String
) {
  updateUserProfile(
    name: $name
    bio: $bio
    location: $location
    expertAreas: $expertAreas
    avatarUrl: $avatarUrl
  ) {
    id
    name
    bio
    location
    expertAreas
    avatarUrl
    updatedAt
  }
}
```

#### 変数例

```json
{
  "name": "山田太郎",
  "bio": "地元の名所探しが趣味です。特に桜の名所に詳しいです。",
  "location": "東京都渋谷区",
  "expertAreas": "東京,神奈川,埼玉"
}
```

#### レスポンス例

```json
{
  "data": {
    "updateUserProfile": {
      "id": "user_01H2X5JKWQ5T...",
      "name": "山田太郎",
      "bio": "地元の名所探しが趣味です。特に桜の名所に詳しいです。",
      "location": "東京都渋谷区",
      "expertAreas": "東京,神奈川,埼玉",
      "avatarUrl": "https://example.com/avatar.jpg",
      "updatedAt": "2023-06-30T10:20:00Z"
    }
  }
}
```

#### パラメータ

| 名前 | 型 | 必須 | デフォルト値 | 説明 |
|-----|-----|-----|------------|------|
| `name` | String | いいえ | - | ユーザー名 |
| `bio` | String | いいえ | - | 自己紹介 |
| `location` | String | いいえ | - | 居住地・拠点 |
| `expertAreas` | String | いいえ | - | 得意なエリア（カンマ区切り） |
| `avatarUrl` | String | いいえ | - | アバター画像URL |

#### 注意事項

- 認証されたユーザーのみが実行できます。
- 自分のプロフィールのみを更新できます。
- 更新したいフィールドのみを含めることができます。含まれていないフィールドは変更されません。
- ユーザー名は2文字以上50文字以下である必要があります。
- `avatarUrl` は別途アップロードした画像URLを指定します。画像アップロードには別のエンドポイントを使用します。

## エラー処理

ミューテーション実行時に発生する可能性のある主なエラーは以下の通りです：

### 一般的なエラーコード

| エラーコード | 説明 | 対処法 |
|------------|------|-------|
| `UNAUTHENTICATED` | 認証が必要です | ユーザーをログインページにリダイレクト |
| `FORBIDDEN` | アクセス権限がありません | 適切な権限を持つユーザーでログインするよう促す |
| `NOT_FOUND` | リソースが見つかりません | ID指定の誤りがないか確認 |
| `BAD_USER_INPUT` | 入力データが不正です | エラーメッセージに従って入力を修正 |
| `INTERNAL_SERVER_ERROR` | サーバー内部エラー | サポートに連絡し、後ほど再試行 |

### エラーレスポンスの形式

エラーが発生した場合、GraphQLは以下の形式でエラーを返します：

```json
{
  "errors": [
    {
      "message": "ユーザー名は2文字以上50文字以下である必要があります",
      "extensions": {
        "code": "BAD_USER_INPUT",
        "invalidArgs": {
          "name": "文字数が無効です"
        },
        "http": {
          "status": 400
        }
      }
    }
  ]
}
```

## ベストプラクティス

マチポケAPIでミューテーションを使用する際のベストプラクティスを紹介します。

### エラーハンドリング

すべてのミューテーションで適切なエラーハンドリングを実装しましょう。

```typescript
// Apollo Clientの例
const [createSpot, { loading, error }] = useMutation(CREATE_SPOT_MUTATION, {
  onError: (error) => {
    const errorCode = error.graphQLErrors?.[0]?.extensions?.code;
    switch (errorCode) {
      case 'UNAUTHENTICATED':
        // ログインページにリダイレクト
        navigate('/login', { state: { returnTo: location.pathname } });
        break;
      case 'BAD_USER_INPUT':
        // ユーザーに入力エラーを表示
        const fieldErrors = error.graphQLErrors[0].extensions.invalidArgs;
        setErrors(fieldErrors);
        break;
      default:
        // 一般的なエラーメッセージを表示
        showNotification(
          'エラーが発生しました。時間をおいて再試行してください。'
        );
    }
  }
});
```

### 東時間の処理

使用する日時はすべてUTCで扱われます。クライアント側で表示する前にローカルタイムへの変換を行いましょう。

```typescript
// 日付のフォーマット例
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
```

### トランザクション管理

複数のミューテーションが相互に依存している場合、一方が失敗した場合の処理を考慮しましょう。

```typescript
// 複数の関連ミューテーションの例
const handleCreateSpotWithImages = async (spotData, imageFiles) => {
  try {
    // スポットを作成
    const { data } = await createSpot({ variables: { input: spotData } });
    const spotId = data.createSpot.id;
    
    // 画像をアップロード
    const uploadPromises = imageFiles.map((file, index) => 
      uploadSpotImage({
        variables: {
          spotId,
          file,
          isPrimary: index === 0 // 最初の画像をメイン画像に設定
        }
      })
    );
    
    await Promise.all(uploadPromises);
    
    return spotId;
  } catch (error) {
    // エラー処理
    console.error('Error creating spot with images:', error);
    throw error;
  }
};
```

### キャッシュの更新

ミューテーション実行後、Apollo Clientのキャッシュを更新して最新のデータを反映させましょう。

```typescript
// キャッシュ更新の例
const [createComment] = useMutation(CREATE_COMMENT_MUTATION, {
  update: (cache, { data: { createComment } }) => {
    // スポット詳細のキャッシュを更新
    const cacheId = cache.identify({ __typename: 'Spot', id: spotId });
    
    cache.modify({
      id: cacheId,
      fields: {
        comments: (existingComments = []) => {
          const newCommentRef = cache.writeFragment({
            data: createComment,
            fragment: gql`
              fragment NewComment on Comment {
                id
                content
                user {
                  id
                  name
                  avatarUrl
                }
                createdAt
              }
            `
          });
          
          return [newCommentRef, ...existingComments];
        }
      }
    });
  }
});
```

### ユーザーフィードバック

ミューテーションの進行状況と結果をユーザーに適切に伝えましょう。

```typescript
// ローディング状態と結果の表示
const SubmitButton = ({ loading, success }) => (
  <button
    type="submit"
    disabled={loading}
    className={`btn ${success ? 'btn-success' : 'btn-primary'}`}
  >
    {loading ? (
      <>
        <Spinner size="sm" /> 処理中...
      </>
    ) : success ? (
      <>
        <CheckIcon /> 保存完了
      </>
    ) : (
      '保存する'
    )}
  </button>
);
```

### 入力バリデーション

サーバーサイドのバリデーションだけでなく、クライアントサイドでも事前にバリデーションを行いましょう。

```typescript
// クライアント側バリデーションの例
const validateSpotForm = (values) => {
  const errors = {};
  
  if (!values.name) {
    errors.name = 'スポット名は必須です';
  } else if (values.name.length < 2 || values.name.length > 100) {
    errors.name = 'スポット名は2文字以上100文字以下で入力してください';
  }
  
  if (!values.latitude || !values.longitude) {
    errors.location = '場所を選択してください';
  }
  
  if (!values.categoryId) {
    errors.categoryId = 'カテゴリを選択してください';
  }
  
  if (values.hiddenGemScore && (values.hiddenGemScore < 1 || values.hiddenGemScore > 5)) {
    errors.hiddenGemScore = '穴場度合いは1〜5の間で選択してください';
  }
  
  return errors;
};
```

### アフリケーション状態の管理

React Context APIやReduxなどを使用して、ミューテーションの後にアプリケーションの状態を適切に更新しましょう。

```typescript
// Context APIを使用した状態管理の例
const { addToast } = useToasts();
const { updateUserData } = useAuth();

const [updateProfile] = useMutation(UPDATE_PROFILE_MUTATION, {
  onCompleted: (data) => {
    // プロフィール更新成功時の処理
    updateUserData(data.updateUserProfile);
    addToast('プロフィールを更新しました', { appearance: 'success' });
  }
});
```

### 保存情報の確認

重要なミューテーション（削除など）を行う前に、ユーザーに確認を求めましょう。

```typescript
// 削除確認ダイアログの例
const confirmDeleteSpot = (spotId, spotName) => {
  if (window.confirm(`「${spotName}」を削除しますか？この操作は元に戻せません。`)) {
    deleteSpot({
      variables: { id: spotId },
      onCompleted: () => {
        navigate('/my-spots');
        addToast('スポットを削除しました', { appearance: 'success' });
      }
    });
  }
};
```

これらのベストプラクティスを取り入れることで、マチポケAPIを使用したアプリケーションの信頼性とユーザーエクスペリエンスを向上させることができます。