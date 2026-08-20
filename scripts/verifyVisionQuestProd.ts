import { chromium } from 'playwright';

async function testUpcoming() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await context.newPage();
  await page.goto('https://cineorder.vercel.app/movie/mcu-visionquest', { waitUntil: 'networkidle' });
  const data = await page.evaluate(() => {
    const title = document.title;
    const cards = Array.from(document.querySelectorAll('[data-testid="story-node-card"]'));
    const statsGrid = document.querySelector('.grid.grid-cols-2');
    const firstCardHeight = cards.length > 0 ? Math.round(cards[0].getBoundingClientRect().height) : 0;
    const statsHeight = statsGrid ? Math.round(statsGrid.getBoundingClientRect().height) : 0;
    return { title, cardsCount: cards.length, firstCardHeight, statsHeight };
  });
  console.log('Live VisionQuest Production Check:', data);
  await browser.close();
}

testUpcoming().catch(console.error);
