/**
 * CineOrder Global Announcement -> Catalog Proposal Lifecycle Test Suite
 * Validates franchise-agnostic announcement discovery, source verification,
 * duplicate detection, lifecycle classification, diff generation, artwork fallbacks,
 * human approval requirement, TypeScript code generation, and catalog non-mutation invariants.
 */

import { allFranchises, allContent } from '../data/franchises/index';
import {
  verifyOfficialSource,
  matchOrCreateContentId,
  checkForDuplicates,
  verifyArtworkUrls,
  generateStoryRelationshipCandidates,
  generateMetadataCandidate,
  createAnnouncementProposal,
} from '../lib/announcementDiscoveryEngine';
import {
  GlobalAnnouncementMonitor,
  matchFranchiseFromContext,
  detectCatalogChanges,
} from '../lib/globalAnnouncementMonitor';
import {
  mergeAnnouncementProposal,
  generateFranchiseContentSnippet,
} from '../lib/announcementMerger';
import type {
  DiscoveredAnnouncement,
  NormalizedSourceEvent,
  AnnouncementProposalPackage,
} from '../types/announcementDiscovery';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    const proc = (globalThis as any).process;
    if (proc && typeof proc.exit === 'function') {
      proc.exit(1);
    } else {
      throw new Error(msg);
    }
  }
  console.log(`✅ PASS: ${msg}`);
}

console.log('========================================================================');
console.log('  CINEORDER GLOBAL ANNOUNCEMENT LIFECYCLE & MULTI-FRANCHISE TEST SUITE   ');
console.log('========================================================================\n');

// Snapshot production catalog count before tests to verify non-mutation invariant
const INITIAL_CATALOG_COUNT = allContent.length;
console.log(`Initial Production Catalog Count: ${INITIAL_CATALOG_COUNT} titles across ${allFranchises.length} franchises.\n`);

// ============================================================================
// SECTION 1: FRANCHISE-AGNOSTIC DYNAMIC IDENTIFICATION (ALL 18 FRANCHISES)
// ============================================================================
console.log('--- Section 1: Multi-Franchise Dynamic Identification ---');

