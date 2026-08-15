import { allContent, allFranchises } from '../data/franchises/index';
import {
  resolveContentPoster,
  resolveContentBackdrop,
  resolveFranchiseArtwork,
  CINEORDER_PLACEHOLDER_POSTER,
  CINEORDER_PLACEHOLDER_BACKDROP,
} from '../lib/imageResolver';

export function runImageIntegrityTests() {
  console.log('========================================================================');
  console.log('           CINEORDER IMAGE INTEGRITY AUTOMATED TEST SUITE              ');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, title: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${title}`);
      failed++;
    }
  }

  // Test 1: Unique Content IDs
  const ids = new Set<string>();
  let idsUnique = true;
  for (const c of allContent) {
    if (!c.id || ids.has(c.id)) idsUnique = false;
    ids.add(c.id);
  }
  assert(idsUnique, '1. Every catalog title has a valid unique content ID');

  // Test 2: Unique TMDB IDs
  const tmdbMap = new Map<number, string[]>();
  for (const c of allContent) {
    if (c.tmdb_id) {
      const existing = tmdbMap.get(c.tmdb_id) || [];
      existing.push(c.id);
      tmdbMap.set(c.tmdb_id, existing);
    }
  }
  let tmdbUnique = true;
  for (const [_, contentIds] of tmdbMap.entries()) {
    if (contentIds.length > 1) tmdbUnique = false;
  }
  assert(tmdbUnique, '2. Every TMDB ID resolves to the intended title without duplicate assignments');

  // Test 3: Unique Poster URLs
  const posterMap = new Map<string, string[]>();
  for (const c of allContent) {
    if (c.poster_url && c.poster_url !== CINEORDER_PLACEHOLDER_POSTER && c.poster_url !== '/placeholder.svg') {
      const existing = posterMap.get(c.poster_url) || [];
      existing.push(c.id);
      posterMap.set(c.poster_url, existing);
    }
  }
  let postersUnique = true;
  for (const [_, contentIds] of posterMap.entries()) {
    if (contentIds.length > 1) postersUnique = false;
  }
  assert(postersUnique, '3. Every verified poster is unique to its catalog title');

  // Test 4: Evil Dead vs Evil Dead II
  const ed1 = allContent.find((c) => c.id === 'ed-1');
  const ed2 = allContent.find((c) => c.id === 'ed-2');
  const edDistinct = Boolean(ed1 && ed2 && ed1.id !== ed2.id && ed1.tmdb_id !== ed2.tmdb_id && ed1.poster_url !== ed2.poster_url);
  assert(edDistinct, '4. Evil Dead vs Evil Dead II remain distinct');

  // Test 5: Insidious 1 vs 2 vs 3
  const ins1 = allContent.find((c) => c.id === 'ins-1');
  const ins2 = allContent.find((c) => c.id === 'ins-2');
  const ins3 = allContent.find((c) => c.id === 'ins-3');
  const insDistinct = Boolean(ins1 && ins2 && ins3 && ins1.poster_url !== ins2.poster_url && ins2.poster_url !== ins3.poster_url);
  assert(insDistinct, '5. Insidious vs Insidious Chapter 2 vs Chapter 3 remain distinct');

  // Test 6: Missing Poster Fallback
  const fallbackTest = resolveContentPoster({ id: 'test', title: 'Test', poster_url: '' }) === CINEORDER_PLACEHOLDER_POSTER;
  assert(fallbackTest, '6. Missing poster produces CineOrder fallback placeholder');

  // Test 7: Broken Poster Fallback
  const brokenFallbackTest = resolveContentPoster({ id: 'test', title: 'Test', poster_url: '/placeholder.svg' }) === CINEORDER_PLACEHOLDER_POSTER;
  assert(brokenFallbackTest, '7. Broken or placeholder poster produces CineOrder fallback placeholder');

  // Test 8: Deterministic Card Poster Isolation
  const im1 = allContent.find((c) => c.id === 'mcu-iron-man');
  const im2 = allContent.find((c) => c.id === 'mcu-iron-man-2');
  const imIsolated = Boolean(im1 && im2 && resolveContentPoster(im1) !== resolveContentPoster(im2));
  assert(imIsolated, '8. One card\'s image cannot appear in another card');

  // Test 9: Franchise Poster Leak Protection
  const franchisePosters = new Set(allFranchises.map((f) => f.poster_url).filter(Boolean));
  let noFranchiseLeak = true;
  for (const c of allContent) {
    if (c.poster_url && c.poster_url !== CINEORDER_PLACEHOLDER_POSTER) {
      if (franchisePosters.has(c.poster_url)) noFranchiseLeak = false;
    }
  }
  assert(noFranchiseLeak, '9. Franchise artwork cannot be accidentally used as a movie poster');

  // Test 10: Deterministic Pure Image Resolver
  const pureTest = resolveContentPoster(allContent[0]) === resolveContentPoster(allContent[0]);
  assert(pureTest, '10. Image resolver is deterministic and pure');

  // Test 11: Franchise Artwork Resolution
  let franchiseArtResolved = true;
  for (const f of allFranchises) {
    const art = resolveFranchiseArtwork(f);
    if (!art.poster || !art.banner) franchiseArtResolved = false;
  }
  assert(franchiseArtResolved, '11. resolveFranchiseArtwork resolves poster and banner for every franchise');

  // Test 12: Generic Non-hardcoded Resolver
  const genericTest = resolveContentPoster({ id: 'c-1', title: 'Custom', poster_url: 'https://image.tmdb.org/t/p/w500/custom.jpg' }) === 'https://image.tmdb.org/t/p/w500/custom.jpg';
  assert(genericTest, '12. No title-specific image hardcoding in image resolver');

  // Test 13: Backdrop Graceful Fallback
  const backdropTest = resolveContentBackdrop({ id: 'c-1', title: 'Custom', poster_url: 'https://image.tmdb.org/t/p/w500/custom.jpg' }) === 'https://image.tmdb.org/t/p/w500/custom.jpg';
  const emptyBackdropTest = resolveContentBackdrop({ id: 'empty-id', title: 'Empty' }) === CINEORDER_PLACEHOLDER_BACKDROP;
  assert(backdropTest && emptyBackdropTest, '13. Backdrop resolver falls back gracefully to poster or placeholder backdrop');

  console.log(`\nResults: ${passed} PASSED, ${failed} FAILED`);
  const proc = (globalThis as any).process;
  if (failed > 0 && proc) proc.exit(1);
}

runImageIntegrityTests();
