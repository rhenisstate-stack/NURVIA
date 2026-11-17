'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { usePanelTheme } from '@/lib/contexts/panel/layout/theme/PanelThemeContext';

export const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = usePanelTheme();
  const isDark = theme.global === 'dark';

  return (
    <button
      type="button"
      onClick={() => toggleTheme('global')}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#142B4A] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};
