import { FileText, Shield, Lock, AlertTriangle, HelpCircle, Bookmark } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* ヒーローセクション */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">利用規約</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          マチポケをご利用いただく際の規約とガイドライン
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
            <a href="#service-use" className="flex items-center text-primary hover:underline">
              <Bookmark className="mr-2 h-4 w-4" />
              2. サービスの利用
            </a>
          </li>
          <li>
            <a href="#account" className="flex items-center text-primary hover:underline">
              <Bookmark className="mr-2 h-4 w-4" />
              3. アカウント
            </a>
          </li>
          <li>
            <a href="#content" className="flex items-center text-primary hover:underline">
              <Bookmark className="mr-2 h-4 w-4" />
              4. コンテンツと知的財産権
            </a>
          </li>
          <li>
            <a href="#privacy" className="flex items-center text-primary hover:underline">
              <Bookmark className="mr-2 h-4 w-4" />
              5. プライバシーとデータ
            </a>
          </li>
          <li>
            <a href="#prohibited" className="flex items-center text-primary hover:underline">
              <Bookmark className="mr-2 h-4 w-4" />
              6. 禁止事項
            </a>
          </li>
          <li>
            <a href="#termination" className="flex items-center text-primary hover:underline">
              <Bookmark className="mr-2 h-4 w-4" />
              7. 契約の終了
            </a>
          </li>
          <li>
            <a href="#disclaimer" className="flex items-center text-primary hover:underline">
              <Bookmark className="mr-2 h-4 w-4" />
              8. 免責事項
            </a>
          </li>
          <li>
            <a href="#changes" className="flex items-center text-primary hover:underline">
              <Bookmark className="mr-2 h-4 w-4" />
              9. 変更と通知
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
              <FileText size={20} />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">1. はじめに</h2>
          </div>
          <div className="pl-14">
            <p className="mb-4 text-gray-700">
              マチポケ（以下「本サービス」）へようこそ。本サービスは、株式会社マチポケ（以下「当社」）が提供するWebサービスです。
              本利用規約（以下「本規約」）は、本サービスの利用に関する条件を定めるものであり、本サービスを利用するすべてのユーザー（以下「ユーザー」）に適用されます。
            </p>
            <p className="mb-4 text-gray-700">
              本サービスを利用することにより、ユーザーは本規約に同意したものとみなされます。本規約に同意できない場合は、本サービスを利用することはできません。
            </p>
            <p className="text-gray-700">
              本規約と併せて、
              <Link to="/privacy" className="text-primary hover:underline">
                プライバシーポリシー
              </Link>
              もご確認ください。プライバシーポリシーは本規約の一部を構成します。
            </p>
          </div>
        </section>

        <section id="service-use" className="scroll-mt-20">
          <div className="mb-4 flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Shield size={20} />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">2. サービスの利用</h2>
          </div>
          <div className="pl-14">
            <p className="mb-4 text-gray-700">
              本サービスは、地元の人や訪れた人が発見した隠れた名所、穴場スポット、特別な場所を共有するためのプラットフォームです。
              ユーザーは本サービスを通じて、場所の情報を投稿、閲覧、コメントすることができます。
            </p>
            <p className="mb-4 text-gray-700">
              当社は、本サービスの品質向上や機能追加のため、事前の通知なくサービス内容を変更することがあります。
              また、システムメンテナンスなどの理由により、一時的にサービスの提供を停止することがあります。
            </p>
            <p className="text-gray-700">
              本サービスは13歳以上の方を対象としています。13歳未満の方は保護者の同意を得た上でご利用ください。
            </p>
          </div>
        </section>

        <section id="account" className="scroll-mt-20">
          <div className="mb-4 flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock size={20} />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">3. アカウント</h2>
          </div>
          <div className="pl-14">
            <p className="mb-4 text-gray-700">
              本サービスの一部機能を利用するためには、アカウントの作成が必要です。アカウント作成時には、正確かつ最新の情報を提供していただく必要があります。
            </p>
            <p className="mb-4 text-gray-700">
              ユーザーは自身のアカウント情報（パスワードを含む）の機密性を保持する責任があり、
              アカウントを通じて行われるすべての活動に責任を負います。
              不正アクセスや不正利用を発見した場合は、直ちに当社にご連絡ください。
            </p>
            <p className="text-gray-700">
              当社は、ユーザーが本規約に違反した場合、または不正行為を行った場合、
              予告なくアカウントを停止または削除する権利を有します。
            </p>
          </div>
        </section>

        <section id="content" className="scroll-mt-20">
          <div className="mb-4 flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileText size={20} />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">4. コンテンツと知的財産権</h2>
          </div>
          <div className="pl-14">
            <p className="mb-4 text-gray-700">
              ユーザーが本サービスに投稿したコンテンツ（テキスト、画像、レビューなど）の著作権はユーザーに帰属します。
              ただし、当社はサービス提供のために必要な範囲でこれらのコンテンツを使用、複製、修正、配布する権利を有します。
            </p>
            <p className="mb-4 text-gray-700">
              ユーザーは、投稿するコンテンツについて、第三者の権利を侵害していないこと、法令に違反していないことを保証するものとします。
              第三者の権利を侵害するコンテンツや、不適切なコンテンツを発見した場合は、当社に報告してください。
            </p>
            <p className="text-gray-700">
              本サービスのロゴ、デザイン、プログラムなどの知的財産権は当社に帰属します。
              これらを無断で使用、複製、配布することは禁止されています。
            </p>
          </div>
        </section>

        <section id="privacy" className="scroll-mt-20">
          <div className="mb-4 flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock size={20} />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">5. プライバシーとデータ</h2>
          </div>
          <div className="pl-14">
            <p className="mb-4 text-gray-700">
              当社のプライバシーポリシーでは、個人情報の収集、使用、共有方法について説明しています。
              本サービスを利用することで、ユーザーはプライバシーポリシーに同意したものとみなされます。
            </p>
            <p className="mb-4 text-gray-700">
              当社は、ユーザーの個人情報を保護するために適切な措置を講じていますが、
              インターネットを通じた情報の送信が100%安全であることを保証することはできません。
            </p>
            <p className="text-gray-700">
              詳細については、
              <Link to="/privacy" className="text-primary hover:underline">
                プライバシーポリシー
              </Link>
              をご確認ください。
            </p>
          </div>
        </section>

        <section id="prohibited" className="scroll-mt-20">
          <div className="mb-4 flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <AlertTriangle size={20} />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">6. 禁止事項</h2>
          </div>
          <div className="pl-14">
            <p className="mb-4 text-gray-700">
              ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません：
            </p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-gray-700">
              <li>法令または公序良俗に違反する行為</li>
              <li>第三者の権利（著作権、商標権、プライバシー権など）を侵害する行為</li>
              <li>虚偽または誤解を招く情報を投稿する行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>不正アクセスまたはハッキングを試みる行為</li>
              <li>他のユーザーを脅迫、嫌がらせ、差別する行為</li>
              <li>スパム、迷惑広告、不適切なプロモーションを行う行為</li>
              <li>マルウェアやウイルスを含むコンテンツをアップロードする行為</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ul>
            <p className="text-gray-700">
              これらの禁止事項に違反した場合、アカウントの停止や削除、法的措置を取る場合があります。
            </p>
          </div>
        </section>

        <section id="termination" className="scroll-mt-20">
          <div className="mb-4 flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileText size={20} />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">7. 契約の終了</h2>
          </div>
          <div className="pl-14">
            <p className="mb-4 text-gray-700">
              ユーザーはいつでも本サービスの利用を停止し、アカウントを削除することができます。
              アカウント削除の方法については、アカウント設定ページをご確認ください。
            </p>
            <p className="mb-4 text-gray-700">
              当社は、ユーザーが本規約に違反した場合、またはその他の理由により、
              予告なくユーザーのアカウントを停止または削除し、サービスの提供を終了する権利を有します。
            </p>
            <p className="text-gray-700">
              アカウント削除後も、他のユーザーとの間で共有されたコンテンツは引き続き本サービス上に残る場合があります。
            </p>
          </div>
        </section>

        <section id="disclaimer" className="scroll-mt-20">
          <div className="mb-4 flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <AlertTriangle size={20} />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">8. 免責事項</h2>
          </div>
          <div className="pl-14">
            <p className="mb-4 text-gray-700">
              本サービスは「現状有姿」で提供され、特定の目的への適合性、商品性、権利侵害の不存在を含む、明示または黙示の保証はありません。
            </p>
            <p className="mb-4 text-gray-700">
              当社は、本サービスの中断、遅延、セキュリティ上の問題、エラーまたは不具合について責任を負いません。
              また、ユーザーが投稿したコンテンツの正確性、信頼性、適法性について責任を負いません。
            </p>
            <p className="text-gray-700">
              法律で許容される最大限の範囲で、当社は本サービスの利用に起因する直接的、間接的、付随的、特別、懲罰的、または結果的な損害について責任を負いません。
            </p>
          </div>
        </section>

        <section id="changes" className="scroll-mt-20">
          <div className="mb-4 flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileText size={20} />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">9. 変更と通知</h2>
          </div>
          <div className="pl-14">
            <p className="mb-4 text-gray-700">
              当社は、必要に応じて本規約を変更する権利を有します。
              変更があった場合は、本サービス上で通知し、変更後の規約を掲載します。
              変更後も本サービスを継続して利用することにより、ユーザーは変更後の規約に同意したものとみなされます。
            </p>
            <p className="text-gray-700">
              重要な変更がある場合は、電子メールまたは本サービス上の通知機能を通じてお知らせします。
              定期的に本規約をご確認いただくことをお勧めします。
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
              本規約に関するご質問やご意見がある場合は、以下の方法でお問い合わせください:
            </p>
            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 font-medium">株式会社マチポケ</p>
              <p className="mb-1">メール: support@machipoke.jp</p>
              <p className="mb-1">住所: 〒123-4567 東京都渋谷区〇〇町1-2-3</p>
              <p>電話: 03-1234-5678（平日 10:00-18:00）</p>
            </div>
            <p className="text-gray-700">当社は、できる限り迅速にお問い合わせに対応いたします。</p>
          </div>
        </section>
      </div>
    </div>
  );
}
