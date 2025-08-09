import { Moon, Sun } from 'lucide-react';

import { Button } from '@esk/ui/components/button';

import { themes, useTheme } from '@/providers/theme-provider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const nextTheme =
      themes[(themes.indexOf(theme) + 1) % themes.length] ?? 'light';
    setTheme(nextTheme);
  };

  return (
    <Button onClick={toggleTheme} variant="ghost" size="icon">
      {theme === 'light' && <Sun className="size-[1.2rem]" />}
      {theme === 'dark' && <Moon className="size-[1.2rem]" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
