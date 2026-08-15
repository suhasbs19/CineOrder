import { allContent } from '../data/franchises/index';
import { isTheatricallyUpcoming, isOttAvailable, calculateCountdown } from '../lib/upcomingUtils';
import { getLifecycleCategory, computeOttAvailable } from '../lib/metadataRefresh';
import { isPastDate, isFutureDate, isToday, getDaysDifference, getCanonicalTodayStr } from '../lib/dateUtils';
import { executeKnowledgeGraphTraversal } from '../lib/storyKnowledgeGraphEngine';
import type { Content } from '../types';

console.log('========================================================================');
console.log('  CINEORDER CANONICAL 10-INVARIANT LIFECYCLE & RELEASE TEST SUITE       ');
console.log('========================================================================\n');

let testFailures = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
  } else {
    console.log(`❌ FAIL: ${message}`);
  }
  if (!condition) {
    testFailures++;
  }
}

const createMock = (overrides: Partial<Content>): Content =>
  ({
    id: 'mock-test-item',
    tmdb_id: 123456,
    title: 'Mock Test Item',
    type: 'movie',
    franchise_id: 'test-franchise',
    release_date: '2025-01-01',
    status: 'released',
    is_canon: true,
    is_required: true,
    poster_url: '/placeholder.svg',
    backdrop_url: '/placeholder.svg',
    overview: 'Overview',
    created_at: '2024-01-01',
    ...overrides,
  }) as Content;

// ========================================================================
// INVARIANT 1: Midnight transition behavior (yesterday, today, tomorrow)
// ========================================================================
const baseDate = '2026-06-15';
assert(isPastDate('2026-06-14', baseDate) === true, 'Inv 1A. Yesterday is past date');
assert(isPastDate('2026-06-15', baseDate) === true, 'Inv 1B. Today is past/reached date for release checks');
assert(isPastDate('2026-06-16', baseDate) === false, 'Inv 1C. Tomorrow is NOT past date');
assert(isFutureDate('2026-06-16', baseDate) === true, 'Inv 1D. Tomorrow is future date');
assert(isToday('2026-06-15', baseDate) === true, 'Inv 1E. Today matches base date');
assert(getDaysDifference('2026-06-16', baseDate) === 1, 'Inv 1F. Tomorrow is exactly +1 day difference');
assert(getDaysDifference('2026-06-14', baseDate) === -1, 'Inv 1G. Yesterday is exactly -1 day difference');
assert(getDaysDifference('2026-06-15', baseDate) === 0, 'Inv 1H. Today is exactly 0 days difference');

// ========================================================================
// INVARIANT 2: Past release dates must NOT be marked upcoming
// ========================================================================
const pastItem = createMock({ release_date: '2020-01-01', status: 'released' });
assert(isTheatricallyUpcoming(pastItem) === false, 'Inv 2A. Past release date title is not theatrically upcoming');
assert(getLifecycleCategory(pastItem) !== 'UPCOMING', 'Inv 2B. Past release date lifecycle category is not UPCOMING');

// ========================================================================
// INVARIANT 3: Future release dates must NOT be marked released unless explicit
// ========================================================================
const futureItem = createMock({ release_date: '2028-12-25', status: 'upcoming', theatrical_released: false });
assert(isTheatricallyUpcoming(futureItem) === true, 'Inv 3A. Future title is theatrically upcoming');
assert(getLifecycleCategory(futureItem) === 'UPCOMING', 'Inv 3B. Future title lifecycle category is UPCOMING');

// ========================================================================
// INVARIANT 4: Titles with release dates today are handled predictably
// ========================================================================
const todayCountdown = calculateCountdown(getCanonicalTodayStr(), 'upcoming');
assert(todayCountdown.text === 'Releasing Today!', 'Inv 4A. Title releasing today shows "Releasing Today!"');
assert(todayCountdown.daysTotal === 0, 'Inv 4B. Title releasing today has daysTotal = 0');

