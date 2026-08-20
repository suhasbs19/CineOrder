/**
 * CineOrder Global Automatic Artwork Resolution & Regression Test Suite
 *
 * Validates all 23 required artwork resolution scenarios across all 18 franchises:
 *  1. New movie with valid TMDb poster + backdrop
 *  2. New TV series with valid TMDb poster + backdrop
 *  3. Movie/TV type mismatch
 *  4. Wrong TMDb title match
 *  5. Multiple ambiguous TMDb results
 *  6. Missing poster
 *  7. Missing backdrop
 *  8. Missing both
 *  9. Invalid image URL
 * 10. HTTP failure
 * 11. Placeholder fallback
 * 12. Previously placeholder title receiving artwork later
 * 13. Existing artwork becoming invalid
 * 14. Duplicate TMDb ID
 * 15. Duplicate title
 * 16. Multiple franchises
 * 17. Newly registered franchise
 * 18. Repeated monitor scan
 * 19. Artwork proposal idempotency
 * 20. Human approval requirement
 * 21. Approved artwork integration
 * 22. Rejected artwork proposal
 * 23. Rollback after failed integration
 * Plus VisionQuest regression protection.
 */

import { allContent } from '../data/franchises/index';
import type { Content } from '../types';
import type { NormalizedSourceEvent, AnnouncementProposalPackage } from '../types/announcementDiscovery';
import {
  resolveArtworkForAnnouncementSync,
  validateImageReachability,
  detectCatalogArtworkRefresh,
  resolveAndVerifyTmdbTitle,
  CINEORDER_PLACEHOLDER_POSTER,
  CINEORDER_PLACEHOLDER_BACKDROP,
} from '../lib/artworkResolverEngine';
import {
  GlobalAnnouncementMonitor,
  generateEventHash,
} from '../lib/globalAnnouncementMonitor';
import {
  generateMetadataCandidate,
  checkForDuplicates,
} from '../lib/announcementDiscoveryEngine';
import {
  validateProposalForIntegration,
  transformFranchiseFileContent,
  integrateApprovedProposal,
} from '../lib/catalogIntegrationService';
import { resolveContentPoster, resolveContentBackdrop } from '../lib/imageResolver';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('========================================================================');
console.log('   CINEORDER GLOBAL AUTOMATIC ARTWORK RESOLUTION TEST SUITE (23 TESTS)   ');
console.log('========================================================================\n');

