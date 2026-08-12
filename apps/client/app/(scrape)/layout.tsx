import { ScrapeNavbar } from "components/scrape/layout/ScrapeNavbar";
import { ScrapeFooter } from "components/scrape/layout/ScrapeFooter";
import "./scrape.css";

export default function ScrapeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="scrape-app min-h-screen">
      <ScrapeNavbar />
      <main>{children}</main>
      <ScrapeFooter />
    </div>
  );
}
