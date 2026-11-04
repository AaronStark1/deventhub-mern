// Vector port of FormatCard (EventScrollStack.jsx) + the `.format-card*`
// surface in index.css. Every hover transition is a prop driven per frame,
// and `vw` stands in for the viewport so clamp() sizes and the md/lg
// breakpoints resolve exactly as they would at that browser width.
import type { CSSProperties } from "react";
import { Img } from "remotion";
import { mixColor } from "../lib/motion";
import { NOISE_URL } from "../primitives/Noise";
import { fonts } from "../theme/fonts";
import { AMBIENT } from "../theme/tokens";
import type { Format, Tone } from "./formats";

type Ink = {
  ink: string;
  body: string;
  signal: string;
  spot: string;
  edge: string;
  bezelBg: string;
  bezelLine: string;
  pillBg: string;
  pillBgHover: string;
  pillLine: string;
  pillLineHover: string;
};

// `.format-card` and its [data-tone] overrides.
const DEEP: Ink = {
  ink: "#ffffff",
  body: "rgba(234, 242, 239, 0.78)",
  signal: "#7cc2cc",
  spot: "rgba(124, 194, 204, 0.08)",
  edge: "rgba(255, 255, 255, 0.34)",
  bezelBg: "rgba(255, 255, 255, 0.03)",
  bezelLine: "rgba(255, 255, 255, 0.08)",
  pillBg: "rgba(255, 255, 255, 0.04)",
  pillBgHover: "rgba(255, 255, 255, 0.09)",
  pillLine: "rgba(255, 255, 255, 0.14)",
  pillLineHover: "rgba(255, 255, 255, 0.3)",
};

export const TONES: Record<Tone, Ink> = {
  deep: DEEP,
  mid: {
    ...DEEP,
    body: "rgba(255, 255, 255, 0.9)",
    signal: "rgba(232, 248, 246, 0.85)",
    spot: "rgba(255, 255, 255, 0.1)",
  },
  bright: {
    ink: "#10242b",
    body: "rgba(16, 36, 43, 0.84)",
    signal: "#163840",
    spot: "rgba(255, 255, 255, 0.22)",
    edge: "rgba(255, 255, 255, 0.6)",
    bezelBg: "rgba(255, 255, 255, 0.12)",
    bezelLine: "rgba(22, 56, 64, 0.12)",
    pillBg: "rgba(255, 255, 255, 0.18)",
    pillBgHover: "rgba(255, 255, 255, 0.32)",
    pillLine: "rgba(22, 56, 64, 0.18)",
    pillLineHover: "rgba(22, 56, 64, 0.34)",
  },
};

const clampPx = (min: number, preferred: number, max: number) => Math.min(max, Math.max(min, preferred));

/** Resolved sizes for a viewport width (Tailwind md = 768, lg = 1024). */
export const cardMetrics = (vw: number) => {
  const md = vw >= 768;
  const lg = vw >= 1024;
  return {
    md,
    lg,
    radius: md ? 40 : 28, // rounded-[28px] md:rounded-[40px]
    padding: clampPx(24, 0.045 * vw, 64), // p-[clamp(1.5rem,4.5vw,4rem)]
    title: clampPx(32, 17.6 + 0.028 * vw, 56), // clamp(2rem, 1.1rem + 2.8vw, 3.5rem)
    body: clampPx(16, 15.2 + 0.0025 * vw, 18), // clamp(1rem, 0.95rem + 0.25vw, 1.125rem)
    shellPad: clampPx(20, 0.04 * vw, 48), // .shell padding-inline
    leftSpan: lg ? 7 : md ? 6 : 12,
    rightSpan: lg ? 5 : md ? 6 : 12,
  };
};

export type CardState = {
  /** `.format-card__spotlight` opacity (0 idle → 1 hover, 500ms). */
  spotlight?: number;
  /** Cursor position in card pixels (--mouse-x / --mouse-y). */
  mouse?: { x: number; y: number };
  /** `.format-card__edge` opacity (0.45 idle → 1 hover, 700ms). */
  edge?: number;
  /** Photo scale (1 → 1.03 on hover, 700ms). */
  imageScale?: number;
  /** Per-pill hover progress (300ms). */
  pills?: number[];
  /** Noise layer opacity; 0.025 in the app. */
  noise?: number;
  /** 12-column grid overlay (reel annotation, not part of the app). */
  columns?: number;
};

