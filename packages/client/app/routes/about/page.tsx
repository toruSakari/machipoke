import { MapPin, Users, Search, Star, Coffee, Camera } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* ヒーローセクション */}
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          マチポケについて
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          地元の人だけが知る場所を共有するプラットフォーム
        </p>
      </div>

      {/* ミッションセクション */}
      <div className="mb-20">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">私たちのミッション</h2>
          <div className="mx-auto mt-4 h-1 w-20 rounded bg-primary"></div>
        </div>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-lg leading-relaxed text-gray-600">
            マチポケは、一般的な観光ガイドやレビューサイトでは見つけられない、
            本当に価値のある場所の情報を集め、共有することで、旅行者や地域探索者に
            新しい発見の喜びを提供することを目指しています。
          </p>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            私たちは、多くの人が訪れる有名な観光スポットだけでなく、
            地元の人だけが知る隠れた名所や特別な場所にスポットライトを当て、
            より深く、より本物の旅の体験をサポートします。
          </p>
        </div>
      </div>

      {/* 特徴セクション */}
      <div className="mb-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">サービスの特徴</h2>
          <div className="mx-auto mt-4 h-1 w-20 rounded bg-primary"></div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center rounded-lg border border-gray-200 p-6 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin size={28} />
            </div>
            <h3 className="mt-4 text-xl font-medium text-gray-900">地元の穴場スポット</h3>
            <p className="mt-2 flex-grow text-base text-gray-600">
              観光ガイドには載っていない、地元の人だけが知る特別な場所を発見できます。
            </p>
          </div>

          <div className="flex flex-col items-center rounded-lg border border-gray-200 p-6 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users size={28} />
            </div>
            <h3 className="mt-4 text-xl font-medium text-gray-900">コミュニティの知恵</h3>
            <p className="mt-2 flex-grow text-base text-gray-600">
              地元の人や訪問者が実際に体験した情報を共有し、より本物の体験を提供します。
            </p>
          </div>

          <div className="flex flex-col items-center rounded-lg border border-gray-200 p-6 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Search size={28} />
            </div>
            <h3 className="mt-4 text-xl font-medium text-gray-900">地図ベースで探索</h3>
            <p className="mt-2 flex-grow text-base text-gray-600">
              地図上で簡単にスポットを見つけて、新しい場所を効率的に探索できます。
            </p>
          </div>

          <div className="flex flex-col items-center rounded-lg border border-gray-200 p-6 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Star size={28} />
            </div>
            <h3 className="mt-4 text-xl font-medium text-gray-900">穴場度評価</h3>
            <p className="mt-2 flex-grow text-base text-gray-600">
              スポットの「穴場度」を5段階で評価し、まだ知られていない宝石のような場所を見つけられます。
            </p>
          </div>

          <div className="flex flex-col items-center rounded-lg border border-gray-200 p-6 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Coffee size={28} />
            </div>
            <h3 className="mt-4 text-xl font-medium text-gray-900">ベストシーズン・時間帯</h3>
            <p className="mt-2 flex-grow text-base text-gray-600">
              それぞれのスポットを訪れるのに最適な季節や時間帯の情報を共有できます。
            </p>
          </div>

          <div className="flex flex-col items-center rounded-lg border border-gray-200 p-6 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Camera size={28} />
            </div>
            <h3 className="mt-4 text-xl font-medium text-gray-900">写真で共有</h3>
            <p className="mt-2 flex-grow text-base text-gray-600">
              美しい写真でスポットの魅力を伝え、訪問する前にイメージを掴むことができます。
            </p>
          </div>
        </div>
      </div>

      {/* ストーリーセクション */}
      <div className="mb-20 rounded-2xl bg-gray-50 p-8 lg:p-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">私たちのストーリー</h2>
          <div className="mx-auto mt-4 h-1 w-20 rounded bg-primary"></div>
          <div className="mt-8 space-y-6 text-left text-lg leading-relaxed text-gray-600">
            <p>
              マチポケは、旅行が好きな3人の友人によって2023年に設立されました。彼らは旅行中、観光客で混雑した有名スポットよりも、地元の人に教えてもらった隠れた名所での体験が、いつも最も思い出深いものだと気づきました。
            </p>
            <p>
              「もし、そのような地元の人だけが知る特別な場所を簡単に見つけられるプラットフォームがあれば、多くの人がより充実した旅の体験ができるのではないか」
              - この考えが、マチポケの誕生につながりました。
            </p>
            <p>
              地元の人々の知恵を集め、まだ知られていない魅力的な場所を発見し、そして共有する。
              マチポケは、そんな新しい旅の形を提案しています。
            </p>
          </div>
        </div>
      </div>

      {/* チームセクション */}
      <div className="mb-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">チームメンバー</h2>
          <div className="mx-auto mt-4 h-1 w-20 rounded bg-primary"></div>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="h-40 w-40 overflow-hidden rounded-full">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80"
                alt="佐藤一郎"
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="mt-6 text-xl font-medium text-gray-900">佐藤一郎</h3>
            <p className="text-gray-500">共同創業者 & CEO</p>
            <p className="mt-3 text-base text-gray-600">
              旅行と写真が趣味。日本全国の隠れた名所を訪れることが人生の目標。
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="h-40 w-40 overflow-hidden rounded-full">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80"
                alt="鈴木花子"
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="mt-6 text-xl font-medium text-gray-900">鈴木花子</h3>
            <p className="text-gray-500">共同創業者 & デザイナー</p>
            <p className="mt-3 text-base text-gray-600">
              ローカルカルチャーとデザインの融合に情熱を持つ。地域の魅力を伝えるビジュアル表現を追求。
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="h-40 w-40 overflow-hidden rounded-full">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80"
                alt="田中健太"
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="mt-6 text-xl font-medium text-gray-900">田中健太</h3>
            <p className="text-gray-500">共同創業者 & CTO</p>
            <p className="mt-3 text-base text-gray-600">
              テクノロジーの力で人々の新しい発見を後押しすることを目指す。地図とデータを愛するエンジニア。
            </p>
          </div>
        </div>
      </div>

      {/* CTAセクション */}
      <div className="rounded-2xl bg-primary p-8 text-center text-white lg:p-12">
        <h2 className="text-3xl font-bold">あなたの知っている場所を共有しませんか？</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/90">
          地元の人だけが知る特別な場所、お気に入りの穴場スポット、訪れる価値のある隠れた名所。
          あなたの知識を共有して、他の人の旅をもっと特別なものにしましょう。
        </p>
        <div className="mt-8 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Button asChild size="lg" variant="secondary" className="font-semibold text-primary">
            <Link to="/auth">今すぐ始める</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="font-semibold text-primary">
            <Link to="/map">スポットを探す</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
