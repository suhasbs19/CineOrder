import { chromium } from 'playwright';

async function testDesktop() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto('https://cineorder.vercel.app/?_t=' + Date.now(), { waitUntil: 'networkidle' });
  const res = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    const brandElement = footer?.querySelector('.md\\:block');
    const isBrandVisible = brandElement ? window.getComputedStyle(brandElement).display !== 'none' : false;
    return { height: Math.round(footer?.getBoundingClientRect().height || 0), isBrandVisible };
  });
  console.log('Desktop Live Production Check:', res);
  await browser.close();
}

testDesktop().catch(console.error);
