"use client";

import { useEffect, useState } from "react";
import { useThemeContext } from "@/lib/contexts/panel/layout/theme/PanelThemeContext";
import { useLeftSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext";
import { useRightSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/RightSidebarContext";

type SidebarState = {
  isOpened: boolean;
  isCollapsed: boolean;
  isClosed: boolean;
};

export function useFlexPageClasp() {
  const { theme } = useThemeContext();
  const leftSidebar = useLeftSidebar();
  const rightSidebar = useRightSidebar();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  /* --------------------------------------------
   Theme Resolution
  --------------------------------------------- */
  const effectiveContentTheme =
    theme.content === "system" ? theme.global : theme.content;

  const isLightContent = effectiveContentTheme === "light";

  /* --------------------------------------------
   Sidebar Width Calculation
  --------------------------------------------- */
  const getSidebarWidth = (sidebar: SidebarState) => {
    if (!isClient) return 0;
    if (leftSidebar.isMobile) return 0; // phone: sidebars overlay, never push content
    if (sidebar.isClosed) return 0;
    if (sidebar.isOpened) return 256;
    return 80;
  };

  const leftWidth = getSidebarWidth(leftSidebar);
  const rightWidth = getSidebarWidth(rightSidebar);

  /* --------------------------------------------
   Layout Metrics
  --------------------------------------------- */
  const navHeight = 64;


  return {
    isClient,
    isLightContent,
    effectiveContentTheme,

    leftWidth,
    rightWidth,
    navHeight,
  };
}
