// ACT 2 · 0:08–0:20 · Hero & core platform walkthrough.
//  0– 84  Shared-element morph: the logo badge opens into the browser frame.
// 84–330  Hero: live Balatro shader, rotating line, inspector overlays for the
//         centred axis, the nav's max-w-7xl container, value prop and CTAs.
// 330–520 The page scrolls through Featured Events (3D ring) and the globe.
// 520–660 Route wall: the landing card settles into a 3 × 3 map of real routes.
// 660–750 Z-space parallax push: the wall flies past the lens with depth-of-
//         field blur while Act 3 scales in underneath (0.94 → 1).
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { BADGE } from "../app/BrandLockup";
import { LandingCapture } from "../app/LandingCapture";
import { LogoTile } from "../app/LogoTile";
import { ROTATION_INTERVAL } from "../app/RotatingLine";
import { CONTENT, FRAME, PAGE_SCALE, pageRectToScreen, pageToScreen, unionRect } from "../app/stage";
import { captureSrc, rectOf } from "../lib/captures";
import { lerpRect } from "../lib/geometry";
import { clamp, EASE_GLIDE, EASE_SOFT, mix, pulse, ramp, springExact, track } from "../lib/motion";
import { BrowserFrame, PageView } from "../primitives/BrowserFrame";
import { GuideLine, InspectBox } from "../primitives/Callout";
import { MorphClip, zDepth } from "../primitives/transitions";
import { fonts } from "../theme/fonts";
import { color, MONO_TRACKING } from "../theme/tokens";

// Route wall: 3 × 3 cards of the frame at 0.2824 scale.
const CARD_SCALE = 384 / FRAME.w;
const CARD = { w: 384, h: FRAME.h * CARD_SCALE };
const COL_X = [344, 768, 1192];
const ROW_Y = [87, 399, 711];
// `url` is what the capture actually loaded (real event ids from the API).
const ROUTES: { capture: string | null; route: string; url: string; note: string }[] = [
  { capture: "event-details", route: "/events/:id", url: "/events/695df3053fc543986581f17f", note: "Details" },
  { capture: "login", route: "/login", url: "/login", note: "Auth" },
  { capture: "payment-success", route: "/payment-success", url: "/payment-success?event=6984d3c49fd41de8eba92bee", note: "Registration" },
  { capture: "dashboard", route: "/dashboard", url: "/dashboard", note: "User" },
  { capture: null, route: "/", url: "/", note: "Landing" },
  { capture: "ticket", route: "/ticket/:id", url: "/ticket/6984d3c49fd41de8eba92bee", note: "A4 pass · PDF" },
  { capture: "host-dashboard", route: "/host/dashboard", url: "/host/dashboard", note: "Host" },
  { capture: "create-event", route: "/host/events/create", url: "/host/events/create", note: "Host" },
  { capture: "events-dark", route: "/events", url: "/events", note: "Dark theme" },
];
// Fly-in order: corners first, then edges, spiralling inwards.
const ORDER = [0, 4, 1, 6, 8, 3, 2, 5, 7];

const PERSPECTIVE = 1400;

