// Calls onChange(true | false) as `element` enters or leaves the viewport.
// Used to pause animation loops that nobody can see. The margin starts them
// again a little before the element scrolls into view.
export function watchVisibility(element, onChange, margin = "200px") {
  if (typeof IntersectionObserver === "undefined") {
    onChange(true);
    return () => {};
  }

  const observer = new IntersectionObserver(
    ([entry]) => onChange(entry.isIntersecting),
    { rootMargin: margin }
  );
  observer.observe(element);
  return () => observer.disconnect();
}

// Runs onFrame(elapsedMs) on every animation frame, but only while `element`
// is on screen. Elapsed time accumulates from frame deltas, so a resume
// continues the animation smoothly instead of jumping ahead. Returns a
// cleanup function that stops the loop and the observer.
export function runWhileVisible(element, onFrame, margin) {
  let rafId = 0;
  let elapsed = 0;
  let lastTime = null;

  const frame = (time) => {
    rafId = requestAnimationFrame(frame);
    if (lastTime !== null) elapsed += time - lastTime;
    lastTime = time;
    onFrame(elapsed);
  };

  const start = () => {
    if (rafId) return;
    lastTime = null;
    rafId = requestAnimationFrame(frame);
  };
  const stop = () => {
    cancelAnimationFrame(rafId);
    rafId = 0;
  };

  const unwatch = watchVisibility(element, (visible) => (visible ? start() : stop()), margin);

  return () => {
    unwatch();
    stop();
  };
}
