# マチポケ - GraphQL API設計

## 概要

マチポケのAPIは、Pothos GraphQLを使用して型安全なGraphQLインターフェースとして実装されています。この設計により、フロントエンドとバックエンド間で効率的かつ柔軟なデータのやり取りが可能になります。GraphQLの特性を活かし、クライアント側が必要なデータのみを取得できる効率的なAPIを提供しています。

## アーキテクチャ

```mermaid
graph TD
    A[クライアント] -- \"GraphQLリクエスト\" --> B[API Gateway]
    B -- \"リクエスト処理\" --> C[GraphQLエンドポイント]
    C -- \"スキーマ検証\" --> D[GraphQLスキーマ]
    C -- \"リゾルバ実行\" --> E[GraphQLリゾルバ]
    E -- \"データ取得/更新\" --> F[ドメインサービス]
    F -- \"データアクセス\" --> G[リポジトリ]
    G -- \"ストレージアクセス\" --> H[Cloudflare D1/KV/R2]
```

## グラフQLスキーマ設計

### 型定義 (Pothos GraphQL)

```typescript
// src/graphql/schema/builder.ts
import SchemaBuilder from '@pothos/core';
import { PothosValidationPlugin } from '@pothos/plugin-validation';
import { PothosDirectivePlugin } from '@pothos/plugin-directives';
import { PothosFederationPlugin } from '@pothos/plugin-federation';

// Pothos SchemaBuilder のインスタンス作成
export const builder = new SchemaBuilder<{
  Scalars: {
    ID: { Input: string; Output: string };
    DateTime: { Input: Date; Output: Date };
    JSON: { Input: unknown; Output: unknown };
  };
  Context: {
    currentUser: User | null;
    dataSources: {
      spotService: SpotService;
      userService: UserService;
      categoryService: CategoryService;
      commentService: CommentService;
    };
  };
}>({
  plugins: [PothosValidationPlugin, PothosDirectivePlugin, PothosFederationPlugin],
  validationOptions: {
    validationError: (error) => {
      return new Error(`入力検証エラー: ${error.message}`);
    },
  },
});

// スカラータイプの定義
builder.scalarType('DateTime', {
  serialize: (date) => date.toISOString(),
  parseValue: (value) => new Date(value as string),
});

builder.scalarType('JSON', {
  serialize: (value) => value,
  parseValue: (value) => value,
});
```

### 型定義とリゾルバ

```typescript
// src/graphql/schema/types/spot.ts
import { builder } from '../builder';
import { SpotService } from '../../../domain/services/spotService';

// スポットタイプの定義
builder.objectType('Spot', {
  description: '地元の人だけが知る場所の情報',
  fields: (t) => ({
    id: t.exposeID('id', { description: 'スポットの一意識別子' }),
    name: t.exposeString('name', { description: 'スポットの名称' }),
    description: t.exposeString('description', { 
      description: 'スポットの詳細説明',
      nullable: true 
    }),
    latitude: t.exposeFloat('latitude', { description: '緯度' }),
    longitude: t.exposeFloat('longitude', { description: '経度' }),
    address: t.exposeString('address', { 
      description: '住所', 
      nullable: true 
    }),
    bestSeason: t.exposeString('bestSeason', { 
      description: '訪問のベストシーズン', 
      nullable: true 
    }),
    bestTimeOfDay: t.exposeString('bestTimeOfDay', { 
      description: '訪問のベスト時間帯', 
      nullable: true 
    }),
    hiddenGemScore: t.exposeInt('hiddenGemScore', { 
      description: '穴場度合い (1-5)', 
      nullable: true 
    }),
    specialExperience: t.exposeString('specialExperience', { 
      description: '特別な体験ができるポイント', 
      nullable: true 
    }),
    category: t.field({
      type: 'Category',
      description: 'スポットのカテゴリ',
      resolve: async (spot, _, { dataSources }) => {
        return dataSources.categoryService.getCategoryById(spot.categoryId);
      },
    }),
    createdBy: t.field({
      type: 'User',
      description: 'スポットを登録したユーザー',
      resolve: async (spot, _, { dataSources }) => {
        return dataSources.userService.getUserById(spot.createdById);
      },
    }),
    images: t.field({
      type: ['SpotImage'],
      description: 'スポットの画像',
      resolve: async (spot, _, { dataSources }) => {
        return dataSources.spotService.getSpotImages(spot.id);
      },
    }),
    comments: t.field({
      type: ['Comment'],
      description: 'スポットに対するコメント',
      args: {
        limit: t.arg.int({ defaultValue: 10 }),
        offset: t.arg.int({ defaultValue: 0 }),
      },
      resolve: async (spot, { limit, offset }, { dataSources }) => {
        return dataSources.commentService.getCommentsBySpotId(spot.id, { limit, offset });
      },
    }),
    createdAt: t.field({
      type: 'DateTime',
      description: '作成日時',
      resolve: (spot) => new Date(spot.createdAt * 1000),
    }),
    updatedAt: t.field({
      type: 'DateTime',
      description: '更新日時',
      resolve: (spot) => new Date(spot.updatedAt * 1000),
    }),
  }),
});

// スポット画像タイプの定義
builder.objectType('SpotImage', {
  description: 'スポットの画像情報',
  fields: (t) => ({
    id: t.exposeID('id'),
    imageUrl: t.exposeString('imageUrl', { description: '画像URL' }),
    caption: t.exposeString('caption', { description: '画像の説明', nullable: true }),
    isPrimary: t.exposeBoolean('isPrimary', { description: 'メイン画像かどうか' }),
    createdAt: t.field({
      type: 'DateTime',
      description: '作成日時',
      resolve: (image) => new Date(image.createdAt * 1000),
    }),
  }),
});
```

