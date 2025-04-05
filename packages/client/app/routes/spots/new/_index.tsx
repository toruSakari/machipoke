import SpotCreatePage from '@/routes/spots/new/page';
import type { Route } from './+types/_index';
import { redirect } from 'react-router';
import type { CreateSpotInput } from '@/types/spot';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '新しいスポットを作成 | マチポケ' },
    { name: 'description', content: 'マチポケに新しいスポット情報を登録します' },
  ];
}

export function loader({ request, context }: Route.LoaderArgs) {
  // 実際のアプリでは認証チェックを行います
  // if (!isAuthenticated(request)) {
  //   return redirect('/login');
  // }

  // ユーザーの現在位置をデフォルト値としてロードするロジックなどを追加できます
  // 現在は東京の座標をデフォルト値として使用
  return {
    defaultLocation: {
      latitude: 35.6895,
      longitude: 139.6917,
    },
  };
}

export async function action({ request }: Route.ActionArgs) {
  // 実際のアプリでは認証チェックを行います
  // if (!isAuthenticated(request)) {
  //   return redirect('/login');
  // }

  const formData = await request.formData();
  const createData: CreateSpotInput = {
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
    imageUrl: (formData.get('imageUrl') as string) || '',
    images: JSON.parse((formData.get('images') as string) || '[]'),
  };

  // バリデーション
  const errors: Record<string, string> = {};
  if (!createData.name || createData.name.trim() === '') {
    errors.name = 'スポット名は必須です';
  }
  if (!createData.description || createData.description.trim() === '') {
    errors.description = '説明は必須です';
  }
  if (!createData.category || createData.category.trim() === '') {
    errors.category = 'カテゴリは必須です';
  }
  if (!createData.location || createData.location.trim() === '') {
    errors.location = '場所は必須です';
  }
  if (!createData.address || createData.address.trim() === '') {
    errors.address = '住所は必須です';
  }
  if (isNaN(createData.latitude) || isNaN(createData.longitude)) {
    errors.coordinates = '位置情報が無効です';
  }
  if (isNaN(createData.secretLevel) || createData.secretLevel < 1 || createData.secretLevel > 5) {
    errors.secretLevel = '穴場度は1〜5の間で選択してください';
  }
  if (!createData.imageUrl && (!createData.images || createData.images.length === 0)) {
    errors.images = '少なくとも1枚の画像をアップロードしてください';
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // 実際のアプリでは、APIを呼び出してデータを登録します
  // const newSpot = await createSpot(createData);

  // モック用：新規作成が成功したと仮定して、IDを1として返す
  const newSpotId = 'new-1';

  // 作成が成功したら、スポット詳細ページにリダイレクト
  return redirect(`/spots/${newSpotId}`);
}

export default function SpotCreateRoute({ loaderData }: Route.ComponentProps) {
  return <SpotCreatePage defaultLocation={loaderData.defaultLocation} />;
}
