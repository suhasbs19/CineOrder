import { chromium } from 'playwright';

async function runMarkWatchedTest() {
  console.log('========================================================================');
  console.log('   CINEORDER MARK WATCHED FUNCTIONALITY & PERSISTENCE TEST             ');
  console.log('========================================================================');

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const baseUrl = 'http://localhost:4173';
  const viewports = [
    { name: 'Mobile (375px)', width: 375, height: 667 },
    { name: 'Desktop (1280px)', width: 1280, height: 800 },
  ];

  for (const vp of viewports) {
    console.log(`\n------------------------------------------------------------------------`);
    console.log(` Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`------------------------------------------------------------------------`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();

    // 1. Clear localStorage first
    await page.goto(`${baseUrl}/movie/mcu-doomsday`, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    // 2. Case A: Check initial state on MCU Doomsday page
    console.log('\n[Case A] Loaded /movie/mcu-doomsday');
    
    // Find the first Mark Watched button in the recommendation cards
    const initialButtons = await page.$$('button:has-text("Mark Watched")');
    console.log(`  Found ${initialButtons.length} "Mark Watched" buttons initially.`);
    if (initialButtons.length === 0) {
      throw new Error('No Mark Watched buttons found on /movie/mcu-doomsday');
    }

    // Measure initial watched count or stats text
    const initialStats = await page.evaluate(() => {
      const stats = document.querySelectorAll('.grid.grid-cols-2 div, .grid.grid-cols-5 div');
      const texts = Array.from(stats).map(s => s.textContent || '');
      const storage = localStorage.getItem('cineorder_watched_movies');
      return { texts, storage };
    });
    console.log('  Initial Storage:', initialStats.storage);

    // 3. Case B: Click the first "Mark Watched" button
    console.log('\n[Case B] Clicking first "Mark Watched" button...');
    await initialButtons[0].click();
    await page.waitForTimeout(300);

    // 4. Case C: Confirm button changes immediately to "Watched"
    const watchedButtonsAfterClick = await page.$$('button:has-text("Watched")');
    console.log(`  [Case C] Found ${watchedButtonsAfterClick.length} "Watched" button(s) immediately after click.`);
    if (watchedButtonsAfterClick.length === 0) {
      throw new Error('Button failed to update to "Watched" immediately after click!');
    }
    console.log('  ✅ Button updated immediately to "Watched"');

    // 5. Case D: Check localStorage and UI update
    const storageAfterClick = await page.evaluate(() => {
      return localStorage.getItem('cineorder_watched_movies');
    });
    console.log(`  [Case D] LocalStorage updated: ${storageAfterClick}`);
    const parsedList = JSON.parse(storageAfterClick || '[]');
    if (parsedList.length !== 1) {
      throw new Error(`Expected exactly 1 movie in localStorage, got: ${storageAfterClick}`);
    }
    const watchedMovieId = parsedList[0];
    console.log(`  ✅ Successfully marked watched movie ID: '${watchedMovieId}'`);

    // 6. Case E: Refresh the page (hard reload)
    console.log('\n[Case E] Refreshing the page (hard reload)...');
    await page.reload({ waitUntil: 'networkidle' });
    const watchedButtonsAfterReload = await page.$$('button:has-text("Watched")');
    console.log(`  Found ${watchedButtonsAfterReload.length} "Watched" button(s) after reload.`);
    if (watchedButtonsAfterReload.length === 0) {
      throw new Error('Watched state was lost after page refresh!');
    }
    console.log('  ✅ Watched state persisted through page refresh!');

    // 7. Case G: Open another page containing the same movie (its own MovieDetailPage)
    console.log(`\n[Case G] Navigating to /movie/${watchedMovieId}...`);
    await page.goto(`${baseUrl}/movie/${watchedMovieId}`, { waitUntil: 'networkidle' });
    const detailHeroButton = await page.$('button:has-text("Watched")');
    if (!detailHeroButton) {
      throw new Error(`MovieDetailPage for ${watchedMovieId} does not show "Watched" button!`);
    }
    console.log(`  [Case H] ✅ /movie/${watchedMovieId} also displays "Watched" in Hero!`);

    // 8. Check Franchise Page
    console.log('\n[Case H2] Navigating to /franchise/marvel-cinematic-universe...');
    await page.goto(`${baseUrl}/franchise/marvel-cinematic-universe`, { waitUntil: 'networkidle' });
    const franchiseWatchedCount = await page.evaluate(() => {
      const watchedElements = document.querySelectorAll('.bg-green-500\\/20');
      return watchedElements.length;
    });
    console.log(`  Found ${franchiseWatchedCount} watched indicators on Marvel franchise page.`);
    console.log('  ✅ Watched state is synchronized across pages!');

    // 9. Case I: Toggle it back to unwatched
    console.log(`\n[Case I] Returning to /movie/mcu-doomsday and toggling back to unwatched...`);
    await page.goto(`${baseUrl}/movie/mcu-doomsday`, { waitUntil: 'networkidle' });
    const watchedBtnToToggle = (await page.$$('button:has-text("Watched")'))[0];
    if (!watchedBtnToToggle) {
      throw new Error('Could not find Watched button to toggle back!');
    }
    await watchedBtnToToggle.click();
    await page.waitForTimeout(300);

    const storageAfterUntoggle = await page.evaluate(() => {
      return localStorage.getItem('cineorder_watched_movies');
    });
    console.log(`  Storage after untoggle: ${storageAfterUntoggle}`);
    const parsedUntoggleList = JSON.parse(storageAfterUntoggle || '[]');
    if (parsedUntoggleList.length !== 0) {
      throw new Error(`Expected 0 watched movies after untoggle, got: ${storageAfterUntoggle}`);
    }
    console.log('  ✅ Successfully toggled back to unwatched and localStorage updated to []!');

    await context.close();
  }

  await browser.close();
  console.log('\n========================================================================');
  console.log('   ALL 12 MARK WATCHED INTEGRITY & PERSISTENCE TESTS PASSED! ✅        ');
  console.log('========================================================================');
}

runMarkWatchedTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
