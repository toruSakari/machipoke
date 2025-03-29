# マチポケ テストガイド

このドキュメントでは、マチポケプロジェクトのテスト戦略と実践方法について説明します。

## テスト戦略

マチポケプロジェクトでは、以下のレベルでテストを実施します：

1. **単体テスト**：個々のコンポーネント、関数、クラスの機能をテスト
2. **統合テスト**：複数のコンポーネントの連携をテスト
3. **E2Eテスト**：ユーザーの視点からアプリケーション全体の動作をテスト

### テストピラミッド

テストの量と実行頻度は以下のピラミッド構造に従います：

- **底部（多数）**：単体テスト - 速く、安定していて、詳細なカバレッジを提供
- **中部（中程度）**：統合テスト - 複数のコンポーネントの連携を検証
- **頂部（少数）**：E2Eテスト - 重要なユーザーフローのみをカバー

## テストツール

### フロントエンド

- **単体テスト・統合テスト**：Vitest + React Testing Library
- **コンポーネントテスト**：Storybook + Chromatic（ビジュアルリグレッションテスト）
- **E2Eテスト**：Playwright

### バックエンド

- **単体テスト**：Vitest
- **統合テスト**：Vitest + Miniflare（Cloudflare Workersのエミュレーション）
- **API テスト**：SuperTest

## 単体テスト

### フロントエンドの単体テスト

```typescript
// src/components/spots/SpotCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpotCard } from './SpotCard';

describe('SpotCard', () => {
  const mockSpot = {
    id: '1',
    name: 'テストスポット',
    description: 'これはテストスポットです',
    latitude: 35.6812,
    longitude: 139.7671,
    categories: [
      { id: 'cat1', name: 'カフェ' },
      { id: 'cat2', name: '穴場' },
    ],
  };

  it('スポット情報が正しく表示されること', () => {
    render(<SpotCard spot={mockSpot} />);
    
    expect(screen.getByText('テストスポット')).toBeInTheDocument();
    expect(screen.getByText('これはテストスポットです')).toBeInTheDocument();
    expect(screen.getByText('カフェ')).toBeInTheDocument();
    expect(screen.getByText('穴場')).toBeInTheDocument();
  });

  it('クリック時にコールバックが呼ばれること', () => {
    const handleClick = vi.fn();
    render(<SpotCard spot={mockSpot} onClick={handleClick} />);
    
    const card = screen.getByText('テストスポット').closest('.card');
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledWith('1');
  });
});
```

### カスタムフックのテスト

```typescript
// src/hooks/useSpot.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSpot } from './useSpot';
import { graphqlClient } from '@/lib/graphql-client';

// GraphQLクライアントのモック
vi.mock('@/lib/graphql-client', () => ({
  graphqlClient: {
    request: vi.fn(),
  },
}));

describe('useSpot', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    vi.clearAllMocks();
  });

  it('スポットデータを正しく取得すること', async () => {
    const mockSpotData = {
      spot: {
        id: '1',
        name: 'テストスポット',
        description: 'これはテストスポットです',
        latitude: 35.6812,
        longitude: 139.7671,
        categories: [
          { id: 'cat1', name: 'カフェ' },
          { id: 'cat2', name: '穴場' },
        ],
        createdBy: {
          id: 'user1',
          username: 'testuser',
        },
      },
    };
    
    // GraphQLクライアントのレスポンスをモック
    (graphqlClient.request as any).mockResolvedValue(mockSpotData);
    
    // カスタムフックをレンダリング
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    
    const { result } = renderHook(() => useSpot('1'), { wrapper });
    
    // 初期状態はローディング中
    expect(result.current.isLoading).toBe(true);
    
    // データが読み込まれるまで待機
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // データが正しく取得されていることを確認
    expect(result.current.data).toEqual(mockSpotData);
    expect(result.current.error).toBeNull();
    
    // GraphQLクライアントが正しいパラメータで呼び出されたことを確認
    expect(graphqlClient.request).toHaveBeenCalledWith(
      expect.anything(),
      { id: '1' }
    );
  });

  it('エラー時に適切に処理すること', async () => {
    // GraphQLクライアントのエラーをモック
    const mockError = new Error('GraphQL error');
    (graphqlClient.request as any).mockRejectedValue(mockError);
    
    // カスタムフックをレンダリング
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    
    const { result } = renderHook(() => useSpot('1'), { wrapper });
    
    // データが読み込まれるまで待機
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // エラーが正しく設定されていることを確認
    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeUndefined();
  });
});
```

