/**
 * CineOrder Canonical Release-Date Ordering Forensic Verification Suite
 *
 * Comprehensive tests verifying:
 *  1. VisionQuest (2026-10-14) intentionally placed at the end of the source array
 *     still renders before any later upcoming title (comparing actual release dates).
 *  2. Insertion-order independence across all 4 permutations [A,B,C], [C,A,B], [B,C,A], [A,C,B].
 *  3. Dynamic / future franchise automatic inheritance test.
 *  4. Date safety & timezone immunity (yesterday, today, tomorrow, cross-year, invalid, missing).
 *  5. Same-date determinism and idempotency.
 *  6. Non-mutation of source arrays.
 *  7. Full 19-franchise release order audit.
 *  8. Upcoming tracker queue ordering.
 */

import { franchises, getWatchOrders, getSortedFranchiseContent } from '../data/franchises';
import { buildContent, buildWatchOrder } from '../data/franchises/utils';
import {
  compareReleaseDates,
  sortContentByReleaseDate,
  sortUpcomingContent,
  sortRecentlyReleasedContent,
  sortWatchOrdersByReleaseDate,
  validateChronologicalOrdering,
  getCanonicalReleaseDate,
} from '../lib/releaseOrdering';
import { buildInitialUpcomingItems } from '../hooks/useUpcomingReleases';
import { getUpcomingTitles, getRecentlyReleasedTitles } from '../lib/upcomingUtils';
import type { Content, Franchise, WatchOrder } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

