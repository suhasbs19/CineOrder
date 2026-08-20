/**
 * CineOrder — Spider-Man: No Way Home Cross-Continuity Prerequisite Test Suite
 *
 * Validates:
 *  1. No Way Home exists in canonical catalog.
 *  2. Sam Raimi trilogy exists (Spider-Man 1, 2, 3).
 *  3. Marc Webb Amazing Spider-Man films exist (TASM 1, 2).
 *  4. MCU Spider-Man prerequisites exist (Homecoming, Far From Home).
 *  5. Cross-continuity prerequisite relationships exist in Knowledge Graph.
 *  6. Recommendation engine discovers all 7 required prerequisites.
 *  7. PreparationGuide displays all 7 prerequisites.
 *  8. Watch-time calculation accurately accounts for all prerequisites.
 *  9. Separate continuities remain isolated in their respective franchises.
 * 10. Raimi and Webb titles are NOT added to MCU release or chronological order.
 * 11. Zero duplicate graph edges created for No Way Home prerequisites.
 * 12. Repeated recommendation calculations remain 100% deterministic.
 */

import { allContent } from '../data/franchises/index';
import { RecommendationService } from '../lib/recommendationService';
import { generatePreparationGuide } from '../lib/preparationGuide';
import { storyEdges } from '../data/cineOrderKnowledgeGraph';
import { getFranchiseContent, getWatchOrders } from '../data/franchises';

declare const process: any;

let testFailures = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    testFailures++;
  }
}

console.log('========================================================================');
console.log('  CINEORDER NO WAY HOME CROSS-CONTINUITY PREREQUISITE TEST SUITE       ');
console.log('========================================================================\n');

const NWH_ID = 'mcu-no-way-home';

// ─── Test 1: No Way Home exists ───────────────────────────────────────────
console.log('--- Test 1: No Way Home Canonical Presence ---');
const nwh = allContent.find((c) => c.id === NWH_ID);
assert(Boolean(nwh), '1A. Spider-Man: No Way Home exists in canonical catalog');
assert(nwh?.title === 'Spider-Man: No Way Home', '1B. Exact title matches Spider-Man: No Way Home');
assert(nwh?.franchise_id === 'marvel-cinematic-universe', '1C. Franchise ID is marvel-cinematic-universe');
assert(nwh?.tmdb_id === 634649, '1D. TMDb ID is 634649');
assert(nwh?.status === 'released', '1E. Status is released');

// ─── Test 2: Raimi trilogy exists ──────────────────────────────────────────
console.log('\n--- Test 2: Sam Raimi Spider-Man Trilogy Presence ---');
const raimi1 = allContent.find((c) => c.id === 'spiderman-1');
const raimi2 = allContent.find((c) => c.id === 'spiderman-2');
const raimi3 = allContent.find((c) => c.id === 'spiderman-3');

assert(Boolean(raimi1), '2A. Spider-Man (2002) exists in catalog');
assert(raimi1?.tmdb_id === 557, '2B. Spider-Man (2002) TMDb ID is 557');
assert(raimi1?.release_date === '2002-05-03', '2C. Spider-Man (2002) release date is 2002-05-03');
assert(raimi1?.director === 'Sam Raimi', '2D. Spider-Man (2002) director is Sam Raimi');

assert(Boolean(raimi2), '2E. Spider-Man 2 (2004) exists in catalog');
assert(raimi2?.tmdb_id === 558, '2F. Spider-Man 2 (2004) TMDb ID is 558');
assert(raimi2?.release_date === '2004-06-30', '2G. Spider-Man 2 (2004) release date is 2004-06-30');
assert(raimi2?.director === 'Sam Raimi', '2H. Spider-Man 2 (2004) director is Sam Raimi');

assert(Boolean(raimi3), '2I. Spider-Man 3 (2007) exists in catalog');
assert(raimi3?.tmdb_id === 559, '2J. Spider-Man 3 (2007) TMDb ID is 559');
assert(raimi3?.release_date === '2007-05-04', '2K. Spider-Man 3 (2007) release date is 2007-05-04');
assert(raimi3?.director === 'Sam Raimi', '2L. Spider-Man 3 (2007) director is Sam Raimi');

