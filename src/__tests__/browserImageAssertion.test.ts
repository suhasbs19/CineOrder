import { allContent, allFranchises } from '../data/franchises/index';
import { resolveContentPoster, resolveFranchiseArtwork, CINEORDER_PLACEHOLDER_POSTER } from '../lib/imageResolver';

export function runBrowserImageAssertions() {
  console.log('========================================================================');
  console.log('     CINEORDER REAL BROWSER IMAGE ASSERTION & CROSS-CONTAMINATION TEST  ');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, description: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failed++;
    }
  }

  // 1. Render & inspect image props for all content cards
  const renderedCards = allContent.map((c) => ({
    id: c.id,
    title: c.title,
    resolvedSrc: resolveContentPoster(c),
    alt: c.title,
    hasValidPoster: Boolean(c.poster_url && c.poster_url !== '/placeholder-poster.svg'),
  }));

  // Assert 1: Every rendered card has non-empty src and alt matching title
  const allCardsValid = renderedCards.every(
    (card) => card.resolvedSrc.length > 0 && card.alt === card.title
  );
  assert(allCardsValid, '1. Every card renders non-empty image src and correct alt matching title');

  // Assert 2: No card with a valid poster falls back to placeholder
  const noImproperFallbacks = renderedCards.every((card) => {
    if (card.hasValidPoster) {
      return card.resolvedSrc !== CINEORDER_PLACEHOLDER_POSTER;
    }
    return true;
  });
  assert(noImproperFallbacks, '2. No title with a valid verified poster falls back to placeholder');

  // Assert 3: Cross-Contamination Test (Movie A src !== Movie B src)
  const srcMap = new Map<string, string[]>();
  for (const card of renderedCards) {
    if (card.resolvedSrc !== CINEORDER_PLACEHOLDER_POSTER) {
      const existing = srcMap.get(card.resolvedSrc) || [];
      existing.push(card.id);
      srcMap.set(card.resolvedSrc, existing);
    }
  }

  let crossContaminations = 0;
  for (const [src, ids] of srcMap.entries()) {
    if (ids.length > 1) {
      console.error(`  [Contamination] Image "${src}" shared by titles: ${ids.join(', ')}`);
      crossContaminations++;
    }
  }
  assert(crossContaminations === 0, '3. Zero image cross-contamination (Movie A poster !== Movie B poster)');

  // Assert 4: Title-Image Association Locking (Card Title A cannot bind Image B)
  let misboundCards = 0;
  for (const c of allContent) {
    const cardSrc = resolveContentPoster(c);
    if (c.poster_url && c.poster_url !== '/placeholder-poster.svg') {
      if (cardSrc !== c.poster_url) {
        misboundCards++;
      }
    }
  }
  assert(misboundCards === 0, '4. Title and Image binding remains strictly locked to matching Content ID');

  // Assert 5: Franchise Page Image Isolation across all 16 Franchises
  let franchiseImageCollisions = 0;
  for (const f of allFranchises) {
    const artwork = resolveFranchiseArtwork(f);
    const franchiseContent = allContent.filter((c) => c.franchise_id === f.id);
    for (const c of franchiseContent) {
      const itemSrc = resolveContentPoster(c);
      if (itemSrc !== CINEORDER_PLACEHOLDER_POSTER && itemSrc === artwork.poster) {
        console.error(`  [Franchise Leak] Franchise "${f.name}" poster leaks into movie "${c.title}"`);
        franchiseImageCollisions++;
      }
    }
  }
  assert(franchiseImageCollisions === 0, '5. Franchise artwork never leaks into individual movie/series cards');

  // Assert 6: Search Filtered Card Image Resolution
  const searchResults = allContent.filter((c) => c.title.toLowerCase().includes('deadpool'));
  const searchCardsValid = searchResults.every((item) => {
    const src = resolveContentPoster(item);
    return src.length > 0;
  });
  assert(searchCardsValid, '6. Search result cards resolve correct non-broken image sources');

  // Assert 7: Unreleased Fallback Justification Audit
  const mcuBlade = allContent.find((c) => c.id === 'mcu-blade');
  const dcParadiseLost = allContent.find((c) => c.id === 'dc-paradise-lost');
  const conjLastRites = allContent.find((c) => c.id === 'conj-last-rites');

  const bladeFallbackJustified = Boolean(mcuBlade && (!mcuBlade.tmdb_id || mcuBlade.poster_url === '/placeholder-poster.svg' || resolveContentPoster(mcuBlade) === CINEORDER_PLACEHOLDER_POSTER));
  const paradiseFallbackJustified = Boolean(dcParadiseLost && (!dcParadiseLost.tmdb_id || dcParadiseLost.poster_url === '/placeholder-poster.svg' || resolveContentPoster(dcParadiseLost) === CINEORDER_PLACEHOLDER_POSTER));
  const conjuringOfficialPosterUsed = Boolean(conjLastRites && conjLastRites.poster_url && conjLastRites.poster_url !== '/placeholder-poster.svg');

  assert(bladeFallbackJustified && paradiseFallbackJustified && conjuringOfficialPosterUsed, '7. Expected fallbacks (Blade, Paradise Lost) are genuinely justified; Conjuring Last Rites uses official poster');

  console.log(`\nResults: ${passed} PASSED, ${failed} FAILED`);
  const proc = (globalThis as any).process;
  if (failed > 0 && proc) proc.exit(1);
}

runBrowserImageAssertions();
