// The "What We Host" section around the Conferences card, laid out for a
// given browser viewport (vw × vh): faithful backdrop, .shell gutters, and
// the card centred where a reader scrolled to it would see it.
import { cardLayout } from "../lib/captures";
import { color } from "../theme/tokens";
import { type CardState, cardMetrics, FormatCard } from "./FormatCard";
import { CONFERENCES, FORMATS } from "./formats";
import { FormatsBackdrop } from "./Footer";

// The app's stack is `auto-rows-fr`: every card is as tall as the tallest
// one at that width, so use the heights measured in the running app.
const equalisedHeight = (vw: number) =>
  vw === 1440 || vw === 768 || vw === 390 ? cardLayout(vw).card.h : undefined;

export const ResponsiveView = ({ vw, vh, state }: { vw: number; vh: number; state?: CardState }) => {
  const { shellPad } = cardMetrics(vw);
  const cardWidth = Math.min(vw, 1200) - shellPad * 2;
  return (
    <div style={{ position: "relative", width: vw, height: vh, overflow: "hidden", background: color.bg }}>
      <FormatsBackdrop />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: cardWidth }}>
          <FormatCard format={FORMATS[CONFERENCES]} index={CONFERENCES} vw={vw} height={equalisedHeight(vw)} state={state} />
        </div>
      </div>
    </div>
  );
};
