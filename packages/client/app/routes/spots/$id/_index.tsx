import SpotDetailPage from '@/routes/spots/$id/page';
import type { Route } from './+types/_index';
import { data } from 'react-router';
import type { Spot } from '@/types/spot';

// モックデータ
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
    secretLevel: 4, // 5段階評価 (穴場度)
    bestSeason: '春 (3月下旬〜4月上旬)',
    bestTime: '早朝・夕方',
    tips: '早朝に訪れると人が少なく、写真撮影に最適です。また、4月第一週の週末に地元の春祭りが開催され、露店も出ます。',
    comments: [
      {
        id: 'c1',
        user: {
          id: 'u1',
          name: 'タナカ',
          avatar: 'https://i.pravatar.cc/150?img=1',
        },
        createdAt: '2023-12-01',
        content:
          '先週訪れましたが、とても静かで落ち着いた場所でした。地元に住んでいながら知りませんでした！',
      },
      {
        id: 'c2',
        user: {
          id: 'u2',
          name: 'ヤマダ',
          avatar: 'https://i.pravatar.cc/150?img=2',
        },
        createdAt: '2023-11-15',
        content:
          '桜の季節に行きたいと思います。穴場情報ありがとうございます。混雑していないスポットを探していました。',
      },
    ],
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
    latitude: 35.6925,
    longitude: 139.7035,
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
    comments: [
      {
        id: 'c3',
        user: {
          id: 'u3',
          name: 'スズキ',
          avatar: 'https://i.pravatar.cc/150?img=3',
        },
        createdAt: '2023-11-20',
        content:
          '古い日本家屋の雰囲気がとても良く、ほうじ茶ラテが絶品でした。また行きたいと思います。',
      },
    ],
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'スポット | マチポケ' },
    { name: 'description', content: 'マチポケ - 地元の人だけが知る場所を共有するプラットフォーム' },
  ];
}

export function loader({ params, context }: Route.LoaderArgs) {
  const spot = mockSpots.find(({ id }) => id === params.id);

  if (!spot) {
    throw data('スポットが見つかりません。', { status: 404 });
  }

  return { spot };
}

export default function SpotDetailRoute({ loaderData }: Route.ComponentProps) {
  return <SpotDetailPage spot={loaderData.spot} />;
}
