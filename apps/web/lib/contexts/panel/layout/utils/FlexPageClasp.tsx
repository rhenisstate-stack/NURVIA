'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface FlexPageClaspContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  setCollapsed: (val: boolean) => void;
}

const FlexPageClaspContext = createContext<FlexPageClaspContextType | undefined>(undefined);

export const FlexPageClaspProvider = ({ children }: { children: ReactNode }) => {
  const [isCollapsed, setCollapsed] = useState(false);
  const toggleCollapse = () => setCollapsed((prev) => !prev);

  return (
    <FlexPageClaspContext.Provider value={{ isCollapsed, toggleCollapse, setCollapsed }}>
      {children}
    </FlexPageClaspContext.Provider>
  );
};

export const useFlexPageClasp = () => {
  const ctx = useContext(FlexPageClaspContext);
  if (!ctx) throw new Error('useFlexPageClasp must be used within FlexPageClaspProvider');
  return ctx;
};
