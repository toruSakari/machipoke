import { Link } from 'react-router';
import { MapPin, Search, MapPinned, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            <span className="block xl:inline">あなたの知っている</span>{' '}
            <span className="block text-primary xl:inline">特別な場所</span>
            <span className="block xl:inline">を共有しよう</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
            マチポケは、地元の人や訪れた人が発見した隠れた名所、穴場スポット、特別な場所を共有するためのプラットフォームです。
          </p>
          <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
            <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
              <Button asChild size="lg" className="flex items-center">
                <Link to="/map">
                  <MapPin className="mr-2 h-5 w-5" />
                  地図で探す
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="flex items-center">
                <Link to="/spots">
                  <Search className="mr-2 h-5 w-5" />
                  スポットを見る
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">マチポケでできること</h2>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPinned size={28} />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">特別な場所を共有</h3>
                <p className="mt-2 text-center text-base text-gray-500">
                  あなたが知っている隠れた名所や穴場スポットを他の人と共有できます。
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin size={28} />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">地図ベースで探索</h3>
                <p className="mt-2 text-center text-base text-gray-500">
                  地図上でスポットを見つけて、新しい場所を探索することができます。
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Star size={28} />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">地元の魅力を発見</h3>
                <p className="mt-2 text-center text-base text-gray-500">
                  観光ガイドにはない、地元の人だけが知る特別な場所や体験を発見できます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              あなたの知っている場所を共有しませんか？
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
              新しいスポットを登録して、他の人に特別な場所を教えてあげましょう。
            </p>
            <div className="mt-8">
              <Button asChild size="lg" variant="secondary" className="font-semibold text-primary">
                <Link to="/auth">今すぐ始める</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
