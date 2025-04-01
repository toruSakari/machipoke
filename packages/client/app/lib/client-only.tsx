import React from 'react';

// サーバーかクライアントかを判定するユーティリティ
export const isClient = typeof window !== 'undefined';

// クライアントサイドでのみレンダリングするためのユーティリティ
export function ClientOnly({
  children,
  fallback = (
    <div className="p-8 flex justify-center items-center">
      <p>Loading...</p>
    </div>
  ),
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  console.log(isClient);
  // サーバーサイドでは常にフォールバックを返す
  if (!isClient) {
    return <>{fallback}</>;
  }

  // クライアントサイドでは子要素を返す
  return <>{children}</>;
}

// 特定のコンポーネントをクライアントサイドのみに制限するHOC
export function withClientOnly<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithClientOnly(props: P) {
    return (
      <ClientOnly fallback={fallback}>
        <Component {...props} />
      </ClientOnly>
    );
  };
}

/**
 * useEffectを安全に使用するためのラッパー
 * サーバーでは何もせず、クライアントでのみ実行される
 */
export function useClientEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
  // クライアントサイドでのみReactのuseEffectをインポートして使用
  if (isClient) {
    // 動的インポート
    const { useEffect } = React;
    useEffect(effect, deps);
  }
  // サーバーサイドでは何もしない
  return;
}

/**
 * useStateを安全に使用するためのラッパー
 * サーバーでは初期値を返し、クライアントでのみ状態管理を行う
 */
export function useClientState<T>(
  initialState: T | (() => T)
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // サーバーサイドではダミーのステート関数を返す
  if (!isClient) {
    const initialValue =
      typeof initialState === 'function' ? (initialState as () => T)() : initialState;

    // ダミーのセット関数
    const setDummy = () => initialValue;
    return [initialValue, setDummy];
  }

  // クライアントサイドでは通常のuseStateを使用
  const { useState } = React;
  return useState(initialState);
}