### クエリ定義

```typescript
// src/graphql/schema/queries/spotQueries.ts
import { builder } from '../builder';
import { AuthenticationError, ForbiddenError } from '../errors';

// スポット取得クエリ
builder.queryType({
  fields: (t) => ({
    // 単一スポット取得
    spot: t.field({
      type: 'Spot',
      nullable: true,
      description: 'ID指定でスポットを取得',
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: async (_, { id }, { dataSources }) => {
        return dataSources.spotService.getSpotById(id);
      },
    }),
    
    // 近隣スポット検索
    nearbySpots: t.field({
      type: ['Spot'],
      description: '位置情報を基に近隣のスポットを検索',
      args: {
        latitude: t.arg.float({ required: true, description: '緯度' }),
        longitude: t.arg.float({ required: true, description: '経度' }),
        radius: t.arg.float({ defaultValue: 5, description: '検索半径 (km)' }),
        limit: t.arg.int({ defaultValue: 20, description: '取得件数' }),
      },
      resolve: async (_, { latitude, longitude, radius, limit }, { dataSources }) => {
        return dataSources.spotService.findNearbySpots(latitude, longitude, radius, limit);
      },
    }),
    
    // カテゴリ別スポット取得
    spotsByCategory: t.field({
      type: ['Spot'],
      description: 'カテゴリごとのスポットを取得',
      args: {
        categoryId: t.arg.id({ required: true }),
        limit: t.arg.int({ defaultValue: 20 }),
        offset: t.arg.int({ defaultValue: 0 }),
      },
      resolve: async (_, { categoryId, limit, offset }, { dataSources }) => {
        return dataSources.spotService.getSpotsByCategory(categoryId, { limit, offset });
      },
    }),
    
    // スポット検索
    searchSpots: t.field({
      type: ['Spot'],
      description: 'キーワードでスポットを検索',
      args: {
        query: t.arg.string({ required: true }),
        filters: t.arg({
          type: SpotFiltersInput,
          required: false,
        }),
        limit: t.arg.int({ defaultValue: 20 }),
        offset: t.arg.int({ defaultValue: 0 }),
      },
      resolve: async (_, { query, filters, limit, offset }, { dataSources }) => {
        return dataSources.spotService.searchSpots(query, filters, { limit, offset });
      },
    }),
  }),
});

// スポット検索フィルター入力
const SpotFiltersInput = builder.inputType('SpotFiltersInput', {
  description: 'スポット検索のフィルターオプション',
  fields: (t) => ({
    categories: t.field({
      type: ['ID'],
      description: 'カテゴリIDのリスト',
      required: false,
    }),
    hiddenGemScoreMin: t.field({
      type: 'Int',
      description: '最小穴場度合い (1-5)',
      required: false,
    }),
    bestSeason: t.field({
      type: 'String',
      description: '訪問のベストシーズン',
      required: false,
    }),
  }),
});
```

### ミューテーション定義

