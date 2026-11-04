// The live landing page as the reel shows it: Playwright captures of the
// navbar, Featured Events ring and globe, with the hero rebuilt in layers —
// the frame-driven Balatro shader underneath, the captured hero (shader
// removed, transparent) on top, and the rotating line animated live.
import { Img } from "remotion";
import { capture } from "../lib/captures";
import { color } from "../theme/tokens";
import { Balatro, HERO_BALATRO } from "./Balatro";
import { RotatingLine } from "./RotatingLine";

export const LANDING_WIDTH = 1440;

export const LandingCapture = ({
  frame,
  fps,
  rotations,
  shaderTime,
  scroll = 0,
}: {
  frame: number;
  fps: number;
  rotations: number[];
  shaderTime: number;
  scroll?: number;
}) => {
  const nav = capture("nav");
  const hero = capture("hero");
  const featured = capture("featured");
  const globe = capture("globe");
  const height = globe.top + globe.height;
  // The hero leaves the viewport (900px tall) once scrolled past its bottom.
  const heroVisible = scroll < hero.top + hero.height;

  return (
    <div style={{ position: "relative", width: LANDING_WIDTH, height, background: color.bg }}>
      <div style={{ position: "absolute", left: 0, top: hero.top, width: LANDING_WIDTH, height: hero.height, overflow: "hidden", background: "#10242b" }}>
        {heroVisible ? (
          <>
            <Balatro width={LANDING_WIDTH} height={hero.height} time={shaderTime} {...HERO_BALATRO} />
            <Img src={hero.src} style={{ position: "absolute", left: 0, top: 0, width: LANDING_WIDTH, height: hero.height }} />
            <RotatingLine frame={frame} fps={fps} rotations={rotations} heroTop={hero.top} />
          </>
        ) : null}
      </div>
      <Img src={nav.src} style={{ position: "absolute", left: 0, top: 0, width: LANDING_WIDTH, height: nav.height }} />
      <Img src={featured.src} style={{ position: "absolute", left: 0, top: featured.top, width: LANDING_WIDTH, height: featured.height }} />
      <Img src={globe.src} style={{ position: "absolute", left: 0, top: globe.top, width: LANDING_WIDTH, height: globe.height }} />
    </div>
  );
};

/** A full-viewport page capture (1440 × its height) at page coordinates. */
export const PageCapture = ({ name }: { name: string }) => {
  const c = capture(name);
  return <Img src={c.src} style={{ display: "block", width: c.width, height: c.height }} />;
};
