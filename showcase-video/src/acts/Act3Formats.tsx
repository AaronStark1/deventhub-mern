// ACT 3 · 0:20–0:36 · The format stack and the Conferences card.
// Sequence starts at 1170 (30 frames before the act boundary) so the stack
// can scale in underneath Act 2's Z-space push.
//   0– 64  Enter: 0.94 → 1, depth-of-field blur clears.
//  30–500  The real ScrollStack, scrolled frame by frame: Meetups → Workshops
//          → Hackathons → Conferences, under a rotateX(4°) rotateY(−6°)
//          camera that settles to 0° as the last card lands.
// 500–906  Camera tours the Conferences card: four HUD callouts, a loupe on
//          the 2.5% grain, a dimension mark on the 8px bezel. Long moves pull
//          back mid-flight rather than whip-panning at full zoom.
// 906–990  Pull back to a recap of all four, then clear for Act 4.
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { cardLayout } from "../lib/captures";
import { camera, type Point } from "../lib/geometry";
import { clamp, EASE_GLIDE, EASE_SOFT, mix, ramp, springAt, track } from "../lib/motion";
import { FormatStack, onConf, PIN_END, topCardAt } from "../app/FormatStack";
import { FORMATS } from "../app/formats";
import { Callout, Tag } from "../primitives/Callout";
import { fonts } from "../theme/fonts";
import { color, HEIGHT, MONO_TRACKING, WIDTH } from "../theme/tokens";

const L = cardLayout(1440);

// Camera tour after the stack settles. Position and zoom are keyed
// separately so a long move can zoom out and back in (a fly-to) while the
// pan itself never stops.
const TOUR = 500;
const POS: [number, number, number][] = [
  [TOUR, 720, PIN_END + 450],
  [530, 420, 1722], // 01 eyebrow
  [600, 420, 1722],
  [638, 780, 1648], // 02 surface
  [704, 780, 1648],
  [742, 360, 1886], // 03 pills
  [806, 360, 1886],
  [846, 1010, 1790], // 04 bezel
  [906, 1010, 1790],
  [936, 720, 1790], // recap
];
const ZOOM: [number, number][] = [
  [TOUR, 1.2],
  [530, 2.0],
  [600, 2.0],
  [619, 1.7],
  [638, 2.6],
  [704, 2.6],
  [723, 1.7],
  [742, 2.3],
  [806, 2.3],
  [826, 1.35],
  [846, 1.85],
  [906, 1.85],
  [936, 1.25],
];

/** The settled framing Act 3 ends on and Act 4 starts from. */
export const RECAP_CAMERA = { center: { x: 720, y: 1790 }, zoom: 1.25 };

export const act3Camera = (frame: number) => {
  if (frame < TOUR) {
    const scroll = track(frame, [[30, -220], [TOUR, PIN_END]], EASE_GLIDE);
    return { center: { x: track(frame, [[0, 800], [TOUR, 720]], EASE_GLIDE), y: scroll + 450 }, zoom: 1.2, scroll };
  }
  const x = track(frame, POS.map(([f, px]) => [f, px] as const), EASE_GLIDE);
  const y = track(frame, POS.map(([f, , py]) => [f, py] as const), EASE_GLIDE);
  const zoom = Math.exp(track(frame, ZOOM.map(([f, z]) => [f, Math.log(z)] as const), EASE_GLIDE));
  return { center: { x, y }, zoom, scroll: PIN_END };
};

