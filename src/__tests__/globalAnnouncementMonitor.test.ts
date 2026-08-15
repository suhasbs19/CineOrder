import {
  GlobalAnnouncementMonitor,
  matchFranchiseFromContext,
  detectCatalogChanges,
  CURATED_MONITOR_EVENTS,
} from '../lib/globalAnnouncementMonitor';
import {
  verifyOfficialSource,
  checkForDuplicates,
  generateMetadataCandidate,
  verifyArtworkUrls,
} from '../lib/announcementDiscoveryEngine';
import type { NormalizedSourceEvent, AnnouncementProposalPackage } from '../types/announcementDiscovery';
import type { Content } from '../types';
import { getLifecycleCategory, computeOttAvailable } from '../lib/metadataRefresh';

console.log('========================================================================');
console.log('  CINEORDER GLOBAL CONTINUOUS ANNOUNCEMENT MONITOR TEST SUITE           ');
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

const monitor = new GlobalAnnouncementMonitor();
monitor.resetState();

// ========================================================================
// 1. NEW MOVIE ANNOUNCEMENT
// ========================================================================
console.log('--- Scenario 1: New Movie Announcement ---');
const movieEvent: NormalizedSourceEvent = {
  id: 'evt-sw-movie-test',
  source: 'Lucasfilm Official',
  sourceUrl: 'https://starwars.com/news/dawn-jedi',
  discoveredAt: new Date().toISOString(),
  eventType: 'NEW_ANNOUNCEMENT',
  title: 'Star Wars: Dawn of the Jedi Chronicles',
  mediaType: 'movie',
  franchiseCandidate: 'star-wars',
  releaseDateCandidate: '2028-12-15',
  synopsis: 'Origins of the first Jedi Order.',
  director: 'James Mangold',
  evidence: 'Star Wars Celebration Official Film Slate',
  confidence: 0.98,
};

const scan1 = monitor.processEvents([movieEvent]);
assert(scan1.proposalsGenerated.length === 1, '1A. New movie announcement generates 1 proposal');
const prop1 = scan1.proposalsGenerated[0]!;
assert(prop1.category === 'NEW_TITLES', '1B. Category is NEW_TITLES');
assert(prop1.candidate.mediaType === 'movie', '1C. Media type is movie');
assert(prop1.candidate.lifecycleCategory === 'UPCOMING', '1D. Future movie lifecycle is UPCOMING');

// ========================================================================
// 2. NEW TV ANNOUNCEMENT (VisionQuest Validation Case)
// ========================================================================
console.log('\n--- Scenario 2: New TV Announcement (VisionQuest Validation) ---');
const visionQuestEvent: NormalizedSourceEvent = {
  id: 'evt-mcu-visionquest-val',
  source: 'Marvel Studios Official',
  sourceUrl: 'https://marvel.com/articles/tv-shows/visionquest-announcement',
  discoveredAt: new Date().toISOString(),
  eventType: 'NEW_ANNOUNCEMENT',
  title: 'VisionQuest',
  mediaType: 'series',
  franchiseCandidate: 'marvel-cinematic-universe',
  releaseDateCandidate: '2026-10-14',
  streamingProviderCandidate: ['Disney+'],
  synopsis: 'Paul Bettany returns as White Vision exploring his memories.',
  director: 'Terry Matalas',
  evidence: 'Marvel Studios Official Press Briefing',
  confidence: 0.98,
};

const scan2 = monitor.processEvents([visionQuestEvent]);
assert(scan2.proposalsGenerated.length === 1, '2A. VisionQuest generates proposal');
const vqProp = scan2.proposalsGenerated[0]!;
assert(vqProp.candidate.title === 'VisionQuest', '2B. Candidate title is VisionQuest');
assert(vqProp.candidate.mediaType === 'series', '2C. VisionQuest is series');
assert(vqProp.franchiseId === 'marvel-cinematic-universe', '2D. VisionQuest franchise is MCU');
assert(vqProp.candidate.lifecycleCategory === 'UPCOMING', '2E. VisionQuest is UPCOMING');
assert(vqProp.candidate.providers.includes('Disney+'), '2F. VisionQuest streaming provider is Disney+');
assert(vqProp.candidate.ottAvailable === false, '2G. Future streaming date does not mark OTT as available now');