// ========================================================================
// INVARIANT 5: OTT availability MUST NOT be assumed purely from release date
// ========================================================================
const theatricalOnlyItem = createMock({
  release_date: '2025-01-01',
  status: 'released',
  theatrical_released: true,
  digital_available: false,
  subscription_streaming_available: false,
  ott_available: false,
  streaming_providers: [],
});
assert(computeOttAvailable(theatricalOnlyItem) === false, 'Inv 5A. Theatrical-only title computeOttAvailable = false');
assert(getLifecycleCategory(theatricalOnlyItem) === 'THEATRICALLY_RELEASED', 'Inv 5B. Theatrical-only title category = THEATRICALLY_RELEASED');

// ========================================================================
// INVARIANT 6: OTT availability requires streaming provider data or explicit flag
// ========================================================================
const streamingItemExplicit = createMock({
  release_date: '2025-01-01',
  status: 'released',
  subscription_streaming_available: true,
});
const streamingItemProvider = createMock({
  release_date: '2025-01-01',
  status: 'released',
  streaming_providers: [{ id: 'p1', content_id: 'c1', provider_name: 'Disney+', provider_logo: '', url: '#', country: 'US' }],
});
assert(computeOttAvailable(streamingItemExplicit) === true, 'Inv 6A. Explicit subscription available -> OTT true');
assert(computeOttAvailable(streamingItemProvider) === true, 'Inv 6B. Provider Disney+ -> OTT true');
assert(getLifecycleCategory(streamingItemExplicit) === 'STREAMING_AVAILABLE', 'Inv 6C. Streaming title category = STREAMING_AVAILABLE');

// ========================================================================
// INVARIANT 7: Released titles MUST keep their story prerequisites intact
// ========================================================================
const avengersEndgame = allContent.find((c) => c.id === 'mcu-endgame');
assert(Boolean(avengersEndgame), 'Inv 7A. Avengers: Endgame exists in catalog');
if (avengersEndgame) {
  const traversal = executeKnowledgeGraphTraversal('mcu-endgame', []);
  assert(Boolean(traversal && traversal.mustWatch.length > 0), `Inv 7B. Released title retains Must Watch prerequisites (found ${traversal?.mustWatch.length || 0})`);
  assert(traversal?.storyReadinessPercentage === 0, 'Inv 7C. Unwatched prerequisites report 0% readiness');
}

// ========================================================================
// INVARIANT 8: Released titles MUST NOT be shown in Upcoming Movies section
// ========================================================================
const releasedMcu = allContent.find((c) => c.id === 'mcu-iron-man');
assert(Boolean(releasedMcu), 'Inv 8A. Iron Man exists in catalog');
if (releasedMcu) {
  assert(isTheatricallyUpcoming(releasedMcu) === false, 'Inv 8B. Iron Man is NOT theatrically upcoming');
}

// ========================================================================
// INVARIANT 9: Preparation Guide adapts framing based on release state
// ========================================================================
assert(getLifecycleCategory(pastItem) !== 'UPCOMING', 'Inv 9A. Released item category is not UPCOMING');
assert(getLifecycleCategory(futureItem) === 'UPCOMING', 'Inv 9B. Future item category is UPCOMING');
assert(getLifecycleCategory(streamingItemExplicit) === 'STREAMING_AVAILABLE', 'Inv 9C. Streaming item category is STREAMING_AVAILABLE');

// ========================================================================
// INVARIANT 10: Avatar: Fire and Ash evaluates across all 3 release states
// ========================================================================
const avatar3InProd = createMock({
  id: 'avatar-3-test',
  title: 'Avatar: Fire and Ash (In Production)',
  franchise_id: 'avatar',
  release_date: '2025-12-19',
  status: 'in_production',
  theatrical_released: false,
  digital_available: false,
  subscription_streaming_available: false,
});
assert(isTheatricallyUpcoming(avatar3InProd) === true, 'Inv 10A. Avatar 3 In Production -> UPCOMING');
assert(getLifecycleCategory(avatar3InProd) === 'UPCOMING', 'Inv 10B. Avatar 3 In Production category = UPCOMING');

