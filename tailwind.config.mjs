/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066CC',
          50: '#E6F2FF',
          100: '#CCE5FF',
          200: '#99CBFF',
          300: '#66B2FF',
          400: '#3398FF',
          500: '#0066CC',
          600: '#0052A3',
          700: '#003D7A',
          800: '#002952',
          900: '#001429',
        },
        accent: {
          DEFAULT: '#FF6B35',
          50: '#FFF0EB',
          100: '#FFE0D6',
          200: '#FFC2AD',
          300: '#FFA385',
          400: '#FF855C',
          500: '#FF6B35',
          600: '#CC4A1F',
          700: '#993816',
          800: '#66250E',
          900: '#331307',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};