// ─── Test 3: Amazing Spider-Man films exist ────────────────────────────────
console.log('\n--- Test 3: Marc Webb The Amazing Spider-Man Dilogy Presence ---');
const tasm1 = allContent.find((c) => c.id === 'amazing-spiderman-1');
const tasm2 = allContent.find((c) => c.id === 'amazing-spiderman-2');

assert(Boolean(tasm1), '3A. The Amazing Spider-Man (2012) exists in catalog');
assert(tasm1?.tmdb_id === 1930, '3B. The Amazing Spider-Man (2012) TMDb ID is 1930');
assert(tasm1?.release_date === '2012-07-03', '3C. The Amazing Spider-Man (2012) release date is 2012-07-03');
assert(tasm1?.director === 'Marc Webb', '3D. The Amazing Spider-Man (2012) director is Marc Webb');

assert(Boolean(tasm2), '3E. The Amazing Spider-Man 2 (2014) exists in catalog');
assert(tasm2?.tmdb_id === 102382, '3F. The Amazing Spider-Man 2 (2014) TMDb ID is 102382');
assert(tasm2?.release_date === '2014-05-02', '3G. The Amazing Spider-Man 2 (2014) release date is 2014-05-02');
assert(tasm2?.director === 'Marc Webb', '3H. The Amazing Spider-Man 2 (2014) director is Marc Webb');

// ─── Test 4: MCU Spider-Man prerequisites exist ────────────────────────────
console.log('\n--- Test 4: MCU Spider-Man Predecessor Films Presence ---');
const homecoming = allContent.find((c) => c.id === 'mcu-spider-man-homecoming');
const ffh = allContent.find((c) => c.id === 'mcu-spider-man-ffh');

assert(Boolean(homecoming), '4A. Spider-Man: Homecoming (2017) exists in MCU catalog');
assert(homecoming?.franchise_id === 'marvel-cinematic-universe', '4B. Homecoming belongs to MCU franchise');
assert(Boolean(ffh), '4C. Spider-Man: Far From Home (2019) exists in MCU catalog');
assert(ffh?.franchise_id === 'marvel-cinematic-universe', '4D. Far From Home belongs to MCU franchise');

// ─── Test 5: Cross-continuity prerequisite relationships ────────────────────
console.log('\n--- Test 5: Story Knowledge Graph Prerequisite Edges ---');
const requiredSourceIds = [
  'spiderman-1',
  'spiderman-2',
  'spiderman-3',
  'amazing-spiderman-1',
  'amazing-spiderman-2',
  'mcu-spider-man-homecoming',
  'mcu-spider-man-ffh',
];

for (const srcId of requiredSourceIds) {
  const edge = storyEdges.find(
    (e) => e.sourceId === srcId && (e.targetId === 'mcu-spiderman-no-way-home' || e.targetId === NWH_ID)
  );
  assert(Boolean(edge), `5. Knowledge graph edge exists from ${srcId} to No Way Home`);
  assert(edge?.strength === 'required', `   Edge strength is required for ${srcId}`);
  assert(edge?.confidence === 'confirmed', `   Edge confidence is confirmed for ${srcId}`);
}

// ─── Test 6: Recommendation engine discovers all 7 prerequisites ───────────
console.log('\n--- Test 6: Recommendation Engine Discovery ---');
RecommendationService.clearCache();
const traversal = RecommendationService.getTraversal(NWH_ID);
const mustWatchIds = traversal.mustWatch.map((r) => r.content.id);
const mustWatchTitles = traversal.mustWatch.map((r) => r.content.title);

assert(mustWatchTitles.includes('Spider-Man'), '6A. Must Watch includes Spider-Man (2002)');
assert(mustWatchTitles.includes('Spider-Man 2'), '6B. Must Watch includes Spider-Man 2 (2004)');
assert(mustWatchTitles.includes('Spider-Man 3'), '6C. Must Watch includes Spider-Man 3 (2007)');
assert(mustWatchTitles.includes('The Amazing Spider-Man'), '6D. Must Watch includes The Amazing Spider-Man (2012)');
assert(mustWatchTitles.includes('The Amazing Spider-Man 2'), '6E. Must Watch includes The Amazing Spider-Man 2 (2014)');
assert(mustWatchTitles.includes('Spider-Man: Homecoming'), '6F. Must Watch includes Spider-Man: Homecoming (2017)');
assert(mustWatchTitles.includes('Spider-Man: Far From Home'), '6G. Must Watch includes Spider-Man: Far From Home (2019)');

