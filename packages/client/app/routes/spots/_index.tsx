import SpotPage from '@/routes/spot/page';
import type { Route } from './+types/_index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'スポット一覧 | マチポケ' },
    { name: 'description', content: 'マチポケ - 地元の人だけが知る場所を共有するプラットフォーム' },
  ];
}
export function loader({ context }: Route.LoaderArgs) {
  return {};
}

export default function SpotsIndexRoute() {
  return <SpotPage />;
}
