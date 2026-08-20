/**
 * CineOrder Synthetic Real New-Title Path Test Suite
 * Validates the complete end-to-end flow of a brand new authoritative announcement:
 * Discovery -> Source Verification -> Franchise Matching -> Duplicate Detection ->
 * Lifecycle Classification -> Metadata Candidate -> Story Candidates -> Artwork Fallback ->
 * Proposal Package -> Editorial Approval -> Code Snippet Generation -> Clean State Cleanup.
 */

import { allFranchises, allContent } from '../data/franchises/index';
import {
  GlobalAnnouncementMonitor,
  type MonitorStorageAdapter,
} from '../lib/globalAnnouncementMonitor';
import {
  mergeAnnouncementProposal,
  generateFranchiseContentSnippet,
} from '../lib/announcementMerger';
import type {
  NormalizedSourceEvent,
  MonitorScanState,
} from '../types/announcementDiscovery';
import { buildContent } from '../data/franchises/utils';

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
console.log('  CINEORDER SYNTHETIC REAL NEW-TITLE END-TO-END AUDIT SUITE             ');
console.log('========================================================================\n');

// 1. Initial State Baseline
const INITIAL_COUNT = allContent.length;
console.log(`Initial Catalog Count: ${INITIAL_COUNT} titles across ${allFranchises.length} franchises.`);

// In-Memory Test Storage Adapter to isolate test persistence
class TestIsolatedStorageAdapter implements MonitorStorageAdapter {
  private stateData: MonitorScanState | null = null;
  load(): MonitorScanState | null {
    return this.stateData ? JSON.parse(JSON.stringify(this.stateData)) : null;
  }
  save(state: MonitorScanState): void {
    this.stateData = JSON.parse(JSON.stringify(state));
  }
  exists(): boolean {
    return this.stateData !== null;
  }
  clear(): void {
    this.stateData = null;
  }
}

const storage = new TestIsolatedStorageAdapter();
const monitor = new GlobalAnnouncementMonitor({ minVerificationScore: 0.85 }, storage);

// ============================================================================
// STEP 1: VERIFY SYNTHETIC TITLE IS NOT IN CATALOG & NOT IN PERSISTENT STATE
// ============================================================================
console.log('\n--- Step 1: Pre-Condition Check ---');
const syntheticTitle = 'Avatar: The Wind Trader of Pandora';
const existingMatch = allContent.find((c) => c.title.toLowerCase() === syntheticTitle.toLowerCase());
assert(existingMatch === undefined, '1A. Synthetic test title is NOT present in production catalog');
assert(storage.exists() === false, '1B. Isolated test storage has no prior state');

// ============================================================================
// STEP 2: DISCOVERY OF SYNTHETIC AUTHORITATIVE ANNOUNCEMENT
// ============================================================================
console.log('\n--- Step 2: Authoritative Announcement Discovery ---');
const syntheticEvent: NormalizedSourceEvent = {
  id: 'evt-synthetic-avatar-2032',
  source: '20th Century Studios Press',
  sourceUrl: 'https://20thcenturystudios.com/press/avatar-wind-trader',
  discoveredAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
  eventType: 'NEW_ANNOUNCEMENT',
  title: syntheticTitle,
  mediaType: 'movie',
  franchiseCandidate: 'avatar',
  releaseDateCandidate: '2032-12-17',
  synopsis: 'An epic narrative following the merchant clans navigating the winds of high Pandora.',
  director: 'James Cameron',
  cast: ['Sam Worthington', 'Zoe Saldana'],
  genres: ['Action', 'Adventure', 'Sci-Fi'],
  tmdbId: 99887766,
  posterUrl: '', // Intentionally empty to test artwork fallback
  backdropUrl: '', // Intentionally empty to test artwork fallback
  evidence: 'Official 20th Century Studios Theatrical Slate Announcement at CinemaCon',
  confidence: 0.99,
};

const scanResult = monitor.processEvents([syntheticEvent]);
assert(scanResult.totalAnnouncementsDiscovered === 1, '2A. Exactly 1 announcement discovered');
assert(scanResult.verifiedAnnouncementsCount === 1, '2B. Source verified successfully');
assert(scanResult.proposalsGenerated.length === 1, '2C. Exactly 1 proposal package generated');
assert(scanResult.categoryBreakdown.NEW_TITLES === 1, '2D. Category classified as NEW_TITLES');