const avatar3Theatrical = createMock({
  id: 'avatar-3-theatrical',
  title: 'Avatar: Fire and Ash (In Theaters)',
  franchise_id: 'avatar',
  release_date: '2025-12-19',
  status: 'released',
  theatrical_released: true,
  digital_available: false,
  subscription_streaming_available: false,
});
assert(isTheatricallyUpcoming(avatar3Theatrical) === false, 'Inv 10C. Avatar 3 Theatrical -> NOT upcoming');
assert(getLifecycleCategory(avatar3Theatrical) === 'THEATRICALLY_RELEASED', 'Inv 10D. Avatar 3 Theatrical category = THEATRICALLY_RELEASED');

const avatar3Streaming = createMock({
  id: 'avatar-3-streaming',
  title: 'Avatar: Fire and Ash (On Disney+)',
  franchise_id: 'avatar',
  release_date: '2025-12-19',
  status: 'released',
  theatrical_released: true,
  digital_available: true,
  subscription_streaming_available: true,
  streaming_providers: [{ id: 'p1', content_id: 'c1', provider_name: 'Disney+', provider_logo: '', url: '#', country: 'US' }],
});
assert(isTheatricallyUpcoming(avatar3Streaming) === false, 'Inv 10E. Avatar 3 Streaming -> NOT upcoming');
assert(isOttAvailable(avatar3Streaming) === true, 'Inv 10F. Avatar 3 Streaming -> OTT Available');
assert(getLifecycleCategory(avatar3Streaming) === 'STREAMING_AVAILABLE', 'Inv 10G. Avatar 3 Streaming category = STREAMING_AVAILABLE');

// ========================================================================
// Catalog Avatar 3 Verification — Real-world OTT state as of 2026-08-14
// Theatrically released: 2025-12-19
// Streaming available:   2026-06-24 (Disney+, JioHotstar)
// ========================================================================
const avatar3Catalog = allContent.find((c) => c.id === 'avatar-3');
assert(Boolean(avatar3Catalog), 'Catalog Check: avatar-3 exists in catalog');
if (avatar3Catalog) {
  console.log(`avatar-3 Catalog State: status="${avatar3Catalog.status}", theatrical_released=${avatar3Catalog.theatrical_released}, ott=${isOttAvailable(avatar3Catalog)}, sub_streaming=${avatar3Catalog.subscription_streaming_available}, providers=${avatar3Catalog.streaming_providers?.map(p => p.provider_name).join(',')}, category=${getLifecycleCategory(avatar3Catalog)}`);
  assert(avatar3Catalog.theatrical_released === true,              'avatar-3 theatrical_released === true');
  assert(isOttAvailable(avatar3Catalog) === true,                  'avatar-3 isOttAvailable === true');
  assert(computeOttAvailable(avatar3Catalog) === true,             'avatar-3 computeOttAvailable === true');
  assert(isTheatricallyUpcoming(avatar3Catalog) === false,         'avatar-3 isTheatricallyUpcoming === false');
  assert(getLifecycleCategory(avatar3Catalog) === 'STREAMING_AVAILABLE', 'avatar-3 getLifecycleCategory === STREAMING_AVAILABLE');
}

// ========================================================================
// INVARIANT 11: SPLIT-BRAIN REGRESSION
// Verifies that MovieDetailPage sidebar (canonicalStatusLabel) and
// PreparationGuide (lifecycleCategory) derive from the SAME static catalog
// source and therefore CANNOT contradict each other.
//
// This reproduces the original bug: TMDB API would return status="Released"
// for avatar-3, causing MovieDetailPage sidebar to show "Released" while
// PreparationGuide (using allContent) showed "Pre-Release Story Preparation".
//
// The fix: MovieDetailPage now uses getLifecycleCategory(staticContent)
// (same call as PreparationGuide line 180) instead of content.status.
// ========================================================================

// Simulate what MovieDetailPage's canonicalStatusLabel IIFE computes
function computeCanonicalStatusLabel(content: Content | undefined): string {
  if (!content) return 'Unknown';
  const cat = getLifecycleCategory(content);
  if (cat === 'STREAMING_AVAILABLE') return 'Streaming Available';
  if (cat === 'THEATRICALLY_RELEASED') return 'In Theaters';
  if (cat === 'UPCOMING') {
    const s = content.status;
    if (s === 'in_production') return 'In Production';
    if (s === 'tba' || s === 'planned') return 'Announced';
    return 'Upcoming';
  }
  return 'Announced';
}

