export default {
  content: [
    "./popup.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Modern Slate Palette
        slate: {
          950: '#0F172A', // Deep slate background
          900: '#1E293B', // Cards/Panels
          800: '#334155', // Borders
          700: '#475569', // Subtle borders
          400: '#94A3B8', // Secondary text
          100: '#F1F5F9', // Primary text
        },
        primary: {
          DEFAULT: '#3B82F6', // Blue accent
          hover: '#2563EB',   // Blue hover
        }
      }
    }
  },
  plugins: []
};
