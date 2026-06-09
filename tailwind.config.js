/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#06080f',
        surface: '#111827',
        muted: '#94a3b8',
        text: '#e2e8f0',
        primary: '#60a5fa',
        'primary-strong': '#3b82f6',
        danger: '#f87171',
        border: '#334155',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(15, 23, 42, 0.48)',
      },
    },
  },
  plugins: [],
};
