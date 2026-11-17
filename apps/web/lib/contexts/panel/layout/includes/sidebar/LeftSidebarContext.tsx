"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type SidebarState = "opened" | "collapsed" | "closed";

interface LeftSidebarContextProps {
  isMobile: boolean;
  isMobileOpen: boolean;
  state: SidebarState;
  isOpened: boolean;
  isOpen: boolean;
  isCollapsed: boolean;
  isClosed: boolean;
  open: () => void;
  collapse: () => void;
  close: () => void;
  toggle: () => void;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
}

const LeftSidebarContext = createContext<LeftSidebarContextProps | null>(null);

export const LeftSidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<SidebarState>("opened");
  const [isMobile, setIsMobile] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("leftSidebarState") as SidebarState;
    if (saved === "opened" || saved === "collapsed" || saved === "closed") {
      setState(saved);
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    // don't let phone state overwrite the saved desktop state
    if (window.matchMedia("(max-width: 767px)").matches) return;
    localStorage.setItem("leftSidebarState", state);
  }, [state]);

  // Phone: always start closed, never collapsed
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      setIsMobile(mq.matches);
      if (mq.matches) setState("closed");
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const open = () => setState("opened");
  const collapse = () => setState("collapsed");
  const close = () => setState("closed");

  // 3-step toggle: opened → collapsed → closed → opened
  const toggle = () => {
    setState(prev => {
      if (isMobile) return prev === "opened" ? "closed" : "opened";
      if (prev === "opened") return "collapsed";
      if (prev === "collapsed") return "closed";
      return "opened"; // closed
    });
  };

  return (
    <LeftSidebarContext.Provider
      value={{
        isMobile,
        isMobileOpen: isMobile && state === "opened",
        state,
        isOpened: state === "opened",
        isOpen: state === "opened",
        isCollapsed: state === "collapsed",
        isClosed: state === "closed",
        open,
        collapse,
        close,
        toggle,
        toggleSidebar: toggle,
        toggleMobileSidebar: toggle,
      }}
    >
      {children}
    </LeftSidebarContext.Provider>
  );
};

export const useLeftSidebar = () => {
  const context = useContext(LeftSidebarContext);
  if (!context) throw new Error("useLeftSidebar must be used inside LeftSidebarProvider");
  return context;
};
