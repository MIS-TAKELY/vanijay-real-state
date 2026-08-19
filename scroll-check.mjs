import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const browser = await chromium.launch();
for (const path of ["/", "/gold", "/kabadi", "/scrape"]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 20000 });
  } catch (e) { console.log(path, "goto fail", e.message.split("\n")[0]); continue; }
  const info = await page.evaluate(() => {
    const de = document.documentElement;
    const b = document.body;
    const over = getComputedStyle(de).overflow + " / " + getComputedStyle(b).overflow;
    return {
      htmlScrollH: de.scrollHeight, htmlClientH: de.clientHeight,
      bodyScrollH: b.scrollHeight, bodyClientH: b.clientHeight,
      overflow: over,
    };
  });
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 2000);
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => window.scrollY);
  console.log(path, JSON.stringify(info), "scrollY:", before, "->", after);
  await page.close();
}
await browser.close();
