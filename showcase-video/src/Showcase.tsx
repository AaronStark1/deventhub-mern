import { AbsoluteFill, Sequence } from "remotion";
import { Act1Brand } from "./acts/Act1Brand";
import { Act2Platform } from "./acts/Act2Platform";
import { Act3Formats } from "./acts/Act3Formats";
import { Act4Interactions } from "./acts/Act4Interactions";
import { Act5Responsive } from "./acts/Act5Responsive";
import { Act6Footer } from "./acts/Act6Footer";
import { Canvas } from "./primitives/Canvas";
import { Hud } from "./primitives/Hud";
import { fonts } from "./theme/fonts";
import { color } from "./theme/tokens";
import { SEQ } from "./timeline";

// Tailwind preflight, the parts the ported components rely on.
const PREFLIGHT = `
*, *::before, *::after { box-sizing: border-box; }
p, h1, h2, h3, ul, li { margin: 0; padding: 0; }
ul { list-style: none; }
img { display: block; }
`;

export const Showcase = () => (
  <AbsoluteFill style={{ background: color.canvas, fontFamily: fonts.sans, overflow: "hidden" }}>
    <style>{PREFLIGHT}</style>
    <Canvas />

    <Sequence name="Act 1 · Brand" {...SEQ.act1}>
      <Act1Brand />
    </Sequence>
    {/* Act 3 sits under Act 2: the route wall flies past it during the push */}
    <Sequence name="Act 3 · Formats" {...SEQ.act3}>
      <Act3Formats />
    </Sequence>
    <Sequence name="Act 2 · Platform" {...SEQ.act2}>
      <Act2Platform />
    </Sequence>
    <Sequence name="Act 4 · Interaction" {...SEQ.act4}>
      <Act4Interactions />
    </Sequence>
    <Sequence name="Act 5 · Responsive" {...SEQ.act5}>
      <Act5Responsive />
    </Sequence>
    <Sequence name="Act 6 · Footer" {...SEQ.act6}>
      <Act6Footer />
    </Sequence>

    <Hud />
  </AbsoluteFill>
);
