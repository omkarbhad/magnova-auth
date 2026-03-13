/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(0, 84%, 50%)',
          foreground: 'hsl(0, 0%, 98%)',
        },
        dark: {
          DEFAULT: '#171717',
        },
      },
    },
  },
  plugins: [],
}
