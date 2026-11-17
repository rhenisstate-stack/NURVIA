'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type ExamThemeTarget =
  | 'global'
  | 'upperNavbar'
  | 'lowerNavbar'
  | 'nonStickyNavbar'
  | 'content'
  | 'footer'
  | 'leftSidebar'
  | 'rightSidebar';

export type ExamThemeValue = 'default' | 'light' | 'dark' | 'custom' | 'system';

export type ExamCustomColors = {
  upperNavbar: string;
  lowerNavbar: string;
  nonStickyNavbar: string;
  content: string;
  footer: string;
  leftSidebar: string;
  rightSidebar: string;
  upperNavText: string;
  lowerNavText: string;
  nonStickyNavText: string;
  contentText: string;
  footerText: string;
  leftSidebarText: string;
  rightSidebarText: string;
};

export const DEFAULT_EXAM_COLORS: ExamCustomColors = {
  upperNavbar: '#142B4A',
  lowerNavbar: '#F8FAFC',
  nonStickyNavbar: '#F8FAFC',
  content: '#FFFFFF',
  footer: '#F1F5F9',
  leftSidebar: '#F8FAFC',
  rightSidebar: '#F8FAFC',
  upperNavText: '#FFFFFF',
  lowerNavText: '#334155',
  nonStickyNavText: '#334155',
  contentText: '#0F172A',
  footerText: '#475569',
  leftSidebarText: '#334155',
  rightSidebarText: '#334155',
};

interface ExamThemeContextType {
  theme: Record<ExamThemeTarget, ExamThemeValue>;
  customColors: ExamCustomColors;
  setTheme: (target: ExamThemeTarget, value: ExamThemeValue) => void;
  setCustomColors: (colors: Partial<ExamCustomColors>) => void;
  resetCustomColors: () => void;
}

const defaultTheme: Record<ExamThemeTarget, ExamThemeValue> = {
  global: 'default',
  upperNavbar: 'default',
  lowerNavbar: 'default',
  nonStickyNavbar: 'default',
  content: 'default',
  footer: 'default',
  leftSidebar: 'default',
  rightSidebar: 'default',
};

const ExamThemeContext = createContext<ExamThemeContextType | undefined>(undefined);

export const ExamThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Record<ExamThemeTarget, ExamThemeValue>>(defaultTheme);
  const [customColors, setCustomColorsState] = useState<ExamCustomColors>(DEFAULT_EXAM_COLORS);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('nurviaExamTheme');
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme);
        if (parsed && typeof parsed === 'object') {
          setThemeState({ ...defaultTheme, ...parsed });
        }
      }
      const savedColors = localStorage.getItem('nurviaExamColors');
      if (savedColors) {
        const parsed = JSON.parse(savedColors);
        if (parsed && typeof parsed === 'object') {
          setCustomColorsState({ ...DEFAULT_EXAM_COLORS, ...parsed });
        }
      }
    } catch {
      // Ignore malformed storage
    }
  }, []);

  const setTheme = (target: ExamThemeTarget, value: ExamThemeValue) => {
    setThemeState((prev) => {
      const next =
        target === 'global'
          ? {
              global: value,
              upperNavbar: value,
              lowerNavbar: value,
              nonStickyNavbar: value,
              content: value,
              footer: value,
              leftSidebar: value,
              rightSidebar: value,
            }
          : { ...prev, [target]: value };
      localStorage.setItem('nurviaExamTheme', JSON.stringify(next));
      return next;
    });
  };

  const setCustomColors = (colors: Partial<ExamCustomColors>) => {
    setCustomColorsState((prev) => {
      const next = { ...prev, ...colors };
      localStorage.setItem('nurviaExamColors', JSON.stringify(next));
      return next;
    });
  };

  const resetCustomColors = () => {
    setCustomColorsState(DEFAULT_EXAM_COLORS);
    localStorage.removeItem('nurviaExamColors');
  };

  return (
    <ExamThemeContext.Provider
      value={{ theme, customColors, setTheme, setCustomColors, resetCustomColors }}
    >
      {children}
    </ExamThemeContext.Provider>
  );
};

export const useExamTheme = () => {
  const ctx = useContext(ExamThemeContext);
  if (!ctx) throw new Error('useExamTheme must be used within ExamThemeProvider');
  return ctx;
};