// Simulate what PreparationGuide computes from graphResult.targetContent
function computePreparationGuideMode(content: Content): 'UPCOMING' | 'THEATRICALLY_RELEASED' | 'STREAMING_AVAILABLE' {
  return getLifecycleCategory(content);
}

// avatar-3: Both sidebar and PreparationGuide must agree on STREAMING_AVAILABLE
const a3 = allContent.find((c) => c.id === 'avatar-3');
assert(Boolean(a3), 'Inv 11A. avatar-3 exists for split-brain test');
if (a3) {
  const sidebarLabel = computeCanonicalStatusLabel(a3);
  const guideMode = computePreparationGuideMode(a3);
  const sidebarIsStreaming = sidebarLabel === 'Streaming Available';
  const guideIsStreaming = guideMode === 'STREAMING_AVAILABLE';
  assert(sidebarIsStreaming === guideIsStreaming, `Inv 11B. avatar-3: sidebar (${sidebarLabel}) and PreparationGuide (${guideMode}) agree on STREAMING_AVAILABLE`);
  assert(sidebarLabel === 'Streaming Available', `Inv 11C. avatar-3 sidebar shows "Streaming Available", got "${sidebarLabel}"`);
  assert(guideMode === 'STREAMING_AVAILABLE', `Inv 11D. avatar-3 PreparationGuide mode = STREAMING_AVAILABLE, got "${guideMode}"`);
}

// Iron Man: Both must agree it is STREAMING_AVAILABLE
const im = allContent.find((c) => c.id === 'mcu-iron-man');
assert(Boolean(im), 'Inv 11E. mcu-iron-man exists for split-brain test');
if (im) {
  const sidebarLabel = computeCanonicalStatusLabel(im);
  const guideMode = computePreparationGuideMode(im);
  const sidebarIsStreaming = sidebarLabel === 'Streaming Available';
  const guideIsStreaming = guideMode === 'STREAMING_AVAILABLE';
  assert(sidebarIsStreaming === guideIsStreaming, `Inv 11F. Iron Man: sidebar (${sidebarLabel}) and PreparationGuide (${guideMode}) agree on STREAMING`);
  assert(sidebarLabel === 'Streaming Available', `Inv 11G. Iron Man sidebar shows "Streaming Available", got "${sidebarLabel}"`);
}

// Global split-brain audit: NO title should have sidebar vs guide disagreement
let splitBrainCount = 0;
for (const c of allContent) {
  const sidebarLabel = computeCanonicalStatusLabel(c);
  const guideMode = computePreparationGuideMode(c);
  const sidebarIsUpcoming = sidebarLabel === 'In Production' || sidebarLabel === 'Upcoming' || sidebarLabel === 'Announced';
  const guideIsUpcoming = guideMode === 'UPCOMING';
  const sidebarIsStreaming = sidebarLabel === 'Streaming Available';
  const guideIsStreaming = guideMode === 'STREAMING_AVAILABLE';
  const sidebarIsTheatrical = sidebarLabel === 'In Theaters';
  const guideIsTheatrical = guideMode === 'THEATRICALLY_RELEASED';
  const agrees = (sidebarIsUpcoming === guideIsUpcoming) && (sidebarIsStreaming === guideIsStreaming) && (sidebarIsTheatrical === guideIsTheatrical);
  if (!agrees) {
    splitBrainCount++;
    console.log(`  SPLIT-BRAIN: ${c.id} sidebar="${sidebarLabel}" guide="${guideMode}"`);
  }
}
assert(splitBrainCount === 0, `Inv 11H. Global split-brain audit: 0 titles with sidebar/guide disagreement (found ${splitBrainCount})`);

