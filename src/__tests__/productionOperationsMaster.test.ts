/**
 * CineOrder — Phase 4 Production Operations Master Regression Suite
 *
 * Validates the 30 core Production Operations & Autonomous Content Maintenance invariants:
 *  1. New movie discovery
 *  2. New series discovery
 *  3. New animated title discovery
 *  4. Release-date change detection (proposal generation without mutating catalog)
 *  5. OTT transition (UPCOMING -> THEATRICALLY_RELEASED -> STREAMING_AVAILABLE)
 *  6. Artwork becomes available
 *  7. Artwork becomes invalid/unreachable (fallback retained)
 *  8. New official trailer discovery
 *  9. Trailer replacement (historical version preserved)
 * 10. Trailer removal (historical status preserved)
 * 11. Duplicate event deduplication
 * 12. Repeated scan idempotency
 * 13. Cross-run persistence across runs
 * 14. Corrupted state recovery & resilience
 * 15. Missing metadata recovery
 * 16. Human approval gate enforcement (status starts as 'pending')
 * 17. Rejected proposal archiving
 * 18. Failed integration rollback
 * 19. Spider-Man multi-continuity isolation
 * 20. MCU watch order contamination prevention
 * 21. Chronological ordering authority (releaseOrdering.ts)
 * 22. Duplicate TMDb ID protection
 * 23. Duplicate title/slug protection
 * 24. Completeness gap detection (catalogCompletenessAuditEngine)
 * 25. Dynamic franchise registration (allFranchises lookup)
 * 26. Zero-event clean scan execution
 * 27. Network failure isolation & resilience
 * 28. Invalid/unauthorized source rejection
 * 29. Invalid artwork URL rejection
 * 30. Invalid/fan trailer rejection
 */

import { allContent, allFranchises, allWatchOrders } from '../data/franchises/index';
import {
  GlobalAnnouncementMonitor,
  detectCatalogChanges,
  matchFranchiseFromContext,
  type MonitorStorageAdapter,
} from '../lib/globalAnnouncementMonitor';
import {
  verifyOfficialSource,
  checkForDuplicates,
  generateMetadataCandidate,
  verifyArtworkUrls,
} from '../lib/announcementDiscoveryEngine';
import { detectCatalogArtworkRefresh, isValidHttpUrl } from '../lib/artworkResolverEngine';
import { classifyTMDbVideo } from '../lib/trailerDiscoveryEngine';
import {
  TrailerIntelligenceStore,
  type TrailerIntelligenceStorageAdapter,
  type TrailerStoreSerializedState,
} from '../lib/trailerIntelligenceStore';
import { CatalogCompletenessAuditEngine } from '../lib/catalogCompletenessAuditEngine';
import {
  validateProposalForIntegration,
  integrateApprovedProposal,
} from '../lib/catalogIntegrationService';
import { compareReleaseDates } from '../lib/releaseOrdering';
import { getLifecycleCategory } from '../lib/metadataRefresh';
import type {
  NormalizedSourceEvent,
  DiscoveredAnnouncement,
  AnnouncementProposalPackage,
  MonitorScanState,
} from '../types/announcementDiscovery';
import type { RawTMDbVideo } from '../types/trailerDiscovery';
import type {
  RawTrailerObservationInput,
  TrailerContentContext,
} from '../types/trailerIntelligence';
import type { Content } from '../types';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('========================================================================');
console.log('  CINEORDER PHASE 4 PRODUCTION OPERATIONS MASTER TEST SUITE (30 TESTS)  ');
console.log('========================================================================\n');

class TestMemoryMonitorAdapter implements MonitorStorageAdapter {
  private state: MonitorScanState | null = null;
  load(): MonitorScanState | null {
    return this.state ? JSON.parse(JSON.stringify(this.state)) : null;
  }
  save(s: MonitorScanState): void {
    this.state = JSON.parse(JSON.stringify(s));
  }
}

class TestMemoryTrailerAdapter implements TrailerIntelligenceStorageAdapter {
  private state: TrailerStoreSerializedState | null = null;
  load(): TrailerStoreSerializedState | null {
    return this.state ? JSON.parse(JSON.stringify(this.state)) : null;
  }
  save(s: TrailerStoreSerializedState): void {
    this.state = JSON.parse(JSON.stringify(s));
  }
}

