import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      colors: {
        surface: {
          DEFAULT: "var(--bg)",
          2: "var(--bg2)",
          3: "var(--bg3)",
          4: "var(--bg4)",
        },
        border: {
          DEFAULT: "var(--border)",
          2: "var(--border2)",
        },
        accent: {
          blue: "var(--blue)",
          green: "var(--green)",
          amber: "var(--amber)",
          purple: "var(--purple)",
          red: "var(--red)",
        },
      },
      borderRadius: {
        card: "10px",
        sm: "7px",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
