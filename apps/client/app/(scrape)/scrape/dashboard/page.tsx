import type { Metadata } from "next";
import { DashboardHeader, ScrapeConsole } from "components/scrape/pages/dashboard";

export const metadata: Metadata = {
  title: "Scrape Dashboard | Hamrobazaar Listings — Lekhaprati",
  description:
    "Live scraping console for Hamrobazaar real-estate listings: category filters, keyword search, Devanagari digit normalization, NPR formatting and real-time results via a server-side scraper.",
  alternates: { canonical: "/scrape/dashboard" },
  robots: { index: true, follow: true },
};

export default function ScrapeDashboardPage() {
  return (
    <>
      <DashboardHeader />
      <section className="mx-auto max-w-container-max px-gutter py-8 md:py-12">
        <ScrapeConsole />
      </section>
    </>
  );
}