assert(mustWatchIds.includes('spiderman-1'), '6H. Must Watch includes spiderman-1');
assert(mustWatchIds.includes('amazing-spiderman-1'), '6I. Must Watch includes amazing-spiderman-1');
assert(traversal.mustWatch.length === 7, `6J. Must Watch contains exactly 7 titles (found ${traversal.mustWatch.length})`);
for (const rec of traversal.mustWatch) {
  assert(rec.category === 'must_watch', `   Category is must_watch for ${rec.content.title}`);
}

// ─── Test 7: PreparationGuide displays them ────────────────────────────────
console.log('\n--- Test 7: PreparationGuide Component Data ---');
const guide = generatePreparationGuide(NWH_ID);
assert(Boolean(guide), '7A. generatePreparationGuide returns non-null data for No Way Home');
assert((guide?.mustWatch.length ?? 0) === 7, `7B. PreparationGuide mustWatch contains 7 titles (found ${guide?.mustWatch.length})`);

const guideTitles = guide?.mustWatch.map((r) => r.content.title) ?? [];
assert(guideTitles.includes('Spider-Man'), '7C. PreparationGuide includes Spider-Man (2002)');
assert(guideTitles.includes('Spider-Man 2'), '7D. PreparationGuide includes Spider-Man 2 (2004)');
assert(guideTitles.includes('Spider-Man 3'), '7E. PreparationGuide includes Spider-Man 3 (2007)');
assert(guideTitles.includes('The Amazing Spider-Man'), '7F. PreparationGuide includes The Amazing Spider-Man (2012)');
assert(guideTitles.includes('The Amazing Spider-Man 2'), '7G. PreparationGuide includes The Amazing Spider-Man 2 (2014)');
assert(guideTitles.includes('Spider-Man: Homecoming'), '7H. PreparationGuide includes Spider-Man: Homecoming (2017)');
assert(guideTitles.includes('Spider-Man: Far From Home'), '7I. PreparationGuide includes Spider-Man: Far From Home (2019)');

// ─── Test 8: Watch-time calculation includes them ──────────────────────────
console.log('\n--- Test 8: Watch-Time Calculation ---');
assert(traversal.estimatedWatchTimeMinutes >= 920, `8A. Estimated watch time in minutes is >= 920 min (found ${traversal.estimatedWatchTimeMinutes})`);
assert(Boolean(traversal.formattedWatchTime.match(/\d+h \d+m/)), `8B. Formatted watch time matches 'Xh Ym' (found '${traversal.formattedWatchTime}')`);
assert(guide?.estimatedWatchTimeMinutes === traversal.estimatedWatchTimeMinutes, '8C. Guide watch time equals traversal watch time');
assert(guide?.formattedWatchTime === traversal.formattedWatchTime, '8D. Guide formatted time equals traversal formatted time');

// ─── Test 9: Separate continuities remain separate ─────────────────────────
console.log('\n--- Test 9: Continuity Isolation Invariants ---');
const spiderContent = getFranchiseContent('spider-man');
const spiderIds = new Set(spiderContent.map((c) => c.id));

assert(spiderIds.has('spiderman-1'), '9A. Spider-Man (2002) in spider-man franchise');
assert(spiderIds.has('spiderman-2'), '9B. Spider-Man 2 (2004) in spider-man franchise');
assert(spiderIds.has('spiderman-3'), '9C. Spider-Man 3 (2007) in spider-man franchise');
assert(spiderIds.has('amazing-spiderman-1'), '9D. The Amazing Spider-Man in spider-man franchise');
assert(spiderIds.has('amazing-spiderman-2'), '9E. The Amazing Spider-Man 2 in spider-man franchise');
assert(spiderIds.has('spider-verse-1'), '9F. Into the Spider-Verse in spider-man franchise');
assert(spiderIds.has('spider-verse-2'), '9G. Across the Spider-Verse in spider-man franchise');

