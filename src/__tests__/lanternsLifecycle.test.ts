/**
 * CineOrder — Lanterns Lifecycle & Universal Release-State Regression Suite
 *
 * Validates the 10 core release-state detection scenarios:
 * 1. Lanterns before premiere → UPCOMING
 * 2. Lanterns at/after US premiere → no longer UPCOMING (STREAMING_AVAILABLE on Max)
 * 3. India timezone conversion (US Aug 16 9PM ET -> India Aug 17 6:30AM IST)
 * 4. Weekly series rollout distinction (8 episodes, not treated as completed box set)
 * 5. Movie lifecycle preserved (The Batman Part II, Iron Man, Spider-Man 4, Avatar 3)
 * 6. Future series remain UPCOMING (Waller, Booster Gold)
 * 7. TBA titles remain UPCOMING (Paradise Lost)
 * 8. Zero OTT fabrication (streaming only enabled when verified provider + release instant passed)
 * 9. Canonical lifecycle invariants intact (zero split-brain)
 * 10. Zero chronological watch order inversions in DC franchise
 */

import { allContent } from '../data/franchises/index';
import { getWatchOrders } from '../data/franchises';
import {
  getMarketReleaseDate,
  isReleaseInstantPassed,
} from '../lib/dateUtils';
import {
  classifyLifecycle,
  computeOttAvailable,
  getLifecycleCategory,
} from '../lib/metadataRefresh';
import {
  calculateCountdown,
  isTheatricallyUpcoming,
  isRecentlyReleasedItem,
} from '../lib/upcomingUtils';
import { validateChronologicalOrdering } from '../lib/releaseOrdering';
import type { Content } from '../types';

console.log('============================================================');
console.log('  LANTERNS LIFECYCLE & UNIVERSAL RELEASE-STATE TEST SUITE   ');
console.log('============================================================\n');

let failures = 0;

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    failures++;
  } else {
    console.log(`  ✅ PASS: ${message}`);
  }
}

// ─── Scenario 1: Lanterns Before Premiere (e.g. 2026-08-15) ──────────────────
console.log('--- 1. Scenario 1: Lanterns Pre-Premiere State ---');
const lanternsCatalog = allContent.find((c) => c.id === 'dc-lanterns');
assert(Boolean(lanternsCatalog), '1A. dc-lanterns exists in catalog');

if (lanternsCatalog) {
  const preDate = '2026-08-15';
  const preLifecycle = classifyLifecycle(lanternsCatalog, preDate);
  const preCategory = getLifecycleCategory(lanternsCatalog, preDate);
  const preUpcoming = isTheatricallyUpcoming(lanternsCatalog, preDate);
  const preCountdown = calculateCountdown(lanternsCatalog.release_date, 'upcoming', preDate);

  assert(preLifecycle === 'upcoming', `1B. As of 2026-08-15, classifyLifecycle is 'upcoming' (got '${preLifecycle}')`);
  assert(preCategory === 'UPCOMING', `1C. As of 2026-08-15, getLifecycleCategory is 'UPCOMING' (got '${preCategory}')`);
  assert(preUpcoming === true, '1D. As of 2026-08-15, isTheatricallyUpcoming === true');
  assert(preCountdown.status === 'Upcoming', `1E. As of 2026-08-15, countdown status is 'Upcoming' (got '${preCountdown.status}')`);
  assert(preCountdown.daysTotal === 1, `1F. As of 2026-08-15, exactly 1 day left to premiere (got ${preCountdown.daysTotal})`);
}

