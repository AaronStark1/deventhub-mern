// Design tokens for the reel. Brand values mirror the app's own system:
// event-hub-frontend/tailwind.config.cjs and src/index.css.

export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 60;
export const DURATION = 3600;

export const color = {
  // Reel canvas: soft mint with the app's `--formats-tint` highlight.
  canvas: "#EAF2EF",
  canvasHi: "#F2F7F5",
  grid: "rgba(22, 56, 64, 0.035)",

  // App tokens
  bg: "#E6F0EE",
  surface: "#D2E4DF", // footer + navbar ("sage-teal")
  text: "#1F2D2B",
  muted: "#4A6B67",
  primary: "#4FBF9B",
  deep: "#163840",
  night: "#09151B",
  signal: "#7CC2CC",
  signalDim: "#64A6B0",
  logo: "#3E797E",

  hairline: "rgba(22, 56, 64, 0.12)",
  bodyOnDark: "rgba(234, 242, 239, 0.78)",
  specular: "rgba(255, 255, 255, 0.12)",

  // HUD ink on the mint canvas
  hud: "rgba(22, 56, 64, 0.58)",
  hudFaint: "rgba(22, 56, 64, 0.32)",
} as const;

// `shadow-ambient` from tailwind.config.cjs
export const AMBIENT =
  "0 24px 48px -12px rgba(9, 21, 27, 0.35), 0 4px 12px -2px rgba(9, 21, 27, 0.15)";

// The brief's spring: slightly overdamped, settles in ~0.55s at 60fps.
export const SPRING = { damping: 22, stiffness: 120, mass: 0.9 } as const;

// Monospace HUD typography: uppercase, tracking 0.12em.
export const MONO_TRACKING = "0.12em";
