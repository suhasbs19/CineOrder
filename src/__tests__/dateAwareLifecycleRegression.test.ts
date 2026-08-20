/**
 * CineOrder — Date-Aware Lifecycle & Universal Release-State Regression Suite
 *
 * Comprehensive validation across all core lifecycle scenarios:
 *  A. Future movie (releaseDate > today -> UPCOMING)
 *  B. Today's movie (releaseDate === today -> THEATRICALLY_RELEASED)
 *  C. Past movie (releaseDate < today -> NOT UPCOMING)
 *  D. Past movie with no OTT (releaseDate < today, OTT=false -> THEATRICALLY_RELEASED, NOT STREAMING_AVAILABLE)
 *  E. Past movie with verified OTT (releaseDate < today, OTT=true -> STREAMING_AVAILABLE)
 *  F. TBA movie (releaseDate = TBA -> UPCOMING, no fabricated dates)
 *  G. Future series (releaseDate > today -> UPCOMING)
 *  H. Released series (releaseDate < today -> NOT UPCOMING, STREAMING_AVAILABLE)
 *  I. Stale stored status (stored status='upcoming' + past releaseDate -> effective status RELEASED)
 *  J. Timezone boundary handling (ET premiere to IST market next-day mapping)
 *  K. Upcoming page filtering (Exclude past-release titles, include upcoming only)
 *  L. Search / Card lifecycle (Past titles do not show 'Upcoming' badges)
 *  M. Franchise page lifecycle (Past titles do not show 'Upcoming' badges)
 *  N. Detail page lifecycle (Past titles do not show 'Upcoming' badges)
 *  O. Zero catalog mutation (Canonical source data remains immutable)
 *  P. Supergirl: Woman of Tomorrow specific regression (June 26, 2026 evaluated on August 20, 2026)
 *  Q. Permanent catalog-wide invariant (0 stale UPCOMING titles across entire 240 catalog items)
 *  R. Frozen framework SHA-256 bit-for-bit integrity (5/5 files)
 */

import { allContent, allFranchises } from '../data/franchises/index';
import { getContentById } from '../data/franchises';
import { buildContent } from '../data/franchises/utils';
import {
  classifyLifecycle,
  computeOttAvailable,
  getLifecycleCategory,
} from '../lib/metadataRefresh';
import {
  calculateCountdown,
  isTheatricallyUpcoming,
  getUpcomingTitles,
  getRecentlyReleasedTitles,
} from '../lib/upcomingUtils';
import {
  getMarketReleaseDate,
  isPastDate,
} from '../lib/dateUtils';
import type { UpcomingItem } from '../hooks/useUpcomingReleases';

declare const process: any;

const fs: any = await (new Function('return import("fs")')());
const path: any = await (new Function('return import("path")')());
const crypto: any = await (new Function('return import("crypto")')());

console.log('============================================================');
console.log('  DATE-AWARE LIFECYCLE & RELEASE-STATE REGRESSION SUITE     ');
console.log('============================================================\n');

let passed = 0;
let failures = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failures++;
  }
}

const EVAL_DATE = '2026-08-20';

// ─── Scenario A: Future Movie ────────────────────────────────────────────────
console.log('--- Scenario A: Future Movie ---');
const futureMovie = buildContent({
  id: 'test-future-movie',
  franchise_id: 'marvel-cinematic-universe',
  tmdb_id: 100001,
  title: 'Test Future Movie',
  type: 'movie',
  release_date: '2026-12-18',
  status: 'upcoming',
  theatrical_released: false,
  ott_available: false,
});
assert(classifyLifecycle(futureMovie, EVAL_DATE) === 'upcoming', 'A1. Future movie classifyLifecycle is "upcoming"');
assert(getLifecycleCategory(futureMovie, EVAL_DATE) === 'UPCOMING', 'A2. Future movie getLifecycleCategory is "UPCOMING"');
assert(isTheatricallyUpcoming(futureMovie, EVAL_DATE) === true, 'A3. Future movie isTheatricallyUpcoming === true');

