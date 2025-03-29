# マチポケ バックエンド開発ガイド

このドキュメントでは、マチポケプロジェクトのバックエンド開発に関するガイドラインと技術情報を提供します。

## 技術スタック

- **実行環境**: Cloudflare Workers
- **フレームワーク**: Hono
- **API**: GraphQL (Pothos GraphQL)
- **ORM**: Drizzle
- **データストレージ**:
  - Cloudflare D1（リレーショナルデータ）
  - Cloudflare KV（キャッシュ）
  - Cloudflare R2（画像ストレージ）
- **認証**: Cloudflare Access または Auth0連携
- **言語**: TypeScript
- **アーキテクチャ**: ドメイン駆動設計（DDD）

## プロジェクト構造

```
packages/server/
├── src/
│   ├── domain/         # ドメイン層（DDD）
│   │   ├── models/     # ドメインモデル
│   │   │   ├── spot/   # スポット関連モデル
│   │   │   ├── user/   # ユーザー関連モデル
│   │   │   └── ...     # その他ドメインモデル
│   │   ├── services/   # ドメインサービス
│   │   └── repositories/ # リポジトリインターフェース
│   ├── application/    # アプリケーション層
│   │   ├── commands/   # コマンドハンドラ
│   │   ├── queries/    # クエリハンドラ
│   │   └── services/   # アプリケーションサービス
│   ├── infrastructure/ # インフラ層
│   │   ├── persistence/ # 永続化
│   │   │   ├── cloudflareD1/ # Cloudflare D1実装
│   │   │   ├── cloudflareKV/ # Cloudflare KV実装
│   │   │   └── cloudflareR2/ # Cloudflare R2実装
│   │   └── auth/       # 認証機能
│   ├── interfaces/     # インターフェース層
│   │   ├── api/        # API定義
│   │   └── graphql/    # GraphQL実装
│   │       ├── resolvers/ # GraphQLリゾルバ
│   │       ├── types/    # GraphQL型定義
│   │       └── schema.ts # GraphQLスキーマ
│   ├── utils/          # ユーティリティ
│   ├── types/          # 型定義
│   ├── config/         # 設定ファイル
│   └── index.ts        # エントリーポイント
```

## 開発の始め方

### 環境のセットアップ

```bash
cd packages/server
npm install
npm run dev
```

開発サーバーが起動し、通常 `http://localhost:8787` でアクセスできます。

### 主要なコマンド

```bash
# 開発サーバーの起動
npm run dev

# 本番用ビルド
npm run build

# テストの実行
npm test

# リントの実行
npm run lint

# 型チェック
npm run typecheck

# Cloudflare Workersへのデプロイ
npm run deploy
```

## データベース（Cloudflare D1）

### スキーマ定義（Drizzle ORM）

```typescript
// src/infrastructure/persistence/cloudflareD1/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const spots = sqliteTable('spots', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  hiddenLevel: integer('hidden_level').notNull().default(1),
  createdById: text('created_by_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const spotCategories = sqliteTable('spot_categories', {
  id: text('id').primaryKey(),
  spotId: text('spot_id').notNull().references(() => spots.id),
  categoryId: text('category_id').notNull().references(() => categories.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const spotImages = sqliteTable('spot_images', {
  id: text('id').primaryKey(),
  spotId: text('spot_id').notNull().references(() => spots.id),
  imageUrl: text('image_url').notNull(),
  caption: text('caption'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  spotId: text('spot_id').notNull().references(() => spots.id),
  userId: text('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const savedSpots = sqliteTable('saved_spots', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  spotId: text('spot_id').notNull().references(() => spots.id),
  status: text('status').notNull(), // 'want_to_go' or 'visited'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});
```

### マイグレーション

Drizzle Kit を使用したマイグレーション：

```bash
# マイグレーションファイルの生成
npx drizzle-kit generate

# マイグレーションの適用
npx wrangler d1 migrations apply machipoke-dev
```

ローカル開発モードでの D1 データベースのセットアップ：

```bash
# 開発用 D1 データベースの作成
npx wrangler d1 create machipoke-dev

# マイグレーションの適用
npx wrangler d1 migrations apply machipoke-dev --local
```

## ドメイン層の実装

### ドメインモデル

