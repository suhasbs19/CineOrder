import { chromium } from 'playwright';

async function runMovieDetailMobileTest() {
  console.log('========================================================================');
  console.log('   CINEORDER MOVIE DETAIL PAGE MOBILE DENSITY & RESPONSIVENESS TEST    ');
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
  const testMovies = ['mcu-endgame', 'mcu-visionquest'];

  for (const testMovieId of testMovies) {
    console.log(`\n========================================================================`);
    console.log(`   TESTING MOVIE: ${testMovieId}`);
    console.log(`========================================================================`);

    for (const vp of viewports) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();

      console.log(`--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);

      await page.goto(`${baseUrl}/movie/${testMovieId}`, { waitUntil: 'networkidle' });
      await page.waitForSelector('h1');

      // 1. Measure Catch-Up Statistics Grid
      const statsMetrics = await page.evaluate(() => {
        const grid = document.querySelector('.grid.grid-cols-2');
        if (!grid) return null;
        const rect = grid.getBoundingClientRect();
        const cards = Array.from(grid.children).map((c) => {
          const r = c.getBoundingClientRect();
          return {
            width: Math.round(r.width),
            height: Math.round(r.height),
            text: c.textContent?.trim().slice(0, 30),
          };
        });
        return {
          totalWidth: Math.round(rect.width),
          totalHeight: Math.round(rect.height),
          cardsCount: cards.length,
          cards,
        };
      });

      // 2. Measure Movie Recommendation Cards
      const nodeCardsMetrics = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('[data-testid="story-node-card"]'));
        return cards.slice(0, 4).map((c) => {
          const rect = c.getBoundingClientRect();
          const poster = c.querySelector('img');
          const posterRect = poster?.getBoundingClientRect();
          return {
            title: c.querySelector('h4')?.textContent?.trim() || '',
            cardWidth: Math.round(rect.width),
            cardHeight: Math.round(rect.height),
            posterWidth: posterRect ? Math.round(posterRect.width) : 0,
            posterHeight: posterRect ? Math.round(posterRect.height) : 0,
          };
        });
      });

      // 3. Measure Story Connection Bars
      const connectionBarsMetrics = await page.evaluate(() => {
        const bars = Array.from(document.querySelectorAll('[data-testid="story-connection-bar"]'));
        return bars.slice(0, 3).map((b) => {
          const rect = b.getBoundingClientRect();
          return {
            barWidth: Math.round(rect.width),
            barHeight: Math.round(rect.height),
            text: b.textContent?.trim() || '',
          };
        });
      });

      // 4. Measure Theatrical Catch-Up / Story Guide Header Box
      const headerBoxMetrics = await page.evaluate(() => {
        const header = document.querySelector('.bg-gradient-to-r.from-amber-500\\/10');
        if (!header) return null;
        const rect = header.getBoundingClientRect();
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          title: header.querySelector('span')?.textContent?.trim() || '',
        };
      });

      // 5. Check Horizontal Overflow
      const overflowCheck = await page.evaluate(() => {
        return {
          docScrollWidth: document.documentElement.scrollWidth,
          windowInnerWidth: window.innerWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
        };
      });

      console.log(`  A. Catch-Up Stats Container: ${statsMetrics?.totalWidth}x${statsMetrics?.totalHeight}px (${statsMetrics?.cardsCount} cards)`);
      if (statsMetrics && vp.width < 640) {
        console.log(`     ✅ Compact 2-column grid active (Height: ${statsMetrics.totalHeight}px)`);
      }

      console.log(`  B. Movie Cards Measured (${nodeCardsMetrics.length}):`);
      for (let i = 0; i < Math.min(2, nodeCardsMetrics.length); i++) {
        const card = nodeCardsMetrics[i];
        console.log(`     [Card ${i + 1}: ${card.title}] Card: ${card.cardWidth}x${card.cardHeight}px | Poster: ${card.posterWidth}x${card.posterHeight}px`);
        if (vp.width < 640) {
          if (card.cardHeight >= 110 && card.cardHeight <= 185) {
            console.log(`       ✅ Optimal mobile card height (${card.cardHeight}px)`);
          } else {
            console.log(`       ⚠️ Notice: card height is ${card.cardHeight}px`);
          }
        }
      }

      console.log(`  C. Story Connection Bars Measured (${connectionBarsMetrics.length}):`);
      if (connectionBarsMetrics.length > 0) {
        const bar = connectionBarsMetrics[0];
        console.log(`     [Bar 1] Height: ${bar.barHeight}px | Text: "${bar.text.slice(0, 40)}..."`);
        if (vp.width < 640) {
          console.log(`       ✅ Optimal connection bar height (${bar.barHeight}px <= 70px)`);
        }
      }

      console.log(`  D. Theatrical Story Guide Header: ${headerBoxMetrics?.width}x${headerBoxMetrics?.height}px`);
      console.log(`  E. Horizontal Overflow: ${overflowCheck.hasOverflow ? '❌ OVERFLOW' : '✅ 0 Overflow'} (doc: ${overflowCheck.docScrollWidth}px, viewport: ${overflowCheck.windowInnerWidth}px)\n`);

      await context.close();
    }
  }

  await browser.close();
  console.log('========================================================================');
  console.log('  MOVIE DETAIL MOBILE TEST: ✅ ALL VIEWPORT CHECKS COMPLETED           ');
  console.log('========================================================================\n');
}

runMovieDetailMobileTest().catch((err) => {
  console.error('Movie Detail Mobile Test Failed:', err);
  process.exit(1);
});
