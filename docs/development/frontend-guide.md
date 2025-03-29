# マチポケ フロントエンド開発ガイド

このドキュメントでは、マチポケプロジェクトのフロントエンド開発に関するガイドラインと技術情報を提供します。

## 技術スタック

- **フレームワーク**: React 18+
- **ルーティング**: React Router v7
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS + shadcn/ui
- **状態管理**: React Context + React Query
- **言語**: TypeScript
- **テスト**: Vitest + React Testing Library
- **マップ表示**: Mapbox または Leaflet
- **その他**:
  - SSRの有効化
  - PWA対応

## プロジェクト構造

```
packages/client/
├── public/             # 静的ファイル
├── src/
│   ├── assets/         # 画像・フォントなどの静的リソース
│   ├── components/     # 再利用可能なUIコンポーネント
│   │   ├── ui/         # shadcn/uiコンポーネント
│   │   └── common/     # 汎用コンポーネント
│   ├── hooks/          # カスタムフック
│   ├── layouts/        # レイアウトコンポーネント
│   ├── lib/            # ユーティリティ関数
│   ├── routes/         # ルーティング設定とページコンポーネント
│   ├── server/         # SSR関連コード
│   ├── store/          # 状態管理
│   ├── styles/         # グローバルスタイル
│   ├── types/          # 型定義
│   ├── graphql/        # GraphQL関連（クエリ、ミューテーション）
│   ├── entry-client.tsx # クライアントエントリーポイント
│   └── entry-server.tsx # サーバーエントリーポイント
```

## 開発の始め方

### 環境のセットアップ

```bash
cd packages/client
npm install
npm run dev
```

開発サーバーが起動し、通常 `http://localhost:3000` でアクセスできます。

### 主要なコマンド

```bash
# 開発サーバーの起動
npm run dev

# 本番用ビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# テストの実行
npm test

# リントの実行
npm run lint

# 型チェック
npm run typecheck
```

## コンポーネント開発

### コンポーネントの作成

新しいコンポーネントを作成する際のベストプラクティス：

1. コンポーネントディレクトリに適切な場所を選ぶ
2. 型付きpropsインターフェースを定義する
3. 関数コンポーネントを作成する
4. 必要に応じてスタイルを適用する
5. テストを作成する

**例**:

```tsx
// components/spots/SpotCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spot } from '@/types/spot';

interface SpotCardProps {
  spot: Spot;
  onClick?: (spotId: string) => void;
  className?: string;
}

export const SpotCard: React.FC<SpotCardProps> = ({ 
  spot, 
  onClick,
  className = ''
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(spot.id);
    }
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{spot.name}</CardTitle>
        <div className="flex gap-1 mt-1">
          {spot.categories.map(category => (
            <Badge key={category.id} variant="outline">
              {category.name}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{spot.description}</p>
      </CardContent>
    </Card>
  );
};
```

### shadcn/uiコンポーネントの追加

プロジェクトではshadcn/uiコンポーネントライブラリを使用しています：

```bash
# 新しいshadcn/uiコンポーネントを追加
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
# など
```

追加したコンポーネントは `components/ui` ディレクトリに配置されます。

## ルーティング

React Router v7を使用したルーティング設定：

```tsx
// src/routes/index.tsx
import { createBrowserRouter, createMemoryRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { HomePage } from './home/page';
import { SpotDetailPage } from './spot/[id]/page';
import { MapView } from './map/page';
import { ProfilePage } from './profile/page';
import { NotFoundPage } from './not-found';

const routes = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'spots/:id',
        element: <SpotDetailPage />,
      },
      {
        path: 'map',
        element: <MapView />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

// クライアントサイドレンダリング用
export const createRouter = (options = {}) => {
  return createBrowserRouter(routes, options);
};

// SSR用
export const createServerRouter = (options = {}) => {
  return createMemoryRouter(routes, options);
};
```

## データフェッチング

GraphQLを使用したデータフェッチング：

```tsx
// src/graphql/queries/getSpot.ts
import { gql } from 'graphql-request';
import { Spot } from '@/types/spot';

export const GET_SPOT = gql`
  query GetSpot($id: ID!) {
    spot(id: $id) {
      id
      name
      description
      latitude
      longitude
      categories {
        id
        name
      }
      images {
        id
        url
      }
      createdBy {
        id
        username
      }
    }
  }
`;

export interface GetSpotResponse {
  spot: Spot;
}

export interface GetSpotVariables {
  id: string;
}
```