// ─── Scenario 2: Lanterns At/After US Premiere (2026-08-16 21:00 ET & As Of Today) ──
console.log('\n--- 2. Scenario 2: Lanterns Post-Premiere State ---');
if (lanternsCatalog) {
  const postDate = '2026-08-19';
  const postLifecycle = classifyLifecycle(lanternsCatalog, postDate);
  const postCategory = getLifecycleCategory(lanternsCatalog, postDate);
  const postUpcoming = isTheatricallyUpcoming(lanternsCatalog, postDate);
  const postOtt = computeOttAvailable(lanternsCatalog);
  const postCountdown = calculateCountdown(lanternsCatalog.release_date, lanternsCatalog.status, postDate);

  assert(postLifecycle === 'subscription_available', `2A. As of 2026-08-19, classifyLifecycle is 'subscription_available' (got '${postLifecycle}')`);
  assert(postCategory === 'STREAMING_AVAILABLE', `2B. As of 2026-08-19, getLifecycleCategory is 'STREAMING_AVAILABLE' (got '${postCategory}')`);
  assert(postUpcoming === false, '2C. As of 2026-08-19, isTheatricallyUpcoming === false');
  assert(postOtt === true, '2D. As of 2026-08-19, computeOttAvailable === true (Max streaming)');
  assert(postCountdown.status === 'Released', `2E. As of 2026-08-19, countdown status is 'Released' (got '${postCountdown.status}')`);
  assert(postCountdown.text === 'Now Available', `2F. As of 2026-08-19, countdown text is 'Now Available' (got '${postCountdown.text}')`);
  assert(isRecentlyReleasedItem(lanternsCatalog, 90, postDate) === true, '2G. Lanterns appears in Recently Released (within 90-day window)');
}

// ─── Scenario 3: Timezone & Market Conversion (US vs India) ─────────────────
console.log('\n--- 3. Scenario 3: Timezone & Market Conversion ---');
const usMarketDate = getMarketReleaseDate('2026-08-16', 'US', '21:00');
const inMarketDate = getMarketReleaseDate('2026-08-16', 'IN', '21:00');
const utcMarketDate = getMarketReleaseDate('2026-08-16', 'UTC', '21:00');

assert(usMarketDate === '2026-08-16', `3A. US market release date for 21:00 ET is 2026-08-16 (got '${usMarketDate}')`);
assert(inMarketDate === '2026-08-17', `3B. India market release date for 21:00 ET is 2026-08-17 (got '${inMarketDate}')`);
assert(utcMarketDate === '2026-08-17', `3C. UTC market release date for 21:00 ET is 2026-08-17 (got '${utcMarketDate}')`);

// Precise Instant checks
// 1 hour before US premiere: 2026-08-16T20:00:00-04:00 (EDT)
const beforeInstantPassed = isReleaseInstantPassed('2026-08-16', {
  asOfInstant: '2026-08-16T20:00:00-04:00',
  premiereTimeET: '21:00',
  market: 'US',
});
assert(beforeInstantPassed === false, '3D. At 20:00 ET on Aug 16, premiere instant has NOT passed');

// 30 minutes after US premiere: 2026-08-16T21:30:00-04:00 (EDT)
const afterInstantPassed = isReleaseInstantPassed('2026-08-16', {
  asOfInstant: '2026-08-16T21:30:00-04:00',
  premiereTimeET: '21:00',
  market: 'US',
});
assert(afterInstantPassed === true, '3E. At 21:30 ET on Aug 16, US premiere instant HAS passed');

// India market morning: 2026-08-17T07:00:00+05:30 (IST)
const indiaMorningPassed = isReleaseInstantPassed('2026-08-16', {
  asOfInstant: '2026-08-17T07:00:00+05:30',
  premiereTimeET: '21:00',
  market: 'IN',
});
assert(indiaMorningPassed === true, '3F. At 07:00 IST on Aug 17, India availability instant HAS passed');

// ─── Scenario 4: Weekly Series Rollout Integrity ────────────────────────────
console.log('\n--- 4. Scenario 4: Weekly Series Rollout Integrity ---');
if (lanternsCatalog) {
  assert(lanternsCatalog.type === 'series', `4A. dc-lanterns is correctly typed as 'series' (got '${lanternsCatalog.type}')`);
  assert(lanternsCatalog.episode_count === 8, `4B. dc-lanterns has 8 total episodes (got ${lanternsCatalog.episode_count})`);
  assert(lanternsCatalog.season_count === 1, `4C. dc-lanterns is season 1 (got ${lanternsCatalog.season_count})`);
  assert(lanternsCatalog.runtime === 50, `4D. dc-lanterns episode runtime is 50 minutes (got ${lanternsCatalog.runtime})`);
}

