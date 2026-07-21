/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          50: '#f5f5f4',
          100: '#e8e7e5',
          200: '#d1cfcc',
          300: '#b5b2ac',
          400: '#929088',
          500: '#777369',
          600: '#625e55',
          700: '#514d46',
          800: '#45423c',
          900: '#2e2b26',
          950: '#1a1816',
        },
        cream: {
          50: '#fdfaf4',
          100: '#faf3e0',
          200: '#f5e6c0',
          300: '#efd39a',
          400: '#e7bb6a',
          500: '#dea347',
        },
        gold: {
          300: '#e8d5a3',
          400: '#d4af6a',
          500: '#b8962e',
          600: '#9a7a1e',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
