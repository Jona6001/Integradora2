/* filepath: c:\Users\thinkpad\Desktop\integradora2\front\tailwind.config.js */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
        wood: ["Playfair Display", "serif"],
      },
      colors: {
        // Colores amaderados principales
        primary: "#8B4513", // Marrón silla de montar
        secondary: "#A0522D", // Marrón siena
        accent: "#D2691E", // Chocolate
        
        // Tonos de madera
        wood: {
          50: "#FDF6E3",   // Crema muy claro
          100: "#F5E6D3",  // Beige muy claro
          200: "#DEB887",  // Madera clara
          300: "#CD853F",  // Madera media
          400: "#D2691E",  // Chocolate
          500: "#A0522D",  // Marrón siena
          600: "#8B4513",  // Marrón silla de montar
          700: "#654321",  // Marrón oscuro
          800: "#4E342E",  // Marrón muy oscuro
          900: "#3E2723",  // Marrón casi negro
        },
        
        // Colores complementarios
        cream: {
          50: "#FFFEF7",
          100: "#FDF6E3",
          200: "#F5E6D3",
          300: "#E8D5B7",
          400: "#D7C498",
          500: "#C4B078",
          600: "#A0875F",
          700: "#7C6A47",
          800: "#5A4D33",
          900: "#3A3020",
        },
        
        // Grises cálidos
        warmGray: {
          50: "#FAF9F7",
          100: "#F3F2F0",
          200: "#E8E6E1",
          300: "#D3CFC7",
          400: "#B8B2A7",
          500: "#9C9486",
          600: "#807A6F",
          700: "#666059",
          800: "#4D4741",
          900: "#36322E",
        },
      },
      
      backgroundImage: {
        'wood-grain': "repeating-linear-gradient(90deg, rgba(139, 69, 19, 0.03) 0px, rgba(139, 69, 19, 0.03) 1px, transparent 1px, transparent 4px)",
        'wood-texture': "linear-gradient(45deg, rgba(139, 69, 19, 0.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(139, 69, 19, 0.05) 25%, transparent 25%)",
        'wood-gradient': "linear-gradient(135deg, #DEB887 0%, #CD853F 50%, #8B4513 100%)",
        'wood-dark-gradient': "linear-gradient(135deg, #6D4C41 0%, #4E342E 50%, #3E2723 100%)",
      },
      
      boxShadow: {
        'wood': '0 4px 6px -1px rgba(139, 69, 19, 0.1), 0 2px 4px -1px rgba(139, 69, 19, 0.06)',
        'wood-lg': '0 10px 15px -3px rgba(139, 69, 19, 0.1), 0 4px 6px -2px rgba(139, 69, 19, 0.05)',
        'wood-xl': '0 20px 25px -5px rgba(139, 69, 19, 0.1), 0 10px 10px -5px rgba(139, 69, 19, 0.04)',
        'wood-2xl': '0 25px 50px -12px rgba(139, 69, 19, 0.25)',
        'wood-inner': 'inset 0 2px 4px 0 rgba(139, 69, 19, 0.06)',
      },
      
      animation: {
        'wood-float': 'wood-float 4s ease-in-out infinite',
        'wood-glow': 'wood-glow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      
      keyframes: {
        'wood-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'wood-glow': {
          '0%, 100%': { boxShadow: '0 4px 6px -1px rgba(139, 69, 19, 0.1)' },
          '50%': { boxShadow: '0 10px 15px -3px rgba(139, 69, 19, 0.2)' },
        },
      },
      
      borderRadius: {
        'wood': '12px',
        'wood-lg': '16px',
        'wood-xl': '20px',
      },
      
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          lg: "4rem",
          xl: "5rem",
          "2xl": "6rem",
        },
      },
    },
  },
  plugins: [],
};