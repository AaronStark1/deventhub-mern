import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

// Browsers keep the scroll position across client-side navigations, so a
// new page would otherwise open halfway down.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
