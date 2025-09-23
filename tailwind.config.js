/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        dark: {
          50: '#ffffff',
          100: '#e0e0e0',
          200: '#a0a0a0',
          300: '#808080',
          400: '#606060',
          500: '#404040',
          600: '#202020',
          700: '#141414',
          800: '#0A0A0A',
          900: '#000000',
        },
      },
    },
  },
  plugins: [],
};