/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a365d',
          dark: '#2c5282',
          light: '#4299e1',
        },
        secondary: {
          DEFAULT: '#2d3748',
          light: '#4a5568',
        },
        theme: {
          'bg-primary': 'rgb(var(--bg-primary) / <alpha-value>)',
          'bg-secondary': 'rgb(var(--bg-secondary) / <alpha-value>)',
          'bg-tertiary': 'rgb(var(--bg-tertiary) / <alpha-value>)',
          'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
          'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
          'text-tertiary': 'rgb(var(--text-tertiary) / <alpha-value>)',
          'border': 'rgb(var(--border-color) / <alpha-value>)',
          'accent': 'rgb(var(--accent-primary) / <alpha-value>)',
          'accent-secondary': 'rgb(var(--accent-secondary) / <alpha-value>)',
          'accent-hover': 'rgb(var(--accent-hover) / <alpha-value>)',
        },
      },
      keyframes: {
        domino: {
          '50%': { opacity: '0.7' },
          '75%': { transform: 'rotate(90deg)' },
          '80%': { opacity: '1' },
        },
        enlarge: {
          '0%': { transform: 'scale(0.5)' },
          '100%': { transform: 'scale(1.2)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'domino-1': 'domino 1s ease infinite 0.125s',
        'domino-2': 'domino 1s ease infinite 0.3s',
        'domino-3': 'domino 1s ease infinite 0.425s',
        'domino-4': 'domino 1s ease infinite 0.54s',
        'domino-5': 'domino 1s ease infinite 0.665s',
        'domino-6': 'domino 1s ease infinite 0.79s',
        'domino-7': 'domino 1s ease infinite 0.915s',
        'domino-8': 'domino 1s ease infinite',
      },
    },
  },
  plugins: [],
}