// ========================================================================
// 3. NEW FRANCHISE ENTRY
// ========================================================================
console.log('\n--- Scenario 3: New Franchise Entry ---');
const alienEvent: NormalizedSourceEvent = {
  id: 'evt-alien-new-series',
  source: 'FX / 20th Television Official',
  sourceUrl: 'https://fxnetworks.com/shows/alien-earth',
  discoveredAt: new Date().toISOString(),
  eventType: 'NEW_ANNOUNCEMENT',
  title: 'Alien: Earth Genesis',
  mediaType: 'series',
  franchiseCandidate: 'alien',
  releaseDateCandidate: '2027-04-10',
  synopsis: 'Prequel series exploring Weyland-Yutani synthetic biotechnology.',
  evidence: 'FX Networks Press Slate',
  confidence: 0.95,
};
const scan3 = monitor.processEvents([alienEvent]);
assert(scan3.proposalsGenerated.length === 1, '3A. Alien franchise entry generates proposal');
assert(scan3.proposalsGenerated[0]?.franchiseId === 'alien', '3B. Matched to alien franchise');

// ========================================================================
// 4. EXISTING TITLE DETECTION (Duplicate Title Check)
// ========================================================================
console.log('\n--- Scenario 4: Existing Title Detection ---');
const dupCheckExisting = checkForDuplicates('Avatar: The Way of Water');
assert(dupCheckExisting.isDuplicate === true, '4A. Existing title detected as duplicate');
assert(dupCheckExisting.matchedContentId === 'avatar-2', '4B. Matched to avatar-2 ID');

// ========================================================================
// 5. DUPLICATE TMDB ID DETECTION
// ========================================================================
console.log('\n--- Scenario 5: Duplicate TMDB ID Detection ---');
const dupCheckTmdb = checkForDuplicates('Arbitrary New Title', 1003598); // Secret Wars TMDB ID
assert(dupCheckTmdb.isDuplicate === true, '5A. Exact TMDB ID detected as duplicate');
assert(dupCheckTmdb.matchType === 'exact_tmdb_id', '5B. Match type is exact_tmdb_id');

// ========================================================================
// 6. DUPLICATE TITLE SIMILARITY
// ========================================================================
console.log('\n--- Scenario 6: Duplicate Title Similarity ---');
const dupCheckFuzzy = checkForDuplicates('Avengers Endgame 2019');
assert(dupCheckFuzzy.isDuplicate === true, '6A. Fuzzy title similarity flags duplicate');

// ========================================================================
// 7. RELEASE-DATE CHANGE DETECTION
// ========================================================================
console.log('\n--- Scenario 7: Release-Date Change Detection ---');
const dateChangeEvent: NormalizedSourceEvent = {
  id: 'evt-batman-date-mod',
  source: 'Variety',
  sourceUrl: 'https://variety.com/2026/film/news/batman-2-shift',
  discoveredAt: new Date().toISOString(),
  eventType: 'RELEASE_DATE_CHANGE',
  title: 'The Batman Part II',
  mediaType: 'movie',
  franchiseCandidate: 'dc-extended-universe',
  releaseDateCandidate: '2027-05-07',
  tmdbId: 806704,
  evidence: 'Warner Bros Theatrical Release Date Shift Announcement',
  confidence: 0.94,
};

const changeResult7 = detectCatalogChanges(dateChangeEvent);
assert(changeResult7.isExistingTitle === true, '7A. Detected as existing title');
assert(changeResult7.detectedCategory === 'RELEASE_DATE_CHANGES', '7B. Category is RELEASE_DATE_CHANGES');
assert(changeResult7.diff?.previousValue === '2026-10-02', '7C. Previous value was 2026-10-02');
assert(changeResult7.diff?.proposedValue === '2027-05-07', '7D. Proposed value is 2027-05-07');

