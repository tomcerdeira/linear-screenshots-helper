/** @type {import('tailwindcss').Config} */
const { COLORS } = require('./src/shared/colors');

module.exports = {
  content: ['./index.html', './src/renderer/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        linear: {
          brand: COLORS.linear.brand,
          'brand-hover': COLORS.linear.brandHover,
        },
        surface: {
          DEFAULT: COLORS.surface.base,
          raised: COLORS.surface.raised,
          input: COLORS.surface.input,
          hover: COLORS.surface.hover,
        },
        border: {
          DEFAULT: COLORS.border.default,
          subtle: COLORS.border.subtle,
          hover: COLORS.border.hover,
        },
        content: {
          DEFAULT: COLORS.content.default,
          secondary: COLORS.content.secondary,
          muted: COLORS.content.muted,
          ghost: COLORS.content.ghost,
          placeholder: COLORS.content.placeholder,
        },
        feedback: {
          success: COLORS.feedback.success,
          error: COLORS.feedback.error,
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
