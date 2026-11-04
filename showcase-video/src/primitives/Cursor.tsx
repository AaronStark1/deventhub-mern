import type { Point } from "../lib/geometry";
import { clamp, EASE_SOFT, mix } from "../lib/motion";
import { color } from "../theme/tokens";

// Pointer art in a 32×32 box; the tip sits at TIP.
const ARROW = "M5 3 L5 26.5 L10.6 21.1 L14.4 30 L18.6 28.2 L14.9 19.6 L22.8 19.6 Z";
const HAND =
  "M11.2 4.6c0-1.3 1-2.3 2.2-2.3s2.2 1 2.2 2.3v8.1c.3-.9 1.1-1.5 2.1-1.5 1.2 0 2.1.9 2.1 2.1v.7c.4-.7 1.1-1.1 1.9-1.1 1.2 0 2.1.9 2.1 2.1v1c.4-.6 1-.9 1.7-.9 1.2 0 2.1.9 2.1 2.1v6.6c0 4.9-3.6 8.4-8.4 8.4h-2.3c-2.5 0-4.4-1-6-2.9l-4.9-6.1c-.8-1-.7-2.4.3-3.2.9-.7 2.2-.7 3 .2l2 2.3z";
const TIP = { arrow: { x: 5, y: 3 }, hand: { x: 13.4, y: 2.3 } };

export type CursorKind = "arrow" | "hand";

/**
 * A system-style pointer. `press` (0→1) dips it on click; `clickAge` is
 * frames since the last click and drives a soft cyan ripple at the tip.
 */
export const Cursor = ({
  at,
  kind = "arrow",
  press = 0,
  clickAge = Infinity,
  opacity = 1,
  size = 1.25,
}: {
  at: Point;
  kind?: CursorKind;
  press?: number;
  clickAge?: number;
  opacity?: number;
  size?: number;
}) => {
  if (opacity <= 0) return null;
  const tip = TIP[kind];
  const s = size * mix(1, 0.86, press);
  const ripple = clamp(clickAge / 26);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity }}>
      {clickAge >= 0 && clickAge < 26 ? (
        <div
          style={{
            position: "absolute",
            left: at.x,
            top: at.y,
            width: 0,
            height: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -36,
              top: -36,
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: `2px solid ${color.signal}`,
              background: "rgba(124, 194, 204, 0.12)",
              scale: `${mix(0.2, 1, EASE_SOFT(ripple))}`,
              opacity: 1 - ripple,
            }}
          />
        </div>
      ) : null}
      <svg
        width={32}
        height={32}
        viewBox="0 0 32 32"
        style={{
          position: "absolute",
          left: at.x - tip.x,
          top: at.y - tip.y,
          overflow: "visible",
          transformOrigin: `${tip.x}px ${tip.y}px`,
          scale: `${s}`,
          filter: "drop-shadow(0 2px 3px rgba(9, 21, 27, 0.35))",
        }}
      >
        <path
          d={kind === "arrow" ? ARROW : HAND}
          fill={kind === "arrow" ? "#0B1114" : "#FFFFFF"}
          stroke={kind === "arrow" ? "#FFFFFF" : "#0B1114"}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

type Key = { f: number; x: number; y: number };

/**
 * Cursor path through timed waypoints. Each leg eases in and out and bows
 * slightly off the straight line, like a hand moving a mouse.
 */
export function cursorPath(frame: number, keys: Key[], bow = 0.08): Point {
  if (frame <= keys[0].f) return { x: keys[0].x, y: keys[0].y };
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (frame <= b.f) {
      const raw = (frame - a.f) / Math.max(1, b.f - a.f);
      const t = EASE_SOFT(clamp(raw)) * 0.35 + easeInOut(clamp(raw)) * 0.65;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const arc = Math.sin(Math.PI * t) * bow;
      return { x: a.x + dx * t - dy * arc, y: a.y + dy * t + dx * arc };
    }
  }
  const last = keys[keys.length - 1];
  return { x: last.x, y: last.y };
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
