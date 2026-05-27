import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#09090B",
        surface: "#111113",
        border: "#1F1F23",
        accent: "#3B82F6",
        "accent-hover": "rgba(59,130,246,0.2)",
        foreground: "#FAFAFA",
        muted: "#A1A1AA",
      },
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      boxShadow: {
        accent: "0 0 20px rgba(59,130,246,0.3)",
        "accent-lg": "0 0 40px rgba(59,130,246,0.4)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
      },
      animation: {
        "fade-in": "fadeIn 200ms ease-out",
        "slide-up": "slideUp 300ms ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(59,130,246,0.2)" },
          "50%": { boxShadow: "0 0 30px rgba(59,130,246,0.5)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200px 0" },
          "100%": { backgroundPosition: "calc(200px + 100%) 0" },
        },
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #09090B 0%, #0F172A 100%)",
        "card-gradient":
          "linear-gradient(135deg, #111113 0%, #0F1729 100%)",
        shimmer:
          "linear-gradient(90deg, #111113 0%, #1a1a20 50%, #111113 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
