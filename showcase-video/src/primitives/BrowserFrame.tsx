import type { CSSProperties, ReactNode } from "react";
import { fonts } from "../theme/fonts";
import { color, MONO_TRACKING } from "../theme/tokens";
import { Noise, SpecularEdge } from "./Noise";

export const FRAME_SHADOW =
  "0 40px 80px -28px rgba(9, 21, 27, 0.5), 0 10px 24px -8px rgba(9, 21, 27, 0.22)";

export const FRAME_BAR = 44;
export const FRAME_PAD = 8;

/** Content-area size for an outer frame size. */
export const frameContent = (w: number, h: number, bar = FRAME_BAR) => ({
  x: FRAME_PAD,
  y: bar,
  w: w - FRAME_PAD * 2,
  h: h - bar - FRAME_PAD,
});

/**
 * Viewport frame in the primary showcase surface: deep → night gradient,
 * 1px specular border, 2.5% fractal noise, top-edge highlight. Renders at
 * (0, 0) at its own size; the parent places it. The content area is an 8px
 * recessed bezel, echoing the format cards' glass bezel.
 */
export const BrowserFrame = ({
  width,
  height,
  url,
  viewport,
  children,
  shadow = true,
  radius = 22,
  bar = FRAME_BAR,
  chromeOpacity = 1,
  contentBackground = color.bg,
  style,
}: {
  width: number;
  height: number;
  url: ReactNode;
  viewport?: string;
  children?: ReactNode;
  shadow?: boolean;
  radius?: number;
  bar?: number;
  chromeOpacity?: number;
  contentBackground?: string;
  style?: CSSProperties;
}) => {
  const content = frameContent(width, height, bar);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height,
        borderRadius: radius,
        overflow: "hidden",
        isolation: "isolate",
        background: `linear-gradient(to bottom right, ${color.deep}, ${color.night})`,
        border: `1px solid ${color.specular}`,
        boxShadow: shadow ? FRAME_SHADOW : undefined,
        ...style,
      }}
    >
      <Noise />
      <SpecularEdge opacity={0.7} />

      <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: bar - 1, opacity: chromeOpacity }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 19 + i * 17,
              top: (bar - 1) / 2 - 5,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.14)",
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.08)",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: 88,
            top: (bar - 1) / 2 - 13,
            height: 26,
            maxWidth: Math.max(0, width - 88 - 150),
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 8,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            fontFamily: fonts.mono,
            fontSize: 13,
            color: "rgba(234, 242, 239, 0.74)",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          <span
            style={{ width: 6, height: 6, borderRadius: "50%", background: color.primary, flexShrink: 0, opacity: 0.9 }}
          />
          {url}
        </div>
        {viewport ? (
          <div
            style={{
              position: "absolute",
              right: 18,
              top: (bar - 1) / 2 - 8,
              fontFamily: fonts.mono,
              fontSize: 12,
              lineHeight: "16px",
              letterSpacing: MONO_TRACKING,
              textTransform: "uppercase",
              color: color.signal,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {viewport}
          </div>
        ) : null}
      </div>

      <div
        style={{
          position: "absolute",
          left: content.x - 1,
          top: content.y - 1,
          width: content.w,
          height: content.h,
          borderRadius: Math.max(0, radius - FRAME_PAD),
          overflow: "hidden",
          background: contentBackground,
          boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.06)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * A page rendered at CSS width `cssWidth`, scaled into the frame's content
 * area and scrolled by `scroll` (CSS px). Children use page coordinates.
 */
export const PageView = ({
  scale,
  scroll = 0,
  cssWidth = 1440,
  cssHeight,
  children,
}: {
  scale: number;
  scroll?: number;
  cssWidth?: number;
  cssHeight: number;
  children: ReactNode;
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: cssWidth,
      height: cssHeight,
      transformOrigin: "0 0",
      transform: `scale(${scale}) translateY(${-scroll}px)`,
    }}
  >
    {children}
  </div>
);
