import AuthPage from '@/routes/auth/page';
import type { Route } from './+types/_index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'ログイン | マチポケ' },
    { name: 'description', content: 'マチポケ - 地元の人だけが知る場所を共有するプラットフォーム' },
  ];
}
export function loader({ context }: Route.LoaderArgs) {
  return {};
}

export default function AuthRoute() {
  return <AuthPage />;
}