```typescript
// src/graphql/schema/mutations/spotMutations.ts
import { builder } from '../builder';
import { AuthenticationError, ForbiddenError } from '../errors';

// スポット作成入力
const CreateSpotInput = builder.inputType('CreateSpotInput', {
  description: 'スポット作成の入力データ',
  fields: (t) => ({
    name: t.string({ required: true, validate: { minLength: 2, maxLength: 100 } }),
    description: t.string({ required: false }),
    latitude: t.float({ required: true }),
    longitude: t.float({ required: true }),
    address: t.string({ required: false }),
    categoryId: t.id({ required: true }),
    bestSeason: t.string({ required: false }),
    bestTimeOfDay: t.string({ required: false }),
    hiddenGemScore: t.int({ required: false, validate: { min: 1, max: 5 } }),
    specialExperience: t.string({ required: false }),
  }),
});

// スポット更新入力
const UpdateSpotInput = builder.inputType('UpdateSpotInput', {
  description: 'スポット更新の入力データ',
  fields: (t) => ({
    name: t.string({ required: false, validate: { minLength: 2, maxLength: 100 } }),
    description: t.string({ required: false }),
    address: t.string({ required: false }),
    categoryId: t.id({ required: false }),
    bestSeason: t.string({ required: false }),
    bestTimeOfDay: t.string({ required: false }),
    hiddenGemScore: t.int({ required: false, validate: { min: 1, max: 5 } }),
    specialExperience: t.string({ required: false }),
  }),
});

// スポット関連ミューテーション
builder.mutationType({
  fields: (t) => ({
    // スポット作成
    createSpot: t.field({
      type: 'Spot',
      description: '新しいスポットを作成',
      args: {
        input: t.arg({ type: CreateSpotInput, required: true }),
      },
      resolve: async (_, { input }, { currentUser, dataSources }) => {
        // 認証チェック
        if (!currentUser) {
          throw new AuthenticationError('ログインが必要です');
        }
        
        return dataSources.spotService.createSpot({
          ...input,
          createdById: currentUser.id,
        });
      },
    }),
    
    // スポット更新
    updateSpot: t.field({
      type: 'Spot',
      description: '既存のスポットを更新',
      args: {
        id: t.arg.id({ required: true }),
        input: t.arg({ type: UpdateSpotInput, required: true }),
      },
      resolve: async (_, { id, input }, { currentUser, dataSources }) => {
        // 認証チェック
        if (!currentUser) {
          throw new AuthenticationError('ログインが必要です');
        }
        
        // 権限チェック
        const spot = await dataSources.spotService.getSpotById(id);
        if (!spot) {
          throw new Error('スポットが見つかりません');
        }
        
        const canEdit = spot.createdById === currentUser.id || 
                        currentUser.role === 'admin' || 
                        currentUser.role === 'moderator';
        
        if (!canEdit) {
          throw new ForbiddenError('このスポットを編集する権限がありません');
        }
        
        return dataSources.spotService.updateSpot(id, input);
      },
    }),
    
    // スポット削除
    deleteSpot: t.field({
      type: 'Boolean',
      description: 'スポットを削除',
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: async (_, { id }, { currentUser, dataSources }) => {
        // 認証チェック
        if (!currentUser) {
          throw new AuthenticationError('ログインが必要です');
        }
        
        // 権限チェック
        const spot = await dataSources.spotService.getSpotById(id);
        if (!spot) {
          throw new Error('スポットが見つかりません');
        }
        
        const canDelete = spot.createdById === currentUser.id || 
                          currentUser.role === 'admin' || 
                          currentUser.role === 'moderator';
        
        if (!canDelete) {
          throw new ForbiddenError('このスポットを削除する権限がありません');
        }
        
        return dataSources.spotService.deleteSpot(id);
      },
    }),
    
    // スポット画像アップロード
    uploadSpotImage: t.field({
      type: 'SpotImage',
      description: 'スポットの画像をアップロード',
      args: {
        spotId: t.arg.id({ required: true }),
        file: t.arg({ type: 'File', required: true }), // カスタムスカラー
        caption: t.arg.string(),
        isPrimary: t.arg.boolean({ defaultValue: false }),
      },
      resolve: async (_, { spotId, file, caption, isPrimary }, { currentUser, dataSources }) => {
        // 認証・権限チェック（省略）
        
        return dataSources.spotService.uploadSpotImage(spotId, file, caption, isPrimary);
      },
    }),
  }),
});
```

## API実装

### GraphQLエンドポイントの設定

```typescript
// src/interfaces/api/graphql/index.ts
import { createYoga } from 'graphql-yoga';
import { schema } from './schema';
import { createContext } from './context';

// Honoミドルウェアとしてのセットアップ
export const setupGraphQL = (app) => {
  const yoga = createYoga({
    schema,
    context: createContext,
    graphiql: process.env.NODE_ENV !== 'production',
    landingPage: false,
  });

  app.use('/graphql', yoga);
};
```

### コンテキスト設定

```typescript
// src/interfaces/api/graphql/context.ts
import { SpotService } from '../../../domain/services/spotService';
import { UserService } from '../../../domain/services/userService';
import { CategoryService } from '../../../domain/services/categoryService';
import { CommentService } from '../../../domain/services/commentService';
import { verifyAuthToken } from '../../../infrastructure/auth/tokenService';

// GraphQLコンテキスト作成関数
export async function createContext({ request, env }) {
  // 認証トークンの取得と検証
  let currentUser = null;
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = await verifyAuthToken(token, env);
      if (payload && payload.sub) {
        const userService = new UserService(env.DB, env.KV);
        currentUser = await userService.getUserById(payload.sub);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  }
  
  // サービスのインスタンス化
  const dataSources = {
    spotService: new SpotService(env.DB, env.KV, env.R2),
    userService: new UserService(env.DB, env.KV),
    categoryService: new CategoryService(env.DB, env.KV),
    commentService: new CommentService(env.DB, env.KV),
  };
  
  return {
    currentUser,
    dataSources,
    env,
  };
}
```

