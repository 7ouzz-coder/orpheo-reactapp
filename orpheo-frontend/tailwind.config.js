/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          black: '#0B0B0B',
          'black-secondary': '#121212',
          gold: '#D4AF37',
          'gold-secondary': '#B3892B',
          'gold-light': '#E6C275',
        },
        gray: {
          border: '#7A6F63',
          text: '#A59F99',
        }
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #E6C275 0%, #B3892B 100%)',
        'gold-gradient-hover': 'linear-gradient(135deg, #F5D78E 0%, #C4953F 100%)',
      },
      fontFamily: {
        'serif': ['Cinzel', 'serif'],
        'sans': ['Montserrat', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(212, 175, 55, 0)' },
        },
      },
    },
  },
  plugins: [],
}