```typescript
// src/domain/models/spot/spot.ts
import { Category } from '../category/category';
import { User } from '../user/user';
import { SpotImage } from './spotImage';

export interface SpotProps {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  hiddenLevel: number;
  createdBy: User;
  categories: Category[];
  images: SpotImage[];
  createdAt: Date;
  updatedAt: Date;
}

export class Spot {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly hiddenLevel: number;
  readonly createdBy: User;
  readonly categories: Category[];
  readonly images: SpotImage[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: SpotProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.hiddenLevel = props.hiddenLevel;
    this.createdBy = props.createdBy;
    this.categories = props.categories;
    this.images = props.images;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  // ドメインロジックを実装するメソッド
  isNearby(lat: number, lng: number, radiusInKm: number): boolean {
    // 2点間の距離を計算するハバーサイン公式
    const R = 6371; // 地球の半径（km）
    const dLat = this.toRad(lat - this.latitude);
    const dLon = this.toRad(lng - this.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(this.latitude)) * Math.cos(this.toRad(lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance <= radiusInKm;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }
}
```

### リポジトリインターフェース

```typescript
// src/domain/repositories/spotRepository.ts
import { Spot } from '../models/spot/spot';

export interface SpotRepository {
  findById(id: string): Promise<Spot | null>;
  findAll(): Promise<Spot[]>;
  findByCategory(categoryId: string): Promise<Spot[]>;
  findNearby(latitude: number, longitude: number, radiusInKm: number): Promise<Spot[]>;
  save(spot: Spot): Promise<Spot>;
  update(spot: Spot): Promise<Spot>;
  delete(id: string): Promise<void>;
}
```

## インフラストラクチャ層の実装

### D1リポジトリ実装

```typescript
// src/infrastructure/persistence/cloudflareD1/repositories/spotRepositoryImpl.ts
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { eq, and, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { SpotRepository } from '../../../../domain/repositories/spotRepository';
import { Spot } from '../../../../domain/models/spot/spot';
import { Category } from '../../../../domain/models/category/category';
import { User } from '../../../../domain/models/user/user';
import { SpotImage } from '../../../../domain/models/spot/spotImage';
import * as schema from '../schema';

export class SpotRepositoryImpl implements SpotRepository {
  constructor(private db: DrizzleD1Database) {}

  async findById(id: string): Promise<Spot | null> {
    const spotResult = await this.db.select()
      .from(schema.spots)
      .where(eq(schema.spots.id, id))
      .leftJoin(schema.users, eq(schema.spots.createdById, schema.users.id))
      .get();

    if (!spotResult) {
      return null;
    }

    const categories = await this.db.select()
      .from(schema.categories)
      .innerJoin(
        schema.spotCategories,
        eq(schema.categories.id, schema.spotCategories.categoryId)
      )
      .where(eq(schema.spotCategories.spotId, id))
      .all();

    const images = await this.db.select()
      .from(schema.spotImages)
      .where(eq(schema.spotImages.spotId, id))
      .all();

    // ドメインモデルへのマッピング
    return new Spot({
      id: spotResult.spots.id,
      name: spotResult.spots.name,
      description: spotResult.spots.description,
      latitude: spotResult.spots.latitude,
      longitude: spotResult.spots.longitude,
      hiddenLevel: spotResult.spots.hiddenLevel,
      createdBy: new User({
        id: spotResult.users.id,
        email: spotResult.users.email,
        username: spotResult.users.username,
        // パスワードハッシュは含めない
        createdAt: new Date(spotResult.users.createdAt * 1000),
        updatedAt: new Date(spotResult.users.updatedAt * 1000),
      }),
      categories: categories.map(cat => new Category({
        id: cat.categories.id,
        name: cat.categories.name,
        createdAt: new Date(cat.categories.createdAt * 1000),
      })),
      images: images.map(img => new SpotImage({
        id: img.id,
        spotId: img.spotId,
        imageUrl: img.imageUrl,
        caption: img.caption,
        createdAt: new Date(img.createdAt * 1000),
      })),
      createdAt: new Date(spotResult.spots.createdAt * 1000),
      updatedAt: new Date(spotResult.spots.updatedAt * 1000),
    });
  }

  async findAll(): Promise<Spot[]> {
    // 実装詳細は省略
    // 基本的にはfindByIdと同様の処理をすべてのスポットに対して行う
    return [];
  }

  async findByCategory(categoryId: string): Promise<Spot[]> {
    // 実装詳細は省略
    return [];
  }

  async findNearby(latitude: number, longitude: number, radiusInKm: number): Promise<Spot[]> {
    // 実装詳細は省略
    // SQLiteは地理空間インデックスをサポートしていないため、
    // バウンディングボックスで絞り込んだ後、アプリケーション側で距離計算を行う
    return [];
  }

  async save(spot: Spot): Promise<Spot> {
    const spotId = uuidv4();

    // トランザクション内で保存
    await this.db.transaction(async (tx) => {
      // スポットデータの保存
      await tx.insert(schema.spots).values({
        id: spotId,
        name: spot.name,
        description: spot.description,
        latitude: spot.latitude,
        longitude: spot.longitude,
        hiddenLevel: spot.hiddenLevel,
        createdById: spot.createdBy.id,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      });

      // カテゴリ関連の保存
      for (const category of spot.categories) {
        await tx.insert(schema.spotCategories).values({
          id: uuidv4(),
          spotId,
          categoryId: category.id,
          createdAt: Math.floor(Date.now() / 1000),
        });
      }

      // 画像関連の保存
      for (const image of spot.images) {
        await tx.insert(schema.spotImages).values({
          id: uuidv4(),
          spotId,
          imageUrl: image.imageUrl,
          caption: image.caption,
          createdAt: Math.floor(Date.now() / 1000),
        });
      }
    });

    // 保存したエンティティを取得して返す
    const savedSpot = await this.findById(spotId);
    if (!savedSpot) {
      throw new Error('Failed to save spot');
    }

    return savedSpot;
  }

  async update(spot: Spot): Promise<Spot> {
    // 実装詳細は省略
    return spot;
  }

  async delete(id: string): Promise<void> {
    // 実装詳細は省略
  }
}
```