### バックエンドの単体テスト

```typescript
// src/domain/models/spot/spot.test.ts
import { describe, it, expect } from 'vitest';
import { Spot } from './spot';
import { User } from '../user/user';
import { Category } from '../category/category';

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

  const spotProps = {
    id: 'spot1',
    name: 'テストスポット',
    description: 'これはテストスポットです',
    latitude: 35.6812,
    longitude: 139.7671,
    hiddenLevel: 3,
    createdBy: mockUser,
    categories: mockCategories,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should create a spot instance correctly', () => {
    const spot = new Spot(spotProps);
    
    expect(spot.id).toBe('spot1');
    expect(spot.name).toBe('テストスポット');
    expect(spot.latitude).toBe(35.6812);
    expect(spot.longitude).toBe(139.7671);
    expect(spot.hiddenLevel).toBe(3);
    expect(spot.createdBy).toBe(mockUser);
    expect(spot.categories).toEqual(mockCategories);
  });

  it('should calculate if a point is nearby correctly', () => {
    const spot = new Spot(spotProps);
    
    // 近い地点（1km以内）
    expect(spot.isNearby(35.6850, 139.7680, 1)).toBe(true);
    
    // 遠い地点（10km以上）
    expect(spot.isNearby(35.8000, 139.9000, 5)).toBe(false);
  });
});
```

## 統合テスト

### フロントエンドの統合テスト

```typescript
// src/routes/spot/[id]/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SpotDetailPage } from './page';
import { useSpot } from '@/hooks/useSpot';

// useSpotフックのモック
vi.mock('@/hooks/useSpot', () => ({
  useSpot: vi.fn(),
}));

describe('SpotDetailPage', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    vi.clearAllMocks();
  });

  it('ローディング中の表示が正しいこと', () => {
    // useSpotフックの戻り値をモック
    (useSpot as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    
    // コンポーネントをレンダリング
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/spots/123']}>
          <Routes>
            <Route path="/spots/:id" element={<SpotDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
    
    // ローディングインジケータが表示されていることを確認
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('スポット詳細が正しく表示されること', async () => {
    // useSpotフックの戻り値をモック
    const mockSpotData = {
      spot: {
        id: '123',
        name: 'テストスポット',
        description: 'これはテストスポットです',
        latitude: 35.6812,
        longitude: 139.7671,
        categories: [
          { id: 'cat1', name: 'カフェ' },
        ],
        createdBy: {
          id: 'user1',
          username: 'testuser',
        },
        images: [
          { id: 'img1', imageUrl: 'https://example.com/image.jpg' },
        ],
      },
    };
    
    (useSpot as any).mockReturnValue({
      data: mockSpotData,
      isLoading: false,
      error: null,
    });
    
    // コンポーネントをレンダリング
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/spots/123']}>
          <Routes>
            <Route path="/spots/:id" element={<SpotDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
    
    // スポット情報が正しく表示されていることを確認
    expect(screen.getByText('テストスポット')).toBeInTheDocument();
    expect(screen.getByText('これはテストスポットです')).toBeInTheDocument();
    expect(screen.getByText('カフェ')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    
    // 画像が表示されていることを確認
    const image = screen.getByAltText('テストスポット');
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('エラー時に適切なメッセージが表示されること', () => {
    // useSpotフックの戻り値をモック（エラー状態）
    (useSpot as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('スポットの取得に失敗しました'),
    });
    
    // コンポーネントをレンダリング
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/spots/123']}>
          <Routes>
            <Route path=\"/spots/:id\" element={<SpotDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
    
    // エラーメッセージが表示されていることを確認
    expect(screen.getByText('スポット情報の取得に失敗しました')).toBeInTheDocument();
  });
});
```