// ========================================================================
// INVARIANT 12: AVATAR-3 OTT REGRESSION SUITE (12 required assertions)
// Prevents future regressions back to UPCOMING / THEATRICALLY_RELEASED.
// ========================================================================
const a3Final = allContent.find((c) => c.id === 'avatar-3')!;

// 1. theatrical_released === true
assert(a3Final.theatrical_released === true,
  'Inv 12.1. avatar-3 theatrical_released === true');

// 2. OTT availability === true
assert(computeOttAvailable(a3Final) === true,
  'Inv 12.2. avatar-3 OTT availability (computeOttAvailable) === true');

// 3. Resolves to STREAMING_AVAILABLE
assert(getLifecycleCategory(a3Final) === 'STREAMING_AVAILABLE',
  'Inv 12.3. avatar-3 resolves to STREAMING_AVAILABLE');

// 4. NOT UPCOMING
assert(getLifecycleCategory(a3Final) !== 'UPCOMING',
  'Inv 12.4. avatar-3 is NOT UPCOMING');

// 5. NOT THEATRICALLY_RELEASED
assert(getLifecycleCategory(a3Final) !== 'THEATRICALLY_RELEASED',
  'Inv 12.5. avatar-3 is NOT THEATRICALLY_RELEASED');

// 6. Does NOT show Trailer Readiness mode (isTheatricallyUpcoming = false)
assert(isTheatricallyUpcoming(a3Final) === false,
  'Inv 12.6. avatar-3 does NOT show Trailer Readiness (isTheatricallyUpcoming=false)');

// 7. Does NOT show In Theaters / Catch-Up Mode (not THEATRICALLY_RELEASED)
assert(getLifecycleCategory(a3Final) !== 'THEATRICALLY_RELEASED',
  'Inv 12.7. avatar-3 does NOT show In Theaters/Catch-Up Mode');

// 8. Shows Available to Stream (canonicalStatusLabel = "Streaming Available")
const a3SidebarLabel = computeCanonicalStatusLabel(a3Final);
assert(a3SidebarLabel === 'Streaming Available',
  `Inv 12.8. avatar-3 shows "Available to Stream" (sidebar), got "${a3SidebarLabel}"`);

// 9. Shows Viewing Readiness (PreparationGuide mode = STREAMING_AVAILABLE, not UPCOMING or THEATRICALLY_RELEASED)
const a3GuideMode = computePreparationGuideMode(a3Final);
assert(a3GuideMode === 'STREAMING_AVAILABLE',
  `Inv 12.9. avatar-3 shows "Viewing Readiness" (guide mode=STREAMING_AVAILABLE), got "${a3GuideMode}"`);

// 10. MovieDetailPage and PreparationGuide agree
assert(a3SidebarLabel === 'Streaming Available' && a3GuideMode === 'STREAMING_AVAILABLE',
  'Inv 12.10. MovieDetailPage sidebar and PreparationGuide agree (both STREAMING_AVAILABLE)');

// 11. A theatrically released + OTT=false title still resolves to THEATRICALLY_RELEASED
const theatricalNoOtt = createMock({
  id: 'reg-theatrical-no-ott',
  title: 'Regression: Theatrical No OTT',
  release_date: '2025-06-01',
  status: 'released',
  theatrical_released: true,
  digital_available: false,
  subscription_streaming_available: false,
  streaming_providers: [],
});
assert(getLifecycleCategory(theatricalNoOtt) === 'THEATRICALLY_RELEASED',
  'Inv 12.11. theatrical_released=true + OTT=false still resolves to THEATRICALLY_RELEASED');

// 12. A genuinely upcoming title still resolves to UPCOMING
const genuinelyUpcoming = createMock({
  id: 'reg-upcoming',
  title: 'Regression: Upcoming Title',
  release_date: '2099-01-01',
  status: 'upcoming',
  theatrical_released: false,
  digital_available: false,
  subscription_streaming_available: false,
});
assert(getLifecycleCategory(genuinelyUpcoming) === 'UPCOMING',
  'Inv 12.12. Genuine upcoming title (future date, status=upcoming) resolves to UPCOMING');

