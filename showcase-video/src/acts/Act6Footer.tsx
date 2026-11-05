// ACT 6 · 0:53–1:00 · Sage-teal footer craft & seamless loop.
//   0– 64  Shared-element morph: the 390px device frame expands into the
//          full-bleed desktop page (card stack settled, footer below).
//  64–150  Glide down; guides prove the card and footer share .shell edges
//          (x = 168 and 1272 at 1440).
// 150–300  Footer hovers: 1px underline drawing left → right with a −1px lift
//          on Home / Events / About, then the 40 × 40 GitHub button.
// 300–384  The footer's own logo tile flies to the end-card badge; the tagline
//          it sits beside becomes the closing lockup — Act 1's composition.
// 384–420  Loop out: everything retracts to the bare canvas frame 0 opens on.
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { BADGE, BrandLockup, WORD_COUNT } from "../app/BrandLockup";
import { Footer, FormatsBackdrop } from "../app/Footer";
import { FormatStack, PIN_END, SECTION } from "../app/FormatStack";
import { ResponsiveView } from "../app/ResponsiveView";
import { footerLayout } from "../lib/captures";
import { camera, lerpRect, type Point, type Rect } from "../lib/geometry";
import { clamp, cssTransition, EASE_EXIT, mix, ramp, springAt, springExact, track } from "../lib/motion";
import { BrowserFrame, frameContent } from "../primitives/BrowserFrame";
import { GuideLine, Readout, Tag } from "../primitives/Callout";
import { Cursor, cursorPath } from "../primitives/Cursor";
import { color, HEIGHT, WIDTH } from "../theme/tokens";
import { frameFor } from "./Act5Responsive";

const DURATION = 420;
const FOOTER_TOP = SECTION.sectionHeight; // footer follows the formats section
const PAGE_H = FOOTER_TOP + footerLayout.h;
const BLEED = WIDTH / 1440; // 1.3333: a 1440 page edge to edge
const SHELL_LEFT = SECTION.cardLeft; // 168
const SHELL_RIGHT = SECTION.cardLeft + SECTION.cardWidth; // 1272

const onFooter = (r: Rect): Rect => ({ x: r.x, y: FOOTER_TOP + r.y, w: r.w, h: r.h });
const LINK_RECTS = footerLayout.links.map(onFooter);
const GITHUB_RECT = onFooter(footerLayout.github);
const LOGO_RECT = onFooter(footerLayout.logo);
const centre = (r: Rect): Point => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

// Camera over the page (section coordinates).
const HOVER_ZOOM = 1.5; // the 1104px shell spans 1656px: edges stay clear of the HUD
const camAt = (frame: number) => {
  const y = track(frame, [
    [64, 1790],
    [150, PAGE_H - HEIGHT / BLEED / 2],
    [168, PAGE_H - HEIGHT / BLEED / 2],
    [204, PAGE_H - HEIGHT / HOVER_ZOOM / 2],
  ]);
  const zoom = track(frame, [
    [168, BLEED],
    [204, HOVER_ZOOM],
  ]);
  return camera({ x: 720, y }, zoom, WIDTH, HEIGHT);
};

const PATH_KEYS = (cam: ReturnType<typeof camAt>) => [
  { f: 172, ...cam.toScreen({ x: 520, y: PAGE_H + 60 }) },
  { f: 196, ...cam.toScreen(centre(LINK_RECTS[0])) },
  { f: 222, ...cam.toScreen(centre(LINK_RECTS[1])) },
  { f: 250, ...cam.toScreen(centre(LINK_RECTS[2])) },
  { f: 282, ...cam.toScreen(centre(GITHUB_RECT)) },
  { f: 300, ...cam.toScreen({ x: centre(GITHUB_RECT).x + 6, y: centre(GITHUB_RECT).y + 4 }) },
];

// The camera is static from frame 204, so hover hit-tests use its final pose.
const HOVER_CAM = camAt(204);
const cursorAt = (f: number) => cursorPath(f, PATH_KEYS(HOVER_CAM), 0.05);
const hits = (r: Rect) => {
  const s = HOVER_CAM.rectToScreen(r);
  return Array.from({ length: DURATION }, (_, f) => {
    if (f < 172 || f >= 300) return false;
    const p = cursorAt(f);
    return p.x >= s.x - 2 && p.x <= s.x + s.w + 2 && p.y >= s.y - 4 && p.y <= s.y + s.h + 4;
  });
};
const LINK_HITS = LINK_RECTS.map(hits);
const GITHUB_HITS = hits(GITHUB_RECT);

