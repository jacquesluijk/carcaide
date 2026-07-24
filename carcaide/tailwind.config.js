/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          orange: '#FF6B35',
          blue: '#2E86C1',
          light: '#F8F9FA',
          dark: '#2C3E50',
        },
      },
    },
  },
  plugins: [],
};
