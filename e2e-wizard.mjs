/**
 * Temporary e2e check for the wizard's localStorage draft persistence.
 * Flow: sign in -> fill Step 1 -> reload -> assert resume banner + values.
 * Run from the repo root (resolves `playwright` from root node_modules):
 *   node e2e-wizard.mjs
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const EMAIL = "e2e-wizard@example.com";
const PASSWORD = "WizardTest@2026";
const TITLE = "Playwright Draft Persistence Test";
const STORAGE_KEY = "lekha.wizard.draft.v1";

let failures = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // ── 1. Navigate to the (auth-gated) new-listing page → bounced to sign-in ──
  await page.goto(`${BASE}/my-listings/new`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#auth-email", { timeout: 30_000 });
  check("sign-in modal opened after auth redirect", true);

  // ── 2. Sign in ──
  await page.fill("#auth-email", EMAIL);
  await page.fill("#auth-password", PASSWORD);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.waitForSelector("#w-title", { timeout: 30_000 });
  check("redirected back to /my-listings/new and wizard rendered", page.url().includes("/my-listings/new"));

  // ── 3. Fill Step 1 ──
  await page.fill("#w-title", TITLE);
  await page.getByLabel("Residential Land").click();
  await page.getByRole("switch").click(); // "Price is negotiable"

  // Wait past the 400ms debounced save.
  await page.waitForTimeout(900);

  // ── 4. Assert the draft is in localStorage ──
  const stored = await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, STORAGE_KEY);
  check("draft saved to localStorage", !!stored, stored ? `step=${stored?.step}` : "no storage entry");
  check("saved title matches", stored?.draft?.title === TITLE, stored?.draft?.title ?? "null");
  check("saved propertyType matches", stored?.draft?.propertyType === "RESIDENTIAL_LAND", stored?.draft?.propertyType ?? "null");
  check("saved isNegotiable is true", stored?.draft?.isNegotiable === true, String(stored?.draft?.isNegotiable));

  // ── 5. Reload — the draft must be resumed ──
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#w-title", { timeout: 30_000 });
  const banner = await page.getByText("Resumed your saved draft").count();
  check("resume banner visible after reload", banner > 0);

  const titleAfterReload = await page.inputValue("#w-title");
  check("title restored after reload", titleAfterReload === TITLE, titleAfterReload);

  const landOn = await page.getByLabel("Residential Land").getAttribute("data-state");
  check("property type restored", landOn === "on", landOn ?? "null");

  const switchChecked = await page.getByRole("switch").getAttribute("data-state");
  check("negotiable switch restored", switchChecked === "checked", switchChecked ?? "null");

  // ── 6. "Start fresh" must clear the saved draft ──
  await page.getByRole("button", { name: "Start fresh" }).click();
  await page.waitForTimeout(200);
  const cleared = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
  check("Start fresh clears localStorage", cleared === null);
  const titleAfterFresh = await page.inputValue("#w-title");
  check("Start fresh resets the form", titleAfterFresh === "", titleAfterFresh);
  const bannerGone = await page.getByText("Resumed your saved draft").count();
  check("resume banner gone after Start fresh", bannerGone === 0);

  await page.screenshot({ path: "/tmp/e2e-wizard-final.png" });
} finally {
  await browser.close();
}

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
