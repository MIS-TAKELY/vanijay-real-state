import { Navbar } from "components/real-state/layout/Navbar";
import { Footer } from "components/real-state/layout/Footer";
import { CompareBarWrapper } from "components/real-state/common/CompareBarWrapper";
import { fetchCmsFooterContent } from "lib/api/services/cms";

export default async function RealStateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let footerContent;
  try {
    footerContent = await fetchCmsFooterContent();
  } catch {
    // Falls back to hardcoded defaults in Footer component.
  }

  return (
    <>
      <Navbar />
      {children}
      <CompareBarWrapper />
      <Footer content={footerContent} />
    </>
  );
}