// ========================================================================
// INVARIANT 13: SPIDER-MAN 4 & AVENGERS DOOMSDAY LIFECYCLE AUDIT
// ========================================================================
const spiderman4 = allContent.find((c) => c.id === 'mcu-spiderman-brand-new-day');
assert(Boolean(spiderman4), 'Inv 13.1. Spider-Man: Brand New Day exists in catalog');
if (spiderman4) {
  assert(spiderman4.release_date === '2026-07-31', `Inv 13.2. Spider-Man 4 release_date === "2026-07-31", got "${spiderman4.release_date}"`);
  assert(spiderman4.theatrical_released === true, 'Inv 13.3. Spider-Man 4 theatrical_released === true');
  assert(isTheatricallyUpcoming(spiderman4) === false, 'Inv 13.4. Spider-Man 4 is NOT upcoming');
  assert(computeOttAvailable(spiderman4) === false, 'Inv 13.5. Spider-Man 4 has no fabricated OTT (computeOttAvailable === false)');
  assert(getLifecycleCategory(spiderman4) === 'THEATRICALLY_RELEASED', `Inv 13.6. Spider-Man 4 category === THEATRICALLY_RELEASED, got "${getLifecycleCategory(spiderman4)}"`);
  const smSidebar = computeCanonicalStatusLabel(spiderman4);
  const smGuide = computePreparationGuideMode(spiderman4);
  assert(smSidebar === 'In Theaters', `Inv 13.7. Spider-Man 4 sidebar shows "In Theaters", got "${smSidebar}"`);
  assert(smGuide === 'THEATRICALLY_RELEASED', `Inv 13.8. Spider-Man 4 guide mode === THEATRICALLY_RELEASED, got "${smGuide}"`);
  assert(smSidebar === 'In Theaters' && smGuide === 'THEATRICALLY_RELEASED', 'Inv 13.9. Spider-Man 4 sidebar and guide agree');
}

const doomsday = allContent.find((c) => c.id === 'mcu-doomsday');
assert(Boolean(doomsday), 'Inv 13.10. Avengers: Doomsday exists in catalog');
if (doomsday) {
  assert(doomsday.release_date === '2026-12-18', `Inv 13.11. Avengers: Doomsday release_date === "2026-12-18", got "${doomsday.release_date}"`);
  assert(doomsday.theatrical_released === false, 'Inv 13.12. Avengers: Doomsday theatrical_released === false');
  assert(isTheatricallyUpcoming(doomsday) === true, 'Inv 13.13. Avengers: Doomsday isTheatricallyUpcoming === true');
  assert(getLifecycleCategory(doomsday) === 'UPCOMING', `Inv 13.14. Avengers: Doomsday category === UPCOMING, got "${getLifecycleCategory(doomsday)}"`);
  assert(getLifecycleCategory(doomsday) !== 'THEATRICALLY_RELEASED', 'Inv 13.15. Avengers: Doomsday is NOT THEATRICALLY_RELEASED');
  assert(getLifecycleCategory(doomsday) !== 'STREAMING_AVAILABLE', 'Inv 13.16. Avengers: Doomsday is NOT STREAMING_AVAILABLE');
  const ddSidebar = computeCanonicalStatusLabel(doomsday);
  const ddGuide = computePreparationGuideMode(doomsday);
  assert(ddSidebar === 'In Production' || ddSidebar === 'Upcoming', `Inv 13.17. Avengers: Doomsday sidebar shows pre-release status, got "${ddSidebar}"`);
  assert(ddGuide === 'UPCOMING', `Inv 13.18. Avengers: Doomsday guide mode === UPCOMING (Pre-Release Story Preparation), got "${ddGuide}"`);
  assert(ddGuide !== 'THEATRICALLY_RELEASED', 'Inv 13.19. Avengers: Doomsday does NOT show Catch-Up Mode');
}

// ========================================================================
// INVARIANT 14: 9 FUTURE-PROOFING SYNTHETIC MATRIX CASES (A-I)
// ========================================================================
const now = new Date();
const yest = new Date(now.getTime() - 86400000).toISOString().split('T')[0]!;
const tom = new Date(now.getTime() + 86400000).toISOString().split('T')[0]!;
const tod = now.toISOString().split('T')[0]!;

