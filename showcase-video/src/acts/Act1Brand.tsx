// ACT 1 · 0:00–0:08 · Architectural brand intro.
// The grid draws itself (global Canvas), the badge springs in under a
// cyan-teal bloom, the tagline rises word by word and tightens to −0.03em,
// then everything but the badge clears for the morph into Act 2.
import { useCurrentFrame, useVideoConfig } from "remotion";
import { BrandLockup, WORD_COUNT } from "../app/BrandLockup";
import { EASE_EXIT, ramp, springAt } from "../lib/motion";

export const Act1Brand = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = Array.from({ length: WORD_COUNT }, (_, i) => ({
    enter: springAt(frame, fps, 112 + i * 7),
    exit: ramp(frame, 404 + i * 4, 30, EASE_EXIT),
  }));

  return (
    <BrandLockup
      s={{
        glow: ramp(frame, 34, 80) * (1 - ramp(frame, 418, 56, EASE_EXIT)),
        breathe: Math.sin(frame / 38),
        badge: springAt(frame, fps, 40),
        eyebrowChars: Math.floor((frame - 92) / 2),
        eyebrowOpacity: 1 - ramp(frame, 398, 28, EASE_EXIT),
        words,
        hairline: ramp(frame, 178, 64),
        hairlineOut: ramp(frame, 398, 40, EASE_EXIT),
        rowChars: Math.floor((frame - 206) * 1.4),
        rowOpacity: 1 - ramp(frame, 398, 28, EASE_EXIT),
        // A glint walks across the four formats: a preview of Act 3.
        glint: frame >= 300 && frame < 400 ? (frame - 300) / 24 : -9,
      }}
    />
  );
};
