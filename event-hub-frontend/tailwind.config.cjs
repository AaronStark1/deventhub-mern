// CommonJS (the package is "type": "module") so `require` works here.
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* LIGHT THEME */
        bg: "#E6F0EE",          // pale teal background
        surface: "#D2E4DF",     // cards / sections
        text: "#1F2D2B",        // main text
        muted: "#4A6B67",       // secondary text

        /* DARK THEME */
        "bg-dark": "#10242b",       // firefly
        "surface-dark": "#245055",  // elevated surfaces
        "text-dark": "#CFE7E2",     // soft mint text
        "muted-dark": "#7FA6A0",    // muted text

        /* ACCENT */
        primary: "#4FBF9B",     // mint accent
        "primary-dark": "#8FE3C3",
      },
    },
  },
  plugins: [require("lightswind/plugin")],
};
