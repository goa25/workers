/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef9f4',
          100: '#d6f0e3',
          200: '#b0e0cb',
          300: '#7cc9ab',
          400: '#4aab87',
          500: '#2a8f6c',
          600: '#1d7358',
          700: '#185d48',
          800: '#164a3b',
          900: '#0e3b2e',
          950: '#081f18',
        },
        azure: {
          50:  '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#0078d4',
          700: '#005fa3',
          800: '#1e40af',
          900: '#1e3a5f',
        },
      },
      fontFamily: {
        sans:    ['Segoe UI', 'SegoeUI', 'Arial', 'sans-serif'],
        display: ['Segoe UI', 'SegoeUI', 'Arial', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      animation: {
        'fade-in':  'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'spin':     'spin 1s linear infinite',
        'pulse':    'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(16px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
      boxShadow: {
        'card':       '0 1px 2px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.07)',
        'card-hover': '0 4px 10px rgba(0,0,0,0.08), 0 12px 28px rgba(0,0,0,0.10)',
        'nav':        '0 1px 0 rgba(0,0,0,0.06)',
        'dropdown':   '0 4px 6px rgba(0,0,0,0.05), 0 10px 25px rgba(0,0,0,0.10)',
      },
      borderRadius: {
        'xl':  '0.25rem',
        '2xl': '0.25rem',
        '3xl': '0.25rem',
      },
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '18':  '4.5rem',
      },
    },
  },
  plugins: [],
}
