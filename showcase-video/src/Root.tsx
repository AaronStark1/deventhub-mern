import { Composition, Folder } from "remotion";
import { BANNER, ReadmeBanner } from "./readme/Banner";
import media from "./readme/media.json";
import { ReadmeActs, ReadmeTeaser, TEASER_DURATION } from "./readme/Reel";
import { ReadmeShots, SHOT } from "./readme/Shots";
import { Showcase } from "./Showcase";
import { DURATION, FPS, HEIGHT, WIDTH } from "./theme/tokens";

export const RemotionRoot = () => (
  <>
    <Composition
      id="DevEventHubShowcase"
      component={Showcase}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />

    {/* Rendered into ../docs/media by `npm run readme:media` */}
    <Folder name="README">
      <Composition id="ReadmeTeaser" component={ReadmeTeaser} durationInFrames={TEASER_DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="ReadmeBanner" component={ReadmeBanner} durationInFrames={media.banner.length} fps={FPS} width={BANNER.width} height={BANNER.height} />
      <Composition id="ReadmeShots" component={ReadmeShots} durationInFrames={media.shots.length} fps={FPS} width={SHOT.width} height={SHOT.height} />
      <Composition id="ReadmeActs" component={ReadmeActs} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
    </Folder>
  </>
);