## GraphQLリゾルバとデータソース

### サービスとリポジトリの連携

```typescript
// src/domain/services/spotService.ts
import { SpotRepository } from '../repositories/spotRepository';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../../db/schema';

export class SpotService {
  private spotRepository: SpotRepository;
  private storage: any; // R2ストレージサービス
  private cache: any; // KVキャッシュサービス
  
  constructor(db: D1Database, kv: KVNamespace, r2: R2Bucket) {
    const drizzleDb = drizzle(db, { schema });
    this.spotRepository = new SpotRepository(drizzleDb);
    this.storage = new StorageService(r2);
    this.cache = new CacheService(kv);
  }
  
  // スポットの取得 (キャッシュあり)
  async getSpotById(id: string): Promise<Spot | null> {
    // キャッシュからの取得を試みる
    return this.cache.getOrFetch(
      `spot:${id}`,
      () => this.spotRepository.findById(id),
      3600 // 1時間キャッシュ
    );
  }
  
  // 近隣スポットの検索
  async findNearbySpots(
    latitude: number,
    longitude: number,
    radius: number = 5,
    limit: number = 20
  ): Promise<Spot[]> {
    // 緯度・経度を含む範囲でキャッシュキーを作成
    const latRounded = Math.floor(latitude * 10) / 10;
    const lngRounded = Math.floor(longitude * 10) / 10;
    const cacheKey = `spots:nearby:${latRounded}:${lngRounded}:${radius}:${limit}`;
    
    return this.cache.getOrFetch(
      cacheKey,
      () => this.spotRepository.findNearby(latitude, longitude, radius, limit),
      300 // 5分間キャッシュ
    );
  }
  
  // スポットの作成
  async createSpot(data: CreateSpotInput): Promise<Spot> {
    const spot = await this.spotRepository.create(data);
    
    // キャッシュを無効化する必要はないが、新しいスポットをキャッシュする
    await this.cache.set(`spot:${spot.id}`, spot, 3600);
    
    return spot;
  }
  
  // スポットの更新
  async updateSpot(id: string, data: UpdateSpotInput): Promise<Spot> {
    const spot = await this.spotRepository.update(id, data);
    
    // 関連するキャッシュを無効化
    await this.cache.invalidate(`spot:${id}`);
    
    // 位置情報関連のキャッシュ無効化は複雑なため、パターンベースで削除
    await this.cache.invalidatePattern('spots:nearby:');
    
    return spot;
  }
  
  // スポットの削除
  async deleteSpot(id: string): Promise<boolean> {
    const result = await this.spotRepository.delete(id);
    
    if (result) {
      // キャッシュ無効化
      await this.cache.invalidate(`spot:${id}`);
      await this.cache.invalidatePattern(`spot:comments:${id}`);
      await this.cache.invalidatePattern('spots:nearby:');
      
      // 削除されたスポットIDをクリーンアップリストに追加
      await this.addToDeletedSpotsList(id);
    }
    
    return result;
  }
  
  // 削除スポットリストに追加（画像クリーンアップ用）
  private async addToDeletedSpotsList(spotId: string): Promise<void> {
    const deletedSpots = await this.cache.get<string[]>('cleanup:deleted_spots', []);
    deletedSpots.push(spotId);
    await this.cache.set('cleanup:deleted_spots', deletedSpots);
  }
  
  // スポット画像の取得
  async getSpotImages(spotId: string): Promise<SpotImage[]> {
    return this.spotRepository.findImagesBySpotId(spotId);
  }
  
  // スポット画像のアップロード
  async uploadSpotImage(
    spotId: string,
    file: File,
    caption?: string,
    isPrimary: boolean = false
  ): Promise<SpotImage> {
    // 画像をR2にアップロード
    const imageId = crypto.randomUUID();
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const key = `spots/${spotId}/${imageId}.${fileExt}`;
    
    const imageUrl = await this.storage.uploadFile(
      key,
      await file.arrayBuffer(),
      {
        spotId,
        caption: caption || '',
        isPrimary: String(isPrimary)
      },
      file.type
    );
    
    // 画像メタデータをDBに保存
    const image = await this.spotRepository.createImage({
      id: imageId,
      spotId,
      imageUrl,
      caption: caption || null,
      isPrimary,
    });
    
    // isPrimaryがtrueの場合、他の画像をprimaryではなくする
    if (isPrimary) {
      await this.spotRepository.updatePrimaryImage(spotId, imageId);
    }
    
    return image;
  }
}
```

