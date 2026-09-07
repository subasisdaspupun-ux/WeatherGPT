/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        skyDark: "#0B132B",
        cardDark: "#1C2541",
        accentBlue: "#48CAE4",
        accentNeon: "#00F5D4",
        riskLow: "#10B981",
        riskMod: "#F59E0B",
        riskHigh: "#F97316",
        riskExtreme: "#EF4444",
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
