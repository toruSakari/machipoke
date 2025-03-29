# マチポケ API 認証ガイド

## 概要

マチポケAPIでは、JWT（JSON Web Token）ベースの認証システムを採用しています。このドキュメントでは、APIにアクセスするために必要な認証プロセスと、認証トークンの管理方法について説明します。

## 認証フロー

マチポケAPIでの一般的な認証フローは以下の通りです：

```mermaid
sequenceDiagram
    クライアント->>+サーバー: 認証リクエスト（ログイン/登録）
    サーバー->>サーバー: ユーザー検証/作成
    サーバー-->>-クライアント: JWT & リフレッシュトークン
    Note over クライアント: トークンを保存
    
    クライアント->>+サーバー: APIリクエスト + JWT
    サーバー->>サーバー: トークン検証
    サーバー-->>-クライアント: リソースの返却
    
    Note over クライアント,サーバー: トークン期限切れの場合
    
    クライアント->>+サーバー: リフレッシュトークンで更新
    サーバー->>サーバー: リフレッシュトークン検証
    サーバー-->>-クライアント: 新しいJWT
```

## アカウント登録

新規ユーザーアカウントを作成するには、`register` ミューテーションを使用します。

### リクエスト例

```graphql
mutation Register {
  register(
    input: {
      email: "user@example.com"
      password: "securePassword123"
      name: "山田太郎"
      location: "東京都渋谷区"
    }
  ) {
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

### レスポンス例

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

## ログイン

既存アカウントにログインするには、`login` ミューテーションを使用します。

### リクエスト例

```graphql
mutation Login {
  login(
    input: {
      email: "user@example.com"
      password: "securePassword123"
    }
  ) {
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

### レスポンス例

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
        "email": "user@example.com"
      },
      "error": null
    }
  }
}
```

## ソーシャルログイン

マチポケAPIは、複数のソーシャルログインプロバイダーをサポートしています。

### サポートされているプロバイダー

- Google
- Apple
- X (旧Twitter)

### ソーシャルログインの使用例

```graphql
mutation SocialLogin {
  socialLogin(
    provider: "google"
    token: "google_provided_token..."
  ) {
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

## アクセストークン（JWT）の使用

認証後に受け取ったJWTトークンは、APIへのすべてのリクエストの `Authorization` ヘッダーに含める必要があります。

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### JWTの構造

マチポケのJWTトークンは、以下の情報を含みます：

```json
{
  "sub": "user_01H2X5JKWQ5T...", // ユーザーID
  "name": "山田太郎", // ユーザー名
  "role": "user", // ユーザーロール
  "iat": 1675231200, // 発行時刻
  "exp": 1675317600, // 有効期限
  "iss": "machipoke-app", // 発行者
  "aud": "machipoke-api" // 対象者
}
```

### トークンの有効期間

- **アクセストークン（JWT）**: 24時間
- **リフレッシュトークン**: 30日間

## トークンの更新

アクセストークンの有効期限が切れた場合、リフレッシュトークンを使用して新しいアクセストークンを取得できます。

### リクエスト例

```graphql
mutation RefreshToken {
  refreshToken(
    refreshToken: "8f7d9a6b-4e7c-4b0f-8f7d-9a6b4e7c4b0f"
  ) {
    success
    token
    refreshToken
    error
  }
}
```

### レスポンス例

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

## ログアウト

セキュリティのため、ユーザーがログアウトする際には、サーバーサイドでトークンを無効化することをお勧めします。

### リクエスト例

```graphql
mutation Logout {
  logout
}
```

### レスポンス例

```json
{
  "data": {
    "logout": true
  }
}
```

ログアウト後、クライアント側でもトークンを削除してください。

## 認証エラーの処理

認証に関連する主なエラーコードと対処法は以下の通りです：

| エラーコード | メッセージ | 対処法 |
|------------|----------|-------|
| `UNAUTHENTICATED` | 認証が必要です | ユーザーをログインページにリダイレクト |
| `INVALID_TOKEN` | トークンが無効です | 再ログインまたはトークンの更新を試みる |
| `TOKEN_EXPIRED` | トークンの有効期限が切れています | リフレッシュトークンで更新 |
| `INVALID_CREDENTIALS` | メールアドレスまたはパスワードが無効です | ユーザーに再入力を促す |
| `INVALID_REFRESH_TOKEN` | リフレッシュトークンが無効です | 再ログインを促す |

## 認可（アクセス制御）

マチポケAPIでは、ユーザーロールに基づくアクセス制御が実装されています。

### ユーザーロール

| ロール | 説明 |
|-------|------|
| `guest` | 非認証ユーザー（閲覧のみ） |
| `user` | 標準ユーザー（基本的な操作可能） |
| `contributor` | 信頼スコアが高いユーザー（追加特権あり） |
| `moderator` | コンテンツモデレーション権限を持つユーザー |
| `admin` | システム管理者（すべての操作が可能） |

### GraphQLでの権限チェック

GraphQLクエリやミューテーションでの権限チェックは自動的に行われます。権限がない場合は、`FORBIDDEN` エラーが返されます。

```json
{
  "errors": [
    {
      "message": "この操作を行うのに必要な権限がありません。",
      "extensions": {
        "code": "FORBIDDEN",
        "http": {
          "status": 403
        }
      }
    }
  ]
}
```

## セキュリティのベストプラクティス

マチポケAPIを安全に使用するためのベストプラクティスは以下の通りです：

1. **トークンのセキュアな保存**
   - フロントエンド: HTTPオンリークッキーまたはローカルストレージ
   - モバイル: セキュアストレージまたはキーチェーン

2. **トークンの有効期限管理**
   - アクセストークンの期限が切れたら自動的に更新
   - リフレッシュトークンの期限が切れたら、ユーザーに再ログインを促す

3. **HTTPS通信**
   - すべてのAPI通信はHTTPS経由で行う

4. **CSRFトークンの使用**
   - フォーム送信時にはCSRFトークンを含める

## クライアント実装例

### React + Apollo Client実装例

```typescript
// 認証コンテキスト
export const AuthContext = createContext<{
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  socialLogin: (provider: string, token: string) => Promise<boolean>;
}>({
  currentUser: null,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  socialLogin: async () => false
});

// Apollo Clientの設定
const httpLink = createHttpLink({
  uri: '/graphql',
});

// 認証ヘッダーを追加
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('auth_token');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Apollo Clientインスタンスの作成
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});
```

### トークン更新処理の実装例

```typescript
// トークンの自動更新処理
async function refreshAuthToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    return false;
  }
  
  try {
    const { data } = await client.mutate({
      mutation: REFRESH_TOKEN_MUTATION,
      variables: { refreshToken }
    });
    
    if (data.refreshToken.success) {
      localStorage.setItem('auth_token', data.refreshToken.token);
      return true;
    } else {
      // リフレッシュトークンが無効な場合
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      return false;
    }
  } catch (error) {
    // エラー発生時は認証情報をクリア
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    return false;
  }
}
```

## 参考リソース

- [GraphQLスキーマ](./schema.md)
- [エラー処理](./error-handling.md)
- [クエリ例](./queries.md)
- [ミューテーション例](./mutations.md)
