import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        surface: "var(--surface)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        positive: "var(--positive)",
        negative: "var(--negative)",
        neutral: "var(--neutral)",
      },
      boxShadow: {
        premium: "0 8px 30px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.02)",
        "premium-hover": "0 20px 40px rgba(0, 0, 0, 0.06), 0 8px 20px rgba(0, 0, 0, 0.04)",
        active: "0 2px 8px rgba(0, 0, 0, 0.05)",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)"],
        display: ["var(--font-outfit)"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
