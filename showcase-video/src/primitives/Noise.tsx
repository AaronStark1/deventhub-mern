import type { CSSProperties } from "react";

// The exact fractal-noise tile from `.format-card__noise` in the app's
// index.css (feTurbulence, baseFrequency 0.8, 3 octaves, desaturated).
export const NOISE_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export const Noise = ({ opacity = 0.025, size = 200, style }: { opacity?: number; size?: number; style?: CSSProperties }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      opacity,
      backgroundImage: NOISE_URL,
      backgroundSize: `${size}px ${size}px`,
      ...style,
    }}
  />
);

// Specular highlight along a surface's top border (`.format-card__edge`).
export const SpecularEdge = ({ opacity = 0.45, tint = "rgba(255, 255, 255, 0.34)" }: { opacity?: number; tint?: string }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: "8%",
      right: "8%",
      height: 1,
      pointerEvents: "none",
      background: `linear-gradient(90deg, transparent, ${tint}, transparent)`,
      opacity,
    }}
  />
);
