# マチポケ パフォーマンス最適化ガイド

このドキュメントでは、マチポケアプリケーションのパフォーマンスを最適化するための戦略と具体的な実装方法について説明します。

## 目次

1. [パフォーマンス目標](#パフォーマンス目標)
2. [フロントエンドの最適化](#フロントエンドの最適化)
3. [バックエンドの最適化](#バックエンドの最適化)
4. [データベースの最適化](#データベースの最適化)
5. [画像の最適化](#画像の最適化)
6. [キャッシング戦略](#キャッシング戦略)
7. [ネットワーク最適化](#ネットワーク最適化)
8. [モバイル最適化](#モバイル最適化)
9. [パフォーマンスモニタリング](#パフォーマンスモニタリング)
10. [継続的な最適化](#継続的な最適化)

## パフォーマンス目標

マチポケアプリケーションでは、以下のパフォーマンス目標を設定しています：

- **ページ読み込み時間**: 初回訪問時に2秒以内、再訪問時に1秒以内
- **Time to Interactive (TTI)**: 3秒以内
- **First Contentful Paint (FCP)**: 1.5秒以内
- **Largest Contentful Paint (LCP)**: 2.5秒以内
- **API応答時間**: 300ms以内
- **地図表示時間**: 1.5秒以内

これらの目標は、以下の測定環境で達成することを目指します：
- デスクトップ: 高速ブロードバンド接続
- モバイル: 4G接続
- モバイルデバイス: 中級スマートフォン

## フロントエンドの最適化

### コード分割

バンドルサイズを小さくするため、Reactアプリケーションでコード分割を実装します。

```jsx
// ルートベースのコード分割
import { lazy, Suspense } from 'react';
import { Loading } from '@/components/common/Loading';

const MapView = lazy(() => import('@/routes/map/page'));
const SpotDetailPage = lazy(() => import('@/routes/spot/[id]/page'));

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route 
        path="/map" 
        element={
          <Suspense fallback={<Loading />}>
            <MapView />
          </Suspense>
        } 
      />
      <Route 
        path="/spots/:id" 
        element={
          <Suspense fallback={<Loading />}>
            <SpotDetailPage />
          </Suspense>
        } 
      />
    </Routes>
  );
}
```

### JavaScript最適化

パフォーマンスを向上させるためのJavaScript最適化：

1. **バンドルサイズの最適化**:
   - 未使用コードの削除（Tree Shaking）
   - モジュールの依存関係の最適化

    ```javascript
    // vite.config.ts
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import { visualizer } from 'rollup-plugin-visualizer';

    export default defineConfig({
      plugins: [
        react(),
        visualizer({ // バンドルサイズの分析
          open: true,
          filename: 'dist/stats.html',
        }),
      ],
      build: {
        target: 'es2020',
        rollupOptions: {
          output: {
            manualChunks: {
              react: ['react', 'react-dom', 'react-router'],
              mapbox: ['mapbox-gl'],
              ui: ['@/components/ui'],
            },
          },
        },
      },
    });
    ```

2. **メモ化**:

    ```jsx
    // リスト再レンダリングの最適化
    import React, { memo, useMemo } from 'react';

    const SpotsList = memo(({ spots, onSpotSelect }) => {
      // スポットのソートは変更があった場合のみ実行
      const sortedSpots = useMemo(() => {
        return [...spots].sort((a, b) => a.name.localeCompare(b.name));
      }, [spots]);

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSpots.map(spot => (
            <SpotCard
              key={spot.id}
              spot={spot}
              onClick={onSpotSelect}
            />
          ))}
        </div>
      );
    });
    ```

3. **効率的なイベントハンドリング**:

    ```jsx
    // イベントの委任を使用
    function SpotsList({ spots, onSpotSelect }) {
      const handleClick = (e) => {
        const spotId = e.target.closest('[data-spot-id]')?.dataset.spotId;
        if (spotId) {
          onSpotSelect(spotId);
        }
      };

      return (
        <div className="spots-grid" onClick={handleClick}>
          {spots.map(spot => (
            <div key={spot.id} data-spot-id={spot.id} className="spot-card">
              {/* スポット情報 */}
            </div>
          ))}
        </div>
      );
    }
    ```

### CSS最適化

1. **クリティカルCSSの抽出**:

    ```javascript
    // ViteでのクリティカルCSS設定
    import { criticalCss } from 'vite-plugin-critical-css';

    export default defineConfig({
      plugins: [
        react(),
        criticalCss({
          inlineThreshold: 4096,
          penthouse: {
            renderWaitTime: 300,
          },
        }),
      ],
    });
    ```

2. **Tailwindの最適化**:

    ```javascript
    // tailwind.config.js
    module.exports = {
      content: ['./src/**/*.{js,jsx,ts,tsx}'],
      theme: {
        // テーマ設定
      },
      variants: {
        extend: {},
      },
      plugins: [],
      // 未使用CSSの除去
      purge: {
        enabled: process.env.NODE_ENV === 'production',
        content: ['./src/**/*.{js,jsx,ts,tsx}'],
        options: {
          safelist: [
            // 動的に使用するクラスをここに追加
            'bg-primary-500',
            'text-primary-500',
          ],
        },
      },
    };
    ```

### SSRとハイドレーション最適化

React Router v7とViteを使用したSSR最適化：

```tsx
// entry-server.tsx
import React from 'react';
import { useMedia } from '@/hooks/useMedia';
import { Spot } from '@/types/models';

interface SpotHeaderProps {
  spot: Spot;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
}

export const SpotHeader: React.FC<SpotHeaderProps> = ({ 
  spot, 
  isFavorite,
  onFavoriteToggle 
}) => {
  const isMobile = useMedia('(max-width: 640px)');
  
  return (
    <div className="relative">
      {/* レスポンシブな画像サイズ */}
      <div className="aspect-video md:aspect-[16/9] lg:aspect-[2/1] overflow-hidden relative">
        <img 
          src={spot.thumbnail} 
          alt={spot.name}
          className="w-full h-full object-cover"
          loading="eager" // ヒーローイメージは優先的に読み込み
        />
      </div>
      
      <div className="container mx-auto px-4">
        <div className={`${isMobile ? 'block' : 'flex justify-between items-end'} -mt-16 relative z-10`}>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg mb-4 md:mb-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold truncate">{spot.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-primary-100 text-primary-800 text-sm px-2 py-1 rounded">
                {spot.category}
              </span>
              <span className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded">
                {spot.address.prefecture}
              </span>
            </div>
          </div>
          
          {/* モバイルでは下部に固定、デスクトップでは右側に配置 */}
          <div className={isMobile ? 'fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-up z-20' : 'ml-4'}>
            <button 
              onClick={onFavoriteToggle}
              className={`${isMobile ? 'w-full' : 'px-6'} py-2 rounded-full flex items-center justify-center gap-2 ${isFavorite ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              <HeartIcon filled={isFavorite} />
              <span>{isFavorite ? '保存済み' : '保存する'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// アイコンコンポーネント
const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill={filled ? 'currentColor' : 'none'} stroke="currentColor">
    <path d="M10 17.8l-1.45-1.32C4.2 12.36 1 9.44 1 5.95 1 3.07 3.07 1 5.95 1c1.41 0 2.77.66 3.66 1.66l.39.49.39-.49C11.28 1.66 12.64 1 14.05 1 16.93 1 19 3.07 19 5.95c0 3.49-3.2 6.41-7.55 10.53L10 17.8z" />
  </svg>
);
```

### モバイルパフォーマンスの最適化

```typescript
// src/components/common/TouchOptimized.tsx
import React, { useRef, useEffect } from 'react';

interface TouchOptimizedProps {
  children: React.ReactNode;
  onTap?: () => void;
  tapDelay?: number; // タップ検出の遅延（ミリ秒）
}

// タッチイベントを最適化し、300msの遅延をなくすコンポーネント
export const TouchOptimized: React.FC<TouchOptimizedProps> = ({ 
  children, 
  onTap, 
  tapDelay = 0 
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const touchStartTimeRef = useRef<number>(0);
  const touchStartPosRef = useRef<{x: number, y: number}>({x: 0, y: 0});
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !onTap) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartTimeRef.current = Date.now();
      touchStartPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      // タップとスクロールを区別
      const touchEndPos = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      };
      
      const distanceMoved = Math.sqrt(
        Math.pow(touchEndPos.x - touchStartPosRef.current.x, 2) +
        Math.pow(touchEndPos.y - touchStartPosRef.current.y, 2)
      );
      
      const touchDuration = Date.now() - touchStartTimeRef.current;
      
      // 短い時間でほとんど移動していない場合はタップと判定
      if (touchDuration < 300 && distanceMoved < 10) {
        e.preventDefault(); // クリックイベントの発火を防止
        
        if (tapDelay > 0) {
          setTimeout(onTap, tapDelay);
        } else {
          onTap();
        }
      }
    };
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onTap, tapDelay]);
  
  return (
    <div ref={elementRef} style={{ touchAction: 'manipulation' }}>
      {children}
    </div>
  );
};
```

### バッテリー消費の最適化

```typescript
// src/hooks/useEffectiveAnimation.ts
import { useState, useEffect } from 'react';

// バッテリー状態や電源状態に基づいてアニメーションを調整するフック
export function useEffectiveAnimation(defaultEnabled = true) {
  const [animationsEnabled, setAnimationsEnabled] = useState(defaultEnabled);
  
  useEffect(() => {
    // バッテリーAPI対応ブラウザの場合
    if ('getBattery' in navigator) {
      const handleBatteryChange = (battery: any) => {
        // バッテリーレベルが20%以下でバッテリー節約モードを有効化
        if (battery.level <= 0.2 && !battery.charging) {
          setAnimationsEnabled(false);
        } else {
          setAnimationsEnabled(defaultEnabled);
        }
      };
      
      // バッテリー状態の監視
      (navigator as any).getBattery().then((battery: any) => {
        handleBatteryChange(battery);
        
        battery.addEventListener('levelchange', () => handleBatteryChange(battery));
        battery.addEventListener('chargingchange', () => handleBatteryChange(battery));
        
        return () => {
          battery.removeEventListener('levelchange', () => handleBatteryChange(battery));
          battery.removeEventListener('chargingchange', () => handleBatteryChange(battery));
        };
      });
    }
    
    // プリファレンス対応ブラウザの場合
    if ('matchMedia' in window) {
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      if (reducedMotionQuery.matches) {
        setAnimationsEnabled(false);
      }
      
      const handleReducedMotionChange = (e: MediaQueryListEvent) => {
        setAnimationsEnabled(!e.matches);
      };
      
      reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
      
      return () => {
        reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      };
    }
  }, [defaultEnabled]);
  
  return animationsEnabled;
}
```

## パフォーマンスモニタリング

### クライアントサイドモニタリング

```typescript
// src/lib/performance.ts
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

// Web Vitals測定とレポート
export function reportWebVitals(onPerfEntry?: (metric: any) => void) {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    // Core Web Vitalsの測定
    getCLS(onPerfEntry);  // Cumulative Layout Shift
    getFID(onPerfEntry);  // First Input Delay
    getLCP(onPerfEntry);  // Largest Contentful Paint
    getFCP(onPerfEntry);  // First Contentful Paint
    getTTFB(onPerfEntry); // Time to First Byte
  }
}

// パフォーマンスデータ収集
export function collectPerformanceMetrics() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintTimings = performance.getEntriesByType('paint');
    
    // ナビゲーションタイミングメトリクス
    const metrics = {
      // ページロード全体の時間
      pageLoadTime: navigationTiming.loadEventEnd - navigationTiming.startTime,
      
      // サーバーレスポンス時間
      serverResponseTime: navigationTiming.responseStart - navigationTiming.requestStart,
      
      // ドキュメント読み込み時間
      documentLoadTime: navigationTiming.domComplete - navigationTiming.domInteractive,
      
      // First Paint
      firstPaint: 0,
      
      // First Contentful Paint
      firstContentfulPaint: 0,
    };
    
    // ペイントタイミングを取得
    paintTimings.forEach((timing) => {
      const paintTiming = timing as PerformancePaintTiming;
      if (paintTiming.name === 'first-paint') {
        metrics.firstPaint = paintTiming.startTime;
      } else if (paintTiming.name === 'first-contentful-paint') {
        metrics.firstContentfulPaint = paintTiming.startTime;
      }
    });
    
    return metrics;
  }
  
  return null;
}

// リソース読み込みのパフォーマンス分析
export function analyzeResourceLoadPerformance() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const resources = performance.getEntriesByType('resource');
    
    const resourcesByType: Record<string, PerformanceResourceTiming[]> = {};
    
    resources.forEach((resource) => {
      const resourceTiming = resource as PerformanceResourceTiming;
      const url = resourceTiming.name;
      const fileExtension = url.split('.').pop()?.split('?')[0] || 'unknown';
      
      if (!resourcesByType[fileExtension]) {
        resourcesByType[fileExtension] = [];
      }
      
      resourcesByType[fileExtension].push(resourceTiming);
    });
    
    // 各リソースタイプごとの統計情報を計算
    const statistics: Record<string, { count: number, totalSize: number, avgLoadTime: number }> = {};
    
    Object.entries(resourcesByType).forEach(([type, timings]) => {
      const count = timings.length;
      const totalSize = timings.reduce((sum, timing) => sum + (timing.transferSize || 0), 0);
      const totalLoadTime = timings.reduce((sum, timing) => sum + (timing.responseEnd - timing.startTime), 0);
      
      statistics[type] = {
        count,
        totalSize,
        avgLoadTime: count > 0 ? totalLoadTime / count : 0
      };
    });
    
    return statistics;
  }
  
  return null;
}
```

### サーバーサイドモニタリング

```typescript
// src/server/middleware/performance.ts
import { Context } from 'hono';

// サーバーサイドのパフォーマンス測定ミドルウェア
export function performanceMonitoring() {
  return async (c: Context, next: () => Promise<void>) => {
    const requestStartTime = Date.now();
    const url = c.req.url;
    const method = c.req.method;
    
    // レスポンスヘッダーにサーバー側のタイミング情報を追加
    await next();
    
    const processingTime = Date.now() - requestStartTime;
    
    // ヘッダーにサーバー処理時間を追加
    c.res.headers.append('Server-Timing', `total;dur=${processingTime}`);
    
    // パフォーマンスログの記録（本番では適切なロギングサービスに送信）
    if (processingTime > 1000) { // 1秒以上かかったリクエストを記録
      console.warn(`Slow request: ${method} ${url} took ${processingTime}ms`);
    }
    
    // 分析のためにパフォーマンスデータをKVに保存
    try {
      const performanceData = {
        timestamp: new Date().toISOString(),
        url,
        method,
        processingTime,
        // その他の有用な情報（リクエストサイズ、レスポンスサイズなど）
      };
      
      // 実際の環境ではKVやD1などに保存
      // await c.env.PERFORMANCE_KV.put(
      //   `perf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      //   JSON.stringify(performanceData),
      //   { expirationTtl: 60 * 60 * 24 * 7 } // 1週間保持
      // );
    } catch (error) {
      console.error('Performance data logging failed:', error);
    }
  };
}
```

## 継続的な最適化

### 自動パフォーマンス測定とアラート

```typescript
// src/server/tasks/performance-monitoring.ts
import { PerformanceMetric, ThresholdType } from '@/types/performance';

interface PerformanceThreshold {
  metric: string;
  warning: number;
  critical: number;
  type: ThresholdType; // 'lessThan' | 'greaterThan'
}

// パフォーマンスしきい値の設定
const performanceThresholds: PerformanceThreshold[] = [
  { metric: 'LCP', warning: 2500, critical: 4000, type: 'lessThan' },
  { metric: 'FID', warning: 100, critical: 300, type: 'lessThan' },
  { metric: 'CLS', warning: 0.1, critical: 0.25, type: 'lessThan' },
  { metric: 'TTFB', warning: 600, critical: 1000, type: 'lessThan' },
  { metric: 'apiResponseTime', warning: 200, critical: 500, type: 'lessThan' },
];

// パフォーマンスメトリクスの評価
export function evaluatePerformanceMetrics(metrics: PerformanceMetric[]) {
  const issues: {
    metric: string;
    value: number;
    threshold: number;
    severity: 'warning' | 'critical';
  }[] = [];
  
  metrics.forEach((metric) => {
    const threshold = performanceThresholds.find(t => t.metric === metric.name);
    
    if (!threshold) return;
    
    const isIssue = threshold.type === 'lessThan' 
      ? metric.value > threshold.warning 
      : metric.value < threshold.warning;
    
    const isCritical = threshold.type === 'lessThan' 
      ? metric.value > threshold.critical 
      : metric.value < threshold.critical;
    
    if (isIssue) {
      issues.push({
        metric: metric.name,
        value: metric.value,
        threshold: isCritical ? threshold.critical : threshold.warning,
        severity: isCritical ? 'critical' : 'warning'
      });
    }
  });
  
  return issues;
}

// パフォーマンスの問題に対するアラート
export async function alertOnPerformanceIssues(issues: any[]) {
  if (issues.length === 0) return;
  
  const criticalIssues = issues.filter(issue => issue.severity === 'critical');
  
  // 深刻な問題がある場合は即時通知
  if (criticalIssues.length > 0) {
    await notifyTeam({
      title: `🚨 重大なパフォーマンス問題が検出されました`,
      message: `${criticalIssues.length}件の重大なパフォーマンス問題が発生しています。`,
      issues: criticalIssues,
      severity: 'critical'
    });
  } 
  // 警告レベルの問題は集約して通知
  else if (issues.length > 0) {
    await notifyTeam({
      title: `⚠️ パフォーマンス警告`,
      message: `${issues.length}件のパフォーマンス警告が検出されました。`,
      issues,
      severity: 'warning'
    });
  }
}

// チームへの通知処理（実際の実装は環境によって異なる）
async function notifyTeam(notification: any) {
  // 実際のアラート処理（Slackや電子メールなど）
  console.log('Performance Alert:', notification);
  
  // 例: Slack通知
  // await fetch(process.env.SLACK_WEBHOOK_URL, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     text: notification.title,
  //     blocks: [
  //       {
  //         type: 'section',
  //         text: { type: 'mrkdwn', text: notification.message }
  //       },
  //       {
  //         type: 'section',
  //         text: {
  //           type: 'mrkdwn',
  //           text: notification.issues.map(issue => 
  //             `• *${issue.metric}*: ${issue.value}ms (閾値: ${issue.threshold}ms)`
  //           ).join('\n')
  //         }
  //       }
  //     ]
  //   })
  // });
}
```

### パフォーマンスレポートとダッシュボード

```typescript
// src/server/routes/admin/performance.ts
import { Router } from 'express';
import { getPerformanceData, generatePerformanceReport } from '../../services/performanceService';
import { isAdmin } from '../../middleware/auth';

const router = Router();

// 管理者向けパフォーマンスダッシュボード
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const performanceData = await getPerformanceData({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined
    });
    
    res.json({ data: performanceData });
  } catch (error) {
    console.error('Failed to fetch performance data:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

// パフォーマンスレポートの生成
router.post('/report', isAdmin, async (req, res) => {
  try {
    const { startDate, endDate, metrics } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: '期間を指定してください' });
    }
    
    const report = await generatePerformanceReport({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      metrics: metrics || ['LCP', 'FID', 'CLS', 'TTFB', 'apiResponseTime']
    });
    
    res.json({ report });
  } catch (error) {
    console.error('Failed to generate performance report:', error);
    res.status(500).json({ error: 'Failed to generate performance report' });
  }
});

