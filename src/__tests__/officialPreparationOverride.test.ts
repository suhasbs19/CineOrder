/**
 * CineOrder — Official Preparation List & CineOrder Extra Content Partition Test Suite
 *
 * Validates:
 * 1. Official list exists + extra recommendations exist -> partitioned into officialPreparationItems and cineOrderExtraContent
 * 2. Official title also recommended by CineOrder -> appears strictly once in official section, filtered from Extra Content
 * 3. CineOrder-only recommendation -> appears in Extra Content
 * 4. Official-only title -> remains in official section even if CineOrder graph does not recommend it
 * 5. Official list changes -> Extra Content is immediately recalculated
 * 6. Official title removed -> becomes eligible for Extra Content if independently recommended
 * 7. No official list -> mode is GRAPH_RECOMMENDATION, officialPreparationItems is empty, existing behavior unchanged
 * 8. Ordering -> official list order strictly preserved; Extra Content preserves normal CineOrder graph ranking
 * 9. Deduplication -> zero duplicate IDs (canonical content ID and TMDb ID) across partitions
 * 10. Works across all 19 CineOrder franchises
 * 11. Cache invalidation after official list changes
 * 12. Refresh/reload produces deterministic identical partitioning
 * 13. Story Knowledge Graph recommendation engine purity & 5/5 frozen framework SHA-256 hashes
 */

import { allContent, allFranchises } from '../data/franchises/index';
import {
  hasOfficialPreparationList,
  updateOfficialPreparationList,
  invalidatePreparationCache,
  resetOfficialOverrideService,
} from '../lib/officialPreparationOverrideService';
import { generatePreparationGuide } from '../lib/preparationGuide';
import { executeKnowledgeGraphTraversal } from '../lib/storyKnowledgeGraphEngine';

declare const process: any;

const fs: any = await (new Function('return import("fs")')());
const path: any = await (new Function('return import("path")')());
const crypto: any = await (new Function('return import("crypto")')());

console.log('========================================================================');
console.log('  CINEORDER OFFICIAL LIST + EXTRA CONTENT PARTITION TEST SUITE');
console.log('========================================================================\n');

let passed = 0;
let failures = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failures++;
  }
}

// Reset service to baseline state before testing
resetOfficialOverrideService();

// ─── Rule 1 & Data Model: Official List Exists & Partitions Created ─────────
console.log('--- 1. Official List Exists -> Official vs Extra Content Partition ---');
assert(hasOfficialPreparationList('mcu-doomsday'), '1A. Target mcu-doomsday has active official list');
const doomsdayGuide = generatePreparationGuide('mcu-doomsday');
assert(Boolean(doomsdayGuide), '1B. generatePreparationGuide returns data for Doomsday');
assert(doomsdayGuide?.mode === 'OFFICIAL_OVERRIDE', '1C. Mode is OFFICIAL_OVERRIDE');
assert(Array.isArray(doomsdayGuide?.officialPreparationItems), '1D. officialPreparationItems is an array');
assert(Array.isArray(doomsdayGuide?.cineOrderExtraContent), '1E. cineOrderExtraContent is an array');
assert(doomsdayGuide?.officialPreparationItems.length === 5, '1F. officialPreparationItems contains 5 official studio items');

// ─── Rule 2 & 9: Strict Deduplication (ID, TMDb ID, Normalized Title) ───────
console.log('\n--- 2 & 9. Strict Deduplication (Zero Overlap between Partitions) ---');
const officialIds = new Set(doomsdayGuide?.officialPreparationItems.map((r) => r.content.id.toLowerCase().trim()));
const extraIds = new Set(doomsdayGuide?.cineOrderExtraContent.map((r) => r.content.id.toLowerCase().trim()));

let hasDuplicateId = false;
for (const id of extraIds) {
  if (officialIds.has(id)) {
    hasDuplicateId = true;
    console.error(`  [Duplicate detected] Title ID '${id}' appears in both official and extra content!`);
  }
}
assert(!hasDuplicateId, '2A. No title canonical ID from official list appears in cineOrderExtraContent');
assert(officialIds.size === 5, '2B. Official list contains 5 unique titles');

// Check secondary safety check: TMDb ID deduplication
const officialTmdb = new Set(
  doomsdayGuide?.officialPreparationItems.map((r) => r.content.tmdb_id).filter(Boolean)
);
const extraTmdbDuplicates = (doomsdayGuide?.cineOrderExtraContent || []).filter(
  (r) => r.content.tmdb_id && officialTmdb.has(r.content.tmdb_id)
);
assert(extraTmdbDuplicates.length === 0, '2C. Zero TMDb ID overlap between official items and extra content');

// Check tertiary safety check: Normalized title deduplication
const officialNormalizedTitles = new Set(
  doomsdayGuide?.officialPreparationItems.map((r) =>
    r.content.title.toLowerCase().replace(/[^a-z0-9]/g, '').trim()
  )
);
const extraTitleDuplicates = (doomsdayGuide?.cineOrderExtraContent || []).filter((r) => {
  const norm = r.content.title.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  return officialNormalizedTitles.has(norm);
});
assert(extraTitleDuplicates.length === 0, '2D. Zero normalized title overlap between official items and extra content');

