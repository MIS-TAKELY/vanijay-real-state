"use client";

import { useEffect } from "react";
import {
  ActivityTicker,
  AskArchive,
  BrowseByIntent,
  Footer,
  Hero,
  MapExplorer,
  Navbar,
  NRNConcierge,
  PropertyCarousel,
  TrustStack,
  VerificationSteps,
} from "./components/pages/home";

const Home = () => {
  useEffect(() => {
    document.querySelectorAll<HTMLElement>(".property-card").forEach((card) => {
      const stamp = card.querySelector<HTMLElement>(".verification-stamp");
      card.addEventListener("mouseenter", () => {
        if (stamp) {
          stamp.style.transform = "rotate(-2deg) scale(1.1)";
          stamp.style.transition =
            "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        }
      });
      card.addEventListener("mouseleave", () => {
        if (stamp) {
          stamp.style.transform = "rotate(-6deg) scale(1)";
        }
      });
    });
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 topo-bg pointer-events-none z-0" />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <TrustStack />
        <BrowseByIntent />
        <MapExplorer />
        <PropertyCarousel />
        <VerificationSteps />
        <ActivityTicker />
        <AskArchive />
        <NRNConcierge />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
