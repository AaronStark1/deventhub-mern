// README media cut from the reel itself.
//
// ReadmeActs: one still per act, frame i = the reel frozen at acts[i].frame.
// It is registered with the reel's full duration because Remotion clamps a
// frozen frame to the composition's length; render it with --frames=0-5.
// ReadmeTeaser: a ~13s cut for an inline GIF. Four excerpts joined with the
// reel's own spotlight wipe; it starts on reel frame 0 and ends on reel frame
// 3599, so it loops through the same match cut as the full reel.
import { AbsoluteFill, Freeze, Sequence, useCurrentFrame } from "remotion";
import { EASE_SOFT, ramp } from "../lib/motion";
import type { Point } from "../lib/geometry";
import { SpotlightWipe } from "../primitives/transitions";
import { Showcase } from "../Showcase";
import { DURATION } from "../theme/tokens";
import media from "./media.json";

export const ReadmeActs = () => (
  <Freeze frame={media.acts[Math.min(useCurrentFrame(), media.acts.length - 1)].frame}>
    <Showcase />
  </Freeze>
);

// 0.8s, eased out: a circle uncovers most of its area late, so an ease-out
// keeps the revealed area per frame roughly even instead of popping.
const WIPE = 48;

// [from, to) in reel frames; `origin` is where the wipe into the cut grows from.
const CUTS: { from: number; to: number; origin: Point }[] = [
  { from: 0, to: 252, origin: { x: 960, y: 540 } }, // grid, badge, tagline
  { from: 2184, to: 2418, origin: { x: 1160, y: 560 } }, // cursor on the Conferences card
  { from: 2808, to: 3096, origin: { x: 960, y: 540 } }, // 1440 → 768 → 390
  { from: 3438, to: DURATION, origin: { x: 960, y: 900 } }, // footer hovers, end card
];

const STARTS = CUTS.reduce<number[]>(
  (acc, c, i) => [...acc, i === 0 ? 0 : acc[i - 1] + (CUTS[i - 1].to - CUTS[i - 1].from) - WIPE],
  []
);

// A multiple of 3, so the 20 fps GIF (every 3rd frame) loops evenly.
export const TEASER_DURATION = STARTS[STARTS.length - 1] + (CUTS[CUTS.length - 1].to - CUTS[CUTS.length - 1].from);

const Cut = ({ index }: { index: number }) => {
  const frame = useCurrentFrame();
  const cut = CUTS[index];
  const reel = (
    <Sequence from={-cut.from} layout="none">
      <Showcase />
    </Sequence>
  );
  if (index === 0) return <AbsoluteFill>{reel}</AbsoluteFill>;
  return (
    <AbsoluteFill>
      <SpotlightWipe progress={ramp(frame, 0, WIPE, EASE_SOFT)} origin={cut.origin}>
        <AbsoluteFill>{reel}</AbsoluteFill>
      </SpotlightWipe>
    </AbsoluteFill>
  );
};

export const ReadmeTeaser = () => (
  <AbsoluteFill>
    {CUTS.map((cut, i) => (
      <Sequence key={cut.from} from={STARTS[i]} durationInFrames={cut.to - cut.from} name={`Reel ${cut.from}–${cut.to}`}>
        <Cut index={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
