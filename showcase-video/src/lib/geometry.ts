import { mix } from "./motion";

export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };
export type RoundRect = Rect & { r: number };

export const lerpRect = (a: RoundRect, b: RoundRect, t: number): RoundRect => ({
  x: mix(a.x, b.x, t),
  y: mix(a.y, b.y, t),
  w: mix(a.w, b.w, t),
  h: mix(a.h, b.h, t),
  r: mix(a.r, b.r, t),
});

export const centerOf = (r: Rect): Point => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

/** clip-path that cuts a full-frame layer down to `r`. */
export const insetClip = (r: RoundRect, frameW: number, frameH: number) =>
  `inset(${r.y}px ${frameW - r.x - r.w}px ${frameH - r.y - r.h}px ${r.x}px round ${r.r}px)`;

/**
 * A 2D camera: world point `center` lands on the middle of the frame, scaled
 * by `zoom`. Returns world → screen and the CSS transform for a world layer
 * (transform-origin 0 0).
 */
export function camera(center: Point, zoom: number, frameW: number, frameH: number) {
  const tx = frameW / 2 - center.x * zoom;
  const ty = frameH / 2 - center.y * zoom;
  return {
    toScreen: (p: Point): Point => ({ x: tx + p.x * zoom, y: ty + p.y * zoom }),
    rectToScreen: (r: Rect): Rect => ({ x: tx + r.x * zoom, y: ty + r.y * zoom, w: r.w * zoom, h: r.h * zoom }),
    transform: `translate(${tx}px, ${ty}px) scale(${zoom})`,
    zoom,
  };
}
