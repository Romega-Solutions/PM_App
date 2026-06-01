/**
 * NativeWind theme. Mirrors src/theme/colors.ts (the source of truth) — keep the
 * two in sync. fontFamily names map to the faces registered in app/_layout.tsx.
 */
module.exports = {
  darkMode: "media",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
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
          800: "#7A0E45",
          900: "#4D0034",
          950: "#33001F",
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
          800: "#46307F",
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
          800: "#143A9E",
          900: "#0B2D8E",
          950: "#061C57",
        },
        neutral: {
          50: "#FAF9FB",
          100: "#F2F1F4",
          200: "#ECEBF0",
          300: "#E7E6EB",
          400: "#C9C7CF",
          500: "#84828C",
          600: "#6A6A72",
          700: "#48474E",
          800: "#2A2A30",
          900: "#1A1A1A",
          950: "#0C0C0E",
          white: "#FFFFFF",
          black: "#000000",
        },
        success: { 100: "#E7F6EF", 300: "#6FE0B0", 600: "#22A574", 700: "#15724F" },
        warning: { 100: "#FFF6E5", 300: "#FCD34D", 600: "#F59E0B", 700: "#B45309" },
        error: { 100: "#FDE8EC", 300: "#F26B86", 600: "#D52C4D", 700: "#A81D3A" },
      },
      fontFamily: {
        // Body / UI (DM Sans) — maps to the registered regular face
        body: ["DMSans-Regular", "DM Sans", "system-ui", "sans-serif"],
        // Headers (Lora)
        header: ["Lora-Regular", "Lora", "serif"],
        // Brand wordmark — display serif (HelloParis dropped; 2-font system)
        logo: ["Lora-Bold", "Lora", "serif"],
        // Backwards-compatible aliases
        sans: ["DMSans-Regular", "DM Sans", "system-ui", "sans-serif"],
        dm: ["DMSans-Regular", "DM Sans", "sans-serif"],
        "hello-paris": ["Lora-Bold", "Lora", "serif"],
        playfair: ["Lora-Regular", "Lora", "serif"],
      },
    },
  },
  plugins: [],
};
