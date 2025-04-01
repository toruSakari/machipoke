import { useRouteError } from 'react-router';
import Header from '@/components/common/Header';
import Footer from '~/components/common/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { ArrowLeft, Home, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  error?: unknown;
}

export default function ErrorPage({ error: propError }: ErrorPageProps = {}) {
  // propsからエラーが渡されていない場合は、useRouteErrorを使用
  const routeError = useRouteError();
  const error = propError || routeError;

  // エラー情報の抽出
  let errorMessage = 'エラーが発生しました';
  let statusCode = 500;
  let statusText = 'Internal Server Error';

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      errorMessage = error.message;
    }
    if ('status' in error && typeof error.status === 'number') {
      statusCode = error.status;
    }
    if ('statusText' in error && typeof error.statusText === 'string') {
      statusText = error.statusText;
    }
  }

  // エラーステータスに応じたメッセージとコンテンツを設定
  let title = `${statusCode}: ${statusText}`;
  let description = errorMessage;
  let illustration = '🔍';

  switch (statusCode) {
    case 404:
      title = 'ページが見つかりません';
      description = 'お探しのページは存在しないか、移動した可能性があります。';
      illustration = '🗺️';
      break;
    case 403:
      title = 'アクセスが拒否されました';
      description = 'このページにアクセスする権限がありません。';
      illustration = '🚫';
      break;
    case 401:
      title = '認証が必要です';
      description = 'このページを表示するにはログインが必要です。';
      illustration = '🔒';
      break;
    case 400:
      title = '不正なリクエスト';
      description = 'リクエストに問題があります。もう一度お試しください。';
      illustration = '⚠️';
      break;
    case 500:
    default:
      title = 'サーバーエラー';
      description = '申し訳ありません、問題が発生しました。時間をおいて再度お試しください。';
      illustration = '🛠️';
      break;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="flex flex-col items-center text-center">
            <div className="text-6xl sm:text-8xl mb-6">{illustration}</div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-gray-500 sm:text-lg md:text-xl">
              {description}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Button asChild variant="outline" size="lg" className="flex items-center">
                <Link to="/" onClick={() => window.history.back()}>
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  前のページに戻る
                </Link>
              </Button>

              <Button asChild size="lg" className="flex items-center">
                <Link to="/">
                  <Home className="mr-2 h-5 w-5" />
                  トップページへ
                </Link>
              </Button>

              <Button
                variant="secondary"
                size="lg"
                className="flex items-center"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                ページを再読み込み
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
