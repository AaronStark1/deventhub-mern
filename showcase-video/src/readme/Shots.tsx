// README screenshots: each frame is one route from the live-app captures,
// shown in the reel's browser frame on the mint stage, with the app's
// "NN // Label" eyebrow, a Syne title and who can open the page.
import { Img, useCurrentFrame } from "remotion";
import { capture } from "../lib/captures";
import { BrowserFrame, frameContent, PageView } from "../primitives/BrowserFrame";
import { fonts } from "../theme/fonts";
import { color, MONO_TRACKING } from "../theme/tokens";
import { Backdrop } from "./Backdrop";
import media from "./media.json";

export const SHOT = { width: 1600, height: 1248 };
const MARGIN = 80;
const FRAME = { x: MARGIN, y: 226, w: SHOT.width - MARGIN * 2, h: 942 };
const VIEWPORT = { w: 1440, h: 900 };

const mono = {
  fontFamily: fonts.mono,
  textTransform: "uppercase",
  letterSpacing: MONO_TRACKING,
  whiteSpace: "nowrap",
} as const;

const ACCESS: Record<string, string> = {
  Public: "Public",
  User: "Signed in · user",
  Host: "Signed in · host",
};

export const ReadmeShots = () => {
  const shot = media.shots[useCurrentFrame()];
  const content = frameContent(FRAME.w, FRAME.h);
  const scale = content.w / VIEWPORT.w;

  return (
    <Backdrop width={SHOT.width} height={SHOT.height}>
      <div style={{ position: "absolute", left: MARGIN, top: 72, ...mono, fontSize: 26, lineHeight: "32px", color: color.hud }}>
        <span style={{ color: color.signalDim }}>{shot.eyebrow.slice(0, 2)}</span>
        {shot.eyebrow.slice(2)}
      </div>
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 114,
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: 68,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color: color.deep,
        }}
      >
        {shot.title}
      </div>
      <div
        style={{
          position: "absolute",
          right: MARGIN,
          top: 124,
          height: 50,
          padding: "0 22px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderRadius: 999,
          background: `linear-gradient(to bottom right, ${color.deep}, ${color.night})`,
          border: `1px solid ${color.specular}`,
          ...mono,
          fontSize: 20,
          color: color.signal,
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: color.primary }} />
        {ACCESS[shot.access]}
      </div>

      <div style={{ position: "absolute", left: FRAME.x, top: FRAME.y }}>
        <BrowserFrame
          width={FRAME.w}
          height={FRAME.h}
          url={`localhost:5173${shot.url}`}
          viewport={`${VIEWPORT.w} × ${VIEWPORT.h}`}
        >
          <PageView scale={scale} cssHeight={VIEWPORT.h}>
            {shot.layers.map((name) => {
              const c = capture(name);
              return (
                <Img
                  key={name}
                  src={c.src}
                  style={{ position: "absolute", left: 0, top: c.top, width: c.width, height: c.height }}
                />
              );
            })}
          </PageView>
        </BrowserFrame>
      </div>
    </Backdrop>
  );
};
