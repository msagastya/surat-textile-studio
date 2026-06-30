import { useState, useEffect } from "react";

export function useBreakpoint() {
  const [w, setW] = useState(() => window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h, { passive: true });
    return () => window.removeEventListener("resize", h);
  }, []);
  return {
    w,
    isMobile:  w < 640,
    isTablet:  w < 1024,
    isDesktop: w >= 1024,
  };
}
