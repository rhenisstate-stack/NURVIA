import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#1E293B", // Deep Slate Blue — structural typography (legacy alias)
          teal: "#0A5C66", // Deep Sea Teal — primary brand action (legacy alias)
          tealDark: "#084A52", // darker teal hover (legacy alias)
          navyDeep: "#17212B", // deepest slate emphasis (legacy alias)
        },
        background: "var(--background)",
        foreground: {
          DEFAULT: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        primary: {
          DEFAULT: "var(--primary)", // Deep Sea Teal
          hover: "var(--primary-hover)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary-surface)", // Slate Mist
          foreground: "var(--text-primary)",
        },
        accent: {
          DEFAULT: "var(--accent)", // Warm Ochre Gold — attention/review accents
          hover: "var(--accent-hover)",
        },
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text-primary)",
        },
        popover: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text-primary)",
        },
        muted: {
          DEFAULT: "var(--surface-muted)",
          foreground: "var(--text-muted)",
        },
        success: {
          DEFAULT: "var(--success)", // Fresh Mint Green
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "var(--error)",
          foreground: "#FFFFFF",
        },
        info: {
          DEFAULT: "var(--info)", // Deep Sea Teal (informational guidance)
          foreground: "#FFFFFF",
        },
        /* Examination-specific semantic tokens */
        exam: {
          correct: "var(--correct-answer)",
          correctSoft: "var(--correct-answer-soft)",
          incorrect: "var(--incorrect-answer)",
          incorrectSoft: "var(--incorrect-answer-soft)",
          bookmarked: "var(--bookmarked-question)",
          bookmarkedSoft: "var(--bookmarked-question-soft)",
          answered: "var(--answered-question)",
          unanswered: "var(--unanswered-question)",
          saved: "var(--answer-saved)",
          saving: "var(--answer-saving)",
          saveFailed: "var(--answer-save-failed)",
        },
        ring: {
          DEFAULT: "var(--ring)",
        },
        input: {
          DEFAULT: "var(--input)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          muted: "var(--surface-muted)",
          elevated: "var(--surface-elevated)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        semantic: {
          success: "var(--success)",
          warning: "var(--warning)",
          error: "var(--error)",
          info: "var(--info)",
        },
      },
      fontFamily: {
        brand: ["var(--font-brand)", "Plus Jakarta Sans", "sans-serif"],
        ui: ["var(--font-ui)", "Inter", "sans-serif"],
        sans: ["var(--font-ui)", "Inter", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};

export default config;
