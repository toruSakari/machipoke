import { createContext, useContext, ReactNode } from 'react';
import { isClient, useClientEffect, useClientState } from '@/lib/client-only';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  serverMode?: boolean; // SSRモード用のフラグ
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  serverMode = false,
}: ThemeProviderProps) {
  // サーバーサイドでは常にdefaultThemeを使用
  const initialTheme = (): Theme => {
    if (!isClient || serverMode) {
      return defaultTheme;
    }

    const savedTheme = localStorage.getItem('theme') as Theme | null;
    return savedTheme || defaultTheme;
  };

  // クライアントセーフな状態管理
  const [theme, setTheme] = useClientState<Theme>(initialTheme);
  const [isDarkMode, setIsDarkMode] = useClientState<boolean>(
    defaultTheme === 'dark' || (defaultTheme === 'system' && false)
  );

  // テーマが変更されたらローカルストレージに保存 (クライアントのみ)
  useClientEffect(() => {
    if (!serverMode) {
      localStorage.setItem('theme', theme);
    }
  }, [theme, serverMode]);

  // システムテーマの検出と変更を監視 (クライアントのみ)
  useClientEffect(() => {
    if (serverMode) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateIsDarkMode = () => {
      if (theme === 'system') {
        setIsDarkMode(mediaQuery.matches);
      } else {
        setIsDarkMode(theme === 'dark');
      }
    };

    updateIsDarkMode();

    // システムテーマの変更を監視
    mediaQuery.addEventListener('change', updateIsDarkMode);

    return () => {
      mediaQuery.removeEventListener('change', updateIsDarkMode);
    };
  }, [theme, serverMode, setIsDarkMode]);

  // ダークモードクラスの適用 (クライアントのみ)
  useClientEffect(() => {
    if (serverMode) return;

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, serverMode]);

  const value = {
    theme,
    setTheme,
    isDarkMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
