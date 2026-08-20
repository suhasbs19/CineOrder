import { chromium } from 'playwright';

async function testFooterResponsiveness() {
  console.log('========================================================================');
  console.log('   CINEORDER MOBILE FOOTER RESPONSIVENESS & INTEGRITY TEST              ');
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
    { name: 'iPhone SE / 8 (375px)', width: 375, height: 667 },
    { name: 'iPhone 12/13/14 (390px)', width: 390, height: 844 },
    { name: 'iPhone 15 Pro Max (430px)', width: 430, height: 932 },
    { name: 'Tablet (768px)', width: 768, height: 1024 },
    { name: 'Desktop (1280px)', width: 1280, height: 800 },
  ];

  const baseUrl = 'http://localhost:4173';

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    console.log(`--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);

    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await page.waitForSelector('footer');

    const footerData = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      if (!footer) return null;

      const rect = footer.getBoundingClientRect();
      const text = footer.textContent || '';
      const links = Array.from(footer.querySelectorAll('a')).map((a) => ({
        href: a.getAttribute('href'),
        text: a.textContent?.trim(),
      }));

      const hasDevDiagnostics = text.includes('Developer Diagnostics');
      const hasCompany = text.includes('Company');
      const hasAbout = links.some((l) => l.href === '/about' || l.text === 'About');
      const hasPrivacy = links.some((l) => l.href === '/privacy' || l.text === 'Privacy Policy');
      const hasTerms = links.some((l) => l.href === '/terms' || l.text === 'Terms of Service');
      const hasContact = links.some((l) => l.href === '/contact' || l.text === 'Contact');
      const hasTwitter = Boolean(footer.querySelector('a[aria-label="Twitter"]') || footer.querySelector('svg.lucide-twitter'));
      const hasGithub = Boolean(footer.querySelector('a[aria-label="GitHub"]') || footer.querySelector('svg.lucide-github'));

      const hasMarvel = links.some((l) => l.text === 'Marvel (MCU)');
      const hasStarWars = links.some((l) => l.text === 'Star Wars');
      const hasHarryPotter = links.some((l) => l.text === 'Harry Potter');
      const hasDc = links.some((l) => l.text === 'DC Universe');
      const hasFast = links.some((l) => l.text === 'Fast & Furious');
      const hasExplore = links.some((l) => l.text === 'Explore All');
      const hasMovies = links.some((l) => l.text === 'Movies');
      const hasSeries = links.some((l) => l.text === 'TV Series');

      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        linksCount: links.length,
        hasDevDiagnostics,
        hasCompany,
        hasAbout,
        hasPrivacy,
        hasTerms,
        hasContact,
        hasTwitter,
        hasGithub,
        hasMarvel,
        hasStarWars,
        hasHarryPotter,
        hasDc,
        hasFast,
        hasExplore,
        hasMovies,
        hasSeries,
        docScrollWidth: document.documentElement.scrollWidth,
        windowInnerWidth: window.innerWidth,
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    if (footerData) {
      console.log(`  Footer Dimensions: ${footerData.width}x${footerData.height}px`);
      console.log(`  Links count: ${footerData.linksCount}`);
      console.log(`  Removed Items Verification:`);
      console.log(`    - Dev Diagnostics removed: ${!footerData.hasDevDiagnostics ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`    - Company header removed: ${!footerData.hasCompany ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`    - About link removed: ${!footerData.hasAbout ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`    - Privacy link removed: ${!footerData.hasPrivacy ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`    - Terms link removed: ${!footerData.hasTerms ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`    - Contact link removed: ${!footerData.hasContact ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`    - Twitter icon removed: ${!footerData.hasTwitter ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`    - GitHub icon removed: ${!footerData.hasGithub ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`  Preserved Useful Navigation:`);
      console.log(`    - Franchises: Marvel (${footerData.hasMarvel}), Star Wars (${footerData.hasStarWars}), HP (${footerData.hasHarryPotter}), DC (${footerData.hasDc}), Fast (${footerData.hasFast})`);
      console.log(`    - Resources: Explore (${footerData.hasExplore}), Movies (${footerData.hasMovies}), TV Series (${footerData.hasSeries})`);
      console.log(`  Horizontal Overflow: ${footerData.hasOverflow ? '❌ OVERFLOW' : '✅ 0 Overflow'}\n`);
    }

    await context.close();
  }

  await browser.close();
  console.log('========================================================================');
  console.log('  FOOTER RESPONSIVENESS TEST: ✅ COMPLETED ALL VIEWPORTS                ');
  console.log('========================================================================\n');
}

testFooterResponsiveness().catch((err) => {
  console.error('Footer Responsiveness Test Failed:', err);
  process.exit(1);
});