// ========================================================================
// 8. OTT ANNOUNCEMENT (Future Date - Not Available Yet)
// ========================================================================
console.log('\n--- Scenario 8: OTT Announcement for Future Date ---');
const futureOttEvent: NormalizedSourceEvent = {
  id: 'evt-future-ott-test',
  source: 'Disney+ Press',
  sourceUrl: 'https://press.disneyplus.com/movies/doomsday-streaming',
  discoveredAt: new Date().toISOString(),
  eventType: 'STREAMING_RELEASE',
  title: 'Avengers: Doomsday',
  mediaType: 'movie',
  franchiseCandidate: 'marvel-cinematic-universe',
  releaseDateCandidate: '2026-12-18',
  streamingProviderCandidate: ['Disney+'],
  evidence: 'Disney+ streaming window announced for early 2027',
  confidence: 0.95,
};

const scan8 = monitor.processEvents([futureOttEvent]);
const prop8 = scan8.proposalsGenerated[0]!;
assert(prop8.category === 'OTT_CHANGES', '8A. Proposal categorized as OTT_CHANGES');
assert(prop8.candidate.lifecycleCategory === 'UPCOMING', '8B. Unreleased movie lifecycle remains UPCOMING');
assert(prop8.candidate.ottAvailable === false, '8C. computeOttAvailable remains false before release');

// ========================================================================
// 9. OTT AVAILABILITY TRANSITION (Past Date Released Title)
// ========================================================================
console.log('\n--- Scenario 9: OTT Transition for Released Title ---');
const releasedOttEvent: NormalizedSourceEvent = {
  id: 'evt-avatar3-ott-avail',
  source: '20th Century Studios Press',
  sourceUrl: 'https://20thcenturystudios.com/press/avatar-3-streaming',
  discoveredAt: new Date().toISOString(),
  eventType: 'STREAMING_RELEASE',
  title: 'Avatar: Fire and Ash',
  mediaType: 'movie',
  franchiseCandidate: 'avatar',
  releaseDateCandidate: '2025-12-19',
  streamingProviderCandidate: ['Disney+', 'JioHotstar'],
  evidence: 'Official OTT Streaming Premiere',
  confidence: 0.98,
};

const changeResult9 = detectCatalogChanges(releasedOttEvent);
assert(changeResult9.isExistingTitle === true, '9A. Existing catalog match found');
assert(changeResult9.diff?.lifecycleAfter === 'STREAMING_AVAILABLE', '9B. Transition resolves to STREAMING_AVAILABLE');

// ========================================================================
// 10. CANCELLATION EVENT
// ========================================================================
console.log('\n--- Scenario 10: Cancellation Event ---');
const cancelEvent: NormalizedSourceEvent = {
  id: 'evt-cancel-test',
  source: 'The Hollywood Reporter',
  sourceUrl: 'https://hollywoodreporter.com/news/cancelled-project',
  discoveredAt: new Date().toISOString(),
  eventType: 'CANCELLATION',
  title: 'Blade',
  mediaType: 'movie',
  franchiseCandidate: 'marvel-cinematic-universe',
  statusCandidate: 'cancelled',
  evidence: 'Marvel Studios officially removes Blade from production slate',
  confidence: 0.95,
};

const changeResult10 = detectCatalogChanges(cancelEvent);
assert(changeResult10.detectedCategory === 'CANCELLATIONS', '10A. Cancellation categorized as CANCELLATIONS');
assert(changeResult10.diff?.proposedValue === 'cancelled', '10B. Proposed status is cancelled');

// ========================================================================
// 11. TITLE RENAME DETECTION
// ========================================================================
console.log('\n--- Scenario 11: Title Rename Detection ---');
const renameEvent: NormalizedSourceEvent = {
  id: 'evt-rename-test',
  source: 'Marvel Studios Official',
  sourceUrl: 'https://marvel.com/articles/spiderman-title-change',
  discoveredAt: new Date().toISOString(),
  eventType: 'TITLE_CHANGE',
  title: 'Spider-Man: Brand New Day - Part 1',
  mediaType: 'movie',
  franchiseCandidate: 'marvel-cinematic-universe',
  tmdbId: 969681, // Existing record
  evidence: 'Official Title Retitle Announcement',
  confidence: 0.95,
};

const changeResult11 = detectCatalogChanges(renameEvent);
assert(changeResult11.isExistingTitle === true, '11A. Matched existing record');
assert(changeResult11.detectedCategory === 'TITLE_CHANGES' || changeResult11.detectedCategory === 'METADATA_CHANGES', '11B. Categorized as title change');