export const Act2Platform = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ---- Timing --------------------------------------------------------------
  const morph = springExact(frame, fps, 0, 84);
  const scroll = track(frame, [
    [330, 0],
    [398, 905],
    [440, 948],
    [500, 1955],
    [540, 1985],
  ]);
  const push = track(frame, [
    [84, 1],
    [330, 1.03],
  ]);
  const toWall = springExact(frame, fps, 520, 64);
  // The camera dolly: one continuous acceleration from rest through the wall.
  const dolly = 1750 * Math.pow(clamp((frame - 600) / 148), 2.4);

  // Main frame transform: push-in during the hero, then into the centre cell.
  const center = { x: COL_X[1] + CARD.w / 2, y: ROW_Y[1] + CARD.h / 2 };
  const frameScale = mix(push, CARD_SCALE, toWall);
  const frameDy = mix(0, center.y - (FRAME.y + FRAME.h / 2), toWall);
  const landingZ = dolly;
  const landingDepth = zDepth(landingZ, { fadeFrom: 260, fadeTo: 700 });

  // ---- Hero overlays (page coords → screen) ----------------------------------
  const overlaysOut = ramp(frame, 300, 30);
  const navRect = unionRect(rectOf("nav", "navEvents"), rectOf("nav", "navAbout"));
  const ctaRect = unionRect(rectOf("hero-solid", "ctaExplore"), rectOf("hero-solid", "ctaHost"));
  const subtitle = rectOf("hero-solid", "subtitle");
  // The subtitle's block spans the container; its text is narrower.
  const subtitleText = { x: 336, y: subtitle.y - 2, w: 768, h: subtitle.h + 4 };
  const top = pageToScreen({ x: 0, y: 0 }, scroll).y;

  const rotations = [150, 150 + ROTATION_INTERVAL, 150 + ROTATION_INTERVAL * 2];

  return (
    <AbsoluteFill style={{ perspective: PERSPECTIVE, perspectiveOrigin: "960px 540px" }}>
      {/* Route map header */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 44,
          textAlign: "center",
          fontFamily: fonts.mono,
          fontSize: 14,
          lineHeight: "18px",
          letterSpacing: MONO_TRACKING,
          textTransform: "uppercase",
          color: color.hud,
          opacity: pulse(frame, 560, 30, 664, 30),
        }}
      >
        Route map <span style={{ color: color.signalDim }}>//</span> 15 routes · public · user · host
      </div>

      {/* The other eight routes */}
      {ROUTES.map((r, i) => {
        if (!r.capture) return null;
        const col = i % 3;
        const row = Math.floor(i / 3);
        const arrive = springExact(frame, fps, 532 + ORDER.indexOf(i) * 5, 56);
        const z = mix(-1700, 0, arrive) + dolly;
        const d = zDepth(z);
        return (
          <div
            key={r.route + r.note}
            style={{
              position: "absolute",
              left: COL_X[col],
              top: ROW_Y[row],
              width: CARD.w,
              transform: `translateZ(${z}px)`,
              opacity: clamp(arrive * 1.5) * d.opacity,
              filter: d.blur > 0.3 ? `blur(${d.blur.toFixed(2)}px)` : undefined,
            }}
          >
            <RouteCard capture={r.capture} url={r.url} />
            <RouteLabel route={r.route} note={r.note} progress={ramp(frame, 566 + ORDER.indexOf(i) * 3, 24)} />
          </div>
        );
      })}

      {/* The landing frame: morph in, push, settle into the centre cell, fly past */}
      <AbsoluteFill
        style={{
          transformOrigin: "960px 540px",
          transform: `translateZ(${landingZ}px) translateY(${frameDy}px) scale(${frameScale})`,
          opacity: landingDepth.opacity,
          filter: landingDepth.blur > 0.3 ? `blur(${landingDepth.blur.toFixed(2)}px)` : undefined,
        }}
      >
        <MorphClip from={BADGE} to={FRAME} progress={morph} shadowOpacity={ramp(morph, 0.15, 0.5)}>
          <BrowserFrame width={FRAME.w} height={FRAME.h} url="localhost:5173/" viewport="1440 × 900" shadow={false}>
            <PageView scale={PAGE_SCALE} scroll={scroll} cssHeight={2781}>
              <LandingCapture frame={frame} fps={fps} rotations={rotations} shaderTime={2.4 + frame / fps} scroll={scroll} />
            </PageView>
          </BrowserFrame>
        </MorphClip>

        {/* The badge face dissolves as its window opens */}
        {morph < 0.5 ? (
          <BadgeFace progress={morph} />
        ) : null}

        {/* Inspector overlays, clipped to the viewport they annotate */}
        <AbsoluteFill style={{ clipPath: `inset(${CONTENT.y}px ${1920 - CONTENT.x - CONTENT.w}px ${1080 - CONTENT.y - CONTENT.h}px ${CONTENT.x}px round 14px)` }}>
        <GuideLine
          x={pageToScreen({ x: 720, y: 0 }).x}
          y1={top + 300 * PAGE_SCALE}
          y2={top + 780 * PAGE_SCALE}
          dashed
          progress={ramp(frame, 104, 36)}
          out={overlaysOut}
          tag="Axis · 720 · centred"
        />
        {[104, 1336].map((x, i) => (
          <GuideLine
            key={x}
            x={pageToScreen({ x, y: 0 }).x}
            y1={CONTENT.y + 2}
            y2={CONTENT.y + CONTENT.h - 2}
            progress={ramp(frame, 122 + i * 6, 40)}
            out={overlaysOut}
            tag={i === 0 ? "max-w-7xl · 1280" : undefined}
            tagY={CONTENT.y + 96}
          />
        ))}
        <InspectBox rect={pageRectToScreen(navRect, scroll, 10)} tag="Nav // logo → / · Events · About" progress={ramp(frame, 140, 24)} out={overlaysOut} tagSide="bottom" />
        <InspectBox rect={pageRectToScreen(subtitleText, scroll, 6)} tag="Value prop" progress={ramp(frame, 166, 24)} out={overlaysOut} />
        <InspectBox rect={pageRectToScreen(ctaRect, scroll, 8)} tag="CTA // explore · host" progress={ramp(frame, 192, 24)} out={overlaysOut} radius={40} tagSide="bottom" />

        {/* Scroll overlays */}
        <InspectBox
          rect={pageRectToScreen({ x: 16, y: 1165, w: 1408, h: 699 }, scroll)}
          tag="Featured events // 3D image ring · live API"
          progress={ramp(frame, 404, 22)}
          out={ramp(frame, 438, 16)}
          radius={14}
        />
        <InspectBox
          rect={pageRectToScreen({ x: 498, y: 2239, w: 444, h: 444 }, scroll)}
          tag="A global community // cobe WebGL"
          progress={ramp(frame, 498, 22)}
          out={ramp(frame, 548, 18)}
          radius={222}
        />
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Centre-cell label, kept flat above the frame */}
      <div
        style={{
          position: "absolute",
          left: COL_X[1],
          top: ROW_Y[1],
          width: CARD.w,
          transform: `translateZ(${dolly}px)`,
          opacity: landingDepth.opacity,
        }}
      >
        <div style={{ height: CARD.h }} />
        <RouteLabel route="/" note="Landing" progress={ramp(frame, 580, 24)} />
      </div>
    </AbsoluteFill>
  );
};

