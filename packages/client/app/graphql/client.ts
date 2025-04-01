import { GraphQLClient } from 'graphql-request';

// APIのエンドポイントURL（環境によって変更）
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/graphql';

// GraphQLクライアントのインスタンスを作成
const graphqlClient = new GraphQLClient(API_URL, {
  headers: {
    // 認証情報などの追加ヘッダーをここに設定
  },
});

// 認証トークンを設定するヘルパー関数
export const setAuthToken = (token: string | null) => {
  if (token) {
    graphqlClient.setHeader('Authorization', `Bearer ${token}`);
  } else {
    graphqlClient.setHeader('Authorization', '');
  }
};

export default graphqlClient;