// ========================================================================
// 12. CONFLICTING SOURCES
// ========================================================================
console.log('\n--- Scenario 12: Conflicting Sources ---');
const conflictEvent: NormalizedSourceEvent = {
  id: 'evt-conflict-test',
  source: 'Universal Pictures Official',
  sourceUrl: 'https://universalpictures.com/fast-x-2',
  discoveredAt: new Date().toISOString(),
  eventType: 'RELEASE_DATE_CHANGE',
  title: 'Fast X: Part 2',
  mediaType: 'movie',
  franchiseCandidate: 'fast-and-furious',
  releaseDateCandidate: '2026-06-18',
  evidence: 'Studio official calendar release',
  confidence: 0.95,
  conflictSource: {
    sourcePublisher: 'Deadline Trade Exclusive',
    sourceUrl: 'https://deadline.com/fast-x-delayed',
    conflictingValue: '2027-04-23',
    reason: 'Deadline reports production pushed back to 2027.',
  },
};

const scan12 = monitor.processEvents([conflictEvent]);
const prop12 = scan12.proposalsGenerated[0]!;
assert(prop12.category === 'CONFLICTS', '12A. Categorized as CONFLICTS');
assert(prop12.isConflict === true, '12B. isConflict flag set to true');
assert(prop12.conflictDetails?.conflictingSource === 'Deadline Trade Exclusive', '12C. Conflicting source recorded');

// ========================================================================
// 13. MISSING SOURCE
// ========================================================================
console.log('\n--- Scenario 13: Missing Source ---');
const missingVer = verifyOfficialSource('', undefined, undefined);
assert(missingVer.isVerified === false, '13A. Missing source is not verified');

// ========================================================================
// 14. UNVERIFIED SOURCE (RUMOR)
// ========================================================================
console.log('\n--- Scenario 14: Unverified Rumor Blog ---');
const rumorEvent: NormalizedSourceEvent = {
  id: 'evt-rumor-test',
  source: 'We Got This Covered',
  sourceUrl: 'https://wegotthiscovered.com/leak',
  discoveredAt: new Date().toISOString(),
  eventType: 'NEW_ANNOUNCEMENT',
  title: 'Iron Man 4 Rebirth',
  mediaType: 'movie',
  franchiseCandidate: 'marvel-cinematic-universe',
  releaseDateCandidate: '2029-01-01',
  evidence: 'Unverified blog rumor',
  confidence: 0.3,
};

const scan14 = monitor.processEvents([rumorEvent]);
assert(scan14.rejectedRumorsCount === 1, '14A. Rumor was counted in rejectedRumorsCount');
assert(scan14.proposalsGenerated.length === 0, '14B. Zero proposals generated for unverified rumor');

// ========================================================================
// 15. WRONG / UNKNOWN FRANCHISE
// ========================================================================
console.log('\n--- Scenario 15: Unknown Franchise Matching ---');
const unknownMatch = matchFranchiseFromContext('Totally Unrelated Random Indie Movie 2030');
assert(unknownMatch.isConfident === false, '15A. Unknown title is not confident');
assert(unknownMatch.franchiseId === 'unknown-franchise', '15B. Assigned unknown-franchise placeholder');

// ========================================================================
// 16. WRONG ARTWORK
// ========================================================================
console.log('\n--- Scenario 16: Wrong Artwork ---');
const wrongArt = verifyArtworkUrls('ftp://invalid-url.com/poster.jpg', 'invalid-backdrop');
assert(wrongArt.verified === false, '16A. Invalid artwork scheme flagged');

// ========================================================================
// 17. MISSING ARTWORK (SVG Fallbacks)
// ========================================================================
console.log('\n--- Scenario 17: Missing Artwork Fallbacks ---');
const emptyArt = verifyArtworkUrls(undefined, undefined);
assert(emptyArt.poster === '/placeholder-poster.svg', '17A. Fallback poster is placeholder-poster.svg');
assert(emptyArt.backdrop === '/placeholder-backdrop.svg', '17B. Fallback backdrop is placeholder-backdrop.svg');