const BadgeFace = ({ progress }: { progress: number }) => {
  const r = lerpRect(BADGE, FRAME, progress);
  const size = Math.min(r.w, r.h);
  return (
    <div
      style={{
        position: "absolute",
        left: r.x + r.w / 2 - size / 2,
        top: r.y + r.h / 2 - size / 2,
        opacity: 1 - EASE_SOFT(clamp(progress / 0.32)),
      }}
    >
      <LogoTile size={size} />
    </div>
  );
};

const RouteCard = ({ capture, url }: { capture: string; url: string }) => (
  <div style={{ position: "relative", width: CARD.w, height: CARD.h }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: FRAME.w, height: FRAME.h, transformOrigin: "0 0", scale: `${CARD_SCALE}` }}>
      <BrowserFrame width={FRAME.w} height={FRAME.h} url={`localhost:5173${url}`} viewport="1440 × 900">
        <PageView scale={PAGE_SCALE} cssHeight={900}>
          <Img src={captureSrc(capture)} style={{ display: "block", width: 1440, height: 900 }} />
        </PageView>
      </BrowserFrame>
    </div>
  </div>
);

const RouteLabel = ({ route, note, progress }: { route: string; note: string; progress: number }) => (
  <div
    style={{
      marginTop: 10,
      display: "flex",
      justifyContent: "space-between",
      fontFamily: fonts.mono,
      fontSize: 12.5,
      lineHeight: "16px",
      letterSpacing: "0.08em",
      opacity: progress,
      translate: `0 ${(1 - EASE_GLIDE(progress)) * 6}px`,
    }}
  >
    <span style={{ color: color.deep, fontWeight: 500 }}>{route}</span>
    <span style={{ color: color.hudFaint, textTransform: "uppercase", letterSpacing: MONO_TRACKING }}>{note}</span>
  </div>
);

