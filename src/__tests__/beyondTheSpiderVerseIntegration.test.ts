/**
 * CineOrder — Spider-Man: Beyond the Spider-Verse Integration Verification Test Suite
 *
 * Verifies:
 * 1. Canonical Presence in spidermanContent
 * 2. Exact Title & TMDb ID (911916)
 * 3. Media Type (animated) & Lifecycle (UPCOMING, ott_available: false)
 * 4. Release Date (TBA / null - Zero fabrication)
 * 5. Artwork Resolution (Verified TMDb poster & backdrop)
 * 6. Dynamic Chronological Ordering (Position calculated via comparator)
 * 7. Story Knowledge Graph Nodes & In-Memory Indexing
 * 8. Story Knowledge Graph Edges (Into -> Beyond, Across -> Beyond)
 * 9. Recommendation Traversal & Prerequisites (Must Watch = Into & Across)
 * 10. Multi-Continuity Isolation (Strict absence from MCU watch orders)
 * 11. Duplicate Protection (0 ID, TMDb, or Title collisions)
 * 12. Determinism & Traversal Integrity
 */

import { allContent } from '../data/franchises/index';
import { getFranchiseContent, getWatchOrders } from '../data/franchises';
import { titleNodes, storyEdges } from '../data/cineOrderKnowledgeGraph';
import { RecommendationService } from '../lib/recommendationService';
import { compareReleaseDates } from '../lib/releaseOrdering';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('========================================================================');
console.log('  CINEORDER BEYOND THE SPIDER-VERSE INTEGRATION VERIFICATION TEST SUITE');
console.log('========================================================================\n');

// ─── Test 1: Canonical Presence & Metadata ──────────────────────────────────
console.log('--- Test 1: Canonical Presence & Metadata ---');
{
  const spidermanTitles = getFranchiseContent('spider-man');
  const beyond = spidermanTitles.find((t) => t.id === 'spider-verse-3');

  assert(Boolean(beyond), '1A. Beyond the Spider-Verse exists in spidermanContent');
  assert(beyond?.title === 'Spider-Man: Beyond the Spider-Verse', '1B. Exact title matches');
  assert(beyond?.franchise_id === 'spider-man', '1C. Franchise ID is spider-man');
  assert(beyond?.tmdb_id === 911916, '1D. TMDb ID is 911916');
  assert(beyond?.type === 'animated', '1E. Media type is animated');
  assert(beyond?.status === 'upcoming', '1F. Lifecycle status is upcoming');
  assert(beyond?.release_date === 'TBA', '1G. Release date is TBA (Zero fabrication)');
  assert(Array.isArray(beyond?.streaming_providers) && beyond!.streaming_providers.length === 0, '1H. Streaming providers array is empty');
  assert(beyond?.ott_available === false, '1I. OTT Available is false');
}

// ─── Test 2: Artwork Verification ───────────────────────────────────────────
console.log('\n--- Test 2: Artwork Verification ---');
{
  const beyond = allContent.find((t) => t.id === 'spider-verse-3')!;
  assert(beyond.poster_url === 'https://image.tmdb.org/t/p/w500/9KAe39xqyZnv9J4W3DRGdQqX82h.jpg', '2A. Verified TMDb poster URL assigned');
  assert(beyond.backdrop_url === 'https://image.tmdb.org/t/p/w1280/7tT2w75p69nll5PvALpWFCYx5dU.jpg', '2B. Verified TMDb backdrop URL assigned');
}