export default router;
```

### コンポーネントベースのパフォーマンス測定

```tsx
// src/components/common/PerformanceTracker.tsx
import React, { useEffect } from 'react';

interface PerformanceTrackerProps {
  componentName: string;
  children: React.ReactNode;
  onRenderComplete?: (duration: number) => void;
}

export const PerformanceTracker: React.FC<PerformanceTrackerProps> = ({ 
  componentName, 
  children,
  onRenderComplete 
}) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // レンダリング時間を記録
      console.debug(`Component '${componentName}' rendered in ${duration.toFixed(2)}ms`);
      
      // 必要に応じて分析サービスに送信
      if (onRenderComplete) {
        onRenderComplete(duration);
      }
      
      // パフォーマンスエントリを作成（開発・デバッグ用）
      if (process.env.NODE_ENV === 'development') {
        performance.mark(`${componentName}-end`);
        try {
          performance.measure(
            `${componentName}-render`,
            `${componentName}-start`,
            `${componentName}-end`
          );
        } catch (e) {
          // マークが見つからない場合に例外が発生するため捕捉
          console.debug(`Could not measure performance for ${componentName}`);
        }
      }
    };
  }, [componentName, onRenderComplete]);
  
  useEffect(() => {
    // コンポーネントのレンダリング開始をマーク
    if (process.env.NODE_ENV === 'development') {
      performance.mark(`${componentName}-start`);
    }
  }, [componentName]);
  
  return <>{children}</>;
};
```

## まとめ

このパフォーマンス最適化ガイドでは、マチポケアプリケーションのさまざまな側面でのパフォーマンス向上策を紹介しました。これらの最適化を適用することで、ユーザーエクスペリエンスの向上とリソース使用の効率化を実現できます。

重要なポイント：

1. **測定が最適化の第一歩** - 実際のパフォーマンスを測定し、ボトルネックを特定することが重要です。

2. **段階的な最適化** - すべての最適化を一度に適用するのではなく、測定結果に基づいて優先順位をつけて段階的に実装しましょう。

3. **ユーザー体験を優先** - 技術的なメトリクスだけでなく、実際のユーザー体験を優先して最適化を行います。

4. **継続的なモニタリング** - パフォーマンスは継続的に監視し、新機能の追加や変更によるパフォーマンスへの影響をチェックします。

5. **適切なトレードオフ** - 機能の豊富さとパフォーマンスのバランスを取り、適切なトレードオフを検討しましょう。

このガイドを参考に、マチポケアプリケーションのパフォーマンスを継続的に改善し、ユーザーに優れた体験を提供してください。
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router/server';
import { App } from './App';

export function render(url: string, context: any) {
  return ReactDOMServer.renderToString(
    <StaticRouter location={url} context={context}>
      <App />
    </StaticRouter>
  );
}
```

