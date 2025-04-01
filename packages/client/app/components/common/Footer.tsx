import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer className="border-t bg-white py-6">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">マチポケ</h3>
            <p className="mt-2 text-sm text-gray-600">
              地元の人だけが知る場所を共有するプラットフォーム
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">リンク</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-primary">
                  ホーム
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-sm text-gray-600 hover:text-primary">
                  地図で探す
                </Link>
              </li>
              <li>
                <Link to="/spots" className="text-sm text-gray-600 hover:text-primary">
                  スポット一覧
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">サポート</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-primary">
                  サービスについて
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-600 hover:text-primary">
                  利用規約
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-600 hover:text-primary">
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} マチポケ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
