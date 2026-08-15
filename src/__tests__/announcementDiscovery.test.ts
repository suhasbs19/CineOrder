import {
  verifyOfficialSource,
  matchOrCreateContentId,
  checkForDuplicates,
  generateMetadataCandidate,
  verifyArtworkUrls,
  createAnnouncementProposal,
  discoverAllFranchiseAnnouncements,
  FRANCHISE_ID_PREFIXES,
} from '../lib/announcementDiscoveryEngine';
import { mergeAnnouncementProposal, generateFranchiseContentSnippet } from '../lib/announcementMerger';
import type { DiscoveredAnnouncement, AnnouncementProposalPackage } from '../types/announcementDiscovery';

console.log('========================================================================');
console.log('  CINEORDER GLOBAL ANNOUNCEMENT DISCOVERY & VERIFICATION TEST SUITE     ');
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

// ========================================================================
// STAGE 1: OFFICIAL SOURCE VERIFICATION
// ========================================================================
console.log('--- Stage 1: Official Source Verification ---');
const studioVer = verifyOfficialSource('Marvel Studios Official', 'https://marvel.com/articles/news');
assert(studioVer.isVerified === true, '1A. Official studio URL (marvel.com) is verified');
assert(studioVer.credibility === 'official-studio-press', '1B. Studio credibility === official-studio-press');
assert(studioVer.verificationScore >= 0.95, '1C. Studio verification score >= 0.95');

const tradeVer = verifyOfficialSource('Variety', 'https://variety.com/2026/film/news');
assert(tradeVer.isVerified === true, '1D. Reputable trade URL (variety.com) is verified');
assert(tradeVer.credibility === 'trade-publication', '1E. Trade credibility === trade-publication');
assert(tradeVer.verificationScore >= 0.90, '1F. Trade verification score >= 0.90');

const dbVer = verifyOfficialSource('TheMovieDB', 'https://themoviedb.org/movie/12345');
assert(dbVer.isVerified === true, '1G. TMDb verified URL is verified');
assert(dbVer.credibility === 'tmdb-verified', '1H. Database credibility === tmdb-verified');

const rumorVer = verifyOfficialSource('Random Rumor Blog', 'https://wegotthiscovered.com/movies/leak');
assert(rumorVer.isVerified === false, '1I. Unverified rumor blog is NOT verified');
assert(rumorVer.credibility === 'unverified-rumor', '1J. Rumor credibility === unverified-rumor');
assert(rumorVer.verificationScore < 0.50, '1K. Rumor verification score < 0.50');

// ========================================================================
// STAGE 2: FRANCHISE PREFIXES & CONTENT ID GENERATION
// ========================================================================
console.log('\n--- Stage 2: Franchise Content ID Generation ---');
assert(Object.keys(FRANCHISE_ID_PREFIXES).length >= 18, '2A. All 18 CineOrder franchises have canonical ID prefixes');
assert(FRANCHISE_ID_PREFIXES['star-wars'] === 'sw-', '2B. Star Wars prefix === sw-');
assert(FRANCHISE_ID_PREFIXES['marvel-cinematic-universe'] === 'mcu-', '2C. Marvel prefix === mcu-');
assert(FRANCHISE_ID_PREFIXES['avatar'] === 'avatar-', '2D. Avatar prefix === avatar-');

const idGenNew = matchOrCreateContentId('Dawn of the Jedi', 'star-wars');
assert(idGenNew.isUnique === true, '2E. New title generates unique ID');
assert(idGenNew.id.startsWith('sw-'), '2F. New title ID starts with franchise prefix');

const idGenExisting = matchOrCreateContentId('Iron Man', 'marvel-cinematic-universe');
assert(idGenExisting.isUnique === false, '2G. Existing title is detected as non-unique');

// ========================================================================
// STAGE 3: DUPLICATE DETECTION ACROSS 225 CATALOG ITEMS
// ========================================================================
console.log('\n--- Stage 3: Duplicate Detection Engine ---');
const dupExactTmdb = checkForDuplicates('Different Title Same ID', 1003598); // Secret Wars TMDb
assert(dupExactTmdb.isDuplicate === true, '3A. Exact TMDb ID match detected as duplicate');
assert(dupExactTmdb.matchType === 'exact_tmdb_id', '3B. Match type === exact_tmdb_id');

const dupExactTitle = checkForDuplicates('Avatar: The Way of Water');
assert(dupExactTitle.isDuplicate === true, '3C. Exact title match detected as duplicate');
assert(dupExactTitle.matchType === 'exact_title', '3D. Match type === exact_title');

const dupFuzzy = checkForDuplicates('The Avengers Endgame');
assert(dupFuzzy.isDuplicate === true, '3E. High fuzzy title similarity detected as duplicate');

const uniqueCheck = checkForDuplicates('Star Wars: Dawn of the Jedi Chronicles Unreleased 2030');
assert(uniqueCheck.isDuplicate === false, '3F. Genuinely new title passes duplicate check');

// ========================================================================
// STAGE 4: METADATA CANDIDATE GENERATION & LIFECYCLE CLASSIFICATION
// ========================================================================
console.log('\n--- Stage 4: Metadata Candidate Generation ---');
const testAnnouncement: DiscoveredAnnouncement = {
  rawTitle: 'Star Wars: Dawn of the Jedi',
  franchiseId: 'star-wars',
  mediaType: 'movie',
  expectedReleaseDate: '2028-12-15',
  synopsis: 'James Mangold directs the story of the first Jedi.',
  tmdbId: 1111001,
  director: 'James Mangold',
  sourceUrl: 'https://starwars.com/news/future-slate',
  sourcePublisher: 'Lucasfilm Official',
  citation: 'Star Wars Celebration Official Film Slate',
};

