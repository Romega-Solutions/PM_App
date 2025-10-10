/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        amihan: {
          50: "#FFF7FB",
          100: "#F6D0F1",
          200: "#F0B6DF",
          300: "#E1ABDA",
          400: "#F090C6",
          500: "#EF3E78",
          600: "#D7346B",
          700: "#B31460",
          900: "#4D0034",
        },
        dalisay: {
          50: "#F8F5FF",
          100: "#E3DCF9",
          200: "#C5B1E4",
          300: "#B085F6",
          400: "#A47CF2",
          500: "#8D69F6",
          600: "#6F4EF0",
          700: "#5A3BAF",
          900: "#2E1E5A",
          950: "#340839",
        },
        luna: {
          50: "#F4F8FF",
          100: "#C0D2F4",
          200: "#A0BAEE",
          300: "#81A5E9",
          400: "#6D90EA",
          500: "#5C83E9",
          600: "#3F6FE4",
          700: "#1C4EBE",
          900: "#0B2D8E",
        },
        neutral: {
          50: "#FAF9FB",
          100: "#F2F1F4",
          200: "#ECEBF0",
          300: "#E7E6EB",
          600: "#6A6A72",
          900: "#1A1A1A",
          white: "#FFFFFF",
        },
        success: {
          100: "#E7F6EF",
          600: "#22A574",
        },
        warning: {
          100: "#FFF6E5",
          600: "#F59E0B",
        },
        error: {
          100: "#FDE8EC",
          600: "#D52C4D",
        },
      },
      fontFamily: {
        'hello-paris': ['HelloParis', 'sans-serif'],
        'playfair': ['PlayfairDisplay', 'serif'],
      },
    },
  },
  plugins: [],
};