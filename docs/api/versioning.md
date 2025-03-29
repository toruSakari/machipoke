# マチポケ API バージョニング方針

## 概要

このドキュメントでは、マチポケのGraphQL APIのバージョニング方針について詳細に説明します。APIのバージョニングは、バックエンドの変更がクライアントアプリケーションに与える影響を最小限に抑えながら、APIの進化と改善を可能にするために重要です。

## GraphQLにおけるバージョニング

従来のRESTful APIとは異なり、GraphQLは本質的に進化に対応できるよう設計されています。クライアントは必要なフィールドのみをリクエストするため、新しいフィールドの追加はバージョニングを必要としません。しかし、スキーマの変更によっては互換性の問題が生じる可能性があります。

## マチポケのバージョニング原則

マチポケAPIでは、以下の原則に従ってバージョニングを行います：

### 1. スキーマ設計の安定性

- **後方互換性の維持**: 既存のフィールドやタイプは変更せず、新しい機能は追加のフィールドやタイプとして導入します
- **破壊的変更の回避**: フィールドの削除や型の変更などの破壊的変更は避けます
- **非推奨化（Deprecation）**: 削除予定のフィールドは、まず非推奨としてマークします

### 2. 非推奨化プロセス

フィールドやタイプを削除する場合は、以下のプロセスを適用します：

1. **非推奨としてマーク**: GraphQLの`@deprecated`ディレクティブを使用
2. **移行期間の提供**: 非推奨化から実際の削除までに少なくとも6ヶ月の移行期間を設ける
3. **ドキュメントの更新**: 非推奨となったフィールドの代替手段を明確に文書化

```graphql
type Spot {
  id: ID!
  name: String!
  # 以下のフィールドは2025年6月に削除予定です。代わりにlocationを使用してください。
  latitude: Float @deprecated(reason: "代わりにlocation.latitudeを使用してください")
  longitude: Float @deprecated(reason: "代わりにlocation.longitudeを使用してください")
  # 新しい位置情報フィールド
  location: Location
}

type Location {
  latitude: Float!
  longitude: Float!
  # 追加情報
  altitude: Float
  accuracy: Float
}
```

### 3. スキーマ変更タイプ

APIの変更は以下のカテゴリに分類されます：

#### 非破壊的変更（バージョニング不要）

- 新しいタイプの追加
- 既存タイプへの新しいフィールドの追加
- 既存フィールドへのNullable引数の追加
- 既存の列挙型への新しい値の追加（特定の条件下）
- レスポンスデータの拡張（既存のフィールドにより多くのデータを返す）

#### 潜在的に破壊的な変更（非推奨化プロセスが必要）

- フィールドの削除または名前変更
- フィールドの型の変更（特にNullableからNon-Nullableへの変更）
- 必須引数の追加
- 列挙型からの値の削除

### 4. 明示的なAPIバージョン指定

GraphQLの柔軟性を活かしつつも、大きな変更のためにAPIバージョンを明示的に指定する仕組みを導入します：

#### GraphQLエンドポイントのバージョニング

- **URLパス内のバージョン**: `/graphql/v1`, `/graphql/v2`
- **MVPリリースでは `/graphql`（バージョン無指定）で最新バージョンを提供**

#### バージョン移行のサポート

複数のAPIバージョンは、以下の条件で並行してサポートされます：

- 主要バージョン（v1, v2など）は、少なくとも1年間サポート
- 各バージョンのサポート終了日は3ヶ月前に通知
- 古いバージョンの非推奨化と新バージョンへの移行手順をドキュメント化

## バージョン管理の実装

### 1. リクエストヘッダーによるバージョン指定（オプション）

URLパスに加えて、リクエストヘッダーでもバージョンを指定可能にします：

```
Accept-Version: v1
```

これにより、同じエンドポイントに対して異なるバージョンのスキーマを適用することができます。

### 2. バージョン別スキーマの構築

```typescript
// src/interfaces/api/graphql/schema/index.ts
import { makeSchemaForVersion } from './versions';

// バージョンに基づいてスキーマを構築
export const getSchemaForVersion = (version: string) => {
  switch (version) {
    case 'v2':
      return makeSchemaForVersion('v2');
    case 'v1':
    default:
      return makeSchemaForVersion('v1');
  }
};
```

### 3. スキーマの分離と拡張

```typescript
// src/interfaces/api/graphql/schema/versions/v1/index.ts
import { v1Types } from './types';
import { v1Queries } from './queries';
import { v1Mutations } from './mutations';

export const v1Schema = {
  types: v1Types,
  queries: v1Queries,
  mutations: v1Mutations
};

// src/interfaces/api/graphql/schema/versions/v2/index.ts
import { v1Schema } from '../v1';
import { v2Types } from './types';
import { v2Queries } from './queries';
import { v2Mutations } from './mutations';

export const v2Schema = {
  // v1の内容を拡張
  types: [...v1Schema.types, ...v2Types],
  queries: [...v1Schema.queries, ...v2Queries],
  mutations: [...v1Schema.mutations, ...v2Mutations]
};
```

## バージョン移行ガイドライン

### 新バージョンのリリースフロー

1. **計画と設計**: 新機能と破壊的変更の特定
2. **プレビュー期間**: 開発者向けに新バージョンのプレビューとフィードバック収集
3. **ドキュメント**: 変更点と移行ステップの詳細なドキュメント作成
4. **リリース**: 新バージョンの公開と既存アプリへの移行サポート
5. **メンテナンス**: 両バージョンのサポートと監視

### 移行ガイド作成のポイント

- 破壊的変更の明確なリスト
- 各変更に対する移行ステップの詳細
- 新機能の利用メリットと導入例
- コード例を含む具体的な移行手順

## 監視とフィードバック

### APIバージョン使用状況の監視

- 各バージョンの使用状況を追跡
- 非推奨フィールドの使用を検出し、ユーザーに通知
- バージョン別のエラー率とパフォーマンスメトリクスの収集

### フィードバックループの構築

- 開発者アンケートの実施
- バグ報告と機能リクエストの収集
- 次期バージョンにフィードバックを反映

## まとめ

マチポケのAPIバージョニング戦略は、以下の点でバランスを取ることを目指しています：

1. GraphQLの柔軟性を最大限に活用
2. 後方互換性を維持しながらAPIの進化を可能にする
3. 開発者に予測可能で安定したAPIを提供
4. 必要に応じた新機能の追加とAPIの改善

この戦略により、クライアントアプリケーションへの影響を最小限に抑えつつ、APIを継続的に進化させることが可能になります。