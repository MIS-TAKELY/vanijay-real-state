import { Navbar } from "components/real-state/layout/Navbar";
import { Footer } from "components/real-state/layout/Footer";
import { CompareBarWrapper } from "components/real-state/common/CompareBarWrapper";

export default function RealStateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <CompareBarWrapper />
      <Footer />
    </>
  );
}
