/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#F2BC94',
        secondary: '#722620',
        dark: '#30110D',
      },
    },
  },
  plugins: [],
};