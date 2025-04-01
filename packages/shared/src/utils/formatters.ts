/**
 * 日付をフォーマットする
 * @param date 日付
 * @param format フォーマット（'yyyy-MM-dd'など）
 * @returns フォーマットされた日付文字列
 */
export function formatDate(date: Date, format: string = 'yyyy-MM-dd'): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // フォーマットの置換
  return format
    .replace('yyyy', year.toString())
    .replace('MM', month.toString().padStart(2, '0'))
    .replace('dd', day.toString().padStart(2, '0'))
    .replace('HH', hours.toString().padStart(2, '0'))
    .replace('mm', minutes.toString().padStart(2, '0'))
    .replace('ss', seconds.toString().padStart(2, '0'));
}

/**
 * 数値をカンマ区切りでフォーマットする
 * @param num 数値
 * @returns カンマ区切りの文字列
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * 住所を整形する（都道府県、市区町村、それ以降で分割）
 * 例: "東京都渋谷区神宮前1-2-3" => { prefecture: "東京都", city: "渋谷区", address: "神宮前1-2-3" }
 */
export function parseJapaneseAddress(fullAddress: string): {
  prefecture: string;
  city: string;
  address: string;
} {
  // 都道府県の正規表現
  const prefectureRegex = /^(北海道|東京都|(?:京都|大阪)府|.{2,3}県)/;
  const prefectureMatch = fullAddress.match(prefectureRegex);

  if (!prefectureMatch) {
    return {
      prefecture: '',
      city: '',
      address: fullAddress,
    };
  }

  const prefecture = prefectureMatch[0];
  const afterPrefecture = fullAddress.slice(prefecture.length);

  // 市区町村の抽出（〇〇市、〇〇区、〇〇町、〇〇村）
  const cityRegex = /^(.+?[市区町村])/;
  const cityMatch = afterPrefecture.match(cityRegex);

  if (!cityMatch) {
    return {
      prefecture,
      city: '',
      address: afterPrefecture,
    };
  }

  const city = cityMatch[0];
  const address = afterPrefecture.slice(city.length);

  return {
    prefecture,
    city,
    address,
  };
}
