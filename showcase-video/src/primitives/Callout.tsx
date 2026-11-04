import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import type { Point, Rect } from "../lib/geometry";
import { clamp, EASE_FADE, EASE_SOFT } from "../lib/motion";
import { fonts } from "../theme/fonts";
import { color, HEIGHT, MONO_TRACKING, WIDTH } from "../theme/tokens";

const mono: CSSProperties = {
  fontFamily: fonts.mono,
  textTransform: "uppercase",
  letterSpacing: MONO_TRACKING,
  whiteSpace: "nowrap",
};

/** Sub-range of a 0→1 progress, eased. */
const seg = (p: number, a: number, b: number) => EASE_SOFT(clamp((p - a) / (b - a)));
const fadeSeg = (p: number, a: number, b: number) => EASE_FADE(clamp((p - a) / (b - a)));

/**
 * HUD pointer: a ringed anchor on the subject, a hairline leader with an
 * elbow, and a monospace label block on the canvas.
 */
export const Callout = ({
  anchor,
  label,
  side = "right",
  index,
  title,
  lines = [],
  progress,
  out = 0,
  panel = false,
}: {
  anchor: Point;
  label: Point;
  side?: "left" | "right";
  index: string;
  title: string;
  lines?: string[];
  progress: number;
  out?: number;
  /** Frosted mint backing for labels that sit over busy surfaces. */
  panel?: boolean;
}) => {
  if (progress <= 0 || out >= 1) return null;
  const dir = side === "right" ? 1 : -1;
  const elbow = { x: label.x - dir * 36, y: label.y };
  const len =
    Math.hypot(elbow.x - anchor.x, elbow.y - anchor.y) + Math.hypot(label.x - elbow.x, label.y - elbow.y);
  const draw = seg(progress, 0.05, 0.6);
  const dot = seg(progress, 0, 0.3);
  const text = seg(progress, 0.4, 1);
  const textOpacity = fadeSeg(progress, 0.4, 1);
  const fade = 1 - EASE_FADE(clamp(out));

  return (
    <AbsoluteFill style={{ opacity: fade, pointerEvents: "none" }}>
      <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <polyline
          points={`${anchor.x},${anchor.y} ${elbow.x},${elbow.y} ${label.x},${label.y}`}
          fill="none"
          stroke={color.signalDim}
          strokeWidth={1}
          strokeDasharray={len}
          strokeDashoffset={len * (1 - draw)}
        />
        <circle cx={anchor.x} cy={anchor.y} r={9 * dot} fill="none" stroke={color.signal} strokeWidth={1} opacity={0.9} />
        <circle cx={anchor.x} cy={anchor.y} r={3.2 * dot} fill={color.signal} />
      </svg>
      <div
        style={{
          position: "absolute",
          top: label.y - 11 - (panel ? 12 : 0),
          ...(side === "right" ? { left: label.x + 12 } : { right: WIDTH - label.x + 12, textAlign: "right" }),
          opacity: textOpacity,
          translate: `${dir * (1 - text) * 10}px 0`,
          ...(panel
            ? {
                padding: "12px 16px 10px",
                borderRadius: 10,
                background: "rgba(242, 247, 245, 0.9)",
                border: `1px solid ${color.hairline}`,
                boxShadow: "0 18px 40px -18px rgba(9, 21, 27, 0.45)",
                backdropFilter: "blur(10px)",
              }
            : {}),
        }}
      >
        <div style={{ ...mono, fontSize: 15, lineHeight: "22px", color: color.deep, fontWeight: 500 }}>
          <span style={{ color: color.signalDim }}>{index}</span>
          <span style={{ color: color.hudFaint }}>{" // "}</span>
          {title}
        </div>
        <div style={{ height: 1, background: color.hairline, margin: "8px 0 8px" }} />
        {lines.map((line) => (
          <div key={line} style={{ ...mono, fontSize: 12.5, lineHeight: "20px", color: color.hud, letterSpacing: "0.1em" }}>
            {line}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** Inspector-style outline with a tag, drawn over app content (screen px). */
export const InspectBox = ({
  rect,
  tag,
  progress,
  out = 0,
  radius = 8,
  tagSide = "top",
}: {
  rect: Rect;
  tag: string;
  progress: number;
  out?: number;
  radius?: number;
  tagSide?: "top" | "bottom";
}) => {
  if (progress <= 0 || out >= 1) return null;
  const p = EASE_SOFT(clamp(progress));
  const fade = 1 - EASE_FADE(clamp(out));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fade * EASE_FADE(clamp(progress)), pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: rect.x,
          top: rect.y,
          width: rect.w,
          height: rect.h,
          borderRadius: radius,
          border: `1px solid rgba(124, 194, 204, 0.95)`,
          background: "rgba(124, 194, 204, 0.07)",
          boxShadow: "0 0 0 4px rgba(124, 194, 204, 0.12)",
          scale: `${0.985 + 0.015 * p}`,
        }}
      />
      <Tag
        x={rect.x}
        y={tagSide === "top" ? rect.y - 30 : rect.y + rect.h + 8}
        progress={EASE_FADE(clamp(progress))}
      >
        {tag}
      </Tag>
    </div>
  );
};

export const Tag = ({ x, y, children, progress = 1, align = "left" }: { x: number; y: number; children: ReactNode; progress?: number; align?: "left" | "right" }) => (
  <div
    style={{
      position: "absolute",
      top: y,
      ...(align === "left" ? { left: x } : { right: WIDTH - x }),
      padding: "4px 9px",
      borderRadius: 5,
      background: color.deep,
      boxShadow: "0 6px 14px -6px rgba(9, 21, 27, 0.45)",
      ...mono,
      fontSize: 12,
      lineHeight: "14px",
      color: color.signal,
      opacity: progress,
      translate: `0 ${(1 - progress) * 6}px`,
    }}
  >
    {children}
  </div>
);

/** A vertical guide that draws downward, with an optional tag at its head. */
export const GuideLine = ({
  x,
  y1,
  y2,
  progress,
  out = 0,
  dashed = false,
  tag,
  tagAlign = "left",
  tagY,
}: {
  x: number;
  y1: number;
  y2: number;
  progress: number;
  out?: number;
  dashed?: boolean;
  tag?: string;
  tagAlign?: "left" | "right";
  tagY?: number;
}) => {
  if (progress <= 0 || out >= 1) return null;
  const p = EASE_SOFT(clamp(progress));
  const fade = 1 - EASE_FADE(clamp(out));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fade, pointerEvents: "none" }}>
      <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <line
          x1={x}
          x2={x}
          y1={y1}
          y2={y1 + (y2 - y1) * p}
          stroke="rgba(100, 166, 176, 0.9)"
          strokeWidth={1}
          strokeDasharray={dashed ? "6 6" : undefined}
        />
      </svg>
      {tag ? (
        <Tag x={tagAlign === "left" ? x + 8 : x - 8} y={tagY ?? y1 - 8} progress={EASE_FADE(clamp(progress))} align={tagAlign}>
          {tag}
        </Tag>
      ) : null}
    </div>
  );
};

/** Live monospace readout line (e.g. spotlight coordinates). */
export const Readout = ({ x, y, rows, opacity = 1 }: { x: number; y: number; rows: [string, string][]; opacity?: number }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity, pointerEvents: "none" }}>
    {rows.map(([k, v]) => (
      <div key={k} style={{ ...mono, fontSize: 13, lineHeight: "22px", letterSpacing: "0.1em" }}>
        <span style={{ color: color.hudFaint }}>{k}</span>
        <span style={{ color: color.deep, fontVariantNumeric: "tabular-nums" }}>{" " + v}</span>
      </div>
    ))}
  </div>
);
