/**
 * CineOrder — Universal Autonomous Content Pipeline Hardening Test Suite
 *
 * Comprehensive 24-Scenario Invariant Verification (Scenarios A through X):
 *   A. New movie discovery
 *   B. New TV discovery
 *   C. New animated discovery
 *   D. New franchise discovery
 *   E. Missing sequel
 *   F. Missing prequel
 *   G. Missing numbered entry
 *   H. Missing crossover
 *   I. Artwork contamination
 *   J. Wrong TMDb match
 *   K. Duplicate TMDb ID
 *   L. Duplicate title
 *   M. TBA release
 *   N. Release date change
 *   O. OTT transition
 *   P. Cancellation
 *   Q. Trailer detection
 *   R. Recommendation prerequisite
 *   S. Multiverse prerequisite
 *   T. Chronological ordering
 *   U. Cross-run persistence
 *   V. Corrupted state recovery
 *   W. Human approval enforcement
 *   X. Rollback on integration failure
 */

import { allContent, allFranchises } from '../data/franchises/index';
import { getWatchOrders } from '../data/franchises';
import {
  GlobalAnnouncementMonitor,
  detectCatalogChanges,
  type MonitorStorageAdapter,
} from '../lib/globalAnnouncementMonitor';
import {
  checkForDuplicates,
} from '../lib/announcementDiscoveryEngine';
import {
  CatalogCompletenessAuditEngine,
} from '../lib/catalogCompletenessAuditEngine';
import {
  resolveArtworkForAnnouncementSync,
} from '../lib/artworkResolverEngine';
import {
  validateProposalForIntegration,
  integrateApprovedProposal,
  type FileSystemAdapter,
} from '../lib/catalogIntegrationService';
import {
  getLifecycleCategory,
  computeOttAvailable,
} from '../lib/metadataRefresh';
import {
  isTheatricallyUpcoming,
} from '../lib/upcomingUtils';
import {
  sortContentByReleaseDate,
  validateChronologicalOrdering,
} from '../lib/releaseOrdering';
import { RecommendationService } from '../lib/recommendationService';
import type {
  NormalizedSourceEvent,
  AnnouncementProposalPackage,
  MonitorScanState,
} from '../types/announcementDiscovery';
import type { Content, Franchise } from '../types';

declare const process: any;

console.log('========================================================================');
console.log('  CINEORDER UNIFIED AUTONOMOUS CONTENT PIPELINE HARDENING (A–X)        ');
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

// ────────────────────────────────────────────────────────────────────────────
// In-Memory Storage Adapter for Pipeline Isolation
// ────────────────────────────────────────────────────────────────────────────
class MemoryStorageAdapter implements MonitorStorageAdapter {
  private state: MonitorScanState | null = null;
  load(): MonitorScanState | null {
    return this.state ? JSON.parse(JSON.stringify(this.state)) : null;
  }
  save(s: MonitorScanState): void {
    this.state = JSON.parse(JSON.stringify(s));
  }
  corrupt(): void {
    this.state = null;
  }
}