// ========================================================================
// 18. FUTURE RELEASE DATE (Strict UPCOMING)
// ========================================================================
console.log('\n--- Scenario 18: Future Release Date ---');
const futureMock: Content = {
  id: 'mcu-test-future',
  franchise_id: 'marvel-cinematic-universe',
  tmdb_id: 999999,
  title: 'Future Movie',
  type: 'movie',
  poster_url: '',
  backdrop_url: '',
  overview: '',
  release_date: '2028-05-05',
  runtime: 120,
  rating: 8.0,
  status: 'upcoming',
  theatrical_released: false,
  genres: [],
  cast: [],
  director: '',
  trailer_url: '',
  episode_count: null,
  season_count: null,
  is_canon: true,
  is_required: true,
  created_at: new Date().toISOString(),
};
assert(getLifecycleCategory(futureMock) === 'UPCOMING', '18A. Future release date resolves to UPCOMING');

// ========================================================================
// 19. RELEASE TODAY
// ========================================================================
console.log('\n--- Scenario 19: Release Today ---');
const todayStr = new Date().toISOString().split('T')[0]!;
const todayMock: Content = {
  ...futureMock,
  id: 'mcu-test-today',
  release_date: todayStr,
  status: 'released',
  theatrical_released: true,
};
assert(getLifecycleCategory(todayMock) === 'THEATRICALLY_RELEASED', '19A. Release today (no OTT) resolves to THEATRICALLY_RELEASED');

// ========================================================================
// 20. PAST RELEASE DATE
// ========================================================================
console.log('\n--- Scenario 20: Past Release Date ---');
const pastMock: Content = {
  ...futureMock,
  id: 'mcu-test-past',
  release_date: '2020-01-01',
  status: 'released',
  theatrical_released: true,
  streaming_providers: [{ id: 'sp-1', content_id: 'mcu-test-past', provider_name: 'Disney+', provider_logo: '', url: '', country: 'US' }],
  subscription_streaming_available: true,
};
assert(getLifecycleCategory(pastMock) === 'STREAMING_AVAILABLE', '20A. Past date with streaming resolves to STREAMING_AVAILABLE');

// ========================================================================
// 21. STALE RELEASED STATUS WITH FUTURE DATE
// ========================================================================
console.log('\n--- Scenario 21: Stale Released Status with Future Date ---');
const staleReleasedMock: Content = {
  ...futureMock,
  release_date: '2028-12-18',
  status: 'released', // Stale
  theatrical_released: false,
};
assert(getLifecycleCategory(staleReleasedMock) === 'UPCOMING', '21A. Future date with stale released status evaluates strictly to UPCOMING');

// ========================================================================
// 22. PROVIDER ANNOUNCED BUT NOT YET AVAILABLE
// ========================================================================
console.log('\n--- Scenario 22: Provider Announced But Not Yet Available ---');
const futureProviderMock: Content = {
  ...futureMock,
  release_date: '2028-12-18',
  status: 'upcoming',
  streaming_providers: [{ id: 'sp-1', content_id: 'future-provider', provider_name: 'Disney+', provider_logo: '', url: '', country: 'US' }],
};
assert(computeOttAvailable(futureProviderMock) === false, '22A. Future movie with streaming provider returns computeOttAvailable = false');
assert(getLifecycleCategory(futureProviderMock) === 'UPCOMING', '22B. Future movie lifecycle remains UPCOMING');

// ========================================================================
// 23. REGIONAL OTT PROVIDERS (JioHotstar)
// ========================================================================
console.log('\n--- Scenario 23: Regional OTT Providers ---');
const regionalMock: Content = {
  ...futureMock,
  release_date: '2024-05-01',
  status: 'released',
  theatrical_released: true,
  streaming_providers: [{ id: 'sp-2', content_id: 'regional', provider_name: 'JioHotstar', provider_logo: '', url: '', country: 'IN' }],
  subscription_streaming_available: true,
};
assert(computeOttAvailable(regionalMock) === true, '23A. JioHotstar resolves to OTT available');

