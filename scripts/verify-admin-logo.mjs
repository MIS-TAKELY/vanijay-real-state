import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const ADMIN = "http://localhost:3001";
const OUT = "scripts/.shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function newPage(viewport) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`PAGEERROR: ${err.message}`));
  page._consoleErrors = consoleErrors;
  return page;
}

async function reportImages(page, label, selector) {
  const results = await page.evaluate((sel) => {
    return [...document.querySelectorAll(sel)].map((img) => {
      const rect = img.getBoundingClientRect();
      const style = getComputedStyle(img);
      return {
        loaded: img.complete && img.naturalWidth > 0,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayWidth: Math.round(rect.width),
        displayHeight: Math.round(rect.height),
        visible:
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== "hidden" &&
          style.display !== "none",
        alt: img.getAttribute("alt"),
        src: img.getAttribute("src")?.slice(0, 70),
      };
    });
  }, selector);
  console.log(`\n=== ${label} ===`);
  if (!results.length) console.log("[MISSING] no images matched");
  for (const r of results) {
    console.log(
      `[${r.loaded ? "OK" : "FAIL"}] natural ${r.naturalWidth}x${r.naturalHeight}, ` +
        `displayed ${r.displayWidth}x${r.displayHeight}, visible=${r.visible}, alt="${r.alt}", src=${r.src}`,
    );
  }
}

async function checkLoginPage(page, tag) {
  console.log(`\n[${tag}] Opening /login`);
  await page.goto(`${ADMIN}/login`, { waitUntil: "networkidle" });
  await page.waitForSelector('img[alt="MALPOTH"]', { timeout: 10000 });
  await page.waitForTimeout(800);

  await reportImages(page, `${tag} — LOGIN PAGE logo images`, 'img[alt="MALPOTH"]');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  console.log(`[${tag}] horizontal overflow: ${overflow ? "YES ⚠️" : "no"}`);
  await page.screenshot({ path: `${OUT}/${tag}-login.png`, fullPage: true });
}

async function signIn(page, tag) {
  console.log(`\n[${tag}] Signing in as admin@lekhaprati.com`);
  await page.fill('#email, input[type="email"]', "admin@lekhaprati.com");
  await page.fill('#password, input[type="password"]', "LekhapratiAdmin@2026");
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 }),
    page.click('button[type="submit"]'),
  ]);
  console.log(`[${tag}] at: ${page.url()}`);
  await page.waitForTimeout(1500);
}

// ================= DESKTOP =================
const desk = await newPage({ width: 1440, height: 900 });
await checkLoginPage(desk, "desktop");
await signIn(desk, "desktop");

if (await desk.$('[data-slot="sidebar"] img')) {
  await reportImages(desk, "desktop — CONSOLE SIDEBAR logo images", '[data-slot="sidebar"] img');
}
await desk.screenshot({ path: `${OUT}/desktop-console-sidebar.png`, fullPage: false });

// ---------- 4. Collapse the sidebar (icon-only) ----------
console.log(`\n[desktop] collapsing sidebar via trigger`);
await desk.click('[data-sidebar="trigger"], [aria-label="Toggle navigation"]');
await desk.waitForTimeout(800); // transition

const collapsed = await desk.evaluate(() => {
  const rail = document.querySelector('[data-slot="sidebar"][data-variant="sidebar"]');
  if (!rail) return { state: "no rail", width: null };
  const rect = rail.getBoundingClientRect();
  return {
    state: rail.getAttribute("data-state"),
    collapsible: rail.getAttribute("data-collapsible"),
    width: Math.round(rect.width),
  };
});
console.log(`[desktop] sidebar rail: ${JSON.stringify(collapsed)}`);

await reportImages(
  desk,
  "desktop — COLLAPSED SIDEBAR logo images",
  '[data-slot="sidebar"] img[alt="MALPOTH"]',
);

const collapsedOverflow = await desk.evaluate(() => {
  const imgs = [...document.querySelectorAll('[data-slot="sidebar"] img[alt="MALPOTH"]')].map((img) => {
    const r = img.getBoundingClientRect();
    return {
      alt: img.getAttribute("alt"),
      w: Math.round(r.width),
      left: Math.round(r.left),
      right: Math.round(r.right),
      natural: img.naturalWidth,
    };
  });
  const rail = document.querySelector('[data-slot="sidebar"][data-variant="sidebar"]');
  const railRect = rail?.getBoundingClientRect();
  return {
    imgs,
    railLeft: railRect ? Math.round(railRect.left) : null,
    railRight: railRect ? Math.round(railRect.right) : null,
    pageOverflow: document.documentElement.scrollWidth > window.innerWidth,
  };
});
console.log(`[desktop] collapsed state geometry: ${JSON.stringify(collapsedOverflow, null, 1)}`);
await desk.screenshot({ path: `${OUT}/desktop-console-collapsed.png`, fullPage: false });

// Expand again so the mobile phase starts from a clean state is irrelevant (separate context)
console.log(`\n[desktop] console errors: ${desk._consoleErrors.length ? desk._consoleErrors.join(" | ") : "(none)"}`);
await desk.close();

// ================= MOBILE =================
const mob = await newPage({ width: 375, height: 667 });
await checkLoginPage(mob, "mobile");
await signIn(mob, "mobile");

// Desktop rail must be hidden on mobile
const desktopRailHidden = await mob.evaluate(() => {
  const rail = document.querySelector('[data-slot="sidebar"][data-mobile="true"] ~ * , [data-slot="sidebar"]');
  const desktop = document.querySelector('[data-variant="sidebar"]');
  return desktop ? getComputedStyle(desktop).display === "none" || getComputedStyle(desktop).display === "" : "n/a";
});
console.log(`[mobile] desktop sidebar rail hidden: ${desktopRailHidden}`);

// Drawer closed: no visible sidebar logos yet
const closedLogos = await mob.evaluate(() => {
  return [...document.querySelectorAll('[data-slot="sidebar"] img[alt="MALPOTH"]')].filter(
    (img) => img.getBoundingClientRect().width > 0 && img.getBoundingClientRect().height > 0,
  ).length;
});
console.log(`[mobile] visible sidebar logos before opening drawer: ${closedLogos}`);
await mob.screenshot({ path: `${OUT}/mobile-console-closed.png`, fullPage: false });

// Open the mobile drawer via SidebarTrigger
console.log(`\n[mobile] opening drawer via SidebarTrigger`);
await mob.click('[data-sidebar="trigger"], [aria-label="Toggle navigation"]');
await mob.waitForSelector('[data-slot="sidebar"][data-mobile="true"]', { timeout: 5000 });
await mob.waitForTimeout(800); // drawer animation

await reportImages(
  mob,
  "mobile — DRAWER logo images",
  '[data-slot="sidebar"][data-mobile="true"] img[alt="MALPOTH"]',
);
const drawerOverflow = await mob.evaluate(() => {
  const drawer = document.querySelector('[data-slot="sidebar"][data-mobile="true"]');
  if (!drawer) return "no drawer";
  const rect = drawer.getBoundingClientRect();
  return { left: Math.round(rect.left), right: Math.round(rect.right), viewport: window.innerWidth };
});
console.log(`[mobile] drawer bounds: ${JSON.stringify(drawerOverflow)}`);
await mob.screenshot({ path: `${OUT}/mobile-console-drawer.png`, fullPage: false });

console.log(`\n[mobile] console errors: ${mob._consoleErrors.length ? mob._consoleErrors.join(" | ") : "(none)"}`);
await mob.close();

await browser.close();
