// Rebuild of the hero line "Host and attend [Meetups]" (LandingPage.jsx +
// RotatingText.jsx). Same words, same 2.8s cadence, same spring
// (stiffness 180, damping 20), per-character exit to −120% then enter from
// 120%, and the pill's width easing between words like motion's `layout`.
import { mix, springWith } from "../lib/motion";
import { rectOf, rotating } from "../lib/captures";
import { fonts } from "../theme/fonts";

export const WORDS = ["Meetups", "Hackathons", "Workshops", "Bootcamps"] as const;
export const ROTATION_INTERVAL = 168; // 2800ms at 60fps
const EXIT = 30; // AnimatePresence "wait": exit settles before the next word mounts
const SPRING = { stiffness: 180, damping: 20 };

const Word = ({ text, y, opacity }: { text: string; y: number; opacity: number }) => (
  <span style={{ display: "inline-flex", overflow: "hidden" }}>
    {[...text].map((ch, i) => (
      <span key={i} style={{ display: "inline-block", translate: `0 ${y}%`, opacity }}>
        {ch}
      </span>
    ))}
  </span>
);

/**
 * Hero-local coordinates (the hero section's top-left is 0,0).
 * `rotations` are the frames at which a swap starts.
 */
export const RotatingLine = ({
  frame,
  fps,
  rotations,
  heroTop,
}: {
  frame: number;
  fps: number;
  rotations: number[];
  heroTop: number;
}) => {
  const line = rectOf("hero-solid", "rotatingLine");
  const lead = rectOf("hero-solid", "rotatingLead");
  const gap = parseFloat(rotating.gap);
  const width = (w: string) => rotating.widths[w];

  const done = rotations.filter((r) => frame >= r).length;
  const start = done > 0 ? rotations[done - 1] : -Infinity;
  const prevWord = WORDS[(done + WORDS.length - 1) % WORDS.length];
  const word = WORDS[done % WORDS.length];

  let content;
  let pillWidth = width(word);
  if (done === 0) {
    content = <Word text={word} y={0} opacity={1} />;
  } else if (frame < start + EXIT) {
    const p = springWith(frame, fps, start, SPRING);
    content = <Word text={prevWord} y={-120 * p} opacity={Math.max(0, 1 - p)} />;
    pillWidth = width(prevWord);
  } else {
    const p = springWith(frame, fps, start + EXIT, SPRING);
    content = <Word text={word} y={120 * (1 - p)} opacity={Math.min(1, Math.max(0, p))} />;
    pillWidth = mix(width(prevWord), width(word), p);
  }

  const total = lead.w + gap + pillWidth;
  const left = line.x + line.w / 2 - total / 2;
  const top = line.y - heroTop;
  const pill = rotating.pill;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left,
          top: top + (line.h - lead.h) / 2,
          fontFamily: fonts.sans,
          fontSize: 30,
          lineHeight: "36px",
          fontWeight: 600,
          color: "rgba(255, 255, 255, 0.8)",
          whiteSpace: "nowrap",
        }}
      >
        Host and attend
      </div>
      <div
        style={{
          position: "absolute",
          left: left + lead.w + gap,
          top,
          width: pillWidth,
          height: line.h,
          display: "flex",
          alignItems: "center",
          padding: `0 ${pill.paddingLeft}`,
          borderRadius: pill.borderRadius,
          background: pill.backgroundColor,
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          fontFamily: fonts.sans,
          fontSize: 30,
          lineHeight: "36px",
          fontWeight: 700,
          color: pill.color,
          whiteSpace: "pre",
          overflow: "hidden",
        }}
      >
        {content}
      </div>
    </>
  );
};