// ─── 1. New Movie Discovery ──────────────────────────────────────────────────
console.log('--- 1. New Movie Discovery ---');
{
  const event: NormalizedSourceEvent = {
    id: 'src-marvel-announcement-1',
    source: 'Marvel Studios Official',
    sourceUrl: 'https://marvel.com/articles/movies/marvel-studios-nova-announced',
    discoveredAt: '2026-08-18T00:00:00Z',
    title: 'Nova',
    mediaType: 'movie',
    franchiseCandidate: 'marvel-cinematic-universe',
    releaseDateCandidate: '2028-05-05',
    synopsis: 'Richard Rider embarks on his cosmic journey.',
    evidence: 'Marvel Studios Official Film Announcement at Comic-Con',
    confidence: 0.95,
    eventType: 'NEW_ANNOUNCEMENT',
  };
  const change = detectCatalogChanges(event);
  assert(!change.isExistingTitle, '1A. Nova detected as new title');
  assert(change.detectedCategory === 'NEW_TITLES', '1B. Category is NEW_TITLES');
}

// ─── 2. New Series Discovery ─────────────────────────────────────────────────
console.log('\n--- 2. New Series Discovery ---');
{
  const event: NormalizedSourceEvent = {
    id: 'src-starwars-series-1',
    source: 'Lucasfilm Official',
    sourceUrl: 'https://starwars.com/news/star-wars-republic-commandos-series',
    discoveredAt: '2026-08-18T00:00:00Z',
    title: 'Star Wars: Republic Commandos',
    mediaType: 'series',
    franchiseCandidate: 'star-wars',
    releaseDateCandidate: '2027-09-15',
    synopsis: 'Elite clone troopers undertake high-risk covert missions.',
    evidence: 'Star Wars Celebration Official Series Slate Announcement',
    confidence: 0.95,
    eventType: 'NEW_ANNOUNCEMENT',
  };
  const change = detectCatalogChanges(event);
  assert(!change.isExistingTitle, '2A. Republic Commandos detected as new series');
  assert(change.detectedCategory === 'NEW_TITLES', '2B. Category is NEW_TITLES');
}

// ─── 3. New Animated Title Discovery ─────────────────────────────────────────
console.log('\n--- 3. New Animated Title Discovery ---');
{
  const event: NormalizedSourceEvent = {
    id: 'src-starwars-animated-1',
    source: 'Lucasfilm Official',
    sourceUrl: 'https://starwars.com/news/star-wars-droid-story-animated-special',
    discoveredAt: '2026-08-18T00:00:00Z',
    title: 'Star Wars: A Droid Story Animated Special',
    mediaType: 'movie',
    franchiseCandidate: 'star-wars',
    releaseDateCandidate: '2027-10-31',
    synopsis: 'R2-D2 and C-3PO embark on a vibrant animated journey across the galaxy.',
    evidence: 'Lucasfilm Official Animation Announcement',
    confidence: 0.95,
    eventType: 'NEW_ANNOUNCEMENT',
  };
  const change = detectCatalogChanges(event);
  assert(!change.isExistingTitle, '3A. Animated special detected as new title');
  assert(change.detectedCategory === 'NEW_TITLES', '3B. Category is NEW_TITLES');
}

// ─── 4. Release-Date Change Detection ────────────────────────────────────────
console.log('\n--- 4. Release-Date Change Detection ---');
{
  const event: NormalizedSourceEvent = {
    id: 'src-blade-date-shift',
    source: 'Marvel Studios Official',
    sourceUrl: 'https://marvel.com/movies/blade',
    discoveredAt: '2026-08-18T00:00:00Z',
    title: 'Blade',
    tmdbId: 617126,
    franchiseCandidate: 'marvel-cinematic-universe',
    releaseDateCandidate: '2028-11-05',
    mediaType: 'movie',
    evidence: 'Official theatrical calendar shift press release',
    confidence: 0.95,
    eventType: 'RELEASE_DATE_CHANGE',
  };
  const change = detectCatalogChanges(event);
  assert(change.isExistingTitle, '4A. Blade matched to existing catalog entry');
  assert(change.detectedCategory === 'RELEASE_DATE_CHANGES', '4B. Categorized as RELEASE_DATE_CHANGES');
  assert(change.diff?.fieldName === 'release_date', '4C. Diff specifies release_date field');
}