const franchiseTestCases = [
  {
    name: '1.1 Marvel movie',
    title: 'Avengers: Secret Wars',
    synopsis: 'Heroes from across realities unite on Battleworld against multiversal annihilation.',
    expectedFranchiseId: 'marvel-cinematic-universe',
  },
  {
    name: '1.2 Marvel series',
    title: 'VisionQuest',
    synopsis: 'Paul Bettany returns as White Vision exploring his newfound memories after Westview.',
    expectedFranchiseId: 'marvel-cinematic-universe',
  },
  {
    name: '1.3 Star Wars movie',
    title: 'Star Wars: Dawn of the Jedi',
    synopsis: 'James Mangold directs the origin story of the Force 25,000 years in the past.',
    expectedFranchiseId: 'star-wars',
  },
  {
    name: '1.4 Star Wars series',
    title: 'The Mandalorian & Grogu Adventures',
    synopsis: 'Din Djarin and Grogu embark on a new mission for the New Republic.',
    expectedFranchiseId: 'star-wars',
  },
  {
    name: '1.5 DC movie',
    title: 'The Batman: Part II',
    synopsis: 'Matt Reeves continues the epic crime saga in Gotham City with Bruce Wayne.',
    expectedFranchiseId: 'dc-extended-universe',
  },
  {
    name: '1.6 DC series',
    title: 'Lanterns (Max Original Series)',
    synopsis: 'Hal Jordan and John Stewart investigate a terrestrial mystery in the American heartland.',
    expectedFranchiseId: 'dc-extended-universe',
  },
  {
    name: '1.7 Avatar movie',
    title: 'Avatar: The Tulkun Rider',
    synopsis: 'James Cameron expands the oceans and skies of Pandora.',
    expectedFranchiseId: 'avatar',
  },
  {
    name: '1.8 Alien movie',
    title: 'Alien: Romulus Sequel',
    synopsis: 'Fede Alvarez returns to direct the next chapter in the Xenomorph terror.',
    expectedFranchiseId: 'alien',
  },
  {
    name: '1.9 Alien series',
    title: 'Alien: Earth',
    synopsis: 'Noah Hawley explores the arrival of the Xenomorph species on Earth.',
    expectedFranchiseId: 'alien',
  },
  {
    name: '1.10 Jurassic Park movie',
    title: 'Jurassic World: Rebirth',
    synopsis: 'Gareth Edwards directs a covert expedition to extract genetic material from colossal dinosaurs.',
    expectedFranchiseId: 'jurassic-park',
  },
  {
    name: '1.11 Harry Potter series',
    title: 'Harry Potter: The Max Original TV Series',
    synopsis: 'A faithful decade-long adaptation of the beloved Hogwarts Wizarding World books.',
    expectedFranchiseId: 'harry-potter',
  },
  {
    name: '1.12 Transformers movie',
    title: 'Transformers: Cybertron Origins',
    synopsis: 'The untold Great War between Autobots and Decepticons on Cybertron.',
    expectedFranchiseId: 'transformers',
  },
  {
    name: '1.13 John Wick series',
    title: 'John Wick: Under the High Table',
    synopsis: 'New assassins challenge the High Table order after John Wick chapter 4.',
    expectedFranchiseId: 'john-wick',
  },
  {
    name: '1.14 Fast & Furious movie',
    title: 'Fast X: Part 2 (The Final Ride)',
    synopsis: 'Dom Toretto and his family face their ultimate confrontation.',
    expectedFranchiseId: 'fast-and-furious',
  },
  {
    name: '1.15 Mission: Impossible movie',
    title: 'Mission: Impossible 8',
    synopsis: 'Ethan Hunt and the IMF team track the Sevastopol submarine.',
    expectedFranchiseId: 'mission-impossible',
  },
  {
    name: '1.16 The Conjuring movie',
    title: 'The Conjuring: Last Rites',
    synopsis: 'Ed and Lorraine Warren investigate their final terrifying paranormal case.',
    expectedFranchiseId: 'the-conjuring-universe',
  },
  {
    name: '1.17 X-Men movie',
    title: 'X-Men: Mutant Genesis',
    synopsis: 'Professor Charles Xavier forms the first generation of mutant protectors.',
    expectedFranchiseId: 'x-men',
  },
  {
    name: '1.18 Lord of the Rings movie',
    title: 'The Lord of the Rings: The Hunt for Gollum',
    synopsis: 'Andy Serkis and Peter Jackson return to Middle-earth to tell the story of the pursuit of Gollum.',
    expectedFranchiseId: 'lord-of-the-rings',
  },
  {
    name: '1.19 Evil Dead movie',
    title: 'Evil Dead: Burn',
    synopsis: 'A new cursed Necronomicon is unearthed in a remote forest cabin.',
    expectedFranchiseId: 'evil-dead',
  },
  {
    name: '1.20 Insidious movie',
    title: 'Insidious: Thread into The Further',
    synopsis: 'Astral projection opens a dangerous portal into the darkest realm of The Further.',
    expectedFranchiseId: 'insidious',
  },
];

for (const tc of franchiseTestCases) {
  const result = matchFranchiseFromContext(tc.title, tc.synopsis);
  assert(
    result.franchiseId === tc.expectedFranchiseId,
    `${tc.name}: '${tc.title}' dynamically resolved to '${result.franchiseId}' (Confidence: ${(result.confidence * 100).toFixed(0)}%)`
  );
  assert(result.isConfident === true, `${tc.name}: isConfident is true`);
}

// ============================================================================
// SECTION 2: ANNOUNCEMENT TYPES & LIFECYCLE CLASSIFICATIONS
// ============================================================================
console.log('\n--- Section 2: Announcement Types & Lifecycle Classifications ---');

// 2.1 Future Release (New Movie)
const newFutureMovieAnnounce: DiscoveredAnnouncement = {
  rawTitle: 'Avatar 4',
  franchiseId: 'avatar',
  mediaType: 'movie',
  expectedReleaseDate: '2029-12-21',
  synopsis: 'James Cameron continues the multi-generational journey on Pandora.',
  sourcePublisher: '20th Century Studios Official',
  sourceUrl: 'https://20thcenturystudios.com/movies/avatar-4',
  citation: '20th Century Studios Theatrical Slate',
};
const futureMoviePkg = createAnnouncementProposal(newFutureMovieAnnounce);
assert(futureMoviePkg.category === 'NEW_TITLES', '2.1A. Future movie categorized as NEW_TITLES');
assert(futureMoviePkg.candidate.lifecycleCategory === 'UPCOMING', '2.1B. Future movie lifecycle is UPCOMING');
assert(futureMoviePkg.candidate.theatricalReleased === false, '2.1C. Future movie theatricalReleased is false');
assert(futureMoviePkg.candidate.ottAvailable === false, '2.1D. Future movie ottAvailable is false');

