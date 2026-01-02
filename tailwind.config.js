/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0F0F14',
          card: '#1A1A22',
          accent: '#7C5CFF',
          accent2: '#4CC9F0',
          text: '#FFFFFF',
          textMuted: '#B3B3C6',
          danger: '#E5484D'
        }
      }
    },
  },
  plugins: [],
}
