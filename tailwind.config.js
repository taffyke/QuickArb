/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3ab0bf",
        background: "#0f172a",
        foreground: "#f8fafc",
        card: "#1e293b",
        muted: "#334155",
      },
    },
  },
  plugins: [],
}

