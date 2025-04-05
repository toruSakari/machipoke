import SpotEditPage from '@/routes/spots/$id/edit/page';
import type { Route } from './+types/_index';
import { redirect, data } from 'react-router';
import type { Spot, UpdateSpotInput } from '@/types/spot';

// モックデータ（実際のアプリでは、データベースから取得します）
const mockSpots: Spot[] = [
  {
    id: '1',
    name: '隠れた桜並木',
    description:
      '地元の人しか知らない美しい桜並木。春の訪れを感じるのに最適な場所です。東京の喧騒から少し離れた住宅街の中にひっそりと存在するこの桜並木は、観光客が少なく、地元の人たちに愛されている隠れスポットです。満開の時期には、まるでピンクのトンネルのようになり、写真撮影にも最適です。',
    longDescription:
      '都心から電車で30分ほどの距離にありながら、その美しさはあまり知られていないこの桜並木。周辺には小さな川が流れ、春には桜の花びらが水面に散る様子も楽しめます。地元の古くからの住民によると、この桜並木は戦後に地域の復興を願って植樹されたもので、70年以上の歴史があるそうです。\n\n満開時期は例年3月下旬から4月上旬ですが、混雑を避けるなら早朝か夕方がおすすめ。特に朝日に照らされた桜は幻想的な美しさです。近くには小さな公園もあり、お花見のためのベンチも設置されています。地元のお年寄りが散歩をしている姿も見られ、のどかな時間が流れています。',
    category: '自然',
    rating: 4.5,
    location: '東京都新宿区',
    address: '東京都新宿区○○町1-2-3',
    latitude: 35.6925,
    longitude: 139.7035,
    createdAt: '2023-11-20',
    imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951',
    images: [
      'https://images.unsplash.com/photo-1522383225653-ed111181a951',
      'https://images.unsplash.com/photo-1519567770579-c2fc5e9c5208',
      'https://images.unsplash.com/photo-1514127321-b85c4c3e4876',
    ],
    secretLevel: 4,
    bestSeason: '春 (3月下旬〜4月上旬)',
    bestTime: '早朝・夕方',
    tips: '早朝に訪れると人が少なく、写真撮影に最適です。また、4月第一週の週末に地元の春祭りが開催され、露店も出ます。',
    comments: [],
  },
  {
    id: '2',
    name: '古民家カフェ',
    description: '100年以上前の古民家を改装したカフェ。ゆったりとした時間を過ごせます。',
    longDescription:
      '大正時代に建てられた古民家をリノベーションしたこのカフェは、往時の雰囲気を残しながらも現代的な快適さを兼ね備えています。天井の高い和室や縁側でいただくコーヒーは格別です。地元の農家から仕入れた新鮮な野菜や果物を使ったメニューも人気です。',
    category: '食事',
    rating: 4.8,
    location: '東京都世田谷区',
    address: '東京都世田谷区○○町4-5-6',
    latitude: 35.6460,
    longitude: 139.6577,
    createdAt: '2023-11-20',
    imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348',
    images: [
      'https://images.unsplash.com/photo-1511920170033-f8396924c348',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
    ],
    secretLevel: 5,
    bestSeason: '通年',
    bestTime: '平日午後',
    tips: '週末は混雑するので予約がおすすめ。水曜と木曜は手作りケーキの日で特におすすめ。',
    comments: [],
  },
  {
    id: '3',
    name: '路地裏の古書店',
    description: 'ビルの間に隠れた小さな古書店。珍しい本や古い雑誌が見つかります。',
    category: '買い物',
    location: '東京都千代田区',
    rating: 4.8,
    address: '東京都世田谷区○○町4-5-6',
    latitude: 35.6460,
    longitude: 139.6577,
    createdAt: '2023-11-20',
    imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348',
    images: [
      'https://images.unsplash.com/photo-1511920170033-f8396924c348',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
    ],
    secretLevel: 5,
    bestSeason: '通年',
    bestTime: '平日午後',
    tips: '週末は混雑するので予約がおすすめ。水曜と木曜は手作りケーキの日で特におすすめ。',
    comments: [],
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'スポットを編集 | マチポケ' },
    { name: 'description', content: 'マチポケに登録したスポット情報を編集します' },
  ];
}

export function loader({ params, context }: Route.LoaderArgs) {
  // 実際のアプリでは認証チェックを行います
  // if (!isAuthenticated(request)) {
  //   return redirect('/login');
  // }

  const spotId = params.id;

  if (!spotId) {
    throw data('スポットIDが指定されていません', { status: 400 });
  }

  // スポットデータを取得
  const spot = mockSpots.find((s) => s.id === spotId);

  if (!spot) {
    throw data('スポットが見つかりません', { status: 404 });
  }

  // 実際のアプリでは、現在のユーザーがスポットの作成者かどうかをチェックします
  // if (spot.createdBy.id !== currentUser.id) {
  //   throw data('このスポットを編集する権限がありません', { status: 403 });
  // }

  return { spot };
}

export async function action({ request }: Route.ActionArgs) {
  // 実際のアプリでは認証チェックを行います
  // if (!isAuthenticated(request)) {
  //   return redirect('/login');
  // }

  const formData = await request.formData();
  const spotId = formData.get('id') as string;
  const updateData: UpdateSpotInput = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    longDescription: formData.get('longDescription') as string,
    category: formData.get('category') as string,
    location: formData.get('location') as string,
    address: formData.get('address') as string,
    latitude: parseFloat(formData.get('latitude') as string),
    longitude: parseFloat(formData.get('longitude') as string),
    secretLevel: parseInt(formData.get('secretLevel') as string, 10),
    bestSeason: formData.get('bestSeason') as string,
    bestTime: formData.get('bestTime') as string,
    tips: formData.get('tips') as string,
  };

  // バリデーション
  const errors: Record<string, string> = {};
  if (!updateData.name || updateData.name.trim() === '') {
    errors.name = 'スポット名は必須です';
  }
  if (!updateData.description || updateData.description.trim() === '') {
    errors.description = '説明は必須です';
  }
  if (!updateData.category || updateData.category.trim() === '') {
    errors.category = 'カテゴリは必須です';
  }
  if (!updateData.location || updateData.location.trim() === '') {
    errors.location = '場所は必須です';
  }
  if (!updateData.address || updateData.address.trim() === '') {
    errors.address = '住所は必須です';
  }
  if (!updateData.latitude || !updateData.longitude) {
    errors.coordinates = '位置情報が無効です';
  }
  if (!updateData.secretLevel || updateData.secretLevel < 1 || updateData.secretLevel > 5) {
    errors.secretLevel = '穴場度は1〜5の間で選択してください';
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // 実際のアプリでは、APIを呼び出してデータを更新します
  // await updateSpot(spotId, updateData);

  // 編集が成功したら、スポット詳細ページにリダイレクト
  return redirect(`/spots/${spotId}`);
}

export default function SpotEditRoute({ loaderData }: Route.ComponentProps) {
  return <SpotEditPage spot={loaderData.spot} />;
}
