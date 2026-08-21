"use client";

import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Hook to detect and trigger the PWA install prompt.
 *
 * Returns:
 * - `canInstall` — true when the browser has a deferred install prompt
 * - `isInstalled` — true when the app is running in standalone mode
 * - `install()` — triggers the native install prompt
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Already running as installed PWA
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches
    ) {
      setIsInstalled(true);
      return;
    }

    // iOS Safari doesn't fire beforeinstallprompt — detect via heuristic
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
      // iOS doesn't support the install prompt API
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => setIsInstalled(true);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  return {
    canInstall: !!deferredPrompt,
    isInstalled,
    install,
  };
}