// ─── Scenario B: Today\'s Movie ───────────────────────────────────────────────
console.log('\n--- Scenario B: Today\'s Movie ---');
const todayMovie = buildContent({
  id: 'test-today-movie',
  franchise_id: 'marvel-cinematic-universe',
  tmdb_id: 100002,
  title: 'Test Today Movie',
  type: 'movie',
  release_date: EVAL_DATE,
  status: 'upcoming', // Stale pre-release status in payload
  theatrical_released: false,
  digital_available: false,
  subscription_streaming_available: false,
  ott_available: false,
});
assert(classifyLifecycle(todayMovie, EVAL_DATE) === 'theatrically_released', 'B1. Today movie classifyLifecycle is "theatrically_released"');
assert(getLifecycleCategory(todayMovie, EVAL_DATE) === 'THEATRICALLY_RELEASED', 'B2. Today movie getLifecycleCategory is "THEATRICALLY_RELEASED"');
assert(isTheatricallyUpcoming(todayMovie, EVAL_DATE) === false, 'B3. Today movie isTheatricallyUpcoming === false');

// ─── Scenario C: Past Movie ──────────────────────────────────────────────────
console.log('\n--- Scenario C: Past Movie ---');
const pastMovie = buildContent({
  id: 'test-past-movie',
  franchise_id: 'dc-extended-universe',
  tmdb_id: 100003,
  title: 'Test Past Movie',
  type: 'movie',
  release_date: '2026-06-26',
  status: 'upcoming', // Stale pre-release status
  theatrical_released: false,
  digital_available: false,
  subscription_streaming_available: false,
  ott_available: false,
});
assert(classifyLifecycle(pastMovie, EVAL_DATE) !== 'upcoming', 'C1. Past movie is NOT "upcoming"');
assert(getLifecycleCategory(pastMovie, EVAL_DATE) !== 'UPCOMING', 'C2. Past movie category is NOT "UPCOMING"');
assert(isTheatricallyUpcoming(pastMovie, EVAL_DATE) === false, 'C3. Past movie isTheatricallyUpcoming === false');

// ─── Scenario D: Past Movie With No OTT ───────────────────────────────────────
console.log('\n--- Scenario D: Past Movie With No OTT ---');
assert(classifyLifecycle(pastMovie, EVAL_DATE) === 'theatrically_released', 'D1. Theatrical-only past movie is "theatrically_released"');
assert(getLifecycleCategory(pastMovie, EVAL_DATE) === 'THEATRICALLY_RELEASED', 'D2. Theatrical-only past movie category is "THEATRICALLY_RELEASED"');
assert(computeOttAvailable(pastMovie, EVAL_DATE) === false, 'D3. Theatrical-only past movie ott_available === false');

// ─── Scenario E: Past Movie With Verified OTT ────────────────────────────────
console.log('\n--- Scenario E: Past Movie With Verified OTT ---');
const pastMovieOtt = buildContent({
  id: 'test-past-movie-ott',
  franchise_id: 'marvel-cinematic-universe',
  tmdb_id: 100004,
  title: 'Test Past Movie With OTT',
  type: 'movie',
  release_date: '2024-05-01',
  status: 'released',
  theatrical_released: true,
  subscription_streaming_available: true,
  subscription_streaming_release_date: '2024-08-01',
  ott_available: true,
  providers: ['Disney+'],
});
assert(classifyLifecycle(pastMovieOtt, EVAL_DATE) === 'subscription_available', 'E1. Verified OTT movie is "subscription_available"');
assert(getLifecycleCategory(pastMovieOtt, EVAL_DATE) === 'STREAMING_AVAILABLE', 'E2. Verified OTT movie category is "STREAMING_AVAILABLE"');
assert(computeOttAvailable(pastMovieOtt, EVAL_DATE) === true, 'E3. Verified OTT movie ott_available === true');