## クエリの最適化

### N+1問題の解決

```typescript
// src/graphql/dataloaders/index.ts
import DataLoader from 'dataloader';
import { SpotRepository } from '../../domain/repositories/spotRepository';
import { CategoryRepository } from '../../domain/repositories/categoryRepository';
import { UserRepository } from '../../domain/repositories/userRepository';

// データローダーの作成
export function createDataLoaders(db) {
  const spotRepository = new SpotRepository(db);
  const categoryRepository = new CategoryRepository(db);
  const userRepository = new UserRepository(db);
  
  return {
    // カテゴリローダー
    categoryLoader: new DataLoader(async (ids: string[]) => {
      const categories = await categoryRepository.findByIds(ids);
      return ids.map(id => categories.find(cat => cat.id === id) || null);
    }),
    
    // ユーザーローダー
    userLoader: new DataLoader(async (ids: string[]) => {
      const users = await userRepository.findByIds(ids);
      return ids.map(id => users.find(user => user.id === id) || null);
    }),
    
    // スポット画像ローダー
    spotImagesLoader: new DataLoader(async (spotIds: string[]) => {
      const allImages = await spotRepository.findImagesBySpotIds(spotIds);
      return spotIds.map(spotId => 
        allImages.filter(img => img.spotId === spotId) || []
      );
    }),
  };
}

// リゾルバでのデータローダー使用例
builder.objectType('Spot', {
  fields: (t) => ({
    // ...他のフィールド
    category: t.field({
      type: 'Category',
      resolve: async (spot, _, { dataLoaders }) => {
        return dataLoaders.categoryLoader.load(spot.categoryId);
      },
    }),
    createdBy: t.field({
      type: 'User',
      resolve: async (spot, _, { dataLoaders }) => {
        return dataLoaders.userLoader.load(spot.createdById);
      },
    }),
    images: t.field({
      type: ['SpotImage'],
      resolve: async (spot, _, { dataLoaders }) => {
        return dataLoaders.spotImagesLoader.load(spot.id);
      },
    }),
  }),
});
```

## エラー処理

### カスタムエラークラス

```typescript
// src/graphql/errors.ts
import { GraphQLError } from 'graphql';

// 認証エラー
export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    });
  }
}

// 権限エラー
export class ForbiddenError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'FORBIDDEN',
        http: { status: 403 },
      },
    });
  }
}

// 入力検証エラー
export class ValidationError extends GraphQLError {
  constructor(message: string, invalidArgs: Record<string, string>) {
    super(message, {
      extensions: {
        code: 'BAD_USER_INPUT',
        http: { status: 400 },
        invalidArgs,
      },
    });
  }
}

// リソース未検出エラー
export class NotFoundError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'NOT_FOUND',
        http: { status: 404 },
      },
    });
  }
}

// ビジネスルール違反エラー
export class BusinessRuleError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'BUSINESS_RULE_VIOLATION',
        http: { status: 422 },
      },
    });
  }
}
```

### エラー処理ミドルウェア

```typescript
// src/graphql/errorHandler.ts
export const errorHandler = (err, req, result) => {
  // 開発環境の場合は詳細なエラー情報を提供
  if (process.env.NODE_ENV !== 'production') {
    console.error('GraphQL Error:', err);
    
    // スタックトレースを追加
    if (err.originalError) {
      err.extensions.stacktrace = err.originalError.stack
        .split('\
')
        .slice(1)
        .map(line => line.trim());
    }
  } else {
    // 本番環境ではスタックトレースを削除
    delete err.extensions.stacktrace;
    
    // 内部エラーの場合はメッセージを一般化
    if (err.extensions.code === 'INTERNAL_SERVER_ERROR') {
      err.message = 'サーバーエラーが発生しました。時間をおいて再試行してください。';
    }
  }
  
  // エラーメトリクスの記録（省略）
  
  return err;
};
```

## 認証・認可

### 認証ミドルウェア

```typescript
// src/interfaces/api/middlewares/auth.ts
import { verifyAuthToken } from '../../../infrastructure/auth/tokenService';

// Honoミドルウェア
export const authMiddleware = async (c, next) => {
  const authHeader = c.req.headers.get('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = await verifyAuthToken(token, c.env);
      
      if (payload && payload.sub) {
        // ユーザー情報をリクエストに添付
        c.set('currentUser', {
          id: payload.sub,
          role: payload.role || 'user',
        });
      }
    } catch (error) {
      // トークンが無効な場合は何もしない
      console.error('Auth error:', error);
    }
  }
  
  await next();
};
```

### GraphQLディレクティブによる権限制御

