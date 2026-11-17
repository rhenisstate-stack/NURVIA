'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type ExamFontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';

const SCALE: Record<ExamFontSize, string> = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
};

interface ExamFontSizeContextType {
  fontSize: ExamFontSize;
  setFontSize: (size: ExamFontSize) => void;
}

const ExamFontSizeContext = createContext<ExamFontSizeContextType | undefined>(undefined);

export const ExamFontSizeProvider = ({ children }: { children: ReactNode }) => {
  const [fontSize, setFontSizeState] = useState<ExamFontSize>('base');

  useEffect(() => {
    const saved = localStorage.getItem('nurviaExamFontSize') as ExamFontSize | null;
    if (saved && saved in SCALE) {
      setFontSizeState(saved);
    }
  }, []);

  const setFontSize = (size: ExamFontSize) => {
    setFontSizeState(size);
    localStorage.setItem('nurviaExamFontSize', size);
  };

  return (
    <ExamFontSizeContext.Provider value={{ fontSize, setFontSize }}>
      <div style={{ fontSize: SCALE[fontSize] }}>{children}</div>
    </ExamFontSizeContext.Provider>
  );
};

export const useExamFontSize = () => {
  const ctx = useContext(ExamFontSizeContext);
  if (!ctx) throw new Error('useExamFontSize must be used within ExamFontSizeProvider');
  return ctx;
};