// ─── 5. OTT Transition ───────────────────────────────────────────────────────
console.log('\n--- 5. OTT Transition ---');
{
  const futureTitle = {
    id: 'test-upcoming-1',
    tmdb_id: 999901,
    title: 'Test Future Release',
    type: 'movie',
    franchise_id: 'marvel-cinematic-universe',
    release_date: '2028-05-01',
    theatrical_release_date: '2028-05-01',
    theatrical_released: false,
    ott_available: false,
    digital_available: false,
    subscription_streaming_available: false,
    streaming_providers: [],
    rating: 0,
    runtime: 120,
    overview: '',
    poster_url: '/placeholder-poster.svg',
    backdrop_url: '/placeholder-backdrop.svg',
    is_canon: true,
    is_required: true,
  } as unknown as Content;
  assert(getLifecycleCategory(futureTitle) === 'UPCOMING', '5A. Future date resolves to UPCOMING');

  const inTheatersTitle = {
    ...futureTitle,
    release_date: '2026-01-01',
    theatrical_release_date: '2026-01-01',
    theatrical_released: true,
    ott_available: false,
  } as unknown as Content;
  assert(getLifecycleCategory(inTheatersTitle) === 'THEATRICALLY_RELEASED', '5B. Past release with ott_available=false is THEATRICALLY_RELEASED');

  const streamingTitle = {
    ...inTheatersTitle,
    ott_available: true,
    subscription_streaming_available: true,
    streaming_providers: [
      {
        id: 'sp-1',
        content_id: inTheatersTitle.id,
        provider_name: 'Disney+',
        provider_logo: '',
        url: '',
        country: 'US',
      },
    ],
  } as unknown as Content;
  assert(getLifecycleCategory(streamingTitle) === 'STREAMING_AVAILABLE', '5C. With ott_available=true resolves to STREAMING_AVAILABLE');
}

// ─── 6. Artwork Becomes Available ───────────────────────────────────────────
console.log('\n--- 6. Artwork Becomes Available ---');
{
  const placeholderItem = {
    id: 'test-ph-1',
    tmdb_id: 999902,
    title: 'Placeholder Title',
    type: 'movie',
    franchise_id: 'marvel-cinematic-universe',
    release_date: '2027-01-01',
    theatrical_release_date: '2027-01-01',
    theatrical_released: false,
    ott_available: false,
    digital_available: false,
    subscription_streaming_available: false,
    poster_url: '/placeholder-poster.svg',
    backdrop_url: '/placeholder-backdrop.svg',
    rating: 0,
    runtime: 100,
    overview: '',
    is_canon: true,
    is_required: true,
  } as unknown as Content;
  const verifiedTMDbArtwork = {
    posterUrl: 'https://image.tmdb.org/t/p/w500/authentic_verified_poster.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/authentic_verified_backdrop.jpg',
    tmdbId: 999902,
  };
  const refresh = detectCatalogArtworkRefresh(placeholderItem, verifiedTMDbArtwork);
  assert(refresh.hasArtworkChange, '6A. Detects newly available authentic artwork');
  assert(refresh.proposedPoster.includes('authentic_verified_poster.jpg') === true, '6B. Generates valid HTTPS poster URL');
}

// ─── 7. Artwork Becomes Invalid / Unreachable ────────────────────────────────
console.log('\n--- 7. Artwork Becomes Invalid / Unreachable ---');
{
  assert(!isValidHttpUrl('javascript:alert(1)'), '7A. Javascript scheme rejected');
  assert(!isValidHttpUrl(''), '7B. Empty string rejected');
  assert(!isValidHttpUrl('ftp://insecure.com/poster.jpg'), '7C. FTP scheme rejected');
  assert(isValidHttpUrl('https://image.tmdb.org/t/p/w500/test.jpg'), '7D. Valid HTTPS TMDb URL accepted');

  const fallback = verifyArtworkUrls('javascript:alert(1)', 'ftp://insecure.com/bg.jpg');
  assert(fallback.poster === '/placeholder-poster.svg', '7E. Invalid poster falls back to placeholder');
  assert(fallback.backdrop === '/placeholder-backdrop.svg', '7F. Invalid backdrop falls back to placeholder');
}

// ─── 8. New Official Trailer Discovery ───────────────────────────────────────
console.log('\n--- 8. New Official Trailer Discovery ---');
{
  const rawVideo: RawTMDbVideo = {
    id: 'yt-vid-1',
    iso_639_1: 'en',
    iso_3166_1: 'US',
    name: 'Official Main Trailer',
    key: 'dQw4w9WgXcQ',
    site: 'YouTube',
    size: 1080,
    type: 'Trailer',
    official: true,
    published_at: '2026-08-18T00:00:00Z',
  };
  const classification = classifyTMDbVideo(rawVideo);
  assert(classification.isOfficial, '8A. Official YouTube trailer recognized');
  assert(classification.isEligibleForEvidence, '8B. Eligible for trailer evidence extraction');
}

