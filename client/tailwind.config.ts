import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#0a0a0a",
        surface: "#0d0d0d",
        elevated: "#141414",
        border: "#1a1a1a",
        "border-strong": "#2a2a2a",
        muted: "#444444",
        secondary: "#666666",
        primary: "#e5e5e5",
        "accent-blue": "#3b82f6",
        "accent-green": "#10b981",
        "accent-amber": "#f59e0b",
        "accent-red": "#ef4444",
      },
    },
  },
  plugins: [],
};
export default config;
