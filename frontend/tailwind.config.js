/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // FlowerShop botanik palitra
        ink: {
          DEFAULT: '#21301F',
          light: '#2E4029'
        },
        paper: {
          DEFAULT: '#F3F1E7',
          dark: '#EAE7D8'
        },
        rose: {
          DEFAULT: '#B8737A',
          light: '#D0959B',
          dark: '#96565C'
        },
        moss: {
          DEFAULT: '#6B7F5B',
          light: '#8A9C7A'
        },
        gold: {
          DEFAULT: '#B8934B'
        },
        charcoal: '#2B2B26'
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Work Sans', 'sans-serif']
      }
    }
  },
  plugins: []
}