// 2.2 Announced OTT Date (Pre-theatrical / Unreleased Movie with planned streaming)
const announcedOttPreTheatrical: DiscoveredAnnouncement = {
  rawTitle: 'Alien: Earth',
  franchiseId: 'alien',
  mediaType: 'series',
  expectedReleaseDate: '2028-08-15',
  synopsis: 'Noah Hawley’s prequel series set on Earth near the end of the 21st century.',
  sourcePublisher: 'FX Networks Official',
  sourceUrl: 'https://fxnetworks.com/shows/alien-earth',
  citation: 'FX Networks Upfront Announcement',
  streamingProviders: ['Hulu', 'Disney+'],
};
const unreleasedOttPkg = createAnnouncementProposal(announcedOttPreTheatrical);
assert(unreleasedOttPkg.candidate.lifecycleCategory === 'UPCOMING', '2.2A. Pre-release title with planned OTT remains UPCOMING lifecycle');
assert(unreleasedOttPkg.candidate.ottAvailable === false, '2.2B. Pre-release title ottAvailable is false (cannot stream before release)');

// 2.3 Released + OTT Available (Theatrically Released Movie receiving streaming update)
const releasedOttEvent: NormalizedSourceEvent = {
  id: 'evt-avatar-streaming-update',
  source: '20th Century Studios Press',
  sourceUrl: 'https://20thcenturystudios.com/press/avatar-fire-and-ash',
  discoveredAt: '2026-08-15T12:00:00Z',
  eventType: 'STREAMING_RELEASE',
  title: 'Avatar: Fire and Ash',
  mediaType: 'movie',
  franchiseCandidate: 'avatar',
  releaseDateCandidate: '2025-12-19',
  streamingProviderCandidate: ['Disney+', 'JioHotstar'],
  evidence: 'Official Streaming Premiere Press Release',
  confidence: 0.98,
};
const releasedOttChange = detectCatalogChanges(releasedOttEvent);
assert(releasedOttChange.isExistingTitle === true, '2.3A. Released movie recognized as existing title');
assert(releasedOttChange.detectedCategory === 'OTT_CHANGES', '2.3B. Detected category is OTT_CHANGES');
assert(releasedOttChange.diff !== undefined, '2.3C. Diff generated for streaming update');
assert(releasedOttChange.diff?.lifecycleAfter === 'STREAMING_AVAILABLE', '2.3D. Lifecycle transitions to STREAMING_AVAILABLE');

// 2.4 Release-Date Change for Existing Title
const dateChangeEvent: NormalizedSourceEvent = {
  id: 'evt-batman-delay',
  source: 'Variety',
  sourceUrl: 'https://variety.com/2026/film/news/batman-2-delayed',
  discoveredAt: '2026-08-15T12:00:00Z',
  eventType: 'RELEASE_DATE_CHANGE',
  title: 'The Batman: Part II',
  mediaType: 'movie',
  franchiseCandidate: 'dc-universe',
  releaseDateCandidate: '2027-05-07',
  evidence: 'Warner Bros. Theatrical Calendar Revision',
  confidence: 0.95,
};
const dateChangeResult = detectCatalogChanges(dateChangeEvent);
assert(dateChangeResult.isExistingTitle === true, '2.4A. Date change matches existing title');
assert(dateChangeResult.detectedCategory === 'RELEASE_DATE_CHANGES', '2.4B. Detected category is RELEASE_DATE_CHANGES');
assert(dateChangeResult.diff?.fieldName === 'release_date', '2.4C. Diff fieldName is release_date');
assert(dateChangeResult.diff?.proposedValue === '2027-05-07', '2.4D. Proposed date matches candidate date');

