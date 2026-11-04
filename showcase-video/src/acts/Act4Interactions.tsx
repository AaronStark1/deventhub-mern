// ACT 4 · 0:36–0:46 · Live micro-interactions & spotlight physics.
//   0–300  A cursor glides across the Conferences card. Hover is computed
//          from real cursor/element geometry and replayed as CSS
//          transitions: 600px spotlight (500ms), specular edge 0.45 → 1 and
//          photo 1 → 1.03 (700ms), pill lift (300ms).
// 300–380  Shared-element card morph: the photo's glass bezel expands into
//          the browser viewport for /events.
// 380–470  The Type filter is set to Conference; the grid drops to the two
//          conference events (both real captures).
// 470–600  Navbar → About, revealed with a spotlight wipe from the click.
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { cardLayout, capture, rectOf } from "../lib/captures";
import { camera, type Point, type Rect } from "../lib/geometry";
import { clamp, cssTransition, EASE_FADE, EASE_GLIDE, EASE_SOFT, mix, mixColor, ramp, springExact, track } from "../lib/motion";
import { CONF_RECT, FormatStack, PIN_END } from "../app/FormatStack";
import { CONFERENCES, FORMATS } from "../app/formats";
import { CONTENT, FRAME, PAGE_SCALE, pageRectToScreen, pageToScreen, unionRect } from "../app/stage";
import { BrowserFrame, PageView } from "../primitives/BrowserFrame";
import { InspectBox, Readout } from "../primitives/Callout";
import { Cursor, cursorPath } from "../primitives/Cursor";
import { MorphClip, SpotlightWipe } from "../primitives/transitions";
import { fonts } from "../theme/fonts";
import { color, HEIGHT, WIDTH } from "../theme/tokens";
import { RECAP_CAMERA } from "./Act3Formats";

const L = cardLayout(1440);
const DURATION = 600;

// Card-local cursor path over the Conferences card (card px).
const CARD_PATH = [
  { f: 0, x: 1420, y: 660 },
  { f: 46, x: 930, y: 330 },
  { f: 112, x: 330, y: 150 },
  { f: 150, x: L.pills[0].x + L.pills[0].w / 2, y: L.pills[0].y + L.pills[0].h / 2 },
  { f: 182, x: L.pills[1].x + L.pills[1].w / 2, y: L.pills[1].y + L.pills[1].h / 2 + 1 },
  { f: 214, x: L.pills[2].x + L.pills[2].w / 2, y: L.pills[2].y + L.pills[2].h / 2 },
  { f: 272, x: L.frame.x + L.frame.w * 0.52, y: L.frame.y + L.frame.h * 0.5 },
  { f: 300, x: L.frame.x + L.frame.w * 0.55, y: L.frame.y + L.frame.h * 0.53 },
];

const inside = (p: Point, r: Rect) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
const mouseAt = (f: number) => cursorPath(Math.min(f, 300), CARD_PATH, 0.06);

// Per-frame hit tests, replayed as CSS transitions.
const HITS = {
  card: Array.from({ length: DURATION }, (_, f) => f < 300 && inside(mouseAt(f), { x: 0, y: 0, w: CONF_RECT.w, h: CONF_RECT.h })),
  pills: L.pills.map((r) => Array.from({ length: DURATION }, (_, f) => f < 300 && inside(mouseAt(f), r))),
};

const cameraAt = (frame: number) =>
  camera(RECAP_CAMERA.center, track(frame, [[0, RECAP_CAMERA.zoom], [150, 1.36]], EASE_GLIDE), WIDTH, HEIGHT);

// Screen positions on the Events / About pages (page px → frame).
const SELECT = rectOf("events", "typeSelect");
const NAV_ABOUT = rectOf("events", "navAbout");
const selectCenter = pageToScreen({ x: SELECT.x + SELECT.w * 0.55, y: SELECT.y + SELECT.h / 2 });
const aboutCenter = pageToScreen({ x: NAV_ABOUT.x + NAV_ABOUT.w / 2, y: NAV_ABOUT.y + NAV_ABOUT.h / 2 });