export const FormatCard = ({
  format,
  index,
  vw,
  height,
  state = {},
  style,
}: {
  format: Format;
  index: number;
  vw: number;
  height?: number;
  state?: CardState;
  style?: CSSProperties;
}) => {
  const t = TONES[format.tone];
  const m = cardMetrics(vw);
  const { spotlight = 0, mouse = { x: 0, y: 0 }, edge = 0.45, imageScale = 1, pills = [], noise = 0.025, columns = 0 } = state;
  const eyebrow = `${String(index + 1).padStart(2, "0")} // Format`;

  return (
    <div
      style={{
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        height,
        padding: m.padding,
        borderRadius: m.radius,
        border: "1px solid rgba(255, 255, 255, 0.12)",
        backgroundImage: format.gradient,
        boxShadow: AMBIENT,
        color: t.ink,
        fontFamily: fonts.sans,
        ...style,
      }}
    >
      {/* Surface layers, in DOM order beneath the content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: noise,
          backgroundImage: NOISE_URL,
          backgroundSize: "200px 200px",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: spotlight,
          background: `radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px, ${t.spot}, transparent 40%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "8%",
          right: "8%",
          height: 1,
          pointerEvents: "none",
          background: `linear-gradient(90deg, transparent, ${t.edge}, transparent)`,
          opacity: edge,
        }}
      />

      {columns > 0 ? <ColumnsOverlay md={m.md} leftSpan={m.leftSpan} inset={m.padding - 1} progress={columns} /> : null}

      <div
        style={{
          position: "relative",
          display: "grid",
          alignItems: "center",
          rowGap: 32,
          columnGap: m.md ? 40 : 32,
          gridTemplateColumns: m.md ? "repeat(12, minmax(0, 1fr))" : "minmax(0, 1fr)",
        }}
      >
        <div style={{ gridColumn: m.md ? `span ${m.leftSpan} / span ${m.leftSpan}` : undefined }}>
          <p
            style={{
              marginBottom: 18,
              fontFamily: fonts.mono,
              fontSize: 12,
              lineHeight: 1,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: t.signal,
            }}
          >
            {eyebrow}
          </p>
          <h3
            style={{
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: m.title,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: t.ink,
            }}
          >
            {format.title}
          </h3>
          <p
            style={{
              marginTop: 16,
              maxWidth: "44ch",
              fontSize: m.body,
              lineHeight: 1.65,
              textWrap: "pretty",
              color: t.body,
            }}
          >
            {format.description}
          </p>
          <ul style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {format.tags.map((tag, i) => {
              const h = pills[i] ?? 0;
              return (
                <li
                  key={tag}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "5px 13px",
                    borderRadius: 9999,
                    border: `1px solid ${mixColor(t.pillLine, t.pillLineHover, h)}`,
                    background: mixColor(t.pillBg, t.pillBgHover, h),
                    fontSize: 13,
                    fontWeight: 500,
                    lineHeight: 1.25,
                    color: mixColor(t.body, t.ink, h),
                    translate: `0 ${-h}px`,
                  }}
                >
                  {tag}
                </li>
              );
            })}
          </ul>
        </div>

        <div style={{ gridColumn: m.md ? `span ${m.rightSpan} / span ${m.rightSpan}` : undefined }}>
          {/* Glass bezel: inner radius = outer radius − padding */}
          <div
            style={{
              padding: 8,
              borderRadius: 20,
              border: `1px solid ${t.bezelLine}`,
              background: t.bezelBg,
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -12px 24px -14px rgba(9, 21, 27, 0.45)",
            }}
          >
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                aspectRatio: "16 / 10",
                borderRadius: 12,
                background: "rgba(9, 21, 27, 0.25)",
              }}
            >
              <Img
                src={format.image}
                style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", scale: `${imageScale}` }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "inherit",
                  pointerEvents: "none",
                  background: "linear-gradient(to top right, rgba(255, 255, 255, 0.07), transparent 45%)",
                  boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 14px 32px -18px rgba(9, 21, 27, 0.6)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SIGNAL_FILL = "rgba(124, 194, 204, 0.13)";
const SIGNAL_LINE = "rgba(124, 194, 204, 0.55)";

/**
 * The card's own 12-column grid made visible: same template and gaps as the
 * content grid, so the stripes can't drift from the real layout.
 */
const ColumnsOverlay = ({ md, leftSpan, inset, progress }: { md: boolean; leftSpan: number; inset: number; progress: number }) => {
  const grid = {
    position: "absolute",
    inset,
    display: "grid",
    gridTemplateColumns: md ? "repeat(12, minmax(0, 1fr))" : "minmax(0, 1fr)",
    columnGap: md ? 40 : 32,
    pointerEvents: "none",
  } as const;
  const tag = {
    position: "absolute",
    // Sits in the card's top padding, which is only 24px on phones.
    top: -Math.min(26, inset - 2),
    left: 0,
    padding: "3px 7px",
    borderRadius: 4,
    background: "#163840",
    color: "#7cc2cc",
    fontFamily: fonts.mono,
    fontSize: 11,
    lineHeight: "13px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  } as const;
  const cols = md ? 12 : 1;
  return (
    <>
      <div style={{ ...grid, zIndex: 0 }}>
        {Array.from({ length: cols }, (_, i) => (
          <div
            key={i}
            style={{
              background: SIGNAL_FILL,
              boxShadow: `inset 1px 0 0 ${SIGNAL_LINE}, inset -1px 0 0 ${SIGNAL_LINE}`,
              transformOrigin: "top center",
              scale: `1 ${Math.min(1, Math.max(0, progress * 1.6 - i * 0.05))}`,
            }}
          />
        ))}
      </div>
      <div style={{ ...grid, zIndex: 2, opacity: Math.min(1, Math.max(0, progress * 2 - 0.8)) }}>
        {md ? (
          <>
            <div style={{ position: "relative", gridColumn: `span ${leftSpan} / span ${leftSpan}`, borderTop: `1px solid ${SIGNAL_LINE}` }}>
              <span style={tag}>{leftSpan} cols · text</span>
            </div>
            <div style={{ position: "relative", gridColumn: `span ${12 - leftSpan} / span ${12 - leftSpan}`, borderTop: `1px solid ${SIGNAL_LINE}` }}>
              <span style={tag}>{12 - leftSpan} cols · image</span>
            </div>
          </>
        ) : (
          <div style={{ position: "relative", borderTop: `1px solid ${SIGNAL_LINE}` }}>
            <span style={tag}>1 col · stacked</span>
          </div>
        )}
      </div>
    </>
  );
};