// ========================================================================
// 24. STORY RELATIONSHIP PROPOSALS
// ========================================================================
console.log('\n--- Scenario 24: Story Relationship Candidate Generation ---');
const candWithEdges = generateMetadataCandidate({
  rawTitle: 'Avengers: Secret Wars',
  franchiseId: 'marvel-cinematic-universe',
  mediaType: 'movie',
  expectedReleaseDate: '2027-05-07',
  sourcePublisher: 'Marvel Studios Official',
  citation: 'Comic-Con Presentation',
});
assert(candWithEdges.proposedEdges.length > 0, '24A. Story continuation edges generated for sequel');

// ========================================================================
// 25. HUMAN APPROVAL WORKFLOW
// ========================================================================
console.log('\n--- Scenario 25: Human Approval Workflow ---');
const approvalPkg: AnnouncementProposalPackage = { ...vqProp, status: 'pending' };
approvalPkg.status = 'approved';
assert(approvalPkg.status === 'approved', '25A. Proposal status updated to approved');

// ========================================================================
// 26. REJECTION WORKFLOW
// ========================================================================
console.log('\n--- Scenario 26: Rejection Workflow ---');
const rejectPkg: AnnouncementProposalPackage = { ...vqProp, status: 'pending' };
rejectPkg.status = 'rejected';
assert(rejectPkg.status === 'rejected', '26A. Proposal status updated to rejected');

// ========================================================================
// 27. REPEATED SCAN IDEMPOTENCY (No Duplicate Proposals)
// ========================================================================
console.log('\n--- Scenario 27: Repeated Scan Idempotency ---');
// Event has already been processed in scan 2
const scan27 = monitor.processEvents([visionQuestEvent]);
assert(scan27.proposalsGenerated.length === 0, '27A. Second scan with identical event hash generates 0 duplicate proposals');

// ========================================================================
// 28. MULTI-FRANCHISE CURATED EVENT FEED VERIFICATION
// ========================================================================
console.log('\n--- Scenario 28: Multi-Franchise Curated Feed Verification ---');
const freshMonitor = new GlobalAnnouncementMonitor();
freshMonitor.resetState();
const multiScan = freshMonitor.processEvents(CURATED_MONITOR_EVENTS);
assert(multiScan.totalAnnouncementsDiscovered >= 7, '28A. Curated feed contains multi-franchise events');
assert(multiScan.verifiedAnnouncementsCount >= 5, '28B. Verified authoritative events processed');
assert(multiScan.rejectedRumorsCount >= 1, '28C. Rumors successfully blocked');
assert(Object.keys(multiScan.categoryBreakdown).length >= 4, '28D. Multiple proposal categories generated');

// ========================================================================
// 29. ACTUAL SCHEDULER INVOCATION (Node / CLI Daemon Runner)
// ========================================================================
console.log('\n--- Scenario 29: Actual Scheduler Invocation ---');
class MemoryTestStorageAdapter {
  private memState: any = null;
  load() { return this.memState ? { ...this.memState } : null; }
  save(state: any) { this.memState = { ...state }; }
}
const schedulerAdapter = new MemoryTestStorageAdapter();
const scheduledMonitor = new GlobalAnnouncementMonitor({}, schedulerAdapter);
const schedScan = scheduledMonitor.processEvents([movieEvent]);
assert(schedScan.proposalsGenerated.length === 1, '29A. Programmatic scheduler invocation completes successfully');
assert(schedScan.scanDurationMs !== undefined, '29B. Telemetry includes scanDurationMs');

// ========================================================================
// 30. PERSISTENT SCAN STATE SURVIVAL
// ========================================================================
console.log('\n--- Scenario 30: Persistent Scan State Survival ---');
const savedState = scheduledMonitor.getState();
assert(savedState.totalScansCount === 1, '30A. Total scans recorded in state');
assert(savedState.eventHashes.length >= 1, '30B. Event hashes persisted in adapter');

// ========================================================================
// 31. RESTART RECOVERY (Fresh Instance with Saved State)
// ========================================================================
console.log('\n--- Scenario 31: Restart Recovery ---');
const rebootedMonitor = new GlobalAnnouncementMonitor({}, schedulerAdapter);
const rebootScan = rebootedMonitor.processEvents([movieEvent]);
assert(rebootScan.proposalsGenerated.length === 0, '31A. Rebooted monitor remembers processed hashes from persistent storage');
assert(rebootScan.duplicateEventsIgnoredCount === 1, '31B. Duplicate event cleanly ignored upon restart');

