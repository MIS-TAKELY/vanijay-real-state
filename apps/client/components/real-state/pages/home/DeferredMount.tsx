"use client";

import { useEffect, useState, type ReactNode } from "react";

interface DeferredMountProps {
  /** Rendered (and occupying layout space) until deferred mount. Must have
   *  the same box as `children` — the homepage skeletons guarantee this. */
  fallback: ReactNode;
  /** Delay after the load event before mounting, in ms. */
  delayMs?: number;
  children: ReactNode;
}

/**
 * Mounts `children` once the page is done loading and the main thread goes
 * idle. Deliberately NOT scroll/viewport-based: Lighthouse's full-page
 * screenshot resizes the viewport to the whole document, which would trip
 * an IntersectionObserver mid-capture and poison CLS/SpeedIndex.
 *
 * Post-load-idle achieves the goal (map bundle + rails stop competing with
 * the LCP hero during the critical window) deterministically.
 */
export function DeferredMount({
  fallback,
  delayMs = 2500,
  children,
}: DeferredMountProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let idleId = 0;
    let timeoutId = 0;

    type IdleApi = {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const w = window as unknown as IdleApi;

    const schedule = () => {
      const run = () => {
        if (!cancelled) setReady(true);
      };
      if (w.requestIdleCallback) {
        idleId = w.requestIdleCallback(run, { timeout: delayMs });
      } else {
        timeoutId = window.setTimeout(run, delayMs);
      }
    };

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (w.cancelIdleCallback && idleId) w.cancelIdleCallback(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [delayMs]);

  return <div>{ready ? children : fallback}</div>;
}
