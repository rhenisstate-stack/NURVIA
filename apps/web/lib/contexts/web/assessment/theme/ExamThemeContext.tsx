// src\lib\contexts\web\assessment\theme\ExamThemeContext.tsx
"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    ReactNode,
} from "react";

export type ExamThemeTarget =
    | "global"
    | "upperNavbar"
    | "lowerNavbar"
    | "nonStickyNavbar"
    | "content"
    | "footer"
    | "leftSidebar"
    | "rightSidebar";

export type ExamThemeValue = "default" | "light" | "dark" | "custom" | "system";

export type ExamCustomColors = {
    upperNavbar:        string;
    lowerNavbar:        string;
    nonStickyNavbar:    string;
    content:            string;
    footer:             string;
    leftSidebar:        string;
    rightSidebar:       string;
    upperNavText:       string;
    lowerNavText:       string;
    nonStickyNavText:   string;
    contentText:        string;
    footerText:         string;
    leftSidebarText:    string;
    rightSidebarText:   string;
};

export const DEFAULT_EXAM_COLORS: ExamCustomColors = {
    upperNavbar:       "#ffffff",
    lowerNavbar:       "#f8fafc",
    nonStickyNavbar:   "#f8fafc",
    content:           "#f1f5f9",
    footer:            "#e2e8f0",
    leftSidebar:       "#f8fafc",
    rightSidebar:      "#f8fafc",
    upperNavText:      "#0f172a",
    lowerNavText:      "#334155",
    nonStickyNavText:  "#334155",
    contentText:       "#1e293b",
    footerText:        "#475569",
    leftSidebarText:   "#334155",
    rightSidebarText:  "#334155",
};

const LIGHT_EXAM_COLORS: ExamCustomColors = {
    upperNavbar:       "#ffffff",
    lowerNavbar:       "#f8fafc",
    nonStickyNavbar:   "#f8fafc",
    content:           "#ffffff",
    footer:            "#f1f5f9",
    leftSidebar:       "#f8fafc",
    rightSidebar:      "#f8fafc",
    upperNavText:      "#111827",
    lowerNavText:      "#374151",
    nonStickyNavText:  "#374151",
    contentText:       "#111827",
    footerText:        "#374151",
    leftSidebarText:   "#374151",
    rightSidebarText:  "#374151",
};

const DARK_EXAM_COLORS: ExamCustomColors = {
    upperNavbar:       "#1e293b",
    lowerNavbar:       "#0f172a",
    nonStickyNavbar:   "#0f172a",
    content:           "#0f172a",
    footer:            "#020617",
    leftSidebar:       "#0f172a",
    rightSidebar:      "#0f172a",
    upperNavText:      "#f1f5f9",
    lowerNavText:      "#cbd5e1",
    nonStickyNavText:  "#cbd5e1",
    contentText:       "#e2e8f0",
    footerText:        "#94a3b8",
    leftSidebarText:   "#cbd5e1",
    rightSidebarText:  "#cbd5e1",
};

export const EXAM_COLORS_STORAGE_KEY  = "examCustomColors";
export const EXAM_THEME_STORAGE_KEY   = "examTheme";

const CSS_VAR_MAP: Record<keyof ExamCustomColors, string> = {
    upperNavbar:       "--exam-upper-nav-bg",
    lowerNavbar:       "--exam-lower-nav-bg",
    nonStickyNavbar:   "--exam-non-sticky-nav-bg",
    content:           "--exam-content-bg",
    footer:            "--exam-footer-bg",
    leftSidebar:       "--exam-left-sidebar-bg",
    rightSidebar:      "--exam-right-sidebar-bg",
    upperNavText:      "--exam-upper-nav-text",
    lowerNavText:      "--exam-lower-nav-text",
    nonStickyNavText:  "--exam-non-sticky-nav-text",
    contentText:       "--exam-content-text",
    footerText:        "--exam-footer-text",
    leftSidebarText:   "--exam-left-sidebar-text",
    rightSidebarText:  "--exam-right-sidebar-text",
};

const defaultTheme: Record<ExamThemeTarget, ExamThemeValue> = {
    global:          "default",
    upperNavbar:     "default",
    lowerNavbar:     "default",
    nonStickyNavbar: "default",
    content:         "default",
    footer:          "default",
    leftSidebar:     "default",
    rightSidebar:    "default",
};

