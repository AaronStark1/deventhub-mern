import { Composition } from "remotion";
import { Showcase } from "./Showcase";

export const RemotionRoot = () => (
  <Composition
    id="DevEventHubShowcase"
    component={Showcase}
    durationInFrames={3600}
    fps={60}
    width={1920}
    height={1080}
  />
);
