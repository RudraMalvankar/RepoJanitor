/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090d16",
        foreground: "#f8fafc",
        card: "#0d1322",
        "card-border": "#1e293b",
        accent: "#10b981", // Emerald green for safe / janitor brand
        "accent-dim": "#064e3b",
        warning: "#f59e0b",
        danger: "#ef4444",
        muted: "#64748b"
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Menlo", "Monaco", "Courier New", "monospace"],
      }
    },
  },
  plugins: [],
}
