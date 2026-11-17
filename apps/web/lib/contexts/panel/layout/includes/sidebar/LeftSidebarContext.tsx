'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface LeftSidebarContextType {
  isLeftOpen: boolean;
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  toggleLeftSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
  openLeftSidebar: () => void;
  closeLeftSidebar: () => void;
}

const LeftSidebarContext = createContext<LeftSidebarContextType | undefined>(undefined);

export const LeftSidebarProvider = ({ children }: { children: ReactNode }) => {
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

  const toggleLeftSidebar = () => setIsExpanded((prev) => !prev);
  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);
  const toggleSubmenu = (item: string) => setOpenSubmenu((prev) => (prev === item ? null : item));
  const openLeftSidebar = () => (isMobile ? setIsMobileOpen(true) : setIsExpanded(true));
  const closeLeftSidebar = () => (isMobile ? setIsMobileOpen(false) : setIsExpanded(false));

  return (
    <LeftSidebarContext.Provider
      value={{
        isLeftOpen: isMobile ? isMobileOpen : isExpanded,
        isExpanded: isMobile ? false : isExpanded,
        isMobileOpen,
        isHovered,
        activeItem,
        openSubmenu,
        toggleLeftSidebar,
        toggleMobileSidebar,
        setIsHovered,
        setActiveItem,
        toggleSubmenu,
        openLeftSidebar,
        closeLeftSidebar,
      }}
    >
      {children}
    </LeftSidebarContext.Provider>
  );
};

export const useLeftSidebar = () => {
  const context = useContext(LeftSidebarContext);
  if (!context) {
    throw new Error('useLeftSidebar must be used within LeftSidebarProvider');
  }
  return context;
};
