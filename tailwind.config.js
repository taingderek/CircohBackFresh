/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary palette
        primary: {
          dark: '#121212',
          DEFAULT: '#32FFA5', // Mint
          light: '#4CFFB2',
        },
        secondary: {
          dark: '#1E1E1E',
          DEFAULT: '#BE93FD', // Lavender
          light: '#D0ACFF',
        },
        tertiary: {
          DEFAULT: '#FF93B9', // Pink
          light: '#FFA9C8',
        },
        background: {
          DEFAULT: '#121212',
          elevated: '#1E1E1E',
          card: '#252525',
        },
        text: {
          DEFAULT: '#FFFFFF',
          secondary: '#B0B0B0',
          muted: '#707070',
        },
        border: {
          DEFAULT: '#333333',
          light: '#444444',
        },
        success: '#32FFA5',
        warning: '#FFB154',
        error: '#FF6B6B',
        info: '#54C8FF',
      },
      fontFamily: {
        sans: ['Montserrat-Regular', 'sans-serif'],
        medium: ['Montserrat-Medium', 'sans-serif'],
        semibold: ['Montserrat-SemiBold', 'sans-serif'],
        bold: ['Montserrat-Bold', 'sans-serif'],
        mono: ['SpaceMono-Regular', 'monospace'],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        circle: '9999px',
      },
      // Custom shadows with glows for dark mode
      boxShadow: {
        'glow-mint': '0 0 15px rgba(50, 255, 165, 0.3)',
        'glow-lavender': '0 0 15px rgba(190, 147, 253, 0.3)',
        'glow-pink': '0 0 15px rgba(255, 147, 185, 0.3)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.5)',
        'elevated': '0 8px 24px rgba(0, 0, 0, 0.7)',
      },
    },
  },
  plugins: [],
}; 