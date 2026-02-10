/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'optistaal': {
          'orange': '#EE6C4D',
          'blue': '#3D5A80',
          'lightblue': '#98C1D9',
          'cyan': '#E0FBFC',
          'dark': '#293241',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