### バックエンドの統合テスト

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
    await drizzleDb.insert(schema.users).values({
      id: 'user1',
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: 'hashed_password',
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    });
    
    await drizzleDb.insert(schema.categories).values({
      id: 'cat1',
      name: 'カフェ',
      createdAt: Math.floor(Date.now() / 1000),
    });
    
    await drizzleDb.insert(schema.spots).values({
      id: 'spot1',
      name: 'テストスポット',
      description: 'これはテストスポットです',
      latitude: 35.6812,
      longitude: 139.7671,
      hiddenLevel: 3,
      createdById: 'user1',
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    });
    
    await drizzleDb.insert(schema.spotCategories).values({
      id: 'sc1',
      spotId: 'spot1',
      categoryId: 'cat1',
      createdAt: Math.floor(Date.now() / 1000),
    });
  });

  afterAll(async () => {
    // テストデータのクリーンアップ
    await drizzleDb.delete(schema.spotCategories).where(true);
    await drizzleDb.delete(schema.spots).where(true);
    await drizzleDb.delete(schema.categories).where(true);
    await drizzleDb.delete(schema.users).where(true);
  });

  it('should find a spot by id', async () => {
    const spot = await spotRepository.findById('spot1');
    
    expect(spot).not.toBeNull();
    expect(spot?.id).toBe('spot1');
    expect(spot?.name).toBe('テストスポット');
    expect(spot?.description).toBe('これはテストスポットです');
    expect(spot?.latitude).toBe(35.6812);
    expect(spot?.longitude).toBe(139.7671);
    expect(spot?.hiddenLevel).toBe(3);
    expect(spot?.createdBy.id).toBe('user1');
    expect(spot?.createdBy.username).toBe('testuser');
    expect(spot?.categories.length).toBe(1);
    expect(spot?.categories[0].id).toBe('cat1');
    expect(spot?.categories[0].name).toBe('カフェ');
  });

  it('should return null for non-existent spot id', async () => {
    const spot = await spotRepository.findById('non-existent-id');
    expect(spot).toBeNull();
  });
});
```

## E2Eテスト

Playwrightを使用したE2Eテスト：

```typescript
// e2e/spot-detail.spec.ts
import { test, expect } from '@playwright/test';

test.describe('スポット詳細ページ', () => {
  test('スポット詳細が正しく表示されること', async ({ page }) => {
    // 詳細ページへ移動
    await page.goto('/spots/1');
    
    // 必要な要素が表示されるまで待機
    await page.waitForSelector('h1');
    
    // スポットのタイトルを確認
    expect(await page.textContent('h1')).toBe('テストスポット');
    
    // スポットの説明を確認
    const description = await page.textContent('[data-testid=\"spot-description\"]');
    expect(description).toContain('これはテストスポットです');
    
    // カテゴリが表示されていることを確認
    const categoryBadge = await page.textContent('.category-badge');
    expect(categoryBadge).toBe('カフェ');
    
    // 地図が表示されていることを確認
    const map = await page.$('[data-testid=\"spot-map\"]');
    expect(map).not.toBeNull();
    
    // 投稿者情報が表示されていることを確認
    const author = await page.textContent('[data-testid=\"spot-author\"]');
    expect(author).toContain('testuser');
  });

  test('「行ってみたい」ボタンが機能すること', async ({ page }) => {
    // ログインする（テスト用の認証処理）
    await page.goto('/login');
    await page.fill('[name=\"email\"]', 'test@example.com');
    await page.fill('[name=\"password\"]', 'password');
    await page.click('button[type=\"submit\"]');
    
    // 詳細ページへ移動
    await page.goto('/spots/1');
    
    // 「行ってみたい」ボタンをクリック
    await page.click('[data-testid=\"want-to-go-button\"]');
    
    // ボタンの状態が変わったことを確認
    const buttonText = await page.textContent('[data-testid=\"want-to-go-button\"]');
    expect(buttonText).toContain('行ってみたい登録済み');
    
    // マイページに反映されていることを確認
    await page.goto('/profile');
    const savedSpot = await page.textContent('[data-testid=\"saved-spots\"]');
    expect(savedSpot).toContain('テストスポット');
  });
});
```

## コンポーネントテスト（Storybook）

```typescript
// src/components/spots/SpotCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { SpotCard } from './SpotCard';

