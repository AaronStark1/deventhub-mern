import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE_EXIT, ramp } from "../lib/motion";
import { fonts } from "../theme/fonts";
import { color, DURATION, MONO_TRACKING } from "../theme/tokens";
import { ACTS, LOOP_OUT } from "../timeline";

const pad = (n: number, w = 2) => String(n).padStart(w, "0");

const timecode = (frame: number, fps: number) => {
  const s = Math.floor(frame / fps);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(frame % fps)}`;
};

const label = {
  position: "absolute",
  padding: "5px 9px",
  margin: "-5px -9px",
  borderRadius: 6,
  background: "rgba(234, 242, 239, 0.82)",
  backdropFilter: "blur(8px)",
  fontFamily: fonts.mono,
  fontSize: 14,
  lineHeight: "18px",
  letterSpacing: MONO_TRACKING,
  textTransform: "uppercase",
  color: color.hud,
  whiteSpace: "nowrap",
} as const;

const CropMark = ({ x, y, flipX, flipY }: { x: number; y: number; flipX?: boolean; flipY?: boolean }) => (
  <svg
    width={16}
    height={16}
    style={{ position: "absolute", left: x, top: y, transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})` }}
  >
    <path d="M0.5 16 V0.5 H16" fill="none" stroke={color.hudFaint} strokeWidth={1} />
  </svg>
);

/** Corner metadata: brand, frame rate, running timecode, act index. */
export const Hud = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const visible = Math.min(ramp(frame, 30, 40), 1 - ramp(frame, LOOP_OUT.from - 10, 30, EASE_EXIT));
  const actIndex = Math.max(0, ACTS.findIndex((a) => frame >= a.from && frame < a.to));
  const act = ACTS[actIndex];
  const prev = actIndex > 0 ? ACTS[actIndex - 1] : null;
  const roll = ramp(frame, act.from, 22);
  // Chip hugs the label: ~10.1px per 14px mono glyph at 0.12em, plus padding.
  const chipWidth = (a: (typeof ACTS)[number]) => `${pad(a.n)} / 06 — ${a.label}`.length * 10.1 + 18;
  const actChip = prev && roll < 1 ? chipWidth(prev) + (chipWidth(act) - chipWidth(prev)) * roll : chipWidth(act);

  return (
    <AbsoluteFill style={{ opacity: visible, pointerEvents: "none" }}>
      <CropMark x={28} y={28} />
      <CropMark x={width - 44} y={28} flipX />
      <CropMark x={28} y={height - 44} flipY />
      <CropMark x={width - 44} y={height - 44} flipX flipY />

      <div style={{ ...label, left: 60, top: 44 }}>
        <span style={{ color: color.deep, fontWeight: 500 }}>DEVentHub</span>
        <span style={{ color: color.hudFaint }}>{"  ·  "}Showcase reel</span>
      </div>
      <div style={{ ...label, right: 60, top: 44 }}>
        60 fps <span style={{ color: color.signalDim }}>//</span> 1920 × 1080
      </div>
      <div style={{ ...label, left: 60, bottom: 44, fontVariantNumeric: "tabular-nums" }}>
        <span style={{ color: color.hudFaint }}>TC </span>
        {timecode(frame, fps)}
      </div>

      {/* Act index: the old label rolls up and out as the new one rolls in */}
      <div style={{ ...label, right: 60, bottom: 44, width: actChip, height: 28, overflow: "hidden" }}>
        {prev && roll < 1 ? (
          <div style={{ position: "absolute", right: 9, top: 5, translate: `0 ${-18 * roll}px`, opacity: 1 - roll }}>
            {pad(prev.n)} / 06 <span style={{ color: color.signalDim }}>—</span> {prev.label}
          </div>
        ) : null}
        <div
          style={{
            position: "absolute",
            right: 9,
            top: 5,
            translate: `0 ${prev ? 18 * (1 - roll) : 0}px`,
            opacity: prev ? roll : 1,
          }}
        >
          {pad(act.n)} / 06 <span style={{ color: color.signalDim }}>—</span> {act.label}
        </div>
      </div>

      {/* Overall progress hairline, under the act index */}
      <div style={{ position: "absolute", right: 60, bottom: 32, width: 168, height: 1, background: color.hairline }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: color.signalDim,
            transformOrigin: "left center",
            scale: `${frame / (DURATION - 1)} 1`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
