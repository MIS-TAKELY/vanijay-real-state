import type { MetalId } from "./metals";

export interface FAQItem {
  question: string;
  answer: string;
}

export const METAL_FAQS: Record<MetalId, FAQItem[]> = {
  gold: [
    {
      question: "What is the current gold price per ounce?",
      answer:
        "Gold prices update every 60 seconds on our platform. The current spot price reflects real-time global market demand, central bank activity, and currency fluctuations. Check our live ticker for the latest rate.",
    },
    {
      question: "How is gold priced in Nepal?",
      answer:
        "In Nepal, gold is typically quoted in NPR per tola (11.66 grams) for jewelry and per gram or ounce for investment purposes. Our platform shows both NPR and USD pricing with real-time conversion.",
    },
    {
      question: "What affects gold prices?",
      answer:
        "Gold prices are influenced by inflation expectations, central bank interest rates, geopolitical tensions, US dollar strength, mining supply, and ETF flows. Gold tends to rise during economic uncertainty.",
    },
    {
      question: "Is gold a good investment in 2024?",
      answer:
        "Gold has historically served as an inflation hedge and portfolio diversifier. With ongoing geopolitical risks and central bank buying, many analysts remain bullish. However, past performance does not guarantee future results.",
    },
    {
      question: "What is the difference between 24K and 22K gold?",
      answer:
        "24K gold is 99.9% pure, while 22K gold is 91.7% pure (mixed with copper or silver for durability). Jewelry is typically 22K or 18K, while investment bars and coins are usually 24K.",
    },
    {
      question: "How often do gold prices update?",
      answer:
        "Our platform refreshes gold prices every 60 seconds from multiple international sources. Global spot markets trade nearly 24/5, with prices moving continuously during trading sessions.",
    },
    {
      question: "What is the gold bid-ask spread?",
      answer:
        "The bid-ask spread is the difference between the highest price a buyer will pay (bid) and the lowest price a seller will accept (ask). A tighter spread indicates higher liquidity. We display both values for transparent pricing.",
    },
  ],
  silver: [
    {
      question: "What is the current silver price per ounce?",
      answer:
        "Silver prices update every 60 seconds on our platform. Silver is more volatile than gold due to its dual role as both a precious metal and industrial commodity.",
    },
    {
      question: "Why is silver cheaper than gold?",
      answer:
        "Silver is more abundant in the Earth's crust than gold and has significant industrial supply. The gold-to-silver ratio historically averages around 60-80:1, meaning it takes 60-80 ounces of silver to buy one ounce of gold.",
    },
    {
      question: "What drives silver prices?",
      answer:
        "Silver prices are driven by industrial demand (solar panels, electronics, EVs), precious metal safe-haven flows, mining supply, and recycling rates. Solar energy adoption is a major growth driver.",
    },
    {
      question: "Is silver a good investment?",
      answer:
        "Silver offers both precious metal hedging benefits and industrial growth exposure. It tends to outperform gold during bull markets but falls harder in downturns. Consider it as part of a diversified portfolio.",
    },
    {
      question: "What is the gold-to-silver ratio?",
      answer:
        "The gold-to-silver ratio measures how many ounces of silver it takes to buy one ounce of gold. Historically it ranges from 40:1 to 100:1. Many traders use extreme ratios as contrarian signals.",
    },
    {
      question: "How is silver used in industry?",
      answer:
        "Silver is essential in solar photovoltaic cells, electrical contacts, medical devices, water purification, mirrors, and brazing alloys. Over 50% of silver demand comes from industrial applications.",
    },
    {
      question: "Can I buy physical silver in Nepal?",
      answer:
        "Yes, authorized dealers and banks in Nepal sell silver bars and coins. Always verify purity hallmarks and buy from reputable sources. Our platform provides reference pricing for informed purchasing.",
    },
  ],
  platinum: [
    {
      question: "What is the current platinum price?",
      answer:
        "Platinum prices update in real-time on our platform. Platinum is rarer than gold but often trades at a discount due to concentrated industrial demand and supply dynamics.",
    },
    {
      question: "Why is platinum sometimes cheaper than gold?",
      answer:
        "Despite being rarer, platinum's price is heavily tied to automotive catalyst demand. When car production slows or substitution to palladium occurs, platinum can trade below gold despite lower annual mine supply.",
    },
    {
      question: "What is platinum used for?",
      answer:
        "Platinum is critical in automotive catalytic converters (diesel engines), hydrogen fuel cells, jewelry, chemical processing, and medical implants. The hydrogen economy could drive future demand growth.",
    },
    {
      question: "Is platinum rarer than gold?",
      answer:
        "Yes, annual platinum mine production is roughly 6 million ounces compared to gold's 100+ million ounces. South Africa supplies about 70% of global platinum, creating geographic concentration risk.",
    },
    {
      question: "How does platinum compare to palladium?",
      answer:
        "Both are platinum group metals used in catalytic converters. Palladium serves gasoline engines while platinum serves diesel. Substitution between them occurs based on relative pricing and regulatory changes.",
    },
    {
      question: "What drives platinum demand?",
      answer:
        "Automotive catalyst demand accounts for ~40% of platinum consumption. Growing hydrogen fuel cell adoption, jewelry demand (especially in China), and industrial applications provide additional support.",
    },
    {
      question: "Is platinum a good investment?",
      answer:
        "Platinum offers value potential given its rarity vs. price, plus upside from the hydrogen transition. However, automotive sector cyclicality adds volatility. Consider as a diversifier within precious metals allocation.",
    },
  ],
  palladium: [
    {
      question: "What is the current palladium price?",
      answer:
        "Palladium prices update in real-time on our platform. Palladium experienced dramatic price swings in recent years due to supply constraints and automotive demand shifts.",
    },
    {
      question: "Why did palladium prices surge in recent years?",
      answer:
        "Palladium surged due to diesel-to-gasoline vehicle switching (palladium serves gasoline catalysts), Russian supply concerns, and structural deficits. Prices peaked above $3,000/oz before correcting as substitution increased.",
    },
    {
      question: "What is palladium used for?",
      answer:
        "Over 80% of palladium goes into automotive catalytic converters for gasoline engines. Other uses include electronics, dentistry, hydrogen purification, and jewelry alloying.",
    },
    {
      question: "Where is palladium mined?",
      answer:
        "Russia (Norilsk Nickel) supplies ~40% of global palladium, followed by South Africa (~35%). This geographic concentration creates significant supply risk and price sensitivity to geopolitical events.",
    },
    {
      question: "How does palladium compare to platinum?",
      answer:
        "Palladium is lighter and primarily serves gasoline engine catalysts, while platinum serves diesel. They are partially substitutable in automotive applications, causing price convergence when spreads widen significantly.",
    },
    {
      question: "Is palladium a good investment?",
      answer:
        "Palladium is highly volatile and driven by specific automotive demand. While supply deficits support prices long-term, electrification may reduce catalyst demand over decades. Suitable only for sophisticated investors.",
    },
    {
      question: "What affects palladium supply?",
      answer:
        "Palladium supply depends on Russian and South African mining output, recycling rates from scrapped vehicles, and above-ground inventory levels. Geopolitical sanctions and labor disruptions can cause sudden supply shocks.",
    },
  ],
  bitcoin: [
    {
      question: "What is the current Bitcoin price?",
      answer:
        "Bitcoin trades 24/7 globally. Our platform shows real-time BTC prices converted to NPR and USD, updated every 60 seconds from multiple exchange feeds.",
    },
    {
      question: "Why is Bitcoin called digital gold?",
      answer:
        "Bitcoin shares gold's properties as a scarce, durable, portable store of value with no counterparty risk. Its fixed 21-million supply cap and decentralized nature make it a digital alternative to physical gold.",
    },
    {
      question: "What is Bitcoin's maximum supply?",
      answer:
        "Bitcoin has a hard cap of 21 million coins, enforced by protocol code. Approximately 19.7 million have been mined as of 2024. New coins are created through mining, with issuance halving roughly every four years.",
    },
    {
      question: "How volatile is Bitcoin?",
      answer:
        "Bitcoin is significantly more volatile than gold, with daily moves of 3-5% common and 20%+ monthly swings possible. Volatility has decreased over time as the market matures and institutional adoption grows.",
    },
    {
      question: "Is Bitcoin a store of value?",
      answer:
        "Proponents argue Bitcoin's scarcity, censorship resistance, and growing institutional adoption qualify it as a store of value. Critics cite volatility and regulatory uncertainty. The debate continues as adoption expands.",
    },
    {
      question: "How does Bitcoin correlate with gold?",
      answer:
        "Bitcoin-gold correlation varies over time, ranging from negative to moderately positive. During risk-off periods they sometimes move together as alternative assets, but Bitcoin also correlates with tech stocks during risk-on periods.",
    },
    {
      question: "Can I buy Bitcoin in Nepal?",
      answer:
        "Cryptocurrency trading is currently restricted in Nepal under NRB regulations. Always comply with local laws. Our platform provides price information for educational and reference purposes only.",
    },
  ],
  ethereum: [
    {
      question: "What is the current Ethereum price?",
      answer:
        "Ethereum trades 24/7 globally. Our platform shows real-time ETH prices in NPR and USD, updated every 60 seconds.",
    },
    {
      question: "How does Ethereum differ from Bitcoin?",
      answer:
        "Ethereum is a programmable blockchain enabling smart contracts and decentralized applications, while Bitcoin focuses primarily on being a store of value and payment network. Ethereum supports DeFi, NFTs, and tokenization.",
    },
    {
      question: "What are smart contracts?",
      answer:
        "Smart contracts are self-executing programs on the blockchain that automatically enforce agreement terms without intermediaries. They power DeFi lending, DEX trading, NFT marketplaces, and automated governance.",
    },
    {
      question: "What is DeFi?",
      answer:
        "Decentralized Finance (DeFi) recreates traditional financial services — lending, borrowing, trading, insurance — using blockchain smart contracts instead of banks. Ethereum hosts the majority of DeFi protocols.",
    },
    {
      question: "Is Ethereum a good investment?",
      answer:
        "Ethereum benefits from network effects as the dominant smart contract platform. Staking yields, deflationary tokenomics post-Merge, and growing institutional interest support its thesis. However, competition and regulatory risks exist.",
    },
    {
      question: "What is staking?",
      answer:
        "Ethereum staking involves locking 32 ETH to validate transactions and secure the network. Stakers earn rewards proportional to their stake. Liquid staking derivatives allow earning yield while maintaining liquidity.",
    },
    {
      question: "How does Ethereum's supply work?",
      answer:
        "Since the Merge (Sept 2022), Ethereum issues fewer new coins through proof-of-stake. EIP-1559 burns transaction fees, making ETH potentially deflationary during high network usage periods.",
    },
  ],
  copper: [
    {
      question: "What is the current copper price?",
      answer:
        "Copper prices update in real-time on our platform, quoted per pound in USD with NPR conversion. Copper is the most widely used industrial base metal.",
    },
    {
      question: "Why is copper important for clean energy?",
      answer:
        "Copper is essential for electrical wiring, motors, transformers, solar panels, wind turbines, and EV batteries. An EV uses 2-3x more copper than a conventional car. Grid electrification drives structural demand growth.",
    },
    {
      question: "What drives copper demand?",
      answer:
        "Construction (~28%), electrical equipment (~25%), transportation (~15%), and consumer electronics drive copper demand. China accounts for over 50% of global copper consumption, making Chinese economic data a key price driver.",
    },
    {
      question: "Where is copper mined?",
      answer:
        "Chile is the world's largest copper producer (~27%), followed by Peru, DRC, China, and Indonesia. Concentrated geography and declining ore grades create long-term supply challenges.",
    },
    {
      question: "How does copper correlate with the economy?",
      answer:
        "Copper is nicknamed 'Dr. Copper' because its price reliably predicts economic expansions and contractions. Rising copper signals industrial growth; falling copper warns of slowdowns. It correlates with PMI and GDP data.",
    },
    {
      question: "Is copper a good investment?",
      answer:
        "Copper offers exposure to infrastructure spending and clean energy transition themes. However, it is cyclical and sensitive to recession risk. Futures, ETFs, and mining stocks provide different risk-return profiles.",
    },
    {
      question: "What is the copper supply outlook?",
      answer:
        "Many analysts project copper supply deficits by 2030 due to declining ore grades, permitting delays for new mines, and surging clean energy demand. Recycling helps but cannot fully close the gap.",
    },
  ],
  diamond: [
    {
      question: "What is the current diamond price per carat?",
      answer:
        "Diamond prices vary significantly by quality (the 4Cs: cut, color, clarity, carat). Our platform tracks benchmark wholesale indices for standardized gem-quality stones.",
    },
    {
      question: "Are lab-grown diamonds cheaper?",
      answer:
        "Yes, lab-grown diamonds typically cost 60-85% less than natural diamonds of equivalent quality. Production costs continue falling as technology improves, putting downward pressure on natural diamond premiums.",
    },
    {
      question: "What determines diamond value?",
      answer:
        "Diamond value is determined by the 4Cs: Carat weight, Cut quality, Color grade (D-Z scale), and Clarity grade. Certification from GIA or AGS provides standardized grading for fair pricing.",
    },
    {
      question: "Is diamond a good investment?",
      answer:
        "Investment-grade diamonds (rare colors, large sizes, exceptional clarity) have appreciated over decades. However, the retail markup is high, liquidity is limited, and lab-grown competition pressures mid-tier stones.",
    },
    {
      question: "How are diamonds priced?",
      answer:
        "Diamonds are priced using the Rapaport Price List as a benchmark, adjusted for specific characteristics. Unlike commodities, each stone is unique, requiring individual assessment rather than uniform spot pricing.",
    },
    {
      question: "What are industrial diamonds used for?",
      answer:
        "Industrial diamonds (mostly synthetic) are used in cutting tools, drilling bits, semiconductor manufacturing, heat sinks, and quantum computing research. Their hardness and thermal conductivity are unmatched.",
    },
    {
      question: "How does diamond compare to gold as a store of value?",
      answer:
        "Gold is far more liquid, standardized, and universally accepted. Diamonds offer portability and discretion advantages but suffer from valuation complexity and illiquidity. Both serve complementary roles in wealth preservation.",
    },
  ],
  steel: [
    {
      question: "What is the current steel price per ton?",
      answer:
        "Steel prices vary by grade and region. Our platform tracks benchmark HRC (hot-rolled coil) and rebar prices, updated regularly to reflect global market conditions.",
    },
    {
      question: "What drives steel prices?",
      answer:
        "Steel prices are driven by iron ore and coking coal costs, Chinese production policy, infrastructure spending, automotive demand, tariffs/trade policy, and carbon emission regulations affecting production costs.",
    },
    {
      question: "How does iron ore affect steel cost?",
      answer:
        "Iron ore accounts for 30-40% of steelmaking costs. Ore prices fluctuate based on Chinese steelmill demand, Australian/Brazilian supply, and port inventories. A $10/ton ore move translates to ~$15-20/ton in steel.",
    },
    {
      question: "What types of steel are there?",
      answer:
        "Major categories include carbon steel (construction, automotive), stainless steel (corrosion-resistant), alloy steel (specialized properties), and tool steel. Each has distinct pricing based on composition and processing.",
    },
    {
      question: "How does carbon policy affect steel?",
      answer:
        "Steel production generates ~7% of global CO2 emissions. Carbon taxes, EU CBAM border adjustments, and green steel mandates increase costs for traditional producers while benefiting low-carbon and electric arc furnace makers.",
    },
    {
      question: "Is steel a commodity investment?",
      answer:
        "Steel futures trade on exchanges like SHFE and LME. Mining stocks (iron ore producers) and steelmakers offer equity exposure. Steel is highly cyclical and best suited for tactical rather than strategic allocation.",
    },
    {
      question: "What is the steel demand outlook?",
      answer:
        "Global steel demand is projected to grow modestly, driven by Indian and Southeast Asian infrastructure. Chinese demand may plateau, but green energy infrastructure (wind towers, EV frames) creates new demand streams.",
    },
  ],
};
