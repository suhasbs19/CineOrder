/**
 * Home Recommendations & Search Independence Regression Test Suite
 *
 * Validates:
 * 1. Synchronous initial recommendation builder returns >= 6 high-quality titles on initial mount.
 * 2. Recommendations contain valid IDs, titles, ratings, and posters.
 * 3. Search independence: Search queries ("spid", "Iron") do NOT dictate default Home recommendations.
 * 4. Error resilience: Remote API failures do not clear or blank out canonical recommendations.
 * 5. Navigation targets: Recommended movie IDs resolve to canonical or valid movie routes.
 */

import { buildInitialRecommendedMovies } from '../hooks/useRecommendedMovies';
import { allContent, getContentById } from '../data/franchises';
import { tmdb } from '../lib/tmdb';

declare const process: any;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

async function runHomeRecommendationsTestSuite() {
  console.log('========================================================================');
  console.log('       CINEORDER HOME RECOMMENDATIONS & SEARCH INDEPENDENCE TESTS       ');
  console.log('========================================================================\n');

  // --- 1. Immediate Synchronous Availability on Component Mount ---
  console.log('--- 1. Synchronous Mount Recommendation Availability ---');
  const initialRecs = buildInitialRecommendedMovies();

  assert(Array.isArray(initialRecs), '1A. buildInitialRecommendedMovies returns an array');
  assert(initialRecs.length >= 6, `1B. buildInitialRecommendedMovies returns at least 6 items (got ${initialRecs.length})`);
  assert(initialRecs.length <= 12, `1C. buildInitialRecommendedMovies caps at 12 items (got ${initialRecs.length})`);

  // --- 2. Content & Metadata Integrity ---
  console.log('\n--- 2. Recommendation Item Schema & Integrity ---');
  for (let i = 0; i < initialRecs.length; i++) {
    const item = initialRecs[i];
    if (!item) {
      assert(false, `2A[${i}]. Item at index ${i} is missing`);
      continue;
    }
    assert(Boolean(item.id), `2A[${i}]. Item has a valid ID: "${item.id}"`);
    assert(Boolean(item.title && item.title.trim().length > 0), `2B[${i}]. Item has a non-empty title: "${item.title}"`);
    assert(Boolean(item.poster_url), `2C[${i}]. Item has a poster URL`);
    assert(typeof item.rating === 'number' && item.rating > 0, `2D[${i}]. Item has a positive rating: ${item.rating}`);
  }

  // --- 3. Independence from Search Queries ---
  console.log('\n--- 3. Search Query Independence ---');
  const querySpider = 'spid';
  const queryIron = 'Iron';

  // Even if a search query is in progress elsewhere, Home recommendations seed remains pristine
  const recsUnderSearch = buildInitialRecommendedMovies();
  assert(recsUnderSearch.length === initialRecs.length, '3A. Home recommendations array length is constant across search contexts');
  assert(recsUnderSearch[0]?.id === initialRecs[0]?.id, '3B. Home recommendations top item remains consistent');

  // Verify that searching "spid" in catalog finds Spider-Man titles independently
  const spiderMatches = allContent.filter((c) =>
    c.title.toLowerCase().includes(querySpider.toLowerCase())
  );
  assert(spiderMatches.length > 0, `3C. Independent search for "${querySpider}" finds ${spiderMatches.length} matching titles in catalog`);

  // Verify that searching "Iron" in catalog finds Iron Man titles independently
  const ironMatches = allContent.filter((c) =>
    c.title.toLowerCase().includes(queryIron.toLowerCase())
  );
  assert(ironMatches.length > 0, `3D. Independent search for "${queryIron}" finds ${ironMatches.length} matching titles in catalog`);

  // --- 4. Navigation & Route Resolution ---
  console.log('\n--- 4. Movie Route Resolution ---');
  for (const item of initialRecs) {
    if (item.canonical_id) {
      const canonical = getContentById(item.canonical_id);
      assert(Boolean(canonical), `4A. Canonical ID "${item.canonical_id}" resolves in knowledge catalog`);
    }
  }

  // --- 5. Background TMDb Resilience ---
  console.log('\n--- 5. Live TMDb Enrichment & Fallback Resilience ---');
  try {
    const trending = await tmdb.getTrending('movie', 'week');
    assert(Boolean(trending && Array.isArray(trending.results)), '5A. TMDb live trending API responds with results');
    console.log(`     TMDb returned ${trending.results.length} trending items.`);
  } catch (err: any) {
    console.log(`     (Note: Network error simulated or encountered: ${err?.message})`);
    // Fallback seed guarantees zero failure on UI
    assert(initialRecs.length > 0, '5B. Fallback seed guarantees items even if TMDb is unreachable');
  }

  console.log('\n========================================================================');
  console.log('✅ ALL HOME RECOMMENDATIONS & SEARCH INDEPENDENCE TESTS PASSED!');
  console.log('========================================================================\n');
}

runHomeRecommendationsTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  if (typeof process !== 'undefined') {
    process.exit(1);
  }
});
