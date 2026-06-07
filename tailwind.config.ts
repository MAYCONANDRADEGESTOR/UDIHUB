import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        background: "#09090B",
        foreground: "#FAFAFA",
        muted: "#A1A1AA",
        border: "#1F1F23",
        surface: "#111113",
        accent: "#3B82F6",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        accent: "0 0 20px rgba(59, 130, 246, 0.3)",
        green: "0 0 20px rgba(34, 197, 94, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