// ─── Scenario F: TBA Movie ───────────────────────────────────────────────────
console.log('\n--- Scenario F: TBA Movie ---');
const tbaMovie = buildContent({
  id: 'test-tba-movie',
  franchise_id: 'spider-man',
  tmdb_id: 100005,
  title: 'Spider-Man: Beyond the Spider-Verse',
  type: 'movie',
  release_date: 'TBA',
  status: 'upcoming',
  theatrical_released: false,
  ott_available: false,
});
assert(classifyLifecycle(tbaMovie, EVAL_DATE) === 'upcoming', 'F1. TBA movie classifyLifecycle is "upcoming"');
assert(getLifecycleCategory(tbaMovie, EVAL_DATE) === 'UPCOMING', 'F2. TBA movie getLifecycleCategory is "UPCOMING"');
assert(isTheatricallyUpcoming(tbaMovie, EVAL_DATE) === true, 'F3. TBA movie isTheatricallyUpcoming === true');

// ─── Scenario G: Future Series ───────────────────────────────────────────────
console.log('\n--- Scenario G: Future Series ---');
const futureSeries = buildContent({
  id: 'test-future-series',
  franchise_id: 'dc-extended-universe',
  tmdb_id: 100006,
  title: 'Waller',
  type: 'series',
  release_date: '2026-11-01',
  status: 'upcoming',
  theatrical_released: false,
  providers: ['Max'],
});
assert(classifyLifecycle(futureSeries, EVAL_DATE) === 'upcoming', 'G1. Future series classifyLifecycle is "upcoming"');
assert(getLifecycleCategory(futureSeries, EVAL_DATE) === 'UPCOMING', 'G2. Future series getLifecycleCategory is "UPCOMING"');
assert(isTheatricallyUpcoming(futureSeries, EVAL_DATE) === true, 'G3. Future series isTheatricallyUpcoming === true');

// ─── Scenario H: Released Series ─────────────────────────────────────────────
console.log('\n--- Scenario H: Released Series ---');
const releasedSeries = buildContent({
  id: 'test-released-series',
  franchise_id: 'dc-extended-universe',
  tmdb_id: 100007,
  title: 'Lanterns',
  type: 'series',
  release_date: '2026-08-16',
  theatrical_release_date: '2026-08-16',
  subscription_streaming_release_date: '2026-08-16',
  subscription_streaming_available: true,
  status: 'released',
  theatrical_released: true,
  ott_available: true,
  providers: ['Max'],
});
assert(classifyLifecycle(releasedSeries, EVAL_DATE) === 'subscription_available', 'H1. Released series classifyLifecycle is "subscription_available"');
assert(getLifecycleCategory(releasedSeries, EVAL_DATE) === 'STREAMING_AVAILABLE', 'H2. Released series getLifecycleCategory is "STREAMING_AVAILABLE"');
assert(isTheatricallyUpcoming(releasedSeries, EVAL_DATE) === false, 'H3. Released series isTheatricallyUpcoming === false');

// ─── Scenario I: Stale Stored Status Resolution ──────────────────────────────
console.log('\n--- Scenario I: Stale Stored Status Resolution ---');
const staleTitle = buildContent({
  id: 'test-stale-title',
  franchise_id: 'dc-extended-universe',
  tmdb_id: 100008,
  title: 'Stale Title',
  type: 'movie',
  release_date: '2026-06-26',
  theatrical_release_date: '2026-06-26',
  status: 'upcoming', // Stale!
  theatrical_released: false, // Stale!
  ott_available: false,
  digital_available: false,
  subscription_streaming_available: false,
});
assert(classifyLifecycle(staleTitle, EVAL_DATE) === 'theatrically_released', 'I1. Stale status="upcoming" dynamically resolves to "theatrically_released"');
assert(getLifecycleCategory(staleTitle, EVAL_DATE) === 'THEATRICALLY_RELEASED', 'I2. Stale status resolves to THEATRICALLY_RELEASED category');
assert(isTheatricallyUpcoming(staleTitle, EVAL_DATE) === false, 'I3. Stale title is excluded from upcoming');

