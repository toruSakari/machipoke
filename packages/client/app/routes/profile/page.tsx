import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, Settings, LogOut, Star, Clock, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';

// モックデータ
const mockUser = {
  id: 'user1',
  name: '山田太郎',
  email: 'yamada@example.com',
  avatar: 'https://i.pravatar.cc/150?img=12',
  bio: '東京を中心に隠れた名所を探しています。特に歴史的な場所や古い建物、自然スポットが好きです。',
  location: '東京都新宿区',
  interests: ['歴史', '建築', '自然', '写真撮影'],
  hometown: '長野県',
  joinedDate: '2023-10-15',
};

const mockSavedSpots = [
  {
    id: '1',
    name: '隠れた桜並木',
    description: '地元の人しか知らない美しい桜並木。春の訪れを感じるのに最適な場所です。',
    category: '自然',
    location: '東京都新宿区',
    imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951',
    savedAt: '2023-12-01',
  },
  {
    id: '2',
    name: '古民家カフェ',
    description: '100年以上前の古民家を改装したカフェ。ゆったりとした時間を過ごせます。',
    category: '食事',
    location: '東京都世田谷区',
    imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348',
    savedAt: '2023-11-20',
  },
];

const mockPostedSpots = [
  {
    id: '3',
    name: '路地裏の古書店',
    description: 'ビルの間に隠れた小さな古書店。珍しい本や古い雑誌が見つかります。',
    category: '買い物',
    location: '東京都千代田区',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66',
    postedAt: '2023-11-15',
    likes: 12,
  },
];

const mockVisitedSpots = [
  {
    id: '1',
    name: '隠れた桜並木',
    description: '地元の人しか知らない美しい桜並木。春の訪れを感じるのに最適な場所です。',
    category: '自然',
    location: '東京都新宿区',
    imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951',
    visitedAt: '2023-04-10',
    rating: 4.5,
  },
  {
    id: '2',
    name: '古民家カフェ',
    description: '100年以上前の古民家を改装したカフェ。ゆったりとした時間を過ごせます。',
    category: '食事',
    location: '東京都世田谷区',
    imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348',
    visitedAt: '2023-11-05',
    rating: 5,
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* プロフィールヘッダー */}
      <div className="mb-8 flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-6 sm:space-y-0">
        <div className="h-32 w-32 overflow-hidden rounded-full">
          <img src={mockUser.avatar} alt={mockUser.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-1 flex-col text-center sm:text-left">
          <h1 className="text-2xl font-bold">{mockUser.name}</h1>
          <div className="mt-1 flex flex-col items-center sm:flex-row sm:items-center">
            <div className="flex items-center text-gray-500">
              <MapPin className="mr-1 h-4 w-4" />
              <span>{mockUser.location}</span>
            </div>
            <span className="hidden px-2 text-gray-300 sm:block">•</span>
            <div className="flex items-center text-gray-500">
              <Clock className="mr-1 h-4 w-4" />
              <span>登録: {new Date(mockUser.joinedDate).toLocaleDateString('ja-JP')}</span>
            </div>
          </div>
          <p className="mt-3 text-gray-600">{mockUser.bio}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {mockUser.interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            設定
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <LogOut className="mr-2 h-4 w-4" />
            ログアウト
          </Button>
        </div>
      </div>

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>プロフィール</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center space-x-2">
            <BookmarkCheck className="h-4 w-4" />
            <span>保存したスポット</span>
          </TabsTrigger>
          <TabsTrigger value="posted" className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>投稿したスポット</span>
          </TabsTrigger>
          <TabsTrigger value="visited" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>訪れたスポット</span>
          </TabsTrigger>
        </TabsList>

        {/* プロフィールタブ */}
        <TabsContent value="profile" className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">個人情報</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">フルネーム</p>
                  <p>{mockUser.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">メールアドレス</p>
                  <p>{mockUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">出身地</p>
                  <p>{mockUser.hometown}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">現在地</p>
                  <p>{mockUser.location}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">自己紹介</h2>
              <Button variant="outline" size="sm">
                編集
              </Button>
            </div>
            <p className="mt-4 text-gray-600">{mockUser.bio}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">興味・関心</h2>
              <Button variant="outline" size="sm">
                編集
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {mockUser.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* 保存したスポットタブ */}
        <TabsContent value="saved">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">保存したスポット</h2>
              <span className="text-sm text-gray-500">{mockSavedSpots.length} 件</span>
            </div>

            {mockSavedSpots.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
                <p className="text-gray-500">保存したスポットはありません</p>
                <Button asChild className="mt-4">
                  <Link to="/map">スポットを探す</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {mockSavedSpots.map((spot) => (
                  <div
                    key={spot.id}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div
                      className="h-40 w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${spot.imageUrl})` }}
                    />
                    <div className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {spot.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          保存: {new Date(spot.savedAt).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold">{spot.name}</h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <MapPin className="mr-1 h-3 w-3" />
                        {spot.location}
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{spot.description}</p>
                      <div className="mt-4 flex justify-end">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/spots/${spot.id}`}>詳細を見る</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* 投稿したスポットタブ */}
        <TabsContent value="posted">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">投稿したスポット</h2>
              <div className="flex space-x-2">
                <span className="text-sm text-gray-500">{mockPostedSpots.length} 件</span>
                <Button size="sm">
                  <MapPin className="mr-2 h-4 w-4" />
                  新規スポットを投稿
                </Button>
              </div>
            </div>

            {mockPostedSpots.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
                <p className="text-gray-500">投稿したスポットはありません</p>
                <Button className="mt-4">スポットを投稿する</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {mockPostedSpots.map((spot) => (
                  <div
                    key={spot.id}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div
                      className="h-40 w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${spot.imageUrl})` }}
                    />
                    <div className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {spot.category}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            投稿: {new Date(spot.postedAt).toLocaleDateString('ja-JP')}
                          </span>
                          <div className="flex items-center text-amber-500">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="ml-1 text-xs">{spot.likes}</span>
                          </div>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold">{spot.name}</h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <MapPin className="mr-1 h-3 w-3" />
                        {spot.location}
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{spot.description}</p>
                      <div className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          編集
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/spots/${spot.id}`}>詳細を見る</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* 訪れたスポットタブ */}
        <TabsContent value="visited">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">訪れたスポット</h2>
              <span className="text-sm text-gray-500">{mockVisitedSpots.length} 件</span>
            </div>

            {mockVisitedSpots.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
                <p className="text-gray-500">訪れたスポットを記録していません</p>
                <Button asChild className="mt-4">
                  <Link to="/map">スポットを探す</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {mockVisitedSpots.map((spot) => (
                  <div
                    key={spot.id}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div
                      className="h-40 w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${spot.imageUrl})` }}
                    />
                    <div className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {spot.category}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            訪問: {new Date(spot.visitedAt).toLocaleDateString('ja-JP')}
                          </span>
                          <div className="flex items-center text-amber-500">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="ml-1 text-xs">{spot.rating}</span>
                          </div>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold">{spot.name}</h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <MapPin className="mr-1 h-3 w-3" />
                        {spot.location}
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{spot.description}</p>
                      <div className="mt-4 flex justify-end">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/spots/${spot.id}`}>詳細を見る</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
