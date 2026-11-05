// Shared stage geometry: where the browser frame sits, and how page
// coordinates (1440-wide CSS px) map into it.
import type { Point, Rect, RoundRect } from "../lib/geometry";
import { frameContent } from "../primitives/BrowserFrame";

/** The main browser frame: a 1440 × 900 viewport at 0.9333 inside a 1360 × 892 surface. */
export const FRAME: RoundRect = { x: 280, y: 94, w: 1360, h: 892, r: 22 };
export const CONTENT = (() => {
  const c = frameContent(FRAME.w, FRAME.h);
  return { x: FRAME.x + c.x, y: FRAME.y + c.y, w: c.w, h: c.h };
})();
export const PAGE_SCALE = CONTENT.w / 1440;
export const VIEWPORT = { w: 1440, h: 900 };

/** Page point → screen point for a page scrolled by `scroll` in the main frame. */
export const pageToScreen = (p: Point, scroll = 0): Point => ({
  x: CONTENT.x + p.x * PAGE_SCALE,
  y: CONTENT.y + (p.y - scroll) * PAGE_SCALE,
});

export const pageRectToScreen = (r: Rect, scroll = 0, pad = 0): Rect => {
  const tl = pageToScreen({ x: r.x - pad, y: r.y - pad }, scroll);
  return { x: tl.x, y: tl.y, w: (r.w + pad * 2) * PAGE_SCALE, h: (r.h + pad * 2) * PAGE_SCALE };
};

export const unionRect = (a: Rect, b: Rect): Rect => {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
};
