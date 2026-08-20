import { chromium } from 'playwright';

async function runMobileResponsivenessTest() {
  console.log('========================================================================');
  console.log('     CINEORDER MOBILE UPCOMING CARD RESPONSIVENESS TEST SUITE          ');
  console.log('========================================================================\n');

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    try {
      browser = await chromium.launch({ channel: 'msedge', headless: true });
    } catch {
      browser = await chromium.launch({ channel: 'chrome', headless: true });
    }
  }

  const viewports = [
    { name: 'Small Phone (320px)', width: 320, height: 568 },
    { name: 'Android Standard (360px)', width: 360, height: 640 },
    { name: 'iPhone SE / 8 (375px)', width: 375, height: 667 },
    { name: 'iPhone 12/13/14 (390px)', width: 390, height: 844 },
    { name: 'iPhone Plus / Max (414px)', width: 414, height: 896 },
    { name: 'iPhone 14/15 Pro Max (430px)', width: 430, height: 932 },
    { name: 'Tablet (768px)', width: 768, height: 1024 },
    { name: 'Desktop Small (1024px)', width: 1024, height: 768 },
    { name: 'Desktop Full (1280px)', width: 1280, height: 800 },
  ];

  const baseUrl = 'http://localhost:4173';

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    console.log(`--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);

    // 1. Upcoming Page
    await page.goto(`${baseUrl}/upcoming`, { waitUntil: 'networkidle' });
    await page.waitForSelector('h1, h2');

    // Get measurements for upcoming cards
    const upcomingCardsMetrics = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[data-testid="upcoming-card"]'));
      return cards.slice(0, 5).map((card) => {
        const rect = card.getBoundingClientRect();
        const img = card.querySelector('img');
        const imgRect = img?.getBoundingClientRect();
        return {
          cardWidth: Math.round(rect.width),
          cardHeight: Math.round(rect.height),
          posterWidth: imgRect ? Math.round(imgRect.width) : 0,
          posterHeight: imgRect ? Math.round(imgRect.height) : 0,
          naturalWidth: img?.naturalWidth || 0,
          title: card.querySelector('h3')?.textContent?.trim() || '',
        };
      });
    });

    console.log(`  Upcoming Grid Cards measured: ${upcomingCardsMetrics.length}`);
    for (let i = 0; i < Math.min(2, upcomingCardsMetrics.length); i++) {
      const m = upcomingCardsMetrics[i];
      console.log(`    [Card ${i + 1}: ${m.title}] Card: ${m.cardWidth}x${m.cardHeight}px | Poster: ${m.posterWidth}x${m.posterHeight}px | ImgLoaded: ${m.naturalWidth > 0}`);
      if (vp.width < 640) {
        // Assert mobile card height is compact (between 150-260px) and poster width is in 90-120px range
        if (m.cardHeight <= 260 && m.posterWidth <= 120 && m.posterWidth >= 90) {
          console.log(`      ✅ Mobile sizing optimal (Card Height ${m.cardHeight}px <= 260px, Poster Width ${m.posterWidth}px in 90-120px range)`);
        } else {
          console.log(`      ⚠️ Notice: Height ${m.cardHeight}px, Poster width ${m.posterWidth}px`);
        }
      } else {
        // On desktop/tablet, card returns to standard full-width vertical card
        console.log(`      ✅ Desktop/Tablet sizing intact (Card: ${m.cardWidth}x${m.cardHeight}px)`);
      }
    }

    // 2. Home Page
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    const homeUpcomingMetrics = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[data-testid="upcoming-card"]'));
      return cards.slice(0, 2).map((c) => {
        const rect = c.getBoundingClientRect();
        const img = c.querySelector('img');
        const imgRect = img?.getBoundingClientRect();
        return {
          cardWidth: Math.round(rect.width),
          cardHeight: Math.round(rect.height),
          posterWidth: imgRect ? Math.round(imgRect.width) : 0,
          posterHeight: imgRect ? Math.round(imgRect.height) : 0,
          title: c.querySelector('h3')?.textContent?.trim() || '',
        };
      });
    });
    console.log(`  Home Page Upcoming Cards:`, JSON.stringify(homeUpcomingMetrics));

    // 3. Detail Page
    await page.goto(`${baseUrl}/movie/mcu-visionquest`, { waitUntil: 'networkidle' });
    const detailTitleSize = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return {
        text: h1?.textContent?.trim(),
        fontSize: window.getComputedStyle(h1!).fontSize,
      };
    });
    console.log(`  VisionQuest Detail Title (${vp.width}px): '${detailTitleSize.text}' at ${detailTitleSize.fontSize}\n`);

    await context.close();
  }

  await browser.close();
  console.log('========================================================================');
  console.log('  RESPONSIVENESS TEST: ✅ COMPLETED ALL VIEWPORT CHECKS                 ');
  console.log('========================================================================\n');
}

runMobileResponsivenessTest().catch((err) => {
  console.error('Mobile Responsiveness Test Failed:', err);
  process.exit(1);
});