export const Act4Interactions = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ---- Card hover ------------------------------------------------------------
  const cam = cameraAt(frame);
  const mouse = mouseAt(frame);
  const hoverCard = (d: number) => cssTransition(HITS.card, frame, d);
  const spotlight = hoverCard(30);
  const edgeHover = hoverCard(42);
  const confState = {
    spotlight,
    mouse,
    edge: mix(0.45, 1, edgeHover),
    imageScale: mix(1, 1.03, edgeHover),
    pills: HITS.pills.map((hits) => cssTransition(hits, frame, 18)),
  };
  const states = FORMATS.map((_, i) => (i === CONFERENCES ? confState : {}));
  const cardScreen = (p: Point) => cam.toScreen({ x: CONF_RECT.x + p.x, y: CONF_RECT.y + p.y });

  // ---- Bezel → viewport morph ---------------------------------------------
  const morph = springExact(frame, fps, 300, 80);
  const bezel = cam.rectToScreen({ x: CONF_RECT.x + L.bezel.x, y: CONF_RECT.y + L.bezel.y, w: L.bezel.w, h: L.bezel.h });
  const fromRect = { ...bezel, r: 20 * cam.zoom };
  const stageOut = ramp(frame, 304, 44);

  // ---- Events → About ----------------------------------------------------
  const filtered = ramp(frame, 428, 16, EASE_FADE);
  const aboutHover = ramp(frame, 497, 9);
  const wipe = ramp(frame, 510, 44, EASE_GLIDE);
  const aboutScroll = track(frame, [[548, 0], [596, 300]], EASE_GLIDE);

  // ---- Cursor ------------------------------------------------------------
  const pageCursor = cursorPath(frame, [
    { f: 300, ...cardScreen(CARD_PATH[CARD_PATH.length - 1]) },
    { f: 418, ...selectCenter },
    { f: 470, ...selectCenter },
    { f: 498, ...aboutCenter },
  ]);
  const cursorAt = frame < 300 ? cardScreen(mouse) : pageCursor;
  const press = Math.max(clamp(1 - Math.abs(frame - 424) / 5), clamp(1 - Math.abs(frame - 506) / 5));
  const clickAge = frame >= 506 ? frame - 506 : frame >= 424 ? frame - 424 : -1;
  const overLink = frame >= 490 && frame < 512;

  const readoutOpacity = ramp(frame, 40, 20) * (1 - ramp(frame, 292, 16));
  const cardBottom = cardScreen({ x: 0, y: CONF_RECT.h });

  return (
    <AbsoluteFill>
      {/* The settled stack, flat, as Act 3 left it */}
      {stageOut < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - stageOut, scale: `${mix(1, 0.97, stageOut)}`, transformOrigin: "960px 540px" }}>
          <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: cam.transform }}>
            <FormatStack scroll={PIN_END} states={states} />
          </div>
        </AbsoluteFill>
      ) : null}

      <Readout
        x={cardScreen({ x: 0, y: 0 }).x + 4}
        y={cardBottom.y + 30}
        opacity={readoutOpacity}
        rows={[
          ["--MOUSE-X / -Y", `${String(Math.round(mouse.x)).padStart(4, "0")} · ${String(Math.round(mouse.y)).padStart(4, "0")} PX`],
          ["SPOTLIGHT 600PX", `OPACITY ${spotlight.toFixed(2)} · 500MS`],
          ["EDGE / PHOTO", `${mix(0.45, 1, edgeHover).toFixed(2)} · ${mix(1, 1.03, edgeHover).toFixed(3)}× · 700MS`],
        ]}
      />

      {/* Shared-element morph: bezel → browser viewport */}
      {frame >= 300 ? (
        <>
          <MorphClip from={fromRect} to={FRAME} progress={morph} shadowOpacity={ramp(morph, 0.1, 0.5)}>
            <BrowserFrame
              width={FRAME.w}
              height={FRAME.h}
              url={frame < 512 ? "localhost:5173/events" : "localhost:5173/about"}
              viewport="1440 × 900"
              shadow={false}
            >
              <PageView scale={PAGE_SCALE} cssHeight={1504}>
                <Img src={capture("events").src} style={{ position: "absolute", width: 1440, height: 1504 }} />
                <Img src={capture("events-conference").src} style={{ position: "absolute", width: 1440, height: 1404, opacity: filtered }} />
                <NavLinkHover rect={NAV_ABOUT} progress={aboutHover} />
              </PageView>
              <SpotlightWipe progress={wipe} origin={{ x: (aboutCenter.x - CONTENT.x), y: aboutCenter.y - CONTENT.y }} width={CONTENT.w} height={CONTENT.h}>
                <PageView scale={PAGE_SCALE} cssHeight={1415} scroll={aboutScroll}>
                  <Img src={capture("about").src} style={{ display: "block", width: 1440, height: 1415 }} />
                </PageView>
              </SpotlightWipe>
            </BrowserFrame>
          </MorphClip>
          <BezelReplica from={fromRect} progress={morph} />
        </>
      ) : null}

      {/* Inspector notes on the Events page */}
      <AbsoluteFill style={{ clipPath: `inset(${CONTENT.y}px ${WIDTH - CONTENT.x - CONTENT.w}px ${HEIGHT - CONTENT.y - CONTENT.h}px ${CONTENT.x}px round 14px)` }}>
        <InspectBox rect={pageRectToScreen(SELECT, 0, 6)} tag="Type = Conference" progress={ramp(frame, 436, 18)} out={ramp(frame, 486, 14)} tagSide="bottom" />
        <InspectBox
          rect={pageRectToScreen(unionRect(rectOf("events-conference", "card0"), rectOf("events-conference", "card1")), 0, 8)}
          tag="2 results · client-side filter"
          progress={ramp(frame, 446, 18)}
          out={ramp(frame, 486, 14)}
          radius={16}
        />
      </AbsoluteFill>

      <Cursor
        at={cursorAt}
        kind={overLink ? "hand" : "arrow"}
        press={press}
        clickAge={clickAge}
        opacity={ramp(frame, 0, 10) * (1 - ramp(frame, 560, 24))}
      />
    </AbsoluteFill>
  );
};

