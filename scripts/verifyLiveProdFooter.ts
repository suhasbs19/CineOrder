import { chromium } from 'playwright';

async function testProdFooter() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  for (let i = 0; i < 10; i++) {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const page = await context.newPage();
    await page.goto('https://cineorder.vercel.app/?_t=' + Date.now(), { waitUntil: 'networkidle' });
    const res = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      if (!footer) return null;
      const text = footer.textContent || '';
      const links = Array.from(footer.querySelectorAll('a')).map((a) => a.textContent?.trim());
      const brandElement = footer.querySelector('.space-y-2');
      const isBrandVisibleOnMobile = brandElement ? window.getComputedStyle(brandElement).display !== 'none' : false;
      return {
        height: Math.round(footer.getBoundingClientRect().height),
        isBrandVisibleOnMobile,
        hasDev: text.includes('Developer Diagnostics'),
        hasCompany: text.includes('Company'),
        hasAbout: text.includes('About'),
        hasPrivacy: text.includes('Privacy Policy'),
        hasTwitter: Boolean(footer.querySelector('a[aria-label="Twitter"]')),
        hasGithub: Boolean(footer.querySelector('a[aria-label="GitHub"]')),
        links,
      };
    });

    console.log(`Attempt ${i + 1} Live Footer Check:`, res);
    await context.close();

    if (res && !res.hasDev && !res.hasCompany && !res.hasAbout && !res.hasTwitter && !res.hasGithub && res.height < 400) {
      console.log('🎉 CONFIRMED: Live Vercel Production Footer Updated & Verified!');
      break;
    }
    await new Promise((r) => setTimeout(r, 4000));
  }

  await browser.close();
}

testProdFooter().catch(console.error);
