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
    },
    {
      slug: "plastic",
      name: "Plastic",
      nepali: "प्लास्टिक",
      icon: "recycling",
      blurb:
        "PET bottles, milk packets, buckets and hard plastic. Sorted plastic pays more.",
    },
    {
      slug: "metal",
      name: "Metals",
      nepali: "धातु",
      icon: "hammer",
      blurb:
        "Copper, brass, aluminum, iron and steel. The heavy hitters of the kabadi world.",
    },
    {
      slug: "ewaste",
      name: "E-Waste",
      nepali: "इ-फोहोर",
      icon: "cpu",
      blurb:
        "Old phones, laptops, CPUs, monitors and printers. Value is per piece.",
    },
    {
      slug: "appliance",
      name: "Appliances",
      nepali: "विद्युतीय सामान",
      icon: "refrigerator",
      blurb:
        "Fridges, washing machines, ACs, geysers and microwaves — priced per unit.",
    },
    {
      slug: "other",
      name: "Glass & Other",
      nepali: "अन्य सामान",
      icon: "bottle",
      blurb: "Glass bottles, clothes, tires, batteries and vehicles.",
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

  // ---------- Kabadi items (mirrors lib/kabadi/rates.ts key rates) ----------
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
      id: "paper-cardboard",
      name: "Cardboard / gatta",
      nepali: "गत्ता",
      unit: "KG",
      rate: 12,
      cat: "paper",
    },
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
      id: "plastic-hard",
      name: "Hard plastic (buckets, chairs)",
      nepali: "कडा प्लास्टिक",
      unit: "KG",
      rate: 15,
      cat: "plastic",
    },
    {
      id: "metal-copper",
      name: "Copper (wire, tube)",
      nepali: "तामा",
      unit: "KG",
      rate: 1400,
      cat: "metal",
      popular: true,
    },
    {
      id: "metal-aluminum",
      name: "Aluminum",
      nepali: "एल्मुनियम",
      unit: "KG",
      rate: 210,
      cat: "metal",
    },
    {
      id: "metal-iron",
      name: "Iron / steel scrap",
      nepali: "फलाम",
      unit: "KG",
      rate: 35,
      cat: "metal",
    },
    {
      id: "ewaste-phone",
      name: "Old smartphone",
      nepali: "पुरानो मोबाइल",
      unit: "PIECE",
      rate: 150,
      cat: "ewaste",
      popular: true,
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
      id: "ewaste-laptop",
      name: "Laptop",
      nepali: "ल्यापटप",
      unit: "PIECE",
      rate: 350,
      cat: "ewaste",
    },
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
      id: "other-glass",
      name: "Glass bottles",
      nepali: "सिसाको बोतल",
      unit: "KG",
      rate: 6,
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
    { slug: "about", route: "/about", title: "About Lekhaprati" },
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
      title: "Verified Land & Property Listings in Nepal | Lekhaprati",
      description:
        "Browse field-verified land, residential, commercial & apartment listings across Nepal.",
    },
    {
      route: "/gold",
      title: "Gold Price Today in Nepal | Lekhaprati",
      description: "Live gold prices in Nepali Rupees.",
    },
    {
      route: "/scrape",
      title: "Kabadi — Sell Your Scrap | Lekhaprati",
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
        brand: "Lekhaprati",
        phone: "9800522234",
        phoneDisplay: "9800-KABADI",
        email: "hello@lekhaprati.com",
      } as any,
    },
    update: {},
  });

  // ---------- Admin user (Lekhaprati operations console) ----------
  const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@lekhaprati.com";
  const adminPassword =
    process.env.ADMIN_SEED_PASSWORD || "LekhapratiAdmin@2026";
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
      email: "seller1@lekhaprati.com",
      phone: "+9779800000001",
    },
    {
      name: "Sunita Rai",
      email: "seller2@lekhaprati.com",
      phone: "+9779800000002",
    },
    {
      name: "Ram KC",
      email: "seller3@lekhaprati.com",
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
