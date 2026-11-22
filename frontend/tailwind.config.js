/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          navy: '#0A192F',
          darkBlue: '#172A45',
          royal: '#1D4ED8',
          accent: '#06B6D4',
          alertRed: '#DC2626',
          warningOrange: '#EA580C',
          cautionYellow: '#CA8A04',
          infoBlue: '#2563EB',
          bgLight: '#F8FAFC',
          cardBg: '#FFFFFF',
        }
      }
    },
  },
  plugins: [],
}