// 2.5 Title Rename for Existing Title
const titleRenameEvent: NormalizedSourceEvent = {
  id: 'evt-conjuring-rename',
  source: 'Warner Bros. Official',
  sourceUrl: 'https://warnerbros.com/movies/conjuring-4',
  discoveredAt: '2026-08-15T12:00:00Z',
  eventType: 'TITLE_CHANGE',
  title: 'The Conjuring: The Final Rites',
  tmdbId: 1038392, // Matches conj-last-rites tmdb_id
  mediaType: 'movie',
  franchiseCandidate: 'the-conjuring-universe',
  evidence: 'Official Title Retitle Announcement',
  confidence: 0.96,
};
const titleRenameResult = detectCatalogChanges(titleRenameEvent);
assert(titleRenameResult.isExistingTitle === true, '2.5A. Rename matched by exact TMDb ID');
assert(titleRenameResult.detectedCategory === 'TITLE_CHANGES', '2.5B. Detected category is TITLE_CHANGES');
assert(titleRenameResult.diff?.fieldName === 'title', '2.5C. Diff fieldName is title');
assert(titleRenameResult.diff?.proposedValue === 'The Conjuring: The Final Rites', '2.5D. Proposed value is new title');

// 2.6 Project Cancellation
const cancelEvent: NormalizedSourceEvent = {
  id: 'evt-crooked-man-cancel',
  source: 'The Hollywood Reporter',
  sourceUrl: 'https://hollywoodreporter.com/movies/the-crooked-man-cancelled',
  discoveredAt: '2026-08-15T12:00:00Z',
  eventType: 'CANCELLATION',
  title: 'The Crooked Man',
  mediaType: 'movie',
  franchiseCandidate: 'the-conjuring-universe',
  statusCandidate: 'cancelled',
  evidence: 'Studio confirms spin-off project cancelled',
  confidence: 0.92,
};
const cancelResult = detectCatalogChanges(cancelEvent);
assert(cancelResult.detectedCategory === 'CANCELLATIONS', '2.6A. Detected category is CANCELLATIONS');
assert(cancelResult.diff?.fieldName === 'status', '2.6B. Diff fieldName is status');
assert(cancelResult.diff?.proposedValue === 'cancelled', '2.6C. Proposed value is cancelled');

// 2.7 Conflicting Authoritative Sources
const monitor = new GlobalAnnouncementMonitor();
const conflictEvents: NormalizedSourceEvent[] = [
  {
    id: 'evt-fast-conflict-test',
    source: 'Universal Pictures Official',
    sourceUrl: 'https://universalpictures.com/movies/fast-x-part-2',
    discoveredAt: '2026-08-15T12:00:00Z',
    eventType: 'RELEASE_DATE_CHANGE',
    title: 'Fast X: Part 2',
    mediaType: 'movie',
    franchiseCandidate: 'fast-and-furious',
    releaseDateCandidate: '2026-06-18',
    evidence: 'Universal Studios Official Theatrical Slate',
    confidence: 0.95,
    conflictSource: {
      sourcePublisher: 'Deadline Trade Report',
      sourceUrl: 'https://deadline.com/fast-x-part-2-delayed-2027',
      conflictingValue: '2027-04-23',
      reason: 'Trade reports script revisions causing production shift.',
    },
  },
];
const conflictScan = monitor.processEvents(conflictEvents, { forceScan: true });
assert(conflictScan.categoryBreakdown.CONFLICTS === 1, '2.7A. Category breakdown has 1 CONFLICTS');
const conflictPkg = conflictScan.proposalsGenerated[0]!;
assert(conflictPkg.isConflict === true, '2.7B. Proposal has isConflict === true');
assert(conflictPkg.conflictDetails?.conflictingSource === 'Deadline Trade Report', '2.7C. Conflicting source recorded');
assert(conflictPkg.conflictDetails?.conflictingValue === '2027-04-23', '2.7D. Conflicting value recorded');

// ============================================================================
// SECTION 3: SOURCE VERIFICATION & RUMOR REJECTION
// ============================================================================
console.log('\n--- Section 3: Source Verification & Rumor Rejection ---');

const studioVer = verifyOfficialSource('Marvel Studios Official', 'https://marvel.com/articles/movies/avengers');
assert(studioVer.isVerified === true, '3.1A. Marvel Studios Official is verified');
assert(studioVer.credibility === 'official-studio-press', '3.1B. Credibility is official-studio-press');
assert(studioVer.verificationScore >= 0.95, '3.1C. Verification score >= 0.95');

