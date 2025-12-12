/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx,js,jsx,tsx}",
    "./src/components/**/*.{ts,tsx,js,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Your Existing Colors ---
        crest: {
          50: "#fff9f6",
          100: "#fff1ec",
          200: "#ffd9c8",
          300: "#ffb996",
          400: "#ff8a63",
          500: "#ff6a2e",
          600: "#e05b27",
          700: "#b7461f",
          800: "#8a3518",
          900: "#65260f",
        },
        neutral: {
          50: "#fbfbfb",
          100: "#f5f5f6",
          200: "#eaeaea",
          300: "#d9d9d9",
          400: "#bdbdbd",
          500: "#8f8f8f",
          600: "#6b6b6b",
          700: "#444444",
          800: "#2b2b2b",
        },
        // --- New Design Specific Colors (Matches PDF) ---
        'cc-black': '#000000',
        'cc-gray': '#F2F0F1', // The specific light background from the mockup
        'cc-dark-gray': '#666666', 
        'cc-red': '#FF3333',   // For discount tags
      },
      fontFamily: {
        // We keep your existing fonts but map them so the new design picks them up
        sans: ["Inter", "sans-serif", "Satoshi"],
        display: ["'Playfair Display'", "serif", "Integral CF"],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          lg: "2rem",
          xl: "4rem",
        },
      },
      boxShadow: {
        card: "0 4px 18px rgba(16,24,40,0.08)",
      },
      borderRadius: {
        xl: "1rem",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};