### R2ストレージ実装

```typescript
// src/infrastructure/persistence/cloudflareR2/imageStorageService.ts
export class ImageStorageService {
  constructor(private r2Bucket: R2Bucket) {}

  async uploadImage(file: File, userId: string): Promise<string> {
    const extension = file.name.split('.').pop();
    const filename = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extension}`;
    
    await this.r2Bucket.put(filename, file);
    
    // R2のパブリックURLを返す
    return `https://images.machipoke.com/${filename}`;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    // URLからR2のキーを抽出
    const key = imageUrl.replace('https://images.machipoke.com/', '');
    
    await this.r2Bucket.delete(key);
  }
}
```

## アプリケーション層の実装

### クエリハンドラ

```typescript
// src/application/queries/spots/getSpotQuery.ts
import { Spot } from '../../../domain/models/spot/spot';
import { SpotRepository } from '../../../domain/repositories/spotRepository';

interface GetSpotQueryParams {
  id: string;
}

export class GetSpotQuery {
  constructor(private spotRepository: SpotRepository) {}

  async execute({ id }: GetSpotQueryParams): Promise<Spot | null> {
    return this.spotRepository.findById(id);
  }
}
```

### コマンドハンドラ

```typescript
// src/application/commands/spots/createSpotCommand.ts
import { v4 as uuidv4 } from 'uuid';
import { Spot } from '../../../domain/models/spot/spot';
import { SpotRepository } from '../../../domain/repositories/spotRepository';
import { UserRepository } from '../../../domain/repositories/userRepository';
import { CategoryRepository } from '../../../domain/repositories/categoryRepository';
import { SpotImage } from '../../../domain/models/spot/spotImage';
import { ImageStorageService } from '../../../infrastructure/persistence/cloudflareR2/imageStorageService';

interface CreateSpotCommandParams {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  hiddenLevel: number;
  createdById: string;
  categoryIds: string[];
  images: File[];
  imageCaptions?: string[];
}

export class CreateSpotCommand {
  constructor(
    private spotRepository: SpotRepository,
    private userRepository: UserRepository,
    private categoryRepository: CategoryRepository,
    private imageStorageService: ImageStorageService,
  ) {}

  async execute(params: CreateSpotCommandParams): Promise<Spot> {
    const {
      name,
      description,
      latitude,
      longitude,
      hiddenLevel,
      createdById,
      categoryIds,
      images,
      imageCaptions = [],
    } = params;

    // ユーザーの取得
    const user = await this.userRepository.findById(createdById);
    if (!user) {
      throw new Error('User not found');
    }

    // カテゴリの取得
    const categories = await this.categoryRepository.findByIds(categoryIds);
    if (categories.length !== categoryIds.length) {
      throw new Error('One or more categories not found');
    }

    // 画像のアップロード
    const spotImages: SpotImage[] = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const imageUrl = await this.imageStorageService.uploadImage(image, createdById);
      
      spotImages.push(new SpotImage({
        id: uuidv4(),
        spotId: '', // この時点ではスポットIDは未確定
        imageUrl,
        caption: imageCaptions[i] || '',
        createdAt: new Date(),
      }));
    }

