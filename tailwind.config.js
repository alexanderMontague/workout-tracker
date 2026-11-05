/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateY(100%)' }
        },
        sessionForward: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        sessionBack: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        restIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        pop: {
          '0%': { opacity: '0.4', transform: 'scale(0.86)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        'session-forward': 'sessionForward 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
        'session-back': 'sessionBack 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
        'rest-in': 'restIn 0.2s ease-out',
        pop: 'pop 0.18s ease-out'
      }
    },
  },
  plugins: [],
};