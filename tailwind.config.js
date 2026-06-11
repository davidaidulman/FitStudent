/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        body: 'var(--bg-body)',
        page: 'var(--bg-page)',
        card: 'var(--bg-card)',
        card2: 'var(--bg-card-2)',
        lime: 'var(--lime)',
        'lime-dim': 'var(--lime-dim)',
        blue: 'var(--blue)',
        orange: 'var(--orange)',
        purple: 'var(--purple)',
        teal: 'var(--teal)',
        text: 'var(--text)',
        muted: 'var(--muted)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
        lime: 'var(--lime-border)',
      },
      borderRadius: {
        card: '16px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.4)',
        glow: '0 0 20px rgba(200,240,0,0.15)',
      },
    },
  },
  plugins: [],
}
