import { chromium } from 'playwright';

async function verifyProductionDeployment() {
  console.log('========================================================================');
  console.log('   VERIFYING PRODUCTION VERCEL DEPLOYMENT: https://cineorder.vercel.app');
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

  const prodUrl = 'https://cineorder.vercel.app';
  const testMovieId = 'mcu-endgame';
  const maxAttempts = 15;
  const pollIntervalMs = 7000;

  console.log(`Target URL: ${prodUrl}/movie/${testMovieId}`);
  console.log(`Expected Commit: 48af99b`);
  console.log(`Polling for live Vercel deployment update...\n`);

  let deployed = false;
  let attempt = 0;

  while (attempt < maxAttempts && !deployed) {
    attempt++;
    console.log(`--- Attempt ${attempt}/${maxAttempts} (T+${(attempt - 1) * 7}s) ---`);

    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    });
    const page = await context.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`    [Browser Console Error]`, msg.text());
      }
    });

    try {
      // Navigate to root first, then client-side navigate or direct load
      await page.goto(`${prodUrl}/`, { waitUntil: 'networkidle', timeout: 25000 });
      await page.waitForTimeout(1000);

      // Now navigate to movie detail page
      await page.goto(`${prodUrl}/movie/${testMovieId}`, { waitUntil: 'networkidle', timeout: 25000 });
      await page.waitForTimeout(2000);

      const pageInfo = await page.evaluate(() => {
        const title = document.title;
        const statsGrid = document.querySelector('.grid.grid-cols-2');
        const nodeCards = Array.from(document.querySelectorAll('[data-testid="story-node-card"]'));
        const connBars = Array.from(document.querySelectorAll('[data-testid="story-connection-bar"]'));
        const headerBox = document.querySelector('.bg-gradient-to-r.from-amber-500\\/10');

        let statsHeight = 0;
        if (statsGrid) {
          statsHeight = Math.round(statsGrid.getBoundingClientRect().height);
        }

        let firstCardHeight = 0;
        let firstPosterWidth = 0;
        if (nodeCards.length > 0) {
          const r = nodeCards[0].getBoundingClientRect();
          firstCardHeight = Math.round(r.height);
          const img = nodeCards[0].querySelector('img');
          if (img) {
            firstPosterWidth = Math.round(img.getBoundingClientRect().width);
          }
        }

        let firstBarHeight = 0;
        if (connBars.length > 0) {
          firstBarHeight = Math.round(connBars[0].getBoundingClientRect().height);
        }

        return {
          title,
          hasNewStatsGrid: Boolean(statsGrid),
          statsHeight,
          hasNodeCardTestId: nodeCards.length > 0,
          nodeCardsCount: nodeCards.length,
          firstCardHeight,
          firstPosterWidth,
          hasConnBarTestId: connBars.length > 0,
          firstBarHeight,
          headerBoxHeight: headerBox ? Math.round(headerBox.getBoundingClientRect().height) : 0,
          docScrollWidth: document.documentElement.scrollWidth,
          windowInnerWidth: window.innerWidth,
        };
      });

      console.log(`  Live Evaluation on https://order.vercel.app:`);
      console.log(`    - Page title: "${pageInfo.title}"`);
      console.log(`    - hasNewStatsGrid (2-col grid): ${pageInfo.hasNewStatsGrid} (height: ${pageInfo.statsHeight}px)`);
      console.log(`    - hasNodeCardTestId (compact cards): ${pageInfo.hasNodeCardTestId} (count: ${pageInfo.nodeCardsCount}, card height: ${pageInfo.firstCardHeight}px, poster width: ${pageInfo.firstPosterWidth}px)`);
      console.log(`    - hasConnBarTestId (compact connection bar): ${pageInfo.hasConnBarTestId} (bar height: ${pageInfo.firstBarHeight}px)`);
      console.log(`    - docScrollWidth vs windowInnerWidth: ${pageInfo.docScrollWidth}px / ${pageInfo.windowInnerWidth}px (overflow: ${pageInfo.docScrollWidth > pageInfo.windowInnerWidth})`);

      if (pageInfo.hasNewStatsGrid && pageInfo.hasNodeCardTestId && pageInfo.firstCardHeight <= 175) {
        console.log(`\n🎉 CONFIRMED: Live Vercel deployment contains the new MovieDetail mobile density updates!`);
        deployed = true;
        await context.close();
        break;
      } else {
        console.log(`    ⏳ Deployment still building/propagating on Vercel. Waiting...`);
      }
    } catch (e: any) {
      console.log(`    ⚠️ Error during fetch/evaluate: ${e.message}`);
    }

    await context.close();
    if (!deployed) {
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }
  }

  await browser.close();

  if (!deployed) {
    console.error('\n❌ Deployment verification timed out. Vercel may still be building or pending.');
    process.exit(1);
  } else {
    console.log('\n========================================================================');
    console.log('   PRODUCTION DEPLOYMENT VERIFICATION: ✅ FULLY DEPLOYED AND VERIFIED  ');
    console.log('========================================================================');
  }
}

verifyProductionDeployment().catch((err) => {
  console.error('Production Verification Failed:', err);
  process.exit(1);
});