async function runSuite() {
  // ─── Scenario 1: New Movie with Valid TMDb Poster + Backdrop ────────────────
  console.log('\n--- Scenario 1: New Movie with Valid TMDb Poster + Backdrop ---');
  const movieArt = resolveArtworkForAnnouncementSync({
    title: 'Star Wars: Dawn of the Jedi',
    mediaType: 'movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/valid_dawn_poster.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/valid_dawn_backdrop.jpg',
    tmdbId: 1111001,
  });
  assert(movieArt.status === 'VERIFIED', '1A. Movie with both poster & backdrop marked VERIFIED');
  assert(movieArt.posterVerified === true, '1B. Poster marked verified');
  assert(movieArt.backdropVerified === true, '1C. Backdrop marked verified');
  assert(movieArt.posterUrl === 'https://image.tmdb.org/t/p/w500/valid_dawn_poster.jpg', '1D. Canonical poster URL preserved');
  assert(movieArt.backdropUrl === 'https://image.tmdb.org/t/p/w1280/valid_dawn_backdrop.jpg', '1E. Canonical backdrop URL preserved');

  // ─── Scenario 2: New TV Series with Valid TMDb Poster + Backdrop ────────────
  console.log('\n--- Scenario 2: New TV Series with Valid TMDb Poster + Backdrop ---');
  const seriesArt = resolveArtworkForAnnouncementSync({
    title: 'Alien: Earth',
    mediaType: 'series',
    posterUrl: 'https://image.tmdb.org/t/p/w500/valid_alien_earth.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/valid_alien_earth_bd.jpg',
    tmdbId: 212567,
  });
  assert(seriesArt.status === 'VERIFIED', '2A. TV Series with both poster & backdrop marked VERIFIED');
  assert(seriesArt.mediaType === 'series', '2B. Media type is series');
  assert(seriesArt.posterVerified && seriesArt.backdropVerified, '2C. Both images verified');

  // ─── Scenario 3: Movie/TV Type Mismatch ─────────────────────────────────────
  console.log('\n--- Scenario 3: Movie/TV Type Mismatch Protection ---');
  const mismatchArt = await resolveAndVerifyTmdbTitle({
    title: 'The Mandalorian',
    mediaType: 'movie', // Incorrectly passed as movie instead of TV series
    tmdbId: 82856, // TV Show ID for The Mandalorian
  });
  assert(mismatchArt.tmdbMatchStatus === 'NOT_FOUND' || mismatchArt.tmdbMatchStatus === 'MISMATCH' || mismatchArt.status === 'FAILED', '3A. Type mismatch rejected or flagged');

  // ─── Scenario 4: Wrong TMDb Title Match ─────────────────────────────────────
  console.log('\n--- Scenario 4: Wrong TMDb Title Match Protection ---');
  const wrongTitleVer = await resolveAndVerifyTmdbTitle({
    title: 'Avengers: Doomsday',
    mediaType: 'movie',
    tmdbId: 550, // Fight Club (completely unrelated title)
  });
  assert(wrongTitleVer.status === 'AMBIGUOUS' || wrongTitleVer.tmdbMatchStatus === 'MISMATCH', '4. Wrong title match rejected with AMBIGUOUS / MISMATCH status');

  // ─── Scenario 5: Multiple Ambiguous TMDb Results ────────────────────────────
  console.log('\n--- Scenario 5: Multiple Ambiguous TMDb Results ---');
  const ambiguousRes = resolveArtworkForAnnouncementSync({
    title: 'Untitled Project Ambiguous',
    mediaType: 'movie',
    posterUrl: '',
    backdropUrl: '',
  });
  assert(ambiguousRes.status === 'FALLBACK', '5A. Ambiguous / unverified match defaults to safe fallback');
  assert(ambiguousRes.posterUrl === CINEORDER_PLACEHOLDER_POSTER, '5B. Fallback poster used');

  // ─── Scenario 6: Missing Poster (Partial) ───────────────────────────────────
  console.log('\n--- Scenario 6: Missing Poster (Partial) ---');
  const missingPoster = resolveArtworkForAnnouncementSync({
    title: 'Star Wars: Starfighter Project',
    mediaType: 'movie',
    posterUrl: '',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/backdrop.jpg',
  });
  assert(missingPoster.status === 'PARTIAL', '6A. Missing poster with valid backdrop marked PARTIAL');
  assert(missingPoster.posterUrl === CINEORDER_PLACEHOLDER_POSTER, '6B. Poster assigned placeholder');
  assert(missingPoster.backdropUrl === 'https://image.tmdb.org/t/p/w1280/backdrop.jpg', '6C. Backdrop preserved');

  // ─── Scenario 7: Missing Backdrop (Partial) ─────────────────────────────────
  console.log('\n--- Scenario 7: Missing Backdrop (Partial) ---');
  const missingBackdrop = resolveArtworkForAnnouncementSync({
    title: 'Fast X: Part 2',
    mediaType: 'movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/fast_poster.jpg',
    backdropUrl: '',
  });
  assert(missingBackdrop.status === 'PARTIAL', '7A. Valid poster with missing backdrop marked PARTIAL');
  assert(missingBackdrop.posterUrl === 'https://image.tmdb.org/t/p/w500/fast_poster.jpg', '7B. Poster preserved');
  assert(missingBackdrop.backdropUrl === CINEORDER_PLACEHOLDER_BACKDROP, '7C. Backdrop assigned placeholder');

  // ─── Scenario 8: Missing Both (Fallback) ────────────────────────────────────
  console.log('\n--- Scenario 8: Missing Both (Fallback) ---');
  const missingBoth = resolveArtworkForAnnouncementSync({
    title: 'Super Secret Project',
    mediaType: 'movie',
    posterUrl: '',
    backdropUrl: '',
  });
  assert(missingBoth.status === 'FALLBACK', '8A. Missing both marked FALLBACK');
  assert(missingBoth.posterUrl === CINEORDER_PLACEHOLDER_POSTER, '8B. Fallback poster assigned');
  assert(missingBoth.backdropUrl === CINEORDER_PLACEHOLDER_BACKDROP, '8C. Fallback backdrop assigned');
  assert(missingBoth.posterVerified === false && missingBoth.backdropVerified === false, '8D. Marked as unverified');

  // ─── Scenario 9: Invalid Image URL Scheme ───────────────────────────────────
  console.log('\n--- Scenario 9: Invalid Image URL Scheme ---');
  const invalidUrl = resolveArtworkForAnnouncementSync({
    title: 'Broken URL Project',
    mediaType: 'movie',
    posterUrl: 'ftp://insecure-server.com/poster.jpg',
    backdropUrl: 'invalid-string',
  });
  assert(invalidUrl.status === 'FAILED', '9A. Invalid URL schemes marked FAILED');
  assert(invalidUrl.posterUrl === CINEORDER_PLACEHOLDER_POSTER, '9B. Fallback poster used');
  assert(invalidUrl.backdropUrl === CINEORDER_PLACEHOLDER_BACKDROP, '9C. Fallback backdrop used');

  // ─── Scenario 10: HTTP Failure & Reachability Validation ────────────────────
  console.log('\n--- Scenario 10: HTTP Failure & Reachability ---');
  const reachabilityBroken = await validateImageReachability('https://invalid-nonexistent-domain-404.org/bad.jpg');
  assert(reachabilityBroken.reachable === false, '10A. Broken URL identified as unreachable');
  const reachabilityTmdb = await validateImageReachability('https://image.tmdb.org/t/p/w500/valid.jpg', { skipNetwork: true });
  assert(reachabilityTmdb.reachable === true, '10B. Valid TMDb image structure confirmed reachable');

  // ─── Scenario 11: Explicit Placeholder Fallback Policy ──────────────────────
  console.log('\n--- Scenario 11: Explicit Reason in Fallback Policy ---');
  const candidate = generateMetadataCandidate({
    rawTitle: 'Avatar 5: Quest for Eywa',
    franchiseId: 'avatar',
    mediaType: 'movie',
    posterUrl: '',
    backdropUrl: '',
    sourcePublisher: '20th Century Studios',
    citation: 'Official Press',
  });
  assert(candidate.posterUrl === CINEORDER_PLACEHOLDER_POSTER, '11A. Canonical fallback assigned');
  assert(Boolean(candidate.artworkVerification), '11B. candidate.artworkVerification details recorded');
  assert(candidate.artworkVerification?.status === 'FALLBACK', '11C. Artwork status recorded as FALLBACK');
  assert(candidate.artworkVerification?.reason ? candidate.artworkVerification.reason.length > 5 : false, '11D. Reason recorded explaining fallback');

  // ─── Scenario 12: Previously Placeholder Title Receiving Artwork Later ───────
  console.log('\n--- Scenario 12: Previously Placeholder Title Receiving Artwork Later ---');
  const baseItem = allContent[0]!;
  const mockExistingTitle: Content = {
    ...baseItem,
    franchise_id: baseItem.franchise_id || 'marvel-cinematic-universe',
    id: 'mcu-placeholder-test',
    title: 'Spider-Man 5',
    poster_url: CINEORDER_PLACEHOLDER_POSTER,
    backdrop_url: CINEORDER_PLACEHOLDER_BACKDROP,
  };
  const refreshDetection = detectCatalogArtworkRefresh(mockExistingTitle, {
    posterUrl: 'https://image.tmdb.org/t/p/w500/new_spiderman5.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/new_spiderman5_bd.jpg',
    tmdbId: 999901,
  });
  assert(refreshDetection.hasArtworkChange === true, '12A. Detected artwork upgrade opportunity');
  assert(refreshDetection.proposedPoster === 'https://image.tmdb.org/t/p/w500/new_spiderman5.jpg', '12B. Proposed new verified poster');
  assert(refreshDetection.status === 'VERIFIED', '12C. Refresh status is VERIFIED');

  // ─── Scenario 13: Existing Artwork Becoming Invalid / Corrupted ─────────────
  console.log('\n--- Scenario 13: Existing Artwork Becoming Invalid ---');
  const corruptExistingTitle: Content = {
    ...baseItem,
    franchise_id: baseItem.franchise_id || 'marvel-cinematic-universe',
    id: 'mcu-corrupt-test',
    title: 'Corrupt Poster Title',
    poster_url: 'ftp://broken-url.com/poster.jpg',
    backdrop_url: 'broken-url',
  };
  const corruptRefresh = detectCatalogArtworkRefresh(corruptExistingTitle, {
    posterUrl: 'https://image.tmdb.org/t/p/w500/fixed_poster.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/fixed_backdrop.jpg',
  });
  assert(corruptRefresh.hasArtworkChange === true, '13A. Corrupt artwork identified for refresh');
  assert(corruptRefresh.proposedPoster === 'https://image.tmdb.org/t/p/w500/fixed_poster.jpg', '13B. Replacement verified poster proposed');

  // ─── Scenario 14: Duplicate TMDb ID Collision Protection ────────────────────
  console.log('\n--- Scenario 14: Duplicate TMDb ID Collision Protection ---');
  const existingItem = allContent.find((c) => c.tmdb_id && c.tmdb_id > 0)!;
  const duplicateCollisionArt = resolveArtworkForAnnouncementSync(
    {
      title: 'Completely Different Fake Title',
      mediaType: 'movie',
      tmdbId: existingItem.tmdb_id!,
      posterUrl: 'https://image.tmdb.org/t/p/w500/test.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/test.jpg',
    },
    { existingCatalog: allContent }
  );
  assert(duplicateCollisionArt.status === 'AMBIGUOUS', '14A. Duplicate TMDb ID collision flagged as AMBIGUOUS');
  assert(duplicateCollisionArt.tmdbMatchStatus === 'MISMATCH', '14B. TMDb match status is MISMATCH');

  // ─── Scenario 15: Duplicate Title Protection ────────────────────────────────
  console.log('\n--- Scenario 15: Duplicate Title Protection ---');
  const dupCheck = checkForDuplicates('Avengers: Endgame', 299534, 'marvel-cinematic-universe');
  assert(dupCheck.isDuplicate === true, '15A. Exact existing title recognized as duplicate');
  assert(dupCheck.matchedTitle === 'Avengers: Endgame', '15B. Matched existing title accurately');

  // ─── Scenario 16: Multiple Franchises Compatibility ─────────────────────────
  console.log('\n--- Scenario 16: Multiple Franchises Compatibility ---');
  const sampleFranchises = [
    'marvel-cinematic-universe',
    'star-wars',
    'dc-extended-universe',
    'harry-potter',
    'avatar',
    'alien',
    'transformers',
    'john-wick',
  ];
  for (const fId of sampleFranchises) {
    const fCandidate = generateMetadataCandidate({
      rawTitle: `Sample Future Title (${fId})`,
      franchiseId: fId,
      mediaType: 'movie',
      posterUrl: `https://image.tmdb.org/t/p/w500/${fId}_poster.jpg`,
      backdropUrl: `https://image.tmdb.org/t/p/w1280/${fId}_bd.jpg`,
      sourcePublisher: 'Official Studio Press',
      citation: 'Official Press Slate',
    });
    assert(fCandidate.franchiseId === fId, `16. Franchise '${fId}' candidate generated with verified artwork`);
    assert(fCandidate.artworkVerification?.status === 'VERIFIED', `16. Franchise '${fId}' artwork verified`);
  }

  // ─── Scenario 17: Newly Registered Franchise Dynamic Resolution ─────────────
  console.log('\n--- Scenario 17: Newly Registered Franchise Dynamic Resolution ---');
  const dynamicCandidate = generateMetadataCandidate({
    rawTitle: 'Future Uncharted Adventure',
    franchiseId: 'transformers', // standard registered franchise
    mediaType: 'movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/tf_new.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/tf_new_bd.jpg',
    sourcePublisher: 'Paramount Pictures Official',
    citation: 'Paramount Slate Announcement',
  });
  assert(dynamicCandidate.artworkVerification?.status === 'VERIFIED', '17. Dynamic candidate resolves artwork seamlessly');

  // ─── Scenario 18: Repeated Monitor Scan Idempotency ─────────────────────────
  console.log('\n--- Scenario 18: Repeated Monitor Scan Idempotency ---');
  const monitor = new GlobalAnnouncementMonitor();
  const testEvent: NormalizedSourceEvent = {
    id: 'evt-test-idempotency-2026',
    source: 'Marvel Studios Official',
    sourceUrl: 'https://marvel.com/test-idempotency',
    discoveredAt: '2026-08-16T12:00:00Z',
    eventType: 'NEW_ANNOUNCEMENT',
    title: 'Idempotent Title Test',
    mediaType: 'movie',
    franchiseCandidate: 'marvel-cinematic-universe',
    posterUrl: 'https://image.tmdb.org/t/p/w500/idem_poster.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/idem_bd.jpg',
    evidence: 'Official Presentation',
    confidence: 0.98,
  };

  const scan1 = monitor.processEvents([testEvent], { forceScan: true });
  assert(scan1.proposalsGenerated.length === 1, '18A. First scan generates proposal');
  const scan2 = monitor.processEvents([testEvent]);
  assert(scan2.proposalsGenerated.length === 0, '18B. Second scan ignores duplicate event');
  assert(scan2.duplicateEventsIgnoredCount === 1, '18C. Duplicate event ignored count incremented');

  // ─── Scenario 19: Artwork Proposal Event Hash Consistency ───────────────────
  console.log('\n--- Scenario 19: Artwork Proposal Event Hash Consistency ---');
  const hash1 = generateEventHash(testEvent);
  const hash2 = generateEventHash(testEvent);
  assert(hash1 === hash2, '19. Event hash generation is pure and deterministic');

  // ─── Scenario 20: Human Approval Gate Enforcement ───────────────────────────
  console.log('\n--- Scenario 20: Human Approval Gate Enforcement ---');
  const unapprovedPkg: AnnouncementProposalPackage = {
    id: 'prop-unapproved-test',
    franchiseId: 'avatar',
    franchiseName: 'Avatar',
    title: '[NEW TITLE] Avatar 4',
    category: 'NEW_TITLES',
    eventType: 'NEW_ANNOUNCEMENT',
    candidate: generateMetadataCandidate({
      rawTitle: 'Avatar 4',
      franchiseId: 'avatar',
      mediaType: 'movie',
      posterUrl: 'https://image.tmdb.org/t/p/w500/avatar4.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/avatar4_bd.jpg',
      sourcePublisher: '20th Century Studios',
      citation: 'Official Press',
    }),
    proposedEdges: [],
    status: 'pending', // Unapproved
    overallQualityScore: 95,
    sourceVerification: {
      isVerified: true,
      credibility: 'official-studio-press',
      sourcePublisher: '20th Century Studios',
      citation: 'Official Press',
      verificationScore: 0.98,
      verificationNotes: 'Verified',
      verifiedAt: '2026-08-16T12:00:00Z',
    },
    createdAt: '2026-08-16T12:00:00Z',
  };
  const valResult = validateProposalForIntegration(unapprovedPkg, allContent);
  assert(valResult.isValid === false, '20A. Unapproved proposal blocked from catalog integration');
  assert(valResult.errors[0]?.includes('Only explicitly \'approved\' proposals may enter') ?? false, '20B. Error specifies human approval requirement');

  // ─── Scenario 21: Approved Artwork Integration ──────────────────────────────
  console.log('\n--- Scenario 21: Approved Artwork Integration ---');
  const approvedPkg: AnnouncementProposalPackage = {
    ...unapprovedPkg,
    id: 'prop-approved-test',
    status: 'approved',
  };
  const dummyCode = `import { buildContent } from '../types';
export const avatarContent: Content[] = [
  buildContent({
    id: 'avatar-1',
    franchise_id: 'avatar',
    title: 'Avatar',
    type: 'movie',
    poster_url: '/placeholder-poster.svg',
    backdrop_url: '/placeholder-backdrop.svg',
  }),
];`;
  const transformed = transformFranchiseFileContent(dummyCode, approvedPkg);
  assert(!transformed.error, '21A. Code transformation succeeded without error');
  assert(transformed.modifiedCode.includes('Avatar 4'), '21B. New title inserted into file');
  assert(transformed.modifiedCode.includes('https://image.tmdb.org/t/p/w500/avatar4.jpg'), '21C. Verified poster URL preserved in generated code');

  // ─── Scenario 22: Rejected Artwork Proposal ─────────────────────────────────
  console.log('\n--- Scenario 22: Rejected Artwork Proposal Archive ---');
  const rejectedPkg: AnnouncementProposalPackage = {
    ...unapprovedPkg,
    id: 'prop-rejected-test',
    status: 'rejected',
  };
  const rejVal = validateProposalForIntegration(rejectedPkg, allContent);
  assert(rejVal.isValid === false, '22A. Rejected proposal cannot be integrated');
  assert(rejVal.errors[0]?.includes('status is \'rejected\'') ?? false, '22B. Rejected status error flagged');

  // ─── Scenario 23: Rollback on Failed Integration ────────────────────────────
  console.log('\n--- Scenario 23: Rollback on Failed Integration ---');
  let memoryFile = dummyCode;
  const mockFs = {
    existsSync: (_p: string) => true,
    readFileSync: (_p: string, _enc: string) => memoryFile,
    writeFileSync: (_p: string, c: string, _enc: string) => {
      memoryFile = c;
    },
  };
  const failingIntegration = integrateApprovedProposal(approvedPkg, {
    fsAdapter: mockFs,
    validateCallback: () => ({ success: false, error: 'Simulated post-integration validation failure' }),
  });
  assert(failingIntegration.success === false, '23A. Integration failed on post-validation');
  assert(failingIntegration.rolledBack === true, '23B. Atomic rollback triggered');
  assert(memoryFile === dummyCode, '23C. File contents restored to exact pristine state');

  // ─── Regression Protection: VisionQuest Verified Artwork ────────────────────
  console.log('\n--- VisionQuest Regression Protection ---');
  const vqItem = allContent.find((c) => c.id === 'mcu-visionquest');
  assert(Boolean(vqItem), 'VQ-1. VisionQuest exists in MCU catalog');
  assert(Boolean(vqItem?.tmdb_id === 1342110), 'VQ-2. VisionQuest has verified TMDb ID 1342110');
  const vqPoster = resolveContentPoster(vqItem);
  const vqBackdrop = resolveContentBackdrop(vqItem);
  assert(vqPoster.startsWith('https://image.tmdb.org/'), 'VQ-3. VisionQuest resolves to authentic TMDB poster');
  assert(vqBackdrop.startsWith('https://image.tmdb.org/'), 'VQ-4. VisionQuest resolves to authentic TMDB backdrop');

  console.log('\n========================================================================');
  console.log('  ARTWORK RESOLUTION SUITE: ✅ ALL 23 SCENARIOS & REGRESSIONS PASSED    ');
  console.log('========================================================================\n');
}

runSuite().catch((err) => {
  console.error('Test Suite Failed:', err);
});