React Queryを使用したデータフェッチング：

```tsx
// src/hooks/useSpot.ts
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_SPOT, GetSpotResponse, GetSpotVariables } from '@/graphql/queries/getSpot';

export const useSpot = (id: string) => {
  return useQuery<GetSpotResponse, Error>({
    queryKey: ['spot', id],
    queryFn: async () => {
      return await graphqlClient.request<GetSpotResponse, GetSpotVariables>(
        GET_SPOT,
        { id }
      );
    },
    enabled: !!id,
  });
};
```

コンポーネントでの使用：

```tsx
// src/routes/spot/[id]/page.tsx
import { useParams } from 'react-router-dom';
import { useSpot } from '@/hooks/useSpot';
import { SpotDetail } from '@/components/spots/SpotDetail';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const SpotDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useSpot(id || '');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return <ErrorMessage message="スポット情報の取得に失敗しました" />;
  }

  return <SpotDetail spot={data.spot} />;
};
```

## 地図機能の実装

Mapboxを使用した地図表示の実装：

```tsx
// src/components/map/SpotMap.tsx
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Spot } from '@/types/spot';

interface SpotMapProps {
  spots: Spot[];
  center?: [number, number];
  zoom?: number;
  onSpotClick?: (spotId: string) => void;
}

export const SpotMap: React.FC<SpotMapProps> = ({
  spots,
  center = [139.7671, 35.6812], // 東京駅をデフォルトの中心に
  zoom = 12,
  onSpotClick,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // 地図の初期化
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center,
      zoom,
    });

    const mapInstance = map.current;

    // クリーンアップ
    return () => {
      mapInstance.remove();
    };
  }, []);

  // スポットマーカーの追加
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    // 既存のマーカーを削除
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    // 新しいマーカーを追加
    spots.forEach(spot => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = 'url(/marker.png)';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundSize = '100%';
      el.style.cursor = 'pointer';

      // マーカークリック時のイベント
      el.addEventListener('click', () => {
        if (onSpotClick) {
          onSpotClick(spot.id);
        }
      });

      new mapboxgl.Marker(el)
        .setLngLat([spot.longitude, spot.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h3>${spot.name}</h3><p>${spot.description}</p>`
          )
        )
        .addTo(mapInstance);
    });
  }, [spots, onSpotClick]);

  return <div ref={mapContainer} className="w-full h-full min-h-[400px]" />;
};
```

## フォーム処理

React Hook Formを使用したフォーム実装：

```tsx
// src/components/spots/SpotForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MapSelector } from '@/components/map/MapSelector';

// バリデーションスキーマ
const spotSchema = z.object({
  name: z.string().min(2, '名前は2文字以上で入力してください'),
  description: z.string().min(10, '説明は10文字以上で入力してください'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  categoryIds: z.array(z.string()).min(1, '少なくとも1つのカテゴリを選択してください'),
});

type SpotFormValues = z.infer<typeof spotSchema>;

interface SpotFormProps {
  onSubmit: (data: SpotFormValues) => void;
  initialData?: Partial<SpotFormValues>;
  isSubmitting?: boolean;
}

export const SpotForm: React.FC<SpotFormProps> = ({
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const form = useForm<SpotFormValues>({
    resolver: zodResolver(spotSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      latitude: initialData?.latitude || 35.6812,
      longitude: initialData?.longitude || 139.7671,
      categoryIds: initialData?.categoryIds || [],
    },
  });

  const handleLocationSelect = (lat: number, lng: number) => {
    form.setValue('latitude', lat);
    form.setValue('longitude', lng);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>スポット名</FormLabel>
              <FormControl>
                <Input placeholder="スポット名を入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>説明</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="スポットの説明を入力"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>位置情報</FormLabel>
          <MapSelector
            initialLat={form.watch('latitude')}
            initialLng={form.watch('longitude')}
            onLocationSelect={handleLocationSelect}
          />
        </div>

        {/* カテゴリー選択フォームは省略 */}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '保存中...' : '保存する'}
        </Button>
      </form>
    </Form>
  );
};
```

## SSR設定

Viteを使用したSSR設定：

```tsx
// src/entry-server.tsx
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { createServerRouter } from '@/routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StaticRouter } from 'react-router-dom/server';
import { createContext } from './context';

export function render(url: string, context: any) {
  const router = createServerRouter({
    initialEntries: [url],
  });
  
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });

  const appContext = createContext({
    isSSR: true,
    // その他のSSR特有のコンテキスト
  });

  const html = ReactDOMServer.renderToString(
    <QueryClientProvider client={queryClient}>
      <appContext.Provider>
        <StaticRouter location={url}>
          <RouterProvider router={router} />
        </StaticRouter>
      </appContext.Provider>
    </QueryClientProvider>
  );

  // プリロードされたクエリデータをクライアントに渡す
  const dehydratedState = dehydrate(queryClient);

  return {
    html,
    context,
    dehydratedState,
  };
}
```

## PWA対応

Vite PWA Pluginを使用したPWA対応：

```js
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'マチポケ',
        short_name: 'マチポケ',
        description: '地元の人だけが知る場所を共有するプラットフォーム',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // キャッシュ戦略
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mapbox-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30日
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/assets\.machipoke\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7日
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