// A. release date tomorrow → UPCOMING
const synA = createMock({ release_date: tom, status: 'upcoming', theatrical_released: undefined });
assert(getLifecycleCategory(synA) === 'UPCOMING', 'Inv 14A. release date tomorrow → UPCOMING');
assert(isTheatricallyUpcoming(synA) === true, 'Inv 14A2. release date tomorrow isTheatricallyUpcoming === true');

// B. release date today → correctly released according to canonical boundary rule
const synB = createMock({ release_date: tod, status: 'released', theatrical_released: undefined, streaming_providers: [] });
assert(isTheatricallyUpcoming(synB) === false, 'Inv 14B. release date today isTheatricallyUpcoming === false');
assert(getLifecycleCategory(synB) === 'THEATRICALLY_RELEASED', 'Inv 14B2. release date today category === THEATRICALLY_RELEASED');

// C. release date yesterday → THEATRICALLY_RELEASED if no OTT
const synC = createMock({ release_date: yest, status: 'released', theatrical_released: undefined, streaming_providers: [] });
assert(getLifecycleCategory(synC) === 'THEATRICALLY_RELEASED', 'Inv 14C. release date yesterday (no OTT) → THEATRICALLY_RELEASED');

// D. future date + stale status "released" → UPCOMING
const synD = createMock({ release_date: '2099-05-01', status: 'released', theatrical_released: undefined });
assert(getLifecycleCategory(synD) === 'UPCOMING', 'Inv 14D. future date + stale status "released" → UPCOMING');

// E. future date + stale status "in_production" → UPCOMING
const synE = createMock({ release_date: '2099-05-01', status: 'in_production', theatrical_released: undefined });
assert(getLifecycleCategory(synE) === 'UPCOMING', 'Inv 14E. future date + stale status "in_production" → UPCOMING');

// F. past date + status "in_production" → UPCOMING (unreleased status takes precedence over stale date)
const synF = createMock({ release_date: '2024-01-01', status: 'in_production', theatrical_released: undefined, streaming_providers: [] });
assert(getLifecycleCategory(synF) === 'UPCOMING', 'Inv 14F. past date + status "in_production" → UPCOMING');

// G. future date + provider metadata → must NOT automatically become streaming
const synG = createMock({
  release_date: '2099-05-01',
  status: 'upcoming',
  theatrical_released: false,
  digital_available: false,
  subscription_streaming_available: false,
  streaming_providers: [{ id: 'p1', content_id: 'm1', provider_name: 'Disney+', provider_logo: '', url: '#', country: 'US' }],
});
assert(getLifecycleCategory(synG) === 'UPCOMING', 'Inv 14G. future date + provider metadata → UPCOMING (not streaming)');
assert(computeOttAvailable(synG) === false, 'Inv 14G2. future date + provider metadata computeOttAvailable === false');

// H. past date + verified OTT → STREAMING_AVAILABLE
const synH = createMock({ release_date: '2024-01-01', status: 'released', theatrical_released: true, subscription_streaming_available: true });
assert(getLifecycleCategory(synH) === 'STREAMING_AVAILABLE', 'Inv 14H. past date + verified OTT → STREAMING_AVAILABLE');

// I. past date + no OTT → THEATRICALLY_RELEASED
const synI = createMock({ release_date: '2024-01-01', status: 'released', theatrical_released: true, digital_available: false, subscription_streaming_available: false, streaming_providers: [] });
assert(getLifecycleCategory(synI) === 'THEATRICALLY_RELEASED', 'Inv 14I. past date + no OTT → THEATRICALLY_RELEASED');

console.log(`\n========================================================================`);
console.log(`  CANONICAL LIFECYCLE TEST SUITE: ${testFailures === 0 ? '✅ ALL INVARIANTS PASSED' : `❌ ${testFailures} FAILURES DETECTED`}`);
console.log(`========================================================================\n`);

declare const process: { exit: (code: number) => void };
if (testFailures > 0 && typeof process !== 'undefined') {
  process.exit(1);
}