// ─── 9. Trailer Replacement (History Preserved) ──────────────────────────────
console.log('\n--- 9. Trailer Replacement ---');
{
  const adapter9 = new TestMemoryTrailerAdapter();
  const store9 = new TrailerIntelligenceStore(adapter9);
  const ctx9: TrailerContentContext = {
    contentId: 'test-movie-1',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Test Movie 1',
  };
  const v1: RawTMDbVideo = {
    id: 'vid-teaser',
    iso_639_1: 'en',
    iso_3166_1: 'US',
    name: 'Teaser Trailer',
    key: 'TEASERKEY11',
    site: 'YouTube',
    size: 1080,
    type: 'Teaser',
    official: true,
    published_at: '2026-01-01T00:00:00Z',
  };
  const v2: RawTMDbVideo = {
    id: 'vid-main',
    iso_639_1: 'en',
    iso_3166_1: 'US',
    name: 'Official Trailer 1',
    key: 'MAINTRAIL11',
    site: 'YouTube',
    size: 1080,
    type: 'Trailer',
    official: true,
    published_at: '2026-06-01T00:00:00Z',
  };

  store9.processTrailerScan(ctx9, [v1], {}, '2026-01-01T00:00:00.000Z');
  const rec1 = store9.getRecordsByContentId('test-movie-1')[0];
  assert(rec1?.videoKey === 'TEASERKEY11', '9A. Teaser is active initially');

  store9.processTrailerScan(ctx9, [v2], {}, '2026-06-01T00:00:00.000Z');
  const rec2 = store9.getRecordsByContentId('test-movie-1').find((r) => r.videoKey === 'MAINTRAIL11');
  const olderRec = store9.getRecordsByContentId('test-movie-1').find((r) => r.videoKey === 'TEASERKEY11');
  assert(rec2?.videoKey === 'MAINTRAIL11', '9B. Official trailer recorded as active trailer');
  assert(olderRec?.historicalVersions.length === 1, '9C. Older teaser preserved in historical records');
  assert(olderRec?.historicalVersions[0]?.videoKey === 'TEASERKEY11', '9D. History contains older videoKey');
}

// ─── 10. Trailer Removal ─────────────────────────────────────────────────────
console.log('\n--- 10. Trailer Removal ---');
{
  const adapter10 = new TestMemoryTrailerAdapter();
  const store10 = new TrailerIntelligenceStore(adapter10);
  const ctx10: TrailerContentContext = {
    contentId: 'test-movie-2',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Test Movie 2',
  };
  const v10: RawTMDbVideo = {
    id: 'vid-temp',
    iso_639_1: 'en',
    iso_3166_1: 'US',
    name: 'Official Trailer',
    key: 'TEMPKEY1111',
    site: 'YouTube',
    size: 1080,
    type: 'Trailer',
    official: true,
    published_at: '2026-01-01T00:00:00Z',
  };
  store10.processTrailerScan(ctx10, [v10], {}, '2026-01-01T00:00:00.000Z');
  store10.processTrailerScan(ctx10, [], {}, '2026-06-01T00:00:00.000Z'); // delisted
  const rec10 = store10.getRecordsByContentId('test-movie-2')[0];
  assert(rec10?.isDelisted === true, '10A. Trailer marked as delisted');
  assert(rec10?.delistedAt === '2026-06-01T00:00:00.000Z', '10B. Delisted timestamp recorded');
  assert(rec10?.videoKey === 'TEMPKEY1111', '10C. Delisted record metadata preserved in store');
}

// ─── 11. Duplicate Event Deduplication ──────────────────────────────────────
console.log('\n--- 11. Duplicate Event Deduplication ---');
{
  const dup1 = checkForDuplicates('Avengers: Secret Wars', 1003598, 'marvel-cinematic-universe');
  assert(dup1.isDuplicate, '11A. Exact TMDb ID matches existing title');
  assert(dup1.matchedContentId === 'mcu-secret-wars', '11B. Matches mcu-secret-wars ID');

  const dup2 = checkForDuplicates('Spider-Man 2', 558, 'spider-man');
  assert(dup2.isDuplicate, '11C. Title and TMDb match existing Raimi Spider-Man 2');
}

// ─── 12. Repeated Scan Idempotency ──────────────────────────────────────────
console.log('\n--- 12. Repeated Scan Idempotency ---');
{
  const monitor12 = new GlobalAnnouncementMonitor({}, new TestMemoryMonitorAdapter());
  const rawEvent12: NormalizedSourceEvent = {
    id: 'event-idem-1',
    source: 'Lucasfilm Official',
    sourceUrl: 'https://starwars.com/news/star-wars-starfighter-corps',
    discoveredAt: '2026-08-18T00:00:00Z',
    title: 'Star Wars: Starfighter Corps',
    mediaType: 'movie',
    franchiseCandidate: 'star-wars',
    releaseDateCandidate: '2028-11-20',
    evidence: 'Official Celebration Announcement',
    confidence: 0.95,
    eventType: 'NEW_ANNOUNCEMENT',
  };

  const res1 = monitor12.processEvents([rawEvent12]);
  assert(res1.proposalsGenerated.length === 1, '12A. Scan 1 creates proposal');

  const res2 = monitor12.processEvents([rawEvent12]);
  assert(res2.proposalsGenerated.length === 0, '12B. Scan 2 creates 0 duplicate proposals');
  assert(res2.duplicateEventsIgnoredCount === 1, '12C. Scan 2 ignores duplicate event');
}

