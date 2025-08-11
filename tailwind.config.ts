import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}", // important if you use /src
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
