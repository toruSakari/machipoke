import SchemaBuilder from '@pothos/core';
import ValidationPlugin from '@pothos/plugin-validation';
import { AppContext } from '../../types/bindings';

// GraphQLスキーマビルダーの初期化
export const builder = new SchemaBuilder<{
  Context: AppContext;
}>({
  plugins: [ValidationPlugin],
  validationOptions: {
    // バリデーションオプション
    stopOnFirstError: true,
  },
});

// Queryタイプを定義
builder.queryType({
  description: 'クエリのルートタイプ',
});

// Mutationタイプを定義
builder.mutationType({
  description: 'ミューテーションのルートタイプ',
});

// 日付型のスカラーを定義
builder.scalarType('Date', {
  serialize: (value) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return null;
  },
  parseValue: (value) => {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return null;
  },
});

// GraphQLスキーマを構築
export function buildSchema() {
  // 各リゾルバーをインポート
  require('./types/user');
  require('./types/spot');
  require('./resolvers/user');
  require('./resolvers/spot');

  return builder.toSchema();
}
