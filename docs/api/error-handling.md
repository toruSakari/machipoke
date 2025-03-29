# マチポケ API エラー処理ガイド

このドキュメントでは、マチポケGraphQL APIのエラー処理について詳細に説明します。API利用時に発生する可能性のあるエラーの種類、レスポンス形式、およびクライアント側での適切な対処法を提供します。

## 目次

- [GraphQLエラーの基本構造](#graphqlエラーの基本構造)
- [エラーコードと対処法](#エラーコードと対処法)
- [エラー処理のベストプラクティス](#エラー処理のベストプラクティス)
- [認証関連エラー](#認証関連エラー)
- [入力バリデーションエラー](#入力バリデーションエラー)
- [リソース関連エラー](#リソース関連エラー)
- [レート制限エラー](#レート制限エラー)
- [サーバーエラー](#サーバーエラー)
- [エラー処理の実装例](#エラー処理の実装例)

## GraphQLエラーの基本構造

マチポケAPIのGraphQLエラーは、GraphQL仕様に準拠した標準形式で返されます。エラーレスポンスは以下の構造を持ちます：

```json
{
  "errors": [
    {
      "message": "エラーメッセージ",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["mutation", "createSpot"],
      "extensions": {
        "code": "ERROR_CODE",
        "exception": {
          "stacktrace": ["..."] // 開発環境のみ
        },
        "invalidArgs": { // 入力エラーの場合
          "fieldName": "エラーの詳細"
        },
        "http": {
          "status": 400
        }
      }
    }
  ]
}
```

主要なコンポーネント：

- `message`: 人間が読めるエラーメッセージ
- `locations`: GraphQLクエリ/ミューテーション内でエラーが発生した位置
- `path`: エラーの発生したフィールドパス
- `extensions`: エラーに関する追加情報
  - `code`: マシンリーダブルなエラーコード
  - `invalidArgs`: 入力バリデーションエラー時の詳細情報
  - `http`: 対応するHTTPステータスコード

## エラーコードと対処法

マチポケAPIで使用される主なエラーコードとその対処法は以下の通りです：

| エラーコード | 説明 | HTTP ステータス | 対処法 |
|------------|------|-------------|------|
| `UNAUTHENTICATED` | 認証が必要な操作に認証情報がない | 401 | ログインフローを開始する |
| `INVALID_TOKEN` | 提供されたトークンが無効 | 401 | 新しいトークンを取得するか再ログインする |
| `TOKEN_EXPIRED` | 認証トークンの期限切れ | 401 | リフレッシュトークンを使用して更新する |
| `FORBIDDEN` | 操作に対する権限がない | 403 | 権限のあるアカウントでログインするか機能制限を表示 |
| `NOT_FOUND` | リクエストされたリソースが存在しない | 404 | リソースIDの確認または存在確認の実装 |
| `BAD_USER_INPUT` | 入力データが無効または不適切 | 400 | エラーメッセージに基づいて入力を修正 |
| `BUSINESS_RULE_VIOLATION` | ビジネスルールに違反する操作 | 422 | アプリケーションのルールに従った操作に修正 |
| `QUERY_COMPLEXITY_EXCEEDED` | クエリの複雑度が高すぎる | 400 | クエリをシンプルにするか分割する |
| `RATE_LIMITED` | APIレート制限に達した | 429 | バックオフ戦略を実装し時間をおいて再試行 |
| `INTERNAL_SERVER_ERROR` | サーバー内部エラー | 500 | サポートに連絡し時間をおいて再試行 |

## エラー処理のベストプラクティス

### 1. エラーコードによる分岐処理

エラーコードに基づいて適切な処理を行います：

```javascript
// Apollo Clientでのエラーハンドリング例
try {
  const result = await client.mutate({
    mutation: CREATE_SPOT,
    variables: { input: spotData }
  });
  // 成功処理
} catch (error) {
  const errorCode = error.graphQLErrors?.[0]?.extensions?.code;
  switch (errorCode) {
    case 'UNAUTHENTICATED':
      // ログインへリダイレクト
      redirectToLogin();
      break;
    case 'BAD_USER_INPUT':
      // フォームエラーを表示
      const fieldErrors = error.graphQLErrors[0].extensions.invalidArgs || {};
      setFormErrors(fieldErrors);
      break;
    case 'RATE_LIMITED':
      // 再試行タイマーを設定
      setRetryTimeout(30000); // 30秒後に再試行
      break;
    default:
      // 一般エラーメッセージを表示
      showErrorNotification(error.message || '予期しないエラーが発生しました');
  }
}
```

### 2. エラーレスポンスの解析

GraphQLエラーレスポンスから必要な情報を抽出する関数を作成します：

```javascript
// エラー解析ユーティリティ
function parseGraphQLError(error) {
  // Apollo Clientのエラーオブジェクトを想定
  if (!error?.graphQLErrors?.length) {
    return {
      code: 'NETWORK_ERROR',
      message: error?.message || '通信エラーが発生しました',
      invalidArgs: {}
    };
  }

  const graphQLError = error.graphQLErrors[0];
  return {
    code: graphQLError.extensions?.code || 'UNKNOWN_ERROR',
    message: graphQLError.message || '予期しないエラーが発生しました',
    invalidArgs: graphQLError.extensions?.invalidArgs || {},
    httpStatus: graphQLError.extensions?.http?.status
  };
}
```

### 3. フォールバック処理

すべてのエラーシナリオに対して適切なフォールバック処理を実装します：

```javascript
// フォールバック処理の例
function fetchSpotWithFallback(spotId) {
  return client.query({
    query: GET_SPOT,
    variables: { id: spotId },
    fetchPolicy: 'network-only'
  }).catch(error => {
    const { code } = parseGraphQLError(error);
    
    if (code === 'NOT_FOUND') {
      // 見つからない場合は空のデータを返す
      return { data: { spot: null } };
    }
    
    if (code === 'NETWORK_ERROR') {
      // ネットワークエラーの場合はキャッシュから取得を試みる
      return client.query({
        query: GET_SPOT,
        variables: { id: spotId },
        fetchPolicy: 'cache-only'
      });
    }
    
    // その他のエラーは上位に伝播
    throw error;
  });
}
```

## 認証関連エラー

認証関連のエラーは、APIの保護されたエンドポイントにアクセスする際に発生することがあります。

### UNAUTHENTICATED

```json
{
  "errors": [
    {
      "message": "この操作にはログインが必要です",
      "extensions": {
        "code": "UNAUTHENTICATED",
        "http": {
          "status": 401
        }
      }
    }
  ]
}
```

**対処法**:
- ユーザーをログインページにリダイレクトする
- 認証トークンが正しくリクエストに含まれているか確認する

### TOKEN_EXPIRED

```json
{
  "errors": [
    {
      "message": "認証トークンの有効期限が切れています",
      "extensions": {
        "code": "TOKEN_EXPIRED",
        "http": {
          "status": 401
        }
      }
    }
  ]
}
```

**対処法**:
- リフレッシュトークンを使用して新しい認証トークンを取得する
- 再ログインを促す

### トークン自動更新の実装例

```javascript
// Apollo Clientのリクエストリンクでトークン更新処理を実装
import { onError } from '@apollo/client/link/error';

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions?.code === 'TOKEN_EXPIRED') {
        // トークン更新処理
        return new Observable(observer => {
          refreshToken()
            .then(newToken => {
              // 新しいトークンでヘッダーを更新
              const oldHeaders = operation.getContext().headers;
              operation.setContext({
                headers: {
                  ...oldHeaders,
                  authorization: `Bearer ${newToken}`
                }
              });
              // リクエストを再実行
              forward(operation).subscribe(observer);
            })
            .catch(error => {
              // リフレッシュトークンも無効な場合はログインへ
              logout();
              redirectToLogin();
              observer.error(error);
            });
        });
      }
    }
  }
});
```

## 入力バリデーションエラー

入力バリデーションエラーは、APIへの無効な入力データを送信した際に発生します。

### BAD_USER_INPUT

```json
{
  "errors": [
    {
      "message": "入力データが不正です",
      "extensions": {
        "code": "BAD_USER_INPUT",
        "invalidArgs": {
          "name": "スポット名は必須です",
          "latitude": "有効な緯度を入力してください (-90〜90)",
          "longitude": "有効な経度を入力してください (-180〜180)"
        },
        "http": {
          "status": 400
        }
      }
    }
  ]
}
```

**対処法**:
- エラーメッセージに従って入力フィールドを修正する
- フィールドごとにエラーメッセージを表示する
- クライアント側で事前バリデーションを実装する

### フォームエラー表示の実装例

```jsx
function SpotForm({ onSubmit }) {
  const [formData, setFormData] = useState({ /* 初期値 */ });
  const [errors, setErrors] = useState({});
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await createSpot({ variables: { input: formData } });
      onSubmit(result.data.createSpot);
    } catch (error) {
      // エラー情報を抽出
      const { invalidArgs } = parseGraphQLError(error);
      setErrors(invalidArgs);
      
      // フォーム内の最初のエラーフィールドにフォーカス
      const firstErrorField = Object.keys(invalidArgs)[0];
      if (firstErrorField && document.getElementById(firstErrorField)) {
        document.getElementById(firstErrorField).focus();
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">スポット名 *</label>
        <input
          id="name"
          value={formData.name || ''}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className={errors.name ? 'input-error' : ''}
        />
        {errors.name && <div className="error-message">{errors.name}</div>}
      </div>
      
      {/* 他のフィールド */}
      
      <button type="submit">保存</button>
    </form>
  );
}
```

## リソース関連エラー

リソース関連のエラーは、要求されたリソースが存在しない場合や操作が許可されていない場合に発生します。

### NOT_FOUND

```json
{
  "errors": [
    {
      "message": "スポットが見つかりません",
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

**対処法**:
- 存在しないリソースへのアクセスを適切に処理する
- ユーザーに「見つかりません」メッセージを表示する
- 代替コンテンツを提示する

### FORBIDDEN

```json
{
  "errors": [
    {
      "message": "このスポットを更新する権限がありません",
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

**対処法**:
- 適切な権限がないことをユーザーに通知する
- 権限のある操作のみUIに表示する
- 権限のないアクションをグレーアウトまたは非表示にする

### 権限チェックの実装例

```jsx
function SpotDetail({ spotId }) {
  const { data, loading, error } = useQuery(GET_SPOT, {
    variables: { id: spotId }
  });
  
  const { currentUser } = useAuth();
  
  // スポット所有者または管理者のみが編集可能
  const canEdit = currentUser && data?.spot && (
    currentUser.id === data.spot.createdBy.id ||
    ['admin', 'moderator'].includes(currentUser.role)
  );
  
  return (
    <div className="spot-detail">
      {loading && <LoadingSpinner />}
      
      {error && <ErrorDisplay error={error} />}
      
      {data?.spot && (
        <>
          <h1>{data.spot.name}</h1>
          <p>{data.spot.description}</p>
          
          {/* 権限に基づいて表示/非表示 */}
          {canEdit && (
            <div className="actions">
              <Button onClick={() => navigate(`/spots/${spotId}/edit`)}>
                編集
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                削除
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

## レート制限エラー

レート制限エラーは、短時間に多数のリクエストを送信した場合に発生します。

### RATE_LIMITED

```json
{
  "errors": [
    {
      "message": "リクエスト数が多すぎます。時間をおいて再試行してください。",
      "extensions": {
        "code": "RATE_LIMITED",
        "http": {
          "status": 429
        },
        "retryAfter": 60
      }
    }
  ]
}
```

**対処法**:
- 指定された時間だけ待機してから再試行する
- バックオフアルゴリズムを実装する
- ユーザーに一時的に利用できないことを通知する

### バックオフと再試行の実装例

```javascript
// 指数バックオフと再試行機能
async function fetchWithRetry(operation, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;
  let delay = initialDelay;
  
  while (true) {
    try {
      return await operation();
    } catch (error) {
      const { code, httpStatus } = parseGraphQLError(error);
      
      // レート制限の場合のみ再試行
      if (code === 'RATE_LIMITED' && retries < maxRetries) {
        retries++;
        // 指数バックオフ（1秒、2秒、4秒...）
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        
        // ユーザーに再試行を通知
        showNotification(`リクエスト制限に達しました。再試行中 (${retries}/${maxRetries})...`);
        continue;
      }
      
      // その他のエラーはそのまま投げる
      throw error;
    }
  }
}

// 使用例
async function searchSpots(query) {
  return fetchWithRetry(() => client.query({
    query: SEARCH_SPOTS,
    variables: { query }
  }));
}
```

## サーバーエラー

サーバーエラーは、サーバー側での予期しない問題により発生します。

### INTERNAL_SERVER_ERROR

```json
{
  "errors": [
    {
      "message": "サーバーエラーが発生しました。時間をおいて再試行してください。",
      "extensions": {
        "code": "INTERNAL_SERVER_ERROR",
        "http": {
          "status": 500
        }
      }
    }
  ]
}
```

**対処法**:
- ユーザーに一般的なエラーメッセージを表示する
- 時間をおいて再試行するよう促す
- 開発者モードでは詳細なエラー情報をログに記録する

### エラーロギングの実装例

```javascript
// エラーロギングサービス
const errorLoggingService = {
  logError(error, context = {}) {
    const { code, message, httpStatus } = parseGraphQLError(error);
    
    // 本番環境では実際のログサービスに送信
    if (process.env.NODE_ENV === 'production') {
      // 例: Sentry, LogRocket などへ送信
      Sentry.captureException(error, {
        tags: { errorCode: code },
        extra: {
          httpStatus,
          graphQLPath: error.graphQLErrors?.[0]?.path,
          operationName: context.operationName,
          variables: context.variables
        }
      });
    } else {
      // 開発環境ではコンソールに詳細ログ
      console.error('[GraphQL Error]', {
        code,
        message,
        httpStatus,
        path: error.graphQLErrors?.[0]?.path,
        stack: error.graphQLErrors?.[0]?.extensions?.exception?.stacktrace,
        operation: context
      });
    }
  }
};

// Apollo Clientに統合
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(error => {
      errorLoggingService.logError(
        { graphQLErrors: [error] },
        {
          operationName: operation.operationName,
          variables: operation.variables
        }
      );
    });
  }
  
  if (networkError) {
    errorLoggingService.logError(networkError, {
      operationName: operation.operationName
    });
  }
});
```

## エラー処理の実装例

以下に、React + Apollo Clientを使用した包括的なエラー処理の実装例を示します。

### GraphQLエラーコンポーネント

```jsx
// GraphQLエラー表示コンポーネント
function GraphQLErrorDisplay({ error, onRetry }) {
  const { code, message, invalidArgs } = parseGraphQLError(error);
  
  // エラータイプに基づいてメッセージをカスタマイズ
  const getErrorMessage = () => {
    switch (code) {
      case 'UNAUTHENTICATED':
      case 'INVALID_TOKEN':
      case 'TOKEN_EXPIRED':
        return 'ログインセッションが切れました。再度ログインしてください。';
      case 'FORBIDDEN':
        return 'この操作を行う権限がありません。';
      case 'NOT_FOUND':
        return '要求されたリソースが見つかりません。';
      case 'RATE_LIMITED':
        return 'リクエスト数が多すぎます。しばらくしてから再試行してください。';
      case 'INTERNAL_SERVER_ERROR':
        return 'サーバーエラーが発生しました。時間をおいて再試行してください。';
      case 'NETWORK_ERROR':
        return 'ネットワーク接続エラーが発生しました。インターネット接続を確認してください。';
      default:
        return message || 'エラーが発生しました。';
    }
  };
  
  // エラータイプに基づいてアクションを提示
  const getActionButton = () => {
    switch (code) {
      case 'UNAUTHENTICATED':
      case 'INVALID_TOKEN':
      case 'TOKEN_EXPIRED':
        return (
          <Button onClick={() => navigate('/login')}>
            ログイン
          </Button>
        );
      case 'RATE_LIMITED':
      case 'INTERNAL_SERVER_ERROR':
      case 'NETWORK_ERROR':
        return onRetry && (
          <Button onClick={onRetry}>
            再試行
          </Button>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className={`error-container error-${code.toLowerCase()}`}>
      <div className="error-icon">
        {code === 'NETWORK_ERROR' ? <WifiOffIcon /> : <ErrorIcon />}
      </div>
      <h3 className="error-title">{getErrorMessage()}</h3>
      {Object.keys(invalidArgs).length > 0 && (
        <ul className="error-details">
          {Object.entries(invalidArgs).map(([field, errorMsg]) => (
            <li key={field}>
              <strong>{field}:</strong> {errorMsg}
            </li>
          ))}
        </ul>
      )}
      <div className="error-actions">
        {getActionButton()}
      </div>
    </div>
  );
}
```

### エラー処理フック

```javascript
// カスタムフックでエラー処理をカプセル化
function useErrorHandler() {
  const navigate = useNavigate();
  const { logout, refreshToken } = useAuth();
  const { addToast } = useToasts();
  
  const handleError = useCallback((error, options = {}) => {
    const { silent = false, critical = false } = options;
    const { code, message, invalidArgs } = parseGraphQLError(error);
    
    // エラーをログに記録
    errorLoggingService.logError(error);
    
    // 認証エラーの処理
    if (['UNAUTHENTICATED', 'INVALID_TOKEN', 'TOKEN_EXPIRED'].includes(code)) {
      if (code === 'TOKEN_EXPIRED') {
        // トークン更新を試みる
        refreshToken().catch(() => {
          logout();
          if (!silent) {
            addToast('セッションが切れました。再度ログインしてください。', {
              appearance: 'warning',
              autoDismiss: true
            });
          }
          navigate('/login', { state: { from: window.location.pathname } });
        });
      } else {
        logout();
        if (!silent) {
          addToast('ログインが必要です', { appearance: 'info' });
        }
        navigate('/login', { state: { from: window.location.pathname } });
      }
      return;
    }
    
    // その他のエラーの処理
    if (!silent) {
      if (critical) {
        // 重大なエラーはモーダルで表示
        showErrorModal({
          title: 'エラーが発生しました',
          message,
          code,
          details: invalidArgs
        });
      } else {
        // 通常のエラーはトースト通知
        addToast(message, {
          appearance: 'error',
          autoDismiss: true
        });
      }
    }
    
    // 開発環境での詳細ログ
    if (process.env.NODE_ENV === 'development') {
      console.error('[GraphQL Error]', error);
    }
  }, [navigate, logout, refreshToken, addToast]);
  
  return { handleError };
}
```

### 使用例

```jsx
function SpotCreatePage() {
  const [createSpot, { loading }] = useMutation(CREATE_SPOT_MUTATION);
  const { handleError } = useErrorHandler();
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    
    try {
      const { data } = await createSpot({
        variables: { input: formData }
      });
      
      // 成功時の処理
      navigate(`/spots/${data.createSpot.id}`);
      addToast('スポットを作成しました', { appearance: 'success' });
    } catch (error) {
      // エラー情報を抽出
      const { invalidArgs } = parseGraphQLError(error);
      
      // フォームエラーがある場合はフォームに表示
      if (Object.keys(invalidArgs).length > 0) {
        setFormErrors(invalidArgs);
      } else {
        // その他のエラーは共通ハンドラーで処理
        handleError(error);
      }
    }
  };
  
  return (
    <div className="page-container">
      <h1>新しいスポットを作成</h1>
      
      <form onSubmit={handleSubmit}>
        {/* フォームフィールド */}
        <div className="form-group">
          <label htmlFor="name">スポット名 *</label>
          <input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className={formErrors.name ? 'input-error' : ''}
          />
          {formErrors.name && <div className="error-message">{formErrors.name}</div>}
        </div>
        
        {/* 他のフィールド */}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'スポットを作成'}
        </button>
      </form>
    </div>
  );
}
```

## まとめ

マチポケAPIのエラー処理は、GraphQL仕様に準拠した標準形式で提供されます。適切なエラー処理を実装することで、ユーザーエクスペリエンスを向上させ、開発者がエラーの原因を特定しやすくなります。

エラー処理の実装には以下の点に注意してください：

1. エラーコードに基づいた条件分岐で適切な対応を行う
2. ユーザーに分かりやすいエラーメッセージを表示する
3. 認証エラーでは自動的にトークン更新やログインリダイレクトを行う
4. 入力エラーはフォームフィールドに関連付けて表示する
5. レート制限エラーでは適切なバックオフと再試行を実装する
6. サーバーエラーは開発環境で詳細をログに記録し、本番環境では一般的なメッセージを表示する

これらのベストプラクティスを取り入れることで、エラーに強く、ユーザーフレンドリーなアプリケーションを構築できます。