```typescript
// src/graphql/schema/directives.ts
import { builder } from './builder';

// 認証ディレクティブ
builder.directive('requireAuth', {
  locations: ['FIELD_DEFINITION'],
  args: {
    roles: t => t.stringList(),
  },
  onResolve(resolver, root, args, context, info) {
    const { currentUser } = context;
    
    // 認証チェック
    if (!currentUser) {
      throw new AuthenticationError('この操作を行うにはログインが必要です。');
    }
    
    // 権限チェック
    if (args.roles && args.roles.length > 0 && !args.roles.includes(currentUser.role)) {
      throw new ForbiddenError('この操作を行うのに必要な権限がありません。');
    }
    
    // 原、リラバーを実行
    return resolver();
  },
});

// ディレクティブを使用したフィールド例
builder.objectType('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    email: t.exposeString('email'),
    // 管理者ロールのみ参照可能
    role: t.exposeString('role', {
      directives: [
        {
          name: 'requireAuth',
          args: {
            roles: ['admin'],
          },
        },
      ],
    }),
  }),
});
```

## パフォーマンス最適化

### キャッシュ戦略

```typescript
// src/domain/services/cacheService.ts
import { CacheManager } from '../../infrastructure/cache/cacheManager';

export class CacheService {
  private cacheManager: CacheManager;
  
  constructor(kv: KVNamespace) {
    this.cacheManager = new CacheManager(kv);
  }
  
  // キャッシュから取得か、取得できない場合は関数実行でフェッチ
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600 // デフォルト1時間
  ): Promise<T> {
    // キャッシュから読み込み
    const cached = await this.cacheManager.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }
    
    // キャッシュにない場合は関数を実行
    const data = await fetcher();
    
    // 結果をキャッシュ
    await this.cacheManager.set(key, data, ttl);
    
    return data;
  }
  
  // 特定のキャッシュを無効化
  async invalidate(key: string): Promise<void> {
    await this.cacheManager.delete(key);
  }
  
  // パターンに一致するキャッシュを無効化
  async invalidatePattern(pattern: string): Promise<void> {
    await this.cacheManager.deleteByPattern(pattern);
  }
}
```

### クエリ複雑度制限

```typescript
// src/graphql/complexity.ts
import { createComplexityPlugin } from '@pothos/plugin-complexity';
import { builder } from './schema/builder';

// 複雑度制限プラグイン
export const complexityPlugin = createComplexityPlugin({
  // それぞれのフィールドの複雑度スコア
  complexityDefinitions: {
    // ネストされたリレーションとリストは高い複雑度
    'Spot.comments': { complexity: 5 },
    'Spot.images': { complexity: 3 },
    'Comment.user': { complexity: 2 },
    'User.spots': { complexity: 5 },
    
    // 検索は高い複雑度
    'Query.searchSpots': { complexity: 10 },
    'Query.nearbySpots': { complexity: 8 },
  },
  
  // リクエスト全体の複雑度上限
  maxComplexity: 200,
  
  // 複雑度計算のカスタマイズ
  complexityScalarCost: 1,
  complexityObjectCost: 2,
  complexityListCost: ({ childComplexity }) => 10 + childComplexity,
  complexityListMultiplier: 10, // リストの乗数
  
  // 複雑度オーバー時のエラー処理
  onComplexityLimitReached: (data) => {
    throw new GraphQLError(
      `クエリの複雑度が高すぎます。リクエストをオプティマイズしてください。計算複雑度: ${data.complexity}, 最大許容値: ${data.maxComplexity}`,
      {
        extensions: {
          code: 'QUERY_COMPLEXITY_EXCEEDED',
          complexity: data.complexity,
          maxComplexity: data.maxComplexity,
        },
      }
    );
  },
});

// 複雑度プラグインをビルダーに統合
builder.use(complexityPlugin);
```

## レート制限

```typescript
// src/interfaces/api/middlewares/rateLimiter.ts
import { Context } from 'hono';

// レート制限ミドルウェア
export const rateLimiter = async (c: Context, next: () => Promise<void>) => {
  const ip = c.req.headers.get('CF-Connecting-IP') || 'unknown';
  const path = new URL(c.req.url).pathname;
  
  // GraphQLリクエストへのレート制限
  if (path === '/graphql') {
    const key = `rate_limit:graphql:${ip}`;
    
    // 現在のカウントを取得
    const count = parseInt(await c.env.KV.get(key) || '0', 10);
    
    // レート制限の判定
    if (count >= 60) { // 1分に60リクエストまで
      return c.json(
        {
          errors: [
            {
              message: 'リクエスト数が制限を超えました。時間を稍をおいて実行してください。',
              extensions: {
                code: 'RATE_LIMITED',
              },
            },
          ],
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': `${Math.floor(Date.now() / 1000) + 60}`,
          },
        }
      );
    }
    
    // カウントを増加
    await c.env.KV.put(key, (count + 1).toString(), {
      expirationTtl: 60 // 1分間有効
    });
    
    // レート制限情報をヘッダーに追加
    c.header('X-RateLimit-Limit', '60');
    c.header('X-RateLimit-Remaining', `${60 - (count + 1)}`);
    c.header('X-RateLimit-Reset', `${Math.floor(Date.now() / 1000) + 60}`);
  }
  
  await next();
};
```

