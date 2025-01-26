/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateY(100%)' }
        }
      }
    },
  },
  plugins: [],
};