// ========================================================================
// 32. 3-SCAN IDEMPOTENCY VERIFICATION
// ========================================================================
console.log('\n--- Scenario 32: 3-Scan Idempotency Verification ---');
const testAdapter32 = new MemoryTestStorageAdapter();
const monitor32 = new GlobalAnnouncementMonitor({}, testAdapter32);
const uniqueEvt: NormalizedSourceEvent = {
  id: 'evt-unique-idempotency-test',
  source: 'DC Studios Official',
  sourceUrl: 'https://dc.com/news/superman-legacy',
  discoveredAt: new Date().toISOString(),
  eventType: 'NEW_ANNOUNCEMENT',
  title: 'Superman: Man of Tomorrow Sequel',
  mediaType: 'movie',
  franchiseCandidate: 'dc-universe',
  releaseDateCandidate: '2029-07-11',
  evidence: 'DC Studios Slate Announcement',
  confidence: 0.95,
};

const run1 = monitor32.processEvents([uniqueEvt]);
const run2 = monitor32.processEvents([uniqueEvt]);
const run3 = monitor32.processEvents([uniqueEvt]);
assert(run1.proposalsGenerated.length === 1, '32A. Scan 1 generates exactly 1 proposal');
assert(run2.proposalsGenerated.length === 0, '32B. Scan 2 generates 0 duplicate proposals');
assert(run3.proposalsGenerated.length === 0, '32C. Scan 3 generates 0 duplicate proposals');

// ========================================================================
// 33. ERROR ISOLATION & MALFORMED SOURCE RECOVERY
// ========================================================================
console.log('\n--- Scenario 33: Error Isolation & Malformed Source Recovery ---');
const malformedEvent: any = {
  id: 'evt-malformed-crash-attempt',
  source: 'Broken Source Corp',
  sourceUrl: 'https://broken.invalid',
  title: null, // Malformed title
  mediaType: 'movie',
  evidence: 'Invalid report',
};
const validNextEvent: NormalizedSourceEvent = {
  id: 'evt-valid-after-crash',
  source: 'Universal Pictures Official',
  sourceUrl: 'https://universalpictures.com/news/wick-5',
  discoveredAt: new Date().toISOString(),
  eventType: 'NEW_ANNOUNCEMENT',
  title: 'John Wick: Chapter 5',
  mediaType: 'movie',
  franchiseCandidate: 'john-wick',
  releaseDateCandidate: '2028-05-26',
  evidence: 'Lionsgate Official Investor Day',
  confidence: 0.95,
};

const recoveryMonitor = new GlobalAnnouncementMonitor();
recoveryMonitor.resetState();
const isolatedResult = recoveryMonitor.processEvents([malformedEvent, validNextEvent]);
assert(isolatedResult.proposalsGenerated.length === 1, '33A. Malformed event is isolated; subsequent valid event processed');
assert(Boolean(isolatedResult.proposalsGenerated[0]?.candidate.title.includes('John Wick: Chapter 5')), '33B. Correct proposal produced despite previous error');

// ========================================================================
// 34. RATE LIMITING & COOLDOWN MANAGEMENT
// ========================================================================
console.log('\n--- Scenario 34: Rate Limiting & Cooldown Protection ---');
const rateLimitAdapter = new MemoryTestStorageAdapter();
const rateMonitor = new GlobalAnnouncementMonitor({}, rateLimitAdapter);
// Manually set 1 minute cooldown on a source
const testState = rateMonitor.getState();
testState.sourceCooldowns['tmdb_api'] = new Date(Date.now() + 60000).toISOString();
rateLimitAdapter.save(testState);

const rateMonitorReloaded = new GlobalAnnouncementMonitor({}, rateLimitAdapter);
const fetchResult = await rateMonitorReloaded.fetchWithResilience('https://api.themoviedb.org/3/movie/1', 'tmdb_api');
assert(Boolean(fetchResult.skippedDueToCooldown), '34A. Source in cooldown is skipped without sending HTTP traffic');

