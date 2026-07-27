/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F4F7F5',
          100: '#E6EDE9',
          200: '#C9D9D0',
          300: '#ACBCB2',
          400: '#90A398',
          500: '#7C9A8C',
          600: '#628072',
          700: '#4A6458',
          800: '#354940',
          900: '#21302A'
        },
        peach: {
          50: '#FFF7F2',
          100: '#FFEEDF',
          200: '#FFD7BC',
          300: '#FFBF98',
          400: '#F79965',
          500: '#E8A87C',
          600: '#D48654',
          700: '#B26231',
          800: '#8A451C',
          900: '#632D0E'
        },
        warmBg: '#F5F0EB',
        darkBg: '#1E1E2E',
        darkCard: '#2D2D3F',
        darkBorder: '#3D3D4F'
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif']
      }
    },
  },
  plugins: [],
}
