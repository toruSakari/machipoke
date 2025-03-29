# マチポケ API レート制限ガイド

このドキュメントでは、マチポケ GraphQL API のレート制限について説明します。API の安定性とパフォーマンスを確保するために実装されているレート制限の仕組み、制限値、そしてレート制限に達した場合の対処法について詳細に解説します。

## 目次

- [レート制限の概要](#レート制限の概要)
- [レート制限の値](#レート制限の値)
- [レート制限のヘッダー](#レート制限のヘッダー)
- [レート制限のエラーレスポンス](#レート制限のエラーレスポンス)
- [レート制限への対処法](#レート制限への対処法)
- [バックオフ戦略](#バックオフ戦略)
- [効率的なAPI利用](#効率的なapi利用)
- [実装例](#実装例)

## レート制限の概要

マチポケ API では、サービスの安定性を確保し、すべてのユーザーに公平なアクセスを提供するために、リクエスト数に基づくレート制限を実装しています。この制限はリクエスト送信元の IP アドレスとユーザー認証情報に基づいて適用されます。

レート制限は以下の目的で実装されています：

- サービスの安定性とパフォーマンスの維持
- 悪意のある大量リクエスト（DoS攻撃など）からの保護
- 公平なリソース配分の確保
- クライアントアプリケーションの最適化の促進

## レート制限の値

マチポケ API のレート制限は、ユーザーの認証状態によって異なります：

| ユーザー種別 | 制限値 | 期間 | 備考 |
|------------|------|------|------|
| 未認証ユーザー | 30 | 1分あたり | IP アドレスベース |
| 認証済みユーザー | 60 | 1分あたり | ユーザー ID + IP アドレスベース |
| コントリビューター | 120 | 1分あたり | 信頼スコアが高いユーザー |
| モデレーター/管理者 | 240 | 1分あたり | 特権ユーザー |

制限値は API エンドポイントによって異なる場合があります：

| エンドポイント | 制限値の倍率 | 備考 |
|--------------|-----------|------|
| クエリ操作 | 1x | 通常の制限が適用 |
| ミューテーション操作 | 1x | 通常の制限が適用 |
| スポット検索 | 1.5x | やや高めの制限 |
| 近隣スポット検索 | 1.5x | 位置検索は頻度が高いため |
| 画像アップロード | 0.5x | より厳しい制限 |
| 認証関連 | 0.2x | 非常に厳しい制限（ブルートフォース防止） |

例：認証済みユーザーがスポット検索を行う場合、1分あたり 60 x 1.5 = 90 リクエストまで可能です。

## レート制限のヘッダー

API レスポンスには、現在のレート制限状態を示す以下のヘッダーが含まれています：

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1614556800
```

- `X-RateLimit-Limit`: 期間内（通常は1分間）に許可されるリクエストの最大数
- `X-RateLimit-Remaining`: 現在の期間内に残っているリクエスト数
- `X-RateLimit-Reset`: レート制限カウンタがリセットされる時刻（Unix タイムスタンプ）

これらのヘッダーを監視することで、アプリケーションがレート制限に達する前に対策を講じることができます。

## レート制限のエラーレスポンス

レート制限に達した場合、API は HTTP ステータスコード `429 Too Many Requests` と以下のような GraphQL エラーレスポンスを返します：

```json
{
  "errors": [
    {
      "message": "リクエスト数が制限を超えました。時間をおいて実行してください。",
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

このエラーレスポンスには、以下の情報が含まれています：

- `message`: ユーザーフレンドリーなエラーメッセージ
- `extensions.code`: エラーコード（RATE_LIMITED）
- `extensions.http.status`: HTTP ステータスコード（429）
- `extensions.retryAfter`: 再試行までの推奨待機時間（秒）

また、レスポンスヘッダーには以下の情報も含まれます：

```
Retry-After: 60
```

この値は、クライアントが再試行するまで待つべき秒数を示しています。

## レート制限への対処法

レート制限に対処するための一般的な方法をいくつか紹介します：

### 1. リクエストの最適化

- 必要なデータのみを取得（GraphQL のメリットを活かす）
- バッチ処理を活用
- キャッシュの積極的な利用
- ポーリングの頻度を下げる

### 2. レート制限のモニタリング

- レスポンスヘッダーの `X-RateLimit-*` を監視
- 残りリクエスト数が少なくなったら、非重要なリクエストを遅延
- リセット時刻に基づいてリクエストをスケジューリング

### 3. バックオフ戦略の実装

- レート制限エラーを受け取った場合は、指定された時間だけ待機
- 再試行間隔を指数関数的に増加させる（指数バックオフ）
- 最大再試行回数を設定

### 4. ユーザーエクスペリエンスの改善

- レート制限到達時にユーザーに通知
- オフラインモードやキャッシュデータの活用
- 重要な操作を優先

## バックオフ戦略

レート制限エラーを受け取った場合の一般的なバックオフ戦略は以下の通りです：

### 基本的な待機戦略

```javascript
// 指定された秒数だけ待機する関数
function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function handleRateLimitedRequest(apiCall) {
  try {
    return await apiCall();
  } catch (error) {
    if (error.extensions?.code === 'RATE_LIMITED') {
      const retryAfter = error.extensions.retryAfter || 60;
      console.log(`レート制限に達しました。${retryAfter}秒後に再試行します...`);
      
      // 指定された時間だけ待機
      await sleep(retryAfter);
      
      // リクエストを再試行
      return apiCall();
    }
    
    // その他のエラーは再スロー
    throw error;
  }
}
```

### 指数バックオフ戦略

```javascript
async function exponentialBackoff(apiCall, maxRetries = 5) {
  let retries = 0;
  let delay = 1; // 初期遅延（秒）
  
  while (true) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.extensions?.code === 'RATE_LIMITED') {
        if (retries >= maxRetries) {
          throw new Error(`最大再試行回数（${maxRetries}回）に達しました`);
        }
        
        // Retry-After ヘッダーまたは extensions.retryAfter を取得
        const retryAfter = error.extensions.retryAfter || 60;
        
        // 指数バックオフ（カスタム遅延と Retry-After の大きい方を使用）
        const backoffDelay = Math.max(delay, retryAfter);
        console.log(`レート制限エラー: ${backoffDelay}秒後に再試行します (${retries + 1}/${maxRetries})...`);
        
        await sleep(backoffDelay);
        
        // 次回の遅延を2倍に（指数バックオフ）
        delay *= 2;
        retries++;
        continue;
      }
      
      // その他のエラーは再スロー
      throw error;
    }
  }
}
```

### ジッター付き指数バックオフ

複数のクライアントが同時にバックオフするのを避けるため、ランダムな「ジッター」を追加すると効果的です：

```javascript
async function exponentialBackoffWithJitter(apiCall, maxRetries = 5) {
  let retries = 0;
  let baseDelay = 1; // 初期遅延（秒）
  
  while (true) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.extensions?.code === 'RATE_LIMITED') {
        if (retries >= maxRetries) {
          throw new Error(`最大再試行回数（${maxRetries}回）に達しました`);
        }
        
        // 指数バックオフとジッターの計算
        const delay = baseDelay * (1 + Math.random() * 0.5); // 0.5のジッター（±50%）
        console.log(`レート制限エラー: ${delay.toFixed(1)}秒後に再試行します (${retries + 1}/${maxRetries})...`);
        
        await sleep(delay);
        
        // 次回の遅延を2倍に（指数バックオフ）
        baseDelay *= 2;
        retries++;
        continue;
      }
      
      // その他のエラーは再スロー
      throw error;
    }
  }
}
```

## 効率的なAPI利用

レート制限に到達しないようにするための効率的なAPI利用方法をいくつか紹介します：

### 1. GraphQLクエリの最適化

必要なフィールドのみをリクエストすることで、データ転送を効率化します：

```graphql
# 良くない例：すべてのフィールドをリクエスト
query {
  spot(id: "spot_id") {
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
      description
      iconName
    }
    createdBy {
      id
      name
      email
      avatarUrl
      bio
      location
      expertAreas
      trustScore
    }
    images {
      id
      imageUrl
      caption
      isPrimary
    }
    comments {
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
    createdAt
    updatedAt
  }
}

# 良い例：必要なフィールドのみをリクエスト
query {
  spot(id: "spot_id") {
    id
    name
    description
    images(limit: 1) {
      imageUrl
    }
    category {
      name
    }
  }
}
```

### 2. バッチ操作の利用

複数の関連リクエストを1つのクエリにまとめることで、全体のリクエスト数を削減します：

```graphql
# 悪い例：個別のクエリを複数回実行
query GetSpot1 {
  spot(id: "spot_id1") { ... }
}

query GetSpot2 {
  spot(id: "spot_id2") { ... }
}

# 良い例：一度のクエリで複数のスポットを取得
query GetMultipleSpots {
  spot1: spot(id: "spot_id1") { ... }
  spot2: spot(id: "spot_id2") { ... }
}
```

### 3. ページネーションの最適化

一度に適切な量のデータを取得し、必要に応じて追加データを読み込みます：

```graphql
# 最適化されたページネーション
query GetSpotsByCategory($categoryId: ID!, $limit: Int!, $offset: Int!) {
  spotsByCategory(categoryId: $categoryId, limit: $limit, offset: $offset) {
    id
    name
    # 他の必要なフィールド...
  }
}
```

詳細については[ページネーションガイド](./pagination.md)を参照してください。

### 4. クライアントサイドキャッシュ

Apollo Client などのライブラリを使用して、効率的なクライアントサイドキャッシュを実装します：

```javascript
// Apollo Client の設定例
const client = new ApolloClient({
  uri: 'https://api.machipoke.app/graphql',
  cache: new InMemoryCache({
    typePolicies: {
      // キャッシュ設定...
    }
  }),
});
```

## 実装例

### React + Apollo Client での実装例

以下はレート制限を考慮したAPI呼び出しを実装する例です：

```jsx
import { useState, useEffect } from 'react';
import { useQuery, ApolloError } from '@apollo/client';
import { SEARCH_SPOTS_QUERY } from '../graphql/queries';

function SpotSearch({ query }) {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const [retryTimeoutId, setRetryTimeoutId] = useState(null);
  
  // 検索クエリを実行
  const { loading, error, data, refetch } = useQuery(SEARCH_SPOTS_QUERY, {
    variables: { query },
    // エラーポリシー（キャッシュからのデータを返し、バックグラウンドで再取得）
    errorPolicy: 'all',
    // エラーハンドリング
    onError: (error) => handleSearchError(error)
  });
  
  // レート制限エラーの処理
  const handleSearchError = (error) => {
    if (error instanceof ApolloError) {
      const graphQLError = error.graphQLErrors[0];
      if (graphQLError?.extensions?.code === 'RATE_LIMITED') {
        // レート制限エラーを処理
        const retrySeconds = graphQLError.extensions.retryAfter || 60;
        setIsRateLimited(true);
        setRetryAfter(retrySeconds);
        
        // 指定時間後に自動的に再試行
        const timeoutId = setTimeout(() => {
          setIsRateLimited(false);
          refetch();
        }, retrySeconds * 1000);
        
        setRetryTimeoutId(timeoutId);
      }
    }
  };
  
  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
      }
    };
  }, [retryTimeoutId]);
  
  // カウントダウンタイマーの状態
  const [countdown, setCountdown] = useState(0);
  
  // カウントダウンの更新
  useEffect(() => {
    if (isRateLimited && retryAfter > 0) {
      setCountdown(retryAfter);
      
      const intervalId = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            clearInterval(intervalId);
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [isRateLimited, retryAfter]);
  
  // 手動での再試行
  const handleManualRetry = () => {
    if (retryTimeoutId) {
      clearTimeout(retryTimeoutId);
      setRetryTimeoutId(null);
    }
    
    setIsRateLimited(false);
    refetch();
  };
  
  // レート制限メッセージの表示
  if (isRateLimited) {
    return (
      <div className="rate-limit-message">
        <h3>リクエスト制限に達しました</h3>
        <p>短時間に多くのリクエストが行われました。</p>
        <p>{countdown > 0 ? `${countdown}秒後に自動的に再試行します` : '再試行します...'}</p>
        {countdown > 0 && (
          <button onClick={handleManualRetry}>
            今すぐ再試行
          </button>
        )}
      </div>
    );
  }
  
  // 通常の検索結果表示
  return (
    <div className="search-results">
      {loading && <div className="loading-spinner">読み込み中...</div>}
      
      {error && !isRateLimited && (
        <div className="error-message">
          検索中にエラーが発生しました: {error.message}
        </div>
      )}
      
      {data?.searchSpots && (
        <div className="spots-list">
          {data.searchSpots.map(spot => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
          
          {data.searchSpots.length === 0 && (
            <p>検索結果が見つかりませんでした</p>
          )}
        </div>
      )}
    </div>
  );
}
```

### レート制限監視ユーティリティ

API リクエストごとにレート制限ヘッダーを監視し、制限に近づいた場合に警告するユーティリティの例：

```javascript
// レート制限監視クラス
class RateLimitMonitor {
  constructor() {
    this.limits = {};
    this.warningThreshold = 0.2; // 残り20%で警告
    this.callbacks = {
      onWarning: null,
      onLimited: null,
      onReset: null
    };
  }
  
  // コールバックの設定
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
    return this;
  }
  
  // ヘッダーの解析
  parseHeaders(headers) {
    const endpoint = headers.get('X-Rate-Limit-Endpoint') || 'default';
    const limit = parseInt(headers.get('X-RateLimit-Limit'), 10);
    const remaining = parseInt(headers.get('X-RateLimit-Remaining'), 10);
    const reset = parseInt(headers.get('X-RateLimit-Reset'), 10);
    
    if (isNaN(limit) || isNaN(remaining) || isNaN(reset)) {
      return;
    }
    
    const previousRemaining = this.limits[endpoint]?.remaining;
    this.limits[endpoint] = { limit, remaining, reset };
    
    // 残りリクエスト数のチェック
    const remainingPercentage = remaining / limit;
    
    // 警告スレッショルドを下回った場合
    if (remainingPercentage <= this.warningThreshold && 
        (previousRemaining === undefined || remaining < previousRemaining)) {
      this.triggerWarning(endpoint, remaining, limit, reset);
    }
    
    // リセット時間の監視（リセットタイマーの設定）
    this.setResetTimer(endpoint, reset);
    
    return { limit, remaining, reset };
  }
  
  // 警告の発火
  triggerWarning(endpoint, remaining, limit, reset) {
    if (this.callbacks.onWarning) {
      const resetDate = new Date(reset * 1000);
      const resetIn = Math.max(0, Math.floor((resetDate - new Date()) / 1000));
      
      this.callbacks.onWarning({
        endpoint,
        remaining,
        limit,
        resetIn,
        resetTime: resetDate
      });
    }
  }
  
  // リセットタイマーの設定
  setResetTimer(endpoint, reset) {
    const now = Math.floor(Date.now() / 1000);
    const timeUntilReset = Math.max(1, reset - now);
    
    // 既存のタイマーをクリア
    if (this.limits[endpoint].resetTimer) {
      clearTimeout(this.limits[endpoint].resetTimer);
    }
    
    // リセット時のタイマーを設定
    this.limits[endpoint].resetTimer = setTimeout(() => {
      if (this.callbacks.onReset) {
        this.callbacks.onReset({
          endpoint,
          limit: this.limits[endpoint].limit
        });
      }
    }, timeUntilReset * 1000);
  }
  
  // 現在のレート制限状態の取得
  getCurrentLimits() {
    return { ...this.limits };
  }
  
  // レート制限に達しているかチェック
  isLimited(endpoint = 'default') {
    return this.limits[endpoint]?.remaining === 0;
  }
  
  // レート制限に近づいているかチェック
  isNearLimit(endpoint = 'default', threshold = null) {
    const t = threshold || this.warningThreshold;
    const info = this.limits[endpoint];
    
    if (!info) return false;
    
    return info.remaining / info.limit <= t;
  }
}

// 使用例
const rateLimitMonitor = new RateLimitMonitor()
  .setCallbacks({
    onWarning: (info) => {
      console.warn(`レート制限に近づいています: 残り ${info.remaining}/${info.limit} (${info.resetIn}秒後にリセット)`);
    },
    onReset: (info) => {
      console.info(`レート制限がリセットされました: ${info.endpoint}`);
    }
  });

// Apollo Client リンクで使用
const rateMonitorLink = new ApolloLink((operation, forward) => {
  return forward(operation).map(response => {
    const context = operation.getContext();
    
    // レスポンスヘッダーを解析
    if (context.response && context.response.headers) {
      rateLimitMonitor.parseHeaders(context.response.headers);
    }
    
    return response;
  });
});
```

## まとめ

マチポケ API のレート制限を理解し、適切に対処することで、アプリケーションの安定性とユーザーエクスペリエンスを向上させることができます。主なポイントは以下の通りです：

1. レート制限はユーザー種別とエンドポイントによって異なります
2. レスポンスヘッダーを監視して、制限に近づいたら対策を講じましょう
3. レート制限エラーが発生した場合は、適切なバックオフ戦略を実装しましょう
4. GraphQL クエリの最適化、バッチ処理、キャッシュなどを活用して、効率的に API を利用しましょう
5. ユーザーに対して適切なフィードバックを提供し、レート制限がアプリケーションの使用感に影響しないようにしましょう

これらの方法を実践することで、マチポケ API を最大限に活用できるようになります。