## テスト

Vitestを使用したテスト設定：

```tsx
// src/components/spots/SpotCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpotCard } from './SpotCard';

describe('SpotCard', () => {
  const mockSpot = {
    id: '1',
    name: 'テストスポット',
    description: 'これはテストスポットです',
    latitude: 35.6812,
    longitude: 139.7671,
    categories: [
      { id: 'cat1', name: 'カフェ' },
      { id: 'cat2', name: '穴場' },
    ],
  };

  it('スポット情報が正しく表示されること', () => {
    render(<SpotCard spot={mockSpot} />);
    
    expect(screen.getByText('テストスポット')).toBeInTheDocument();
    expect(screen.getByText('これはテストスポットです')).toBeInTheDocument();
    expect(screen.getByText('カフェ')).toBeInTheDocument();
    expect(screen.getByText('穴場')).toBeInTheDocument();
  });

  it('クリック時にコールバックが呼ばれること', () => {
    const handleClick = vi.fn();
    render(<SpotCard spot={mockSpot} onClick={handleClick} />);
    
    const card = screen.getByText('テストスポット').closest('.card');
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledWith('1');
  });
});
```

## パフォーマンス最適化

### メモ化

```tsx
// src/components/spots/SpotList.tsx
import React, { useMemo } from 'react';
import { SpotCard } from './SpotCard';
import { Spot } from '@/types/spot';

interface SpotListProps {
  spots: Spot[];
  onSpotClick: (spotId: string) => void;
}

export const SpotList: React.FC<SpotListProps> = React.memo(({ spots, onSpotClick }) => {
  // 重い計算などがある場合はuseMemoを使用
  const sortedSpots = useMemo(() => {
    return [...spots].sort((a, b) => a.name.localeCompare(b.name));
  }, [spots]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedSpots.map(spot => (
        <SpotCard
          key={spot.id}
          spot={spot}
          onClick={onSpotClick}
        />
      ))}
    </div>
  );
});
```

### 画像最適化

```tsx
// src/components/common/OptimizedImage.tsx
import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
}) => {
  // Cloudflareのサイズ変更パラメータを追加
  const optimizedSrc = src.includes('?')
    ? `${src}&width=${width || 800}`
    : `${src}?width=${width || 800}`;

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      className={className}
    />
  );
};
```

## ベストプラクティス

1. **コンポーネントの分割**: 一つのコンポーネントの責務を明確にし、小さく保つ
2. **型安全性**: TypeScriptの型を活用し、型エラーを早期に発見する
3. **命名の一貫性**: 命名規則を一貫して適用する
4. **パフォーマンス**: 不要な再レンダリングを防ぐためにメモ化を活用する
5. **テスト**: 重要なコンポーネントにはテストを書く
6. **アクセシビリティ**: 適切なセマンティックHTML要素とaria属性を使用する
7. **レスポンシブデザイン**: モバイルファーストのアプローチを採用する
8. **エラー処理**: フォールバックUIとエラー境界を適切に設定する

## 参考リンク

- [React 公式ドキュメント](https://reactjs.org/)
- [Vite 公式ドキュメント](https://vitejs.dev/)
- [React Router v7 ドキュメント](https://reactrouter.com/docs/en/v7)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)
- [shadcn/ui コンポーネント](https://ui.shadcn.com/)
- [React Query ドキュメント](https://tanstack.com/query/latest)
- [Vitest ドキュメント](https://vitest.dev/)
- [Mapbox GL JS ドキュメント](https://docs.mapbox.com/mapbox-gl-js/api/)
