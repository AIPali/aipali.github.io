import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://localhost:4322/', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'screenshots/homepage-hero.png', fullPage: false });
const clip = await page.evaluate(() => {
  const hero = document.querySelector('.hero-section');
  if (!hero) return null;
  const r = hero.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: Math.min(r.height, 800) };
});
if (clip) await page.screenshot({ path: 'screenshots/homepage-hero-clip.png', clip });
await browser.close();
console.log('Done');
