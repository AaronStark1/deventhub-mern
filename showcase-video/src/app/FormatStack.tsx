// The "What We Host" section as world geometry: heading + the four format
// cards at their measured layout positions, transformed by the ported
// ScrollStack maths for a given (section-relative) scroll position.
import { footerLayout, formatsLayout } from "../lib/captures";
import type { Rect } from "../lib/geometry";
import { pinEndFor, stackTransforms, type StackOptions } from "../lib/scrollStack";
import { fonts } from "../theme/fonts";
import { color } from "../theme/tokens";
import { type CardState, FormatCard } from "./FormatCard";
import { CONFERENCES, FORMATS, STACK } from "./formats";

export const VIEWPORT_H = 900;
export const SECTION = formatsLayout;

export const STACK_OPTS: StackOptions = {
  itemScale: STACK.itemScale,
  baseScale: STACK.baseScale,
  itemStackDistance: STACK.itemStackDistance,
  stackPosition: STACK.stackPositionRatio * VIEWPORT_H,
  scaleEndPosition: STACK.scaleEndPositionRatio * VIEWPORT_H,
  viewportHeight: VIEWPORT_H,
  // Document height − viewport − section top, as measured in the app.
  maxScroll: footerLayout.pageHeight - VIEWPORT_H - SECTION.sectionTop,
};

/** Scroll position at which the last card lands and the stack releases. */
export const PIN_END = pinEndFor(SECTION.cardTops, STACK_OPTS);

/** The Conferences card once the stack has settled (section coordinates). */
export const CONF_RECT: Rect = {
  x: SECTION.cardLeft,
  y: SECTION.cardTops[CONFERENCES],
  w: SECTION.cardWidth,
  h: SECTION.cardHeight,
};

/** Card-local point → section coordinates, for the settled Conferences card. */
export const onConf = (x: number, y: number) => ({ x: CONF_RECT.x + x, y: CONF_RECT.y + y });

export const FormatStack = ({
  scroll,
  depth = 0,
  states = [],
  heading = true,
  noise,
}: {
  scroll: number;
  /** 0 → flat like the app; 1 → stacked cards separated in Z for the tilt. */
  depth?: number;
  states?: CardState[];
  heading?: boolean;
  noise?: number;
}) => {
  const tf = stackTransforms(scroll, SECTION.cardTops, STACK_OPTS);
  return (
    <>
      {heading ? (
        <h2
          style={{
            position: "absolute",
            left: SECTION.heading.x,
            top: SECTION.heading.y,
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: 36,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: color.text,
            whiteSpace: "nowrap",
          }}
        >
          What We Host
        </h2>
      ) : null}
      {FORMATS.map((format, i) => (
        <div
          key={format.title}
          style={{
            position: "absolute",
            left: SECTION.cardLeft,
            top: SECTION.cardTops[i],
            width: SECTION.cardWidth,
            transformOrigin: "top center",
            transform: `translate3d(0, ${tf[i].translateY}px, ${-(1 - tf[i].scale) * 1600 * depth}px) scale(${tf[i].scale})`,
          }}
        >
          <FormatCard
            format={format}
            index={i}
            vw={1440}
            height={SECTION.cardHeight}
            state={noise === undefined ? states[i] : { ...states[i], noise }}
          />
        </div>
      ))}
    </>
  );
};

/** Index of the card currently on top of the stack for a scroll position. */
export const topCardAt = (scroll: number) => {
  let top = 0;
  SECTION.cardTops.forEach((t, i) => {
    if (scroll >= t - STACK_OPTS.stackPosition - STACK_OPTS.itemStackDistance * i - 260) top = i;
  });
  return top;
};
