import PrivacyPage from '@/routes/privacy/page';
import type { Route } from './+types/_index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'プライバシーポリシー | マチポケ' },
    {
      name: 'description',
      content: 'マチポケにおける個人情報の取り扱いとプライバシー保護について',
    },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return {};
}

export default function PrivacyRoute() {
  return <PrivacyPage />;
}
