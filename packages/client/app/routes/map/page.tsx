import { Suspense } from 'react';
import { ClientOnly } from '@/lib/client-only';
import { Search, Filter, MapPin } from 'lucide-react';

// サーバーサイドレンダリング用の仮コンポーネント
const MapLoading = () => (
  <div className="flex h-[calc(100vh-64px)] flex-col md:flex-row">
    <div className="w-full border-b p-4 md:w-80 md:border-b-0 md:border-r">
      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded bg-gray-200"></div>
        <div className="space-y-2">
          <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-6 w-full animate-pulse rounded bg-gray-200"></div>
            <div className="h-6 w-full animate-pulse rounded bg-gray-200"></div>
            <div className="h-6 w-full animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200"></div>
        <div className="space-y-2">
          <div className="h-24 w-full animate-pulse rounded bg-gray-200"></div>
          <div className="h-24 w-full animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
    <div className="flex-1 bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <MapPin className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-4 text-gray-500">地図を読み込み中...</p>
      </div>
    </div>
  </div>
);

const MapViewLazy = () => {
  const MapView = React.lazy(() => import('@/features/map/MapView'));
  return (
    <Suspense fallback={<MapLoading />}>
      <MapView />
    </Suspense>
  );
};

export default function MapPage() {
  return <MapViewLazy />;
}

// React を明示的にインポート
import React from 'react';