// ── Pure helper — no hooks, safe to call anywhere ────────────────────────────
function applyCSS(
    root: HTMLElement,
    theme: Record<ExamThemeTarget, ExamThemeValue>,
    effectiveColors: ExamCustomColors,
) {
    const resolveGlobal = (): ExamCustomColors => {
        switch (theme.global) {
            case "light":  return LIGHT_EXAM_COLORS;
            case "dark":   return DARK_EXAM_COLORS;
            case "custom": return effectiveColors;
            default:       return DEFAULT_EXAM_COLORS;
        }
    };

    const base = resolveGlobal();

    const sections: Array<{
        target:  ExamThemeTarget;
        bgKey:   keyof ExamCustomColors;
        textKey: keyof ExamCustomColors;
    }> = [
        { target: "upperNavbar",     bgKey: "upperNavbar",     textKey: "upperNavText"      },
        { target: "lowerNavbar",     bgKey: "lowerNavbar",     textKey: "lowerNavText"      },
        { target: "nonStickyNavbar", bgKey: "nonStickyNavbar", textKey: "nonStickyNavText"  },
        { target: "content",         bgKey: "content",         textKey: "contentText"       },
        { target: "footer",          bgKey: "footer",          textKey: "footerText"        },
        { target: "leftSidebar",     bgKey: "leftSidebar",     textKey: "leftSidebarText"   },
        { target: "rightSidebar",    bgKey: "rightSidebar",    textKey: "rightSidebarText"  },
    ];

    for (const { target, bgKey, textKey } of sections) {
        const st = theme[target];
        let bg:   string;
        let text: string;

        if (st === "light") {
            bg = LIGHT_EXAM_COLORS[bgKey]; text = LIGHT_EXAM_COLORS[textKey];
        } else if (st === "dark") {
            bg = DARK_EXAM_COLORS[bgKey];  text = DARK_EXAM_COLORS[textKey];
        } else if (st === "custom") {
            bg = effectiveColors[bgKey];   text = effectiveColors[textKey];
        } else {
            bg = base[bgKey]; text = base[textKey];
        }

        root.style.setProperty(CSS_VAR_MAP[bgKey],   bg);
        root.style.setProperty(CSS_VAR_MAP[textKey], text);
    }
}

interface ExamThemeContextType {
    theme:             Record<ExamThemeTarget, ExamThemeValue>;
    customColors:      ExamCustomColors | null;
    effectiveColors:   ExamCustomColors;
    setTheme:          (target: ExamThemeTarget, value: ExamThemeValue) => void;
    setCustomColors:   (colors: Partial<ExamCustomColors>) => void;
    resetCustomColors: () => void;
    applyGlobalMode:   (mode: "default" | "light" | "dark" | "custom") => void;
}

const ExamThemeContext = createContext<ExamThemeContextType | undefined>(undefined);

export const ExamThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setThemeState]               = useState<Record<ExamThemeTarget, ExamThemeValue>>(defaultTheme);
    const [customColors, setCustomColorsState] = useState<ExamCustomColors | null>(null);
    const hasHydrated                          = useRef(false);

    const effectiveColors: ExamCustomColors = customColors ?? DEFAULT_EXAM_COLORS;

    useEffect(() => {
        const root = document.documentElement;

        if (!hasHydrated.current) {
            hasHydrated.current = true;
            try {
                const storedTheme  = localStorage.getItem(EXAM_THEME_STORAGE_KEY);
                const storedColors = localStorage.getItem(EXAM_COLORS_STORAGE_KEY);

                if (storedTheme || storedColors) {
                    const parsedTheme:  Record<ExamThemeTarget, ExamThemeValue> | null =
                        storedTheme  ? JSON.parse(storedTheme)  : null;
                    const parsedColors: ExamCustomColors | null =
                        storedColors ? JSON.parse(storedColors) : null;

                    const themeToUse  = parsedTheme  ?? defaultTheme;
                    const colorsToUse = parsedColors ?? DEFAULT_EXAM_COLORS;

                    // Write CSS vars immediately — before state triggers a re-render
                    applyCSS(root, themeToUse, colorsToUse);

                    if (parsedTheme)  setThemeState(parsedTheme);
                    if (parsedColors) setCustomColorsState(parsedColors);
                    return;
                }
            } catch { /* SSR / private mode */ }
        }

        // Normal (non-hydration) runs
        applyCSS(root, theme, effectiveColors);
        try {
            localStorage.setItem(EXAM_THEME_STORAGE_KEY, JSON.stringify(theme));
        } catch { /* noop */ }

    }, [theme, customColors, effectiveColors]);

    const setTheme = (target: ExamThemeTarget, value: ExamThemeValue) =>
        setThemeState(prev => ({ ...prev, [target]: value }));

    const setCustomColors = (colors: Partial<ExamCustomColors>) => {
        setCustomColorsState(prev => {
            const updated = { ...(prev ?? DEFAULT_EXAM_COLORS), ...colors };
            try { localStorage.setItem(EXAM_COLORS_STORAGE_KEY, JSON.stringify(updated)); } catch { /* noop */ }
            return updated;
        });
    };

    const resetCustomColors = () => {
        try { localStorage.removeItem(EXAM_COLORS_STORAGE_KEY); } catch { /* noop */ }
        setCustomColorsState(null);
    };

    const applyGlobalMode = (mode: "default" | "light" | "dark" | "custom") => {
        const targets: ExamThemeTarget[] = [
            "upperNavbar", "lowerNavbar", "nonStickyNavbar",
            "content", "footer", "leftSidebar", "rightSidebar",
        ];
        targets.forEach(t => setTheme(t, mode));
        setTheme("global", mode);
    };

    return (
        <ExamThemeContext.Provider value={{
            theme, customColors, effectiveColors,
            setTheme, setCustomColors, resetCustomColors, applyGlobalMode,
        }}>
            {children}
        </ExamThemeContext.Provider>
    );
};

export const useExamTheme = (): ExamThemeContextType => {
    const ctx = useContext(ExamThemeContext);
    if (!ctx) throw new Error("useExamTheme must be used within <ExamThemeProvider>");
    return ctx;
};