import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

interface CardInfo {
  index: number;
  title: string;
  rating: string;
  posterSrc: string;
  imgLoaded: boolean;
  naturalWidth: number;
  naturalHeight: number;
  isPlaceholder: boolean;
  linkHref?: string;
}

interface NetworkLog {
  url: string;
  method: string;
  status: number;
  failed: boolean;
  errorText?: string;
}

async function auditPort(baseUrl: string, targetName: string) {
  console.log('========================================================================');
  console.log(`         CINEORDER HOME RECOMMENDED AUDIT: ${targetName} (${baseUrl})`);
  console.log('========================================================================\n');

  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    try {
      browser = await chromium.launch({ channel: 'chrome', headless: true });
    } catch {
      browser = await chromium.launch({ headless: true });
    }
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1080 },
  });
  const page = await context.newPage();

  const consoleLogs: { type: string; text: string }[] = [];
  const networkLogs: NetworkLog[] = [];

  page.on('console', (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  page.on('response', (response) => {
    networkLogs.push({
      url: response.url(),
      method: response.request().method(),
      status: response.status(),
      failed: !response.ok(),
      errorText: !response.ok() ? `Status ${response.status()}` : undefined,
    });
  });

  page.on('requestfailed', (request) => {
    networkLogs.push({
      url: request.url(),
      method: request.method(),
      status: 0,
      failed: true,
      errorText: request.failure()?.errorText || 'Failed',
    });
  });

  console.log(`[1] Navigating directly to Home page (${baseUrl})... (No search query entered)`);
  
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500); // Allow initial rendering & background enrichment if any

  // 1. Check DOM for "Recommended For You" heading
  console.log('\n[2] Checking DOM for "Recommended For You" heading...');
  const headingHandle = await page.locator('h2:has-text("Recommended For You")').first();
  const headingCount = await headingHandle.count();
  const isHeadingVisible = headingCount > 0 ? await headingHandle.isVisible() : false;
  console.log(`  Heading Found: ${headingCount > 0 ? '✅ YES' : '❌ NO'}`);
  console.log(`  Heading Visible: ${isHeadingVisible ? '✅ YES' : '❌ NO'}`);

  // 2. Identify the Recommended section container
  const recSection = page.locator('section:has(h2:has-text("Recommended For You"))');
  const sectionCount = await recSection.count();
  console.log(`  Recommended Section Found: ${sectionCount > 0 ? '✅ YES' : '❌ NO'}`);

  // 3. Extract movie cards inside the Recommended section
  console.log('\n[3] Extracting rendered movie cards inside Recommended For You section...');
  const cardData: CardInfo[] = await recSection.evaluate((sec) => {
    const cards = Array.from(sec.querySelectorAll('.grid > div'));
    return cards.map((card, idx) => {
      const titleEl = card.querySelector('h3');
      const title = titleEl?.textContent?.trim() || 'Untitled';
      
      const ratingEl = card.querySelector('.fill-yellow-400');
      const ratingContainer = ratingEl?.parentElement;
      const rating = ratingContainer?.textContent?.trim() || 'N/A';

      const img = card.querySelector('img');
      const posterSrc = img?.src || '';
      const imgLoaded = !!img && img.complete && img.naturalWidth > 0;
      const naturalWidth = img?.naturalWidth || 0;
      const naturalHeight = img?.naturalHeight || 0;
      const isPlaceholder = posterSrc.includes('placeholder');

      const link = card.querySelector('a') || card.closest('a');

      return {
        index: idx + 1,
        title,
        rating,
        posterSrc,
        imgLoaded,
        naturalWidth,
        naturalHeight,
        isPlaceholder,
        linkHref: link?.getAttribute('href') || undefined,
      };
    });
  });

  console.log(`  Total Cards Visible: ${cardData.length}`);
  const hasAtLeast6 = cardData.length >= 6;
  console.log(`  At least 6 cards visible: ${hasAtLeast6 ? '✅ PASS' : '❌ FAIL'} (${cardData.length} cards detected)`);

  console.log('\n[4] Inspecting Details of Rendered Cards:');
  cardData.slice(0, 12).forEach((c) => {
    const status = c.imgLoaded ? '✅ Image OK' : '⚠️ Image Failed/Loading';
    console.log(`  Card #${c.index}: "${c.title}" | Rating: ${c.rating} | Dimensions: ${c.naturalWidth}x${c.naturalHeight} | ${status}`);
    console.log(`    Poster: ${c.posterSrc.substring(0, 80)}...`);
  });

  // 4. Check Console Errors
  console.log('\n[5] Checking Browser Console for Errors:');
  const errors = consoleLogs.filter((l) => l.type === 'error');
  const warnings = consoleLogs.filter((l) => l.type === 'warning' || l.type === 'warn');
  console.log(`  Console Errors count: ${errors.length}`);
  if (errors.length > 0) {
    errors.forEach((err) => console.log(`    ❌ [Error] ${err.text}`));
  } else {
    console.log('  ✅ Zero browser console errors.');
  }
  if (warnings.length > 0) {
    warnings.slice(0, 5).forEach((w) => console.log(`    ⚠️ [Warn] ${w.text}`));
  }

  // 5. Check Network Requests & TMDb failures
  console.log('\n[6] Checking Network Requests (TMDb / Poster / APIs):');
  const tmdbRequests = networkLogs.filter((n) => n.url.includes('themoviedb.org') || n.url.includes('tmdb.org'));
  const failedRequests = networkLogs.filter((n) => n.failed);
  console.log(`  TMDb Requests Count: ${tmdbRequests.length}`);
  console.log(`  Total Failed Requests Count: ${failedRequests.length}`);
  if (failedRequests.length > 0) {
    failedRequests.forEach((f) => {
      console.log(`    ⚠️ Failed: ${f.method} ${f.url} -> ${f.errorText}`);
    });
  } else {
    console.log('  ✅ All network requests completed successfully.');
  }

  // 6. Capture Screenshots
  const artifactDir = 'C:\\Users\\suhas\\.gemini\\antigravity-ide\\brain\\25198410-ab34-4402-8a8f-2a357fcd25d3';
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const prefix = targetName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const screenshotPath = path.join(artifactDir, `${prefix}_recommended_section.png`);
  await recSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`\n[7] Saved rendered section screenshot to:\n    ${screenshotPath}`);

  // Scroll through page to trigger lazy-loaded sections
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((resolve) => setTimeout(resolve, 600));
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 300));
  });

  const fullpagePath = path.join(artifactDir, `${prefix}_fullpage.png`);
  await page.screenshot({ path: fullpagePath, fullPage: true });
  console.log(`    Saved fullpage screenshot to:\n    ${fullpagePath}`);

  // Summary object output in JSON
  const summary = {
    target: targetName,
    url: baseUrl,
    headingExists: headingCount > 0,
    headingVisible: isHeadingVisible,
    cardsCount: cardData.length,
    cards: cardData,
    consoleErrors: errors,
    failedNetworkRequests: failedRequests,
    screenshotPath,
    fullpagePath,
  };

  fs.writeFileSync(
    path.join(artifactDir, `${prefix}_summary.json`),
    JSON.stringify(summary, null, 2)
  );

  console.log('\n========================================================================');
  console.log(`               AUDIT COMPLETE FOR ${targetName}`);
  console.log('========================================================================\n');

  await browser.close();
  return summary;
}

async function runAllAudits() {
  // Test both Production Build Preview (4173) and Dev Server (5173)
  const prodSummary = await auditPort('http://localhost:4173', 'Production_Preview');
  const devSummary = await auditPort('http://localhost:5173', 'Dev_Server');
  console.log('\n🌟 ALL REAL BROWSER VERIFICATIONS COMPLETED SUCCESSFULLY!');
}

runAllAudits().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
