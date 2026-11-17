'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type PanelFontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';

interface FontSizeContextType {
  fontSize: PanelFontSize;
  setFontSize: (size: PanelFontSize) => void;
}

const FONT_SIZE_SCALE: Record<PanelFontSize, string> = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
};

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export const PanelFontSizeProvider = ({ children }: { children: ReactNode }) => {
  const [fontSize, setFontSizeState] = useState<PanelFontSize>('base');

  useEffect(() => {
    const saved = localStorage.getItem('nurviaPanelFontSize') as PanelFontSize | null;
    if (saved && saved in FONT_SIZE_SCALE) {
      setFontSizeState(saved);
    }
  }, []);

  const setFontSize = (size: PanelFontSize) => {
    setFontSizeState(size);
    localStorage.setItem('nurviaPanelFontSize', size);
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      <div style={{ fontSize: FONT_SIZE_SCALE[fontSize] }}>{children}</div>
    </FontSizeContext.Provider>
  );
};

export const usePanelFontSize = () => {
  const ctx = useContext(FontSizeContext);
  if (!ctx) throw new Error('usePanelFontSize must be used within PanelFontSizeProvider');
  return ctx;
};
