import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "sans-serif"],
        serif: ["var(--font-display)", "serif"],
      },
      boxShadow: {
        panel: "0 24px 60px -30px rgba(58, 47, 34, 0.32)",
        soft: "0 18px 36px -26px rgba(58, 47, 34, 0.26)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;