export const Act3Formats = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = ramp(frame, 0, 64, EASE_SOFT);
  const settle = ramp(frame, 0, 520, EASE_GLIDE);
  const rx = mix(4, 0, settle);
  const ry = mix(-6, 0, settle);

  const { center, zoom, scroll } = act3Camera(frame);
  const cam = camera(center, zoom, WIDTH, HEIGHT);
  const at = (x: number, y: number) => cam.toScreen(onConf(x, y));

  const blur = (1 - enter) * 10;
  const p = (start: number, dur = 34) => clamp((frame - start) / dur);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ perspective: 2400, perspectiveOrigin: "960px 540px" }}>
        <AbsoluteFill
          style={{
            transformStyle: blur > 0.2 || settle >= 1 ? undefined : "preserve-3d",
            transformOrigin: "960px 540px",
            transform: settle >= 1 ? undefined : `rotateX(${rx}deg) rotateY(${ry}deg) scale(${mix(0.94, 1, enter)})`,
            opacity: enter,
            filter: blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : undefined,
          }}
        >
          <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: cam.transform, transformStyle: settle >= 1 ? undefined : "preserve-3d" }}>
            <FormatStack scroll={scroll} depth={1 - settle} />
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      <StackIndex scroll={scroll} opacity={ramp(frame, 70, 30) * (1 - ramp(frame, 488, 24))} />

      {/* 01 — eyebrow + display hierarchy */}
      <Callout
        anchor={at(L.eyebrow.x - 12, L.eyebrow.y + L.eyebrow.h / 2)}
        label={{ x: 420, y: 330 }}
        side="left"
        index="01"
        title="Format eyebrow"
        lines={["JetBrains Mono · 12px · 0.12em", "Syne 700 · −0.03em · clamp(32 → 56)"]}
        progress={p(532)}
        out={clamp((frame - 590) / 12)}
      />

      {/* 02 — surface: gradient, grain, specular edge */}
      <Callout
        anchor={at(612, 0)}
        label={{ x: 1110, y: 150 }}
        index="02"
        title="Surface"
        lines={["#163840 → #09151B", "Fractal noise 2.5% · 1px specular edge"]}
        progress={p(640)}
        out={clamp((frame - 694) / 12)}
        panel
      />
      <Loupe
        frame={frame}
        fps={fps}
        start={646}
        end={694}
        screen={{ x: 860, y: 730 }}
        sample={onConf(560, 12)}
        sampleOnScreen={at(560, 12)}
        scroll={scroll}
      />

      {/* 03 — pill tags */}
      <Callout
        anchor={at(L.pills[0].x + L.pills[0].w / 2, L.pills[0].y + L.pills[0].h + 2)}
        label={{ x: 600, y: 860 }}
        index="03"
        title="Pill tags"
        lines={["Keynotes · Panels · Networking", "1px hairline · rounded-full · lift −1px"]}
        progress={p(744)}
        out={clamp((frame - 796) / 12)}
      />

      {/* 04 — glass bezel */}
      <Callout
        anchor={at(L.bezel.x + L.bezel.w - 30, L.bezel.y + 2)}
        label={{ x: 1500, y: 250 }}
        index="04"
        title="Glass bezel"
        lines={["Padding 8px · r20 → inner r12", "rgba(255,255,255,.08) · 16:10 frame"]}
        progress={p(848)}
        out={clamp((frame - 896) / 12)}
      />
      <BezelGauge
        from={at(L.bezel.x, L.bezel.y + L.bezel.h * 0.62)}
        to={at(L.frame.x, L.bezel.y + L.bezel.h * 0.62)}
        progress={ramp(frame, 856, 20) * (1 - ramp(frame, 894, 10))}
      />

      {/* Recap: all four, compact */}
      {[
        { a: at(L.eyebrow.x - 10, L.eyebrow.y + 8), l: { x: 300, y: 132 }, i: "01", t: "Format" },
        { a: at(560, 0), l: { x: 1010, y: 132 }, i: "02", t: "Surface" },
        { a: at(L.pills[1].x + L.pills[1].w / 2, L.pills[1].y + L.pills[1].h), l: { x: 360, y: 856 }, i: "03", t: "Pills" },
        { a: at(L.bezel.x + L.bezel.w / 2, L.bezel.y + L.bezel.h), l: { x: 1010, y: 856 }, i: "04", t: "Bezel" },
      ].map((c, k) => (
        <Callout
          key={c.i}
          anchor={c.a}
          label={c.l}
          index={c.i}
          title={c.t}
          progress={p(938 + k * 4, 24)}
          out={clamp((frame - 962) / 20)}
        />
      ))}
    </AbsoluteFill>
  );
};

