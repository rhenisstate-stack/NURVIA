'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type ThemeTarget = 'global' | 'navbar' | 'leftSidebar' | 'rightSidebar' | 'content' | 'footer';
export type ThemeValue = 'default' | 'light' | 'dark' | 'custom' | 'system';

export type CustomColors = {
  navbar: string;
  leftSidebar: string;
  rightSidebar: string;
  content: string;
  footer: string;
  text: string;
};

export const DEFAULT_THEME_COLORS: CustomColors = {
  navbar: '#142B4A',
  leftSidebar: '#F8FAFC',
  rightSidebar: '#F8FAFC',
  content: '#FFFFFF',
  footer: '#F1F5F9',
  text: '#0F172A',
};

export const USER_CUSTOM_COLORS_KEY = 'nurviaPanelCustomColors';

interface ThemeContextType {
  theme: Record<ThemeTarget, ThemeValue>;
  customColors: CustomColors | null;
  setTheme: (target: ThemeTarget, value: ThemeValue) => void;
  setCustomColors: (colors: Partial<CustomColors>) => void;
  resetCustomColors: () => void;
  toggleTheme: (target: ThemeTarget) => void;
}

const defaultTheme: Record<ThemeTarget, ThemeValue> = {
  global: 'default',
  navbar: 'default',
  leftSidebar: 'default',
  rightSidebar: 'default',
  content: 'default',
  footer: 'default',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const PanelThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Record<ThemeTarget, ThemeValue>>(defaultTheme);
  const [customColors, setCustomColorsState] = useState<CustomColors | null>(null);

  useEffect(() => {
    const safeParse = <T,>(raw: string | null): T | null => {
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? (parsed as T) : null;
      } catch {
        return null;
      }
    };

    const storedTheme = safeParse<Partial<Record<ThemeTarget, ThemeValue>>>(
      localStorage.getItem('nurviaPanelTheme')
    );
    if (storedTheme) {
      setThemeState({ ...defaultTheme, ...storedTheme });
    }

    const storedColors = safeParse<Partial<CustomColors>>(
      localStorage.getItem(USER_CUSTOM_COLORS_KEY)
    );
    if (storedColors) {
      setCustomColorsState({ ...DEFAULT_THEME_COLORS, ...storedColors });
    }
  }, []);

  const setTheme = (target: ThemeTarget, value: ThemeValue) => {
    setThemeState((prev) => {
      const next =
        target === 'global'
          ? { global: value, navbar: value, leftSidebar: value, rightSidebar: value, content: value, footer: value }
          : { ...prev, [target]: value };
      localStorage.setItem('nurviaPanelTheme', JSON.stringify(next));
      return next;
    });
  };

  const setCustomColors = (colors: Partial<CustomColors>) => {
    setCustomColorsState((prev) => {
      const next = { ...(prev ?? DEFAULT_THEME_COLORS), ...colors };
      localStorage.setItem(USER_CUSTOM_COLORS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetCustomColors = () => {
    setCustomColorsState(null);
    localStorage.removeItem(USER_CUSTOM_COLORS_KEY);
  };

  const toggleTheme = (target: ThemeTarget) => {
    const current = theme[target];
    setTheme(target, current === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider
      value={{ theme, customColors, setTheme, setCustomColors, resetCustomColors, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const usePanelTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('usePanelTheme must be used within PanelThemeProvider');
  return ctx;
};