const tradeVer = verifyOfficialSource('Variety', 'https://variety.com/2026/film/news/movie-announcement');
assert(tradeVer.isVerified === true, '3.2A. Variety is verified');
assert(tradeVer.credibility === 'trade-publication', '3.2B. Credibility is trade-publication');
assert(tradeVer.verificationScore >= 0.90, '3.2C. Verification score >= 0.90');

const tmdbVer = verifyOfficialSource('TMDb', 'https://themoviedb.org/movie/123456');
assert(tmdbVer.isVerified === true, '3.3A. TMDb is verified');
assert(tmdbVer.credibility === 'tmdb-verified', '3.3B. Credibility is tmdb-verified');

const rumorVer = verifyOfficialSource('We Got This Covered', 'https://wegotthiscovered.com/movies/leak-rumor');
assert(rumorVer.isVerified === false, '3.4A. We Got This Covered is unverified');
assert(rumorVer.credibility === 'unverified-rumor', '3.4B. Credibility is unverified-rumor');
assert(rumorVer.verificationScore < 0.50, '3.4C. Verification score < 0.50');

// Rumor rejection in monitor processEvents
const rumorEvent: NormalizedSourceEvent = {
  id: 'evt-rumor-test',
  source: 'We Got This Covered',
  sourceUrl: 'https://wegotthiscovered.com/rumor',
  discoveredAt: '2026-08-15T12:00:00Z',
  eventType: 'NEW_ANNOUNCEMENT',
  title: 'Secret Spider-Man Crossover',
  mediaType: 'movie',
  franchiseCandidate: 'marvel-cinematic-universe',
  evidence: 'Anonymous reddit forum rumor',
  confidence: 0.3,
};
const rumorScan = monitor.processEvents([rumorEvent], { forceScan: true });
assert(rumorScan.rejectedRumorsCount === 1, '3.5A. Rejected rumor count incremented');
assert(rumorScan.proposalsGenerated.length === 0, '3.5B. 0 proposals generated for unverified rumor');

// ============================================================================
// SECTION 4: CATALOG-WIDE DUPLICATE DETECTION
// ============================================================================
console.log('\n--- Section 4: Catalog-Wide Duplicate Detection ---');

// 4.1 Duplicate by exact TMDb ID
const dupTmdb = checkForDuplicates('Avengers: Endgame 2', 299534);
assert(dupTmdb.isDuplicate === true, '4.1A. Duplicate detected by exact TMDb ID');
assert(dupTmdb.matchType === 'exact_tmdb_id', '4.1B. Match type is exact_tmdb_id');
assert(dupTmdb.matchedTitle === 'Avengers: Endgame', '4.1C. Matched correct title');

// 4.2 Duplicate by exact Title
const dupTitle = checkForDuplicates('Iron Man', undefined, 'marvel-cinematic-universe');
assert(dupTitle.isDuplicate === true, '4.2A. Duplicate detected by exact title');
assert(dupTitle.matchType === 'exact_title', '4.2B. Match type is exact_title');

// 4.3 Duplicate by normalized Slug
const dupSlug = checkForDuplicates('iron-man', undefined, 'marvel-cinematic-universe');
assert(dupSlug.isDuplicate === true, '4.3A. Duplicate detected by normalized slug');
assert(dupSlug.matchType === 'exact_slug', '4.3B. Match type is exact_slug');

// 4.4 Duplicate by high fuzzy title similarity
const dupFuzzy = checkForDuplicates('The Avengers: Endgame Final Edition', undefined, 'marvel-cinematic-universe');
assert(dupFuzzy.isDuplicate === true, '4.4A. Duplicate detected by fuzzy similarity');
assert(dupFuzzy.similarityScore! >= 0.80, '4.4B. Fuzzy similarity score >= 0.80');

// 4.5 Genuinely new title
const uniqueCheck = checkForDuplicates('Genuinely Brand New Unannounced Story Title 2030', 99999999, 'marvel-cinematic-universe');
assert(uniqueCheck.isDuplicate === false, '4.5A. Genuinely new title is not marked duplicate');

// ============================================================================
// SECTION 5: ARTWORK VALIDATION & FALLBACKS
// ============================================================================
console.log('\n--- Section 5: Artwork Validation & Fallbacks ---');