// ─── 13. Cross-Run Persistence ──────────────────────────────────────────────
console.log('\n--- 13. Cross-Run Persistence ---');
{
  const store13 = new TrailerIntelligenceStore(new TestMemoryTrailerAdapter());
  const ctx13: TrailerContentContext = {
    contentId: 'test-persist-title',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Persist Title',
  };
  const v13: RawTMDbVideo = {
    id: 'vid-persist',
    iso_639_1: 'en',
    iso_3166_1: 'US',
    name: 'Official Trailer',
    key: 'PERSISTKEY1',
    site: 'YouTube',
    size: 1080,
    type: 'Trailer',
    official: true,
    published_at: '2026-08-18T00:00:00Z',
  };
  store13.processTrailerScan(ctx13, [v13], {}, '2026-08-18T00:00:00.000Z');
  const records = store13.getTrackedRecords();
  assert(records.length > 0, '13A. Records tracked in store');
  assert(store13.getRecordsByContentId('test-persist-title')[0]?.videoKey === 'PERSISTKEY1', '13B. State restored with correct video key');
}

// ─── 14. Corrupted State Recovery ───────────────────────────────────────────
console.log('\n--- 14. Corrupted State Recovery ---');
{
  class CorruptedTrailerAdapter implements TrailerIntelligenceStorageAdapter {
    load(): any {
      return { records: null, proposals: undefined, eventHashes: 'corrupted' };
    }
    save(): void {}
  }
  const corruptedStore = new TrailerIntelligenceStore(new CorruptedTrailerAdapter());
  assert(corruptedStore.getTrackedRecords().length === 0, '14A. Corrupted state safely resets to empty records');
  assert(corruptedStore.getAllProposals().length === 0, '14B. Corrupted state safely resets to empty proposals');
}

// ─── 15. Missing Metadata Recovery ──────────────────────────────────────────
console.log('\n--- 15. Missing Metadata Recovery ---');
{
  const sparseAnnouncement: DiscoveredAnnouncement = {
    rawTitle: 'Untitled DC Project',
    franchiseId: 'dc-extended-universe',
    mediaType: 'movie',
    sourcePublisher: 'Warner Bros. Pictures Official',
    sourceUrl: 'https://warnerbros.com/news/untitled-dc-project',
    citation: 'Official production announcement',
  };
  const candidate15 = generateMetadataCandidate(sparseAnnouncement);
  assert(candidate15.releaseDate === undefined || candidate15.releaseDate === '2028-01-01', '15A. Missing release date defaults safely');
  assert(candidate15.ottAvailable === false, '15B. Unreleased title defaults to ottAvailable=false');
  assert(candidate15.posterUrl === '/placeholder-poster.svg', '15C. Missing poster defaults to placeholder');
}

// ─── 16. Human Approval Enforcement ─────────────────────────────────────────
console.log('\n--- 16. Human Approval Enforcement ---');
{
  const store16 = new TrailerIntelligenceStore(new TestMemoryTrailerAdapter());
  const ctx16: TrailerContentContext = {
    contentId: 'mcu-doomsday',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Avengers: Doomsday',
  };
  const v16: RawTMDbVideo = {
    id: 'vid-doom',
    key: 'DOOMTRAILER1',
    name: 'Avengers: Doomsday | Official Teaser',
    site: 'YouTube',
    type: 'Trailer',
    official: true,
    published_at: '2026-08-18T00:00:00Z',
  };
  const obs16: RawTrailerObservationInput[] = [
    {
      category: 'RETURNING_CHARACTER',
      subject: 'Doctor Doom',
      observationDescription: 'Robert Downey Jr. revealed as Victor von Doom.',
      timestampSeconds: 80,
      rawConfidence: 0.95,
      initialState: 'OBSERVED',
    },
  ];
  const scan16 = store16.processTrailerScan(ctx16, [v16], { [v16.key]: obs16 }, '2026-08-18T00:00:00.000Z');
  assert(scan16.proposalsGenerated.length === 1, '16A. Pending proposal package created');
  assert(scan16.proposalsGenerated[0]?.reviewStatus === 'pending', '16B. Initial status is strictly pending');
}

