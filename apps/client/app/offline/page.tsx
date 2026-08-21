"use client";

import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = "/";
    } else {
      window.location.reload();
    }
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center">
      {/* Offline icon */}
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-surface-container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-on-surface-variant"
        >
          <line x1="2" y1="2" x2="22" y2="22" />
          <path d="M8.5 16.5a5 5 0 0 1 7 0" />
          <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
          <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
          <path d="M16.85 11.25a10 10 0 0 1 2.22 1.68" />
          <path d="M5 12.55a10 10 0 0 1 5.17-2.39" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      </div>

      {/* Title */}
      <h1 className="mb-3 font-headline-md text-2xl font-bold tracking-tight text-navy">
        You&apos;re Offline
      </h1>

      {/* Description */}
      <p className="mb-2 max-w-sm text-sm leading-relaxed text-on-surface-variant">
        It looks like you&apos;ve lost your internet connection. Some features
        may not be available right now.
      </p>

      <p className="mb-8 max-w-sm text-xs text-on-surface-variant/60">
        Check your network connection and try again.
      </p>

      {/* Retry button */}
      <button
        onClick={handleRetry}
        className="touch-target inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-navy/90 hover:shadow-lg active:scale-[0.98]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </svg>
        {isOnline ? "Go to Homepage" : "Try Again"}
      </button>

      {/* Offline status indicator */}
      <div className="mt-10 flex items-center gap-2 text-xs text-on-surface-variant/50">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            isOnline ? "bg-green-500" : "bg-red-400"
          }`}
        />
        {isOnline ? "Back online" : "No connection"}
      </div>
    </main>
  );
}
