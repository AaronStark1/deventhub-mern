// One source of truth for when things happen (60fps).

export const ACTS = [
  { n: 1, label: "BRAND", from: 0, to: 480 },
  { n: 2, label: "PLATFORM", from: 480, to: 1200 },
  { n: 3, label: "FORMATS", from: 1200, to: 2160 },
  { n: 4, label: "INTERACTION", from: 2160, to: 2760 },
  { n: 5, label: "RESPONSIVE", from: 2760, to: 3180 },
  { n: 6, label: "FOOTER", from: 3180, to: 3600 },
] as const;

// Sequence windows. Every act owns the transition into it, except the
// Z-space push: Act 2's route cards fly past the camera while Act 3 scales
// in underneath, so those two overlap by 60 frames.
export const SEQ = {
  act1: { from: 0, durationInFrames: 480 },
  act2: { from: 480, durationInFrames: 750 }, // to 1230
  act3: { from: 1170, durationInFrames: 990 }, // to 2160
  act4: { from: 2160, durationInFrames: 600 },
  act5: { from: 2760, durationInFrames: 420 },
  act6: { from: 3180, durationInFrames: 420 },
} as const;

// Loop seam: the last frames retract to the bare canvas Act 1 opens on.
export const LOOP_OUT = { from: 3556, duration: 36 };
