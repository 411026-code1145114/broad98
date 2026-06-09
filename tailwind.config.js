/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html'],
  content: ['./index.html', './app.js', './styles.css'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#04070d',
        surface: '#121a29',
        panel: '#172234',
        muted: '#d7e1ee',
        text: '#f4f7fb',
        primary: '#8be9fd',
        'primary-strong': '#5eead4',
        accent: '#bfdbfe',
        danger: '#fca5a5',
        border: 'rgba(148, 163, 184, 0.18)',
      },
      backgroundImage: {
        'app-glow': 'radial-gradient(circle at top, rgba(139, 233, 253, 0.10), transparent 30%), radial-gradient(circle at right, rgba(192, 132, 252, 0.10), transparent 24%), linear-gradient(140deg, #04070d 0%, #07111f 35%, #0f172a 100%)',
        glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.05))',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(15, 23, 42, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
    },
  },
  plugins: [],
};
