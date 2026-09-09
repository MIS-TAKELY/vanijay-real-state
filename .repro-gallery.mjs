import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
p.on('console', m => { if (m.type()==='error') errors.push(m.text().slice(0,200)); });
p.on('pageerror', e => errors.push('PAGEERROR '+e.message.slice(0,200)));
await p.goto('http://localhost:3000/gallery-test', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForSelector('.cursor-zoom-in', { timeout: 30000 });
await p.waitForTimeout(800);
await p.click('.cursor-zoom-in >> nth=0');
await p.waitForSelector('div[role="dialog"]', { timeout: 10000 });
await p.waitForTimeout(600);
const sample = () => p.evaluate(() => {
  const d = document.querySelector('div[role="dialog"]');
  const stage = d.children[1];
  const img = stage.querySelector('img');
  return {
    dialogBg: getComputedStyle(d).backgroundColor,
    stageBg: getComputedStyle(stage).backgroundColor,
    imgTransform: img ? getComputedStyle(img).transform : null,
  };
});
console.log('ZOOM1', JSON.stringify(await sample()));
await p.screenshot({ path: '/tmp/lb-zoom1.png' });
// zoom via wheel over stage
const stage = await p.$('div[role="dialog"] > div:nth-child(2)');
const box = await stage.boundingBox();
await p.mouse.move(box.x + box.width/2, box.y + box.height/2);
for (let i=0;i<6;i++) await p.mouse.wheel(0, -120);
await p.waitForTimeout(500);
console.log('ZOOMED', JSON.stringify(await sample()));
await p.screenshot({ path: '/tmp/lb-zoom3.png' });
// sample actual pixels from the screenshot region (background corner of stage)
const px = await p.evaluate(() => {
  const d = document.querySelector('div[role="dialog"]');
  const stage = d.children[1];
  const r = stage.getBoundingClientRect();
  const el = document.elementFromPoint(r.left + 8, r.top + 8);
  const cs = el ? getComputedStyle(el) : null;
  return { cornerEl: el ? el.tagName + '.' + el.className : null, cornerBg: cs ? cs.backgroundColor : null, rect: {l:r.left,t:r.top,w:r.width,h:r.height} };
});
console.log('CORNER', JSON.stringify(px));
console.log('ERRORS', JSON.stringify(errors));
await b.close();
