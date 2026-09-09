import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const t = await p.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 20000 });
console.log('STATUS', t && t.status());
console.log('TITLE', (await p.title()).slice(0,80));
await b.close();
console.log('DONE');
