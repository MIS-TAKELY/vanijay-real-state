import type { MetalId } from "./metals";

export interface MetalSEOData {
  title: string;
  description: string;
  keywords: string[];
  faqQuestions: string[];
}

export const METAL_SEO_DATA: Record<MetalId, MetalSEOData> = {
  gold: {
    title:
      "Live Gold Price Today | Real-Time Gold Rates Per Gram & Ounce | Vanijay",
    description:
      "Track live gold prices in NPR & USD. Real-time spot rates, historical charts, bid/ask spreads, and investment guides updated every 60 seconds.",
    keywords: [
      "gold price today",
      "live gold rate",
      "gold price NPR",
      "gold per gram",
      "gold per ounce",
      "XAU price",
    ],
    faqQuestions: [
      "What is the current gold price per ounce?",
      "How is gold priced in Nepal?",
      "What affects gold prices?",
      "Is gold a good investment in 2024?",
      "What is the difference between 24K and 22K gold?",
      "How often do gold prices update?",
      "What is the gold bid-ask spread?",
    ],
  },
  silver: {
    title:
      "Live Silver Price Today | Real-Time Silver Rates Per Ounce | Vanijay",
    description:
      "Track live silver prices with real-time updates. Historical data, industrial demand analysis, and silver investment insights.",
    keywords: [
      "silver price today",
      "live silver rate",
      "silver per ounce",
      "XAG price",
      "silver investment",
    ],
    faqQuestions: [
      "What is the current silver price per ounce?",
      "Why is silver cheaper than gold?",
      "What drives silver prices?",
      "Is silver a good investment?",
      "What is the gold-to-silver ratio?",
      "How is silver used in industry?",
      "Can I buy physical silver in Nepal?",
    ],
  },
  platinum: {
    title:
      "Live Platinum Price Today | Real-Time Platinum Rates | Vanijay",
    description:
      "Track live platinum prices with real-time updates. Rarer than gold, critical for automotive and hydrogen technology.",
    keywords: [
      "platinum price today",
      "live platinum rate",
      "platinum per ounce",
      "XPT price",
    ],
    faqQuestions: [
      "What is the current platinum price?",
      "Why is platinum sometimes cheaper than gold?",
      "What is platinum used for?",
      "Is platinum rarer than gold?",
      "How does platinum compare to palladium?",
      "What drives platinum demand?",
      "Is platinum a good investment?",
    ],
  },
  palladium: {
    title:
      "Live Palladium Price Today | Real-Time Palladium Rates | Vanijay",
    description:
      "Track live palladium prices. Essential for emissions control, supply concentrated in Russia and South Africa.",
    keywords: [
      "palladium price today",
      "live palladium rate",
      "XPD price",
      "palladium per ounce",
    ],
    faqQuestions: [
      "What is the current palladium price?",
      "Why did palladium prices surge in recent years?",
      "What is palladium used for?",
      "Where is palladium mined?",
      "How does palladium compare to platinum?",
      "Is palladium a good investment?",
      "What affects palladium supply?",
    ],
  },
  bitcoin: {
    title:
      "Live Bitcoin Price Today | Real-Time BTC Rate | Vanijay",
    description:
      "Track live Bitcoin prices with real-time updates. Digital gold with a hard supply cap of 21 million coins.",
    keywords: [
      "bitcoin price today",
      "BTC price",
      "live bitcoin rate",
      "bitcoin NPR",
      "crypto price",
    ],
    faqQuestions: [
      "What is the current Bitcoin price?",
      "Why is Bitcoin called digital gold?",
      "What is Bitcoin's maximum supply?",
      "How volatile is Bitcoin?",
      "Is Bitcoin a store of value?",
      "How does Bitcoin correlate with gold?",
      "Can I buy Bitcoin in Nepal?",
    ],
  },
  ethereum: {
    title:
      "Live Ethereum Price Today | Real-Time ETH Rate | Vanijay",
    description:
      "Track live Ethereum prices. Programmable money powering smart contracts, DeFi, and the largest app ecosystem in crypto.",
    keywords: [
      "ethereum price today",
      "ETH price",
      "live ethereum rate",
      "ethereum NPR",
    ],
    faqQuestions: [
      "What is the current Ethereum price?",
      "How does Ethereum differ from Bitcoin?",
      "What are smart contracts?",
      "What is DeFi?",
      "Is Ethereum a good investment?",
      "What is staking?",
      "How does Ethereum's supply work?",
    ],
  },
  copper: {
    title:
      "Live Copper Price Today | Real-Time Copper Rates | Vanijay",
    description:
      "Track live copper prices. The industrial metal of electrification — wiring, motors, and clean energy grids.",
    keywords: [
      "copper price today",
      "live copper rate",
      "copper per pound",
      "HG price",
      "industrial metals",
    ],
    faqQuestions: [
      "What is the current copper price?",
      "Why is copper important for clean energy?",
      "What drives copper demand?",
      "Where is copper mined?",
      "How does copper correlate with the economy?",
      "Is copper a good investment?",
      "What is the copper supply outlook?",
    ],
  },
  diamond: {
    title:
      "Live Diamond Price Today | Real-Time Diamond Rates Per Carat | Vanijay",
    description:
      "Track live diamond prices per carat. The ultimate store of value in gemstone form with industrial applications.",
    keywords: [
      "diamond price today",
      "diamond per carat",
      "live diamond rate",
      "diamond investment",
    ],
    faqQuestions: [
      "What is the current diamond price per carat?",
      "Are lab-grown diamonds cheaper?",
      "What determines diamond value?",
      "Is diamond a good investment?",
      "How are diamonds priced?",
      "What are industrial diamonds used for?",
      "How does diamond compare to gold as a store of value?",
    ],
  },
  steel: {
    title:
      "Live Steel Price Today | Real-Time Steel Rates Per Ton | Vanijay",
    description:
      "Track live steel prices per ton. The backbone of modern infrastructure reflecting global construction demand.",
    keywords: [
      "steel price today",
      "steel per ton",
      "live steel rate",
      "construction steel price",
    ],
    faqQuestions: [
      "What is the current steel price per ton?",
      "What drives steel prices?",
      "How does iron ore affect steel cost?",
      "What types of steel are there?",
      "How does carbon policy affect steel?",
      "Is steel a commodity investment?",
      "What is the steel demand outlook?",
    ],
  },
};
