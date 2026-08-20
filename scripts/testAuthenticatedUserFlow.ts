import { chromium } from 'playwright';

async function runAuthenticatedFlowTest() {
  console.log('========================================================================');
  console.log('   CINEORDER AUTHENTICATED USER FLOW & ONBOARDING TEST                 ');
  console.log('========================================================================');

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const baseUrl = 'http://localhost:4173';
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Test 1: First-time Google user without username triggers onboarding modal
    // -------------------------------------------------------------
    console.log('\n[Test 1] Simulating first-time Google authenticated user without profile');
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // Simulate Supabase OAuth user in localStorage / authStore
    await page.evaluate(() => {
      const mockUser = {
        id: 'google-user-12345',
        email: 'cinephile.google@gmail.com',
        user_metadata: {
          full_name: 'Alex MovieBuff',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        },
      };
      const mockSession = {
        access_token: 'mock-jwt-token-xyz',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: mockUser,
      };

      // Set standard Supabase localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.includes('auth-token')) localStorage.removeItem(k);
      }
      localStorage.setItem('sb-auth-token', JSON.stringify(mockSession));
      localStorage.setItem('sb-iknxldrylfsuphaydamr-auth-token', JSON.stringify(mockSession));
    });

    // Reload page to let App initialize auth state
    await page.reload();
    await page.waitForTimeout(1000);

    // Also trigger via client store if Supabase getSession returns null in mock env
    await page.evaluate(() => {
      const mockUser = {
        id: 'google-user-12345',
        email: 'cinephile.google@gmail.com',
        user_metadata: {
          full_name: 'Alex MovieBuff',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        },
      };
      const authStore = (window as any).__AUTH_STORE__;
      if (authStore) {
        authStore.setState({ user: mockUser, session: { user: mockUser }, profile: null, initialized: true });
      }
    });
    await page.waitForTimeout(500);

    // Check if onboarding modal is visible
    const modalVisible = await page.locator('text=Create Your Username').isVisible();
    assert(modalVisible, '1. Mandatory username onboarding modal is visible for new Google user');

    // -------------------------------------------------------------
    // Test 2: Username validation in onboarding modal
    // -------------------------------------------------------------
    console.log('\n[Test 2] Testing username format and availability validation');
    const input = page.locator('#username-input');

    // Too short
    await input.fill('ab');
    await page.waitForTimeout(500);
    const shortError = await page.locator('text=Username must be at least 3 characters long').isVisible();
    assert(shortError, '2A. Short username (<3 chars) shows validation error');

    // Invalid chars
    await input.fill('invalid@user!');
    await page.waitForTimeout(500);
    const charError = await page.locator('text=Username can only contain letters, numbers').isVisible();
    assert(charError, '2B. Special characters show format error');

    // Valid unique username
    await input.fill('alex_moviebuff');
    await page.waitForTimeout(1000);
    const availableMsg = await page.locator('text=available').isVisible();
    assert(availableMsg, '2C. Valid unique handle shows green availability indicator');

    // Submit form
    await page.locator('button:has-text("Create Username & Continue")').click();
    await page.waitForTimeout(1000);

    const modalGone = !(await page.locator('text=Create Your Username').isVisible());
    assert(modalGone, '2D. Submitting valid username creates profile and dismisses modal');

    // -------------------------------------------------------------
    // Test 3: Profile page shows username, display name, and persists across refresh
    // -------------------------------------------------------------
    console.log('\n[Test 3] Testing /profile page and hard refresh persistence');
    await page.goto(`${baseUrl}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    console.log('   Current URL on profile navigation:', currentUrl);
    const bodyText = await page.innerText('body');
    console.log('   Body text snippet:', bodyText.substring(0, 300).replace(/\n/g, ' '));

    const profileHandle = await page.locator('text=@alex_moviebuff').isVisible();
    assert(profileHandle, '3A. Profile page displays chosen handle @alex_moviebuff');

    const profileName = await page.locator('text=Alex MovieBuff').isVisible();
    assert(profileName, '3B. Profile page displays Google display name Alex MovieBuff');

    // Hard refresh on profile page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const persistAfterRefresh = await page.locator('text=@alex_moviebuff').isVisible();
    assert(persistAfterRefresh, '3C. Profile state and session 100% persist across page refresh');

    // -------------------------------------------------------------
    // Test 4: Favorites page (/favorites) and favoriting items
    // -------------------------------------------------------------
    console.log('\n[Test 4] Testing /favorites page and adding/removing favorites');
    await page.goto(`${baseUrl}/favorites`);
    await page.waitForLoadState('networkidle');

    const favoritesHeader = await page.locator('h1:has-text("My Favorites")').isVisible();
    assert(favoritesHeader, '4A. Dedicated /favorites page loads cleanly');

    // Go to MCU franchise page and add to favorites
    await page.goto(`${baseUrl}/franchise/marvel-cinematic-universe`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const favFranchiseBtn = page.locator('button:has-text("Favorite Franchise")');
    if (await favFranchiseBtn.isVisible()) {
      await favFranchiseBtn.click();
      await page.waitForTimeout(300);
      const isFavorited = await page.locator('button:has-text("Favorited")').isVisible();
      assert(isFavorited, '4B. Clicked "Favorite Franchise" button transitions to "Favorited"');
    }

    // Go back to /favorites
    await page.goto(`${baseUrl}/favorites`);
    await page.waitForLoadState('networkidle');
    const hasFavoriteCard = await page.locator('text=Marvel Cinematic Universe').isVisible();
    assert(hasFavoriteCard, '4C. Favorited franchise appears in /favorites grid');

    // -------------------------------------------------------------
    // Test 5: Settings page (/settings) and updating display name & toggles
    // -------------------------------------------------------------
    console.log('\n[Test 5] Testing /settings page and preference updates');
    await page.goto(`${baseUrl}/settings`);
    await page.waitForLoadState('networkidle');

    const settingsHeader = await page.locator('h1:has-text("Account Settings")').isVisible();
    assert(settingsHeader, '5A. Dedicated /settings page loads without errors');

    const displayNameInput = page.locator('#display-name-input');
    await displayNameInput.fill('Alex The Cinephile');
    await page.locator('button:has-text("Save")').click();
    await page.waitForTimeout(500);

    const savedIndicator = await page.locator('button:has-text("Saved!")').isVisible();
    assert(savedIndicator, '5B. Updated display name saved successfully');

    // -------------------------------------------------------------
    // Test 6: Find Users routes (/find-users and /users)
    // -------------------------------------------------------------
    console.log('\n[Test 6] Testing Find Users routes');
    await page.goto(`${baseUrl}/find-users`);
    await page.waitForLoadState('networkidle');

    const userSearchHeader = await page.locator('text=Search Users').isVisible();
    assert(userSearchHeader, '6A. /find-users route loads Find Users page');

    await page.goto(`${baseUrl}/users`);
    await page.waitForLoadState('networkidle');
    const usersHeader = await page.locator('text=Search Users').isVisible();
    assert(usersHeader, '6B. /users route loads Find Users page');

    console.log('\n========================================================================');
    console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED                     `);
    console.log('========================================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    await browser.close();
  }
}

runAuthenticatedFlowTest().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
