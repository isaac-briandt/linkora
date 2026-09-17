import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f4f7fa",
          100: "#e6edf3",
          300: "#9aabba",
          500: "#385068",
          600: "#243d55",
          700: "#182f46",
          800: "#10273d",
          900: "#0b1f33",
          950: "#071725",
        },
        coral: {
          50: "#fff4f0",
          100: "#ffe4da",
          200: "#ffc9b8",
          300: "#ffa68e",
          500: "#f56b4d",
          600: "#e45237",
          700: "#bf3d28",
          800: "#9d3324",
          900: "#822d22",
          950: "#641d16",
        },
        sea: "#29a89a",
      }
    }
  },
  plugins: []
};
export default config;