const meta: Meta<typeof SpotCard> = {
  title: 'Components/Spots/SpotCard',
  component: SpotCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SpotCard>;

export const Default: Story = {
  args: {
    spot: {
      id: '1',
      name: 'テストスポット',
      description: 'これはテストスポットです。隠れた名所で地元の人にしか知られていない場所です。',
      latitude: 35.6812,
      longitude: 139.7671,
      categories: [
        { id: 'cat1', name: 'カフェ' },
        { id: 'cat2', name: '穴場' },
      ],
    },
  },
};

export const WithImage: Story = {
  args: {
    spot: {
      id: '2',
      name: '画像付きスポット',
      description: '画像のあるスポットです。',
      latitude: 35.6586,
      longitude: 139.7454,
      categories: [
        { id: 'cat3', name: '観光' },
      ],
      thumbnailUrl: 'https://example.com/image.jpg',
    },
  },
};

export const LongTitle: Story = {
  args: {
    spot: {
      id: '3',
      name: 'とても長いタイトルのスポット名称がここに入ります。これは表示の確認用です。',
      description: '長いタイトルの場合のレイアウト確認用です。',
      latitude: 35.6586,
      longitude: 139.7454,
      categories: [
        { id: 'cat1', name: 'カフェ' },
      ],
    },
  },
};
```

## テストカバレッジ

vitestの設定ファイル（vitest.config.ts）：

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/index.ts',
      ],
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
});
```

テストカバレッジを確認するコマンド：

```bash
# フロントエンドのテストカバレッジ
cd packages/client
npm run test:coverage

# バックエンドのテストカバレッジ
cd packages/server
npm run test:coverage
```

## CI/CDパイプラインでのテスト

GitHub Actionsの設定例：

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test-client:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run frontend tests
        run: npm run test:client
      - name: Run Storybook tests
        run: npm run test:storybook

  test-server:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run backend tests
        run: npm run test:server

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Build app
        run: npm run build
      - name: Start app
        run: npm run start:test &
      - name: Run E2E tests
        run: npm run test:e2e
```

## テストのベストプラクティス

1. **テストファーストの開発**: 可能な限り、実装前にテストを書く
2. **独立したテスト**: 各テストは他のテストに依存せず、順番に関係なく実行できるようにする
3. **DRY原則の緩和**: テストでは読みやすさのためにコードの重複を許容する
4. **テスト対象の分離**: 外部依存はモックまたはスタブに置き換える
5. **境界値のテスト**: エッジケースや境界値条件を考慮したテストを行う
6. **失敗ケースのテスト**: 正常系だけでなく、異常系も必ずテストする
7. **テスト名の明確化**: テスト名は「何をテストするか」を明確に表現する
8. **フィクスチャの利用**: 共通のテストデータはフィクスチャとして用意する
9. **視覚的なレグレッションテスト**: UIコンポーネントには視覚的なレグレッションテストを使用する
10. **継続的なテスト実行**: CI/CDパイプラインでテストを自動実行する

## プロジェクト固有のテスト要件

マチポケプロジェクトにおいて特に重要なテスト項目：

### 位置情報のテスト

スポットの位置情報や地図関連機能はプロダクトの中核となるため、以下のテストを実施：

```typescript
// 距離計算の単体テスト
it('距離計算が正しく動作すること', () => {
  // 東京駅と東京タワーの位置（約2.5km離れている）
  const tokyoStation = {
    latitude: 35.6812,
    longitude: 139.7671,
  };
  
  const tokyoTower = {
    latitude: 35.6586,
    longitude: 139.7454,
  };
  
  const distance = calculateDistance(
    tokyoStation.latitude,
    tokyoStation.longitude,
    tokyoTower.latitude,
    tokyoTower.longitude
  );
  
  // 計算誤差を考慮して2.5kmの距離を確認
  expect(distance).toBeCloseTo(2.5, 1); // 2.5kmに近い値か確認（1桁までの精度）
});

// 地図表示のE2Eテスト
test('地図上にマーカーが表示されること', async ({ page }) => {
  await page.goto('/map');
  
  // 地図がロードされるのを待つ
  await page.waitForSelector('#map-container:not(.loading)');
  
  // スポットマーカーが表示されているか確認
  const markers = await page.$('.spot-marker');
  expect(markers.length).toBeGreaterThan(0);
  
  // マーカーの位置が正しいか確認（実装依存）
  // マーカークリック時にポップアップが表示されるか確認
  await markers[0].click();
  await page.waitForSelector('.spot-popup');
  expect(await page.isVisible('.spot-popup')).toBe(true);
});
```

### 画像アップロードのテスト

R2ストレージに画像をアップロードする機能のテスト：

```typescript
// モックを使用したアップロードサービスのテスト
describe('ImageUploadService', () => {
  let imageUploadService: ImageUploadService;
  let mockR2Bucket: MockR2Bucket;
  
  beforeEach(() => {
    mockR2Bucket = {
      put: vi.fn().mockResolvedValue(true),
      delete: vi.fn().mockResolvedValue(true),
    };
    
    imageUploadService = new ImageUploadService(mockR2Bucket as any);
  });
  
  it('画像をアップロードしてURLを返すこと', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const userId = 'user123';
    
    const url = await imageUploadService.uploadImage(mockFile, userId);
    
    expect(mockR2Bucket.put).toHaveBeenCalledTimes(1);
    expect(mockR2Bucket.put.mock.calls[0][0]).toContain(userId);
    expect(mockR2Bucket.put.mock.calls[0][0]).toContain('.jpg');
    expect(url).toContain('https://images.machipoke.com/');
  });
  
  it('画像を削除できること', async () => {
    const imageUrl = 'https://images.machipoke.com/user123/test.jpg';
    
    await imageUploadService.deleteImage(imageUrl);
    
    expect(mockR2Bucket.delete).toHaveBeenCalledTimes(1);
    expect(mockR2Bucket.delete).toHaveBeenCalledWith('user123/test.jpg');
  });
});
```

## バグ修正プロセス

バグ発見時のテストプロセス：

1. バグを再現するテストを作成する
2. バグが修正されたことを確認するためにテストを実行する
3. テストを回帰テストとして維持する

```typescript
// 位置情報バグ修正のテスト例
describe('Location bug fixes', () => {
  it('bug #123: 境界値の緯度・経度が正しく処理されること', () => {
    // バグ発生条件: 緯度が-90、または+90の場合
    const spot1 = new Spot({
      ...defaultSpotProps,
      latitude: -90,
      longitude: 0,
    });
    
    const spot2 = new Spot({
      ...defaultSpotProps,
      latitude: 90,
      longitude: 0,
    });
    
    // 北極と南極の場合にエラーが起きないことを確認
    expect(() => spot1.calculateDistance(0, 0)).not.toThrow();
    expect(() => spot2.calculateDistance(0, 0)).not.toThrow();
  });
});
```

## テスト自動化のベストプラクティス

- **テストデータ生成の自動化**: テストデータはファクトリ関数やフィクスチャを使用して自動生成する
- **実行時間の最適化**: テストの実行時間を短縮するために、不要なテストをスキップし、並行実行を活用する
- **テストのフィードバックループ**: テスト結果を自動分析し、テストカバレッジの向上に続けて取り組む

## 参考リンク

- [Vitest ドキュメント](https://vitest.dev/)
- [React Testing Library ドキュメント](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright ドキュメント](https://playwright.dev/)
- [Storybook ドキュメント](https://storybook.js.org/)
- [テスト駆動開発（TDD）について](https://www.agilealliance.org/glossary/tdd/)
- [フロントエンドテストの戦略](https://martinfowler.com/articles/practical-test-pyramid.html)