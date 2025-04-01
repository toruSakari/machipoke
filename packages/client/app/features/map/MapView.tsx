// 必要なライブラリ・コンポーネントをインポート
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { Search, Filter, MapPin, Star, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import useMapStore from '@/store/mapStore';
import { useSpots } from '@/hooks/useSpots';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

// クライアントサイドのみのMapViewを分離
export default function MapView() {
  // カスタムマーカーアイコンの設定
  const createMapIcon = (category: string) => {
    const color = getColorByCategory(category);
    return new Icon({
      iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23${color}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'%3E%3C/path%3E%3Ccircle cx='12' cy='10' r='3'%3E%3C/circle%3E%3C/svg%3E`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });
  };

  // カテゴリ別の色を取得
  const getColorByCategory = (category: string) => {
    switch (category) {
      case '自然':
        return '2ecc71';
      case '食事':
        return 'e74c3c';
      case '景観':
        return '3498db';
      case '娯楽':
        return '9b59b6';
      case '買い物':
        return 'f39c12';
      default:
        return '1a33d6';
    }
  };

  // 現在地へのリセット用コンポーネント
  const ResetCenterView = ({
    userLocation,
  }: {
    userLocation: [number, number];
  }) => {
    const map = useMap();

    useEffect(() => {
      if (userLocation) {
        map.setView(userLocation, 14);
      }
    }, [userLocation, map]);

    return null;
  };

  // メインのMapViewコンポーネントロジック
  function MapContent() {
    const {
      center,
      zoom,
      userLocation,
      selectedSpotId,
      filter,
      isFilterVisible,
      setCenter,
      setZoom,
      setUserLocation,
      selectSpot,
      updateFilter,
      resetFilter,
      toggleFilterVisibility,
    } = useMapStore();

    const [searchTerm, setSearchTerm] = useState('');

    // 多言語化対応を削除

    // スポットデータの取得
    const { data: spots = [], isLoading } = useSpots(filter);

    // 検索によるフィルタリング
    const filteredSpots = spots.filter(
      (spot) =>
        !searchTerm ||
        spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 現在位置を取得
    useEffect(() => {
      console.log(navigator.geolocation);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
            setUserLocation(loc);
            if (!selectedSpotId) {
              setCenter(loc);
            }
          },
          (error) => {
            console.error('位置情報の取得に失敗しました:', error);
          }
        );
      }
    }, []);

    // 検索語が変更されたら状態を更新
    useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
        updateFilter({ searchTerm });
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleCategoryChange = (category: string) => {
      if (filter.category === category) {
        updateFilter({ category: undefined });
      } else {
        updateFilter({ category });
      }
    };

    return (
      <div className="flex h-[calc(100vh-64px)] flex-col md:flex-row">
        {/* 検索・フィルターサイドバー */}
        <div
          className={`w-full border-b p-4 md:w-80 md:border-b-0 md:border-r ${
            isFilterVisible ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                placeholder="検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <h3 className="font-semibold">フィルター</h3>
              </div>
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all"
                    checked={!filter.category}
                    onCheckedChange={() => resetFilter()}
                  />
                  <Label htmlFor="all" className="text-sm text-gray-700">
                    すべて
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nature"
                    checked={filter.category === '自然'}
                    onCheckedChange={() => handleCategoryChange('自然')}
                  />
                  <Label htmlFor="nature" className="text-sm text-gray-700">
                    自然
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="food"
                    checked={filter.category === '食事'}
                    onCheckedChange={() => handleCategoryChange('食事')}
                  />
                  <Label htmlFor="food" className="text-sm text-gray-700">
                    食事
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="view"
                    checked={filter.category === '景観'}
                    onCheckedChange={() => handleCategoryChange('景観')}
                  />
                  <Label htmlFor="view" className="text-sm text-gray-700">
                    景観
                  </Label>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="font-semibold">検索結果: {filteredSpots.length}件</h3>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-350px)]">
              {filteredSpots.map((spot) => (
                <Card
                  key={spot.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    selectSpot(spot.id);
                    setCenter([spot.latitude, spot.longitude]);
                    setZoom(16);
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-2">
                      <Badge
                        className="mt-1"
                        variant="outline"
                        style={{
                          backgroundColor: `#${getColorByCategory(spot.category)}20`,
                          color: `#${getColorByCategory(spot.category)}`,
                        }}
                      >
                        {spot.category}
                      </Badge>
                      <div className="flex-1">
                        <h4 className="font-medium">{spot.name}</h4>
                        <p className="text-xs text-gray-500 flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {spot.location}
                        </p>
                        <p className="mt-1 text-sm line-clamp-2">{spot.description}</p>
                        <div className="mt-2 flex justify-end">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/spots/${spot.id}`}>詳細を見る</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredSpots.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  <p>スポットが見つかりませんでした。検索条件を変更してみてください。</p>
                </div>
              )}

              {isLoading && (
                <div className="text-center py-8">
                  <p>データを読み込み中...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 地図エリア */}
        <div className="flex-1 relative">
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* ユーザーの現在位置 */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={
                  new Icon({
                    iconUrl:
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%232563eb" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Ccircle cx="12" cy="12" r="10"%3E%3C/circle%3E%3Ccircle cx="12" cy="12" r="3"%3E%3C/circle%3E%3C/svg%3E',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                    popupAnchor: [0, -16],
                  })
                }
              >
                <Popup>
                  <div>
                    <h3 className="font-medium">現在位置</h3>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* スポットのマーカー */}
            {filteredSpots.map((spot) => (
              <Marker
                key={spot.id}
                position={[spot.latitude, spot.longitude]}
                icon={createMapIcon(spot.category)}
                eventHandlers={{
                  click: () => {
                    selectSpot(spot.id);
                  },
                }}
              >
                <Popup>
                  <div className="max-w-xs">
                    <h3 className="font-medium">{spot.name}</h3>
                    <Badge
                      variant="outline"
                      className="mt-1"
                      style={{
                        backgroundColor: `#${getColorByCategory(spot.category)}20`,
                        color: `#${getColorByCategory(spot.category)}`,
                      }}
                    >
                      {spot.category}
                    </Badge>
                    <div className="mt-1 flex items-center text-amber-500">
                      <Star className="h-3 w-3 fill-amber-500" />
                      <span className="ml-1 text-xs">{spot.rating}</span>
                    </div>
                    <p className="mt-2 text-sm">{spot.description}</p>
                    <div className="mt-3 flex justify-end">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/spots/${spot.id}`}>詳細を見る</Link>
                      </Button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 現在地に戻るためのコンポーネント */}
            {userLocation && <ResetCenterView userLocation={userLocation} />}
          </MapContainer>

          {/* モバイル用フィルタータグル */}
          <div className="absolute bottom-4 left-4 md:hidden z-[1000]">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full p-3 h-auto w-auto shadow-md"
              onClick={toggleFilterVisibility}
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>

          {/* 現在地に戻るボタン */}
          {userLocation && (
            <div className="absolute bottom-4 right-4 z-[1000]">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full p-3 h-auto w-auto shadow-md"
                onClick={() => {
                  setCenter(userLocation);
                  setZoom(14);
                }}
              >
                <Navigation className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  try {
    return <MapContent />;
  } catch (error) {
    console.error('MapView error:', error);
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center p-8">
          <p className="text-lg text-red-500">
            地図の読み込みに失敗しました。再読み込みしてください。
          </p>
        </div>
      </div>
    );
  }
}
