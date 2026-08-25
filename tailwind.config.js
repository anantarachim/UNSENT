/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#080d1a',
          900: '#0d1526',
          800: '#111d35',
          700: '#162244',
          600: '#1e2d57',
          500: '#253670',
        },
        purple: {
          950: '#1a0d2e',
          900: '#2d1b4e',
          800: '#3d2466',
          700: '#5b3591',
          600: '#7c52b8',
          500: '#9b7ad4',
          400: '#b89ee0',
          300: '#d4c3ed',
          200: '#e8ddf5',
          100: '#f5f0fb',
        },
        rose: {
          950: '#2d0d1a',
          900: '#4d1528',
          800: '#7a2040',
          700: '#a33058',
          600: '#c94d74',
          500: '#e06b92',
          400: '#ea8fab',
          300: '#f2b3c4',
          200: '#f8d4de',
          100: '#fdeef2',
        },
        surface: {
          DEFAULT: '#111827',
          card: '#161e2e',
          hover: '#1c2640',
          border: '#1f2d45',
          muted: '#253352',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.25s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-10px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