/** The navbar link's hover colour (`hover:text-primary`) over the capture. */
const NavLinkHover = ({ rect, progress }: { rect: Rect; progress: number }) =>
  progress > 0 ? (
    <div
      style={{
        position: "absolute",
        left: rect.x - 2,
        top: rect.y,
        width: rect.w + 4,
        height: rect.h,
        background: color.surface,
        fontFamily: fonts.sans,
        fontSize: 18,
        lineHeight: "28px",
        textAlign: "center",
        color: mixColor(color.muted, color.primary, progress),
      }}
    >
      About
    </div>
  ) : null;

/** The glass bezel and photo, growing with the morph window and dissolving. */
const BezelReplica = ({ from, progress }: { from: Rect & { r: number }; progress: number }) => {
  const fade = 1 - EASE_SOFT(clamp((progress - 0.04) / 0.4));
  if (fade <= 0) return null;
  const cur = {
    x: mix(from.x, FRAME.x, progress),
    y: mix(from.y, FRAME.y, progress),
    w: mix(from.w, FRAME.w, progress),
    h: mix(from.h, FRAME.h, progress),
    r: mix(from.r, FRAME.r, progress),
  };
  const k = cur.w / from.w;
  return (
    <div
      style={{
        position: "absolute",
        left: cur.x,
        top: cur.y,
        width: cur.w,
        height: cur.h,
        borderRadius: cur.r,
        padding: 8 * k,
        opacity: fade,
        border: "1px solid rgba(255, 255, 255, 0.08)",
        background: `linear-gradient(to bottom right, ${color.deep}, ${color.night})`,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: Math.max(0, cur.r - 8 * k), overflow: "hidden" }}>
        <Img src={FORMATS[CONFERENCES].image} style={{ width: "100%", height: "100%", objectFit: "cover", scale: "1.03" }} />
      </div>
    </div>
  );
};
