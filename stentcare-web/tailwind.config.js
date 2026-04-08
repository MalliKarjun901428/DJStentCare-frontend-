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
          light: '#eff6ff',
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
        },
        healthcare: {
          blue: '#3b82f6',
          green: '#10b981',
          surface: '#f8fafc',
        }
      },
      borderRadius: {
        'card': '16px',
        'input': '12px',
      },
      boxShadow: {
        'soft': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        'grid': '8px',
      }
    },
  },
  plugins: [],
}
