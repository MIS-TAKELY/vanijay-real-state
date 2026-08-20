import Link from "next/link";

/**
 * Global 404 fallback (root layout — no Navbar/Footer). Reached for routes
 * outside the (real-state) group, e.g. unknown /scrape or /gold paths.
 */
export default function GlobalNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-500">
        MALPOTH
      </p>
      <h1 className="mb-3 text-4xl font-semibold tracking-tight text-neutral-900">
        404 — Page not found
      </h1>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-neutral-600">
        The page you requested doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="inline-flex h-11 items-center rounded-lg bg-neutral-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
      >
        Back to Home
      </Link>
    </main>
  );
}