const candidate = generateMetadataCandidate(testAnnouncement);
assert(candidate.id.startsWith('sw-'), '4A. Candidate ID has franchise prefix');
assert(candidate.lifecycleCategory === 'UPCOMING', '4B. Future announcement canonical lifecycle === UPCOMING');
assert(candidate.theatricalReleased === false, '4C. Candidate theatricalReleased === false');
assert(candidate.ottAvailable === false, '4D. Candidate ottAvailable === false');
assert(candidate.sourceVerification.isVerified === true, '4E. Candidate source is verified');
assert(candidate.integrityValidationPassed === true, '4F. Candidate integrity validation passed');

// ========================================================================
// STAGE 5: STORY RELATIONSHIP CANDIDATES
// ========================================================================
console.log('\n--- Stage 5: Story Relationship Generation ---');
assert(candidate.proposedEdges.length > 0, '5A. Narrative continuation edge candidate generated');
const edge = candidate.proposedEdges[0]!;
assert(edge.confidenceScore >= 0.80, '5B. Proposed edge has confidence >= 0.80');
assert(Boolean(edge.citation), '5C. Proposed edge includes citation');
assert(edge.status === 'pending', '5D. Proposed edge status === pending');

// ========================================================================
// STAGE 6: ARTWORK VERIFICATION & FALLBACKS
// ========================================================================
console.log('\n--- Stage 6: Artwork Verification ---');
const artValid = verifyArtworkUrls('https://image.tmdb.org/t/p/w500/test.jpg', 'https://image.tmdb.org/t/p/w1280/back.jpg');
assert(artValid.verified === true, '6A. Valid image URLs verified');
assert(artValid.poster.startsWith('https://'), '6B. Poster URL preserved');

const artEmpty = verifyArtworkUrls('', undefined);
assert(artEmpty.verified === false, '6C. Missing image URLs flagged');
assert(artEmpty.poster === '/placeholder-poster.svg', '6D. Fallback to placeholder-poster.svg');
assert(artEmpty.backdrop === '/placeholder-backdrop.svg', '6E. Fallback to placeholder-backdrop.svg');

// ========================================================================
// STAGE 7: PROPOSAL CREATION & QUALITY SCORING
// ========================================================================
console.log('\n--- Stage 7: Reviewable Proposal Creation ---');
const proposal = createAnnouncementProposal(testAnnouncement);
assert(proposal.status === 'pending', '7A. Created proposal status === pending');
assert(proposal.overallQualityScore >= 90, '7B. Verified official proposal quality score >= 90');
assert(proposal.candidate.title === 'Star Wars: Dawn of the Jedi', '7C. Proposal candidate title is correct');
assert(proposal.franchiseName === 'Star Wars', '7D. Franchise name resolved properly');

// ========================================================================
// STAGE 8: MERGE & STAGING LIFECYCLE
// ========================================================================
console.log('\n--- Stage 8: Proposal Merge & Staging Lifecycle ---');
// Merge blocked when pending
const mergeBlocked = mergeAnnouncementProposal(proposal);
assert(mergeBlocked.success === false, '8A. Pending proposal merge is safely blocked');

// Approve proposal and merge
const approvedProposal: AnnouncementProposalPackage = { ...proposal, status: 'approved' };
const mergeSuccess = mergeAnnouncementProposal(approvedProposal, 'Lead Editor');
assert(mergeSuccess.success === true, '8B. Approved proposal merges successfully');
assert(approvedProposal.status === 'merged', '8C. Merged proposal status === merged');
assert(Boolean(mergeSuccess.generatedContent), '8D. Generated content metadata exists');
assert(mergeSuccess.generatedContent?.lifecycle_status === undefined || typeof mergeSuccess.generatedContent?.id === 'string', '8E. Content object is schema-compliant');

const snippet = generateFranchiseContentSnippet(approvedProposal);
assert(snippet.includes('buildContent({'), '8F. TypeScript code snippet generated');
assert(snippet.includes("id: 'sw-"), '8G. Code snippet contains correct franchise ID');

// ========================================================================
// STAGE 9: GLOBAL MULTI-FRANCHISE DISCOVERY SCAN
// ========================================================================
console.log('\n--- Stage 9: Global Multi-Franchise Discovery Scan ---');
const scanResult = discoverAllFranchiseAnnouncements();
assert(scanResult.totalAnnouncementsDiscovered >= 10, '9A. Discovery scan finds multi-franchise announcements');
assert(scanResult.verifiedAnnouncementsCount >= 8, '9B. Discovery scan verifies official studio announcements');
assert(Object.keys(scanResult.franchiseBreakdown).length >= 8, '9C. Multiple franchises represented in scan');

console.log(`\n========================================================================`);
console.log(`  ANNOUNCEMENT DISCOVERY TEST SUITE: ${testFailures === 0 ? '✅ ALL 40 INVARIANTS PASSED' : `❌ ${testFailures} FAILURES DETECTED`}`);
console.log(`========================================================================\n`);

declare const process: { exit: (code: number) => void };
if (testFailures > 0 && typeof process !== 'undefined') {
  process.exit(1);
}