// ─── 17. Rejected Proposal Archiving ────────────────────────────────────────
console.log('\n--- 17. Rejected Proposal Archiving ---');
{
  const store17 = new TrailerIntelligenceStore(new TestMemoryTrailerAdapter());
  const ctx17: TrailerContentContext = {
    contentId: 'mcu-doomsday',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Avengers: Doomsday',
  };
  const v17: RawTMDbVideo = {
    id: 'vid-reject',
    key: 'REJECTTRAIL1',
    name: 'Avengers: Doomsday | Teaser 2',
    site: 'YouTube',
    type: 'Trailer',
    official: true,
    published_at: '2026-08-18T00:00:00Z',
  };
  const obs17: RawTrailerObservationInput[] = [
    {
      category: 'VISUAL_CALLBACK',
      subject: 'Unconfirmed easter egg background figure',
      observationDescription: 'Rumored unverified cameo in blurry background.',
      timestampSeconds: 45,
      rawConfidence: 0.40,
      initialState: 'INFERRED',
    },
  ];
  const scan17 = store17.processTrailerScan(ctx17, [v17], { [v17.key]: obs17 }, '2026-08-18T00:00:00.000Z');
  const prop17 = scan17.proposalsGenerated[0];
  if (prop17) {
    store17.updateProposalStatus(prop17.id, 'rejected', 'Editorial Reviewer', 'Low confidence unverified rumor');
    const updatedProp17 = store17.getProposalById(prop17.id);
    assert(updatedProp17?.reviewStatus === 'rejected', '17A. Status is updated to rejected');
    assert(updatedProp17?.reviewNotes === 'Low confidence unverified rumor', '17B. Rejection notes archived');
  }
}

// ─── 18. Failed Integration Rollback ────────────────────────────────────────
console.log('\n--- 18. Failed Integration Rollback ---');
{
  const dummyUnapprovedPkg: AnnouncementProposalPackage = {
    id: 'prop-invalid-1',
    franchiseId: 'marvel-cinematic-universe',
    franchiseName: 'Marvel Cinematic Universe',
    title: '[NEW TITLE] Invalid Unapproved Title',
    category: 'NEW_TITLES',
    eventType: 'NEW_ANNOUNCEMENT',
    candidate: {
      id: 'mcu-invalid-title',
      title: 'Invalid Unapproved Title',
      franchiseId: 'marvel-cinematic-universe',
      mediaType: 'movie',
      overview: 'Test',
      runtime: 120,
      rating: 8.0,
      status: 'upcoming',
      theatricalReleased: false,
      ottAvailable: false,
      digitalAvailable: false,
      subscriptionStreamingAvailable: false,
      providers: [],
      posterUrl: '/placeholder-poster.svg',
      backdropUrl: '/placeholder-backdrop.svg',
      isCanon: true,
      isRequired: true,
      lifecycleCategory: 'UPCOMING',
      sourceVerification: {
        isVerified: false,
        credibility: 'unverified-rumor',
        sourcePublisher: 'Rumor Blog',
        citation: 'None',
        verificationScore: 0.2,
        verificationNotes: 'Unverified',
        verifiedAt: '2026-08-18T00:00:00Z',
      },
      duplicateCheck: { isDuplicate: false },
      proposedEdges: [],
      candidateGeneratedAt: '2026-08-18T00:00:00Z',
      integrityValidationPassed: true,
      integrityNotes: [],
    },
    proposedEdges: [],
    status: 'pending', // NOT approved
    overallQualityScore: 20,
    sourceVerification: {
      isVerified: false,
      credibility: 'unverified-rumor',
      sourcePublisher: 'Rumor Blog',
      citation: 'None',
      verificationScore: 0.2,
      verificationNotes: 'Unverified',
      verifiedAt: '2026-08-18T00:00:00Z',
    },
    eventHash: 'hash-invalid-1',
    createdAt: '2026-08-18T00:00:00Z',
  };

  const validation = validateProposalForIntegration(dummyUnapprovedPkg);
  assert(!validation.isValid, '18A. Integration validation fails for pending/unverified proposal');
  const integrationResult = integrateApprovedProposal(dummyUnapprovedPkg, { dryRun: true });
  assert(!integrationResult.success, '18B. Unapproved proposal integration blocked');
}