    // スポットエンティティの作成
    const spot = new Spot({
      id: uuidv4(),
      name,
      description,
      latitude,
      longitude,
      hiddenLevel,
      createdBy: user,
      categories,
      images: spotImages,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // リポジトリを通じてスポットを保存
    return this.spotRepository.save(spot);
  }
}
```

## GraphQL API実装

### スキーマ定義（Pothos GraphQL）

```typescript
// src/interfaces/graphql/schema.ts
import { createServer } from '@graphql-yoga/common';
import SchemaBuilder from '@pothos/core';
import { Context } from './context';

// スキーマビルダーの作成
const builder = new SchemaBuilder<{
  Context: Context;
}>({});

// Spotタイプの定義
builder.objectType('Spot', {
  description: 'A spot shared by users',
  fields: (t) => ({
    id: t.exposeID('id', {}),
    name: t.exposeString('name', {}),
    description: t.exposeString('description', {}),
    latitude: t.exposeFloat('latitude', {}),
    longitude: t.exposeFloat('longitude', {}),
    hiddenLevel: t.exposeInt('hiddenLevel', {}),
    createdBy: t.field({
      type: 'User',
      resolve: (spot) => spot.createdBy,
    }),
    categories: t.field({
      type: ['Category'],
      resolve: (spot) => spot.categories,
    }),
    images: t.field({
      type: ['SpotImage'],
      resolve: (spot) => spot.images,
    }),
    createdAt: t.field({
      type: 'DateTime',
      resolve: (spot) => spot.createdAt,
    }),
    updatedAt: t.field({
      type: 'DateTime',
      resolve: (spot) => spot.updatedAt,
    }),
  }),
});

// 他の型定義（User, Category, SpotImageなど）は省略

// クエリの定義
builder.queryType({
  fields: (t) => ({
    spot: t.field({
      type: 'Spot',
      nullable: true,
      args: {
        id: t.arg.string({ required: true }),
      },
      resolve: async (_, args, context) => {
        return context.queries.getSpot.execute({ id: args.id });
      },
    }),
    spots: t.field({
      type: ['Spot'],
      resolve: async (_, __, context) => {
        return context.queries.listSpots.execute({});
      },
    }),
    spotsByCategory: t.field({
      type: ['Spot'],
      args: {
        categoryId: t.arg.string({ required: true }),
      },
      resolve: async (_, args, context) => {
        return context.queries.listSpotsByCategory.execute({ categoryId: args.categoryId });
      },
    }),
    nearbySpots: t.field({
      type: ['Spot'],
      args: {
        latitude: t.arg.float({ required: true }),
        longitude: t.arg.float({ required: true }),
        radiusInKm: t.arg.float({ required: true }),
      },
      resolve: async (_, args, context) => {
        return context.queries.listNearbySpots.execute({
          latitude: args.latitude,
          longitude: args.longitude,
          radiusInKm: args.radiusInKm,
        });
      },
    }),
  }),
});

// ミューテーションの定義
builder.mutationType({
  fields: (t) => ({
    createSpot: t.field({
      type: 'Spot',
      args: {
        input: t.arg({
          type: 'CreateSpotInput',
          required: true,
        }),
      },
      resolve: async (_, args, context) => {
        // 認証チェック
        if (!context.currentUser) {
          throw new Error('Authentication required');
        }

        return context.commands.createSpot.execute({
          ...args.input,
          createdById: context.currentUser.id,
        });
      },
    }),
    // 他のミューテーション（updateSpot, deleteSpotなど）は省略
  }),
});

// 入力型の定義
builder.inputType('CreateSpotInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    description: t.string({ required: true }),
    latitude: t.float({ required: true }),
    longitude: t.float({ required: true }),
    hiddenLevel: t.int({ required: true }),
    categoryIds: t.stringList({ required: true }),
    // 画像のアップロードはGraphQLのファイルアップロードを使用
  }),
});

// スキーマのビルド
export const schema = builder.toSchema();
```

### GraphQLコンテキスト

```typescript
// src/interfaces/graphql/context.ts
import { GetSpotQuery } from '../../application/queries/spots/getSpotQuery';
import { CreateSpotCommand } from '../../application/commands/spots/createSpotCommand';
import { User } from '../../domain/models/user/user';

export interface Context {
  // 現在のユーザー（認証済みの場合）
  currentUser: User | null;
  
