import { Link } from 'react-router';
import { Map, MapPin, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const MENU_ITEMS = [
  {
    link: '/map',
    label: '地図で探す',
    icon: Map,
  },
  {
    link: '/spots',
    label: 'スポット一覧',
    icon: MapPin,
  },
  {
    link: '/profile',
    label: 'マイページ',
    icon: User,
  },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    console.log('toggleMenu');
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-primary">
            マチポケ
          </Link>
        </div>
        <nav className="hidden space-x-4 md:flex">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.link}
                to={item.link}
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <Icon className="mr-2 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          <Button asChild>
            <Link to="/auth">ログイン</Link>
          </Button>
        </nav>
        <div className="flex md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-700 hover:text-gray-900"
            aria-label="メニュー"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.link}
                  to={item.link}
                  className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
            <Button asChild className="mt-2 w-full">
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                ログイン
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