export const Act6Footer = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ---- 0–64: device frame → full-bleed page ---------------------------------
  const expand = springExact(frame, fps, 0, 64);
  const from = frameFor((390 * 840) / 844);
  const bleed = { x: -8, y: -44, w: WIDTH + 16, h: HEIGHT + 52, r: 0 };
  const f = lerpRect({ ...from, r: from.r }, bleed, expand);
  const content = frameContent(f.w, f.h);
  const fadeIn = clamp((expand - 0.12) / 0.45);

  // ---- Footer hover states --------------------------------------------------
  const links = LINK_HITS.map((h) => ({
    color: cssTransition(h, frame, 18),
    lift: cssTransition(h, frame, 18),
    underline: cssTransition(h, frame, 27),
  }));
  const github = { color: cssTransition(GITHUB_HITS, frame, 18), lift: cssTransition(GITHUB_HITS, frame, 18) };

  // ---- End card --------------------------------------------------------------
  const pageOut = ramp(frame, 300, 40);
  const fly = springExact(frame, fps, 302, 52);
  const cam = camAt(Math.min(frame, 300));
  const logoFrom = { ...cam.rectToScreen(LOGO_RECT), r: 10 * cam.zoom };
  const badgeRect = lerpRect(logoFrom, BADGE, fly);
  const words = Array.from({ length: WORD_COUNT }, (_, i) => ({
    enter: springAt(frame, fps, 320 + i * 6),
    exit: ramp(frame, 382 + i * 3, 24, EASE_EXIT),
  }));
  const out = ramp(frame, 380, 34, EASE_EXIT);

  const page = (
    <PageBottom
      links={links}
      github={github}
      logoOpacity={frame >= 302 ? 0 : 1}
    />
  );

  return (
    <AbsoluteFill>
      {frame < 64 ? (
        <div style={{ position: "absolute", left: f.x, top: f.y }}>
          <BrowserFrame
            width={f.w}
            height={f.h}
            radius={f.r}
            url="localhost:5173/"
            viewport={`${Math.round(mix(390, 1440, expand))} × ${Math.round(mix(844, 810, expand))}`}
          >
            {/* Outgoing: the stacked phone layout */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: (content.h - 844 * (content.w / 390)) / 2,
                width: 390,
                height: 844,
                transformOrigin: "0 0",
                scale: `${content.w / 390}`,
                opacity: 1 - fadeIn,
              }}
            >
              <ResponsiveView vw={390} vh={844} state={{ columns: 1 - expand }} />
            </div>
            {/* Incoming: the desktop page, centred on the same card */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transformOrigin: "0 0",
                transform: `translate(0px, ${content.h / 2 - 1790 * (content.w / 1440)}px) scale(${content.w / 1440})`,
                opacity: fadeIn,
              }}
            >
              {page}
            </div>
          </BrowserFrame>
        </div>
      ) : pageOut < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - pageOut }}>
          <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: cam.transform }}>{page}</div>
        </AbsoluteFill>
      ) : null}

      {/* Shell guides: card edges ≡ footer edges */}
      {[SHELL_LEFT, SHELL_RIGHT].map((x, i) => {
        const top = cam.toScreen({ x, y: SECTION.cardTops[3] });
        return (
          <GuideLine
            key={x}
            x={top.x + (i === 0 ? -0.5 : 0.5)}
            y1={Math.max(top.y, 120)}
            y2={HEIGHT}
            progress={ramp(frame, 92 + i * 8, 40)}
            out={ramp(frame, 296, 18)}
            tag={i === 0 ? `x = ${SHELL_LEFT} · card ≡ logo` : `x = ${SHELL_RIGHT} · card ≡ GitHub`}
            tagAlign={i === 0 ? "left" : "right"}
            tagY={Math.max(top.y, 120) + 14}
          />
        );
      })}
      {frame >= 112 && frame < 316 ? (
        <Tag
          x={960}
          y={cam.toScreen({ x: 0, y: FOOTER_TOP }).y - 40}
          progress={ramp(frame, 118, 20) * (1 - ramp(frame, 296, 18))}
        >
          .shell · max-w 1200 · padding 48 → same edges
        </Tag>
      ) : null}

      <Readout
        x={cam.toScreen({ x: SHELL_LEFT, y: 0 }).x + 4}
        y={cam.toScreen({ x: 0, y: SECTION.cardTops[3] + SECTION.cardHeight }).y + 34}
        opacity={ramp(frame, 176, 16) * (1 - ramp(frame, 296, 14))}
        rows={
          frame < 268
            ? [
                ["LINK-UNDERLINE", "1PX · SCALEX 0 → 1 · 450MS"],
                ["LIFT", "−1PX · 300MS · CUBIC-BEZIER(.22,1,.36,1)"],
              ]
            : [
                ["GITHUB", "40 × 40 · ROUNDED-FULL"],
                ["HOVER", "BORDER DEEP/15 → /30 · BG WHITE/40 · −1PX"],
              ]
        }
      />

      <Cursor
        at={frame < 172 ? PATH_KEYS(HOVER_CAM)[0] : cursorAt(frame)}
        kind={frame >= 190 ? "hand" : "arrow"}
        opacity={ramp(frame, 168, 10) * (1 - ramp(frame, 296, 12))}
      />

      {/* End card: the footer's logo becomes the badge */}
      {frame >= 300 ? (
        <BrandLockup
          s={{
            glow: ramp(frame, 314, 60) * (1 - out),
            breathe: Math.sin(frame / 38),
            badge: frame < 360 ? 1 : 1 - ramp(frame, 384, 30, EASE_EXIT),
            badgeRect: frame < 360 ? badgeRect : undefined,
            eyebrowChars: Math.floor((frame - 318) * 0.9),
            eyebrowOpacity: 1 - out,
            words,
            hairline: ramp(frame, 330, 44),
            hairlineOut: out,
            rowChars: Math.floor((frame - 334) * 2.2),
            rowOpacity: 1 - out,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/** The landing page's last stretch: settled stack, section padding, footer. */
const PageBottom = ({
  links,
  github,
  logoOpacity,
}: {
  links: { color: number; lift: number; underline: number }[];
  github: { color: number; lift: number };
  logoOpacity: number;
}) => (
  <div style={{ position: "relative", width: 1440, height: PAGE_H, background: color.bg }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1440, height: FOOTER_TOP, overflow: "hidden" }}>
      <FormatsBackdrop />
      <FormatStack scroll={PIN_END} heading={false} />
    </div>
    <div style={{ position: "absolute", left: 0, top: FOOTER_TOP, width: 1440 }}>
      <Footer vw={1440} active={0} links={links} github={github} logoOpacity={logoOpacity} />
    </div>
  </div>
);