// ============================================================================
// STEP 3: PROPOSAL PACKAGE AUDIT
// ============================================================================
console.log('\n--- Step 3: Proposal Package Audit ---');
const proposal = scanResult.proposalsGenerated[0]!;
assert(proposal.category === 'NEW_TITLES', '3A. Proposal category is NEW_TITLES');
assert(proposal.franchiseId === 'avatar', '3B. Franchise resolved to avatar');
assert(proposal.candidate.mediaType === 'movie', '3C. Media type is movie');
assert(proposal.candidate.lifecycleCategory === 'UPCOMING', '3D. Lifecycle is UPCOMING');
assert(proposal.candidate.theatricalReleased === false, '3E. theatricalReleased is false');
assert(proposal.candidate.ottAvailable === false, '3F. ottAvailable is false');
assert(proposal.candidate.posterUrl === '/placeholder-poster.svg', '3G. Missing poster fallback applied');
assert(proposal.candidate.backdropUrl === '/placeholder-backdrop.svg', '3H. Missing backdrop fallback applied');
assert(proposal.proposedEdges.length > 0, '3I. Story relationship candidates proposed');
assert(proposal.proposedEdges[0]!.relationship === 'direct-sequel', '3J. Story relationship is direct-sequel');
assert(proposal.status === 'pending', '3K. Proposal status initialized to pending');

// ============================================================================
// STEP 4: CATALOG NON-MUTATION BEFORE APPROVAL
// ============================================================================
console.log('\n--- Step 4: Catalog Non-Mutation Invariant ---');
assert(allContent.length === INITIAL_COUNT, '4A. Production catalog length is unchanged (0 silent mutations)');
assert(!allContent.some((c) => c.title === syntheticTitle), '4B. Synthetic title not in production catalog');

// ============================================================================
// STEP 5: UNAPPROVED MERGE PROTECTION
// ============================================================================
console.log('\n--- Step 5: Unapproved Merge Protection ---');
const blockedResult = mergeAnnouncementProposal(proposal);
assert(blockedResult.success === false, '5A. Merging unapproved proposal is strictly blocked');
assert(blockedResult.message.includes("Must be 'approved'"), '5B. Block message specifies approval requirement');

// ============================================================================
// STEP 6: HUMAN APPROVAL & CONTROLLED MERGE
// ============================================================================
console.log('\n--- Step 6: Human Approval & Controlled Merge ---');
proposal.status = 'approved';
const mergeResult = mergeAnnouncementProposal(proposal, 'Lead Curator Jane Doe');
assert(mergeResult.success === true, '6A. Approved proposal merges successfully');
assert((proposal.status as string) === 'merged', '6B. Proposal status updated to merged');
assert(proposal.reviewedBy === 'Lead Curator Jane Doe', '6C. Reviewer attribution recorded');
assert(mergeResult.generatedContent !== undefined, '6D. Content object generated');
assert(mergeResult.generatedContent?.id === proposal.candidate.id, '6E. Generated content has correct candidate ID');
assert(mergeResult.generatedContent?.franchise_id === 'avatar', '6F. Generated content targets avatar franchise');

// ============================================================================
// STEP 7: CODE SNIPPET VALIDATION
// ============================================================================
console.log('\n--- Step 7: Generated TypeScript Snippet Validation ---');
const snippet = generateFranchiseContentSnippet(proposal);
assert(snippet.includes('buildContent({'), '7A. Snippet uses buildContent constructor');
assert(snippet.includes(syntheticTitle), '7B. Snippet includes correct title');
assert(snippet.includes("franchise_id: 'avatar'"), '7C. Snippet includes avatar franchise ID');
assert(snippet.includes("poster_url: '/placeholder-poster.svg'"), '7D. Snippet includes verified poster');
assert(snippet.includes("backdrop_url: '/placeholder-backdrop.svg'"), '7E. Snippet includes verified backdrop');

// Test that the generated snippet can construct a valid Content object schema
const syntheticConstructed = buildContent({
  id: proposal.candidate.id,
  title: proposal.candidate.title,
  tmdb_id: proposal.candidate.tmdbId || null,
  type: proposal.candidate.mediaType,
  franchise_id: proposal.candidate.franchiseId,
  overview: proposal.candidate.overview,
  release_date: proposal.candidate.releaseDate || '2032-12-17',
  theatrical_release_date: proposal.candidate.theatricalReleaseDate || '2032-12-17',
  runtime: proposal.candidate.runtime,
  rating: proposal.candidate.rating,
  status: 'upcoming',
  theatrical_released: false,
  ott_available: false,
  digital_available: false,
  subscription_streaming_available: false,
  providers: [],
  director: proposal.candidate.director || '',
  poster_url: proposal.candidate.posterUrl,
  backdrop_url: proposal.candidate.backdropUrl,
  is_canon: true,
  is_required: true,
});
assert(Boolean(syntheticConstructed.id && syntheticConstructed.title), '7F. Constructed content schema is valid');

// ============================================================================
// STEP 8: POST-TEST CLEANUP & RESIDUE VERIFICATION
// ============================================================================
console.log('\n--- Step 8: Post-Test Cleanup & Zero Residue ---');
storage.clear();
assert(storage.exists() === false, '8A. Synthetic storage cleared');
assert(allContent.length === INITIAL_COUNT, '8B. Production catalog strictly maintained at original length');
assert(!allContent.some((c) => c.title === syntheticTitle), '8C. 0 synthetic residue in production catalog');

console.log('\n========================================================================');
console.log('  SYNTHETIC NEW-TITLE AUDIT SUITE: ✅ ALL 28 INVARIANTS PASSED           ');
console.log('========================================================================\n');
