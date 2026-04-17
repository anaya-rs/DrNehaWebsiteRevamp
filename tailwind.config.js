/** @type {import('tailwindcss').Config} */
export default {
  // Only apply Tailwind classes in admin components
  content: [
    './src/admin/**/*.{js,ts,jsx,tsx}',
    './src/auth/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0faf5',
          100: '#e8f4ef',
          200: '#d1e9df',
          300: '#a3d3bf',
          400: '#6fb89f',
          500: '#4a9d83',
          600: '#0b6b4e',
          700: '#09573f',
          800: '#084432',
          900: '#0a2419',
        },
      },
    },
  },
  plugins: [],
}
