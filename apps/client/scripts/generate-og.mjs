#!/usr/bin/env node
/**
 * Generates public/og-home.png — the OpenGraph image for the landing page.
 * Run: node scripts/generate-og.mjs
 *
 * Requires: npx playwright install chromium (once)
 */
import { chromium } from "playwright";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "../public");
const outputPath = resolve(publicDir, "og-home.png");

const WIDTH = 1200;
const HEIGHT = 630;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=${WIDTH}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,700;9..144,800&family=Public+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    overflow: hidden;
    font-family: 'Public Sans', sans-serif;
    background: #0A2540;
    color: #fff;
  }

  .container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 64px 80px;
    position: relative;
    overflow: hidden;
  }

  /* Subtle topo-pattern overlay */
  .container::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 85% 20%, rgba(201,162,39,0.08) 0%, transparent 50%),
      radial-gradient(circle at 10% 80%, rgba(16,48,80,0.4) 0%, transparent 50%);
    pointer-events: none;
  }

  /* Gold accent line */
  .accent-line {
    width: 56px;
    height: 4px;
    background: #C9A227;
    border-radius: 2px;
    margin-bottom: 28px;
    position: relative;
    z-index: 1;
  }

  .eyebrow {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #C9A227;
    margin-bottom: 16px;
    position: relative;
    z-index: 1;
  }

  h1 {
    font-family: 'Fraunces', serif;
    font-size: 52px;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: #ffffff;
    max-width: 820px;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
  }

  .tagline {
    font-size: 20px;
    font-weight: 400;
    line-height: 1.5;
    color: rgba(255,255,255,0.72);
    max-width: 680px;
    position: relative;
    z-index: 1;
  }

  .bottom-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #C9A227 0%, #C9A227 40%, rgba(201,162,39,0.2) 100%);
  }

  /* Logo mark — simplified crown shape */
  .logo {
    position: absolute;
    top: 48px;
    right: 72px;
    display: flex;
    align-items: center;
    gap: 14px;
    z-index: 1;
  }

  .logo-icon {
    width: 44px;
    height: 44px;
    border: 2.5px solid #C9A227;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Fraunces', serif;
    font-weight: 800;
    font-size: 22px;
    color: #C9A227;
  }

  .logo-text {
    font-family: 'Fraunces', serif;
    font-weight: 700;
    font-size: 24px;
    color: #ffffff;
    letter-spacing: 0.04em;
  }

  /* Nepal map silhouette — subtle decorative element */
  .map-deco {
    position: absolute;
    right: -40px;
    bottom: 40px;
    width: 320px;
    height: 260px;
    opacity: 0.04;
    z-index: 0;
  }

  .map-deco svg {
    width: 100%;
    height: 100%;
  }

  /* Stats row */
  .stats {
    display: flex;
    gap: 40px;
    margin-top: 32px;
    position: relative;
    z-index: 1;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-value {
    font-family: 'Fraunces', serif;
    font-size: 28px;
    font-weight: 700;
    color: #C9A227;
  }

  .stat-label {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.02em;
  }
</style>
</head>
<body>
  <div class="container">
    <!-- Logo -->
    <div class="logo">
      <div class="logo-icon">M</div>
      <span class="logo-text">MALPOTH</span>
    </div>

    <!-- Content -->
    <div class="accent-line"></div>
    <div class="eyebrow">Nepal's Verified Property Archive</div>
    <h1>Verified Land &amp; Property Listings in Nepal</h1>
    <p class="tagline">
      Every listing cross-referenced against cadastral records.
      Zero title disputes. 74 districts indexed.
    </p>

    <!-- Stats -->
    <div class="stats">
      <div class="stat">
        <span class="stat-value">12,000+</span>
        <span class="stat-label">Verified Listings</span>
      </div>
      <div class="stat">
        <span class="stat-value">74</span>
        <span class="stat-label">Districts Covered</span>
      </div>
      <div class="stat">
        <span class="stat-value">100%</span>
        <span class="stat-label">Cadastral Cleared</span>
      </div>
    </div>

    <!-- Bottom gold accent -->
    <div class="bottom-bar"></div>

    <!-- Nepal map silhouette (decorative) -->
    <div class="map-deco">
      <svg viewBox="0 0 400 300" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 120 C60 100, 80 90, 100 85 C120 80, 140 75, 160 70 C180 65, 200 60, 220 58 C240 56, 260 55, 280 58 C300 61, 320 68, 340 75 C360 82, 370 90, 380 100 C385 110, 380 120, 370 130 C360 140, 340 150, 320 155 C300 160, 280 162, 260 165 C240 168, 220 170, 200 172 C180 174, 160 175, 140 178 C120 181, 100 185, 80 190 C60 195, 45 200, 40 210 C35 220, 38 215, 42 205 C46 195, 55 180, 50 165 C45 150, 42 140, 50 120Z" />
      </svg>
    </div>
  </div>
</body>
</html>`;

async function main() {
  console.log("🎨 Generating OG image...");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2, // 2x for retina-quality
  });

  await page.setContent(html, { waitUntil: "networkidle" });

  // Wait for fonts to load
  await page.waitForFunction(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 500));

  const buffer = await page.screenshot({
    type: "png",
    clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
  });

  writeFileSync(outputPath, buffer);
  await browser.close();

  console.log(`✅ OG image saved to ${outputPath}`);
  console.log(`   Size: ${(buffer.length / 1024).toFixed(1)} KB`);
  console.log(`   Dimensions: ${WIDTH}x${HEIGHT} @2x = ${WIDTH * 2}x${HEIGHT * 2}`);
}

main().catch((err) => {
  console.error("❌ Failed to generate OG image:", err);
  process.exit(1);
});