## API監視とログ記録

```typescript
// src/graphql/plugins/loggingPlugin.ts
import { Plugin } from 'graphql-yoga';

// GraphQLロギングプラグイン
export const loggingPlugin: Plugin = {
  onParse: ({ params, result }) => {
    // クエリのパース結果のログ
    if (result instanceof Error) {
      console.error('Parse error:', result);
    }
    return result;
  },
  onValidate: ({ params, result }) => {
    // バリデーションエラーのログ
    if (result && result.length > 0) {
      console.error('Validation errors:', result);
    }
    return result;
  },
  onExecute: ({ args, result }) => {
    // オペレーションの実行情報をログ
    const { contextValue, document, operationName, variableValues } = args;
    
    const operationType = document.definitions.find(
      def => def.kind === 'OperationDefinition'
    )?.kind;
    
    // ログ情報の生成
    const logInfo = {
      timestamp: new Date().toISOString(),
      operation: operationName || 'anonymous',
      type: operationType,
      userId: contextValue.currentUser?.id || 'anonymous',
      ip: contextValue.request.headers.get('CF-Connecting-IP') || 'unknown',
      userAgent: contextValue.request.headers.get('User-Agent') || 'unknown',
    };
    
    // ログをKVに保存
    if (contextValue.env && contextValue.env.KV) {
      const logKey = `graphql_logs:${Date.now()}:${crypto.randomUUID()}`;
      contextValue.env.KV.put(logKey, JSON.stringify(logInfo), {
        expirationTtl: 7 * 24 * 60 * 60 // 1週間保持
      }).catch(err => console.error('Error saving log:', err));
    }
    
    return result;
  },
  onSubscribe: ({ contextValue, subscribe, args }) => {
    // サブスクリプションのログ
    const { operationName } = args;
    console.log(`Subscription started: ${operationName}`);
    return subscribe;
  },
};
```

## APIドキュメンテーション

### GraphQLスキーマの自動ドキュメント生成

```typescript
// src/tools/generate-schema-docs.ts
import { printSchema, lexicographicSortSchema } from 'graphql';
import { schema } from '../graphql/schema';
import fs from 'fs';
import path from 'path';

// GraphQLスキーマの取得とソート
const sortedSchema = lexicographicSortSchema(schema);
const schemaString = printSchema(sortedSchema);

// GraphQL SDLファイルの出力
fs.writeFileSync(
  path.join(__dirname, '../../docs/api/schema.graphql'),
  schemaString,
  'utf8'
);

// Markdownドキュメントの生成
const generateMarkdownDocs = () => {
  // 型定義の分類
  const types = sortedSchema.getTypeMap();
  const markdown = [];
  
  markdown.push('# マチポケ GraphQL API ドキュメント\
');
  markdown.push('## 概要\
');
  markdown.push('マチポケのGraphQL APIの完全なドキュメントです。\
');
  
  // クエリのドキュメント化
  markdown.push('## クエリ\
');
  // ...クエリタイプの処理
  
  // ミューテーションのドキュメント化
  markdown.push('## ミューテーション\
');
  // ...ミューテーションタイプの処理
  
  // オブジェクト型のドキュメント化
  markdown.push('## オブジェクト型\
');
  // ...オブジェクト型の処理
  
  // 他の型定義も同様に処理
  
  // Markdownファイルの出力
  fs.writeFileSync(
    path.join(__dirname, '../../docs/api/schema.md'),
    markdown.join('\
'),
    'utf8'
  );
};

generateMarkdownDocs();
```

## GraphQLユーザーガイド

```typescript
// src/interfaces/api/graphql/playground.ts
import { YogaInitialContext } from 'graphql-yoga';

// GraphQLのプレイグラウンド設定
// 開発環境でのみ有効
export const setUpPlayground = (yoga) => {
  if (process.env.NODE_ENV !== 'production') {
    // GraphiQLの設定
    yoga.graphiql = {
      title: 'マチポケ GraphQL API',
      defaultQuery: `# マチポケAPIへようこそ。以下はサンプルクエリです。

