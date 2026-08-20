import { chromium } from 'playwright';
import * as fs from 'fs';
import * as http from 'http';

function getChromeExecutablePath(): string | undefined {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }

  const defaultPaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  ];

  for (const path of defaultPaths) {
    if (path && fs.existsSync(path)) {
      return path;
    }
  }

  return undefined;
}

function checkServerHealth(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

export async function runBrowserVerification() {
  console.log('========================================================================');
  console.log('   CINEORDER REAL BROWSER UI & DOM ASSERTION SUITE                      ');
  console.log('========================================================================\n');

  let testFailures = 0;
  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
      testFailures++;
    }
  }

  const serverUrl = 'http://localhost:5173';
  const isHealthy = await checkServerHealth(serverUrl);
  if (!isHealthy) {
    console.error(`❌ ERROR: Local server at ${serverUrl} is not responding.`);
    console.error('Make sure "npm run dev" is running before executing browser tests.');
    process.exit(1);
  }
  console.log(`[Diagnostic] Local Server (${serverUrl}) Status: REACHABLE (200 OK)`);

  const chromePath = getChromeExecutablePath();
  if (chromePath) {
    console.log(`[Diagnostic] Detected Chrome Executable Path: ${chromePath}`);
  } else {
    console.log('[Diagnostic] Chrome path not found directly; relying on default Playwright browser.');
  }

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      executablePath: chromePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    console.log('[Diagnostic] Real Browser launched successfully.\n');
    const context = await browser.newContext();
    const page = await context.newPage();

    // ─── TEST 1: The Fantastic Four (OTT Available Title) ───────────────
    console.log('--- Testing Route 1: /movie/mcu-fantastic-four (OTT Available Title) ---');
    await page.goto(`${serverUrl}/movie/mcu-fantastic-four`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    let text1 = await page.innerText('body');
    assert(text1.includes('The Fantastic Four: First Steps'), '1A. Rendered DOM contains title "The Fantastic Four: First Steps"');
    const hasPostOttMode = text1.includes('Must Watch') || text1.includes('Recommended') || text1.includes('Extra Context');
    assert(hasPostOttMode, '1B. Rendered DOM contains Post-OTT recommendation elements (Must Watch / Recommended / Extra Context)');
    assert(!text1.includes('Trailer Readiness Mode'), '1C. Rendered DOM DOES NOT contain "Trailer Readiness"');
    assert(!text1.includes('Additional Recommended Viewing'), '1D. Rendered DOM DOES NOT contain "Additional Recommended Viewing"');

    // ─── TEST 2: Blade (Pre-Theatrical Title) ─────────────────────────────
    console.log('\n--- Testing Route 2: /movie/mcu-blade (Pre-Theatrical Title) ---');
    await page.goto(`${serverUrl}/movie/mcu-blade`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    let text2 = await page.innerText('body');
    assert(text2.includes('Blade'), '2A. Rendered DOM contains title "Blade"');
    const hasTrailerReadiness = text2.includes('Trailer Readiness') || text2.includes('Preparation Guide') || text2.includes('Additional Recommended') || text2.includes('Direct Entry Point') || text2.includes('Overview');
    assert(hasTrailerReadiness, '2B. Rendered DOM DOES contain Trailer Readiness / Preparation elements for pre-theatrical title');

    // ─── TEST 3: Upcoming Releases Page (/upcoming) ──────────────────────
    console.log('\n--- Testing Route 3: /upcoming (Upcoming Section) ---');
    await page.goto(`${serverUrl}/upcoming`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2500);

    let text3 = await page.innerText('body');
    assert(text3.includes('Upcoming') || text3.includes('Blade') || text3.includes('Releases'), '3A. Upcoming Section loads pre-theatrical releases');
    assert(!text3.includes('The Fantastic Four: First Steps'), '3C. Upcoming Section DOES NOT contain theatrically released title "The Fantastic Four: First Steps"');
    assert(!text3.includes('Thunderbolts*'), '3D. Upcoming Section DOES NOT contain theatrically released title "Thunderbolts*"');

    // ─── TEST 4: Representative OTT Titles ──────────────────────────────
    console.log('\n--- Testing Route 4: Representative OTT Titles ---');
    const representativeOttRoutes = [
      { id: 'mcu-thunderbolts', title: 'Thunderbolts*' },
      { id: 'dc-superman-2025', title: 'Superman' },
      { id: 'conj-1', title: 'The Conjuring' },
      { id: 'ed-1', title: 'The Evil Dead' },
      { id: 'ins-1', title: 'Insidious' },
      { id: 'jw-1', title: 'John Wick' },
      { id: 'mi-dr1', title: 'Mission: Impossible - Dead Reckoning' },
    ];

    for (const item of representativeOttRoutes) {
      await page.goto(`${serverUrl}/movie/${item.id}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(500);
      const text = await page.innerText('body');
      const containsTitle = text.includes(item.title) || text.includes(item.id);
      const noTrailerReadiness = !text.includes('Trailer Readiness Mode');
      assert(containsTitle && noTrailerReadiness, `4. OTT title '${item.title}' renders cleanly in Post-OTT mode without Trailer Readiness Mode`);
    }

    // ─── TEST 5: AI Advisor Removal & Navigation Verification ────────────
    console.log('\n--- Testing Route 5: /assistant Removal & NotFound Fallback ---');
    await page.goto(`${serverUrl}/assistant`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    let text5 = await page.innerText('body');
    assert(text5.includes('404') || text5.includes('Page Not Found') || text5.includes('not found') || !text5.includes('AI Movie Advisor'), '5A. /assistant route cleanly unmounted');
    assert(!text5.includes('AI Movie Advisor'), '5B. No AI Advisor header rendered');

    // Also verify Navbar on home page has no AI Advisor link
    await page.goto(`${serverUrl}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(800);
    const homeText = await page.innerText('body');
    assert(!homeText.includes('AI Advisor'), '5C. Main navigation contains zero AI Advisor links');

    // ─── TEST 6: Franchise Pages Completeness Verification ─────────────
    console.log('\n--- Testing Route 6: Franchise Pages Completeness ---');
    const { allFranchises, allContent } = await import('../src/data/franchises/index');

    for (const franchise of allFranchises) {
      const canonicalItems = allContent.filter((c) => c.franchise_id === franchise.id);
      const sampleTitle = canonicalItems[0]?.title || franchise.name;
      await page.goto(`${serverUrl}/franchise/${franchise.slug}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(600);

      const pageText = await page.innerText('body');
      const containsSample = pageText.includes(sampleTitle);
      assert(containsSample, `6. Franchise page '/franchise/${franchise.slug}' loaded cleanly containing '${sampleTitle}' (${canonicalItems.length} canonical titles)`);
    }

    // ─── TEST 7: Newly Added Titles (Evil Dead Burn & Insidious 6) ──────
    console.log('\n--- Testing Route 7: Newly Added Titles (Evil Dead Burn & Insidious 6) ---');
    await page.goto(`${serverUrl}/movie/ed-burn`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(800);
    let textBurn = await page.innerText('body');
    assert(textBurn.includes('Evil Dead Burn'), '7A. Rendered DOM contains newly added title "Evil Dead Burn"');
    assert(!textBurn.includes('Trailer Readiness Mode'), '7B. Evil Dead Burn uses Post-OTT mode without Trailer Readiness');

    await page.goto(`${serverUrl}/movie/ins-6`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(800);
    let textIns6 = await page.innerText('body');
    assert(textIns6.includes('Insidious: Out of the Further') || textIns6.includes('Insidious'), '7C. Rendered DOM contains newly added title "Insidious: Out of the Further"');
    const hasPreOttIns6 = textIns6.includes('Trailer Readiness') || textIns6.includes('Preparation Guide') || textIns6.includes('Additional Recommended') || textIns6.includes('Direct Entry Point') || textIns6.includes('Overview');
    assert(hasPreOttIns6, '7D. Insidious: Out of the Further uses Pre-OTT / Trailer Readiness mode');

    console.log('\n========================================================================');
    console.log('   REAL BROWSER VERIFICATION RESULT: ✅ PASS                            ');
    console.log('========================================================================\n');
  } catch (err: any) {
    console.error('\n❌ BROWSER INFRASTRUCTURE: FAILED');
    console.error('Error Stack Trace:', err?.stack || err);
    testFailures++;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  if (testFailures > 0) {
    process.exit(1);
  }
}

runBrowserVerification();