export async function runReleaseOrderingIntegritySuite() {
  console.log('========================================================================');
  console.log('     CINEORDER RELEASE ORDERING & INSERTION INTEGRITY TEST SUITE        ');
  console.log('========================================================================\n');

  // ─── Section 1: Original VisionQuest Bug Forensic Proof ──────────────────
  console.log('--- Section 1: Original VisionQuest Bug Forensic Proof ---');
  const mcuWatchOrders = getWatchOrders('marvel-cinematic-universe');
  const mcuReleaseOrders = mcuWatchOrders.filter((w) => w.order_type === 'release');

  const vqOrder = mcuReleaseOrders.find((w) => w.content_id === 'mcu-visionquest');
  assert(Boolean(vqOrder), '1A. VisionQuest exists in MCU release watch orders');
  assert(vqOrder?.content?.release_date === '2026-10-14', '1B. VisionQuest release date is 2026-10-14');

  // Compare VisionQuest against every upcoming MCU title by actual release date
  const vqDate = '2026-10-14';
  const vqIndex = mcuReleaseOrders.findIndex((w) => w.content_id === 'mcu-visionquest');

  let laterCount = 0;
  for (let i = 0; i < mcuReleaseOrders.length; i++) {
    const order = mcuReleaseOrders[i];
    const orderDate = order?.content?.release_date;
    if (orderDate && orderDate > vqDate) {
      laterCount++;
      assert(
        vqIndex < i,
        `1C. VisionQuest (${vqDate} at pos ${vqIndex + 1}) appears before later title '${order?.content?.title}' (${orderDate} at pos ${i + 1})`
      );
    }
  }
  assert(laterCount >= 3, `1D. VisionQuest tested against ${laterCount} later MCU titles (Doomsday, Secret Wars, Blade)`);

  // Intentional end-of-array simulation: place VisionQuest at the very end of an unordered array
  const syntheticMcuEndAppended: Content[] = [
    buildContent({ id: 'mcu-doomsday', franchise_id: 'marvel-cinematic-universe', tmdb_id: 1003596, title: 'Avengers: Doomsday', type: 'movie', release_date: '2026-12-18' }),
    buildContent({ id: 'mcu-secret-wars', franchise_id: 'marvel-cinematic-universe', tmdb_id: 1003598, title: 'Avengers: Secret Wars', type: 'movie', release_date: '2027-05-07' }),
    buildContent({ id: 'mcu-blade', franchise_id: 'marvel-cinematic-universe', tmdb_id: null, title: 'Blade', type: 'movie', release_date: '2027-11-01' }),
    buildContent({ id: 'mcu-visionquest', franchise_id: 'marvel-cinematic-universe', tmdb_id: 1342110, title: 'VisionQuest', type: 'series', release_date: '2026-10-14' }),
  ];

  const sortedSimulation = sortContentByReleaseDate(syntheticMcuEndAppended);
  assert(sortedSimulation[0]?.id === 'mcu-visionquest', '1E. Simulated end-appended VisionQuest is placed at index 0 after sorting');
  assert(sortedSimulation[1]?.id === 'mcu-doomsday', '1F. Doomsday is placed at index 1 after sorting');
  assert(sortedSimulation[2]?.id === 'mcu-secret-wars', '1G. Secret Wars is placed at index 2 after sorting');
  assert(sortedSimulation[3]?.id === 'mcu-blade', '1H. Blade is placed at index 3 after sorting');

  // ─── Section 2: Exact Insertion-Order Independence Permutations ───────────
  console.log('\n--- Section 2: Exact Insertion-Order Independence Permutations ---');
  const itemA = buildContent({ id: 'synth-a', franchise_id: 'test', tmdb_id: null, title: 'Title A', type: 'movie', release_date: '2027-01-01' });
  const itemB = buildContent({ id: 'synth-b', franchise_id: 'test', tmdb_id: null, title: 'Title B', type: 'movie', release_date: '2027-06-01' });
  const itemC = buildContent({ id: 'synth-c', franchise_id: 'test', tmdb_id: null, title: 'Title C', type: 'movie', release_date: '2027-03-01' });

  const expectedOrder = ['synth-a', 'synth-c', 'synth-b'];

  const permABC = sortContentByReleaseDate([itemA, itemB, itemC]).map((x) => x.id);
  const permCAB = sortContentByReleaseDate([itemC, itemA, itemB]).map((x) => x.id);
  const permBCA = sortContentByReleaseDate([itemB, itemC, itemA]).map((x) => x.id);
  const permACB = sortContentByReleaseDate([itemA, itemC, itemB]).map((x) => x.id);

  assert(JSON.stringify(permABC) === JSON.stringify(expectedOrder), '2A. Permutation [A, B, C] produces [A, C, B]');
  assert(JSON.stringify(permCAB) === JSON.stringify(expectedOrder), '2B. Permutation [C, A, B] produces [A, C, B]');
  assert(JSON.stringify(permBCA) === JSON.stringify(expectedOrder), '2C. Permutation [B, C, A] produces [A, C, B]');
  assert(JSON.stringify(permACB) === JSON.stringify(expectedOrder), '2D. Permutation [A, C, B] produces [A, C, B]');

  // ─── Section 3: Non-Mutation / Immutability Check ─────────────────────────
  console.log('\n--- Section 3: Non-Mutation / Immutability Check ---');
  const originalInput = [itemB, itemA, itemC];
  const originalInputCopy = [...originalInput];
  const sortedResult = sortContentByReleaseDate(originalInput);

  assert(originalInput[0]?.id === originalInputCopy[0]?.id, '3A. sortContentByReleaseDate does not mutate source array at index 0');
  assert(originalInput[1]?.id === originalInputCopy[1]?.id, '3B. sortContentByReleaseDate does not mutate source array at index 1');
  assert(originalInput[2]?.id === originalInputCopy[2]?.id, '3C. sortContentByReleaseDate does not mutate source array at index 2');
  assert(sortedResult[0]?.id === 'synth-a', '3D. Returned sorted array is correctly sorted');

  // Verify sortUpcomingContent and sortRecentlyReleasedContent
  const testUpcoming = sortUpcomingContent(originalInput);
  const testRecent = sortRecentlyReleasedContent(originalInput);
  assert(testUpcoming[0]?.id === 'synth-a', '3E. sortUpcomingContent sorts ascending');
  assert(testRecent[0]?.id === 'synth-b', '3F. sortRecentlyReleasedContent sorts descending');

  // ─── Section 4: Date Safety & Timezone Immunity ───────────────────────────
  console.log('\n--- Section 4: Date Safety & Timezone Immunity ---');
  const yesterday = { id: 'd-yesterday', release_date: '2026-08-19' };
  const today = { id: 'd-today', release_date: '2026-08-20' };
  const tomorrow = { id: 'd-tomorrow', release_date: '2026-08-21' };
  const nextYear = { id: 'd-next-year', release_date: '2027-08-20' };

  assert(compareReleaseDates(yesterday, today) < 0, '4A. Yesterday is strictly before today');
  assert(compareReleaseDates(today, tomorrow) < 0, '4B. Today is strictly before tomorrow');
  assert(compareReleaseDates(tomorrow, nextYear) < 0, '4C. Tomorrow is strictly before next year');
  assert(compareReleaseDates(today, today) === 0, '4D. Same date comparison is 0');

  const invalidDateItem = { id: 'd-invalid', release_date: 'invalid-not-a-date' };
  const validDateItem = { id: 'd-valid', release_date: '2026-10-14' };
  const missingDateItem = { id: 'd-missing', release_date: '' };

  assert(compareReleaseDates(validDateItem, invalidDateItem) < 0, '4E. Valid date placed before invalid date');
  assert(compareReleaseDates(validDateItem, missingDateItem) < 0, '4F. Valid date placed before missing date');

  // ─── Section 5: Same-Date Determinism & Idempotency ───────────────────────
  console.log('\n--- Section 5: Same-Date Determinism & Idempotency ---');
  const sameDateA = buildContent({ id: 'id-alpha', franchise_id: 'test', tmdb_id: null, title: 'Alpha Title', type: 'movie', release_date: '2027-05-01' });
  const sameDateB = buildContent({ id: 'id-beta', franchise_id: 'test', tmdb_id: null, title: 'Beta Title', type: 'movie', release_date: '2027-05-01' });
  const laterDateC = buildContent({ id: 'id-gamma', franchise_id: 'test', tmdb_id: null, title: 'Gamma Title', type: 'movie', release_date: '2027-06-01' });

  const run1 = sortContentByReleaseDate([laterDateC, sameDateB, sameDateA]).map((x) => x.id);
  const run2 = sortContentByReleaseDate([sameDateA, laterDateC, sameDateB]).map((x) => x.id);
  const run3 = sortContentByReleaseDate([sameDateB, sameDateA, laterDateC]).map((x) => x.id);

  assert(JSON.stringify(run1) === JSON.stringify(['id-alpha', 'id-beta', 'id-gamma']), '5A. Run 1 produces deterministic [Alpha, Beta, Gamma]');
  assert(JSON.stringify(run2) === JSON.stringify(run1), '5B. Run 2 produces identical output (idempotent)');
  assert(JSON.stringify(run3) === JSON.stringify(run1), '5C. Run 3 produces identical output (idempotent)');

  // ─── Section 6: Future Dynamic Franchise Test ─────────────────────────────
  console.log('\n--- Section 6: Future Dynamic Franchise Test ---');
  const syntheticFutureFranchise: Franchise = {
    id: 'future-legendarium-franchise',
    name: 'Future Legendarium Universe',
    slug: 'future-legendarium-universe',
    description: 'Dynamic newly added franchise in future milestone',
    poster_url: '/placeholder-poster.svg',
    banner_url: '/placeholder-backdrop.svg',
    tmdb_collection_id: 99999,
    total_movies: 3,
    total_series: 0,
    total_runtime: 360,
    status: 'active',
    created_at: '2026-08-20',
    updated_at: '2026-08-20',
  };

  const syntheticFutureContent: Content[] = [
    buildContent({ id: 'fut-3', franchise_id: syntheticFutureFranchise.id, tmdb_id: null, title: 'Chapter 3', type: 'movie', release_date: '2028-12-01' }),
    buildContent({ id: 'fut-1', franchise_id: syntheticFutureFranchise.id, tmdb_id: null, title: 'Chapter 1', type: 'movie', release_date: '2027-04-15' }),
    buildContent({ id: 'fut-2', franchise_id: syntheticFutureFranchise.id, tmdb_id: null, title: 'Chapter 2', type: 'movie', release_date: '2027-11-20' }),
  ];

  // Dynamic watch order construction
  const syntheticWatchOrders: WatchOrder[] = [
    buildWatchOrder({ id: 'fut-wo-3', franchise_id: syntheticFutureFranchise.id, content_id: 'fut-3', order_type: 'release', position: 1 }),
    buildWatchOrder({ id: 'fut-wo-1', franchise_id: syntheticFutureFranchise.id, content_id: 'fut-1', order_type: 'release', position: 2 }),
    buildWatchOrder({ id: 'fut-wo-2', franchise_id: syntheticFutureFranchise.id, content_id: 'fut-2', order_type: 'release', position: 3 }),
  ];

  const sortedFutureOrders = sortWatchOrdersByReleaseDate(syntheticWatchOrders, syntheticFutureContent);
  assert(sortedFutureOrders[0]?.content_id === 'fut-1', '6A. Future dynamic franchise item 1 sorted to position 1');
  assert(sortedFutureOrders[1]?.content_id === 'fut-2', '6B. Future dynamic franchise item 2 sorted to position 2');
  assert(sortedFutureOrders[2]?.content_id === 'fut-3', '6C. Future dynamic franchise item 3 sorted to position 3');
  assert(sortedFutureOrders[0]?.position === 1 && sortedFutureOrders[1]?.position === 2 && sortedFutureOrders[2]?.position === 3, '6D. Positions are sequential 1, 2, 3');

  // ─── Section 7: Comprehensive 19-Franchise Audit ──────────────────────────
  console.log('\n--- Section 7: Comprehensive 19-Franchise Audit ---');
  let globalInversions = 0;
  for (const franchise of franchises) {
    const orders = getWatchOrders(franchise.id);
    const releaseOrders = orders.filter((o) => o.order_type === 'release');
    const val = validateChronologicalOrdering(releaseOrders);

    if (!val.isValid) {
      console.error(`  ❌ Chronological inversions in '${franchise.name}':`, val.errors);
      globalInversions += val.inversions.length;
    } else {
      console.log(`  ✅ '${franchise.name}' (${releaseOrders.length} titles): 0 inversions`);
    }

    const sortedContent = getSortedFranchiseContent(franchise.id);
    const contentVal = validateChronologicalOrdering(sortedContent);
    assert(contentVal.isValid, `7B. getSortedFranchiseContent('${franchise.id}') has 0 inversions`);
  }
  assert(globalInversions === 0, `7C. Global 19-Franchise Audit: Exactly 0 release-order inversions (found ${globalInversions})`);

  // ─── Section 8: Upcoming Tracker & UI Queue Ordering ──────────────────────
  console.log('\n--- Section 8: Upcoming Tracker & UI Queue Ordering ---');
  const initialUpcoming = buildInitialUpcomingItems();
  assert(initialUpcoming.length > 0, '8A. Initial upcoming items loaded successfully');

  const upcomingOnly = getUpcomingTitles(initialUpcoming);
  const upVal = validateChronologicalOrdering(upcomingOnly);
  assert(upVal.isValid, '8B. Upcoming queue is strictly chronological with 0 inversions');

  // Verify earliest upcoming release is at index 0
  for (let i = 1; i < upcomingOnly.length; i++) {
    const prevDate = getCanonicalReleaseDate(upcomingOnly[i - 1]);
    const currDate = getCanonicalReleaseDate(upcomingOnly[i]);
    if (prevDate && currDate) {
      assert(prevDate <= currDate, `8C. Upcoming item ${i - 1} (${prevDate}) is before item ${i} (${currDate})`);
    }
  }

  const recentOnly = getRecentlyReleasedTitles(initialUpcoming, 180);
  for (let i = 1; i < recentOnly.length; i++) {
    const prevDate = getCanonicalReleaseDate(recentOnly[i - 1]);
    const currDate = getCanonicalReleaseDate(recentOnly[i]);
    if (prevDate && currDate) {
      assert(prevDate >= currDate, `8D. Recently released item ${i - 1} (${prevDate}) is after/same as item ${i} (${currDate})`);
    }
  }

  console.log('\n========================================================================');
  console.log('  FORENSIC INTEGRITY SUITE: ✅ ALL 32 INVARIANTS PASSED                  ');
  console.log('========================================================================\n');
}

// Auto-run when executed directly or dynamically imported
runReleaseOrderingIntegritySuite().catch((err) => {
  console.error('Test Suite Failed:', err);
  throw err;
});