const validArtwork = verifyArtworkUrls('https://image.tmdb.org/t/p/w500/valid.jpg', 'https://image.tmdb.org/t/p/original/valid_bd.jpg');
assert(validArtwork.verified === true, '5.1A. Valid HTTPS URLs marked verified');
assert(validArtwork.poster === 'https://image.tmdb.org/t/p/w500/valid.jpg', '5.1B. Valid poster preserved');
assert(validArtwork.backdrop === 'https://image.tmdb.org/t/p/original/valid_bd.jpg', '5.1C. Valid backdrop preserved');

const missingPoster = verifyArtworkUrls('', 'https://image.tmdb.org/t/p/original/valid_bd.jpg');
assert(missingPoster.verified === false, '5.2A. Missing poster marked verified: false');
assert(missingPoster.poster === '/placeholder-poster.svg', '5.2B. Poster assigned /placeholder-poster.svg fallback');

const missingBackdrop = verifyArtworkUrls('https://image.tmdb.org/t/p/w500/valid.jpg', '');
assert(missingBackdrop.verified === false, '5.3A. Missing backdrop marked verified: false');
assert(missingBackdrop.backdrop === '/placeholder-backdrop.svg', '5.3B. Backdrop assigned /placeholder-backdrop.svg fallback');

// ============================================================================
// SECTION 6: UNKNOWN FRANCHISE FALLBACK & INTEGRITY
// ============================================================================
console.log('\n--- Section 6: Unknown Franchise Fallback & Integrity ---');

const unknownResult = matchFranchiseFromContext('Random Cooking Show Season 1', 'A reality cooking competition.');
assert(unknownResult.franchiseId === 'unknown-franchise', '6.1A. Non-franchise content resolved to unknown-franchise');
assert(unknownResult.isConfident === false, '6.1B. isConfident is false for unknown franchise');

const unknownAnnounce: DiscoveredAnnouncement = {
  rawTitle: 'Random Standalone Movie',
  franchiseId: 'unknown-franchise',
  mediaType: 'movie',
  sourcePublisher: 'Variety',
  sourceUrl: 'https://variety.com/news',
  citation: 'Variety Trade Report',
};
const unknownCandidate = generateMetadataCandidate(unknownAnnounce);
assert(unknownCandidate.integrityValidationPassed === false, '6.2A. Unknown franchise candidate fails integrity validation');
assert(unknownCandidate.integrityNotes.some((n) => n.includes('Unknown franchise ID')), '6.2B. Integrity notes contain Unknown franchise ID');

// ============================================================================
// SECTION 7: STORY RELATIONSHIP PROPOSALS
// ============================================================================
console.log('\n--- Section 7: Story Relationship Proposals ---');

const hpAnnounce: DiscoveredAnnouncement = {
  rawTitle: 'Harry Potter: The Founders of Hogwarts',
  franchiseId: 'harry-potter',
  mediaType: 'movie',
  expectedReleaseDate: '2028-11-20',
  synopsis: 'The ancient founding of Hogwarts School of Witchcraft and Wizardry.',
  sourcePublisher: 'Warner Bros. Official',
  sourceUrl: 'https://warnerbros.com/harry-potter',
  citation: 'Warner Bros. Film Slate',
};
const hpCandidateId = matchOrCreateContentId(hpAnnounce.rawTitle, hpAnnounce.franchiseId).id;
const proposedEdges = generateStoryRelationshipCandidates(hpAnnounce, hpCandidateId);
assert(proposedEdges.length > 0, '7.1A. Generated narrative relationship edge');
assert(proposedEdges[0]!.targetId === hpCandidateId, '7.1B. Target ID is new candidate ID');
assert(
  proposedEdges[0]!.relationship === 'direct-sequel' || proposedEdges[0]!.relationship === 'story-continuation',
  '7.1C. Valid narrative relationship assigned'
);
assert(proposedEdges[0]!.confidenceScore >= 0.80, '7.1D. Confidence score >= 0.80');
assert(proposedEdges[0]!.status === 'pending', '7.1E. Proposed edge status is pending');

// ============================================================================
// SECTION 8: DEDUPLICATION & REPEATED ANNOUNCEMENT INVARIANT
// ============================================================================
console.log('\n--- Section 8: Deduplication & Repeated Announcement Invariant ---');

