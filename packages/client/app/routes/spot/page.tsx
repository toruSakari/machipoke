import { useState } from 'react';
import { Link } from 'react-router';
import { Search, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

// モックデータ
const mockSpots = [
  {
    id: '1',
    name: '隠れた桜並木',
    description: '地元の人しか知らない美しい桜並木。春の訪れを感じるのに最適な場所です。',
    category: '自然',
    rating: 4.5,
    location: '東京都新宿区',
    imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951',
    secretLevel: 4, // 5段階評価 (穴場度)
  },
  {
    id: '2',
    name: '古民家カフェ',
    description: '100年以上前の古民家を改装したカフェ。ゆったりとした時間を過ごせます。',
    category: '食事',
    rating: 4.8,
    location: '東京都世田谷区',
    imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348',
    secretLevel: 5,
  },
  {
    id: '3',
    name: '夕日が美しい展望台',
    description: '都会の喧騒を忘れられる、絶景が広がる穴場の展望台。',
    category: '景観',
    rating: 4.7,
    location: '東京都渋谷区',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    secretLevel: 3,
  },
  {
    id: '4',
    name: '路地裏のジャズバー',
    description: '知る人ぞ知る、本格的なジャズが楽しめる隠れ家的バー。',
    category: '娯楽',
    rating: 4.6,
    location: '東京都中央区',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
    secretLevel: 5,
  },
  {
    id: '5',
    name: '朝市が立つ河川敷',
    description: '地元の新鮮な野菜や手作り品が並ぶ、月に一度の朝市。',
    category: '買い物',
    rating: 4.2,
    location: '東京都江戸川区',
    imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9',
    secretLevel: 3,
  },
  {
    id: '6',
    name: '小さな動物園',
    description: '住宅街に突如現れる小さな動物園。珍しい小動物と触れ合える。',
    category: '自然',
    rating: 4.4,
    location: '東京都練馬区',
    imageUrl: 'https://images.unsplash.com/photo-1503919005314-30d93d07c83c',
    secretLevel: 4,
  },
];

export default function SpotPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  // フィルタリング・ソート処理
  const filteredAndSortedSpots = mockSpots
    .filter((spot) => {
      // 検索語でフィルタリング
      const matchesSearch =
        spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.location.toLowerCase().includes(searchTerm.toLowerCase());

      // カテゴリーでフィルタリング
      const matchesCategory = selectedCategory === 'all' || spot.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // ソート
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (sortBy === 'secretLevel') {
        return b.secretLevel - a.secretLevel;
      }
      return 0;
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">スポット一覧</h1>

      {/* フィルターエリア */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="スポットを検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">すべてのカテゴリー</option>
            <option value="自然">自然</option>
            <option value="食事">食事</option>
            <option value="景観">景観</option>
            <option value="娯楽">娯楽</option>
            <option value="買い物">買い物</option>
          </select>
        </div>

        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="rating">評価が高い順</option>
            <option value="secretLevel">穴場度が高い順</option>
          </select>
        </div>

        <Button asChild className="flex h-full items-center justify-center">
          <Link to="/map">
            <MapPin className="mr-2 h-4 w-4" />
            地図で見る
          </Link>
        </Button>
      </div>

      {/* 検索結果 */}
      <div className="mt-8">
        <p className="text-sm text-gray-500">
          {filteredAndSortedSpots.length} 件のスポットが見つかりました
        </p>

        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedSpots.map((spot) => (
            <div
              key={spot.id}
              className="overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md"
            >
              <div
                className="h-48 w-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${spot.imageUrl})`,
                }}
              />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {spot.category}
                  </span>
                  <div className="flex items-center text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-xs font-semibold">{spot.rating}</span>
                  </div>
                </div>

                <h2 className="mt-2 text-lg font-semibold">{spot.name}</h2>

                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <MapPin className="mr-1 h-3 w-3" />
                  {spot.location}
                </div>

                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{spot.description}</p>

                <div className="mt-4 flex items-center justify-between">
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

                  <Button asChild variant="outline" size="sm">
                    <Link to={`/spots/${spot.id}`}>詳細を見る</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
