import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
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
        primary: {
          DEFAULT: "#FED7AA",
          100: "#FFF3E5",
          200: "#FFE3C8",
          300: "#FFD4AA",
          400: "#FFC38D",
          500: "#FED7AA",
          550: "#DCB78D",
          600: "#E5C08E",
          700: "#CBA774",
          800: "#B28F5A",
          900: "#997642",
          foreground: "#150606",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
