import { chromium } from "playwright";
const BASE = "http://localhost:3000";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

const chevron = page.locator('button[aria-label="Switch app"]');
console.log("chevron count:", await chevron.count());
console.log("chevron bbox:", JSON.stringify(await chevron.boundingBox()));
console.log("data-state before:", await chevron.getAttribute("data-state"));
console.log("rotate before:", await chevron.evaluate((el) => getComputedStyle(el).rotate));

await chevron.click();
await page.waitForSelector('[data-slot="dropdown-menu-content"]', { timeout: 10_000 });
console.log("data-state after click:", await chevron.getAttribute("data-state"));
for (const ms of [0, 100, 300, 600]) {
  if (ms) await page.waitForTimeout(ms - (globalThis.__last ?? 0));
  globalThis.__last = ms;
  console.log(`rotate @${ms}ms:`, await chevron.evaluate((el) => getComputedStyle(el).rotate));
}

const dd = page.locator('[data-slot="dropdown-menu-content"]').last();
const rows = dd.locator("a[href]");
console.log("rows:", await rows.count());
const info = await rows.evaluateAll((as) =>
  as.map((a) => {
    const icon = a.querySelector("svg");
    const label = [...a.querySelectorAll("span")].find((s) => s.textContent.trim().length > 0 && !s.querySelector("svg"));
    const ib = icon?.getBoundingClientRect();
    const lb = label?.getBoundingClientRect();
    return {
      text: a.textContent.trim(),
      href: a.getAttribute("href"),
      iconX: ib ? Math.round(ib.x) : null,
      labelX: lb ? Math.round(lb.x) : null,
      labelY: lb ? Math.round(lb.y) : null,
    };
  }),
);
console.log(JSON.stringify(info, null, 1));

await page.screenshot({ path: "debug-dropdown.png", clip: { x: 0, y: 60, width: 500, height: 400 } });
await browser.close();
