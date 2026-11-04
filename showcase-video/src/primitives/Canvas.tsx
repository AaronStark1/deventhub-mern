import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EASE_EXIT, EASE_SOFT, ramp } from "../lib/motion";
import { color, HEIGHT, WIDTH } from "../theme/tokens";
import { LOOP_OUT } from "../timeline";

// 60px cells divide 1920×1080 exactly (32 × 18).
const CELL = 60;
const XS = Array.from({ length: WIDTH / CELL - 1 }, (_, i) => (i + 1) * CELL);
const YS = Array.from({ length: HEIGHT / CELL - 1 }, (_, i) => (i + 1) * CELL);

// Same falloff as the app's `.formats-backdrop::before` grid mask.
const MASK = "radial-gradient(ellipse 85% 80% at 50% 45%, #000 40%, transparent 100%)";

/**
 * The mint stage and its 1px architectural grid. Lines draw in from the top
 * and left at the open; at the loop seam they retract in the same direction,
 * so the sweep carries straight across the cut back to frame 0.
 */
export const Canvas = () => {
  const frame = useCurrentFrame();

  const span = (i: number, length: number) => {
    const grow = ramp(frame, 4 + i * 1.6, 54, EASE_SOFT);
    const shrink = ramp(frame, LOOP_OUT.from + i * 0.4, 24, EASE_EXIT);
    return [length * shrink, length * grow] as const;
  };

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 70% 640px at 50% 0%, ${color.canvasHi}, transparent 72%), ${color.canvas}`,
      }}
    >
      <svg
        width={WIDTH}
        height={HEIGHT}
        style={{ position: "absolute", inset: 0, WebkitMaskImage: MASK, maskImage: MASK }}
      >
        {XS.map((x, i) => {
          const [a, b] = span(i, HEIGHT);
          return b > a ? (
            <line key={`x${x}`} x1={x + 0.5} x2={x + 0.5} y1={a} y2={b} stroke={color.grid} strokeWidth={1} />
          ) : null;
        })}
        {YS.map((y, i) => {
          const [a, b] = span(i * 1.5, WIDTH);
          return b > a ? (
            <line key={`y${y}`} y1={y + 0.5} y2={y + 0.5} x1={a} x2={b} stroke={color.grid} strokeWidth={1} />
          ) : null;
        })}
      </svg>
    </AbsoluteFill>
  );
};