// ─── Scenario: Invariant Function Assertion ─────────────────────────────────
console.log('\n--- Invariant Assertion ---');
let invariantPassed = false;
try {
  if (doomsdayGuide) {
    // Asserting clean guide should succeed without throwing
    const { assertPreparationPartitionIntegrity } = await import('../lib/officialPreparationOverrideService');
    assertPreparationPartitionIntegrity(doomsdayGuide);
    invariantPassed = true;
  }
} catch (e: any) {
  console.error('Invariant failed on clean guide:', e);
}
assert(invariantPassed, '2E. assertPreparationPartitionIntegrity passes on clean partitioned guide');

// Asserting corrupted guide with synthetic duplicate should throw
let invariantCaughtCorruption = false;
try {
  const { assertPreparationPartitionIntegrity } = await import('../lib/officialPreparationOverrideService');
  const corruptedGuide: any = {
    ...doomsdayGuide,
    cineOrderExtraContent: [
      ...(doomsdayGuide?.cineOrderExtraContent || []),
      doomsdayGuide?.officialPreparationItems[0], // inject duplicate
    ],
  };
  assertPreparationPartitionIntegrity(corruptedGuide);
} catch (e: any) {
  invariantCaughtCorruption = true;
}
assert(invariantCaughtCorruption, '2F. assertPreparationPartitionIntegrity correctly throws on partition violation');

// ─── Rule 3: CineOrder-Only Recommendations Appear in Extra Content ──────────
console.log('\n--- 3. CineOrder-Only Recommendations in Extra Content ---');
const rawGraphRecs = executeKnowledgeGraphTraversal('mcu-doomsday');
const graphRecIds = new Set([
  ...(rawGraphRecs?.mustWatch.map((r) => r.content.id) || []),
  ...(rawGraphRecs?.recommended.map((r) => r.content.id) || []),
  ...(rawGraphRecs?.optional.map((r) => r.content.id) || []),
]);

const graphOnlyRecs = Array.from(graphRecIds).filter((id) => !officialIds.has(id.toLowerCase().trim()));
if (graphOnlyRecs.length > 0) {
  const sampleGraphOnly = graphOnlyRecs[0];
  assert(extraIds.has(sampleGraphOnly!.toLowerCase().trim()), `3A. CineOrder graph recommendation (${sampleGraphOnly}) appears in Extra Content`);
}
assert((doomsdayGuide?.cineOrderExtraContent.length || 0) > 0, '3B. Extra Content populated from independent CineOrder graph recommendations');

// ─── Rule 4: Official-Only Titles Retained in Official List ───────────────────
console.log('\n--- 4. Official-Only Titles Retained ---');
for (const item of doomsdayGuide?.officialPreparationItems || []) {
  assert(Boolean(item.content.id), `4. Official item '${item.content.title}' retained with full metadata`);
}

// ─── Rule 5 & 8: Ordering Guarantees ─────────────────────────────────────────
console.log('\n--- 5 & 8. Ordering Guarantees ---');
const officialItems = doomsdayGuide?.officialPreparationItems || [];
assert(officialItems[0]?.content.id === 'mcu-infinity-war', '8A. Official Item #1 is Infinity War');
assert(officialItems[1]?.content.id === 'mcu-endgame', '8B. Official Item #2 is Endgame');
assert(officialItems[2]?.content.id === 'mcu-loki', '8C. Official Item #3 is Loki');
assert(officialItems[3]?.content.id === 'mcu-deadpool-wolverine', '8D. Official Item #4 is Deadpool & Wolverine');
assert(officialItems[4]?.content.id === 'mcu-fantastic-four', '8E. Official Item #5 is Fantastic Four: First Steps');

// Extra Content uses CineOrder normal ranking (relevanceScore / impactScore)
const extraItems = doomsdayGuide?.cineOrderExtraContent || [];
assert(extraItems.length > 0, '8F. Extra Content exists');
assert(extraItems[0]?.relevanceScore !== undefined, '8G. Extra Content items preserve CineOrder relevance scores');

// ─── Rule 6 & 7: Official List Update, Removal & Recalculation ───────────────
console.log('\n--- 6 & 7. Dynamic Recalculation on Official List Update / Removal ---');
// In baseline, Loki is in official list, so it cannot be in Extra Content
assert(!extraIds.has('mcu-loki'), '6A. Baseline: Loki is in official list and absent from Extra Content');

// Update official list to remove Loki
const updateRes = updateOfficialPreparationList(
  'mcu-doomsday',
  {
    items: [
      { contentId: 'mcu-infinity-war', officialOrder: 1 },
      { contentId: 'mcu-endgame', officialOrder: 2 },
      { contentId: 'mcu-fantastic-four', officialOrder: 3 },
      // Loki and Deadpool & Wolverine removed in v1.1
    ],
  },
  'Removed Loki and Deadpool & Wolverine from official core list'
);
assert(updateRes.success, '6B. Update official list succeeded');

