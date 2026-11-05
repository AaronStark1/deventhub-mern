// ACT 5 · 0:46–0:53 · Fluid responsive choreography.
//   0– 48  Spotlight wipe inside the persistent frame: /about → the
//          Conferences card at 1440.
//  48–120  Desktop: the card's own 12-column grid lights up, 7 / 5.
// 120–190  The viewport morphs to 768 (md: 6 / 6) …
// 250–320  … and to 390 (base: stacked, 16:10 photo kept).
// Every state is the real layout at that width (clamp() sizes, breakpoints);
// between states the two layouts cross-dissolve while the frame resizes.
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { cardMetrics } from "../app/FormatCard";
import { ResponsiveView } from "../app/ResponsiveView";
import { CONTENT, FRAME, PAGE_SCALE } from "../app/stage";
import { capture } from "../lib/captures";
import { clamp, EASE_GLIDE, mix, ramp, track } from "../lib/motion";
import { BrowserFrame, frameContent, PageView } from "../primitives/BrowserFrame";
import { SpotlightWipe } from "../primitives/transitions";
import { fonts } from "../theme/fonts";
import { color, MONO_TRACKING } from "../theme/tokens";

const VIEW_H = CONTENT.h; // displayed viewport height stays 840px
export const DEVICES = [
  { vw: 1440, vh: 900, name: "Desktop", rule: "lg ≥ 1024", split: "7 / 5 split" },
  { vw: 768, vh: 1024, name: "Tablet", rule: "md ≥ 768", split: "6 / 6 split" },
  { vw: 390, vh: 844, name: "Mobile", rule: "base", split: "Stacked · 16:10" },
] as const;
const displayWidth = (d: (typeof DEVICES)[number]) => (d.vw * VIEW_H) / d.vh;

const T1 = [120, 190] as const;
const T2 = [250, 320] as const;

/** Frame geometry for a displayed content width. */
export const frameFor = (contentW: number) => {
  const w = contentW + (FRAME.w - CONTENT.w);
  return { x: 960 - w / 2, y: FRAME.y, w, h: FRAME.h, r: FRAME.r };
};

export const Act5Responsive = () => {
  const frame = useCurrentFrame();

  const t1 = ramp(frame, T1[0], T1[1] - T1[0], EASE_GLIDE);
  const t2 = ramp(frame, T2[0], T2[1] - T2[0], EASE_GLIDE);
  const contentW = track(frame, [
    [T1[0], displayWidth(DEVICES[0])],
    [T1[1], displayWidth(DEVICES[1])],
    [T2[0], displayWidth(DEVICES[1])],
    [T2[1], displayWidth(DEVICES[2])],
  ]);
  const f = frameFor(contentW);
  const content = frameContent(f.w, f.h);

  // Simulated viewport for the readouts.
  const vw = frame < T2[0] ? mix(1440, 768, t1) : mix(768, 390, t2);
  const vh = frame < T2[0] ? mix(900, 1024, t1) : mix(1024, 844, t2);
  const active = frame < (T1[0] + T1[1]) / 2 ? 0 : frame < (T2[0] + T2[1]) / 2 ? 1 : 2;

  const wipe = ramp(frame, 0, 48, EASE_GLIDE);
  const columns = ramp(frame, 54, 46);
  const pair: [number, number, number] = frame < T2[0] ? [0, 1, t1] : [1, 2, t2];
  const mixT = clamp((pair[2] - 0.2) / 0.6);

  const layer = (i: number, opacity: number) => {
    if (opacity <= 0.001) return null;
    const d = DEVICES[i];
    const s = contentW / d.vw;
    return (
      <div
        key={d.name}
        style={{
          position: "absolute",
          left: 0,
          top: (content.h - d.vh * s) / 2,
          width: d.vw,
          height: d.vh,
          transformOrigin: "0 0",
          scale: `${s}`,
          opacity,
        }}
      >
        <ResponsiveView vw={d.vw} vh={d.vh} state={{ columns }} />
      </div>
    );
  };

  const gutters = ramp(frame, 132, 30) * (1 - ramp(frame, 392, 26));
  const m = cardMetrics(vw);

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: f.x, top: f.y }}>
        <BrowserFrame
          width={f.w}
          height={f.h}
          url={frame < 6 ? "localhost:5173/about" : "localhost:5173/"}
          viewport={`${Math.round(vw)} × ${Math.round(vh)}`}
        >
          {wipe < 1 ? (
            <PageView scale={PAGE_SCALE} cssHeight={1415} scroll={300}>
              <Img src={capture("about").src} style={{ display: "block", width: 1440, height: 1415 }} />
            </PageView>
          ) : null}
          <SpotlightWipe progress={wipe} origin={{ x: content.w / 2, y: content.h / 2 }} width={content.w} height={content.h}>
            {layer(pair[0], 1 - mixT)}
            {layer(pair[1], mixT)}
          </SpotlightWipe>
        </BrowserFrame>
      </div>

      {/* Breakpoint ladder (left gutter) */}
      <div style={{ position: "absolute", right: 1920 - f.x + 64, top: 404, opacity: gutters, textAlign: "right" }}>
        <div style={label(color.hudFaint)}>Breakpoints</div>
        <div style={{ height: 1, background: color.hairline, margin: "10px 0 12px" }} />
        {DEVICES.map((d, i) => (
          <div key={d.name} style={{ ...label(i === active ? color.deep : color.hudFaint), height: 30, display: "flex", justifyContent: "flex-end", gap: 14, alignItems: "center" }}>
            <span style={{ color: i === active ? color.signalDim : color.hudFaint }}>{d.rule}</span>
            <span>{d.split}</span>
            <span style={{ width: 6, height: 6, borderRadius: 6, background: i === active ? color.signalDim : "transparent", border: `1px solid ${i === active ? color.signalDim : color.hudFaint}` }} />
          </div>
        ))}
      </div>

      {/* Live clamp() values (right gutter) */}
      <div style={{ position: "absolute", left: f.x + f.w + 64, top: 404, opacity: gutters }}>
        <div style={label(color.hudFaint)}>Resolved at {Math.round(vw)}px</div>
        <div style={{ height: 1, background: color.hairline, margin: "10px 0 12px" }} />
        {[
          ["Title", `${m.title.toFixed(1)}px`],
          ["Body", `${m.body.toFixed(1)}px`],
          ["Padding", `${m.padding.toFixed(1)}px`],
          ["Radius", `${m.radius}px`],
          ["Photo", "16 : 10"],
        ].map(([k, v]) => (
          <div key={k} style={{ ...label(color.deep), height: 30, display: "flex", gap: 14, alignItems: "center" }}>
            <span style={{ color: color.hudFaint, width: 86 }}>{k}</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{v}</span>
          </div>
        ))}
        <div style={{ ...label(color.hudFaint), marginTop: 12, opacity: ramp(frame, 330, 24) }}>Touch · spotlight off</div>
      </div>
    </AbsoluteFill>
  );
};

const label = (c: string) =>
  ({
    fontFamily: fonts.mono,
    fontSize: 13,
    lineHeight: "16px",
    letterSpacing: MONO_TRACKING,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    color: c,
  }) as const;
