'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface RightSidebarContextType {
  isRightOpen: boolean;
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  toggleRightSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
  openRightSidebar: () => void;
  closeRightSidebar: () => void;
}

const RightSidebarContext = createContext<RightSidebarContextType | undefined>(undefined);

export const RightSidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleRightSidebar = () => setIsExpanded((prev) => !prev);
  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);
  const toggleSubmenu = (item: string) => setOpenSubmenu((prev) => (prev === item ? null : item));
  const openRightSidebar = () => (isMobile ? setIsMobileOpen(true) : setIsExpanded(true));
  const closeRightSidebar = () => (isMobile ? setIsMobileOpen(false) : setIsExpanded(false));

  return (
    <RightSidebarContext.Provider
      value={{
        isRightOpen: isMobile ? isMobileOpen : isExpanded,
        isExpanded: isMobile ? false : isExpanded,
        isMobileOpen,
        isHovered,
        activeItem,
        openSubmenu,
        toggleRightSidebar,
        toggleMobileSidebar,
        setIsHovered,
        setActiveItem,
        toggleSubmenu,
        openRightSidebar,
        closeRightSidebar,
      }}
    >
      {children}
    </RightSidebarContext.Provider>
  );
};

export const useRightSidebar = () => {
  const context = useContext(RightSidebarContext);
  if (!context) {
    throw new Error('useRightSidebar must be used within RightSidebarProvider');
  }
  return context;
};
