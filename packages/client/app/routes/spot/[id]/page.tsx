import { useParams, Link } from 'react-router';
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  MessageCircle,
  Bookmark,
  Share2,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { lazy, Suspense, useState } from 'react';
import type { Spot } from '~/types/spot';

const SpotMap = lazy(() => import('@/components/maps/SpotMap'));

export function SpotMapView({
  spot,
}: {
  spot: Spot;
}) {
  return (
    <Suspense
      fallback={
        <div className="h-[300px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-gray-500">地図を読み込み中...</p>
        </div>
      }
    >
      <SpotMap position={[spot.latitude, spot.longitude]} name={spot.name} />
    </Suspense>
  );
}

export default function SpotDetailPage({
  spot,
}: {
  spot: Spot;
}) {
  const { id } = useParams<{ id: string }>();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4 flex items-center p-0">
          <Link to="/spots">
            <ArrowLeft className="mr-2 h-4 w-4" />
            スポット一覧に戻る
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{spot.name}</h1>
            <div className="mt-2 flex items-center text-gray-500">
              <MapPin className="mr-1 h-4 w-4" />
              <span>{spot.address}</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" className="flex items-center">
              <Bookmark className="mr-2 h-4 w-4" />
              保存
            </Button>
            <Button variant="outline" className="flex items-center">
              <Share2 className="mr-2 h-4 w-4" />
              共有
            </Button>
          </div>
        </div>
      </div>

      {/* 画像ギャラリー */}
      <div className="mb-8 overflow-hidden rounded-lg">
        <div className="relative h-[400px] w-full">
          <img
            src={spot.images?.[activeImageIndex]}
            alt={spot.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="mt-2 flex space-x-2 overflow-x-auto">
          {spot.images?.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImageIndex(index)}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded ${
                index === activeImageIndex ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70'
              }`}
            >
              <img
                src={img}
                alt={`${spot.name} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* 詳細情報 */}
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {spot.category}
              </span>
              <div className="ml-4 flex items-center text-amber-500">
                <Star className="h-5 w-5 fill-current" />
                <span className="ml-1 font-semibold">{spot.rating}</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500">穴場度:</span>
              <div className="ml-1 flex">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full ${
                      i < spot.secretLevel ? 'bg-primary' : 'bg-gray-200'
                    } ${i > 0 ? 'ml-0.5' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold">説明</h2>
            <p className="text-gray-700">{spot.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold">詳細情報</h2>
            <div className="space-y-4 text-gray-700">
              {spot.longDescription?.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold">訪問のポイント</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center rounded-lg border border-gray-200 p-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="ml-3">
                  <p className="text-xs text-gray-500">ベストシーズン</p>
                  <p className="font-medium">{spot.bestSeason}</p>
                </div>
              </div>
              <div className="flex items-center rounded-lg border border-gray-200 p-3">
                <Clock className="h-5 w-5 text-primary" />
                <div className="ml-3">
                  <p className="text-xs text-gray-500">おすすめの時間帯</p>
                  <p className="font-medium">{spot.bestTime}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold">アドバイス</h2>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-gray-700">{spot.tips}</p>
            </div>
          </div>

          {/* コメントセクション */}
          <div>
            <h2 className="mb-4 flex items-center text-xl font-semibold">
              <MessageCircle className="mr-2 h-5 w-5" />
              コメント ({spot.comments?.length ?? 0})
            </h2>

            <div className="space-y-4">
              {spot.comments?.map((comment) => (
                <div key={comment.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center">
                    <img
                      src={comment.user.avatar}
                      alt={comment.user.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="ml-3">
                      <p className="font-medium">{comment.user.name}</p>
                      <p className="text-xs text-gray-500">{comment.createdAt}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="mb-2 text-lg font-semibold">コメントを追加</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="このスポットについてコメントを書いてください..."
                className="w-full rounded-md border border-gray-300 p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                rows={4}
              ></textarea>
              <div className="mt-2 flex justify-end">
                <Button>コメントを投稿</Button>
              </div>
            </div>
          </div>
        </div>

        {/* サイドバー */}
        <div>
          <div className="sticky top-20 space-y-6">
            {/* 地図 */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <SpotMapView spot={spot} />
              <div className="p-4">
                <h3 className="font-semibold">アクセス</h3>
                <p className="mt-1 text-sm text-gray-500">{spot.address}</p>
                <Button asChild variant="outline" size="sm" className="mt-2 w-full">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ルートを表示
                  </a>
                </Button>
              </div>
            </div>

            {/* 関連スポット */}
            {/* <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 font-semibold">近くのスポット</h3>
              <div className="space-y-3">
                {Object.values(mockSpots)
                  .filter((s) => s.id !== currentSpot.id)
                  .slice(0, 2)
                  .map((s) => (
                    <Link
                      key={s.id}
                      to={`/spots/${s.id}`}
                      className="flex items-start rounded-md p-2 hover:bg-gray-50"
                    >
                      <img
                        src={s.imageUrl}
                        alt={s.name}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                      <div className="ml-3">
                        <h4 className="font-medium">{s.name}</h4>
                        <p className="text-xs text-gray-500">{s.category}</p>
                        <div className="mt-1 flex items-center text-amber-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="ml-1 text-xs">{s.rating}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