assert(!spiderIds.has('mcu-spider-man-homecoming'), '9H. Homecoming is NOT in spider-man franchise');
assert(!spiderIds.has('mcu-spider-man-ffh'), '9I. Far From Home is NOT in spider-man franchise');
assert(!spiderIds.has(NWH_ID), '9J. No Way Home is NOT in spider-man franchise');

// ─── Test 10: Raimi/Webb titles are NOT in MCU release order ────────────────
console.log('\n--- Test 10: MCU Watch Order Pollution Prevention ---');
const mcuWatchOrders = getWatchOrders('marvel-cinematic-universe');
const mcuContentIdsInOrders = new Set(mcuWatchOrders.map((o) => o.content_id));

assert(!mcuContentIdsInOrders.has('spiderman-1'), '10A. Spider-Man (2002) is NOT in MCU watch orders');
assert(!mcuContentIdsInOrders.has('spiderman-2'), '10B. Spider-Man 2 (2004) is NOT in MCU watch orders');
assert(!mcuContentIdsInOrders.has('spiderman-3'), '10C. Spider-Man 3 (2007) is NOT in MCU watch orders');
assert(!mcuContentIdsInOrders.has('amazing-spiderman-1'), '10D. The Amazing Spider-Man is NOT in MCU watch orders');
assert(!mcuContentIdsInOrders.has('amazing-spiderman-2'), '10E. The Amazing Spider-Man 2 is NOT in MCU watch orders');
assert(!mcuContentIdsInOrders.has('spider-verse-1'), '10F. Into the Spider-Verse is NOT in MCU watch orders');
assert(!mcuContentIdsInOrders.has('spider-verse-2'), '10G. Across the Spider-Verse is NOT in MCU watch orders');

// ─── Test 11: No duplicate graph edges ─────────────────────────────────────
console.log('\n--- Test 11: Graph Edge Deduplication ---');
const edgeSignatures = new Set<string>();
const duplicates: string[] = [];

for (const edge of storyEdges) {
  if (edge.targetId === 'mcu-spiderman-no-way-home' || edge.targetId === NWH_ID) {
    const sig = `${edge.sourceId}->${edge.targetId}:${edge.relationship}`;
    if (edgeSignatures.has(sig)) {
      duplicates.push(sig);
    }
    edgeSignatures.add(sig);
  }
}

assert(duplicates.length === 0, `11. Exactly 0 duplicate graph edges for No Way Home prerequisites (checked ${edgeSignatures.size} edges)`);

// ─── Test 12: Repeated recommendation calculations remain deterministic ────
console.log('\n--- Test 12: Determinism & Idempotency ---');
const run1 = RecommendationService.getTraversal(NWH_ID);
RecommendationService.clearCache();
const run2 = RecommendationService.getTraversal(NWH_ID);
RecommendationService.clearCache();
const run3 = RecommendationService.getTraversal(NWH_ID);

const ids1 = run1.mustWatch.map((r) => r.content.id);
const ids2 = run2.mustWatch.map((r) => r.content.id);
const ids3 = run3.mustWatch.map((r) => r.content.id);

assert(JSON.stringify(ids1) === JSON.stringify(ids2), '12A. Run 1 and Run 2 mustWatch IDs are strictly equal');
assert(JSON.stringify(ids2) === JSON.stringify(ids3), '12B. Run 2 and Run 3 mustWatch IDs are strictly equal');
assert(run1.estimatedWatchTimeMinutes === run2.estimatedWatchTimeMinutes, '12C. Watch time minutes is deterministic across runs');
assert(run2.estimatedWatchTimeMinutes === run3.estimatedWatchTimeMinutes, '12D. Watch time minutes remains stable across cache clears');
assert(run1.mustWatch.length === 7, '12E. Must Watch count remains exactly 7');

// ─── Summary ───────────────────────────────────────────────────────────────
console.log('\n========================================================================');
if (testFailures === 0) {
  console.log('  🎉 ALL NO WAY HOME CROSS-CONTINUITY TESTS PASSED (0 Failures)');
  console.log('========================================================================\n');
} else {
  console.error(`  ❌ SUITE FAILED with ${testFailures} failure(s)`);
  console.log('========================================================================\n');
  process.exit(1);
}
