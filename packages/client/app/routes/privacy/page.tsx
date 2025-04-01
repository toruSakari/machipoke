import {
  Lock,
  Shield,
  Eye,
  Database,
  Globe,
  Bell,
  HelpCircle,
  FileText,
  Bookmark,
} from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* ヘッダーセクション */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          プライバシーポリシー
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          マチポケにおける個人情報の取り扱いについて
        </p>
        <div className="mx-auto mt-4 h-1 w-20 rounded bg-primary"></div>
      </div>

      {/* 最終更新日 */}
      <div className="mb-8 text-center">
        <p className="text-sm text-gray-500">最終更新日: 2023年12月1日</p>
      </div>

      {/* 目次 */}
      <div className="mb-12 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">目次</h2>
        <ul className="space-y-2">
          <li>
            <a href="#introduction" className="flex items-center text-primary hover:underline">
              <Bookmark className="mr-2 h-4 w-4" />
              1. はじめに
            </a>
          </li>
          <li>
            <a
              href="#information-collected"
              className="flex items-center text-primary hover:underline"
            >
              <Bookmark className="mr-2 h-4 w-4" />
              2. 収集する情報
            </a>
          </li>
          <li>
            <a
              href="#use-of-information"
              className="flex items-center text-primary hover:underline"
            >
              <Bookmark className="mr-2 h-4 w-4" />
              3. 情報の利用方法
            </a>
          </li>
          <li>
            <a
              href="#information-sharing"
              className="flex items-center text-primary hover:underline"
            >
              <Bookmark className="mr-2 h-4 w-4" />
              4. 情報の共有
            </a>
          </li>
          <li>
            <a href="#data-security" className="flex items-center text-primary hover:underline">
              <Bookmark className="mr-2 h-4 w-4" />
              5. データセキュリティ
            </a>
          </li>
          <li>
            <a href="#user-rights" className="flex items-center text-primary hover:underline">
              <Bookmark className="mr-2 h-4 w-4" />
              6. ユーザーの権利
            </a>
          </li>
          <li>
            <a href="#cookies" className="flex items-center text-primary hover:underline">
              <Bookmark className="mr-2 h-4 w-4" />
              7. クッキーとトラッキング技術
            </a>
          </li>
          <li>
            <a href="#international" className="flex items-center text-primary hover:underline">
              <Bookmark className="mr-2 h-4 w-4" />
              8. 国際的なデータ転送
            </a>
          </li>
          <li>
            <a href="#changes" className="flex items-center text-primary hover:underline">
              <Bookmark className="mr-2 h-4 w-4" />
              9. ポリシーの変更
            </a>
          </li>
          <li>
            <a href="#contact" className="flex items-center text-primary hover:underline">
              <Bookmark className="mr-2 h-4 w-4" />
              10. お問い合わせ
            </a>
          </li>
        </ul>
      </div>

      {/* 各セクションのコンテンツ */}
      <div className="space-y-12">
        <section id="introduction" className="scroll-mt-20">
          <div className="mb-4 flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Shield size={20} />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">1. はじめに</h2>
          </div>
          <div className="pl-14">
            <p className="mb-4 text-gray-700">
              株式会社マチポケ（以下「当社」）は、マチポケサービス（以下「本サービス」）のユーザープライバシーを尊重し、個人情報の保護に努めています。
              本プライバシーポリシーでは、当社がどのような情報を収集し、どのように使用、保護、共有するかについて説明します。
            </p>
            <p className="mb-4 text-gray-700">
              本サービスを利用することにより、ユーザーは本プライバシーポリシーに記載された情報の収集、使用、共有、保存に同意したものとみなされます。
              本プライバシーポリシーに同意できない場合は、本サービスの利用をお控えください。
            </p>
            <p className="text-gray-700">
              本プライバシーポリシーは、
              <Link to="/terms" className="text-primary hover:underline">
                利用規約
              </Link>
              と併せてお読みいただくことをお勧めします。
            </p>
          </div>
        </section>

        <section id="information-collected" className="scroll-mt-20">
          <div className="mb-4 flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Database size={20} />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">2. 収集する情報</h2>
          </div>
          <div className="pl-14">
            <p className="mb-4 text-gray-700">
              当社は、サービスの提供とユーザー体験の向上のために、以下の情報を収集することがあります：
            </p>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">ユーザーが提供する情報:</h3>
            <ul className="mb-4 list-inside list-disc space-y-2 text-gray-700">
              <li>アカウント情報（名前、メールアドレス、パスワード）</li>
              <li>プロフィール情報（プロフィール画像、居住地、自己紹介文など）</li>
              <li>ユーザーが投稿するコンテンツ（スポット情報、写真、コメント、評価など）</li>
              <li>お問い合わせやフィードバックの内容</li>
            </ul>

            <h3 className="mb-2 text-lg font-semibold text-gray-900">自動的に収集される情報:</h3>
            <ul className="mb-4 list-inside list-disc space-y-2 text-gray-700">
              <li>デバイス情報（IPアドレス、ブラウザタイプ、オペレーティングシステムなど）</li>
              <li>位置情報（ユーザーの同意を得た場合）</li>
              <li>利用状況データ（アクセス日時、閲覧したページ、操作ログなど）</li>
              <li>Cookie情報やトラッキング技術を通じて収集される情報</li>
            </ul>

            <p className="text-gray-700">
              当社は、特に必要がない限り、人種、宗教、性的指向、健康状態など、機微な個人情報の収集は行いません。
            </p>
          </div>
        </section>

        <section id="use-of-information" className="scroll-mt-20">
          <div className="mb-4 flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileText size={20} />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">3. 情報の利用方法</h2>
          </div>
          <div className="pl-14">
            <p className="mb-4 text-gray-700">当社は収集した情報を以下の目的で利用します：</p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-gray-700">
              <li>本サービスの提供と運営</li>
              <li>ユーザーアカウントの管理と認証</li>
              <li>カスタマイズされたコンテンツの提供（おすすめスポットの表示など）</li>
              <li>サービスの改善と新機能の開発</li>
              <li>利用状況の分析と統計データの作成</li>
              <li>不正行為の検出と防止</li>
              <li>技術的な問題の診断と解決</li>
              <li>お問い合わせへの対応</li>
              <li>重要な通知やアップデートの連絡</li>
            </ul>
            <p className="text-gray-700">
              当社は、収集した情報を、本プライバシーポリシーで説明されていない目的で使用する場合は、事前にユーザーの同意を求めます。
            </p>
          </div>
        </section>

        <section id="information-sharing" className="scroll-mt-20">
          <div className="mb-4 flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Globe size={20} />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">4. 情報の共有</h2>
          </div>
          <div className="pl-14">
            <p className="mb-4 text-gray-700">
              当社は、収集した情報を以下の場合に共有することがあります：
            </p>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              サービス提供に関わる第三者:
            </h3>
            <p className="mb-4 text-gray-700">
              当社は、サービスの提供や改善のため、信頼できる第三者サービスプロバイダーと情報を共有することがあります。
              これらのプロバイダーは、当社のためにサービスを提供する目的でのみ情報を使用し、
              適切なセキュリティ対策を講じることが義務付けられています。
            </p>

            <h3 className="mb-2 text-lg font-semibold text-gray-900">法的要件:</h3>
            <p className="mb-4 text-gray-700">
              法的義務の遵守、当社の権利や財産の保護、不正行為の防止など、法的に必要な場合に情報を開示することがあります。
            </p>

            <h3 className="mb-2 text-lg font-semibold text-gray-900">ビジネス移管:</h3>
            <p className="mb-4 text-gray-700">
              合併、買収、資産の売却などのビジネス移管が発生した場合、ユーザー情報が移管される資産の一部となる可能性があります。
              このような場合、当社は影響を受けるユーザーに通知します。
            </p>

            <h3 className="mb-2 text-lg font-semibold text-gray-900">ユーザーの同意:</h3>
            <p className="text-gray-700">
              ユーザーの同意を得た場合、情報を共有することがあります。
            </p>
          </div>
        </section>

        <section id="data-security" className="scroll-mt-20">
          <div className="mb-4 flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock size={20} />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">5. データセキュリティ</h2>
          </div>
          <div className="pl-14">
            <p className="mb-4 text-gray-700">
              当社は、ユーザーの個人情報を不正アクセス、変更、開示、または破壊から保護するために適切な技術的・組織的措置を講じています。
              具体的には、以下のセキュリティ対策を実施しています：
            </p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-gray-700">
              <li>データの暗号化（SSL/TLSプロトコルの使用）</li>
              <li>アクセス制限と認証システム</li>
              <li>定期的なセキュリティ評価と脆弱性スキャン</li>
              <li>従業員へのセキュリティトレーニング</li>
              <li>バックアップシステムとデータ復旧プロセス</li>
            </ul>
            <p className="text-gray-700">
              しかしながら、インターネットを通じたデータ送信や電子ストレージの方法は、100%安全というわけではありません。
              当社は最大限の努力を払ってユーザーの情報を保護しますが、絶対的なセキュリティを保証することはできません。
            </p>
          </div>
        </section>

        <section id="user-rights" className="scroll-mt-20">
          <div className="mb-4 flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Eye size={20} />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">6. ユーザーの権利</h2>
          </div>
          <div className="pl-14">
            <p className="mb-4 text-gray-700">
              当社は、ユーザーが自身の個人情報に関して以下の権利を有することを認識しています：
            </p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-gray-700">
              <li>
                <strong>アクセス権：</strong>
                ユーザーは、当社が保持している自身の個人情報にアクセスする権利があります。
              </li>
              <li>
                <strong>修正権：</strong>
                不正確または不完全な個人情報の修正を要求する権利があります。
              </li>
              <li>
                <strong>削除権：</strong>一定の条件下で、個人情報の削除を要求する権利があります。
              </li>
              <li>
                <strong>処理制限権：</strong>
                一定の条件下で、個人情報の処理を制限する権利があります。
              </li>
              <li>
                <strong>データポータビリティ権：</strong>
                構造化された形式で個人情報を受け取り、他の管理者に転送する権利があります。
              </li>
              <li>
                <strong>異議申立権：</strong>
                一定の条件下で、個人情報の処理に異議を唱える権利があります。
              </li>
            </ul>
            <p className="mb-4 text-gray-700">
              これらの権利を行使するには、以下のお問い合わせ先までご連絡ください。
              当社は、お客様の要求に対し、適用法に従って対応します。
            </p>
            <p className="text-gray-700">
              なお、アカウント設定ページからも、一部の個人情報の閲覧や修正が可能です。
            </p>
          </div>
        </section>

        <section id="cookies" className="scroll-mt-20">
          <div className="mb-4 flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Database size={20} />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">7. クッキーとトラッキング技術</h2>
          </div>
          <div className="pl-14">
            <p className="mb-4 text-gray-700">
              当社は、ユーザー体験の向上と分析のためにCookieおよび類似のトラッキング技術を使用しています。
              Cookieとは、ウェブサイトがユーザーのブラウザに保存する小さなテキストファイルで、ユーザーが再訪問した際に認識するために使用されます。
            </p>
            <p className="mb-4 text-gray-700">当社が使用するCookieのタイプは以下の通りです：</p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-gray-700">
              <li>
                <strong>必須Cookie：</strong>本サービスの基本的な機能に必要なCookieです。
              </li>
              <li>
                <strong>機能Cookie：</strong>
                ユーザーの好みやカスタマイズした設定を記憶するためのCookieです。
              </li>
              <li>
                <strong>分析Cookie：</strong>
                ユーザーがどのようにサイトを使用しているかを理解し、サービスを改善するためのCookieです。
              </li>
              <li>
                <strong>広告Cookie：</strong>
                興味に基づいた広告を表示するためのCookieです（現在は使用していません）。
              </li>
            </ul>
            <p className="mb-4 text-gray-700">
              多くのブラウザでは、Cookieの受け入れを管理したり、新しいCookieを拒否したり、既存のCookieを削除したりする設定が可能です。
              ただし、Cookieを無効にすると、一部のサービス機能が正常に動作しなくなる可能性があります。
            </p>
            <p className="text-gray-700">
              当社は、Google
              Analyticsなどの第三者分析サービスも使用しており、これらのサービスも独自のCookieを使用することがあります。
            </p>
          </div>
        </section>

        <section id="international" className="scroll-mt-20">
          <div className="mb-4 flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Globe size={20} />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">8. 国際的なデータ転送</h2>
          </div>
          <div className="pl-14">
            <p className="mb-4 text-gray-700">
              当社は主に日本国内でデータを処理・保存していますが、一部のサービスプロバイダーは海外に拠点を置いている場合があります。
              そのため、ユーザーの個人情報が日本国外に転送され、保存、処理されることがあります。
            </p>
            <p className="mb-4 text-gray-700">
              当社は、個人情報の国際転送に関して適切な保護措置を講じており、
              転送先の国が十分なデータ保護レベルを提供していない場合は、適切な契約条項や保護措置を適用します。
            </p>
            <p className="text-gray-700">
              ユーザーが本サービスを利用することで、このような国際的なデータ転送に同意したものとみなされます。
            </p>
          </div>
        </section>

        <section id="changes" className="scroll-mt-20">
          <div className="mb-4 flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bell size={20} />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">9. ポリシーの変更</h2>
          </div>
          <div className="pl-14">
            <p className="mb-4 text-gray-700">
              当社は、法的要件の変更や当社のプラクティスの進化に応じて、本プライバシーポリシーを随時更新することがあります。
              変更がある場合は、本サービス上で通知し、更新されたポリシーを掲載します。
            </p>
            <p className="mb-4 text-gray-700">
              重要な変更については、電子メールによる通知や、サービス内の目立つ通知など、より直接的な方法でお知らせすることがあります。
            </p>
            <p className="text-gray-700">
              更新後もサービスを継続して利用することにより、ユーザーは変更後のプライバシーポリシーに同意したものとみなされます。
              定期的に本ポリシーをご確認いただくことをお勧めします。
            </p>
          </div>
        </section>

        <section id="contact" className="scroll-mt-20">
          <div className="mb-4 flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HelpCircle size={20} />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">10. お問い合わせ</h2>
          </div>
          <div className="pl-14">
            <p className="mb-4 text-gray-700">
              本プライバシーポリシーに関するご質問や懸念、または個人情報に関する権利行使のリクエストがある場合は、以下の方法でお問い合わせください：
            </p>
            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 font-medium">株式会社マチポケ 個人情報保護担当</p>
              <p className="mb-1">メール: privacy@machipoke.jp</p>
              <p className="mb-1">住所: 〒123-4567 東京都渋谷区〇〇町1-2-3</p>
              <p>電話: 03-1234-5678（平日 10:00-18:00）</p>
            </div>
            <p className="text-gray-700">
              当社は、プライバシーに関するすべての問い合わせに対して、合理的な期間内に対応いたします。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