/** Right-gutter index of the four formats; the card on top is lit. */
const StackIndex = ({ scroll, opacity }: { scroll: number; opacity: number }) => {
  if (opacity <= 0) return null;
  const active = topCardAt(scroll);
  return (
    <div style={{ position: "absolute", left: 1668, top: 420, opacity }}>
      {FORMATS.map((f, i) => {
        const on = i === active;
        return (
          <div
            key={f.title}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              height: 30,
              fontFamily: fonts.mono,
              fontSize: 13,
              letterSpacing: MONO_TRACKING,
              textTransform: "uppercase",
              color: on ? color.deep : color.hudFaint,
            }}
          >
            <span style={{ width: 12, height: 12, borderRadius: 3, backgroundImage: f.gradient, boxShadow: on ? `0 0 0 3px rgba(124, 194, 204, 0.35)` : "none" }} />
            <span style={{ color: on ? color.signalDim : color.hudFaint }}>{String(i + 1).padStart(2, "0")}</span>
            {f.title}
          </div>
        );
      })}
      <div style={{ marginTop: 14, height: 1, width: 168, background: color.hairline }} />
      <div style={{ marginTop: 10, fontFamily: fonts.mono, fontSize: 12, letterSpacing: MONO_TRACKING, textTransform: "uppercase", color: color.hudFaint }}>
        Pinned at 20% · +30px
      </div>
    </div>
  );
};

/** Magnifier over the card surface: true geometry, grain shown at 12× opacity. */
const Loupe = ({
  frame,
  fps,
  start,
  end,
  screen,
  sample,
  sampleOnScreen,
  scroll,
}: {
  frame: number;
  fps: number;
  start: number;
  end: number;
  screen: Point;
  sample: Point;
  sampleOnScreen: Point;
  scroll: number;
}) => {
  const open = springAt(frame, fps, start) * (1 - ramp(frame, end, 12));
  if (open <= 0.001) return null;
  const R = 150;
  const Z = 9;
  return (
    <>
      <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0, opacity: open }}>
        <line x1={sampleOnScreen.x} y1={sampleOnScreen.y} x2={screen.x} y2={screen.y - R} stroke={color.signalDim} strokeWidth={1} />
        <circle cx={sampleOnScreen.x} cy={sampleOnScreen.y} r={6} fill="none" stroke={color.signal} strokeWidth={1.5} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: screen.x - R,
          top: screen.y - R,
          width: R * 2,
          height: R * 2,
          borderRadius: "50%",
          overflow: "hidden",
          scale: `${mix(0.6, 1, open)}`,
          opacity: clamp(open * 1.4),
          border: `1px solid ${color.signal}`,
          boxShadow: "0 0 0 6px rgba(124, 194, 204, 0.16), 0 30px 60px -20px rgba(9, 21, 27, 0.6)",
          background: color.night,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transformOrigin: "0 0",
            transform: `translate(${R - sample.x * Z}px, ${R - sample.y * Z}px) scale(${Z})`,
          }}
        >
          <FormatStack scroll={scroll} heading={false} noise={0.3} />
        </div>
      </div>
      <Tag x={screen.x + R + 18} y={screen.y - 11} progress={clamp(open)}>
        Loupe 9× · grain shown at 12× opacity
      </Tag>
    </>
  );
};

/** Dimension mark across the bezel's 8px padding. */
const BezelGauge = ({ from, to, progress }: { from: Point; to: Point; progress: number }) => {
  if (progress <= 0) return null;
  const y = from.y;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: progress, pointerEvents: "none" }}>
      <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0 }}>
        {[from.x, to.x].map((x) => (
          <line key={x} x1={x} x2={x} y1={y - 14} y2={y + 14} stroke={color.signal} strokeWidth={1.5} />
        ))}
        <line x1={from.x} x2={to.x} y1={y} y2={y} stroke={color.signal} strokeWidth={1.5} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: (from.x + to.x) / 2 - 40,
          width: 80,
          top: y - 44,
          textAlign: "center",
          fontFamily: fonts.mono,
          fontSize: 13,
          letterSpacing: MONO_TRACKING,
          color: color.signal,
          textShadow: "0 1px 2px rgba(9, 21, 27, 0.6)",
        }}
      >
        8PX
      </div>
    </div>
  );
};

