import { useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getCookie, setCookie } from '@tanstack/react-start/server';
import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
export const themes: Array<Theme> = ['light', 'dark'];

const storageKey = 'esk-ui-theme';

type ThemeProviderProps = {
  children: React.ReactNode;
  theme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'dark',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  theme = 'dark',
  ...props
}: ThemeProviderProps) {
  const router = useRouter();
  const [currentTheme, setCurrentTheme] = useState<Theme>(theme);

  // Update local state when prop changes
  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.className = currentTheme;
  }, [currentTheme]);

  const setTheme = async (newTheme: Theme) => {
    // Optimistically update local state
    setCurrentTheme(newTheme);

    // Set theme on server
    try {
      await setThemeServerFn({ data: newTheme });
      router.invalidate();
    } catch {
      // Theme failed to set on server, we could revert optimistic update
      // setCurrentTheme(theme);
    }
  };

  const value = {
    theme: currentTheme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};

export const getThemeServerFn = createServerFn().handler(async () => {
  return (getCookie(storageKey) || 'light') as Theme;
});

export const setThemeServerFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (typeof data != 'string' || (data != 'dark' && data != 'light')) {
      throw new Error('Invalid theme provided');
    }
    return data as Theme;
  })
  .handler(async ({ data }) => {
    setCookie(storageKey, data);
  });