```tsx
// entry-client.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';

ReactDOM.hydrateRoot(
  document.getElementById('app')!,
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

### 選択的ハイドレーション

大規模なページではReact 18の選択的ハイドレーションを活用して、インタラクティビティを最適化します：

```jsx
import { Suspense } from 'react';

function HomePage() {
  return (
    <div>
      <Header />
      <Suspense fallback={<MapPlaceholder />}>
        <MapComponent priority="high" />
      </Suspense>
      <Suspense fallback={<SpotListSkeleton />}>
        <PopularSpots />
      </Suspense>
      <Footer />
    </div>
  );
}
```

### プリロードとプリフェッチ

遷移の高速化のためにプリロードとプリフェッチを実装します：

```jsx
import { useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router';

function NavLink({ to, children, prefetch = false }) {
  const prefetchLink = useCallback(() => {
    // リンク先のリソースをプリフェッチ
    const prefetcher = document.createElement('link');
    prefetcher.rel = 'prefetch';
    prefetcher.href = to;
    document.head.appendChild(prefetcher);
  }, [to]);

  return (
    <Link 
      to={to} 
      onMouseEnter={prefetch ? prefetchLink : undefined}
      onFocus={prefetch ? prefetchLink : undefined}
    >
      {children}
    </Link>
  );
}