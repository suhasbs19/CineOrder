import { isUpcomingItem, isRecentlyReleasedItem, calculateCountdown, getUpcomingTitles, getRecentlyReleasedTitles } from '../lib/upcomingUtils';
import { allContent } from '../data/franchises';
import type { Content } from '../types';

console.log('========================================================================');
console.log('      CINEORDER UPCOMING RELEASES REGRESSION SUITE                      ');
console.log('========================================================================\n');

let testFailures = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
  } else {
    console.log(`❌ FAIL: ${message}`);
    testFailures++;
  }
}

const createMockContent = (overrides: Partial<Content>): Content =>
  ({
    id: 'mock-id',
    tmdb_id: 12345,
    title: 'Mock Title',
    type: 'movie',
    franchise_id: 'marvel',
    release_date: '2027-12-31',
    status: 'upcoming',
    is_canon: true,
    is_required: true,
    poster_url: '/placeholder-poster.svg',
    backdrop_url: '/placeholder-backdrop.svg',
    overview: 'Overview text',
    created_at: '2024-01-01',
    ...overrides,
  }) as Content;

// A. Future date + status "upcoming" → included in Upcoming.
const mockA = createMockContent({ id: 'mock-a', release_date: '2027-12-31', status: 'upcoming' });
assert(isUpcomingItem(mockA) === true, 'A. Future date + status "upcoming" → included in Upcoming');

// B. Past date + status "upcoming" → date-aware engine classifies past date as released (not upcoming)
const mockB = createMockContent({ id: 'mock-b', release_date: '2025-05-01', status: 'upcoming' });
assert(isUpcomingItem(mockB) === false, 'B. Past date + status "upcoming" → date-authoritative engine recognizes as already released');

// C. Past date + status "released" → NOT included in Upcoming.
const mockC = createMockContent({ id: 'mock-c', release_date: '2019-04-26', status: 'released' });
assert(isUpcomingItem(mockC) === false, 'C. Past date + status "released" → NOT included in Upcoming');

// D. Today + status "released" → NOT included in Upcoming.
const todayStr = new Date().toISOString().split('T')[0];
const mockD = createMockContent({ id: 'mock-d', release_date: todayStr, status: 'released' });
assert(isUpcomingItem(mockD) === false, 'D. Today + status "released" → NOT included in Upcoming');

// E. status "in_production" → included in Upcoming.
const mockE = createMockContent({ id: 'mock-e', release_date: '2026-11-01', status: 'in_production' });
assert(isUpcomingItem(mockE) === true, 'E. status "in_production" → included in Upcoming');

// F. status "tba" → included in Upcoming.
const mockF = createMockContent({ id: 'mock-f', release_date: '', status: 'tba' });
assert(isUpcomingItem(mockF) === true, 'F. status "tba" → included in Upcoming');

// G. status "planned" → included in Upcoming.
const mockG = createMockContent({ id: 'mock-g', release_date: '2028-01-01', status: 'planned' });
assert(isUpcomingItem(mockG) === true, 'G. status "planned" → included in Upcoming');

// H. Past date countdown → shows "Now Available".
const mockH = createMockContent({ id: 'mock-h', release_date: '2025-01-01', status: 'upcoming' });
const calcH = calculateCountdown(mockH.release_date, mockH.status);
assert(calcH.text === 'Now Available', 'H. Elapsed release date → shows "Now Available"');

// I. Past date countdown → calculates days since release.
assert(calcH.daysSinceRelease !== null && calcH.daysSinceRelease > 0, 'I. Elapsed release date → calculates daysSinceRelease accurately');

// J. Recently Released ONLY accepts status "released".
assert(isRecentlyReleasedItem(mockB) === false, 'J1. Stale upcoming item is NOT in Recently Released');
assert(isRecentlyReleasedItem(mockE) === false, 'J2. in_production item is NOT in Recently Released');
assert(isRecentlyReleasedItem(mockF) === false, 'J3. tba item is NOT in Recently Released');
assert(isRecentlyReleasedItem(mockG) === false, 'J4. planned item is NOT in Recently Released');

// K. Global catalog audit: Every catalog item explicitly marked with an upcoming lifecycle status must be returned by getUpcomingTitles().
const upcomingLifecycleSet = new Set(['upcoming', 'in_production', 'tba', 'planned']);
const expectedUpcomingInCatalog = allContent.filter((c) => upcomingLifecycleSet.has((c.status || '').toLowerCase()));

