/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gentora: {
          dark: '#0f172a',
          emerald: '#064e3b',
          'emerald-light': '#047857',
          gold: '#d97706',
          'gold-light': '#f59e0b',
          sand: '#fdfbf7',
          warm: '#f7f4ef',
          maroon: '#881337',
          navy: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'Merriweather', 'serif'],
      },
      boxShadow: {
        premium: '0 10px 30px -10px rgba(15, 23, 42, 0.08)',
        card: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
      },
    },
  },
  plugins: [],
};
