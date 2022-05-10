module.exports = {
  jit: true,
  content: ['./src/**/*.*'],
  theme: {
    fontFamily: {
      sans: ['Open Sans', 'DejaVu Sans', 'sans-serif'],
      mono: ['Source Code Pro', 'Roboto Mono', 'DejaVu Sans Mono', 'monospace'],
      serif: ['Noto Serif', 'DejaVu Serif', 'serif'],
    },
    extend: {
      colors: {
        cadillac: {
          DEFAULT: '#A64D79',
          50: '#F3E5EC',
          100: '#EBD4DF',
          200: '#DBB1C6',
          300: '#CB8EAC',
          400: '#BB6B93',
          500: '#A64D79',
          600: '#833D60',
          700: '#602D46',
          800: '#3D1D2D',
          900: '#1B0C13',
        },
      },
    },
  },
  variants: {},
  plugins: [require('@tailwindcss/typography')],
  corePlugins: {
    preflight: false,
  },
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
}
