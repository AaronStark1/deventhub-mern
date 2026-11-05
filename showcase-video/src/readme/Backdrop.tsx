// Static version of the reel's stage for README stills: the app's
// `.formats-backdrop` (tint highlight + 1px grid under a radial mask), at any
// size, in the light or dark theme.
import type { CSSProperties, ReactNode } from "react";
import { color } from "../theme/tokens";

export type Theme = "light" | "dark";

// Light values are the reel's canvas; dark values are the app's `.dark`
// tokens (tailwind.config.cjs `bg-dark`, index.css `--formats-tint/-grid`).
export const THEMES = {
  light: {
    bg: color.canvas,
    tint: color.canvasHi,
    grid: color.grid,
    ink: color.deep,
    body: color.muted,
    eyebrow: color.hud,
    accent: color.signalDim,
    hairline: color.hairline,
  },
  dark: {
    bg: "#10242b",
    tint: "rgba(36, 80, 85, 0.45)",
    grid: "rgba(207, 231, 226, 0.035)",
    ink: "#CFE7E2",
    body: "#7FA6A0",
    eyebrow: color.signal,
    accent: color.signal,
    hairline: "rgba(207, 231, 226, 0.12)",
  },
} as const;

const MASK = "radial-gradient(ellipse 85% 80% at 50% 45%, #000 40%, transparent 100%)";

export const Backdrop = ({
  width,
  height,
  theme = "light",
  cell = 60,
  radius = 0,
  children,
  style,
}: {
  width: number;
  height: number;
  theme?: Theme;
  cell?: number;
  radius?: number;
  children?: ReactNode;
  style?: CSSProperties;
}) => {
  const t = THEMES[theme];
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height,
        overflow: "hidden",
        borderRadius: radius,
        background: `radial-gradient(ellipse 70% 80% at 50% 0%, ${t.tint}, transparent 72%), ${t.bg}`,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${t.grid} 1px, transparent 1px), linear-gradient(90deg, ${t.grid} 1px, transparent 1px)`,
          backgroundSize: `${cell}px ${cell}px`,
          backgroundPosition: "-0.5px -0.5px",
          WebkitMaskImage: MASK,
          maskImage: MASK,
        }}
      />
      {children}
    </div>
  );
};