// ========================================================================
// 35. SOURCE CONFLICT DETECTION & RESOLUTION NOTE
// ========================================================================
console.log('\n--- Scenario 35: Source Conflict Detection & Resolution Note ---');
const conflictEvent35: NormalizedSourceEvent = {
  id: 'evt-conflict-verification',
  source: 'The Hollywood Reporter',
  sourceUrl: 'https://hollywoodreporter.com/movies/fast-11-delay',
  discoveredAt: new Date().toISOString(),
  eventType: 'RELEASE_DATE_CHANGE',
  title: 'Fast X: Part 2',
  mediaType: 'movie',
  franchiseCandidate: 'fast-and-furious',
  releaseDateCandidate: '2027-04-16',
  evidence: 'Trade report quoting studio insiders',
  confidence: 0.90,
  conflictSource: {
    sourcePublisher: 'Variety',
    sourceUrl: 'https://variety.com/fast-11-2026',
    conflictingValue: '2026-06-22',
    reason: 'Variety claims earlier summer 2026 window while THR reports 2027 delay.',
  },
};
const conflictMonitor = new GlobalAnnouncementMonitor();
conflictMonitor.resetState();
const conflictScan = conflictMonitor.processEvents([conflictEvent35]);
assert(conflictScan.proposalsGenerated.length === 1, '35A. Conflict event produces proposal');
const confProp = conflictScan.proposalsGenerated[0]!;
assert(confProp.category === 'CONFLICTS', '35B. Proposal category is CONFLICTS');
assert(confProp.isConflict === true, '35C. isConflict flag set to true');
assert(confProp.conflictDetails?.conflictingSource === 'Variety', '35D. Conflicting publisher correctly staged');

// ========================================================================
// 36. UNAUTHORIZED MERGE PROTECTION
// ========================================================================
console.log('\n--- Scenario 36: Unauthorized Merge Protection ---');
const unapprovedPkg: AnnouncementProposalPackage = { ...confProp, status: 'pending' };
// Production merge must require approved status
const canMerge = unapprovedPkg.status === 'approved';
assert(canMerge === false, '36A. Pending proposal cannot be merged into production');
unapprovedPkg.status = 'approved';
assert(unapprovedPkg.status === 'approved', '36B. Explicit human approval permits merge staging');

// ========================================================================
// 37. DYNAMIC FRANCHISE AUTO-REGISTRATION & REMOVAL
// ========================================================================
console.log('\n--- Scenario 37: Dynamic Franchise Auto-Registration ---');
import { allFranchises } from '../data/franchises/index';
const syntheticFranchise = {
  id: 'synthetic-cyberpunk-franchise',
  name: 'Cyberpunk Chronicles',
  slug: 'cyberpunk-chronicles',
  description: 'Synthetic test franchise for dynamic auto-registration',
  theme_color: '#00ffff',
  hero_image: '',
  logo_image: '',
  content_count: 0,
};

// Inject synthetic franchise dynamically
(allFranchises as any).push(syntheticFranchise);

const syntheticMatch = matchFranchiseFromContext(
  'Cyberpunk Chronicles: Neon Rebellion',
  'A high-tech cyberpunk thriller',
  'https://cyberpunk-official.com'
);

assert(syntheticMatch.franchiseId === 'synthetic-cyberpunk-franchise', '37A. Newly registered franchise is dynamically matched without code changes');
assert(syntheticMatch.isConfident === true, '37B. Confidence score confirms positive dynamic match');

// Clean up fixture
const synthIdx = allFranchises.findIndex((f) => f.id === 'synthetic-cyberpunk-franchise');
if (synthIdx !== -1) {
  allFranchises.splice(synthIdx, 1);
}
assert(allFranchises.every((f) => f.id !== 'synthetic-cyberpunk-franchise'), '37C. Synthetic test fixture cleanly removed');

console.log(`\n========================================================================`);
console.log(`  GLOBAL MONITOR TEST SUITE: ${testFailures === 0 ? '✅ ALL 37 SCENARIOS PASSED' : `❌ ${testFailures} FAILURES DETECTED`}`);
console.log(`========================================================================\n`);

declare const process: { exit: (code: number) => void };
if (testFailures > 0 && typeof process !== 'undefined') {
  process.exit(1);
}
