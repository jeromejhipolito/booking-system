/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './stores/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF5F2',
          100: '#FFE8E0',
          200: '#FFD0C2',
          300: '#FFB09A',
          400: '#FF8A6A',
          500: '#F96B4B',
          600: '#E8523A',
          700: '#C4402D',
          800: '#A33526',
          900: '#7C2A20',
          950: '#4A1712',
        },
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        danger: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        accent: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        muted: {
          50: '#FAF9F7',
          100: '#F5F3F0',
          200: '#E8E5E0',
          300: '#D4CFC8',
          400: '#A39E96',
          500: '#6B6560',
          600: '#4A4540',
          700: '#3A3530',
          800: '#2A2520',
          900: '#1A1510',
        },
      },
    },
  },
  plugins: [],
};
