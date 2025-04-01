// アプリケーション全体の設定値
export const APP_CONFIG = {
  // アプリケーション情報
  APP_NAME: 'マチポケ',
  APP_DESCRIPTION: '地元の人だけが知る場所を共有するプラットフォーム',

  // API関連
  API_ENDPOINT: process.env.API_ENDPOINT || '/api',

  // マップ関連
  DEFAULT_MAP_CENTER: {
    latitude: 35.6895, // 東京駅の緯度
    longitude: 139.6917, // 東京駅の経度
  },
  DEFAULT_ZOOM_LEVEL: 13,

  // ページネーション
  DEFAULT_PAGE_SIZE: 20,

  // 画像アップロード関連
  MAX_UPLOAD_SIZE_MB: 5,
  SUPPORTED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],

  // 検索関連
  SEARCH_RADIUS_KM: 10,

  // ユーザー関連
  DEFAULT_TRUST_SCORE: 50,

  // レート制限
  MAX_SPOTS_PER_DAY: 10, // 1日あたりのスポット投稿上限
};
