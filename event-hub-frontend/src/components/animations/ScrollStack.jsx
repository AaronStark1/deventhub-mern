import { useLayoutEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';

// Structural classes only — padding, radius, shadow and size come from the
// caller via `itemClassName`, so they can't fight a caller's own utilities.
// Extra props (data-*, pointer handlers) land on the card element.
export const ScrollStackItem = ({ children, itemClassName = '', style, ...rest }) => (
  <div
    className={`scroll-stack-card relative w-full box-border origin-top will-change-transform ${itemClassName}`.trim()}
    style={{
      backfaceVisibility: 'hidden',
      transformStyle: 'preserve-3d',
      ...style
    }}
    {...rest}
  >
    {children}
  </div>
);

// Layout position of an element, ignoring CSS transforms. getBoundingClientRect
// would include a pinned card's own translateY and feed it back into the next
// frame's maths.
const layoutTop = (element, stopAt) => {
  let top = 0;
  let node = element;
  while (node && node !== stopAt) {
    top += node.offsetTop;
    node = node.offsetParent;
  }
  return top;
};

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  innerClassName = 'px-4 sm:px-10 lg:px-20',
  onStackComplete
}) => {
  const scrollerRef = useRef(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef(null);
  const lenisRef = useRef(null);
  const cardsRef = useRef([]);
  const layoutRef = useRef({ cardTops: [], viewportHeight: 0, maxScroll: Infinity });
  const lastTransformsRef = useRef(new Map());
  const isUpdatingRef = useRef(false);

  const calculateProgress = useCallback((scrollTop, start, end) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value, containerHeight) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value);
  }, []);

  const getScrollTop = useCallback(
    () => (useWindowScroll ? window.scrollY : (scrollerRef.current?.scrollTop ?? 0)),
    [useWindowScroll]
  );

  // Every DOM read happens here, once per layout change — never per frame.
  // The per-frame update below is then write-only, so scrolling can't
  // thrash layout.
  const measure = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const stopAt = useWindowScroll ? null : scroller;

    const viewportHeight = useWindowScroll ? window.innerHeight : scroller.clientHeight;
    const scrollHeight = useWindowScroll
      ? document.documentElement.scrollHeight
      : scroller.scrollHeight;

    layoutRef.current = {
      cardTops: cardsRef.current.map(card => layoutTop(card, stopAt)),
      viewportHeight,
      maxScroll: scrollHeight - viewportHeight
    };
  }, [useWindowScroll]);

  const updateCardTransforms = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length || isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    const scrollTop = getScrollTop();
    const { cardTops, viewportHeight: containerHeight, maxScroll } = layoutRef.current;
    const lastIndex = cards.length - 1;
    // On viewports tall relative to what follows the stack, scrolling bottoms
    // out before the last card reaches its slot and the stack never closes.
    // Lower the slot just enough that the last card lands at max scroll
    // (capped, so a very short page doesn't pin cards near the bottom).
    const stackPositionPx = Math.min(
      Math.max(
        parsePercentage(stackPosition, containerHeight),
        cardTops[lastIndex] - itemStackDistance * lastIndex - maxScroll
      ),
      containerHeight * 0.45
    );
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);
    // Release the stack the moment the last card lands in its slot. The last
    // card then never moves off its layout position, so the stack's bottom
    // edge is exactly where layout puts it and the space after it is just
    // the container's padding. (Pinning past that point would need a spacer,
    // which turns into dead space on viewports too tall for the last card to
    // ever reach its slot.)
    const pinEnd = cardTops[lastIndex] - stackPositionPx - itemStackDistance * lastIndex;

    // Which card is currently on top of the stack — only needed for blur.
    let topCardIndex = 0;
    if (blurAmount) {
      for (let j = 0; j < cards.length; j++) {
        if (scrollTop >= cardTops[j] - stackPositionPx - itemStackDistance * j) {
          topCardIndex = j;
        }
      }
    }

    cards.forEach((card, i) => {
      if (!card) return;

      const cardTop = cardTops[i];
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = triggerStart;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;
      const blur = blurAmount && i < topCardIndex ? Math.max(0, (topCardIndex - i) * blurAmount) : 0;

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      const newTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100
      };

      const lastTransform = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.1;

      if (hasChanged) {
        card.style.transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        card.style.filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : '';
        lastTransformsRef.current.set(i, newTransform);
      }

      if (i === cards.length - 1) {
        // Complete once the last card has landed (it releases immediately).
        const isComplete = scrollTop >= pinStart;
        if (isComplete && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isComplete && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    onStackComplete,
    calculateProgress,
    parsePercentage,
    getScrollTop
  ]);

  const handleScroll = useCallback(() => {
    updateCardTransforms();
  }, [updateCardTransforms]);

  const setupLenis = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const options = {
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Eased wheel scrolling is motion the user didn't ask for.
      smoothWheel: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      touchMultiplier: 2,
      infinite: false,
      wheelMultiplier: 1,
      lerp: 0.1,
      // Touch devices keep native scrolling: smoothing touch input adds
      // latency that reads as lag on phones. Wheel scrolling is still eased.
      syncTouch: false
    };

    const lenis = useWindowScroll
      ? new Lenis(options)
      : new Lenis({
          ...options,
          wrapper: scroller,
          content: scroller.querySelector('.scroll-stack-inner')
        });

    lenis.on('scroll', handleScroll);

    const raf = time => {
      lenis.raf(time);
      animationFrameRef.current = requestAnimationFrame(raf);
    };
    animationFrameRef.current = requestAnimationFrame(raf);

    lenisRef.current = lenis;
  }, [handleScroll, useWindowScroll]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const cards = Array.from(scroller.querySelectorAll('.scroll-stack-card'));
    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.willChange = 'transform, filter';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
      card.style.transform = 'translateZ(0)';
      card.style.webkitTransform = 'translateZ(0)';
      card.style.perspective = '1000px';
      card.style.webkitPerspective = '1000px';
    });

    measure();
    setupLenis();
    updateCardTransforms();

    // Re-measure when the content or viewport changes size: images finishing
    // loading, orientation changes, the mobile URL bar collapsing.
    const relayout = () => {
      measure();
      updateCardTransforms();
    };
    const resizeObserver = new ResizeObserver(relayout);
    resizeObserver.observe(scroller);
    cards.forEach(card => resizeObserver.observe(card));
    // Card tops are document offsets in window mode, so content *above* the
    // stack changing height (web fonts re-wrapping text, images loading)
    // moves them without resizing anything observed above. Any such shift
    // also resizes <body>.
    if (useWindowScroll) resizeObserver.observe(document.body);
    window.addEventListener('resize', relayout);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', relayout);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
      stackCompletedRef.current = false;
      cardsRef.current = [];
      transformsCache.clear();
      isUpdatingRef.current = false;
    };
  }, [itemDistance, useWindowScroll, measure, setupLenis, updateCardTransforms]);

  // Container styles based on scroll mode
  const containerStyles = useWindowScroll
    ? {
        // Global scroll mode - no overflow constraints
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)'
      }
    : {
        // Container scroll mode - original behavior
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        willChange: 'scroll-position'
      };

  const containerClassName = useWindowScroll
    ? `relative w-full ${className}`.trim()
    : `relative w-full h-full overflow-y-auto overflow-x-visible ${className}`.trim();

  return (
    <div className={containerClassName} ref={scrollerRef} style={containerStyles}>
      <div className={`scroll-stack-inner ${innerClassName}`.trim()}>
        {children}
      </div>
    </div>
  );
};

export default ScrollStack;
