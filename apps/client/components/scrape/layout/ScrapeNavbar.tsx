import Link from "next/link";

export function ScrapeNavbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-scrape-surface)]">
      <Link href="/scrape" className="font-semibold">Scraper</Link>
      <div className="flex gap-4">
        <Link href="/scrape/dashboard">Dashboard</Link>
        {/* Switch back to the real-estate app */}
        <Link href="/">Real Estate</Link>
      </div>
    </nav>
  );
}
