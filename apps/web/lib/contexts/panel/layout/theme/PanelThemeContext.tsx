"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type ThemeTarget = "global" | "navbar" | "leftSidebar" | "rightSidebar" | "content" | "footer";
export type ThemeValue = "default" | "light" | "dark" | "custom" | "system";

// Add leftSidebar and rightSidebar to the type
export type CustomColors = {
  navbar: string;
  leftSidebar: string;
  rightSidebar: string;
  content: string;
  footer: string;
  text: string; // Added text color
};

// Default Dashboard Colors
export const DEFAULT_THEME_COLORS: CustomColors = {
  navbar: "#c7fff2",
  leftSidebar: "#cee4ff",
  rightSidebar: "#e2dbff",
  content: "#fffce6",
  footer: "#ffecad",
  text: "#000000",
};

export const USER_CUSTOM_COLORS_KEY = "userCustomColors";

interface ThemeContextType {
  theme: Record<ThemeTarget, ThemeValue>;
customColors: CustomColors | null;
  setTheme: (target: ThemeTarget, value: ThemeValue) => void;
  setCustomColors: (colors: Partial<CustomColors>) => void;
  resetCustomColors: () => void;
  toggleTheme: (target: ThemeTarget) => void;
}

const defaultTheme: Record<ThemeTarget, ThemeValue> = {
  global: "default",
  navbar: "default",
  leftSidebar: "default",
  rightSidebar: "default",
  content: "default",
  footer: "default",
};


const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Record<ThemeTarget, ThemeValue>>(defaultTheme);
const [customColors, setCustomColorsState] =
  useState<CustomColors | null>(null);

  
  const effectiveColors: CustomColors =
  customColors ?? DEFAULT_THEME_COLORS;

  // Load persisted settings
  useEffect(() => {
    // Safely parse a stored JSON value, ignoring corrupted / legacy values
    // (e.g. a raw string like "light" written by an older version).
    const safeParse = <T,>(raw: string | null): T | null => {
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? (parsed as T) : null;
      } catch {
        return null;
      }
    };

    const storedTheme = safeParse<Partial<Record<ThemeTarget, ThemeValue>>>(
      localStorage.getItem("theme")
    );
    const storedUserColors = safeParse<Partial<CustomColors>>(
      localStorage.getItem(USER_CUSTOM_COLORS_KEY)
    );

    if (storedTheme) {
      // Merge so missing keys fall back to defaults; ignore invalid values
      const merged = { ...defaultTheme };
      (Object.keys(merged) as ThemeTarget[]).forEach((key) => {
        const value = storedTheme[key];
        if (typeof value === "string") merged[key] = value as ThemeValue;
      });
      setThemeState(merged);
    }

    if (storedUserColors) {
      setCustomColorsState({ ...DEFAULT_THEME_COLORS, ...storedUserColors });
    }
  }, []);


  const getSystemTheme = (): ThemeValue => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  };

  // Save and apply theme
  useEffect(() => {
    const root = document.documentElement;
const effectiveTheme =
  theme.global === "system"
    ? getSystemTheme()
    : theme.global === "default"
      ? "light"
      : theme.global;

    // Apply global theme classes
    root.classList.remove("light", "dark");
    root.classList.add(effectiveTheme);
    document.body.dataset.theme = effectiveTheme;

    // Define proper fallback light/dark colors for all components
    const lightColors: Record<keyof CustomColors, string> = {
      navbar: "#ffffff",
      leftSidebar: "#f8fafc",
      rightSidebar: "#f1f5f9",
      content: "#ffffff",
      footer: "#f1f5f9",
      text: "#000000",
    };

    const darkColors: Record<keyof CustomColors, string> = {
      navbar: "#1e293b",
      leftSidebar: "#0f172a",
      rightSidebar: "#1e293b",
      content: "#1e293b",
      footer: "#0f172a",
      text: "#ffffff",
    };

    // Apply component-specific background and text colors
    const components: (keyof CustomColors)[] = ["navbar", "leftSidebar", "rightSidebar", "content", "footer"];
    for (const key of components) {
const componentTheme =
  theme.global === "default"
    ? "default"
    : theme[key as ThemeTarget] === "system"
      ? effectiveTheme
      : theme[key as ThemeTarget];

      if (componentTheme === "default") {
        root.style.setProperty(`--${key}-bg`, DEFAULT_THEME_COLORS[key]);
      } else if (componentTheme === "custom") {
      root.style.setProperty(`--${key}-bg`, effectiveColors[key]);
      } else if (componentTheme === "light") {
        root.style.setProperty(`--${key}-bg`, lightColors[key]);
      } else if (componentTheme === "dark") {
        root.style.setProperty(`--${key}-bg`, darkColors[key]);
      }

    }

    
    // Apply global text color
    root.style.setProperty(
  "--text-color",
  theme.global === "custom"
    ? effectiveColors.text
    : theme.global === "default"
      ? DEFAULT_THEME_COLORS.text
      : theme.global === "dark"
        ? "#ffffff"
        : "#000000"
);


    // Save to localStorage
    localStorage.setItem("theme", JSON.stringify(theme));
}, [theme, customColors, effectiveColors]);

  const setTheme = (target: ThemeTarget, value: ThemeValue) => {
    setThemeState((prev) => ({ ...prev, [target]: value }));
  };

  const setCustomColors = (colors: Partial<CustomColors>) => {
  setCustomColorsState((prev) => {
    const updated = { ...(prev ?? DEFAULT_THEME_COLORS), ...colors };
    localStorage.setItem(USER_CUSTOM_COLORS_KEY, JSON.stringify(updated));
    return updated;
  });
};


const resetCustomColors = () => {
  localStorage.removeItem(USER_CUSTOM_COLORS_KEY);
  setCustomColorsState(null);
};


  const toggleTheme = (target: ThemeTarget) => {
    const current = theme[target];
    const next = current === "dark" ? "light" : current === "light" ? "dark" : getSystemTheme();
    setTheme(target, next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        customColors,
        setTheme,
        setCustomColors,
        resetCustomColors,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useThemeContext must be used within ThemeProvider");
  return context;
};

export const usePanelTheme = useThemeContext;
export const PanelThemeProvider = ThemeProvider;
