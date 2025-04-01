import TermsPage from '@/routes/terms/page';
import type { Route } from './+types/_index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '利用規約 | マチポケ' },
    { name: 'description', content: 'マチポケの利用規約やガイドラインについて' },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return {};
}

export default function TermsRoute() {
  return <TermsPage />;
}