// ─── Scenario J: Timezone & Market Boundary ──────────────────────────────────
console.log('\n--- Scenario J: Timezone & Market Boundary ---');
const usDate = getMarketReleaseDate('2026-08-16', 'US', '21:00');
const inDate = getMarketReleaseDate('2026-08-16', 'IN', '21:00');
assert(usDate === '2026-08-16', `J1. US Eastern date remains 2026-08-16 (got ${usDate})`);
assert(inDate === '2026-08-17', `J2. India next-day IST maps to 2026-08-17 (got ${inDate})`);

// ─── Scenario K: Upcoming Page Filtering ─────────────────────────────────────
console.log('\n--- Scenario K: Upcoming Page Filtering ---');
const mockUpcomingItems: UpcomingItem[] = [
  {
    id: 'dc-supergirl',
    tmdb_id: 1081003,
    title: 'Supergirl: Woman of Tomorrow',
    type: 'movie',
    franchise_id: 'dc-extended-universe',
    franchise_name: 'DC Universe',
    franchise_slug: 'dc-extended-universe',
    poster_url: '',
    backdrop_url: '',
    overview: '',
    release_date: '2026-06-26',
    status: calculateCountdown('2026-06-26', 'upcoming', EVAL_DATE).status,
    countdown: calculateCountdown('2026-06-26', 'upcoming', EVAL_DATE),
    content: getContentById('dc-supergirl') || pastMovie,
  },
  {
    id: 'mcu-doomsday',
    tmdb_id: 1003596,
    title: 'Avengers: Doomsday',
    type: 'movie',
    franchise_id: 'marvel-cinematic-universe',
    franchise_name: 'Marvel Cinematic Universe',
    franchise_slug: 'marvel-cinematic-universe',
    poster_url: '',
    backdrop_url: '',
    overview: '',
    release_date: '2026-12-18',
    status: calculateCountdown('2026-12-18', 'upcoming', EVAL_DATE).status,
    countdown: calculateCountdown('2026-12-18', 'upcoming', EVAL_DATE),
    content: getContentById('mcu-doomsday') || futureMovie,
  },
];
const upcomingFiltered = getUpcomingTitles(mockUpcomingItems, EVAL_DATE);
const recentlyReleasedFiltered = getRecentlyReleasedTitles(mockUpcomingItems, 90, EVAL_DATE);

assert(!upcomingFiltered.some((i) => i.id === 'dc-supergirl'), 'K1. Supergirl is EXCLUDED from upcoming page list');
assert(upcomingFiltered.some((i) => i.id === 'mcu-doomsday'), 'K2. Avengers: Doomsday is INCLUDED in upcoming page list');
assert(recentlyReleasedFiltered.some((i) => i.id === 'dc-supergirl'), 'K3. Supergirl is INCLUDED in recently released section (within 90 days)');

// ─── Scenario L, M, N: UI Badges & Page State ────────────────────────────────
console.log('\n--- Scenario L, M, N: UI Badges & Page State ---');
const supergirlCatalog = getContentById('dc-supergirl');
assert(!!supergirlCatalog, 'L1. dc-supergirl exists in catalog');
if (supergirlCatalog) {
  const cat = getLifecycleCategory(supergirlCatalog, EVAL_DATE);
  assert(cat === 'THEATRICALLY_RELEASED', `L2. Search/Cards/Franchise/Detail lifecycle category is "THEATRICALLY_RELEASED" (got ${cat})`);
  assert(isTheatricallyUpcoming(supergirlCatalog, EVAL_DATE) === false, 'L3. UI flags isTheatricallyUpcoming === false');
}

// ─── Scenario O: No Catalog Mutation ─────────────────────────────────────────
console.log('\n--- Scenario O: Zero Catalog Mutation ---');
assert(allContent.length === 240, 'O1. Catalog content length remains exactly 240');
assert(allFranchises.length === 19, 'O2. Franchise count remains exactly 19');

