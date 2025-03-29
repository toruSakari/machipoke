# マチポケ API ページネーションガイド

このドキュメントでは、マチポケGraphQL APIのページネーション機能について詳細に説明します。大量のデータを効率的に取得するための方法と実装例を紹介します。

## 目次

- [ページネーションの概要](#ページネーションの概要)
- [オフセットベースのページネーション](#オフセットベースのページネーション)
- [カーソルベースのページネーション](#カーソルベースのページネーション)
- [ページネーションの実装例](#ページネーションの実装例)
- [無限スクロールの実装](#無限スクロールの実装)
- [パフォーマンスの最適化](#パフォーマンスの最適化)
- [ページネーションのベストプラクティス](#ページネーションのベストプラクティス)

## ページネーションの概要

マチポケAPIでは、大量のデータを効率的に取得するために、主に2種類のページネーション方法を提供しています：

1. **オフセットベースのページネーション**
   - `limit` と `offset` パラメータを使用
   - ページ番号による一般的なページネーション向け
   - 簡単に実装可能だが大量データでのパフォーマンス低下の懸念あり

2. **カーソルベースのページネーション**（一部のエンドポイントのみ）
   - `first/last` と `after/before` パラメータを使用
   - 無限スクロールなどに適している
   - パフォーマンスが良く大量データに適しているが実装がやや複雑

どちらの方法も、GraphQLクエリのパラメータとして指定できます。

## オフセットベースのページネーション

オフセットベースのページネーションは、`limit` と `offset` パラメータを使用して実装されます。

### パラメータ

| パラメータ | 説明 | デフォルト値 | 最大値 |
|-----------|------|------------|-------|
| `limit` | 一度に取得するアイテム数 | エンドポイントにより異なる（通常は10〜20） | 100 |
| `offset` | スキップするアイテム数 | 0 | なし |

### 対応エンドポイント

以下のクエリでオフセットベースのページネーションが利用可能です：

- `spotsByCategory` - カテゴリ別スポット取得
- `searchSpots` - スポット検索
- `comments` - スポットのコメント取得
- `savedLists` - 保存リスト一覧取得

### 使用例

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
    # 他のフィールド...
  }
}
```

変数：

```json
{
  "categoryId": "cat_nature",
  "limit": 10,
  "offset": 0  // 1ページ目
}
```

次のページを取得するには：

```json
{
  "categoryId": "cat_nature",
  "limit": 10,
  "offset": 10  // 2ページ目
}
```

### ページネーションの計算

総アイテム数（総件数）は各クエリの対応するフィールドから取得できます：

```graphql
query GetSpotsByCategoryWithTotal(
  $categoryId: ID!
  $limit: Int
  $offset: Int
) {
  spotsByCategoryConnection(categoryId: $categoryId) {
    totalCount
    spots(limit: $limit, offset: $offset) {
      id
      name
      # 他のフィールド...
    }
  }
}
```

これにより総ページ数を計算できます：

```javascript
const totalPages = Math.ceil(totalCount / limit);
```

## カーソルベースのページネーション

一部のデータ量の多いエンドポイントでは、より効率的なカーソルベースのページネーションも提供しています。

### パラメータ

| パラメータ | 説明 | デフォルト値 |
|-----------|------|------------|
| `first` | 前方から取得するアイテム数 | - |
| `after` | このカーソル以降のアイテムを取得 | - |
| `last` | 後方から取得するアイテム数 | - |
| `before` | このカーソル以前のアイテムを取得 | - |

※`first` と `last` はどちらか一方のみ使用可能

### 対応エンドポイント

以下のクエリでカーソルベースのページネーションが利用可能です：

- `nearbySpots` - 近隣スポット検索

### 使用例

```graphql
query GetNearbySpots(
  $latitude: Float!
  $longitude: Float!
  $radius: Float
  $first: Int
  $after: String
) {
  nearbySpotsConnection(
    latitude: $latitude
    longitude: $longitude
    radius: $radius
  ) {
    edges {
      node {
        id
        name
        description
        # 他のフィールド...
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

変数：

```json
{
  "latitude": 35.6809591,
  "longitude": 139.7673068,
  "radius": 5,
  "first": 10
}
```

次のページを取得するには、前回のレスポンスの `pageInfo.endCursor` を使用します：

```json
{
  "latitude": 35.6809591,
  "longitude": 139.7673068,
  "radius": 5,
  "first": 10,
  "after": "cursor_xxxxx"  // 前回のレスポンスから取得
}
```

### レスポンス形式

カーソルベースのページネーションのレスポンスは以下の構造を持ちます：

```graphql
type Connection {
  edges: [Edge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type Edge {
  node: Node!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

- `edges`: 各アイテムとそのカーソルを含む配列
- `pageInfo`: ページネーション情報
  - `hasNextPage`: 次のページが存在するかどうか
  - `hasPreviousPage`: 前のページが存在するかどうか
  - `startCursor`: 現在のページの最初のアイテムのカーソル
  - `endCursor`: 現在のページの最後のアイテムのカーソル
- `totalCount`: 総アイテム数

## ページネーションの実装例

### React + Apollo Clientでのオフセットベースのページネーション

```jsx
function SpotList({ categoryId }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const { loading, error, data } = useQuery(GET_SPOTS_BY_CATEGORY, {
    variables: {
      categoryId,
      limit: pageSize,
      offset: (currentPage - 1) * pageSize
    }
  });
  
  // 総ページ数を取得
  const { data: totalData } = useQuery(GET_CATEGORY_SPOTS_COUNT, {
    variables: { categoryId }
  });
  
  const totalSpots = totalData?.spotsByCategoryConnection?.totalCount || 0;
  const totalPages = Math.ceil(totalSpots / pageSize);
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // 必要に応じてページトップにスクロール
      window.scrollTo(0, 0);
    }
  };
  
  return (
    <div className="spot-list-container">
      {loading && <LoadingSpinner />}
      
      {error && <ErrorDisplay error={error} />}
      
      {data?.spotsByCategory && (
        <>
          <div className="spots-grid">
            {data.spotsByCategory.map(spot => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

// ページネーションコンポーネント
function Pagination({ currentPage, totalPages, onPageChange }) {
  const renderPageNumbers = () => {
    const pages = [];
    
    // 常に表示するページ番号の範囲を計算
    const rangeStart = Math.max(1, currentPage - 2);
    const rangeEnd = Math.min(totalPages, currentPage + 2);
    
    // 先頭のページ
    if (rangeStart > 1) {
      pages.push(1);
      if (rangeStart > 2) {
        pages.push('...');
      }
    }
    
    // 現在のページの前後
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }
    
    // 最後のページ
    if (rangeEnd < totalPages) {
      if (rangeEnd < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages.map((page, index) => (
      typeof page === 'number' ? (
        <button
          key={index}
          className={page === currentPage ? 'active' : ''}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ) : (
        <span key={index} className="ellipsis">{page}</span>
      )
    ));
  };
  
  return (
    <div className="pagination">
      <button
        className="prev"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        前へ
      </button>
      
      <div className="page-numbers">
        {renderPageNumbers()}
      </div>
      
      <button
        className="next"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        次へ
      </button>
    </div>
  );
}
```

### React + Apollo Clientでのカーソルベースのページネーション

```jsx
function NearbySpotsList({ latitude, longitude, radius }) {
  const [hasMore, setHasMore] = useState(true);
  const [endCursor, setEndCursor] = useState(null);
  const [spots, setSpots] = useState([]);
  
  const { loading, error, fetchMore } = useQuery(GET_NEARBY_SPOTS_CONNECTION, {
    variables: {
      latitude,
      longitude,
      radius,
      first: 10,
      after: null // 最初はnull
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      const connection = data?.nearbySpotsConnection;
      if (connection) {
        setSpots(connection.edges.map(edge => edge.node));
        setHasMore(connection.pageInfo.hasNextPage);
        setEndCursor(connection.pageInfo.endCursor);
      }
    }
  });
  
  const loadMore = () => {
    if (!hasMore || loading) return;
    
    fetchMore({
      variables: {
        after: endCursor
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        
        const connection = fetchMoreResult.nearbySpotsConnection;
        setHasMore(connection.pageInfo.hasNextPage);
        setEndCursor(connection.pageInfo.endCursor);
        
        // 新しいスポットを追加
        const newSpots = connection.edges.map(edge => edge.node);
        setSpots([...spots, ...newSpots]);
        
        return fetchMoreResult;
      }
    });
  };
  
  return (
    <div className="nearby-spots-container">
      <div className="spots-list">
        {spots.map(spot => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </div>
      
      {loading && <LoadingSpinner />}
      
      {error && <ErrorDisplay error={error} />}
      
      {hasMore && !loading && (
        <button
          className="load-more-button"
          onClick={loadMore}
        >
          もっと読み込む
        </button>
      )}
      
      {!hasMore && spots.length > 0 && (
        <div className="end-message">
          すべてのスポットを表示しました
        </div>
      )}
    </div>
  );
}
```

## 無限スクロールの実装

無限スクロール（Infinite Scroll）は、ユーザーがページの下部までスクロールしたときに自動的に次のデータを読み込む UI パターンです。

### React + Intersection Observerを使用した実装例

```jsx
import { useEffect, useRef, useCallback } from 'react';

function InfiniteSpotsList({ categoryId }) {
  const [page, setPage] = useState(0);
  const [spots, setSpots] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;
  
  const { loading, error, data } = useQuery(GET_SPOTS_BY_CATEGORY, {
    variables: {
      categoryId,
      limit: pageSize,
      offset: page * pageSize
    },
    notifyOnNetworkStatusChange: true,
    skip: !hasMore, // データがこれ以上ない場合はスキップ
  });
  
  // 新しいデータが取得されたらスポットリストを更新
  useEffect(() => {
    if (data?.spotsByCategory) {
      if (data.spotsByCategory.length === 0) {
        setHasMore(false);
      } else {
        setSpots(prev => [...prev, ...data.spotsByCategory]);
      }
    }
  }, [data]);
  
  // Intersection Observer用の参照
  const observer = useRef();
  
  // 監視対象の最後の要素
  const lastSpotElementRef = useCallback(node => {
    if (loading) return;
    
    // 前の監視をクリア
    if (observer.current) observer.current.disconnect();
    
    // 新しい監視を設定
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);
  
  return (
    <div className="infinite-spots-list">
      {spots.map((spot, index) => (
        <div
          key={spot.id}
          ref={index === spots.length - 1 ? lastSpotElementRef : null}
        >
          <SpotCard spot={spot} />
        </div>
      ))}
      
      {loading && <LoadingSpinner />}
      
      {error && <ErrorDisplay error={error} />}
      
      {!hasMore && spots.length > 0 && (
        <div className="end-message">
          すべてのスポットを表示しました
        </div>
      )}
    </div>
  );
}
```

### React + React Windowを使用した仮想化リスト

大量のアイテムを扱う場合は、React Windowなどのライブラリを使用して仮想化リストを実装すると、パフォーマンスが向上します。

```jsx
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

function VirtualizedSpotsList({ categoryId }) {
  const [spots, setSpots] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  
  const { loading, error, fetchMore } = useQuery(GET_SPOTS_BY_CATEGORY, {
    variables: {
      categoryId,
      limit: pageSize,
      offset: 0
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      if (data?.spotsByCategoryConnection) {
        setSpots(data.spotsByCategoryConnection.spots);
        setTotalCount(data.spotsByCategoryConnection.totalCount);
        setHasMore(data.spotsByCategoryConnection.spots.length < data.spotsByCategoryConnection.totalCount);
      }
    }
  });
  
  // アイテムがロード済みかどうか
  const isItemLoaded = index => index < spots.length;
  
  // アイテム数 (実際のアイテム数 + 1 か totalCount のいずれか小さい方)
  const itemCount = hasMore ? spots.length + 1 : spots.length;
  
  // アイテムを読み込む
  const loadMoreItems = async (startIndex, stopIndex) => {
    if (loading) return;
    
    try {
      await fetchMore({
        variables: {
          offset: startIndex
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          
          const newSpots = fetchMoreResult.spotsByCategoryConnection.spots;
          const newTotalCount = fetchMoreResult.spotsByCategoryConnection.totalCount;
          
          setSpots(prevSpots => {
            // 重複を避けるために既存のIDを確認
            const existingIds = new Set(prevSpots.map(spot => spot.id));
            const uniqueNewSpots = newSpots.filter(spot => !existingIds.has(spot.id));
            return [...prevSpots, ...uniqueNewSpots];
          });
          
          setTotalCount(newTotalCount);
          setHasMore(spots.length + newSpots.length < newTotalCount);
          
          return fetchMoreResult;
        }
      });
    } catch (error) {
      console.error('Error loading more spots:', error);
    }
  };
  
  // アイテムをレンダリング
  const Row = ({ index, style }) => {
    if (!isItemLoaded(index)) {
      return (
        <div style={style} className="loading-spot-item">
          <LoadingSpinner />
        </div>
      );
    }
    
    const spot = spots[index];
    return (
      <div style={style}>
        <SpotCard spot={spot} />
      </div>
    );
  };
  
  if (error) return <ErrorDisplay error={error} />;
  
  return (
    <div className="virtualized-spots-list">
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadMoreItems}
      >
        {({ onItemsRendered, ref }) => (
          <List
            height={800}  // リストの高さ
            itemCount={itemCount}
            itemSize={200}  // 各アイテムの高さ
            onItemsRendered={onItemsRendered}
            ref={ref}
            width="100%"
          >
            {Row}
          </List>
        )}
      </InfiniteLoader>
    </div>
  );
}
```

## パフォーマンスの最適化

### キャッシュの活用

Apollo Clientのキャッシュを適切に設定することで、ページネーションのパフォーマンスを向上させることができます。

```javascript
// Apollo Clientの設定例
const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          spotsByCategory: {
            // オフセットベースのページネーションの設定
            keyArgs: ['categoryId'],  // キャッシュキーを決定する引数
            merge(existing = [], incoming, { args }) {
              // オフセットに基づいて既存データとマージ
              const { offset = 0 } = args || {};
              const merged = existing ? [...existing] : [];
              
              // オフセット位置に新しいデータを挿入
              for (let i = 0; i < incoming.length; i++) {
                merged[offset + i] = incoming[i];
              }
              
              return merged;
            }
          },
          nearbySpotsConnection: {
            // カーソルベースのページネーションの設定
            keyArgs: ['latitude', 'longitude', 'radius'],
            merge(existing, incoming, { args }) {
              if (!existing) return incoming;
              if (!incoming) return existing;
              
              const { after } = args || {};
              
              // 後続ページの場合は既存エッジに追加
              if (after) {
                return {
                  ...incoming,
                  edges: [...existing.edges, ...incoming.edges]
                };
              }
              
              // 新しいクエリの場合は置き換え
              return incoming;
            }
          }
        }
      }
    }
  })
});
```

### データプリフェッチ

ユーザーが次のページに移動する可能性が高い場合は、そのデータを事前に取得しておくことで体感速度を向上させることができます。

```javascript
// 次のページのデータをプリフェッチする例
function prefetchNextPage(client, categoryId, currentPage, pageSize) {
  const nextPage = currentPage + 1;
  
  client.query({
    query: GET_SPOTS_BY_CATEGORY,
    variables: {
      categoryId,
      limit: pageSize,
      offset: nextPage * pageSize
    },
    fetchPolicy: 'network-only'  // キャッシュをバイパス
  }).catch(err => {
    // プリフェッチのエラーは無視
    console.log('Prefetch error (can be ignored):', err);
  });
}

// 使用例
function PaginatedSpotList({ categoryId }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const client = useApolloClient();
  
  // コンポーネントのマウント時に次のページをプリフェッチ
  useEffect(() => {
    prefetchNextPage(client, categoryId, currentPage, pageSize);
  }, [client, categoryId, currentPage, pageSize]);
  
  // 残りの実装...
}
```

## ページネーションのベストプラクティス

### 1. 適切なページネーション方法の選択

- **シンプルなページナビゲーションが必要な場合** → オフセットベースのページネーション
- **無限スクロールや大量データを扱う場合** → カーソルベースのページネーション

### 2. ページサイズの最適化

- 一般的なリスト表示では 10〜20 アイテムが適切
- モバイルデバイスではより少ないアイテム数を検討
- 画像を多く含むリストでは特にページサイズに注意

### 3. ローディング状態の表示

- 次のページを読み込む際には、明確なローディングインジケータを表示
- 無限スクロールではスケルトンローダーを使用すると効果的

```jsx
function SkeletonLoader() {
  return (
    <div className="skeleton-loader">
      {Array(3).fill().map((_, i) => (
        <div key={i} className="skeleton-spot-card">
          <div className="skeleton-image" />
          <div className="skeleton-content">
            <div className="skeleton-title" />
            <div className="skeleton-text" />
            <div className="skeleton-text" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 4. エラー処理

- ページネーション中のエラーを適切に処理
- 再試行機能を提供

```jsx
function PaginationErrorHandler({ error, onRetry }) {
  return (
    <div className="pagination-error">
      <p>データの読み込み中にエラーが発生しました</p>
      <button onClick={onRetry}>再読み込み</button>
    </div>
  );
}
```

### 5. デバウンスとスロットリング

無限スクロールではスクロールイベントの処理を最適化：

```javascript
// スクロールイベントのデバウンス
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 使用例
const debouncedHandleScroll = debounce(() => {
  // スクロール位置を確認して読み込み処理を実行
  checkScrollPosition();
}, 200);

window.addEventListener('scroll', debouncedHandleScroll);
```

### 6. リソースの解放

不要なページネーション関連リソースを解放：

```jsx
useEffect(() => {
  // スクロールイベントリスナーを設定
  window.addEventListener('scroll', handleScroll);
  
  return () => {
    // コンポーネントのアンマウント時にイベントリスナーを解除
    window.removeEventListener('scroll', handleScroll);
    
    // Intersection Observerを解除
    if (observer.current) {
      observer.current.disconnect();
    }
  };
}, [handleScroll]);
```

### 7. アクセシビリティの考慮

ページネーションコントロールは適切なアクセシビリティを確保すべきです：

```jsx
function AccessiblePagination({ currentPage, totalPages, onPageChange }) {
  return (
    <nav aria-label="ページネーション">
      <ul className="pagination">
        <li>
          <button
            aria-label="前のページ"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            前へ
          </button>
        </li>
        
        {/* ページ番号 */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <li key={page}>
            <button
              aria-label={`${page}ページ目`}
              aria-current={page === currentPage ? 'page' : undefined}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </li>
        ))}
        
        <li>
          <button
            aria-label="次のページ"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            次へ
          </button>
        </li>
      </ul>
    </nav>
  );
}
```

## まとめ

マチポケAPIのページネーション機能を適切に活用することで、大量のデータを扱うアプリケーションでもスムーズなユーザーエクスペリエンスを実現できます。オフセットベースのページネーションはシンプルな実装で十分な場合に、カーソルベースのページネーションは大量データや無限スクロールに適しています。

パフォーマンスを最適化するためにキャッシュの設定、データプリフェッチ、仮想化リストの導入を検討し、良いユーザーエクスペリエンスを実現するために適切なローディング表示、エラー処理、アクセシビリティ対応を行いましょう。