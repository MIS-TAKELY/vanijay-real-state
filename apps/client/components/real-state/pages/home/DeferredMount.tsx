"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface DeferredMountProps {
  /** Rendered (and occupying layout space) until the section scrolls near
   *  the viewport. Must have the same box as `children` to avoid CLS — the
   *  homepage skeletons already guarantee this. */
  fallback: ReactNode;
  /** How far before entering the viewport to start loading, in px. */
  rootMargin?: string;
  children: ReactNode;
}

/**
 * Mounts `children` only once the wrapper approaches the viewport.
 * Below-fold sections (map bundle, API rails) stop competing with the
 * LCP hero for bandwidth and main-thread time during initial load.
 */
export function DeferredMount({
  fallback,
  rootMargin = "400px",
  children,
}: DeferredMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible || !ref.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return <div ref={ref}>{visible ? children : fallback}</div>;
}