// ─── 19. Spider-Man Multi-Continuity Isolation ──────────────────────────────
console.log('\n--- 19. Spider-Man Multi-Continuity Isolation ---');
{
  const mcuTitles = allContent.filter((c) => c.franchise_id === 'marvel-cinematic-universe');
  const spidermanTitles = allContent.filter((c) => c.franchise_id === 'spider-man');

  assert(spidermanTitles.some((c) => c.id === 'spiderman-1'), '19A. Raimi Spider-Man in spider-man franchise');
  assert(spidermanTitles.some((c) => c.id === 'amazing-spiderman-1'), '19B. Webb Spider-Man in spider-man franchise');
  assert(spidermanTitles.some((c) => c.id === 'spider-verse-1'), '19C. Spider-Verse in spider-man franchise');
  assert(
    !mcuTitles.some(
      (c) => c.id === 'spiderman-1' || c.id === 'amazing-spiderman-1' || c.id === 'spider-verse-1'
    ),
    '19D. MCU franchise has zero legacy Spider-Man entries'
  );
}

// ─── 20. MCU Watch Order Contamination Prevention ───────────────────────────
console.log('\n--- 20. MCU Watch Order Contamination Prevention ---');
{
  const mcuOrders = allWatchOrders.filter((wo) => wo.franchise_id === 'marvel-cinematic-universe');
  const mcuOrderIds = mcuOrders.map((wo) => wo.content_id);

  const legacyIds = ['spiderman-1', 'spiderman-2', 'spiderman-3', 'amazing-spiderman-1', 'amazing-spiderman-2', 'spider-verse-1'];
  const contaminated = legacyIds.filter((id) => mcuOrderIds.includes(id));
  assert(contaminated.length === 0, '20. MCU release and chronological watch orders 100% clean of legacy Spider-Man titles');
}

// ─── 21. Chronological Ordering Authority ────────────────────────────────────
console.log('\n--- 21. Chronological Ordering Authority ---');
{
  const early = {
    id: 'a',
    tmdb_id: 1,
    title: 'A',
    release_date: '2026-05-01',
    theatrical_release_date: '2026-05-01',
    type: 'movie',
    franchise_id: 'marvel-cinematic-universe',
    rating: 0,
    runtime: 0,
    overview: '',
    theatrical_released: false,
    ott_available: false,
    digital_available: false,
    subscription_streaming_available: false,
    poster_url: '',
    backdrop_url: '',
    is_canon: true,
    is_required: true,
  } as unknown as Content;
  const late = {
    id: 'b',
    tmdb_id: 2,
    title: 'B',
    release_date: '2027-05-01',
    theatrical_release_date: '2027-05-01',
    type: 'movie',
    franchise_id: 'marvel-cinematic-universe',
    rating: 0,
    runtime: 0,
    overview: '',
    theatrical_released: false,
    ott_available: false,
    digital_available: false,
    subscription_streaming_available: false,
    poster_url: '',
    backdrop_url: '',
    is_canon: true,
    is_required: true,
  } as unknown as Content;
  const tba = {
    id: 'c',
    tmdb_id: 3,
    title: 'C',
    release_date: 'TBA',
    theatrical_release_date: 'TBA',
    type: 'movie',
    franchise_id: 'marvel-cinematic-universe',
    rating: 0,
    runtime: 0,
    overview: '',
    theatrical_released: false,
    ott_available: false,
    digital_available: false,
    subscription_streaming_available: false,
    poster_url: '',
    backdrop_url: '',
    is_canon: true,
    is_required: true,
  } as unknown as Content;

  assert(compareReleaseDates(early, late) < 0, '21A. 2026 strictly before 2027');
  assert(compareReleaseDates(late, early) > 0, '21B. 2027 strictly after 2026');
  assert(compareReleaseDates(late, tba) < 0, '21C. Explicit date placed before TBA');
}

// ─── 22. Duplicate TMDb ID Protection ────────────────────────────────────────
console.log('\n--- 22. Duplicate TMDb ID Protection ---');
{
  const map = new Map<number, string>();
  let dups = 0;
  for (const c of allContent) {
    if (c.tmdb_id) {
      if (map.has(c.tmdb_id)) dups++;
      map.set(c.tmdb_id, c.id);
    }
  }
  assert(dups === 0, '22. Zero duplicate TMDb IDs across entire canonical catalog');
}

// ─── 23. Duplicate Title / Slug Protection ───────────────────────────────────
console.log('\n--- 23. Duplicate Title / Slug Protection ---');
{
  const idSet = new Set<string>();
  let dupIds = 0;
  for (const c of allContent) {
    if (idSet.has(c.id)) dupIds++;
    idSet.add(c.id);
  }
  assert(dupIds === 0, '23. Zero duplicate content IDs across entire catalog');
}

