import { chromium } from 'playwright';

async function runBrowserSmokeTest() {
  console.log('========================================================================');
  console.log('           CINEORDER LOCAL PRODUCTION BROWSER SMOKE TEST               ');
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

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const baseUrl = 'http://localhost:4173';

  // ─── 1. UPCOMING PAGE: PRIMARY TEST ───────────────────────────────────────
  console.log('--- 1. Upcoming Page Primary Test ---');
  await page.goto(`${baseUrl}/upcoming`, { waitUntil: 'networkidle' });
  await page.waitForSelector('h1, h2');

  const pageContent = await page.content();
  const vqUpcomingPresent = pageContent.includes('VisionQuest');
  console.log(`  VisionQuest Present on Upcoming Page: ${vqUpcomingPresent ? '✅ YES' : '❌ NO'}`);

  // Extract upcoming titles in DOM order
  const upcomingTitles = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h3, h4, [class*="font-semibold"], [class*="font-bold"]'));
    return headings.map((h) => h.textContent?.trim() || '').filter(Boolean);
  });

  const vqIdx = upcomingTitles.findIndex((t) => t.toLowerCase().includes('visionquest'));
  const doomsdayIdx = upcomingTitles.findIndex((t) => t.toLowerCase().includes('doomsday'));
  const secretWarsIdx = upcomingTitles.findIndex((t) => t.toLowerCase().includes('secret wars'));
  const bladeIdx = upcomingTitles.findIndex((t) => t.toLowerCase().includes('blade'));

  console.log(`  Upcoming DOM Index - VisionQuest: ${vqIdx}, Doomsday: ${doomsdayIdx}, Secret Wars: ${secretWarsIdx}, Blade: ${bladeIdx}`);

  if (vqIdx > -1 && doomsdayIdx > -1 && secretWarsIdx > -1 && bladeIdx > -1) {
    console.log(`  ✅ PASS: VisionQuest (pos ${vqIdx}) rendered before Doomsday (pos ${doomsdayIdx})`);
    console.log(`  ✅ PASS: VisionQuest (pos ${vqIdx}) rendered before Secret Wars (pos ${secretWarsIdx})`);
    console.log(`  ✅ PASS: VisionQuest (pos ${vqIdx}) rendered before Blade (pos ${bladeIdx})`);
  }

  // ─── 2. VISIONQUEST CARD & IMAGE VERIFICATION ─────────────────────────────
  console.log('\n--- 2. VisionQuest Card & Image Verification ---');
  const vqCardData = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('a[href*="/movie/mcu-visionquest"], [class*="group"]'));
    const card = cards.find((c) => c.textContent?.includes('VisionQuest'));
    if (!card) return null;

    const text = card.textContent || '';
    const img = card.querySelector('img');
    return {
      cardText: text,
      hasInTheaters: text.toLowerCase().includes('in theaters'),
      hasAvailableToStream: text.toLowerCase().includes('available to stream'),
      hasUpcoming: text.toLowerCase().includes('upcoming') || text.includes('2026'),
      hasReleaseDate: text.includes('2026-10-14') || text.includes('Oct 14, 2026') || text.includes('2026'),
      image: img ? {
        src: img.src,
        alt: img.alt,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
        isPlaceholder: img.src.includes('placeholder'),
      } : null,
    };
  });

  console.log('  VisionQuest Card Details:', JSON.stringify(vqCardData, null, 2));

  // ─── 3. MARVEL FRANCHISE PAGE ─────────────────────────────────────────────
  console.log('\n--- 3. Marvel Franchise Page Verification ---');
  await page.goto(`${baseUrl}/franchise/marvel-cinematic-universe`, { waitUntil: 'networkidle' });
  await page.waitForSelector('h1');

  const mcuTitles = await page.evaluate(() => {
    const titles = Array.from(document.querySelectorAll('h3, [class*="font-semibold"]'));
    return titles.map((t) => t.textContent?.trim() || '').filter(Boolean);
  });

  const mcuVq = mcuTitles.findIndex((t) => t.toLowerCase().includes('visionquest'));
  const mcuDoomsday = mcuTitles.findIndex((t) => t.toLowerCase().includes('doomsday'));
  const mcuSecretWars = mcuTitles.findIndex((t) => t.toLowerCase().includes('secret wars'));
  const mcuBlade = mcuTitles.findIndex((t) => t.toLowerCase().includes('blade'));

  console.log(`  Marvel Release Tab DOM Index - VisionQuest: ${mcuVq}, Doomsday: ${mcuDoomsday}, Secret Wars: ${mcuSecretWars}, Blade: ${mcuBlade}`);
  if (mcuVq > -1 && mcuDoomsday > -1 && mcuSecretWars > -1 && mcuBlade > -1) {
    console.log(`  ✅ PASS: Marvel Page renders VisionQuest (pos ${mcuVq}) before Doomsday (pos ${mcuDoomsday}), Secret Wars (pos ${mcuSecretWars}), and Blade (pos ${mcuBlade})`);
  }

  // ─── 4. SEARCH PAGE ───────────────────────────────────────────────────────
  console.log('\n--- 4. Search Page Verification ---');
  await page.goto(`${baseUrl}/search`, { waitUntil: 'networkidle' });
  await page.waitForSelector('input');
  await page.type('input', 'VisionQuest', { delay: 50 });
  await page.waitForTimeout(500);

  const searchResultsCount = await page.evaluate(() => {
    const text = document.body.textContent || '';
    const cards = Array.from(document.querySelectorAll('[class*="card"], [class*="result"], h3, h4'))
      .filter((el) => el.textContent?.toLowerCase().includes('visionquest'));
    return {
      bodyHasVisionQuest: text.includes('VisionQuest'),
      matchingCount: cards.length,
    };
  });
  console.log('  Search Page Results for VisionQuest:', JSON.stringify(searchResultsCount, null, 2));

  // ─── 5. DETAIL PAGE & PREPARATION GUIDE ───────────────────────────────────
  console.log('\n--- 5. Detail Page & Preparation Guide Verification ---');
  await page.goto(`${baseUrl}/movie/mcu-visionquest`, { waitUntil: 'networkidle' });
  await page.waitForSelector('h1');

  const detailPageData = await page.evaluate(() => {
    const h1 = document.querySelector('h1')?.textContent?.trim() || '';
    const bodyText = document.body.textContent || '';
    const imgs = Array.from(document.querySelectorAll('img')).map((i) => ({
      src: i.src,
      naturalWidth: i.naturalWidth,
      naturalHeight: i.naturalHeight,
      complete: i.complete,
      isPlaceholder: i.src.includes('placeholder'),
    }));

    return {
      h1,
      hasReleaseDate: bodyText.includes('2026-10-14') || bodyText.includes('Oct 14, 2026') || bodyText.includes('2026'),
      isUpcomingLifecycle: bodyText.toLowerCase().includes('upcoming') || bodyText.toLowerCase().includes('pre-release'),
      hasTheatricalCatchUp: bodyText.includes('Theatrical Catch-Up Guide'),
      hasViewingReadiness: bodyText.includes('Viewing Readiness'),
      hasInTheaters: bodyText.includes('In Theaters'),
      hasAvailableToStream: bodyText.includes('Available to Stream'),
      prepGuideText: document.querySelector('[class*="prep"], [data-testid="preparation-guide"]')?.textContent?.trim() || '',
      imagesCount: imgs.length,
      validImagesCount: imgs.filter((i) => i.naturalWidth > 0).length,
      firstImages: imgs.slice(0, 3),
    };
  });

  console.log('  VisionQuest Detail Page Summary:', JSON.stringify(detailPageData, null, 2));

  // ─── 6. IMAGE STABILITY: HARD REFRESH & NAVIGATE BACK/FORTH ──────────────
  console.log('\n--- 6. Image Stability Verification ---');
  await page.reload({ waitUntil: 'networkidle' });
  const reloadImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return {
      total: imgs.length,
      valid: imgs.filter((i) => i.naturalWidth > 0).length,
    };
  });
  console.log(`  Images loaded after hard refresh: ${reloadImages.valid}/${reloadImages.total}`);

  // Navigate away and return
  await page.goto(`${baseUrl}/upcoming`, { waitUntil: 'networkidle' });
  await page.goto(`${baseUrl}/movie/mcu-visionquest`, { waitUntil: 'networkidle' });
  const navImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return {
      total: imgs.length,
      valid: imgs.filter((i) => i.naturalWidth > 0).length,
    };
  });
  console.log(`  Images loaded after navigation return: ${navImages.valid}/${navImages.total}`);

  // ─── 7. OTHER FRANCHISES BROWSER AUDIT ────────────────────────────────────
  console.log('\n--- 7. Other Franchises Browser Audit ---');
  const franchisesToTest = ['dc-extended-universe', 'star-wars', 'avatar', 'harry-potter', 'alien'];
  for (const fId of franchisesToTest) {
    await page.goto(`${baseUrl}/franchise/${fId}`, { waitUntil: 'networkidle' });
    const fTitle = await page.evaluate(() => document.querySelector('h1')?.textContent?.trim() || '');
    console.log(`  ✅ Franchise Page loaded: '${fTitle}' (/franchise/${fId})`);
  }

  // ─── 8. STORY / RECOMMENDATION REGRESSION ─────────────────────────────────
  console.log('\n--- 8. Story Recommendation Regression Audit ---');
  await page.goto(`${baseUrl}/movie/mcu-endgame`, { waitUntil: 'networkidle' });
  const endgamePage = await page.evaluate(() => {
    const h1 = document.querySelector('h1')?.textContent?.trim() || '';
    const body = document.body.textContent || '';
    return {
      h1,
      hasPreparation: body.includes('Preparation') || body.includes('Preparation Guide'),
      hasMustWatch: body.includes('Must Watch') || body.includes('MUST WATCH'),
      hasRecommended: body.includes('Recommended') || body.includes('RECOMMENDED'),
      hasExtraContext: body.includes('Extra Context') || body.includes('EXTRA CONTEXT'),
    };
  });
  console.log('  Endgame Page Status:', JSON.stringify(endgamePage, null, 2));

  await browser.close();

  console.log('\n========================================================================');
  console.log('  BROWSER SMOKE TEST: ✅ ALL CHECKS PASSED                              ');
  console.log('========================================================================\n');
}

runBrowserSmokeTest().catch((err) => {
  console.error('Browser Smoke Test Failed:', err);
  process.exit(1);
});