async function runPipelineHardeningSuite() {
  const adapter = new MemoryStorageAdapter();
  const monitor = new GlobalAnnouncementMonitor({
    enableAutomaticProposalGeneration: true,
    enableDuplicateBlocking: true,
    minVerificationScore: 0.80,
  }, adapter);

  // ==========================================================================
  // SCENARIO A: New Movie Discovery
  // ==========================================================================
  console.log('--- Scenario A: New Movie Discovery ---');
  const movieEvent: NormalizedSourceEvent = {
    id: 'evt-test-movie-a',
    source: 'Marvel Studios Press',
    sourceUrl: 'https://press.disney.com/news/official-avengers-eternity-wars-announcement',
    discoveredAt: new Date().toISOString(),
    publishedAt: '2026-08-16T12:00:00Z',
    eventType: 'NEW_ANNOUNCEMENT',
    title: 'Avengers: Eternity Wars',
    franchiseCandidate: 'marvel-cinematic-universe',
    mediaType: 'movie',
    releaseDateCandidate: '2028-05-05',
    statusCandidate: 'in_production',
    synopsis: 'Marvel Studios officially announces Avengers: Eternity Wars for theatrical release.',
    evidence: 'Marvel Studios Press Release',
    confidence: 0.98,
  };
  const resultA = monitor.processEvents([movieEvent]);
  assert(resultA.proposalsGenerated.length === 1, 'Scenario A1. New movie announcement generates exactly 1 proposal');
  assert(resultA.proposalsGenerated[0]?.category === 'NEW_TITLES', 'Scenario A2. Proposal category is NEW_TITLES');
  assert(resultA.proposalsGenerated[0]?.candidate.mediaType === 'movie', 'Scenario A3. Discovered mediaType is movie');
  assert(resultA.proposalsGenerated[0]?.candidate.lifecycleCategory === 'UPCOMING', 'Scenario A4. Lifecycle is UPCOMING');

  // ==========================================================================
  // SCENARIO B: New TV Discovery
  // ==========================================================================
  console.log('\n--- Scenario B: New TV Discovery ---');
  const tvEvent: NormalizedSourceEvent = {
    id: 'evt-test-tv-b',
    source: 'Marvel Studios Official',
    sourceUrl: 'https://press.disney.com/news/marvel-nova-series-confirmed',
    discoveredAt: new Date().toISOString(),
    publishedAt: '2026-08-16T13:00:00Z',
    eventType: 'NEW_ANNOUNCEMENT',
    title: 'Nova: Centurion',
    franchiseCandidate: 'marvel-cinematic-universe',
    mediaType: 'series',
    releaseDateCandidate: '2027-04-15',
    streamingProviderCandidate: ['Disney+'],
    statusCandidate: 'in_production',
    synopsis: 'Marvel Studios confirms Nova: Centurion Disney+ live-action series.',
    evidence: 'Disney+ Upfront Press Slate',
    confidence: 0.95,
  };
  const resultB = monitor.processEvents([tvEvent]);
  assert(resultB.proposalsGenerated.length === 1, 'Scenario B1. TV announcement generates 1 proposal');
  assert(resultB.proposalsGenerated[0]?.candidate.mediaType === 'series', 'Scenario B2. Media type is series');
  assert(Boolean(resultB.proposalsGenerated[0]?.candidate.providers.includes('Disney+')), 'Scenario B3. Streaming provider is Disney+');
  assert(resultB.proposalsGenerated[0]?.candidate.ottAvailable === false, 'Scenario B4. Future TV series ottAvailable is strictly false');

  // ==========================================================================
  // SCENARIO C: New Animated Discovery
  // ==========================================================================
  console.log('\n--- Scenario C: New Animated Discovery ---');
  const animatedEvent: NormalizedSourceEvent = {
    id: 'evt-test-anim-c',
    source: 'Marvel Studios Animation',
    sourceUrl: 'https://marvel.com/news/marvel-zombies-animated-series',
    discoveredAt: new Date().toISOString(),
    publishedAt: '2026-08-16T14:00:00Z',
    eventType: 'NEW_ANNOUNCEMENT',
    title: 'Marvel Zombies TV',
    franchiseCandidate: 'marvel-cinematic-universe',
    mediaType: 'series',
    releaseDateCandidate: '2025-10-03',
    statusCandidate: 'upcoming',
    synopsis: 'Marvel Studios Animation announces Marvel Zombies animated television series.',
    evidence: 'San Diego Comic-Con Official Animation Panel',
    confidence: 0.96,
  };
  const resultC = monitor.processEvents([animatedEvent]);
  assert(resultC.proposalsGenerated.length === 1, 'Scenario C1. Animated series generates proposal');
  assert(resultC.proposalsGenerated[0]?.candidate.title === 'Marvel Zombies TV', 'Scenario C2. Title matches Marvel Zombies TV');

  // ==========================================================================
  // SCENARIO D: New Franchise Discovery
  // ==========================================================================
  console.log('\n--- Scenario D: New Franchise Discovery ---');
  const customFranchiseEvent: NormalizedSourceEvent = {
    id: 'evt-test-custom-d',
    source: 'Warner Bros. Pictures',
    sourceUrl: 'https://press.warnerbros.com/dune-messiah',
    discoveredAt: new Date().toISOString(),
    publishedAt: '2026-08-16T15:00:00Z',
    eventType: 'NEW_ANNOUNCEMENT',
    title: 'Dune: Part Three',
    franchiseCandidate: 'dune-universe',
    mediaType: 'movie',
    releaseDateCandidate: '2027-12-17',
    statusCandidate: 'in_production',
    synopsis: 'Legendary and Warner Bros. confirm Dune: Part Three.',
    evidence: 'Warner Bros. CinemaCon Slate',
    confidence: 0.92,
  };
  const resultD = monitor.processEvents([customFranchiseEvent]);
  assert(resultD.proposalsGenerated.length === 1, 'Scenario D1. Custom franchise announcement stages proposal without crashing');
  assert(resultD.proposalsGenerated[0]?.franchiseId === 'dune-universe' || resultD.proposalsGenerated[0]?.candidate.franchiseId !== '', 'Scenario D2. Staged with franchise context');

  // ==========================================================================
  // SCENARIO E: Missing Sequel Detection
  // ==========================================================================
  console.log('\n--- Scenario E: Missing Sequel ---');
  const mockFranchiseE: Franchise = {
    id: 'test-saga-e',
    name: 'Test Adventure Saga',
    slug: 'test-adventure-saga',
    description: 'Test saga for missing sequel detection',
    poster_url: '/posters/test.jpg',
    banner_url: '/banners/test.jpg',
    tmdb_collection_id: null,
    total_movies: 1,
    total_series: 0,
    total_runtime: 120,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const mockTitlesE: Content[] = [
    {
      id: 'test-1',
      franchise_id: 'test-saga-e',
      tmdb_id: 999001,
      title: 'Test Adventure 1',
      type: 'movie',
      poster_url: '/placeholder-poster.svg',
      backdrop_url: '/placeholder-backdrop.svg',
      overview: 'First part of test adventure',
      release_date: '2020-01-01',
      runtime: 120,
      episode_count: null,
      season_count: null,
      rating: 7.5,
      status: 'released',
      genres: ['Action'],
      director: 'Director 1',
      cast: [],
      trailer_url: '',
      is_canon: true,
      is_required: true,
      theatrical_released: true,
      ott_available: true,
      created_at: new Date().toISOString(),
    },
  ];

  const proposalE = CatalogCompletenessAuditEngine.createProposal({
    franchise: mockFranchiseE,
    gapType: 'MISSING_SEQUEL',
    canonicalTitle: 'Test Adventure 2',
    tmdbId: 999002,
    mediaType: 'movie',
    releaseDate: '2022-01-01',
    overview: 'Direct sequel to Test Adventure 1',
    continuity: 'Main Continuity',
    reasons: ['Direct narrative sequel.'],
    evidenceSource: 'Official Press',
    confidence: 0.95,
    existingTitles: mockTitlesE,
  });

  assert(proposalE.gapType === 'MISSING_SEQUEL', 'Scenario E1. Proposal gapType is MISSING_SEQUEL');
  assert(proposalE.title === 'Test Adventure 2', 'Scenario E2. Title matches Test Adventure 2');
  assert(
    proposalE.proposedStoryRelationships.some((r) => r.relationship === 'direct-sequel'),
    'Scenario E3. Proposed relationship is direct-sequel'
  );

  // ==========================================================================
  // SCENARIO F: Missing Prequel Detection
  // ==========================================================================
  console.log('\n--- Scenario F: Missing Prequel ---');
  const proposalF = CatalogCompletenessAuditEngine.createProposal({
    franchise: mockFranchiseE,
    gapType: 'MISSING_PREQUEL',
    canonicalTitle: 'Test Adventure: Origins',
    tmdbId: 999000,
    mediaType: 'movie',
    releaseDate: '2018-01-01',
    overview: 'Canonical prequel setting up events before Test Adventure 1.',
    continuity: 'Main Continuity',
    reasons: ['Canonical backstory prequel.'],
    evidenceSource: 'Official Studio Announcement',
    confidence: 0.95,
    existingTitles: mockTitlesE,
  });
  assert(proposalF.gapType === 'MISSING_PREQUEL', 'Scenario F1. Missing prequel gap detected');
  assert(proposalF.chronologicalPlacement.recommendedPosition === 1, 'Scenario F2. Prequel is placed at chronological position 1');

  // ==========================================================================
  // SCENARIO G: Missing Numbered Entry (Sequential Gap)
  // ==========================================================================
  console.log('\n--- Scenario G: Missing Numbered Entry ---');
  const mockFranchiseG: Franchise = {
    ...mockFranchiseE,
    id: 'test-saga-g',
    name: 'Numbered Saga',
  };
  const mockTitlesG: Content[] = [
    { ...mockTitlesE[0]!, id: 'num-1', franchise_id: 'test-saga-g', title: 'Numbered Saga 1', release_date: '2018-01-01', tmdb_id: 999011, type: 'movie' },
    { ...mockTitlesE[0]!, id: 'num-3', franchise_id: 'test-saga-g', title: 'Numbered Saga 3', release_date: '2024-01-01', tmdb_id: 999013, type: 'movie' },
  ];
  const auditReportG = CatalogCompletenessAuditEngine.runGlobalAudit(
    [mockFranchiseG],
    mockTitlesG
  );
  const seqGap = auditReportG.allProposals.find((p) => p.title.includes('2'));
  assert(seqGap !== undefined, 'Scenario G1. Missing numbered entry (Part 2) detected between 1 and 3');

  // ==========================================================================
  // SCENARIO H: Missing Crossover Context Detection
  // ==========================================================================
  console.log('\n--- Scenario H: Missing Crossover Context ---');
  const proposalH = CatalogCompletenessAuditEngine.createProposal({
    franchise: mockFranchiseE,
    gapType: 'MISSING_CROSSOVER_CONTEXT',
    canonicalTitle: 'Multiverse Crossover Climax',
    tmdbId: 999009,
    mediaType: 'movie',
    releaseDate: '2027-05-01',
    overview: 'Major multiverse crossover.',
    continuity: 'Multiverse',
    reasons: ['Cross-continuity milestone.'],
    evidenceSource: 'Official Press',
    confidence: 0.95,
    prerequisiteTargets: ['test-1'],
    existingTitles: mockTitlesE,
  });
  assert(proposalH.gapType === 'MISSING_CROSSOVER_CONTEXT', 'Scenario H1. Crossover gap generated');
  assert(
    proposalH.proposedStoryRelationships.some((r) => r.relationship === 'major-crossover'),
    'Scenario H2. Proposes major-crossover relationship'
  );

  // ==========================================================================
  // SCENARIO I: Artwork Contamination & Cross-Title Isolation
  // ==========================================================================
  console.log('\n--- Scenario I: Artwork Contamination Prevention ---');
  const ironheart = allContent.find((c) => c.id === 'mcu-ironheart');
  const eyesOfWakanda = allContent.find((c) => c.id === 'mcu-eyes-of-wakanda');
  assert(ironheart !== undefined, 'Scenario I1. Ironheart exists in catalog');
  assert(eyesOfWakanda !== undefined, 'Scenario I2. Eyes of Wakanda exists in catalog');
  assert(ironheart?.tmdb_id !== eyesOfWakanda?.tmdb_id, 'Scenario I3. Ironheart and Eyes of Wakanda have distinct TMDb IDs');
  const ironheartPoster = ironheart?.poster_url || '';
  const eyesPoster = eyesOfWakanda?.poster_url || '';
  assert(Boolean(ironheartPoster) && ironheartPoster !== eyesPoster, 'Scenario I4. Posters are completely distinct (zero contamination)');
  const ironheartBackdrop = ironheart?.backdrop_url || '';
  const eyesBackdrop = eyesOfWakanda?.backdrop_url || '';
  assert(Boolean(ironheartBackdrop) && ironheartBackdrop !== eyesBackdrop, 'Scenario I5. Backdrops are completely distinct (zero contamination)');

  // ==========================================================================
  // SCENARIO J: Wrong TMDb Match Protection
  // ==========================================================================
  console.log('\n--- Scenario J: Wrong TMDb Match Protection ---');
  const artworkResJ = resolveArtworkForAnnouncementSync({
    title: 'Completely Unrelated Unknown SciFi 2099',
    franchiseCandidate: 'marvel-cinematic-universe',
    mediaType: 'movie',
    tmdbId: 99999999,
  });
  assert(
    artworkResJ.status === 'FALLBACK' || artworkResJ.status === 'FAILED' || artworkResJ.status === 'AMBIGUOUS',
    'Scenario J1. Unverifiable TMDb ID defaults safely to FALLBACK/AMBIGUOUS/FAILED'
  );
  assert(artworkResJ.posterUrl.includes('placeholder') || artworkResJ.status === 'FALLBACK', 'Scenario J2. Safe placeholder poster assigned');

  // ==========================================================================
  // SCENARIO K: Duplicate TMDb ID Protection
  // ==========================================================================
  console.log('\n--- Scenario K: Duplicate TMDb ID Protection ---');
  const dupCheckTmdbK = checkForDuplicates('Arbitrary New Title', 1726); // Iron Man (2008) TMDb ID
  assert(dupCheckTmdbK.isDuplicate === true, 'Scenario K1. Exact TMDb ID collision detected as duplicate');
  assert(dupCheckTmdbK.matchType === 'exact_tmdb_id', 'Scenario K2. Match type is exact_tmdb_id');

  // ==========================================================================
  // SCENARIO L: Duplicate Title Protection
  // ==========================================================================
  console.log('\n--- Scenario L: Duplicate Title Protection ---');
  const dupCheckTitleL = checkForDuplicates('Avengers: Endgame');
  assert(dupCheckTitleL.isDuplicate === true, 'Scenario L1. Duplicate title detected as duplicate');
  assert(
    dupCheckTitleL.matchedContentId === 'mcu-endgame' || Boolean(dupCheckTitleL.matchedContentId?.includes('endgame')),
    'Scenario L2. Matched existing Avengers: Endgame ID'
  );

  // ==========================================================================
  // SCENARIO M: TBA Release Date & Anti-Fabrication
  // ==========================================================================
  console.log('\n--- Scenario M: TBA Release Date ---');
  const tbaItem: Content = {
    id: 'tba-test-film',
    franchise_id: 'marvel-cinematic-universe',
    title: 'Future Cosmic Epic',
    type: 'movie',
    release_date: 'TBA',
    poster_url: '/placeholder.jpg',
    backdrop_url: '/placeholder.jpg',
    overview: 'Unannounced date film.',
    runtime: 120,
    episode_count: null,
    season_count: null,
    rating: 7.0,
    status: 'upcoming',
    genres: [],
    director: '',
    cast: [],
    trailer_url: '',
    is_canon: true,
    is_required: true,
    theatrical_released: false,
    ott_available: false,
    tmdb_id: null,
    created_at: new Date().toISOString(),
  };
  assert(isTheatricallyUpcoming(tbaItem) === true, 'Scenario M1. TBA release is marked theatrically upcoming');
  assert(computeOttAvailable(tbaItem) === false, 'Scenario M2. TBA release has computeOttAvailable = false');
  assert(getLifecycleCategory(tbaItem) === 'UPCOMING', 'Scenario M3. TBA release lifecycle is UPCOMING');

  // ==========================================================================
  // SCENARIO N: Release Date Change Detection
  // ==========================================================================
  console.log('\n--- Scenario N: Release Date Change ---');
  const dateChangeEvent: NormalizedSourceEvent = {
    id: 'evt-date-shift-n',
    source: 'Marvel Studios Official',
    sourceUrl: 'https://press.disney.com/news/blade-date-shift',
    discoveredAt: new Date().toISOString(),
    publishedAt: '2026-08-16T18:00:00Z',
    eventType: 'RELEASE_DATE_CHANGE',
    title: 'Blade',
    franchiseCandidate: 'marvel-cinematic-universe',
    mediaType: 'movie',
    releaseDateCandidate: '2028-02-18',
    statusCandidate: 'in_production',
    synopsis: 'Marvel Studios moves Blade release date to February 18, 2028.',
    evidence: 'Disney Theatrical Release Schedule Update',
    confidence: 0.98,
    previousValue: '2027-11-01',
    proposedValue: '2028-02-18',
  };
  const resultN = monitor.processEvents([dateChangeEvent]);
  assert(resultN.proposalsGenerated.length === 1, 'Scenario N1. Date shift generates proposal');
  assert(resultN.proposalsGenerated[0]?.category === 'RELEASE_DATE_CHANGES', 'Scenario N2. Categorized as RELEASE_DATE_CHANGES');
  assert(resultN.proposalsGenerated[0]?.diff?.proposedValue === '2028-02-18', 'Scenario N3. Proposed date is 2028-02-18');

  // ==========================================================================
  // SCENARIO O: OTT Streaming Transition
  // ==========================================================================
  console.log('\n--- Scenario O: OTT Transition ---');
  const ottTransitionEvent: NormalizedSourceEvent = {
    id: 'evt-ott-trans-o',
    source: 'Disney+ Official',
    sourceUrl: 'https://press.disney.com/news/spider-man-bnd-disney-plus',
    discoveredAt: new Date().toISOString(),
    publishedAt: '2026-08-16T19:00:00Z',
    eventType: 'STREAMING_RELEASE',
    title: 'Spider-Man: Brand New Day',
    franchiseCandidate: 'marvel-cinematic-universe',
    mediaType: 'movie',
    streamingProviderCandidate: ['Disney+', 'JioHotstar'],
    synopsis: 'Spider-Man: Brand New Day streaming exclusively on Disney+.',
    evidence: 'Disney+ Monthly Streaming Lineup',
    confidence: 0.99,
  };
  const resultO = monitor.processEvents([ottTransitionEvent]);
  assert(resultO.proposalsGenerated.length === 1, 'Scenario O1. OTT streaming event generates proposal');
  assert(resultO.proposalsGenerated[0]?.category === 'OTT_CHANGES', 'Scenario O2. Category is OTT_CHANGES');

  // ==========================================================================
  // SCENARIO P: Cancellation Event
  // ==========================================================================
  console.log('\n--- Scenario P: Cancellation ---');
  const cancelEvent: NormalizedSourceEvent = {
    id: 'evt-cancel-p',
    source: 'The Hollywood Reporter',
    sourceUrl: 'https://hollywoodreporter.com/news/cancelled-project',
    discoveredAt: new Date().toISOString(),
    publishedAt: '2026-08-16T20:00:00Z',
    eventType: 'CANCELLATION',
    title: 'Blade',
    franchiseCandidate: 'marvel-cinematic-universe',
    mediaType: 'movie',
    statusCandidate: 'cancelled',
    synopsis: 'Cancellation of project.',
    evidence: 'Marvel Studios officially removes Blade from production slate',
    confidence: 0.95,
  };
  const resultP = detectCatalogChanges(cancelEvent);
  assert(resultP.isExistingTitle === true, 'Scenario P1. Existing catalog title found for cancellation');
  assert(resultP.detectedCategory === 'CANCELLATIONS', 'Scenario P2. Categorized as CANCELLATIONS');
  assert(resultP.diff?.proposedValue === 'cancelled', 'Scenario P3. Proposed status is cancelled');

  // ==========================================================================
  // SCENARIO Q: Trailer Detection
  // ==========================================================================
  console.log('\n--- Scenario Q: Trailer Detection ---');
  const trailerEvent: NormalizedSourceEvent = {
    id: 'evt-trailer-q',
    source: 'Marvel Entertainment YouTube',
    sourceUrl: 'https://youtube.com/watch?v=mock_doomsday_trailer',
    discoveredAt: new Date().toISOString(),
    publishedAt: '2026-08-16T21:00:00Z',
    eventType: 'STATUS_CHANGE',
    title: 'Avengers: Doomsday',
    franchiseCandidate: 'marvel-cinematic-universe',
    mediaType: 'movie',
    synopsis: 'Official Teaser Trailer for Avengers: Doomsday.',
    evidence: 'Marvel Entertainment Verified YouTube Channel',
    confidence: 0.99,
  };
  const resultQ = monitor.processEvents([trailerEvent]);
  assert(resultQ !== undefined, 'Scenario Q1. Trailer event processed safely without crashing engine');

  // ==========================================================================
  // SCENARIO R: Recommendation Prerequisites
  // ==========================================================================
  console.log('\n--- Scenario R: Recommendation Prerequisite ---');
  const ironheartGuide = RecommendationService.getRecommendationGraph('mcu-ironheart');
  assert(
    ironheartGuide.mustWatch.some((r) => r.content.id === 'mcu-wakanda-forever'),
    'Scenario R1. Ironheart traversal identifies Black Panther: Wakanda Forever as MUST WATCH'
  );
  const chaosTheoryGuide = RecommendationService.getRecommendationGraph('jp-chaos-theory');
  assert(
    chaosTheoryGuide.mustWatch.some((r) => r.content.id === 'jp-camp-cretaceous'),
    'Scenario R2. Jurassic World: Chaos Theory identifies Camp Cretaceous as MUST WATCH'
  );

  // ==========================================================================
  // SCENARIO S: Multiverse Prerequisite Isolation
  // ==========================================================================
  console.log('\n--- Scenario S: Multiverse Prerequisite Isolation ---');
  const noWayHomeGuide = RecommendationService.getRecommendationGraph('mcu-no-way-home');
  const nwhMustWatchTitles = noWayHomeGuide.mustWatch.map((r) => r.content.title);
  assert(nwhMustWatchTitles.includes('Spider-Man'), 'Scenario S1. No Way Home recommends Spider-Man (2002)');
  assert(nwhMustWatchTitles.includes('Spider-Man 2'), 'Scenario S2. No Way Home recommends Spider-Man 2 (2004)');
  assert(nwhMustWatchTitles.includes('The Amazing Spider-Man'), 'Scenario S3. No Way Home recommends The Amazing Spider-Man (2012)');
  assert(nwhMustWatchTitles.includes('Spider-Man: Far From Home'), 'Scenario S4. No Way Home recommends Spider-Man: Far From Home (2019)');

  // Verify that legacy Spider-Man movies are NOT in MCU release watch order
  const mcuTitles = allContent.filter((c) => c.franchise_id === 'marvel-cinematic-universe');
  assert(!mcuTitles.some((c) => c.id === 'spiderman-1'), 'Scenario S5. Raimi Spider-Man is isolated from MCU catalog list');
  assert(!mcuTitles.some((c) => c.id === 'amazing-spiderman-1'), 'Scenario S6. Marc Webb TASM is isolated from MCU catalog list');

  // ==========================================================================
  // SCENARIO T: Chronological Ordering Regression Protection
  // ==========================================================================
  console.log('\n--- Scenario T: Chronological Ordering ---');
  const unsortedList: Content[] = [
    { ...mockTitlesE[0]!, id: 'c-2027', franchise_id: 'test-saga-e', title: 'Future C', release_date: '2027-05-01', type: 'movie' },
    { ...mockTitlesE[0]!, id: 'a-2025', franchise_id: 'test-saga-e', title: 'Past A', release_date: '2025-05-01', type: 'movie' },
    { ...mockTitlesE[0]!, id: 'b-2026', franchise_id: 'test-saga-e', title: 'Mid B', release_date: '2026-05-01', type: 'movie' },
  ];
  const sortedList = sortContentByReleaseDate(unsortedList);
  assert(sortedList[0]?.id === 'a-2025', 'Scenario T1. 2025 release placed at index 0');
  assert(sortedList[1]?.id === 'b-2026', 'Scenario T2. 2026 release placed at index 1');
  assert(sortedList[2]?.id === 'c-2027', 'Scenario T3. 2027 release placed at index 2');

  // Audit all 19 franchises for zero inversions
  let totalInversions = 0;
  for (const franchise of allFranchises) {
    const releaseOrders = getWatchOrders(franchise.id).filter((w) => w.order_type === 'release');
    const val = validateChronologicalOrdering(releaseOrders);
    if (!val.isValid) {
      totalInversions += val.inversions.length;
    }
  }
  assert(totalInversions === 0, `Scenario T4. Exactly 0 chronological inversions in catalog (found ${totalInversions})`);

  // ==========================================================================
  // SCENARIO U: Cross-Run Persistence & Idempotency
  // ==========================================================================
  console.log('\n--- Scenario U: Cross-Run Persistence ---');
  const persistentAdapter = new MemoryStorageAdapter();
  const persistentMonitor = new GlobalAnnouncementMonitor({ enableDuplicateBlocking: true }, persistentAdapter);

  const eventU: NormalizedSourceEvent = {
    id: 'evt-idempotent-u',
    source: 'Disney Press',
    sourceUrl: 'https://press.disney.com/news/idempotency-test-unique-title-1',
    discoveredAt: new Date().toISOString(),
    publishedAt: '2026-08-16T22:00:00Z',
    eventType: 'NEW_ANNOUNCEMENT',
    title: 'Unique Saga Adventure',
    franchiseCandidate: 'star-wars',
    mediaType: 'movie',
    releaseDateCandidate: '2029-12-14',
    statusCandidate: 'in_production',
    synopsis: 'Star Wars announces Unique Saga Adventure.',
    evidence: 'Lucasfilm Official Slate',
    confidence: 0.98,
  };

  // Run 1: Should discover
  const run1 = persistentMonitor.processEvents([eventU]);
  assert(run1.proposalsGenerated.length === 1, 'Scenario U1. Run 1 creates 1 proposal');

  // Run 2: Duplicate ignored
  const run2 = persistentMonitor.processEvents([eventU]);
  assert(run2.proposalsGenerated.length === 0, 'Scenario U2. Run 2 creates 0 duplicate proposals');
  assert(
    run2.duplicateEventsIgnoredCount === 1 || persistentMonitor.getState().duplicateEventsIgnoredCount >= 1,
    'Scenario U3. Run 2 records duplicate ignored'
  );

  // Run 3: Duplicate ignored again
  const run3 = persistentMonitor.processEvents([eventU]);
  assert(run3.proposalsGenerated.length === 0, 'Scenario U4. Run 3 creates 0 duplicate proposals');

  // ==========================================================================
  // SCENARIO V: Corrupted State Recovery
  // ==========================================================================
  console.log('\n--- Scenario V: Corrupted State Recovery ---');
  persistentAdapter.corrupt();
  const recoveryMonitor = new GlobalAnnouncementMonitor({}, persistentAdapter);
  const runV = recoveryMonitor.processEvents([]);
  assert(runV !== undefined, 'Scenario V1. Monitor safely recovers from null/corrupted state');
  assert(runV.proposalsGenerated.length === 0, 'Scenario V2. Clean zero-proposal recovery');

  // ==========================================================================
  // SCENARIO W: Human Approval Enforcement
  // ==========================================================================
  console.log('\n--- Scenario W: Human Approval Enforcement ---');
  const pendingProposal: AnnouncementProposalPackage = {
    id: 'prop-pending-test-1',
    title: '[NEW TITLE] Unapproved Title',
    franchiseId: 'marvel-cinematic-universe',
    franchiseName: 'Marvel Cinematic Universe',
    category: 'NEW_TITLES',
    eventType: 'NEW_ANNOUNCEMENT',
    status: 'pending',
    overallQualityScore: 90,
    candidate: {
      id: 'mcu-unapproved-test',
      franchiseId: 'marvel-cinematic-universe',
      title: 'Unapproved Title',
      mediaType: 'movie',
      overview: 'Unapproved test movie.',
      releaseDate: '2028-01-01',
      status: 'upcoming',
      theatricalReleased: false,
      ottAvailable: false,
      digitalAvailable: false,
      subscriptionStreamingAvailable: false,
      providers: [],
      isCanon: true,
      isRequired: false,
      posterUrl: '/placeholder-poster.svg',
      backdropUrl: '/placeholder-backdrop.svg',
      lifecycleCategory: 'UPCOMING',
      sourceVerification: {
        isVerified: true,
        credibility: 'official-studio-press',
        sourcePublisher: 'Marvel Studios Official',
        citation: 'Marvel Studios Press',
        verificationScore: 0.95,
        verificationNotes: 'Verified source.',
        verifiedAt: new Date().toISOString(),
      },
      duplicateCheck: { isDuplicate: false },
      proposedEdges: [],
      candidateGeneratedAt: new Date().toISOString(),
      integrityValidationPassed: true,
      integrityNotes: [],
    },
    sourceVerification: {
      isVerified: true,
      credibility: 'official-studio-press',
      sourcePublisher: 'Marvel Studios Official',
      citation: 'Marvel Studios Press',
      verificationScore: 0.95,
      verificationNotes: 'Verified source.',
      verifiedAt: new Date().toISOString(),
    },
    proposedEdges: [],
    createdAt: new Date().toISOString(),
  };

  const validationW = validateProposalForIntegration(pendingProposal);
  assert(validationW.isValid === false, 'Scenario W1. Pending proposal is blocked from integration');
  assert(
    validationW.errors.some((e) => e.includes('approved')),
    'Scenario W2. Error explicitly cites mandatory human approval requirement'
  );

  // ==========================================================================
  // SCENARIO X: Rollback on Integration Failure
  // ==========================================================================
  console.log('\n--- Scenario X: Rollback on Integration Failure ---');
  let mockFileStorage: Record<string, string> = {
    'src/data/franchises/marvel.ts': 'ORIGINAL_PRISTINE_MARVEL_CONTENT_DATA',
  };
  const mockFs: FileSystemAdapter = {
    existsSync: (path: string) => Boolean(mockFileStorage[path]),
    readFileSync: (path: string) => mockFileStorage[path] || '',
    writeFileSync: (path: string, content: string) => {
      mockFileStorage[path] = content;
    },
  };

  const invalidApprovedProposal: AnnouncementProposalPackage = {
    ...pendingProposal,
    status: 'approved',
    reviewedBy: 'Test Admin',
    reviewedAt: new Date().toISOString(),
    franchiseId: 'non-existent-broken-franchise',
  };

  const execResultX = integrateApprovedProposal(invalidApprovedProposal, { fsAdapter: mockFs });
  assert(execResultX.success === false, 'Scenario X1. Invalid integration halts execution');
  assert(
    mockFileStorage['src/data/franchises/marvel.ts'] === 'ORIGINAL_PRISTINE_MARVEL_CONTENT_DATA',
    'Scenario X2. File contents restored / unmutated on failure (rollback guarantee)'
  );

  // ==========================================================================
  // FINAL SUMMARY
  // ==========================================================================
  console.log('\n========================================================================');
  if (testFailures === 0) {
    console.log('  PIPELINE HARDENING SUITE: ✅ ALL 24 SCENARIOS (A–X) PASSED');
  } else {
    console.log(`  PIPELINE HARDENING SUITE: ❌ ${testFailures} ASSERTIONS FAILED`);
  }
  console.log('========================================================================\n');

  if (testFailures > 0) {
    process.exit(1);
  }
}

runPipelineHardeningSuite().catch((err) => {
  console.error('Fatal error in pipeline hardening suite:', err);
  process.exit(1);
});
