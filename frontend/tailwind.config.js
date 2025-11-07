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
        // EventFlex Theme Colors
        teal: {
          DEFAULT: '#00C896',
          dark: '#00A678',
          light: '#00E0B4',
        },
        orange: {
          DEFAULT: '#FFA500',
          dark: '#FF8C00',
          light: '#FFB833',
        },
        yellow: {
          DEFAULT: '#FACC15',
          dark: '#EAB308',
          light: '#FDE047',
        },
        // Dark theme colors
        dark: {
          bg: '#121212',
          card: '#1E1E1E',
          sidebar: '#1A1A1A',
          active: '#1A3636',
          border: '#2A2A2A',
        },
        // Light theme colors
        light: {
          bg: '#FFFFFF',
          card: '#F5F5F5',
          sidebar: '#FAFAFA',
          active: '#E0F7F4',
          border: '#E0E0E0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

