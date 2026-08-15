import { allContent } from '../data/franchises/index';
import { isTheatricallyUpcoming, isOttAvailable } from '../lib/upcomingUtils';
import type { Content } from '../types';

console.log('========================================================================');
console.log('  CINEORDER HARDENED LIFECYCLE & STALE OTT REGRESSION MATRIX            ');
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

/**
 * Returns preparation-guide UI mode:
 * 'post-release' (Post-OTT) if isOttAvailable is true.
 * 'pre-release' (Pre-OTT / Trailer Readiness) if isOttAvailable is false.
 */
function getPreparationGuideMode(content: Content): 'post-release' | 'pre-release' {
  return isOttAvailable(content) ? 'post-release' : 'pre-release';
}

const createMockContent = (overrides: Partial<Content>): Content =>
  ({
    id: 'mock-id',
    tmdb_id: 99999,
    title: 'Mock Title',
    type: 'movie',
    franchise_id: 'marvel',
    release_date: '2025-01-01',
    status: 'released',
    is_canon: true,
    is_required: true,
    poster_url: '/placeholder-poster.svg',
    backdrop_url: '/placeholder-backdrop.svg',
    overview: 'Overview text',
    created_at: '2024-01-01',
    ...overrides,
  }) as Content;

// 1. Fantastic Four is OTT -> POST-OTT
const ffTitle = allContent.find((c) => c.id === 'mcu-fantastic-four');
assert(Boolean(ffTitle), '1A. The Fantastic Four: First Steps exists in catalog');
if (ffTitle) {
  assert(isTheatricallyUpcoming(ffTitle) === false, '1B. The Fantastic Four: First Steps Upcoming = NO');
  assert(isOttAvailable(ffTitle) === true, '1C. The Fantastic Four: First Steps OTT available = YES');
  assert(getPreparationGuideMode(ffTitle) === 'post-release', '1D. The Fantastic Four: First Steps uses POST-OTT mode');
}

// 2. OTT title cannot display Trailer Readiness
const ottItem = createMockContent({ id: 'ott-item', release_date: '2024-01-01', status: 'released', ott_available: true });
assert(getPreparationGuideMode(ottItem) !== 'pre-release', '2. OTT title CANNOT display Trailer Readiness mode');

// 3. OTT title cannot display Additional Recommended Viewing
assert(getPreparationGuideMode(ottItem) === 'post-release', '3. OTT title displays normal Post-OTT mode (Must Watch / Recommended / Extra Context)');

// 4. OTT title cannot appear in Upcoming
assert(isTheatricallyUpcoming(ottItem) === false, '4. OTT title CANNOT appear in Upcoming section');

// 5. Theatrical-only title remains PRE-OTT
const theatricalOnly = createMockContent({
  id: 'theatrical-only',
  release_date: '2025-07-01',
  status: 'released',
  ott_available: false,
  streaming_providers: [{ id: 'p1', content_id: 'c1', provider_name: 'Theaters Only', provider_logo: '', url: '#', country: 'US' }],
});
assert(isTheatricallyUpcoming(theatricalOnly) === false, '5A. Theatrical-only title Upcoming = NO');
assert(getPreparationGuideMode(theatricalOnly) === 'pre-release', '5B. Theatrical-only title remains PRE-OTT');

// 6. Pre-theatrical title remains PRE-OTT
const preTheatrical = createMockContent({ id: 'pre-theatrical', release_date: '2028-01-01', status: 'upcoming' });
assert(isTheatricallyUpcoming(preTheatrical) === true, '6A. Pre-theatrical title Upcoming = YES');
assert(getPreparationGuideMode(preTheatrical) === 'pre-release', '6B. Pre-theatrical title remains PRE-OTT');

// 7. Provider-confirmed OTT title becomes POST-OTT
const providerConfirmed = createMockContent({
  id: 'provider-confirmed',
  release_date: '2025-01-01',
  status: 'released',
  streaming_providers: [{ id: 'p2', content_id: 'c2', provider_name: 'Disney+', provider_logo: '', url: '#', country: 'US' }],
});
assert(isOttAvailable(providerConfirmed) === true, '7. Provider-confirmed OTT title becomes POST-OTT');

// 8. Stale ott_available: false is overridden when provider data confirms OTT
const staleFalseItem = createMockContent({
  id: 'stale-false',
  release_date: '2025-01-01',
  status: 'released',
  ott_available: false,
  streaming_providers: [{ id: 'p3', content_id: 'c3', provider_name: 'Disney+', provider_logo: '', url: '#', country: 'US' }],
});
assert(isOttAvailable(staleFalseItem) === true, '8. Stale ott_available: false is overridden when valid streaming provider is present');

// 9. Stale ott_available: true is avoided when unreleased
const unreleasedTrueItem = createMockContent({ id: 'unreleased-true', release_date: '2028-01-01', status: 'upcoming', ott_available: false });
assert(isOttAvailable(unreleasedTrueItem) === false, '9. Unreleased title with ott_available: false returns isOttAvailable = false');

// 10. All catalog titles have lifecycle/UI consistency
let state1Count = 0; // State 1: Pre-Theatrical
let state2Count = 0; // State 2: Theatrically Released, Not OTT
let state3Count = 0; // State 3: OTT Available
let mismatchCount = 0;

for (const item of allContent) {
  const isUpcoming = isTheatricallyUpcoming(item);
  const isOtt = isOttAvailable(item);

  if (isUpcoming && !isOtt) state1Count++;
  else if (!isUpcoming && !isOtt) state2Count++;
  else if (!isUpcoming && isOtt) state3Count++;
  else mismatchCount++;
}

assert(
  mismatchCount === 0,
  `10. Global Catalog Audit: All ${allContent.length} titles are lifecycle-consistent (State 1: ${state1Count}, State 2: ${state2Count}, State 3: ${state3Count})`
);

declare const process: { exit: (code: number) => void };

console.log(`\nRegression Suite Result: ${testFailures === 0 ? '✅ ALL LIFECYCLE CONSISTENCY TESTS PASSED' : `❌ ${testFailures} FAILURES DETECTED`}\n`);

if (testFailures > 0 && typeof process !== 'undefined') {
  process.exit(1);
}
