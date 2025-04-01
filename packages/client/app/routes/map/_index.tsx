import MapPage from '@/routes/map/page';
import type { Route } from './+types/_index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'マップ | マチポケ' },
    { name: 'description', content: 'マチポケ - 地元の人だけが知る場所を共有するプラットフォーム' },
  ];
}
export function loader({ context }: Route.LoaderArgs) {
  return {};
}

export default function MapRoute() {
  return <MapPage />;
}
