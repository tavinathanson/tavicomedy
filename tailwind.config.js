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
        'comedy-purple': '#8B5CF6',
        'comedy-green': '#10B981',
        'comedy-blue': '#3B82F6',
        'comedy-dark': '#1F2937',
      },
      fontFamily: {
        'sans': ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
        'display': ['Bebas Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}