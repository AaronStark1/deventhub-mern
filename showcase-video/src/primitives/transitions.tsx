// The reel's three transition primitives. All are pure functions of a
// 0 → 1 progress, so any act can drive them with a spring or an eased ramp.
import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { insetClip, lerpRect, type Point, type RoundRect } from "../lib/geometry";
import { clamp, mix } from "../lib/motion";
import { HEIGHT, WIDTH } from "../theme/tokens";
import { FRAME_SHADOW } from "./BrowserFrame";

/**
 * 1. Spotlight wipe — the next scene is revealed through a soft-edged circle
 * that grows from `origin`, ringed by a cyan-teal glow at its edge (the same
 * rgba(124,194,204) as the cards' cursor spotlight). Coordinates are local to
 * the wrapping box (`width` × `height`).
 */
export const SpotlightWipe = ({
  progress,
  origin,
  width = WIDTH,
  height = HEIGHT,
  feather = 110,
  children,
}: {
  progress: number;
  origin: Point;
  width?: number;
  height?: number;
  feather?: number;
  children: ReactNode;
}) => {
  if (progress <= 0) return null;
  const far = Math.max(
    Math.hypot(origin.x, origin.y),
    Math.hypot(width - origin.x, origin.y),
    Math.hypot(origin.x, height - origin.y),
    Math.hypot(width - origin.x, height - origin.y)
  );
  const r = progress * (far + feather);
  const inner = Math.max(0, r - feather);
  const at = `circle at ${origin.x}px ${origin.y}px`;
  const mask = `radial-gradient(${at}, #000 ${inner}px, transparent ${r}px)`;
  const glow = Math.min(1, progress * 5) * Math.pow(1 - progress, 0.7);

  return (
    <>
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: mask, maskImage: mask }}>{children}</div>
      {progress < 1 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: glow,
            background: `radial-gradient(${at},
              rgba(124, 194, 204, 0) ${Math.max(0, inner - 90)}px,
              rgba(124, 194, 204, 0.5) ${mix(inner, r, 0.55)}px,
              rgba(124, 194, 204, 0) ${r + 50}px)`,
          }}
        />
      ) : null}
    </>
  );
};

/**
 * 2. Shared-element card morph — `children`, laid out at the `to` rect's
 * size, are seen through a rounded window that travels from `from` (a badge,
 * a card bezel) to `to`, scaling with it (cover fit). The drop shadow rides
 * on the window, outside the clip.
 */
export const MorphClip = ({
  from,
  to,
  progress,
  children,
  shadow = FRAME_SHADOW,
  shadowOpacity = 1,
}: {
  from: RoundRect;
  to: RoundRect;
  progress: number;
  children: ReactNode;
  shadow?: string | null;
  shadowOpacity?: number;
}) => {
  const cur = lerpRect(from, to, clamp(progress, 0, 1.2));
  const k = Math.max(cur.w / to.w, cur.h / to.h);
  const offX = cur.x + cur.w / 2 - (to.w * k) / 2;
  const offY = cur.y + cur.h / 2 - (to.h * k) / 2;
  return (
    <AbsoluteFill>
      {shadow ? (
        <div
          style={{
            position: "absolute",
            left: cur.x,
            top: cur.y,
            width: cur.w,
            height: cur.h,
            borderRadius: cur.r,
            boxShadow: shadow,
            opacity: shadowOpacity,
          }}
        />
      ) : null}
      <AbsoluteFill style={{ clipPath: insetClip(cur, WIDTH, HEIGHT) }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: to.w,
            height: to.h,
            transformOrigin: "0 0",
            transform: `translate(${offX}px, ${offY}px) scale(${k})`,
          }}
        >
          {children}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** The rect a MorphClip window currently occupies (for overlays that follow it). */
export const morphRect = (from: RoundRect, to: RoundRect, progress: number) => lerpRect(from, to, progress);

/**
 * 3. Z-space depth for a layer at `z` (px towards the camera, perspective
 * `p`): scale, depth-of-field blur and fade as it approaches and passes the
 * lens. Use with a parent that has `perspective`, or standalone (2D scale).
 */
export const zDepth = (z: number, { focus = 0, blurPerPx = 0.016, fadeFrom = 650, fadeTo = 1150 } = {}) => ({
  blur: Math.max(0, Math.abs(z - focus) * blurPerPx),
  opacity: 1 - clamp((z - fadeFrom) / (fadeTo - fadeFrom)),
});
