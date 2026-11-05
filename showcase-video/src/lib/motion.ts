import { Easing, interpolate, interpolateColors, spring } from "remotion";
import { SPRING } from "../theme/tokens";

// The app's one easing curve for interactive states (`--ease-soft`).
export const EASE_SOFT = Easing.bezier(0.22, 1, 0.36, 1);
// Camera moves that start from rest: gentle in, long soft landing.
export const EASE_GLIDE = Easing.bezier(0.45, 0, 0.15, 1);
// Exits: accelerate away.
export const EASE_EXIT = Easing.bezier(0.55, 0, 1, 0.45);
// Opacity fades for overlays: in-out, so a large outline never jumps on the
// first frame the way an ease-out does.
export const EASE_FADE = Easing.bezier(0.4, 0, 0.2, 1);

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** 0 → 1 over [start, start + duration]. */
export const ramp = (
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = EASE_SOFT
) => interpolate(frame, [start, start + duration], [0, 1], { ...CLAMP, easing });

/** 0 → 1 in, hold, 1 → 0 out. */
export const pulse = (frame: number, inStart: number, inDur: number, outStart: number, outDur: number) =>
  Math.min(ramp(frame, inStart, inDur), 1 - ramp(frame, outStart, outDur, EASE_EXIT));

/** The brief's spring (damping 22, stiffness 120, mass 0.9), optionally stretched to `duration`. */
export const springAt = (frame: number, fps: number, start: number, duration?: number) =>
  spring({ frame: frame - start, fps, config: SPRING, durationInFrames: duration });

/** A spring with arbitrary physics, e.g. the app's own motion springs. */
export const springWith = (
  frame: number,
  fps: number,
  start: number,
  config: { stiffness: number; damping: number; mass?: number }
) => spring({ frame: frame - start, fps, config: { mass: 1, ...config } });

/** Piecewise keyframes [[frame, value], …] with one easing per segment. */
export function track(
  frame: number,
  keys: readonly (readonly [number, number])[],
  easing: (t: number) => number = EASE_GLIDE
): number {
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f0, v0] = keys[i - 1];
    const [f1, v1] = keys[i];
    if (frame <= f1) return f1 === f0 ? v1 : mix(v0, v1, easing((frame - f0) / (f1 - f0)));
  }
  return keys[keys.length - 1][1];
}

/**
 * A CSS-style hover transition: eases towards 1 from `enter`, back towards 0
 * from `leave`, starting from wherever the value was (like a reversed
 * transition in the browser).
 */
export function hover(frame: number, enter: number, leave: number | null, duration: number) {
  const towardsOne = ramp(frame, enter, duration);
  if (leave === null || frame < leave) return towardsOne;
  return ramp(leave, enter, duration) * (1 - ramp(frame, leave, duration));
}

export const mixColor = (a: string, b: string, t: number) =>
  interpolateColors(clamp(t), [0, 1], [a, b]);

/**
 * A CSS transition replayed from a per-frame boolean (e.g. "cursor is over
 * this element"): whenever the target flips, a new `duration`-frame eased
 * transition starts from the current value, as a browser would.
 */
export function cssTransition(
  inside: readonly boolean[],
  frame: number,
  duration: number,
  easing: (t: number) => number = EASE_SOFT
): number {
  let from = 0;
  let to = 0;
  let start = -Infinity;
  const valueAt = (f: number) => (start === -Infinity ? to : from + (to - from) * easing(clamp((f - start) / duration)));
  const last = Math.min(frame, inside.length - 1);
  for (let f = 0; f <= last; f++) {
    const target = inside[f] ? 1 : 0;
    if (target !== to) {
      from = valueAt(f);
      to = target;
      start = f;
    }
  }
  return valueAt(frame);
}

/**
 * The brief's spring, stretched to `duration` frames and normalised so it
 * lands exactly on 1 at the end (a stretched spring stops ~0.5% short).
 * Use where one representation hands over to another on that frame.
 */
export const springExact = (frame: number, fps: number, start: number, duration: number) => {
  if (frame >= start + duration) return 1;
  const end = springAt(start + duration, fps, start, duration);
  return Math.min(1, springAt(frame, fps, start, duration) / end);
};
