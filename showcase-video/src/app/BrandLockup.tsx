// The brand lockup that opens the reel (Act 1) and closes it (Act 6): logo
// badge, monospace eyebrow, kinetic tagline, hairline and format index.
// Both acts drive the same component, so the end card lands on exactly the
// composition the open builds — the loop's match cut.
import type { RoundRect } from "../lib/geometry";
import { clamp, mix } from "../lib/motion";
import { fonts } from "../theme/fonts";
import { color, MONO_TRACKING } from "../theme/tokens";
import { LogoTile } from "./LogoTile";

export const BADGE: RoundRect = { x: 240, y: 240, w: 120, h: 120, r: 25 };
const LEFT = 240;
const RIGHT = 1680;
const EYEBROW_Y = 420;
const TAGLINE_Y = 452;
const SIZE = 100;
const LINE = 108;
const HAIRLINE_Y = 720;
const ROW_Y = 744;

export const TAGLINE = [["Connecting", "developers"], ["through", "meaningful", "events."]] as const;
export const WORD_COUNT = 5;
const FORMATS_ROW = ["Meetups", "Workshops", "Hackathons", "Conferences"];
const STACK_ROW = "MongoDB · Express · React · Node";

export type WordState = { enter: number; exit: number };

export type LockupState = {
  glow: number;
  /** Badge reveal 0 → 1 (spring), or an explicit rect while it morphs. */
  badge: number;
  badgeRect?: RoundRect;
  badgeOpacity?: number;
  eyebrowChars: number;
  eyebrowOpacity: number;
  words: WordState[];
  hairline: number;
  hairlineOut: number;
  rowChars: number;
  rowOpacity: number;
  /** Which format name glints in the index row (fractional = between). */
  glint?: number;
  breathe?: number;
};

const mono = {
  fontFamily: fonts.mono,
  textTransform: "uppercase",
  letterSpacing: MONO_TRACKING,
  whiteSpace: "pre",
} as const;

export const BrandLockup = ({ s }: { s: LockupState }) => {
  const eyebrow = "00 // DEVentHub";
  const rowLeft = FORMATS_ROW.join(" · ");
  // slice() with a negative end trims from the right, so clamp first.
  const eyebrowChars = Math.max(0, s.eyebrowChars);
  const rowChars = Math.max(0, s.rowChars);
  const badge = s.badgeRect ?? {
    ...BADGE,
    y: BADGE.y + (1 - s.badge) * 18,
  };
  const badgeScale = s.badgeRect ? 1 : mix(0.72, 1, s.badge);
  const glowR = 460 * (1 + 0.05 * (s.breathe ?? 0));

  let wordIndex = 0;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* Spotlight bloom behind the badge, in the cards' cyan-teal */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: s.glow,
          background: `radial-gradient(circle at ${BADGE.x + BADGE.w / 2}px ${BADGE.y + BADGE.h / 2}px, rgba(124, 194, 204, 0.32), rgba(124, 194, 204, 0) ${glowR}px)`,
        }}
      />

      {s.badge > 0 || s.badgeRect ? (
        <div
          style={{
            position: "absolute",
            left: badge.x,
            top: badge.y,
            width: badge.w,
            height: badge.h,
            scale: `${badgeScale}`,
            opacity: (s.badgeOpacity ?? 1) * clamp(s.badge * 1.6),
          }}
        >
          <LogoTile size={badge.w} />
        </div>
      ) : null}

      <div
        style={{
          ...mono,
          position: "absolute",
          left: LEFT,
          top: EYEBROW_Y,
          fontSize: 15,
          lineHeight: "18px",
          color: color.hud,
          opacity: s.eyebrowOpacity,
        }}
      >
        <span style={{ color: color.signalDim }}>{eyebrow.slice(0, Math.min(2, eyebrowChars))}</span>
        {eyebrow.slice(2, Math.max(2, eyebrowChars))}
      </div>

      {TAGLINE.map((line, li) => (
        <div
          key={li}
          style={{
            position: "absolute",
            left: LEFT - 4,
            top: TAGLINE_Y + li * LINE,
            display: "flex",
            gap: "0.26em",
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: SIZE,
            lineHeight: `${LINE}px`,
            color: color.deep,
            whiteSpace: "nowrap",
          }}
        >
          {line.map((word) => {
            const w = s.words[wordIndex++] ?? { enter: 0, exit: 0 };
            const y = (1 - w.enter) * 105 - w.exit * 105;
            return (
              <span key={word} style={{ display: "inline-block", overflow: "hidden", paddingBottom: 6, marginBottom: -6 }}>
                <span
                  style={{
                    display: "inline-block",
                    translate: `0 ${y}%`,
                    opacity: clamp(w.enter * 1.4) * (1 - w.exit),
                    letterSpacing: `${mix(0.01, -0.03, w.enter)}em`,
                  }}
                >
                  {word}
                </span>
              </span>
            );
          })}
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          left: LEFT,
          top: HAIRLINE_Y,
          width: RIGHT - LEFT,
          height: 1,
          background: color.hairline,
          transformOrigin: s.hairlineOut > 0 ? "right center" : "left center",
          scale: `${s.hairline * (1 - s.hairlineOut)} 1`,
        }}
      />

      <div
        style={{ ...mono, position: "absolute", left: LEFT, top: ROW_Y, fontSize: 13, lineHeight: "16px", opacity: s.rowOpacity }}
      >
        {rowLeft
          .slice(0, rowChars)
          .split(" · ")
          .map((name, i, all) => {
            const lit = clamp(1 - Math.abs((s.glint ?? -9) - i));
            return (
              <span key={i}>
                <span style={{ color: lit > 0 ? `color-mix(in srgb, ${color.signalDim} ${lit * 100}%, ${color.hud})` : color.hud }}>
                  {name}
                </span>
                {i < all.length - 1 ? <span style={{ color: color.hudFaint }}>{" · "}</span> : null}
              </span>
            );
          })}
      </div>
      <div
        style={{
          ...mono,
          position: "absolute",
          right: 1920 - RIGHT,
          top: ROW_Y,
          fontSize: 13,
          lineHeight: "16px",
          color: color.hudFaint,
          opacity: s.rowOpacity,
          textAlign: "right",
        }}
      >
        {STACK_ROW.slice(0, Math.max(0, rowChars - 6))}
      </div>
    </div>
  );
};