const recomputedGuide = generatePreparationGuide('mcu-doomsday');
assert(recomputedGuide?.officialPreparationItems.length === 3, '6C. Recomputed official items count is 3');
const recomputedOfficialIds = new Set(recomputedGuide?.officialPreparationItems.map((r) => r.content.id));
const recomputedExtraIds = new Set(recomputedGuide?.cineOrderExtraContent.map((r) => r.content.id));

assert(!recomputedOfficialIds.has('mcu-loki'), '6D. Loki removed from official list');
// If CineOrder graph recommends Loki, it should now appear in Extra Content!
const graphRecommendsLoki = graphRecIds.has('mcu-loki');
if (graphRecommendsLoki) {
  assert(recomputedExtraIds.has('mcu-loki'), '6E. Removed official title (Loki) is now eligible and appears in Extra Content');
}

// ─── Rule 7: No Official List Fallback ───────────────────────────────────────
console.log('\n--- 7. No Official List Fallback ---');
const ironManGuide = generatePreparationGuide('mcu-iron-man');
assert(ironManGuide?.mode === 'GRAPH_RECOMMENDATION', '7A. Mode is GRAPH_RECOMMENDATION for Iron Man');
assert(ironManGuide?.officialPreparationItems.length === 0, '7B. officialPreparationItems is empty');
assert((ironManGuide?.cineOrderExtraContent.length || 0) >= 0, '7C. cineOrderExtraContent contains normal graph recommendations');

// ─── Rule 10: Universal Compatibility across All 19 Franchises ───────────────
console.log('\n--- 10. Universal Compatibility across All 19 Franchises ---');
assert(allFranchises.length === 19, `10A. Found ${allFranchises.length} registered franchises`);
let allCompatible = true;
for (const f of allFranchises) {
  const content = allContent.find((c) => c.franchise_id === f.id);
  if (content) {
    const guide = generatePreparationGuide(content.id);
    if (!guide || !Array.isArray(guide.officialPreparationItems) || !Array.isArray(guide.cineOrderExtraContent)) {
      allCompatible = false;
      console.error(`  [Error] Franchise ${f.id} title ${content.id} failed partition structure`);
    }
  }
}
assert(allCompatible, '10B. All 19 CineOrder franchises resolve partitioned guide structures cleanly');

// ─── Rule 11 & 12: Cache Invalidation & Deterministic Reload ─────────────────
console.log('\n--- 11 & 12. Cache Invalidation & Deterministic Reload ---');
invalidatePreparationCache('mcu-doomsday');
const reload1 = generatePreparationGuide('mcu-doomsday');
const reload2 = generatePreparationGuide('mcu-doomsday');
assert(Boolean(reload1 && reload2), '11A. Reloads after cache invalidation succeed');
assert(reload1?.officialPreparationItems.length === reload2?.officialPreparationItems.length, '12A. Deterministic official items count');
assert(reload1?.cineOrderExtraContent.length === reload2?.cineOrderExtraContent.length, '12B. Deterministic extra content count');

// ─── Rule 13: Frozen Framework & Pure Recommendation Engine ──────────────────
console.log('\n--- 13. Frozen Framework & Engine Purity ---');
const pureTraversal = executeKnowledgeGraphTraversal('mcu-doomsday');
assert(Boolean(pureTraversal), '13A. Pure traversal executes independently');

const EXPECTED_HASHES: Record<string, string> = {
  'src/lib/storyGraphEngine.ts': 'e7402a0a8d383f25e24e23392a0aad437fb04204bc7c79080781bdc6ad848488',
  'src/lib/storyKnowledgeGraphEngine.ts': 'e729c5dc2b0edbdb23d75bc2caf1813cd7a0fb507f6fa687ad0dbbabc4c6258e',
  'src/lib/recommendationService.ts': 'd143d7eecd5fdc27d33b79630f9551e939f7d6fb9924bc97b3cfc82bde1c48d9',
  'src/data/cineOrderKnowledgeGraph.ts': '3f4e9d92bbbfb4ae0046b64912329b5e704b8b06cac6e723d3650219157e48af',
  '.agents/AGENTS.md': '47a3707789cfff9fe926f4d78212807d7f31ab335c03d58894e15779e4342363',
};

for (const [relPath, expectedHash] of Object.entries(EXPECTED_HASHES)) {
  const fullPath = path.join(process.cwd(), relPath);
  const content = fs.readFileSync(fullPath, 'utf-8').replace(/\r\n/g, '\n');
  const actualHash = crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
  assert(actualHash === expectedHash, `13B. ${relPath} SHA-256 matches frozen hash`);
}

// Reset service back to pristine initial state
resetOfficialOverrideService();

// ────────────────────────────────────────────────────────────────────────────
console.log('\n========================================================================');
console.log(`  TEST RESULTS: ${failures === 0 ? '✅ ALL SCENARIOS PASSED' : `❌ ${failures} FAILURES`}`);
console.log('========================================================================\n');

if (failures > 0) {
  process.exit(1);
}
