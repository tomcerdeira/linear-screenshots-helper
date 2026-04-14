// Single source of truth for all colors in the app.
// Used by: tailwind.config.js (CJS require), inline HTML templates (ESM import via Vite).
// This is .js (not .ts) so Tailwind's CJS config can require() it directly.

const COLORS = {
  linear: {
    brand: '#5e6ad2',
    brandHover: '#6c78e0',
  },
  surface: {
    base: '#1f2023',
    raised: '#232326',
    input: '#2a2a2e',
    hover: '#2c2c30',
  },
  border: {
    default: '#333338',
    subtle: '#3b3b40',
    hover: '#444450',
  },
  content: {
    default: '#e2e2ea',
    secondary: '#9b9ba4',
    muted: '#6f6f78',
    ghost: '#5a5e7a',
    placeholder: '#4a4a55',
  },
  feedback: {
    success: '#30a46c',
    error: '#e5484d',
  },
};

module.exports = { COLORS };