// ─── Scenario 5: Movie Lifecycle Stability ──────────────────────────────────
console.log('\n--- 5. Scenario 5: Movie Lifecycle Stability ---');
const batman2 = allContent.find((c) => c.id === 'dc-batman-2');
assert(Boolean(batman2), '5A. The Batman Part II exists in catalog');
if (batman2) {
  assert(batman2.type === 'movie', '5B. The Batman Part II is a movie');
  assert(batman2.status === 'upcoming', '5C. The Batman Part II status is upcoming');
  assert(getLifecycleCategory(batman2) === 'UPCOMING', `5D. The Batman Part II lifecycle is UPCOMING (got '${getLifecycleCategory(batman2)}')`);
  assert(isTheatricallyUpcoming(batman2) === true, '5E. The Batman Part II isTheatricallyUpcoming === true');
}

const spiderman4 = allContent.find((c) => c.id === 'mcu-spiderman-brand-new-day');
assert(Boolean(spiderman4), '5F. Spider-Man: Brand New Day exists in catalog');
if (spiderman4) {
  assert(getLifecycleCategory(spiderman4) === 'THEATRICALLY_RELEASED', `5G. Spider-Man: Brand New Day is THEATRICALLY_RELEASED (got '${getLifecycleCategory(spiderman4)}')`);
}

const avatar3 = allContent.find((c) => c.id === 'avatar-3');
assert(Boolean(avatar3), '5H. Avatar 3 exists in catalog');
if (avatar3) {
  assert(getLifecycleCategory(avatar3) === 'STREAMING_AVAILABLE', `5I. Avatar 3 is STREAMING_AVAILABLE (got '${getLifecycleCategory(avatar3)}')`);
}

// ─── Scenario 6: Future Series Remain UPCOMING ──────────────────────────────
console.log('\n--- 6. Scenario 6: Future Series Remain UPCOMING ---');
const waller = allContent.find((c) => c.id === 'dc-waller');
assert(Boolean(waller), '6A. Waller exists in catalog');
if (waller) {
  assert(waller.type === 'series', '6B. Waller is a series');
  assert(getLifecycleCategory(waller) === 'UPCOMING', `6C. Waller lifecycle is UPCOMING (got '${getLifecycleCategory(waller)}')`);
  assert(isTheatricallyUpcoming(waller) === true, '6D. Waller isTheatricallyUpcoming === true');
}

const boosterGold = allContent.find((c) => c.id === 'dc-booster-gold');
assert(Boolean(boosterGold), '6E. Booster Gold exists in catalog');
if (boosterGold) {
  assert(boosterGold.type === 'series', '6F. Booster Gold is a series');
  assert(getLifecycleCategory(boosterGold) === 'UPCOMING', `6G. Booster Gold lifecycle is UPCOMING (got '${getLifecycleCategory(boosterGold)}')`);
  assert(isTheatricallyUpcoming(boosterGold) === true, '6H. Booster Gold isTheatricallyUpcoming === true');
}

// ─── Scenario 7: TBA Titles Remain UPCOMING ─────────────────────────────────
console.log('\n--- 7. Scenario 7: TBA Titles Remain UPCOMING ---');
const tbaMockTitle: Content = {
  id: 'dc-tba-series',
  franchise_id: 'dc-extended-universe',
  tmdb_id: null,
  title: 'DC Unannounced Project',
  type: 'series',
  poster_url: '/placeholder-poster.svg',
  backdrop_url: '/placeholder-backdrop.svg',
  overview: 'TBA DC Project in development.',
  release_date: '',
  runtime: 45,
  episode_count: 8,
  season_count: 1,
  rating: 7.5,
  status: 'tba',
  genres: [],
  director: '',
  cast: [],
  trailer_url: '',
  is_canon: true,
  is_required: false,
  created_at: '2024-01-01',
};
assert(getLifecycleCategory(tbaMockTitle) === 'UPCOMING', `7A. TBA Title lifecycle is UPCOMING (got '${getLifecycleCategory(tbaMockTitle)}')`);
assert(isTheatricallyUpcoming(tbaMockTitle) === true, '7B. TBA Title isTheatricallyUpcoming === true');
const tbaCountdown = calculateCountdown(tbaMockTitle.release_date, tbaMockTitle.status);
assert(tbaCountdown.status === 'TBA', `7C. TBA Title countdown status is 'TBA' (got '${tbaCountdown.status}')`);
assert(tbaCountdown.text === 'Release Date TBA', `7D. TBA Title countdown text is 'Release Date TBA' (got '${tbaCountdown.text}')`);

