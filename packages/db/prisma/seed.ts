import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  KabadiUnit,
  PropertyType,
  PropertyStatus,
  VerificationStatus,
} from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ---------- Metals ----------
  const metals = [
    {
      slug: "gold",
      name: "Gold",
      symbol: "Au",
      isEnabled: true,
      accentColor: "#C9A84C",
      seoTitle: "Gold Price Today in Nepal",
      seoDescription:
        "Live gold price in Nepali Rupees with historical charts, converter and FAQs.",
    },
    {
      slug: "silver",
      name: "Silver",
      symbol: "Ag",
      isEnabled: true,
      accentColor: "#AAA9AD",
      seoTitle: "Silver Price Today in Nepal",
      seoDescription:
        "Live silver price in Nepal with historical charts and price converter.",
    },
    {
      slug: "copper",
      name: "Copper",
      symbol: "Cu",
      isEnabled: true,
      accentColor: "#D97742",
      seoTitle: "Copper Price Today in Nepal",
      seoDescription:
        "Live copper price in Nepal with historical charts and price converter.",
    },
    {
      slug: "diamond",
      name: "Diamond",
      symbol: "C",
      isEnabled: true,
      accentColor: "#7DD3FC",
      seoTitle: "Diamond Price Today in Nepal",
      seoDescription:
        "Diamond prices in Nepal with buying guide and price converter.",
    },
    {
      slug: "steel",
      name: "Steel",
      symbol: "Fe",
      isEnabled: true,
      accentColor: "#94A3B8",
      seoTitle: "Steel Price Today in Nepal",
      seoDescription:
        "Live steel price in Nepal with historical charts and price converter.",
    },
  ];
  for (const m of metals) {
    await prisma.metalConfig.upsert({
      where: { slug: m.slug },
      create: m,
      update: m,
    });
  }
  console.log("Metals seeded");

  // ---------- Kabadi categories ----------
  const cats = [
    {
      slug: "paper",
      name: "Paper & Cardboard",
      nepali: "कागज र गत्ता",
      icon: "newspaper",
      blurb:
        "Newspapers, office paper, books and gatta (cardboard). Keep it dry for top rates.",
      seoTitle:
        "Paper & Cardboard Kabadi Rates in Kathmandu | Sell Scrap Paper",
      seoDescription:
        "Sell newspaper, office paper, books, notebooks and cardboard for the best rates in Kathmandu Valley. Newspaper at Rs 35/kg, cardboard at Rs 12/kg. Clean & dry for top prices.",
      seoKeywords:
        "sell newspaper Nepal, paper kabadi rate, cardboard price Kathmandu, newspaper rate per kg Nepal, gatta price, office paper scrap",
    },
    {
      slug: "plastic",
      name: "Plastic",
      nepali: "प्लास्टिक",
      icon: "recycling",
      blurb:
        "PET bottles, milk packets, buckets and hard plastic. Sorted plastic pays more.",
      seoTitle:
        "Plastic Kabadi Rates in Kathmandu | Sell PET Bottles & Hard Plastic",
      seoDescription:
        "Sell PET bottles, milk packets, hard plastic and drums in Kathmandu. PET bottles at Rs 20/kg, hard plastic at Rs 15/kg. Sorted plastic pays more.",
      seoKeywords:
        "sell plastic Nepal, PET bottle rate, hard plastic price, plastic kabadi Kathmandu, milk packet scrap rate, plastic drum price",
    },
    {
      slug: "metal",
      name: "Metals",
      nepali: "धातु",
      icon: "hammer",
      blurb:
        "Copper, brass, aluminum, iron and steel. The heavy hitters of the kabadi world.",
      seoTitle:
        "Metal Kabadi Rates in Kathmandu | Sell Copper, Brass, Iron & Aluminum",
      seoDescription:
        "Sell copper, brass, aluminum, iron, steel and tin for the best rates in Kathmandu. Copper at Rs 1,400/kg, brass at Rs 900/kg. Best prices in the valley.",
      seoKeywords:
        "copper price Nepal, sell brass, aluminum rate, iron scrap price, metal kabadi rate Kathmandu, tamasariya, taama rate Nepal",
    },
    {
      slug: "ewaste",
      name: "E-Waste",
      nepali: "इ-फोहोर",
      icon: "cpu",
      blurb:
        "Old phones, laptops, CPUs, monitors and printers. Value is per piece.",
      seoTitle:
        "E-Waste Kabadi Rates in Kathmandu | Sell Old Phones, Laptops & CPUs",
      seoDescription:
        "Sell old smartphones, laptops, desktop CPUs, monitors and printers in Kathmandu. Old smartphone at Rs 150/piece, laptop at Rs 350/piece. Responsible e-waste recycling.",
      seoKeywords:
        "sell old mobile Nepal, e-waste rate Kathmandu, old laptop price, CPU scrap value, monitor recycling Nepal, smartphone kabadi rate",
    },
    {
      slug: "appliance",
      name: "Appliances",
      nepali: "विद्युतीय सामान",
      icon: "refrigerator",
      blurb:
        "Fridges, washing machines, ACs, geysers and microwaves — priced per unit.",
      seoTitle:
        "Appliance Kabadi Rates in Kathmandu | Sell Fridges, ACs & Washing Machines",
      seoDescription:
        "Sell old refrigerators, washing machines, ACs, geysers and microwaves in Kathmandu. Fridge at Rs 1,800/piece, AC at Rs 2,500/piece. Free doorstep pickup.",
      seoKeywords:
        "sell old fridge Nepal, washing machine scrap price, AC kabadi rate, geyser price, microwave scrap value Kathmandu, appliance recycling",
    },
    {
      slug: "other",
      name: "Glass & Other",
      nepali: "अन्य सामान",
      icon: "bottle",
      blurb: "Glass bottles, clothes, tires, batteries and vehicles.",
      seoTitle:
        "Glass, Tires & Other Kabadi Rates in Kathmandu",
      seoDescription:
        "Sell glass bottles, old clothes, vehicle tires, batteries and scrap vehicles in Kathmandu. Glass at Rs 6/kg, scrap car at Rs 18,000/piece.",
      seoKeywords:
        "glass bottle rate Nepal, sell old clothes, tire scrap price, battery kabadi rate, car scrap Nepal, motorcycle scrap value",
    },
  ];
  const catIds: Record<string, string> = {};
  for (let i = 0; i < cats.length; i++) {
    const c = await prisma.kabadiCategory.upsert({
      where: { slug: cats[i].slug },
      create: { ...cats[i], sortOrder: i },
      update: { ...cats[i], sortOrder: i },
    });
    catIds[cats[i].slug] = c.id;
  }
  console.log("Kabadi categories seeded");

  // ---------- Kabadi items (mirrors client lib/kabadi/rates.ts) ----------
  const items: {
    id: string;
    name: string;
    nepali: string;
    unit: KabadiUnit;
    rate: number;
    cat: string;
    popular?: boolean;
    note?: string;
  }[] = [
    // ---- Paper & Cardboard ----
    {
      id: "paper-newspaper",
      name: "Newspaper",
      nepali: "पत्रिका",
      unit: "KG",
      rate: 35,
      cat: "paper",
      popular: true,
      note: "Clean & dry",
    },
    {
      id: "paper-office",
      name: "Office paper (A3/A4)",
      nepali: "कागज",
      unit: "KG",
      rate: 15,
      cat: "paper",
    },
    {
      id: "paper-books",
      name: "Books",
      nepali: "किताब",
      unit: "KG",
      rate: 12,
      cat: "paper",
    },
    {
      id: "paper-notebooks",
      name: "Notebooks & copies",
      nepali: "कापी",
      unit: "KG",
      rate: 10,
      cat: "paper",
    },
    {
      id: "paper-cardboard",
      name: "Cardboard / gatta",
      nepali: "गत्ता",
      unit: "KG",
      rate: 12,
      cat: "paper",
    },
    // ---- Plastic ----
    {
      id: "plastic-pet",
      name: "PET bottles",
      nepali: "पानीको बोतल",
      unit: "KG",
      rate: 20,
      cat: "plastic",
      popular: true,
      note: "Sorted",
    },
    {
      id: "plastic-milk",
      name: "Milk packets",
      nepali: "दूधको प्याकेट",
      unit: "KG",
      rate: 10,
      cat: "plastic",
    },
    {
      id: "plastic-hard",
      name: "Hard plastic (buckets, chairs)",
      nepali: "कडा प्लास्टिक",
      unit: "KG",
      rate: 15,
      cat: "plastic",
    },
    {
      id: "plastic-mixed",
      name: "Mixed plastic",
      nepali: "मिश्रित प्लास्टिक",
      unit: "KG",
      rate: 8,
      cat: "plastic",
    },
    {
      id: "plastic-drum",
      name: "Plastic drums",
      nepali: "प्लास्टिक ड्रम",
      unit: "PIECE",
      rate: 120,
      cat: "plastic",
    },
    // ---- Metals ----
    {
      id: "metal-copper",
      name: "Copper (wire, tube)",
      nepali: "तामा",
      unit: "KG",
      rate: 1400,
      cat: "metal",
      popular: true,
      note: "Best rate in the yard",
    },
    {
      id: "metal-brass",
      name: "Brass",
      nepali: "पित्तल",
      unit: "KG",
      rate: 900,
      cat: "metal",
      popular: true,
    },
    {
      id: "metal-aluminum",
      name: "Aluminum",
      nepali: "एल्मुनियम",
      unit: "KG",
      rate: 200,
      cat: "metal",
    },
    {
      id: "metal-iron",
      name: "Iron",
      nepali: "फलाम",
      unit: "KG",
      rate: 35,
      cat: "metal",
    },
    {
      id: "metal-steel",
      name: "Steel utensils",
      nepali: "स्टिल भाँडा",
      unit: "KG",
      rate: 40,
      cat: "metal",
    },
    {
      id: "metal-tin",
      name: "Tin",
      nepali: "टिन",
      unit: "KG",
      rate: 25,
      cat: "metal",
    },
    {
      id: "metal-battery",
      name: "Lead-acid battery (small)",
      nepali: "ब्याट्री",
      unit: "PIECE",
      rate: 500,
      cat: "metal",
    },
    {
      id: "metal-battery-large",
      name: "Lead-acid battery (large)",
      nepali: "ठूलो ब्याट्री",
      unit: "PIECE",
      rate: 1200,
      cat: "metal",
    },
    // ---- E-Waste ----
    {
      id: "ewaste-smartphone",
      name: "Smartphone (old)",
      nepali: "पुरानो मोबाइल",
      unit: "PIECE",
      rate: 150,
      cat: "ewaste",
      popular: true,
      note: "Working or not",
    },
    {
      id: "ewaste-keypad",
      name: "Keypad phone",
      nepali: "किप्याड मोबाइल",
      unit: "PIECE",
      rate: 80,
      cat: "ewaste",
    },
    {
      id: "ewaste-laptop",
      name: "Laptop",
      nepali: "ल्यापटप",
      unit: "PIECE",
      rate: 350,
      cat: "ewaste",
    },
    {
      id: "ewaste-cpu",
      name: "Desktop CPU",
      nepali: "कम्प्युटर",
      unit: "PIECE",
      rate: 400,
      cat: "ewaste",
    },
    {
      id: "ewaste-monitor",
      name: "Monitor (LCD)",
      nepali: "मनिटर",
      unit: "PIECE",
      rate: 250,
      cat: "ewaste",
    },
    {
      id: "ewaste-printer",
      name: "Printer",
      nepali: "प्रिन्टर",
      unit: "PIECE",
      rate: 300,
      cat: "ewaste",
    },
    {
      id: "ewaste-pcb",
      name: "Circuit boards (PCB)",
      nepali: "सर्किट बोर्ड",
      unit: "KG",
      rate: 200,
      cat: "ewaste",
    },
    // ---- Appliances ----
    {
      id: "app-fridge",
      name: "Refrigerator (single door)",
      nepali: "फ्रिज",
      unit: "PIECE",
      rate: 1800,
      cat: "appliance",
      popular: true,
    },
    {
      id: "app-fridge-double",
      name: "Refrigerator (double door)",
      nepali: "ठूलो फ्रिज",
      unit: "PIECE",
      rate: 3500,
      cat: "appliance",
    },
    {
      id: "app-washing",
      name: "Washing machine",
      nepali: "धुने मेसिन",
      unit: "PIECE",
      rate: 1500,
      cat: "appliance",
    },
    {
      id: "app-ac",
      name: "AC (window)",
      nepali: "एसी",
      unit: "PIECE",
      rate: 2500,
      cat: "appliance",
    },
    {
      id: "app-ac-split",
      name: "AC (split, with copper)",
      nepali: "स्प्लिट एसी",
      unit: "PIECE",
      rate: 4000,
      cat: "appliance",
    },
    {
      id: "app-geyser",
      name: "Water heater / geyser",
      nepali: "गिजर",
      unit: "PIECE",
      rate: 800,
      cat: "appliance",
    },
    {
      id: "app-microwave",
      name: "Microwave oven",
      nepali: "माइक्रोवेभ",
      unit: "PIECE",
      rate: 600,
      cat: "appliance",
    },
    {
      id: "app-tv",
      name: "TV (CRT / old)",
      nepali: "पुरानो टिभी",
      unit: "PIECE",
      rate: 500,
      cat: "appliance",
    },
    // ---- Glass & Other ----
    {
      id: "other-glass",
      name: "Glass bottles",
      nepali: "सिसाको बोतल",
      unit: "KG",
      rate: 6,
      cat: "other",
    },
    {
      id: "other-clothes",
      name: "Old clothes",
      nepali: "पुरानो कपडा",
      unit: "KG",
      rate: 5,
      cat: "other",
    },
    {
      id: "other-tires",
      name: "Vehicle tires",
      nepali: "टायर",
      unit: "PIECE",
      rate: 50,
      cat: "other",
    },
    {
      id: "other-bicycle",
      name: "Bicycle",
      nepali: "साइकल",
      unit: "PIECE",
      rate: 500,
      cat: "other",
    },
    {
      id: "other-bike",
      name: "Motorcycle (scrap)",
      nepali: "मोटरसाइकल",
      unit: "PIECE",
      rate: 2500,
      cat: "other",
    },
    {
      id: "other-car",
      name: "Car (scrap)",
      nepali: "गाडी",
      unit: "PIECE",
      rate: 18000,
      cat: "other",
    },
  ];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    await prisma.kabadiItem.upsert({
      where: { id: it.id },
      create: {
        id: it.id,
        categoryId: catIds[it.cat],
        name: it.name,
        nepali: it.nepali,
        unit: it.unit,
        rate: it.rate,
        note: it.note,
        popular: it.popular,
        sortOrder: i,
      },
      update: {
        name: it.name,
        rate: it.rate,
        unit: it.unit,
        popular: it.popular,
        note: it.note,
      },
    });
  }
  console.log("Kabadi items seeded");

  // ---------- CMS content items (REAL_STATE_HOME / HERO_BANNER) ----------
  const heroSlides = [
    {
      key: "hero-1",
      title: "Find Your Dream Property",
      subtitle:
        "Explore thousands of verified listings across the country. From luxury villas to cozy apartments, your perfect home awaits.",
      image:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&h=900&fit=crop",
      ctaLabel: "Explore Properties",
      ctaHref: "/search",
    },
    {
      key: "hero-2",
      title: "Luxury Living Redefined",
      subtitle:
        "Discover premium properties in the most sought-after neighborhoods. Verified listings, transparent pricing, seamless experience.",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=900&fit=crop",
      ctaLabel: "Explore Properties",
      ctaHref: "/search",
    },
    {
      key: "hero-3",
      title: "Smart Investments Start Here",
      subtitle:
        "Access detailed market insights, virtual tours, and direct owner contacts. Make informed decisions with confidence.",
      image:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&h=900&fit=crop",
      ctaLabel: "Explore Properties",
      ctaHref: "/search",
    },
  ];
  for (let i = 0; i < heroSlides.length; i++) {
    const h = heroSlides[i];
    await prisma.contentItem.upsert({
      where: {
        placement_slot_key: {
          placement: "REAL_STATE_HOME",
          slot: "HERO_BANNER",
          key: h.key,
        },
      },
      create: {
        placement: "REAL_STATE_HOME",
        slot: "HERO_BANNER",
        key: h.key,
        title: h.title,
        subtitle: h.subtitle,
        image: h.image,
        ctaLabel: h.ctaLabel,
        ctaHref: h.ctaHref,
        sortOrder: i,
        published: true,
      },
      update: {
        title: h.title,
        subtitle: h.subtitle,
        image: h.image,
        ctaLabel: h.ctaLabel,
        ctaHref: h.ctaHref,
        sortOrder: i,
      },
    });
  }
  console.log("Hero slides seeded");

  // ---------- Categories (REAL_STATE_HOME / CATEGORY) ----------
  const categories = [
    {
      key: "apartments",
      title: "Apartments",
      image:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&h=200&fit=crop",
    },
    {
      key: "villas",
      title: "Villas",
      image:
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=200&h=200&fit=crop",
    },
    {
      key: "land",
      title: "Land",
      image:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&h=200&fit=crop",
    },
    {
      key: "commercial",
      title: "Commercial",
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=200&fit=crop",
    },
  ];
  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    await prisma.contentItem.upsert({
      where: {
        placement_slot_key: {
          placement: "REAL_STATE_HOME",
          slot: "CATEGORY",
          key: c.key,
        },
      },
      create: {
        placement: "REAL_STATE_HOME",
        slot: "CATEGORY",
        key: c.key,
        title: c.title,
        image: c.image,
        ctaHref: "/search",
        sortOrder: i,
        published: true,
      },
      update: {
        title: c.title,
        image: c.image,
        ctaHref: "/search",
        sortOrder: i,
      },
    });
  }
  console.log("Categories seeded");

  // ---------- Gold content block sample ----------
  await prisma.contentItem.upsert({
    where: {
      placement_slot_key: {
        placement: "GOLD",
        slot: "CONTENT_BLOCK",
        key: "gold-intro",
      },
    },
    create: {
      placement: "GOLD",
      slot: "CONTENT_BLOCK",
      key: "gold-intro",
      title: "Why gold shines in Nepal",
      subtitle: "An editor-managed content block.",
      body: "This block is managed from the admin CMS. Update it here and it appears on the gold page.",
      sortOrder: 0,
      published: true,
    },
    update: {},
  });

  // ---------- Static pages ----------
  for (const p of [
    { slug: "about", route: "/about", title: "About MALPOTH" },
    { slug: "area-guid", route: "/area-guid", title: "Area Guides" },
    { slug: "compare", route: "/compare", title: "Compare Properties" },
  ]) {
    await prisma.staticPage.upsert({
      where: { slug: p.slug },
      create: p,
      update: p,
    });
  }

  // ---------- Nav + footer ----------
  const navItems = [
    { label: "Area Guides", href: "/area-guid", sortOrder: 0, published: true },
    {
      label: "NRN Concierge",
      href: "/nrn-concierge",
      sortOrder: 1,
      published: true,
    },
    { label: "About", href: "/about", sortOrder: 2, published: true },
  ];
  for (const n of navItems) await prisma.navItem.create({ data: n });

  const footerLinks = [
    { column: "Company", label: "About", href: "/about", sortOrder: 0 },
    {
      column: "Company",
      label: "Area Guides",
      href: "/area-guid",
      sortOrder: 1,
    },
    {
      column: "Legal",
      label: "Privacy Policy",
      href: "/privacy",
      sortOrder: 0,
    },
  ];
  await prisma.footerLink.createMany({
    data: footerLinks,
    skipDuplicates: true,
  });

  // ---------- SEO + settings ----------
  const seos = [
    {
      route: "/",
      title: "Verified Land & Property Listings in Nepal | MALPOTH",
      description:
        "Browse field-verified land, residential, commercial & apartment listings across Nepal.",
    },
    {
      route: "/gold",
      title: "Gold Price Today in Nepal | MALPOTH",
      description: "Live gold prices in Nepali Rupees.",
    },
    {
      route: "/scrape",
      title: "Kabadi — Sell Your Scrap | MALPOTH",
      description: "Check today scrap rates and book a pickup.",
    },
  ];
  for (const s of seos)
    await prisma.seoConfig.upsert({
      where: { route: s.route },
      create: s,
      update: s,
    });

  await prisma.siteConfig.upsert({
    where: { key: "main" },
    create: {
      key: "main",
      data: {
        brand: "MALPOTH",
        phone: "9800522234",
        phoneDisplay: "9800-KABADI",
        email: "hello@malpoth.com",
      } as any,
    },
    update: {},
  });

  // ---------- Admin user (MALPOTH operations console) ----------
  const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@malpoth.com";
  const adminPassword =
    process.env.ADMIN_SEED_PASSWORD || "MalpothAdmin@2026";
  const adminId =
    process.env.ADMIN_SEED_ID || "admin-" + randomUUID().slice(0, 8);
  const passwordHash = await hashPassword(adminPassword);
  const now = new Date();

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      id: adminId,
      name: "Super Admin",
      email: adminEmail,
      emailVerified: true,
      role: ["ADMIN"],
      isVerified: true,
      agreedToTerms: true,
      createdAt: now,
      updatedAt: now,
      accounts: {
        create: {
          id: "acct-" + randomUUID().slice(0, 8),
          accountId: adminId,
          providerId: "credential",
          password: passwordHash,
          createdAt: now,
          updatedAt: now,
        },
      },
      sessions: {
        create: {
          id: "sess-" + randomUUID().slice(0, 8),
          token: randomUUID(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: now,
          updatedAt: now,
        },
      },
    },
    update: { role: ["ADMIN"], isVerified: true, emailVerified: true },
  });
  console.log(`Admin user seeded: ${adminEmail} / ${adminPassword}`);

  // ---------- Demo marketplace: owners, listings, sold-price comps ----------
  // Realistic demo data so the admin "Market price trends" chart (avg asking vs
  // avg sold per month) has points across the last 12 months. LIVE properties
  // feed the asking-price series; PropertySaleRecord feeds the sold-price comps.

  const demoOwners = [
    {
      name: "Bikash Shrestha",
      email: "seller1@malpoth.com",
      phone: "+9779800000001",
    },
    {
      name: "Sunita Rai",
      email: "seller2@malpoth.com",
      phone: "+9779800000002",
    },
    {
      name: "Ram KC",
      email: "seller3@malpoth.com",
      phone: "+9779800000003",
    },
  ];
  const ownerIds: string[] = [];
  for (const o of demoOwners) {
    const owner = await prisma.user.upsert({
      where: { email: o.email },
      create: {
        id: "owner-" + randomUUID().slice(0, 8),
        name: o.name,
        email: o.email,
        emailVerified: true,
        role: ["SELLER"],
        isVerified: true,
        agreedToTerms: true,
        phoneNumber: o.phone,
        phoneNumberVerified: true,
        createdAt: new Date(Date.now() - 400 * 86400000),
        updatedAt: new Date(),
      },
      update: {},
    });
    ownerIds.push(owner.id);
  }
  console.log("Demo owners seeded");

  const monthsAgo = (months: number, extraDays = 0) =>
    new Date(Date.now() - months * 30 * 86400000 + extraDays * 86400000);

  const demoProperties: {
    listingCode: string;
    slug: string;
    title: string;
    propertyType: PropertyType;
    province: string;
    district: string;
    municipality: string;
    wardNumber: number;
    areaName: string;
    ropani: number;
    aana: number;
    askingPrice: number;
    ownerIndex: number;
    createdMonthsAgo: number;
    status: PropertyStatus;
    soldMonthsAgo?: number;
    soldPrice?: number;
  }[] = [
    {
      listingCode: "LOT-101-KTM",
      slug: "buddhanagar-101",
      title: "Residential plot, Buddhanagar",
      propertyType: PropertyType.RESIDENTIAL_LAND,
      province: "Bagmati",
      district: "Kathmandu",
      municipality: "Kathmandu MC",
      wardNumber: 6,
      areaName: "Buddhanagar",
      ropani: 0,
      aana: 4,
      askingPrice: 28000000,
      ownerIndex: 0,
      createdMonthsAgo: 11,
      status: PropertyStatus.LIVE,
    },
    {
      listingCode: "LOT-102-LAL",
      slug: "gwarko-102",
      title: "Corner plot, Gwarko",
      propertyType: PropertyType.RESIDENTIAL_LAND,
      province: "Bagmati",
      district: "Lalitpur",
      municipality: "Lalitpur MC",
      wardNumber: 10,
      areaName: "Gwarko",
      ropani: 0,
      aana: 5,
      askingPrice: 32000000,
      ownerIndex: 1,
      createdMonthsAgo: 10,
      status: PropertyStatus.SOLD,
      soldMonthsAgo: 9,
      soldPrice: 30500000,
    },
    {
      listingCode: "LOT-103-BKT",
      slug: "suryabinayak-103",
      title: "Residential house, Suryabinayak",
      propertyType: PropertyType.RESIDENTIAL_HOUSE,
      province: "Bagmati",
      district: "Bhaktapur",
      municipality: "Bhaktapur MC",
      wardNumber: 5,
      areaName: "Suryabinayak",
      ropani: 0,
      aana: 8,
      askingPrice: 48000000,
      ownerIndex: 2,
      createdMonthsAgo: 10,
      status: PropertyStatus.LIVE,
    },
    {
      listingCode: "LOT-104-PKR",
      slug: "lakeside-104",
      title: "Lake-view plot, Lakeside",
      propertyType: PropertyType.RESIDENTIAL_LAND,
      province: "Gandaki",
      district: "Kaski",
      municipality: "Pokhara MC",
      wardNumber: 6,
      areaName: "Lakeside",
      ropani: 0,
      aana: 6,
      askingPrice: 24500000,
      ownerIndex: 0,
      createdMonthsAgo: 9,
      status: PropertyStatus.SOLD,
      soldMonthsAgo: 8,
      soldPrice: 23200000,
    },
    {
      listingCode: "LOT-105-KTM",
      slug: "thamel-105",
      title: "Commercial land, Thamel",
      propertyType: PropertyType.COMMERCIAL_LAND,
      province: "Bagmati",
      district: "Kathmandu",
      municipality: "Kathmandu MC",
      wardNumber: 11,
      areaName: "Thamel",
      ropani: 0,
      aana: 3,
      askingPrice: 36000000,
      ownerIndex: 1,
      createdMonthsAgo: 8,
      status: PropertyStatus.LIVE,
    },
    {
      listingCode: "LOT-106-LAL",
      slug: "patan-durbar-106",
      title: "Heritage home, Patan Durbar",
      propertyType: PropertyType.HERITAGE_HOME,
      province: "Bagmati",
      district: "Lalitpur",
      municipality: "Lalitpur MC",
      wardNumber: 4,
      areaName: "Patan",
      ropani: 0,
      aana: 10,
      askingPrice: 65000000,
      ownerIndex: 2,
      createdMonthsAgo: 7,
      status: PropertyStatus.SOLD,
      soldMonthsAgo: 6,
      soldPrice: 61000000,
    },
    {
      listingCode: "LOT-107-BKT",
      slug: "chyamasingh-107",
      title: "Residential plot, Chyamasingh",
      propertyType: PropertyType.RESIDENTIAL_LAND,
      province: "Bagmati",
      district: "Bhaktapur",
      municipality: "Bhaktapur MC",
      wardNumber: 2,
      areaName: "Chyamasingh",
      ropani: 0,
      aana: 4,
      askingPrice: 22000000,
      ownerIndex: 0,
      createdMonthsAgo: 6,
      status: PropertyStatus.LIVE,
    },
    {
      listingCode: "LOT-108-PKR",
      slug: "new-road-108",
      title: "Commercial space, New Road",
      propertyType: PropertyType.COMMERCIAL_SPACE,
      province: "Gandaki",
      district: "Kaski",
      municipality: "Pokhara MC",
      wardNumber: 8,
      areaName: "New Road",
      ropani: 0,
      aana: 7,
      askingPrice: 30000000,
      ownerIndex: 1,
      createdMonthsAgo: 5,
      status: PropertyStatus.SOLD,
      soldMonthsAgo: 4,
      soldPrice: 28800000,
    },
    {
      listingCode: "LOT-109-KTM",
      slug: "chovar-109",
      title: "Agricultural land, Chovar",
      propertyType: PropertyType.AGRICULTURAL_LAND,
      province: "Bagmati",
      district: "Kathmandu",
      municipality: "Kirtipur MC",
      wardNumber: 4,
      areaName: "Chovar",
      ropani: 1,
      aana: 0,
      askingPrice: 18000000,
      ownerIndex: 2,
      createdMonthsAgo: 4,
      status: PropertyStatus.LIVE,
    },
    {
      listingCode: "LOT-110-LAL",
      slug: "sanepa-110",
      title: "Residential plot, Sanepa",
      propertyType: PropertyType.RESIDENTIAL_LAND,
      province: "Bagmati",
      district: "Lalitpur",
      municipality: "Lalitpur MC",
      wardNumber: 3,
      areaName: "Sanepa",
      ropani: 0,
      aana: 3,
      askingPrice: 21000000,
      ownerIndex: 0,
      createdMonthsAgo: 3,
      status: PropertyStatus.SOLD,
      soldMonthsAgo: 2,
      soldPrice: 20000000,
    },
    {
      listingCode: "LOT-111-KTM",
      slug: "jhamsikhel-111",
      title: "Duplex, Jhamsikhel",
      propertyType: PropertyType.RESIDENTIAL_HOUSE,
      province: "Bagmati",
      district: "Kathmandu",
      municipality: "Kathmandu MC",
      wardNumber: 9,
      areaName: "Jhamsikhel",
      ropani: 0,
      aana: 6,
      askingPrice: 39000000,
      ownerIndex: 1,
      createdMonthsAgo: 1,
      status: PropertyStatus.LIVE,
    },
    {
      listingCode: "LOT-112-BKT",
      slug: "sallaghari-112",
      title: "Corner plot, Sallaghari",
      propertyType: PropertyType.RESIDENTIAL_LAND,
      province: "Bagmati",
      district: "Bhaktapur",
      municipality: "Bhaktapur MC",
      wardNumber: 4,
      areaName: "Sallaghari",
      ropani: 0,
      aana: 5,
      askingPrice: 26500000,
      ownerIndex: 2,
      createdMonthsAgo: 0,
      status: PropertyStatus.LIVE,
    },
  ];

  const coverImages = [
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop",
  ];

  for (let i = 0; i < demoProperties.length; i++) {
    const p = demoProperties[i];
    const created = monthsAgo(p.createdMonthsAgo);
    const totalSqFt = p.ropani * 5476 + p.aana * 342.25; // 1 ropani = 5476 sqft, 1 aana = 342.25 sqft
    await prisma.property.upsert({
      where: { slug: p.slug },
      create: {
        listingCode: p.listingCode,
        slug: p.slug,
        title: p.title,
        propertyType: p.propertyType,
        status: p.status,
        verificationLevel:
          p.status === PropertyStatus.SOLD
            ? VerificationStatus.LEVEL_3_FIELD_VERIFIED
            : VerificationStatus.LEVEL_2_DOC_VERIFIED,
        askingPrice: p.askingPrice,
        originalAskingPrice: p.askingPrice,
        ownerId: ownerIds[p.ownerIndex],
        publishedAt: created,
        createdAt: created,
        updatedAt: created,
        location: {
          create: {
            province: p.province,
            district: p.district,
            municipality: p.municipality,
            wardNumber: p.wardNumber,
            areaName: p.areaName,
          },
        },
        landArea: {
          create: {
            ropani: p.ropani,
            aana: p.aana,
            totalSqFt,
            totalSqMeters: totalSqFt * 0.092903,
          },
        },
        media: {
          create: {
            url: coverImages[i % coverImages.length],
            altText: p.title,
            isCover: true,
            sortOrder: 0,
          },
        },
      },
      update: {
        status: p.status,
        askingPrice: p.askingPrice,
        propertyType: p.propertyType,
      },
    });
  }
  console.log("Demo listings seeded");

  // Sold-price comps — feeds the admin market price trend (avg sold per month).
  for (const p of demoProperties.filter(
    (x) => x.status === PropertyStatus.SOLD,
  )) {
    const property = await prisma.property.findUnique({
      where: { slug: p.slug },
      select: { id: true },
    });
    if (!property || p.soldMonthsAgo === undefined || p.soldPrice === undefined)
      continue;
    const totalAana = p.ropani * 16 + p.aana;
    await prisma.propertySaleRecord.upsert({
      where: { propertyId: property.id },
      create: {
        propertyId: property.id,
        soldPrice: p.soldPrice,
        soldPricePerAana: totalAana
          ? Math.round(p.soldPrice / totalAana)
          : null,
        soldDate: monthsAgo(p.soldMonthsAgo, 5),
        verificationLevel: VerificationStatus.LEVEL_3_FIELD_VERIFIED,
        daysOnMarket: Math.max(1, (p.createdMonthsAgo - p.soldMonthsAgo) * 30),
      },
      update: {
        soldPrice: p.soldPrice,
        soldDate: monthsAgo(p.soldMonthsAgo, 5),
      },
    });
  }
  console.log("Sold-price comps seeded");

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
