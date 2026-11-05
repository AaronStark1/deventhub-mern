// CommonJS (the package is "type": "module") so `require` works here.
const defaultTheme = require("tailwindcss/defaultTheme");

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

        /* DEEP SURFACES — the dark "format" cards */
        deep: "#163840",        // dark teal (card gradient start, hairlines)
        night: "#09151B",       // midnight slate (card gradient end, shadows)
        signal: "#7CC2CC",      // monospace accents on deep surfaces
      },
      fontFamily: {
        // Body copy everywhere; Syne is reserved for display headings.
        sans: ["Geist", ...defaultTheme.fontFamily.sans],
        display: ["Syne", "Geist", ...defaultTheme.fontFamily.sans],
        mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
      },
      transitionTimingFunction: {
        // The one easing curve for interactive states. Mirrors --ease-soft.
        soft: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      boxShadow: {
        ambient:
          "0 24px 48px -12px rgba(9, 21, 27, 0.35), 0 4px 12px -2px rgba(9, 21, 27, 0.15)",
      },
    },
  },
  plugins: [require("lightswind/plugin")],
};
