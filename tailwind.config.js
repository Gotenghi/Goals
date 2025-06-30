/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'usso-primary': '#FF6B35',
        'usso-secondary': '#4ECDC4',
        'usso-accent': '#FFE66D',
        'usso-dark': '#2C3E50',
        'usso-light': '#F8F9FA',
      },
      fontFamily: {
        'korean': ['Noto Sans KR', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 