// Typed access to src/generated/captures.json, written by `npm run capture`.
import { staticFile } from "remotion";
import manifest from "../generated/captures.json";
import type { Rect } from "./geometry";

type Capture = {
  file: string;
  width: number;
  height: number;
  top: number;
  rects: Record<string, Rect>;
};

type CardLayout = {
  card: { w: number; h: number };
  eyebrow: Rect;
  title: Rect;
  body: Rect;
  bodyBlock: Rect;
  pills: Rect[];
  bezel: Rect;
  frame: Rect;
};

type Manifest = {
  viewport: { width: number; height: number };
  captures: Record<string, Capture>;
  data: {
    rotating: {
      lead: Record<string, string>;
      pill: Record<string, string>;
      gap: string;
      widths: Record<string, number>;
    };
  };
  layout: {
    card: Record<string, CardLayout>;
    formats: {
      sectionTop: number;
      sectionHeight: number;
      paddingTop: number;
      paddingBottom: number;
      heading: { x: number; y: number; h: number };
      shell: { left: number; width: number; padding: number };
      cardTops: number[];
      cardHeight: number;
      cardWidth: number;
      cardLeft: number;
    };
    footer: {
      top: number;
      w: number;
      h: number;
      logo: Rect;
      tagline: Rect;
      links: (Rect & { label: string })[];
      github: Rect;
      divider: Rect;
      pageHeight: number;
    };
  };
};

const m = manifest as unknown as Manifest;

export const captureSrc = (name: string) => {
  const c = m.captures[name];
  if (!c) throw new Error(`Missing capture "${name}". Run \`npm run capture\` with the app running.`);
  return staticFile(c.file);
};

export const capture = (name: string): Capture & { src: string } => ({
  ...m.captures[name],
  src: captureSrc(name),
});

export const rectOf = (captureName: string, rect: string): Rect => {
  const r = m.captures[captureName]?.rects[rect];
  if (!r) throw new Error(`Missing rect ${captureName}.${rect}. Re-run \`npm run capture\`.`);
  return r;
};

export const rotating = m.data.rotating;
export const cardLayout = (vw: 1440 | 768 | 390) => m.layout.card[String(vw)];
export const formatsLayout = m.layout.formats;
export const footerLayout = m.layout.footer;
