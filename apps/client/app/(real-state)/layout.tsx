import { Navbar } from "components/real-state/layout/Navbar";
import { Footer } from "components/real-state/layout/Footer";

export default function RealStateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
