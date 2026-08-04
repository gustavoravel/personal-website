/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface": "#131313",
        "surface-dim": "#131313",
        "surface-bright": "#393939",
        "surface-container-lowest": "#0e0e0e",
        "surface-container-low": "#1c1b1b",
        "surface-container": "#201f1f",
        "surface-container-high": "#2a2a2a",
        "surface-container-highest": "#353534",
        "on-surface": "#f0eeed",
        // Contraste elevado: o cinza anterior (#c1c7d2) ficava fraco sobre
        // painel translúcido e não passava em AA no corpo de texto.
        "on-surface-variant": "#d4d9e2",
        "inverse-surface": "#e5e2e1",
        "inverse-on-surface": "#313030",
        "outline": "#9aa1ab",
        "outline-variant": "#474d56",
        "surface-tint": "#9dcaff",
        "primary": "#9dcaff",
        "on-primary": "#003257",
        "primary-container": "#5095d8",
        "on-primary-container": "#002b4c",
        "inverse-primary": "#0062a2",
        "secondary": "#c6c6c7",
        "on-secondary": "#2f3131",
        "secondary-container": "#454747",
        "on-secondary-container": "#b4b5b5",
        "tertiary": "#c7c6c6",
        "on-tertiary": "#2f3131",
        "tertiary-container": "#909191",
        "on-tertiary-container": "#292a2a",
        "background": "#131313",
        "on-background": "#e5e2e1",
        "surface-variant": "#353534",
        "brand-blue": "#3d84c6",
        "brand-blue-bg": "rgba(61,132,198,0.06)"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        'full': '9999px',
      },
      spacing: {
        'gutter': '16px',
        'margin-desktop': '32px',
        'margin-mobile': '16px',
        'section-gap': '80px',
      }
    },
  },
  plugins: [],
}
