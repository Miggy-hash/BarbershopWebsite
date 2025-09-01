// tailwind.config.js
export default {
  content: [
    "./src/**/*.{vue,js,ts}", 
    "./templates/**/*.html", // adjust to your actual paths
    "./static/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        faustina: ['Faustina', 'serif'],
      },
    },
  },
  plugins: [],
};
