/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#298f50",
          50: "#eaf6ed",
          100: "#d5ede0",
          200: "#abdcb1",
          300: "#81cb82",
          400: "#57ba53",
          500: "#298f50",
          600: "#217240",
          700: "#195630",
          800: "#113920",
          900: "#081d10",
        },
        secondary: "#f09c2a",
      },
    },
  },
  plugins: [],
};
