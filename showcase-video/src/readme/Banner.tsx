// README header: the brand lockup beside the "What We Host" card stack, in the
// app's light and dark themes (frame 0 = light, frame 1 = dark). Corners are
// transparent so the banner sits cleanly on GitHub's light and dark pages.
import { useCurrentFrame } from "remotion";
import { FormatCard } from "../app/FormatCard";
import { FORMATS, STACK } from "../app/formats";
import { LogoTile } from "../app/LogoTile";
import { cardLayout } from "../lib/captures";
import { fonts } from "../theme/fonts";
import { MONO_TRACKING } from "../theme/tokens";
import { Backdrop, THEMES, type Theme } from "./Backdrop";

export const BANNER = { width: 1920, height: 600, radius: 28 };

const CARD = cardLayout(1440).card;
const STACK_SCALE = 0.56;

const mono = {
  fontFamily: fonts.mono,
  textTransform: "uppercase",
  letterSpacing: MONO_TRACKING,
  whiteSpace: "nowrap",
} as const;

/** The pinned ScrollStack: earlier cards peek above the next, 30px apart. */
const CardStack = () => (
  <div
    style={{
      position: "absolute",
      right: 112,
      top: (BANNER.height - (CARD.h + STACK.itemStackDistance * 3) * STACK_SCALE) / 2,
      width: CARD.w * STACK_SCALE,
      height: (CARD.h + STACK.itemStackDistance * 3) * STACK_SCALE,
      perspective: 1400,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: CARD.w,
        height: CARD.h + STACK.itemStackDistance * 3,
        transformOrigin: "0 0",
        transform: `scale(${STACK_SCALE}) rotateX(4deg) rotateY(-6deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      {FORMATS.map((format, i) => (
        <div
          key={format.title}
          style={{
            position: "absolute",
            left: 0,
            top: i * STACK.itemStackDistance,
            width: CARD.w,
            transformOrigin: "top center",
            transform: `scale(${STACK.baseScale + i * STACK.itemScale})`,
          }}
        >
          <FormatCard format={format} index={i} vw={1440} height={CARD.h} />
        </div>
      ))}
    </div>
  </div>
);

export const Banner = ({ theme }: { theme: Theme }) => {
  const t = THEMES[theme];
  const x = 120;
  return (
    <Backdrop width={BANNER.width} height={BANNER.height} theme={theme} radius={BANNER.radius}>
      <div style={{ position: "absolute", left: x, top: 112, ...mono, fontSize: 22, color: t.eyebrow }}>
        MERN <span style={{ color: t.accent }}>//</span> Event platform
      </div>

      <div style={{ position: "absolute", left: x, top: 160, display: "flex", alignItems: "center", gap: 32 }}>
        <LogoTile size={104} />
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: 124,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: t.ink,
          }}
        >
          DEVentHub
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: x,
          top: 304,
          fontFamily: fonts.sans,
          fontSize: 40,
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
          color: t.body,
        }}
      >
        Connecting developers through
        <br />
        meaningful events.
      </div>

      <div style={{ position: "absolute", left: x, top: 448, width: 820, height: 1, background: t.hairline }} />
      <div style={{ position: "absolute", left: x, top: 472, display: "flex", gap: 30, ...mono, fontSize: 19, color: t.eyebrow }}>
        {FORMATS.map((f, i) => (
          <span key={f.title}>
            <span style={{ color: t.accent }}>{String(i + 1).padStart(2, "0")}</span> {f.title}
          </span>
        ))}
      </div>

      <CardStack />

      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: BANNER.radius,
          border: `1px solid ${t.hairline}`,
          pointerEvents: "none",
        }}
      />
    </Backdrop>
  );
};

export const ReadmeBanner = () => <Banner theme={useCurrentFrame() === 0 ? "light" : "dark"} />;
