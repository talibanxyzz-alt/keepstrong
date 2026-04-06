import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        /** Brand — deep navy (buttons, nav active, links) */
        primary: "#0C4A6E",
        "primary-hover": "#0A3D5C",
        /** Page canvas behind cards */
        canvas: "#F1F5F9",
        /** Card / panel surface */
        surface: "#FFFFFF",
        /** Primary text */
        charcoal: "#1F2937",
        /** Secondary / helper text */
        slate: "#64748B",
        /** Subtle fills (chips, stripes) */
        cloud: "#F1F5F9",
        /** Default borders */
        line: "#E2E8F0",
        /** Inputs, stronger dividers */
        "line-strong": "#CBD5E1",
        success: "#059669",
        warning: "#D97706",
        danger: "#DC2626",
        "danger-muted": "#FEF2F2",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.06)",
        "card-hover": "0 4px 6px -1px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.06)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
export default config;