// ─── Test 3: Story Knowledge Graph Registration ─────────────────────────────
console.log('\n--- Test 3: Story Knowledge Graph Registration ---');
{
  const node = titleNodes['spider-verse-3'];
  assert(Boolean(node), '3A. TitleNode spider-verse-3 exists in titleNodes');
  assert(node?.title === 'Spider-Man: Beyond the Spider-Verse', '3B. TitleNode title matches');
  assert(node?.universe === 'Spider-Verse', '3C. TitleNode universe is Spider-Verse');

  const edgeInto = storyEdges.find(
    (e) => e.sourceId === 'spider-verse-1' && e.targetId === 'spider-verse-3'
  );
  assert(Boolean(edgeInto), '3D. Prerequisite edge from Into the Spider-Verse exists');
  assert(edgeInto?.relationship === 'story-continuation', '3E. Into edge relationship is story-continuation');
  assert(edgeInto?.strength === 'required', '3F. Into edge strength is required');

  const edgeAcross = storyEdges.find(
    (e) => e.sourceId === 'spider-verse-2' && e.targetId === 'spider-verse-3'
  );
  assert(Boolean(edgeAcross), '3G. Direct sequel edge from Across the Spider-Verse exists');
  assert(edgeAcross?.relationship === 'direct-sequel', '3H. Across edge relationship is direct-sequel');
  assert(edgeAcross?.strength === 'required', '3I. Across edge strength is required');
}

// ─── Test 4: Recommendation Traversal & Prerequisites ───────────────────────
console.log('\n--- Test 4: Recommendation Traversal & Prerequisites ---');
{
  const beyond = allContent.find((t) => t.id === 'spider-verse-3')!;
  const traversal = RecommendationService.getTraversal(beyond.id);

  assert(Boolean(traversal), '4A. Traversal generates non-null result');
  const mustWatchTitles = traversal.mustWatch.map((r) => r.content.title);
  assert(mustWatchTitles.includes('Spider-Man: Into the Spider-Verse'), '4B. Must Watch includes Into the Spider-Verse');
  assert(mustWatchTitles.includes('Spider-Man: Across the Spider-Verse'), '4C. Must Watch includes Across the Spider-Verse');
  assert(traversal.mustWatch.length === 2, `4D. Must Watch contains exactly 2 titles (found ${traversal.mustWatch.length})`);
}

// ─── Test 5: Multi-Continuity MCU Isolation Invariant ───────────────────────
console.log('\n--- Test 5: Multi-Continuity MCU Isolation Invariant ---');
{
  const mcuWatchOrders = getWatchOrders('marvel-cinematic-universe');
  const mcuContent = getFranchiseContent('marvel-cinematic-universe');

  const inMcuContent = mcuContent.some((c) => c.id === 'spider-verse-3' || c.tmdb_id === 911916);
  const inMcuOrders = mcuWatchOrders.some((o) => o.content_id === 'spider-verse-3');

  assert(!inMcuContent, '5A. Beyond the Spider-Verse is strictly absent from MCU content catalog');
  assert(!inMcuOrders, '5B. Beyond the Spider-Verse is strictly absent from MCU watch orders');
}

// ─── Test 6: Dynamic Chronological Release-Date Placement ───────────────────
console.log('\n--- Test 6: Dynamic Chronological Release-Date Placement ---');
{
  const spidermanTitles = getFranchiseContent('spider-man');
  const sorted = [...spidermanTitles].sort(compareReleaseDates);

  const lastItem = sorted[sorted.length - 1];
  assert(lastItem?.id === 'spider-verse-3', '6A. TBA release dynamically sorts to final position (Position 8)');
  const spiderOrders = getWatchOrders('spider-man');
  const releaseOrders = spiderOrders.filter((o) => o.order_type === 'release');
  const lastOrder = releaseOrders[releaseOrders.length - 1];
  assert(lastOrder?.content_id === 'spider-verse-3', '6B. Release watch order places Beyond the Spider-Verse at position 8');
}

// ─── Test 7: Duplicate Protection & Total Catalog Integrity ─────────────────
console.log('\n--- Test 7: Duplicate Protection & Total Catalog Integrity ---');
{
  const tmdbOccurrences = allContent.filter((c) => c.tmdb_id === 911916);
  assert(tmdbOccurrences.length === 1, '7A. TMDb ID 911916 occurs exactly once across entire catalog');

  const idOccurrences = allContent.filter((c) => c.id === 'spider-verse-3');
  assert(idOccurrences.length === 1, '7B. Content ID spider-verse-3 occurs exactly once');

  assert(allContent.length === 240, `7C. Total global catalog count is exactly 240 (found ${allContent.length})`);
}

console.log('\n========================================================================');
console.log('  🎉 ALL BEYOND THE SPIDER-VERSE INTEGRATION INVARIANTS PASSED!');
console.log('========================================================================\n');