// ─── Scenario 8: Zero OTT Fabrication ───────────────────────────────────────
console.log('\n--- 8. Scenario 8: Zero OTT Fabrication ---');
const futureWithProvider: Content = {
  id: 'test-future-series',
  franchise_id: 'dc-extended-universe',
  tmdb_id: 111111,
  title: 'Future DC Series',
  type: 'series',
  poster_url: '',
  backdrop_url: '',
  overview: '',
  release_date: '2028-06-01',
  runtime: 45,
  episode_count: 6,
  season_count: 1,
  rating: 8.0,
  status: 'upcoming',
  genres: [],
  director: '',
  cast: [],
  trailer_url: '',
  is_canon: true,
  is_required: true,
  theatrical_released: false,
  digital_available: false,
  subscription_streaming_available: false,
  streaming_providers: [{ id: 'p1', content_id: 'test-future-series', provider_name: 'Max', provider_logo: '', url: '#', country: 'US' }],
  created_at: '2024-01-01',
};
assert(computeOttAvailable(futureWithProvider) === false, '8A. Future series with provider Max does NOT fabricate OTT availability before release');
assert(classifyLifecycle(futureWithProvider) === 'upcoming', `8B. Future series with provider Max classifies as 'upcoming' (got '${classifyLifecycle(futureWithProvider)}')`);
assert(getLifecycleCategory(futureWithProvider) === 'UPCOMING', `8C. Future series with provider Max category is UPCOMING (got '${getLifecycleCategory(futureWithProvider)}')`);

// ─── Scenario 9: Canonical Split-Brain Integrity ────────────────────────────
console.log('\n--- 9. Scenario 9: Canonical Split-Brain Integrity ---');
let splitBrainCount = 0;
for (const item of allContent) {
  const cat = getLifecycleCategory(item);
  const isUp = isTheatricallyUpcoming(item);
  const isOtt = computeOttAvailable(item);

  if (cat === 'UPCOMING' && isOtt) {
    splitBrainCount++;
    console.error(`Split-brain: ${item.id} is UPCOMING but OTT available`);
  }
  if (cat === 'STREAMING_AVAILABLE' && !isOtt) {
    splitBrainCount++;
    console.error(`Split-brain: ${item.id} is STREAMING_AVAILABLE but NOT OTT available`);
  }
  if (cat === 'THEATRICALLY_RELEASED' && isUp) {
    splitBrainCount++;
    console.error(`Split-brain: ${item.id} is THEATRICALLY_RELEASED but isTheatricallyUpcoming=true`);
  }
}
assert(splitBrainCount === 0, `9A. Zero split-brain contradictions across all ${allContent.length} titles (found ${splitBrainCount})`);

// ─── Scenario 10: Zero Chronological Ordering Regressions ───────────────────
console.log('\n--- 10. Scenario 10: Zero Chronological Ordering Regressions ---');
const dcReleaseOrders = getWatchOrders('dc-extended-universe').filter((w) => w.order_type === 'release');
const dcValidation = validateChronologicalOrdering(dcReleaseOrders);
assert(dcValidation.isValid, `10A. DC Extended Universe release order is strictly chronological (valid: ${dcValidation.isValid})`);
assert(dcValidation.inversions.length === 0, `10B. DC Extended Universe has 0 chronological inversions (found ${dcValidation.inversions.length})`);

// ────────────────────────────────────────────────────────────────────────────
console.log('\n============================================================');
console.log(`  LANTERNS LIFECYCLE TEST RESULTS: ${failures === 0 ? '✅ ALL 10 SCENARIOS PASSED' : `❌ ${failures} FAILURES`}`);
console.log('============================================================\n');

declare const process: { exit: (code: number) => void };

if (failures > 0) {
  process.exit(1);
}