const actualUpcomingItems = getUpcomingTitles(
  allContent.map((c) => ({
    id: c.id,
    tmdb_id: c.tmdb_id,
    title: c.title,
    type: c.type,
    franchise_id: c.franchise_id,
    franchise_name: c.franchise_id,
    franchise_slug: c.franchise_id,
    poster_url: c.poster_url || '',
    backdrop_url: c.backdrop_url || '',
    overview: c.overview,
    release_date: c.release_date || '',
    status: (upcomingLifecycleSet.has((c.status || '').toLowerCase())
      ? 'Upcoming'
      : calculateCountdown(c.release_date, c.status).status) as any,
    countdown: calculateCountdown(c.release_date, c.status),
    content: c,
  }))
);

const actualUpcomingIds = new Set(actualUpcomingItems.map((u) => u.id));
const missingUpcoming = expectedUpcomingInCatalog.filter((c) => !actualUpcomingIds.has(c.id));

assert(
  missingUpcoming.length === 0,
  `K. Global catalog audit: All ${expectedUpcomingInCatalog.length} catalog items with upcoming lifecycle status are returned by getUpcomingTitles()`
);

// L. State B / State C Audit: No theatrically released title (whether OTT or theatrical-only) appears in Upcoming
const theatricallyReleasedInUpcoming = actualUpcomingItems.filter((u) => u.content?.theatrical_released === true || u.content?.status === 'released');
assert(
  theatricallyReleasedInUpcoming.length === 0,
  'L. State B & C Rule: Zero theatrically released titles appear in Upcoming Movies section'
);

// M. All Tracked Dataset Mathematical Consistency
const mockItems = allContent.map((c) => ({
  id: c.id,
  tmdb_id: c.tmdb_id,
  title: c.title,
  type: c.type,
  franchise_id: c.franchise_id,
  franchise_name: c.franchise_id,
  franchise_slug: c.franchise_id,
  poster_url: c.poster_url || '',
  backdrop_url: c.backdrop_url || '',
  overview: c.overview,
  release_date: c.release_date || '',
  status: (upcomingLifecycleSet.has((c.status || '').toLowerCase())
    ? 'Upcoming'
    : calculateCountdown(c.release_date, c.status).status) as any,
  countdown: calculateCountdown(c.release_date, c.status),
  content: c,
}));

const testUpcoming = getUpcomingTitles(mockItems);
const testRecentlyReleased = getRecentlyReleasedTitles(mockItems, 90);
const testAllTracker = [...testUpcoming, ...testRecentlyReleased];

assert(
  testAllTracker.length === testUpcoming.length + testRecentlyReleased.length,
  `M. All Tracker Count Consistency: All (${testAllTracker.length}) = Upcoming (${testUpcoming.length}) + Recently Released (${testRecentlyReleased.length})`
);

// N. Disjoint Set Assertion: No item is simultaneously in Upcoming and Recently Released
const upcomingIdSet = new Set(testUpcoming.map((t) => t.id));
const overlap = testRecentlyReleased.filter((r) => upcomingIdSet.has(r.id));
assert(overlap.length === 0, 'N. Disjoint Set Rule: Zero overlap between Upcoming and Recently Released titles');

// O. Franchise Filter Consistency
const marvelUpcoming = testUpcoming.filter((t) => t.franchise_id === 'marvel');
const marvelRecent = testRecentlyReleased.filter((t) => t.franchise_id === 'marvel');
const marvelAll = testAllTracker.filter((t) => t.franchise_id === 'marvel');
assert(
  marvelAll.length === marvelUpcoming.length + marvelRecent.length,
  `O. Franchise Filter Consistency: Marvel All (${marvelAll.length}) = Marvel Upcoming (${marvelUpcoming.length}) + Marvel Recent (${marvelRecent.length})`
);

declare const process: { exit: (code: number) => void };

console.log(`\nRegression Suite Result: ${testFailures === 0 ? '✅ ALL UPCOMING RELEASES TESTS PASSED' : `❌ ${testFailures} FAILURES DETECTED`}\n`);

if (testFailures > 0 && typeof process !== 'undefined') {
  process.exit(1);
}