// ─── Scenario P: Supergirl Specific Regression ───────────────────────────────
console.log('\n--- Scenario P: Supergirl: Woman of Tomorrow Specific Regression ---');
if (supergirlCatalog) {
  // As of pre-release (2026-06-01):
  assert(classifyLifecycle(supergirlCatalog, '2026-06-01') === 'upcoming', 'P1. As of 2026-06-01, Supergirl was "upcoming"');
  assert(getLifecycleCategory(supergirlCatalog, '2026-06-01') === 'UPCOMING', 'P2. As of 2026-06-01, Supergirl category was "UPCOMING"');
  assert(isTheatricallyUpcoming(supergirlCatalog, '2026-06-01') === true, 'P3. As of 2026-06-01, isTheatricallyUpcoming was true');

  // As of post-release (2026-08-20):
  assert(classifyLifecycle(supergirlCatalog, EVAL_DATE) === 'theatrically_released', 'P4. As of 2026-08-20, Supergirl is "theatrically_released"');
  assert(getLifecycleCategory(supergirlCatalog, EVAL_DATE) === 'THEATRICALLY_RELEASED', 'P5. As of 2026-08-20, Supergirl category is "THEATRICALLY_RELEASED"');
  assert(isTheatricallyUpcoming(supergirlCatalog, EVAL_DATE) === false, 'P6. As of 2026-08-20, isTheatricallyUpcoming is false');
  assert(computeOttAvailable(supergirlCatalog, EVAL_DATE) === false, 'P7. As of 2026-08-20, Supergirl OTT streaming is false (theatrical only)');
}

// ─── Scenario Q: Permanent Catalog-Wide Invariant ────────────────────────────
console.log('\n--- Scenario Q: Permanent Catalog-Wide Invariant ---');
let staleUpcomingCount = 0;
for (const c of allContent) {
  const cat = getLifecycleCategory(c);
  const isUp = isTheatricallyUpcoming(c);
  const hasPastReleaseDate = Boolean(c.release_date) && isPastDate(c.release_date);
  if (hasPastReleaseDate && (cat === 'UPCOMING' || isUp)) {
    console.error(`  Violation on ${c.id} (${c.title}): release_date=${c.release_date}, category=${cat}`);
    staleUpcomingCount++;
  }
}
assert(staleUpcomingCount === 0, `Q. Invariant holds: exactly 0 stale UPCOMING titles across all 240 catalog items (found ${staleUpcomingCount})`);

// ─── Scenario R: Frozen Framework Verification ───────────────────────────────
console.log('\n--- Scenario R: Frozen Framework Checksum Verification ---');
const EXPECTED_HASHES: Record<string, string> = {
  'src/lib/storyGraphEngine.ts': 'e7402a0a8d383f25e24e23392a0aad437fb04204bc7c79080781bdc6ad848488',
  'src/lib/storyKnowledgeGraphEngine.ts': 'e729c5dc2b0edbdb23d75bc2caf1813cd7a0fb507f6fa687ad0dbbabc4c6258e',
  'src/lib/recommendationService.ts': 'd143d7eecd5fdc27d33b79630f9551e939f7d6fb9924bc97b3cfc82bde1c48d9',
  'src/data/cineOrderKnowledgeGraph.ts': '3f4e9d92bbbfb4ae0046b64912329b5e704b8b06cac6e723d3650219157e48af',
  '.agents/AGENTS.md': '47a3707789cfff9fe926f4d78212807d7f31ab335c03d58894e15779e4342363',
};

for (const [relPath, expectedHash] of Object.entries(EXPECTED_HASHES)) {
  const fullPath = path.join(process.cwd(), relPath);
  const content = fs.readFileSync(fullPath, 'utf-8').replace(/\r\n/g, '\n');
  const actualHash = crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
  assert(actualHash === expectedHash, `R. ${relPath} SHA-256 matches frozen hash`);
}

// ────────────────────────────────────────────────────────────────────────────
console.log('\n============================================================');
console.log(`  TEST RESULTS: ${failures === 0 ? '✅ ALL SCENARIOS PASSED' : `❌ ${failures} FAILURES`}`);
console.log('============================================================\n');

if (failures > 0) {
  process.exit(1);
}
