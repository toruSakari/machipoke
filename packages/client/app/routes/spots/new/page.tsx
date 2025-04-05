import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, Link, useSubmit, useActionData } from 'react-router';
import {
  MapPin,
  Save,
  ArrowLeft,
  Upload,
  Camera,
  AlertCircle,
  X,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

const LocationPicker = lazy(() => import('@/components/maps/LocationPicker'));

interface SpotCreatePageProps {
  defaultLocation: {
    latitude: number;
    longitude: number;
  };
}

export default function SpotCreatePage({ defaultLocation }: SpotCreatePageProps) {
  const navigate = useNavigate();
  const submit = useSubmit();
  const actionData = useActionData() as { errors?: Record<string, string> } | undefined;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    category: '',
    location: '',
    address: '',
    latitude: defaultLocation.latitude.toString(),
    longitude: defaultLocation.longitude.toString(),
    secretLevel: '3', // デフォルトは中程度の穴場
    bestSeason: '',
    bestTime: '',
    tips: '',
    imageUrl: '',
    images: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [usedGeolocation, setUsedGeolocation] = useState(false);

  // アクションからのエラーを状態に反映
  useEffect(() => {
    if (actionData?.errors) {
      setErrors(actionData.errors);
    }
  }, [actionData]);

  // ユーザーの現在位置を取得（オプション）
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setUsedGeolocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }));
        },
        (error) => {
          console.error('位置情報の取得に失敗しました:', error);
        }
      );
    }
  };

  // フォーム送信ハンドラー
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // クライアントサイドのバリデーション
    const validationErrors: Record<string, string> = {};
    if (!formData.name.trim()) validationErrors.name = 'スポット名は必須です';
    if (!formData.description.trim()) validationErrors.description = '説明は必須です';
    if (!formData.category.trim()) validationErrors.category = 'カテゴリは必須です';
    if (!formData.location.trim()) validationErrors.location = '場所は必須です';
    if (!formData.address.trim()) validationErrors.address = '住所は必須です';
    
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      validationErrors.coordinates = '位置情報が無効です';
    }

    const secretLevel = parseInt(formData.secretLevel, 10);
    if (isNaN(secretLevel) || secretLevel < 1 || secretLevel > 5) {
      validationErrors.secretLevel = '穴場度は1〜5の間で選択してください';
    }

    if (selectedImages.length === 0) {
      validationErrors.images = '少なくとも1枚の画像をアップロードしてください';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // エラーがなければフォーム送信
    const formElement = e.target as HTMLFormElement;
    const formDataObj = new FormData(formElement);
    formDataObj.set('images', JSON.stringify(selectedImages));
    if (selectedImages.length > 0) {
      formDataObj.set('imageUrl', selectedImages[0]);
    }
    
    submit(formDataObj, { method: 'post' });
  };

  // 入力フィールド変更ハンドラー
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // ドロップダウン変更ハンドラー
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 位置情報の更新ハンドラー
  const handleLocationUpdate = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
    
    // 座標エラーをクリア
    if (errors.coordinates) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.coordinates;
        return newErrors;
      });
    }
  };

  // 画像アップロードハンドラー (モック)
  const handleImageUpload = () => {
    setUploading(true);
    // 実際のアプリでは、ここで画像アップロードAPIを呼び出します
    // モックのための遅延
    setTimeout(() => {
      const newImage = 'https://source.unsplash.com/random/800x600/?japan';
      setSelectedImages(prev => [...prev, newImage]);
      setUploading(false);
      
      // イメージエラーをクリア
      if (errors.images) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.images;
          return newErrors;
        });
      }
    }, 1500);
  };

  // 画像削除ハンドラー
  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    if (activeImageIndex >= index && activeImageIndex > 0) {
      setActiveImageIndex(prev => prev - 1);
    }
    
    // 画像がなくなったらエラーを追加
    if (selectedImages.length <= 1) {
      setErrors(prev => ({
        ...prev,
        images: '少なくとも1枚の画像をアップロードしてください',
      }));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4 flex items-center p-0">
          <Link to="/profile">
            <ArrowLeft className="mr-2 h-4 w-4" />
            マイページに戻る
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">新しいスポットを登録</h1>
        <p className="mt-2 text-gray-600">
          あなたのお気に入りの場所を共有して、もっと多くの人に知ってもらいましょう。
        </p>
      </div>

      {/* エラーがある場合に表示 */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>入力エラー</AlertTitle>
          <AlertDescription>
            フォームに入力エラーがあります。修正してから再度送信してください。
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* フォームフィールド */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
                <CardDescription>スポットの基本的な情報を入力してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className={errors.name ? 'text-destructive' : ''}>
                    スポット名 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="例: 隠れた桜並木"
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className={errors.category ? 'text-destructive' : ''}>
                    カテゴリ <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger 
                      id="category" 
                      name="category"
                      className={errors.category ? 'border-destructive' : ''}
                    >
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="自然">自然</SelectItem>
                      <SelectItem value="食事">食事</SelectItem>
                      <SelectItem value="文化">文化</SelectItem>
                      <SelectItem value="娯楽">娯楽</SelectItem>
                      <SelectItem value="景観">景観</SelectItem>
                      <SelectItem value="買い物">買い物</SelectItem>
                      <SelectItem value="その他">その他</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className={errors.description ? 'text-destructive' : ''}
                  >
                    説明 (概要) <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="例: 地元の人しか知らない美しい桜並木。春の訪れを感じるのに最適な場所です。"
                    className={errors.description ? 'border-destructive' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    150文字程度でスポットの概要を説明してください。
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longDescription">詳細説明</Label>
                  <Textarea
                    id="longDescription"
                    name="longDescription"
                    value={formData.longDescription}
                    onChange={handleChange}
                    rows={6}
                    placeholder="例: 都心から電車で30分ほどの距離にありながら、その美しさはあまり知られていないこの桜並木。周辺には小さな川が流れ、春には桜の花びらが水面に散る様子も楽しめます。"
                  />
                  <p className="text-xs text-gray-500">
                    スポットについてより詳しい説明を入力してください。段落を分けるには空行を入れてください。
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>位置情報</CardTitle>
                <CardDescription>スポットの位置情報を入力してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={getUserLocation}
                    disabled={usedGeolocation}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    現在地を使用
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location" className={errors.location ? 'text-destructive' : ''}>
                    場所 (地域) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="例: 東京都新宿区"
                    className={errors.location ? 'border-destructive' : ''}
                  />
                  {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className={errors.address ? 'text-destructive' : ''}>
                    住所 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="例: 東京都新宿区○○町1-2-3"
                    className={errors.address ? 'border-destructive' : ''}
                  />
                  {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="latitude"
                      className={errors.coordinates ? 'text-destructive' : ''}
                    >
                      緯度 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="例: 35.6925"
                      className={errors.coordinates ? 'border-destructive' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="longitude"
                      className={errors.coordinates ? 'text-destructive' : ''}
                    >
                      経度 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="例: 139.7035"
                      className={errors.coordinates ? 'border-destructive' : ''}
                    />
                  </div>
                </div>
                {errors.coordinates && (
                  <p className="text-sm text-destructive">{errors.coordinates}</p>
                )}

                <div className="h-[300px] w-full rounded-lg overflow-hidden border mt-4">
                  <Suspense
                    fallback={
                      <div className="h-full w-full flex items-center justify-center bg-gray-100">
                        <p className="text-gray-500">地図を読み込み中...</p>
                      </div>
                    }
                  >
                    <LocationPicker
                      initialPosition={{
                        lat: parseFloat(formData.latitude),
                        lng: parseFloat(formData.longitude),
                      }}
                      onPositionChange={handleLocationUpdate}
                    />
                  </Suspense>
                </div>
                <p className="text-xs text-gray-500">
                  マップ上のマーカーをドラッグして正確な位置を指定してください。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>追加情報</CardTitle>
                <CardDescription>
                  スポットに関する追加情報を入力してください。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="secretLevel"
                    className={errors.secretLevel ? 'text-destructive' : ''}
                  >
                    穴場度 <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.secretLevel}
                    onValueChange={(value) => handleSelectChange('secretLevel', value)}
                  >
                    <SelectTrigger
                      id="secretLevel"
                      name="secretLevel"
                      className={errors.secretLevel ? 'border-destructive' : ''}
                    >
                      <SelectValue placeholder="穴場度を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - 一般的に知られている</SelectItem>
                      <SelectItem value="2">2 - やや知られている</SelectItem>
                      <SelectItem value="3">3 - 中程度の穴場</SelectItem>
                      <SelectItem value="4">4 - かなりの穴場</SelectItem>
                      <SelectItem value="5">5 - 完全な隠れスポット</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.secretLevel && (
                    <p className="text-sm text-destructive">{errors.secretLevel}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bestSeason">ベストシーズン</Label>
                  <Input
                    id="bestSeason"
                    name="bestSeason"
                    value={formData.bestSeason}
                    onChange={handleChange}
                    placeholder="例: 春 (3月下旬〜4月上旬)"
                  />
                  <p className="text-xs text-gray-500">
                    このスポットを訪れるのに最適な季節や時期を入力してください。
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bestTime">おすすめの時間帯</Label>
                  <Input
                    id="bestTime"
                    name="bestTime"
                    value={formData.bestTime}
                    onChange={handleChange}
                    placeholder="例: 早朝・夕方"
                  />
                  <p className="text-xs text-gray-500">
                    このスポットを訪れるのに最適な時間帯を入力してください。
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tips">アドバイス・訪問のポイント</Label>
                  <Textarea
                    id="tips"
                    name="tips"
                    value={formData.tips}
                    onChange={handleChange}
                    rows={4}
                    placeholder="例: 早朝に訪れると人が少なく、写真撮影に最適です。また、4月第一週の週末に地元の春祭りが開催され、露店も出ます。"
                  />
                  <p className="text-xs text-gray-500">
                    このスポットを訪れる際のアドバイスや注意点などを入力してください。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 画像アップロード */}
            <Card>
              <CardHeader>
                <CardTitle>画像 <span className="text-destructive">*</span></CardTitle>
                <CardDescription>
                  スポットの画像をアップロードしてください。少なくとも1枚は必要です。
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* メイン画像表示 */}
                {selectedImages.length > 0 ? (
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100 mb-3">
                    <img
                      src={selectedImages[activeImageIndex]}
                      alt="スポットのプレビュー"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full flex flex-col items-center justify-center rounded-lg bg-gray-100 mb-3">
                    <Camera className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500">画像を追加してください</p>
                  </div>
                )}

                {/* サムネイル表示 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedImages.map((img, index) => (
                    <div
                      key={index}
                      className="group relative h-16 w-16 overflow-hidden rounded-md cursor-pointer"
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img
                        src={img}
                        alt={`サムネイル ${index + 1}`}
                        className={`h-full w-full object-cover ${
                          activeImageIndex === index ? 'ring-2 ring-primary' : 'opacity-70'
                        }`}
                      />
                      <button
                        type="button"
                        className="absolute right-0 top-0 rounded-bl-md bg-black/70 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* アップロードボタン */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  onClick={handleImageUpload}
                  disabled={uploading || selectedImages.length >= 5}
                >
                  {uploading ? (
                    <span>アップロード中...</span>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      画像をアップロード
                    </>
                  )}
                </Button>
                {errors.images && <p className="mt-2 text-sm text-destructive">{errors.images}</p>}
                <p className="mt-2 text-xs text-gray-500">
                  最大5枚までの画像をアップロードできます。最初の画像がメイン画像として使用されます。
                </p>
              </CardContent>
            </Card>

            {/* プレビューカード */}
            <Card>
              <CardHeader>
                <CardTitle>プレビュー</CardTitle>
                <CardDescription>登録するスポット情報のプレビューです。</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="aspect-video w-full bg-gray-100">
                    {selectedImages.length > 0 ? (
                      <img
                        src={selectedImages[0]}
                        alt={formData.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-gray-400">画像なし</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{formData.name || 'スポット名'}</h3>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <MapPin className="mr-1 h-3 w-3" />
                      <span>{formData.location || '場所'}</span>
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {formData.category || 'カテゴリ'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm line-clamp-3 text-gray-700">
                      {formData.description || '説明'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 送信ボタン */}
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={uploading || Object.keys(errors).length > 0}
            >
              <Plus className="mr-2 h-5 w-5" />
              スポットを登録する
            </Button>
            
            <p className="text-center text-xs text-gray-500">
              <span className="text-destructive">*</span> のついた項目は必須です
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