const dedupeMonitor = new GlobalAnnouncementMonitor();
const repeatEvent: NormalizedSourceEvent = {
  id: 'evt-repeat-sw-test',
  source: 'Lucasfilm Official',
  sourceUrl: 'https://starwars.com/news/dawn-jedi-announcement',
  discoveredAt: '2026-08-15T12:00:00Z',
  eventType: 'NEW_ANNOUNCEMENT',
  title: 'Star Wars: Dawn of the Jedi',
  mediaType: 'movie',
  franchiseCandidate: 'star-wars',
  releaseDateCandidate: '2028-12-15',
  evidence: 'Star Wars Celebration Official Slate',
  confidence: 0.98,
};

// First scan -> Creates 1 proposal
const scan1 = dedupeMonitor.processEvents([repeatEvent]);
assert(scan1.proposalsGenerated.length === 1, '8.1A. First scan stages 1 proposal');
assert(scan1.duplicateEventsIgnoredCount === 0, '8.1B. First scan has 0 duplicate events ignored');

// Second scan with identical event (without forceScan) -> Ignores duplicate
const scan2 = dedupeMonitor.processEvents([repeatEvent]);
assert(scan2.proposalsGenerated.length === 0, '8.2A. Second scan stages 0 duplicate proposals');
assert(scan2.duplicateEventsIgnoredCount === 1, '8.2B. Second scan records 1 duplicate event ignored');

// ============================================================================
// SECTION 9: HUMAN REVIEW, APPROVAL & STAGED MERGE INVARIANT
// ============================================================================
console.log('\n--- Section 9: Human Review, Approval & Staged Merge Invariant ---');

const mergeCandidateAnnounce: DiscoveredAnnouncement = {
  rawTitle: 'Avatar 5: The Quest for Eywa',
  franchiseId: 'avatar',
  mediaType: 'movie',
  expectedReleaseDate: '2031-12-19',
  synopsis: 'The fifth installment taking the journey to Earth and beyond.',
  sourcePublisher: '20th Century Studios Official',
  sourceUrl: 'https://20thcenturystudios.com/avatar-5',
  citation: '20th Century Studios Official Slate',
};
const proposalToMerge = createAnnouncementProposal(mergeCandidateAnnounce);

// 9.1 Merging while status is 'pending' must FAIL
const unapprovedMergeResult = mergeAnnouncementProposal(proposalToMerge);
assert(unapprovedMergeResult.success === false, '9.1A. Merging unapproved proposal is blocked');
assert(unapprovedMergeResult.message.includes("Must be 'approved'"), '9.1B. Error specifies approval requirement');

// 9.2 Approve proposal
proposalToMerge.status = 'approved';
assert(proposalToMerge.status === 'approved', '9.2A. Proposal status updated to approved by editorial reviewer');

// 9.3 Merging approved proposal succeeds
const approvedMergeResult = mergeAnnouncementProposal(proposalToMerge, 'Lead Curator');
assert(approvedMergeResult.success === true, '9.3A. Approved proposal merges successfully');
assert(approvedMergeResult.generatedContent !== undefined, '9.3B. Generated content object created');
assert(approvedMergeResult.generatedContent?.id === proposalToMerge.candidate.id, '9.3C. Generated content has correct candidate ID');
assert(approvedMergeResult.generatedContent?.franchise_id === 'avatar', '9.3D. Generated content belongs to avatar franchise');
assert(Boolean(approvedMergeResult.typescriptSnippet && approvedMergeResult.typescriptSnippet.includes('buildContent')), '9.3F. TypeScript snippet contains buildContent');
assert(Boolean(approvedMergeResult.typescriptSnippet && approvedMergeResult.typescriptSnippet.includes("franchise_id: 'avatar'")), '9.3G. TypeScript snippet targets avatar franchise');
assert((proposalToMerge.status as string) === 'merged', '9.3H. Proposal package status updated to merged');
assert(proposalToMerge.reviewedBy === 'Lead Curator', '9.3I. Reviewer name recorded on package');

