import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
});

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolve(theme: Theme): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('APP_THEME') as Theme) || 'system';
  });
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolve(
    (localStorage.getItem('APP_THEME') as Theme) || 'system'
  ));

  // Apply on mount and whenever theme changes
  useEffect(() => {
    const resolved = resolve(theme);
    setResolvedTheme(resolved);
    applyTheme(resolved);

    // Tell Electron's nativeTheme (best-effort, no crash if not in Electron)
    try {
      (window as any).ipcRenderer?.invoke('set-native-theme', theme);
    } catch (_) {}
  }, [theme]);

  // Listen for system theme changes when in "system" mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  // Also listen for Electron nativeTheme changes
  useEffect(() => {
    const handler = (_: any, value: ResolvedTheme) => {
      if (theme === 'system') {
        setResolvedTheme(value);
        applyTheme(value);
      }
    };
    try {
      (window as any).ipcRenderer?.on('native-theme-changed', handler);
    } catch (_) {}
    return () => {
      try {
        (window as any).ipcRenderer?.off('native-theme-changed', handler);
      } catch (_) {}
    };
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem('APP_THEME', t);
    setThemeState(t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