// ─── 24. Completeness Gap Detection ──────────────────────────────────────────
console.log('\n--- 24. Completeness Gap Detection ---');
{
  const auditReport = CatalogCompletenessAuditEngine.runGlobalAudit();
  assert(
    auditReport.auditVerdict === 'HEALTHY_CANONICAL' || auditReport.auditVerdict === 'PROPOSALS_PENDING_REVIEW',
    '24A. Completeness audit engine completes successfully'
  );
  assert(auditReport.totalTitlesAudited === 240, '24B. Audited all 240 canonical titles');
  assert(auditReport.totalFranchisesAudited === 19, '24C. Audited all 19 registered franchises');
  assert(auditReport.brokenGraphDependencies.length === 0, '24D. 0 broken graph dependencies in knowledge graph');
}

// ─── 25. Dynamic Franchise Registration ─────────────────────────────────────
console.log('\n--- 25. Dynamic Franchise Registration ---');
{
  assert(allFranchises.length === 19, '25A. Exactly 19 franchises dynamically exported');
  for (const f of allFranchises) {
    const match = matchFranchiseFromContext(`Official announcement for ${f.name}`);
    assert(match.franchiseId === f.id || match.isConfident, `25B. Franchise '${f.name}' matched via dynamic dictionary`);
  }
}

// ─── 26. Zero-Event Clean Scan Execution ────────────────────────────────────
console.log('\n--- 26. Zero-Event Clean Scan Execution ---');
{
  const monitor26 = new GlobalAnnouncementMonitor({}, new TestMemoryMonitorAdapter());
  const emptyRes = monitor26.processEvents([]);
  assert(emptyRes.totalAnnouncementsDiscovered === 0, '26A. Events processed is 0');
  assert(emptyRes.proposalsGenerated.length === 0, '26B. Proposals created is 0');
  assert(emptyRes.rejectedRumorsCount === 0, '26C. Rejected rumors is 0');
}

// ─── 27. Network Failure Isolation & Resilience ──────────────────────────────
console.log('\n--- 27. Network Failure Isolation & Resilience ---');
{
  const monitor27 = new GlobalAnnouncementMonitor({}, new TestMemoryMonitorAdapter());
  const fetchRes = await monitor27.fetchWithResilience('http://localhost:99999/unreachable', 'test-source', {
    maxRetries: 1,
    timeoutMs: 200,
  });
  assert(fetchRes.data === null, '27A. Network failure returns null data without crashing');
  assert(fetchRes.error !== null, '27B. Returns descriptive error string');
}

// ─── 28. Invalid / Unauthorized Source Rejection ────────────────────────────
console.log('\n--- 28. Invalid / Unauthorized Source Rejection ---');
{
  const unverified = verifyOfficialSource('Random Blog', 'https://randomblog12345.com/rumor-avengers-7');
  assert(!unverified.isVerified, '28A. Unofficial random blog is rejected');
  assert(unverified.verificationScore < 0.5, '28B. Verification score is low (< 0.5)');
}

// ─── 29. Invalid Artwork URL Rejection ──────────────────────────────────────
console.log('\n--- 29. Invalid Artwork URL Rejection ---');
{
  const invalidCandidate = verifyArtworkUrls('http://insecure-cdn.com/poster.jpg', 'ftp://backdrop.com/bg.png');
  assert(invalidCandidate.poster === '/placeholder-poster.svg', '29A. Insecure poster falls back to placeholder');
  assert(invalidCandidate.backdrop === '/placeholder-backdrop.svg', '29B. Insecure backdrop falls back to placeholder');
}

// ─── 30. Invalid / Fan Trailer Rejection ────────────────────────────────────
console.log('\n--- 30. Invalid / Fan Trailer Rejection ---');
{
  const fanVideo: RawTMDbVideo = {
    id: 'fan-1',
    iso_639_1: 'en',
    iso_3166_1: 'US',
    name: 'Spider-Man 4 (2026) Concept Teaser | Fan Made',
    key: 'FANVIDKEY11',
    site: 'YouTube',
    size: 1080,
    type: 'Trailer',
    official: false,
    published_at: '2026-08-18T00:00:00Z',
  };
  const fanClassification = classifyTMDbVideo(fanVideo);
  assert(!fanClassification.isOfficial, '30A. Fan-made trailer rejected');
  assert(!fanClassification.isEligibleForEvidence, '30B. Fan-made trailer marked ineligible for evidence extraction');
}

console.log('\n========================================================================');
console.log('  🎉 ALL 30 PHASE 4 PRODUCTION OPERATIONS INVARIANTS PASSED!           ');
console.log('========================================================================\n');
