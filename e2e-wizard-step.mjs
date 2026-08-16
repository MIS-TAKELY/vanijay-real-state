/**
 * Focused e2e check: the resume flow restores the *step* too.
 * Fill Step 1 -> Continue to Step 2 -> reload -> assert we land back on Step 2.
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const EMAIL = "e2e-wizard@example.com";
const PASSWORD = "WizardTest@2026";
const TITLE = "Step Restore Check";

let failures = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/my-listings/new`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#auth-email", { timeout: 30_000 });
  await page.fill("#auth-email", EMAIL);
  await page.fill("#auth-password", PASSWORD);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.waitForSelector("#w-title", { timeout: 30_000 });

  // Fill Step 1 so it validates, then Continue to Step 2.
  await page.fill("#w-title", TITLE);
  await page.getByLabel("Residential Land").click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForSelector("text=Province", { timeout: 15_000 });
  check("reached Step 2 (Location)", true);

  // Wait past the debounced save.
  await page.waitForTimeout(900);
  const stored = await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, "lekha.wizard.draft.v1");
  check("saved step is 1 (Location)", stored?.step === 1, `step=${stored?.step}`);

  // Reload — must restore to Step 2, not back to Step 1.
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=Province", { timeout: 30_000 });
  const banner = await page.getByText("Resumed your saved draft").count();
  check("resume banner visible", banner > 0);
  const titleVisible = await page.locator("#w-title").count();
  check("back on Step 2 (title input hidden)", titleVisible === 0);
  const titleRestored = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)).draft.title,
    "lekha.wizard.draft.v1",
  );
  check("draft title still intact", titleRestored === TITLE, titleRestored);
} finally {
  await browser.close();
}

console.log(failures === 0 ? "\nALL STEP CHECKS PASSED" : `\n${failures} STEP CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
