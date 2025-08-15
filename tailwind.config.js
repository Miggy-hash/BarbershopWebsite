// tailwind.config.js
module.exports = {
  content: [
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