  // クエリハンドラ
  queries: {
    getSpot: GetSpotQuery;
    listSpots: ListSpotsQuery;
    listSpotsByCategory: ListSpotsByCategoryQuery;
    listNearbySpots: ListNearbySpotsQuery;
    // 他のクエリハンドラ
  };

## デプロイメント

Cloudflare Workersへのデプロイメント手順：

### 準備

```bash
# wrangler.tomlの設定
name = "machipoke-api"
main = "./dist/index.js"
compatibility_date = "2023-10-01"

# D1データベースの設定
[[d1_databases]]
Binding = "DB"
database_name = "machipoke"
database_id = "xxxxxxxxxxxxxxxxxxxx"

# KVネームスペースの設定
[[kv_namespaces]]
Binding = "KV"
id = "xxxxxxxxxxxxxxxxxxxx"

# R2バケットの設定
[[r2_buckets]]
Binding = "R2"
bucket_name = "machipoke-images"
```

### デプロイコマンド

```bash
# 開発環境へのデプロイ
npm run deploy:dev

# 本番環境へのデプロイ
npm run deploy:prod
```

package.jsonのスクリプト設定：

```json
"scripts": {
  "deploy:dev": "wrangler deploy --env dev",
  "deploy:prod": "wrangler deploy --env production"
}
```

### CI/CDパイプライン

GitHub Actionsを使用した自動デプロイメント設定：

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - main
      - develop

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy to development
        if: github.ref == 'refs/heads/develop'
        run: npm run deploy:dev
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: npm run deploy:prod
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## テスト

### 単体テスト

Vitestを使用したドメインモデルのテスト例：

```typescript
// src/domain/models/spot/spot.test.ts
import { describe, it, expect } from 'vitest';
import { Spot } from './spot';
import { User } from '../user/user';
import { Category } from '../category/category';
import { SpotImage } from './spotImage';

describe('Spot', () => {
  const mockUser = new User({
    id: 'user1',
    email: 'test@example.com',
    username: 'testuser',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockCategories = [
    new Category({
      id: 'cat1',
      name: 'カフェ',
      createdAt: new Date(),
    }),
  ];

  const mockImages = [
    new SpotImage({
      id: 'img1',
      spotId: 'spot1',
      imageUrl: 'https://example.com/image.jpg',
      caption: 'テスト画像',
      createdAt: new Date(),
    }),
  ];

  const spotProps = {
    id: 'spot1',
    name: 'テストスポット',
    description: 'これはテストスポットです',
    latitude: 35.6812,
    longitude: 139.7671,
    hiddenLevel: 3,
    createdBy: mockUser,
    categories: mockCategories,
    images: mockImages,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should create a spot instance correctly', () => {
    const spot = new Spot(spotProps);
    expect(spot.id).toBe('spot1');
    expect(spot.name).toBe('テストスポット');
    expect(spot.description).toBe('これはテストスポットです');
    expect(spot.latitude).toBe(35.6812);
    expect(spot.longitude).toBe(139.7671);
    expect(spot.hiddenLevel).toBe(3);
    expect(spot.createdBy).toBe(mockUser);
    expect(spot.categories).toEqual(mockCategories);
    expect(spot.images).toEqual(mockImages);
    expect(spot.createdAt).toBeInstanceOf(Date);
    expect(spot.updatedAt).toBeInstanceOf(Date);
  });

  it('should calculate if a point is nearby correctly', () => {
    const spot = new Spot(spotProps);
    
    // 東京タワー（約2.5km離れている）
    const tokyoTower = {
      latitude: 35.6586,
      longitude: 139.7454,
    };
    
    // 2km範囲内でチェック（false）
    expect(spot.isNearby(tokyoTower.latitude, tokyoTower.longitude, 2)).toBe(false);
    
    // 3km範囲内でチェック（true）
    expect(spot.isNearby(tokyoTower.latitude, tokyoTower.longitude, 3)).toBe(true);
  });
});
```

### 統合テスト

Cloudflare WorkersのMiniflareを使用した統合テスト：

```typescript
// src/infrastructure/persistence/cloudflareD1/repositories/spotRepositoryImpl.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Miniflare } from 'miniflare';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { drizzle } from 'drizzle-orm/d1';
import { migrate } from 'drizzle-orm/d1/migrator';
import { SpotRepositoryImpl } from './spotRepositoryImpl';
import * as schema from '../schema';

describe('SpotRepositoryImpl', () => {
  let miniflare: Miniflare;
  let db: D1Database;
  let drizzleDb: DrizzleD1Database;
  let spotRepository: SpotRepositoryImpl;

  beforeAll(async () => {
    // Miniflareのセットアップ
    miniflare = new Miniflare({
      modules: true,
      script: '',
      d1Databases: ['DB'],
    });

    // D1データベースの取得
    db = await miniflare.getD1Database('DB');
    
    // DrizzleのORM初期化
    drizzleDb = drizzle(db);
    
    // マイグレーションの実行
    await migrate(drizzleDb, { migrationsFolder: './migrations' });
    
    // テスト対象のリポジトリの作成
    spotRepository = new SpotRepositoryImpl(drizzleDb);
    
    // テストデータのセットアップ
    // ...
  });

  afterAll(async () => {
    // テストデータのクリーンアップ
    // ...
  });

  it('should find a spot by id', async () => {
    const spot = await spotRepository.findById('spot1');
    expect(spot).not.toBeNull();
    expect(spot?.id).toBe('spot1');
    expect(spot?.name).toBe('テストスポット');
    // 他のプロパティのチェック
  });

  // 他のテストケース
});
```

## パフォーマンス最適化

### キャッシング戦略

```typescript
// src/infrastructure/persistence/cloudflareKV/cacheService.ts
export class CacheService {
  constructor(private kv: KVNamespace) {}

  async get<T>(key: string): Promise<T | null> {
    const cachedData = await this.kv.get(key, 'json');
    return cachedData as T | null;
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    await this.kv.put(key, JSON.stringify(value), { expirationTtl: ttl });
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }
}
```

リポジトリでのキャッシュの利用：

```typescript
// キャッシュを使用したスポット取得
async findById(id: string): Promise<Spot | null> {
  // キャッシュからスポットを取得を試みる
  const cacheKey = `spot:${id}`;
  const cachedSpot = await this.cacheService.get<Spot>(cacheKey);
  
  if (cachedSpot) {
    return cachedSpot;
  }
  
  // キャッシュにない場合はDBから取得
  const spot = await this.fetchSpotFromDb(id);
  
  // キャッシュに保存（1時間）
  if (spot) {
    await this.cacheService.set(cacheKey, spot, 3600);
  }
  
  return spot;
}
```

### N+1問題の回避

```typescript
// バッチローディングの実装
async findByIds(ids: string[]): Promise<Map<string, Spot>> {
  const spotMap = new Map<string, Spot>();
  
  if (ids.length === 0) {
    return spotMap;
  }
  
  // 一度のクエリでスポットを取得
  const spotsResult = await this.db.select()
    .from(schema.spots)
    .where(inArray(schema.spots.id, ids))
    .leftJoin(schema.users, eq(schema.spots.createdById, schema.users.id))
    .all();
  
  // カテゴリとイメージを一度のクエリでバッチ取得
  const spotIds = spotsResult.map(s => s.spots.id);
  
  const categories = await this.db.select()
    .from(schema.categories)
    .innerJoin(
      schema.spotCategories,
      eq(schema.categories.id, schema.spotCategories.categoryId)
    )
    .where(inArray(schema.spotCategories.spotId, spotIds))
    .all();
    
  const images = await this.db.select()
    .from(schema.spotImages)
    .where(inArray(schema.spotImages.spotId, spotIds))
    .all();
  
  // データを整理してスポットオブジェクトを構築
  // ...
  
  return spotMap;
}
```

## エラー処理とロギング

### Result型の実装

```typescript
// src/utils/result.ts
export class Result<T, E extends Error = Error> {
  private constructor(
    private readonly value: T | null,
    private readonly error: E | null
  ) {}

  public static ok<T, E extends Error = Error>(value: T): Result<T, E> {
    return new Result<T, E>(value, null);
  }

  public static fail<T, E extends Error = Error>(error: E): Result<T, E> {
    return new Result<T, E>(null, error);
  }

  public isOk(): boolean {
    return this.error === null;
  }

  public isFail(): boolean {
    return this.error !== null;
  }

  public getValue(): T {
    if (this.error !== null) {
      throw this.error;
    }
    return this.value as T;
  }

  public getError(): E | null {
    return this.error;
  }
}
```

### アプリケーション層でのエラー処理

```typescript
// src/application/commands/spots/createSpotCommand.ts
import { Result } from '../../../utils/result';

export class CreateSpotCommand {
  // ...

  async execute(params: CreateSpotCommandParams): Promise<Result<Spot, Error>> {
    try {
      // ユーザーの取得
      const user = await this.userRepository.findById(params.createdById);
      if (!user) {
        return Result.fail(new Error('User not found'));
      }

      // カテゴリの取得
      const categories = await this.categoryRepository.findByIds(params.categoryIds);
      if (categories.length !== params.categoryIds.length) {
        return Result.fail(new Error('One or more categories not found'));
      }

      // 画像のアップロード
      const spotImages: SpotImage[] = [];
      try {
        for (let i = 0; i < params.images.length; i++) {
          // 画像アップロード処理
          // ...
        }
      } catch (error) {
        return Result.fail(new Error(`Failed to upload images: ${error.message}`));
      }

      // スポットエンティティの作成
      const spot = new Spot({ /* ... */ });

      // リポジトリを通じてスポットを保存
      const savedSpot = await this.spotRepository.save(spot);
      return Result.ok(savedSpot);
    } catch (error) {
      // ロギング
      console.error('Failed to create spot:', error);
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
```

### GraphQLでのエラー処理

```typescript
// GraphQLリゾルバでのエラーハンドリング
createSpot: t.field({
  type: 'Spot',
  args: {
    input: t.arg({
      type: 'CreateSpotInput',
      required: true,
    }),
  },
  resolve: async (_, args, context) => {
    // 認証チェック
    if (!context.currentUser) {
      throw new Error('Authentication required');
    }

    const result = await context.commands.createSpot.execute({
      ...args.input,
      createdById: context.currentUser.id,
    });

    if (result.isFail()) {
      // エラーログの記録
      const error = result.getError();
      console.error('Failed to create spot:', error);
      
      // クライアントに返すエラーメッセージ
      throw new Error(error?.message || 'Failed to create spot');
    }

    return result.getValue();
  },
}),
```

## セキュリティ対策

### 認証と認可

```typescript
// src/infrastructure/auth/authService.ts
export class AuthService {
  constructor(private jwt: JWT) {}

  async verifyToken(token: string): Promise<{ userId: string } | null> {
    try {
      const payload = await this.jwt.verify(token);
      return { userId: payload.sub };
    } catch (error) {
      return null;
    }
  }

  async createToken(userId: string): Promise<string> {
    const payload = { sub: userId };
    return this.jwt.sign(payload, { expiresIn: '7d' });
  }
}
```

### 入力バリデーション

```typescript
// src/application/validators/spotValidator.ts
import { z } from 'zod';

export const createSpotSchema = z.object({
  name: z.string().min(2, '名前は2文字以上で入力してください').max(100),
  description: z.string().min(10, '説明は10文字以上で入力してください').max(1000),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  hiddenLevel: z.number().int().min(1).max(5),
  categoryIds: z.array(z.string().uuid()).min(1, '少なくとも1つのカテゴリを選択してください'),
});

export type CreateSpotInput = z.infer<typeof createSpotSchema>;

export const validateCreateSpotInput = (input: unknown): CreateSpotInput => {
  return createSpotSchema.parse(input);
};
```

### CORS設定

```typescript
// src/index.ts
// CORSミドルウェアの設定
app.use('*', cors({
  origin: (origin) => {
    // 許可するオリジンのリスト
    const allowedOrigins = [
      'https://machipoke.com',
      'https://dev.machipoke.com',
    ];
    
    // 開発環境ではローカルホストも許可
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push(
        'http://localhost:3000',
        'http://127.0.0.1:3000'
      );
    }
    
    // originがnullの場合（サーバー間リクエストなど）も許可
    if (!origin) return true;
    
    return allowedOrigins.includes(origin);
  },
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));
```

## ベストプラクティス

1. **ドメイン駆動設計の適用**: ビジネスロジックはドメイン層に集中させる
2. **レイヤードアーキテクチャ**: 各レイヤーの責務を明確に分離する
3. **型安全性**: TypeScriptの型を活用し、型エラーを早期に発見する
4. **イミュータブルデータ**: ドメインオブジェクトは不変に保つ
5. **依存性の注入**: 外部依存はコンストラクタで注入する
6. **明示的なエラー処理**: Result型を使用して明示的にエラーを処理する
7. **リポジトリパターン**: データアクセスを抽象化する
8. **バリデーション**: 入力データのバリデーションを徹底する
9. **テスト駆動開発**: 機能実装前にテストを書く
10. **パフォーマンス**: キャッシュとバッチ処理を活用する

## 参考リンク

- [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/)
- [Hono フレームワーク](https://hono.dev/)
- [Drizzle ORM ドキュメント](https://orm.drizzle.team/)
- [Pothos GraphQL](https://pothos-graphql.dev/)
- [Cloudflare D1 ドキュメント](https://developers.cloudflare.com/d1/)
- [Cloudflare KV ドキュメント](https://developers.cloudflare.com/kv/)
- [Cloudflare R2 ドキュメント](https://developers.cloudflare.com/r2/)
- [ドメイン駆動設計リファレンス](https://www.domainlanguage.com/ddd/)
- [Vitest ドキュメント](https://vitest.dev/)
- [Miniflare ドキュメント](https://miniflare.dev/)
  
  // コマンドハンドラ
  commands: {
    createSpot: CreateSpotCommand;
    updateSpot: UpdateSpotCommand;
    deleteSpot: DeleteSpotCommand;
    // 他のコマンドハンドラ
  };
}
```

## Hono Webフレームワークの設定

```typescript
// src/index.ts
import { Hono } from 'hono';
import { handle } from 'hono/graphql';
import { cors } from 'hono/cors';
import { schema } from './interfaces/graphql/schema';
import { createContext } from './interfaces/graphql/context';
import { authMiddleware } from './infrastructure/auth/authMiddleware';

// 型定義
type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
};

// Honoアプリケーションの作成
const app = new Hono<{ Bindings: Bindings }>();

// CORSミドルウェアの設定
app.use('*', cors({
  origin: ['https://machipoke.com', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// 認証ミドルウェアの設定
app.use('/graphql', authMiddleware());

// GraphQLエンドポイントの設定
app.use('/graphql', async (c) => {
  const context = await createContext(c);
  
  return handle({
    schema,
    context,
    rootValue: undefined,
  })(c);
});

// ヘルスチェックエンドポイント
app.get('/', (c) => c.text('Machipoke API is running'));

// Workerのエクスポート
export default app;
```

## 認証（Auth0連携）

```typescript
// src/infrastructure/auth/authMiddleware.ts
import { Context } from 'hono';
import { jwt } from 'hono/jwt';
import { UserRepository } from '../../domain/repositories/userRepository';

export const authMiddleware = () => {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      // JWTの検証
      await jwt({
        secret: c.env.JWT_SECRET,
      })(c, async () => {});
      
      // JWT検証が成功した場合、JWTペイロードを取得
      const payload = c.get('jwtPayload');
      const userId = payload.sub;
      
      // ユーザーリポジトリを使用してユーザー情報を取得
      const userRepository = new UserRepository(c.env.DB);
      const user = await userRepository.findById(userId);
      
      // ユーザー情報をコンテキストに設定
      c.set('currentUser', user);
    } catch (e) {
      // 認証エラーの場合、ユーザー情報をnullに設定
      c.set('currentUser', null);
    }
    
    await next();
  };
};
```

## ファイルアップロード

```typescript
// src/interfaces/graphql/resolvers/fileUpload.ts
import { GraphQLScalarType } from 'graphql';
import { FileUpload } from 'graphql-upload';
import { ImageStorageService } from '../../../infrastructure/persistence/cloudflareR2/imageStorageService';

// GraphQLアップロードスカラー型の定義
export const Upload = new GraphQLScalarType({
  name: 'Upload',
  description: 'The `Upload` scalar type represents a file upload.',
  parseValue: (value) => value,
  parseLiteral: () => {
    throw new Error('Upload scalar literal cannot be parsed');
  },
  serialize: () => {
    throw new Error('Upload scalar serialization is not supported');
  },
});

// スポット画像のアップロード処理
export const handleSpotImageUpload = async (
  file: FileUpload,
  userId: string,
  imageStorageService: ImageStorageService
): Promise<string> => {
  // ファイルストリームの取得
  const { createReadStream, filename, mimetype } = await file;
  
  // ファイルタイプの検証
  if (!mimetype.startsWith('image/')) {
    throw new Error('Uploaded file is not an image');
  }
  
  // ファイルサイズの制限（例: 5MB）
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  let fileSize = 0;
  const chunks: Uint8Array[] = [];
  
  // ファイルの読み込み
  const stream = createReadStream();
  
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => {
      fileSize += chunk.length;
      if (fileSize > MAX_FILE_SIZE) {
        stream.destroy();
        reject(new Error('File size exceeds the limit (5MB)'));
      }
      chunks.push(chunk);
    });
    
    stream.on('end', async () => {
      try {
        // ファイルバッファの作成
        const buffer = Buffer.concat(chunks);
        
        // R2へのファイルのアップロード
        const fileName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const file = new File([buffer], fileName, { type: mimetype });
        
        // ストレージサービスを使用して画像をアップロード
        const imageUrl = await imageStorageService.uploadImage(file, userId);
        resolve(imageUrl);
      } catch (error) {
        reject(error);
      }
    });
    
    stream.on('error', reject);
  });
};
