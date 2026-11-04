// Pure port of the per-card maths in
// event-hub-frontend/src/components/animations/ScrollStack.jsx
// (updateCardTransforms), so the reel can "scroll" the real stack behaviour
// frame by frame instead of approximating it.
import { clamp } from "./motion";

export type StackOptions = {
  itemScale: number;
  baseScale: number;
  itemStackDistance: number;
  stackPosition: number; // px from the viewport top
  scaleEndPosition: number; // px from the viewport top
  viewportHeight: number;
  maxScroll: number;
};

export type CardTransform = { translateY: number; scale: number };

/** `scrollTop` and `cardTops` share one coordinate space (here: section-relative). */
export function stackTransforms(scrollTop: number, cardTops: number[], o: StackOptions): CardTransform[] {
  const last = cardTops.length - 1;
  const stackPositionPx = Math.min(
    Math.max(o.stackPosition, cardTops[last] - o.itemStackDistance * last - o.maxScroll),
    o.viewportHeight * 0.45
  );
  const pinEnd = cardTops[last] - stackPositionPx - o.itemStackDistance * last;

  return cardTops.map((top, i) => {
    const triggerStart = top - stackPositionPx - o.itemStackDistance * i;
    const triggerEnd = top - o.scaleEndPosition;
    const progress = clamp((scrollTop - triggerStart) / (triggerEnd - triggerStart));
    const targetScale = o.baseScale + i * o.itemScale;
    const scale = 1 - progress * (1 - targetScale);

    let translateY = 0;
    if (scrollTop >= triggerStart && scrollTop <= pinEnd) {
      translateY = scrollTop - top + stackPositionPx + o.itemStackDistance * i;
    } else if (scrollTop > pinEnd) {
      translateY = pinEnd - top + stackPositionPx + o.itemStackDistance * i;
    }
    return { translateY, scale };
  });
}

export function pinEndFor(cardTops: number[], o: StackOptions) {
  const last = cardTops.length - 1;
  const stackPositionPx = Math.min(
    Math.max(o.stackPosition, cardTops[last] - o.itemStackDistance * last - o.maxScroll),
    o.viewportHeight * 0.45
  );
  return cardTops[last] - stackPositionPx - o.itemStackDistance * last;
}