# 近くのスポットを検索
query NearbySpots {
  nearbySpots(
    latitude: 35.6809591
    longitude: 139.7673068
    radius: 3
  ) {
    id
    name
    description
    category {
      name
    }
    hiddenGemScore
    images(limit: 1) {
      imageUrl
    }
  }
}
`,
      settings: {
        'editor.theme': 'light',
        'editor.reuseHeaders': true,
        'editor.fontSize': 14,
        'schema.polling.enable': false,
        'tracing.hideTracingResponse': true,
      },
    };
  }
};
```

## フロントエンドとの統合

### Apollo Clientの設定例

```typescript
// フロントエンド側のGraphQLクライアント設定
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// HTTPリンクの設定
const httpLink = createHttpLink({
  uri: '/graphql',
});

// エラーハンドリング
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // 認証エラーの場合はリダイレクト
      if (extensions?.code === 'UNAUTHENTICATED') {
        // ログインページにリダイレクト
        window.location.href = '/login';
      }
      
      // レート制限の場合は通知
      if (extensions?.code === 'RATE_LIMITED') {
        // ユーザーに通知
        showNotification('APIリクエスト数が多すぎます。時間をおいて再試行してください。');
      }
    });
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// 認証トークンの設定
const authLink = setContext((_, { headers }) => {
  // ローカルストレージからトークンを取得
  const token = localStorage.getItem('auth_token');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Apolloクライアントの作成
const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // 近隣スポットは座標でキャッシュキーを生成
          nearbySpots: {
            keyArgs: ['latitude', 'longitude', 'radius'],
          },
          // カテゴリ検索はページネーション用にマージルールを設定
          spotsByCategory: {
            keyArgs: ['categoryId'],
            merge(existing = [], incoming, { args }) {
              const { offset = 0 } = args || {};
              const merged = existing ? [...existing] : [];
              for (let i = 0; i < incoming.length; i++) {
                merged[offset + i] = incoming[i];
              }
              return merged;
            },
          },
        },
      },
      // スポットのキャッシュ設定
      Spot: {
        fields: {
          comments: {
            keyArgs: false,
            merge(existing = [], incoming, { args }) {
              const { offset = 0 } = args || {};
              const merged = existing ? [...existing] : [];
              for (let i = 0; i < incoming.length; i++) {
                merged[offset + i] = incoming[i];
              }
              return merged;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
  },
});
```

### リアクトコンポーネントでの使用例

```tsx
// src/components/spots/NearbySpots.tsx
import { useQuery, gql } from '@apollo/client';
import { useGeolocation } from '../../hooks/useGeolocation';
import SpotCard from '../common/SpotCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

// GraphQLクエリの定義
const NEARBY_SPOTS_QUERY = gql`
  query NearbySpots($latitude: Float!, $longitude: Float!, $radius: Float) {
    nearbySpots(latitude: $latitude, longitude: $longitude, radius: $radius) {
      id
      name
      description
      hiddenGemScore
      category {
        name
      }
      images {
        id
        imageUrl
        isPrimary
      }
      createdAt
    }
  }
`;

const NearbySpots = () => {
  // 現在位置の取得
  const { coordinates, error: geoError, loading: geoLoading } = useGeolocation();
  
  // 近隣スポットのクエリ
  const { loading, error, data } = useQuery(NEARBY_SPOTS_QUERY, {
    variables: {
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
      radius: 5, // 5km半径
    },
    skip: !coordinates, // 座標が取得できるまでスキップ
  });
  
  if (geoLoading) {
    return <LoadingSpinner message="現在位置を取得中..." />;
  }
  
  if (geoError) {
    return <ErrorMessage message="位置情報の取得に失敗しました。位置情報の利用を許可してください。" />;
  }
  
  if (loading) {
    return <LoadingSpinner message="近くのスポットを探しています..." />;
  }
  
  if (error) {
    return <ErrorMessage message={`スポットの取得中にエラーが発生しました: ${error.message}`} />;
  }
  
  const { nearbySpots } = data;
  
  if (nearbySpots.length === 0) {
    return <p>現在地の近くにスポットが見つかりませんでした。新しいスポットを登録してみませんか？</p>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {nearbySpots.map((spot) => (
        <SpotCard key={spot.id} spot={spot} />
      ))}
    </div>
  );
};

export default NearbySpots;
```

## まとめ

マチポケのGraphQL APIは、Pothos GraphQLを用いた型安全な設計とクラウドネイティブなインフラストラクチャで構築されています。主な特徴は以下の通りです：

1. **型安全性**: TypeScriptとPothos GraphQLによる型安全な実装
2. **パフォーマンス最適化**: キャッシュ戦略とN+1問題の解決
3. **セキュリティ**: 認証、認可、レート制限の実装
4. **スケーラビリティ**: Cloudflareエッジプラットフォームの活用

このアーキテクチャは、アプリケーションの成長に合わせて柔軟に拡張できるよう設計されており、フロントエンドとバックエンドの分離を可能にしながらも型安全な統合を実現しています。