/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class', // Enable dark mode with class
  theme: {
    extend: {
      colors: {
        primary: "#0A85FF",
        secondary: "#F9FAFB",
        dark: "#111827",
        light: "#F3F4F6",
        // Perplexity-like dark theme colors
        perplexity: {
          darkbg: "#18181B",    // Main background
          darkcard: "#27272A",  // Card background
          darktext: "#E4E4E7",  // Primary text
          darksecondary: "#A1A1AA", // Secondary text
          darkborder: "#3F3F46", // Border colors
          darkaccent: "#0284C7", // Accent color (blue)
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 