"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "@repo/ui";

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
 * - `install()` — triggers the native install prompt, or shows manual
 *   instructions when the browser doesn't support the prompt API (iOS, HTTP)
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
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setDeferredPrompt(null);
        return true;
      }
      return false;
    }

    // Fallback: show manual-install instructions via toast
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isIOS) {
      toast.info(
        "Tap the Share button (↗) below, then choose 'Add to Home Screen'.",
        { duration: 8000 },
      );
    } else if (isAndroid) {
      toast.info(
        "Tap the ⋮ menu in your browser, then tap 'Install app' or 'Add to Home Screen'.",
        { duration: 8000 },
      );
    } else {
      toast.info(
        "Use your browser's menu to install this app, or visit this page on HTTPS for automatic install.",
        { duration: 8000 },
      );
    }
    return false;
  }, [deferredPrompt]);

  return {
    canInstall: !!deferredPrompt,
    isInstalled,
    install,
  };
}