// 9.4 Verify Code Snippet Generation across different proposal categories
const releaseDateProposal: AnnouncementProposalPackage = {
  id: 'prop-test-date',
  franchiseId: 'dc-universe',
  franchiseName: 'DC Universe',
  title: '[RELEASE DATE CHANGES] The Batman: Part II',
  category: 'RELEASE_DATE_CHANGES',
  eventType: 'RELEASE_DATE_CHANGE',
  candidate: generateMetadataCandidate({
    rawTitle: 'The Batman: Part II',
    franchiseId: 'dc-universe',
    mediaType: 'movie',
    expectedReleaseDate: '2027-05-07',
    sourcePublisher: 'Variety',
    citation: 'Variety Trade Report',
  }),
  proposedEdges: [],
  diff: {
    fieldName: 'release_date',
    previousValue: '2026-10-02',
    proposedValue: '2027-05-07',
    diffSummary: "Release date updated to '2027-05-07'.",
  },
  status: 'approved',
  overallQualityScore: 95,
  sourceVerification: verifyOfficialSource('Variety'),
  createdAt: new Date().toISOString(),
};
const dateSnippet = generateFranchiseContentSnippet(releaseDateProposal);
assert(dateSnippet.includes("release_date: '2027-05-07'"), '9.4A. Release date snippet contains updated release_date');

const ottProposal: AnnouncementProposalPackage = {
  id: 'prop-test-ott',
  franchiseId: 'marvel-cinematic-universe',
  franchiseName: 'Marvel Cinematic Universe',
  title: '[OTT CHANGES] Deadpool & Wolverine',
  category: 'OTT_CHANGES',
  eventType: 'STREAMING_RELEASE',
  candidate: generateMetadataCandidate({
    rawTitle: 'Deadpool & Wolverine',
    franchiseId: 'marvel-cinematic-universe',
    mediaType: 'movie',
    expectedReleaseDate: '2024-07-26',
    sourcePublisher: 'Disney+ Press',
    citation: 'Disney+ Streaming Date',
    streamingProviders: ['Disney+'],
  }),
  proposedEdges: [],
  diff: {
    fieldName: 'streaming_providers',
    previousValue: 'None',
    proposedValue: 'Disney+',
    diffSummary: 'Added Disney+ streaming availability.',
  },
  status: 'approved',
  overallQualityScore: 95,
  sourceVerification: verifyOfficialSource('Disney+ Press'),
  createdAt: new Date().toISOString(),
};
const ottSnippet = generateFranchiseContentSnippet(ottProposal);
assert(ottSnippet.includes('providers: ["Disney+"]'), '9.4B. OTT snippet contains updated providers');

const cancelProposal: AnnouncementProposalPackage = {
  id: 'prop-test-cancel',
  franchiseId: 'the-conjuring-universe',
  franchiseName: 'The Conjuring Universe',
  title: '[CANCELLATIONS] The Crooked Man',
  category: 'CANCELLATIONS',
  eventType: 'CANCELLATION',
  candidate: generateMetadataCandidate({
    rawTitle: 'The Crooked Man',
    franchiseId: 'the-conjuring-universe',
    mediaType: 'movie',
    sourcePublisher: 'The Hollywood Reporter',
    citation: 'THR Cancellation Notice',
  }),
  proposedEdges: [],
  status: 'approved',
  overallQualityScore: 90,
  sourceVerification: verifyOfficialSource('The Hollywood Reporter'),
  createdAt: new Date().toISOString(),
};
const cancelSnippet = generateFranchiseContentSnippet(cancelProposal);
assert(cancelSnippet.includes("status: 'cancelled'"), '9.4C. Cancellation snippet contains status: cancelled');

// ============================================================================
// SECTION 10: CATALOG NON-MUTATION INVARIANT
// ============================================================================
console.log('\n--- Section 10: Catalog Non-Mutation Invariant ---');

const FINAL_CATALOG_COUNT = allContent.length;
assert(
  FINAL_CATALOG_COUNT === INITIAL_CATALOG_COUNT,
  `10.1. Production catalog count (${FINAL_CATALOG_COUNT}) is STRICTLY UNCHANGED (0 silent mutations allowed).`
);
assert(
  allContent.every((c) => Boolean(c.id && c.title && c.franchise_id)),
  '10.2. All catalog content entries remain valid and uncorrupted.'
);

console.log('\n========================================================================');
console.log('  GLOBAL ANNOUNCEMENT LIFECYCLE SUITE: ✅ ALL 48 INVARIANTS PASSED     ');
console.log('========================================================================');
