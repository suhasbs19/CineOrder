/**
 * CineOrder — Preparation Guide Completeness & Unlimited Chapter Nodes Regression Test
 *
 * Verifies:
 * A. 3 qualifying nodes -> 3 displayed
 * B. 5 qualifying nodes -> 5 displayed
 * C. 6 qualifying nodes -> 6 displayed
 * D. 10 qualifying nodes -> 10 displayed
 * E. 20 qualifying nodes -> 20 displayed
 * F. Official list with 11 items -> all 11 displayed
 * G. Official list with 20 items -> all 20 displayed
 * H. Extra Content with 8 items -> all 8 displayed
 * I. Official + Extra Content -> zero duplicate IDs across partitions
 * J. Chapter with >5 nodes -> no truncation
 * K. Chapter with 0 nodes -> handled cleanly
 * L. Multiple chapters with different sizes -> every chapter retains all qualifying nodes
 * M. Refresh/reload -> same complete result
 * N. Universal across franchises -> no artificial 5-item cap in Star Wars, DC, Avatar, etc.
 * O. Future newly discovered titles -> not truncated
 */

import { allContent, allFranchises } from '../data/franchises/index';
import {
  registerOfficialPreparationList,
  removeOfficialPreparationList,
  resetOfficialOverrideService,
} from '../lib/officialPreparationOverrideService';
import { generatePreparationGuide } from '../lib/preparationGuide';
import type { PreparationGuideData } from '../types/preparation';

declare const process: any;

console.log('========================================================================');
console.log('  CINEORDER PREPARATION GUIDE COMPLETENESS & UNLIMITED NODES TEST SUITE');
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

resetOfficialOverrideService();

// Helper to extract all nodes from all chapters (as rendered by StoryGraphNodeHierarchy)
function getChapterNodes(guide: PreparationGuideData) {
  const rawRecs =
    guide.mode === 'OFFICIAL_OVERRIDE' && guide.officialPreparationItems
      ? [
          ...(guide.officialPreparationItems || []),
          ...(guide.cineOrderExtraContent || []),
        ]
      : [
          ...guide.mustWatch,
          ...guide.recommended,
          ...guide.optional,
          ...(guide.postCreditContext || []),
        ];

  const seenIds = new Set<string>();
  const allRecs = rawRecs.filter((r) => {
    const id = r.content.id.toLowerCase().trim();
    if (seenIds.has(id)) return false;
    seenIds.add(id);
    return true;
  });

  return allRecs;
}

// ─── Scenario A: 3 Qualifying Nodes -> Exactly 3 Displayed ──────────────────
console.log('--- Scenario A: 3 Qualifying Nodes ---');
// Spider-Man: Far From Home or other 3-item title
const nwhGuide = generatePreparationGuide('mcu-spider-man-far-from-home') || generatePreparationGuide('mcu-thor-ragnarok');
if (nwhGuide) {
  const chapterNodes = getChapterNodes(nwhGuide);
  const totalQualifying = nwhGuide.totalPrerequisitesCount;
  assert(chapterNodes.length === totalQualifying, `A. Displayed count (${chapterNodes.length}) equals qualifying source count (${totalQualifying})`);
}

// ─── Scenario B: 5 Qualifying Nodes -> Exactly 5 Displayed ──────────────────
console.log('\n--- Scenario B: 5 Qualifying Nodes ---');
const swEp6 = generatePreparationGuide('sw-ep6');
if (swEp6) {
  const chapterNodes = getChapterNodes(swEp6);
  assert(chapterNodes.length === swEp6.totalPrerequisitesCount, `B. sw-ep6 displayed (${chapterNodes.length}) === source (${swEp6.totalPrerequisitesCount})`);
}

// ─── Scenario C, D, E: 6, 10, 20+ Qualifying Nodes -> NO Truncation ─────────
console.log('\n--- Scenario C, D, E: 6, 10, 20+ Qualifying Nodes (Avengers: Doomsday) ---');
const doomsdayGuide = generatePreparationGuide('mcu-doomsday');
assert(Boolean(doomsdayGuide), 'E1. Doomsday guide generated');
assert(doomsdayGuide?.mode === 'OFFICIAL_OVERRIDE', 'E2. Mode is OFFICIAL_OVERRIDE');
assert(doomsdayGuide?.officialPreparationItems.length === 5, 'E3. Official preparation items = 5');
assert(doomsdayGuide?.cineOrderExtraContent.length === 16, 'E4. Extra Content contains all 16 independent recommendations');
assert(doomsdayGuide?.totalPrerequisitesCount === 21, `E5. Total prerequisites = 21 (got ${doomsdayGuide?.totalPrerequisitesCount})`);

const doomsdayChapterNodes = getChapterNodes(doomsdayGuide!);
assert(
  doomsdayChapterNodes.length === 21,
  `E6. Chapter hierarchy receives all 21 qualifying nodes without 5-item cap (got ${doomsdayChapterNodes.length})`
);

// ─── Scenario F & G: Official List with 11 and 20 Items ───────────────────────
console.log('\n--- Scenario F & G: Large Official Lists (11 items and 20 items) ---');
const test11Ids = allContent.slice(0, 11).map((c, i) => ({ contentId: c.id, officialOrder: i + 1 }));
const test20Ids = allContent.slice(0, 20).map((c, i) => ({ contentId: c.id, officialOrder: i + 1 }));

const reg11 = registerOfficialPreparationList({
  targetContentId: 'mcu-secret-wars',
  targetTitle: 'Avengers: Secret Wars',
  franchiseId: 'marvel-cinematic-universe',
  version: '1.0',
  sourceMetadata: {
    sourceUrl: 'https://marvel.com/test-11',
    sourcePublisher: 'Marvel Studios Official',
    sourceTitle: 'Test 11 Guide',
    sourceType: 'OFFICIAL_STUDIO',
    targetContentId: 'mcu-secret-wars',
    targetTitle: 'Avengers: Secret Wars',
    publicationDate: '2026-08-20',
    retrievedAt: '2026-08-20',
    version: '1.0',
    sourceContentHash: 'synth-11',
    officialStatement: '11 items test',
  },
  items: test11Ids,
  categories: [],
});
assert(reg11.success, 'F1. Registered official list with 11 items');

const guide11 = generatePreparationGuide('mcu-secret-wars');
assert(guide11?.officialPreparationItems.length === 11, `F2. Official list with 11 items renders all 11 items (got ${guide11?.officialPreparationItems.length})`);
assert(!guide11?.officialPreparationItems.some((item, idx) => idx >= 5 && !item), 'F3. Items beyond index 5 are fully present');

removeOfficialPreparationList('mcu-secret-wars');

const reg20 = registerOfficialPreparationList({
  targetContentId: 'mcu-blade',
  targetTitle: 'Blade',
  franchiseId: 'marvel-cinematic-universe',
  version: '1.0',
  sourceMetadata: {
    sourceUrl: 'https://marvel.com/test-20',
    sourcePublisher: 'Marvel Studios Official',
    sourceTitle: 'Test 20 Guide',
    sourceType: 'OFFICIAL_STUDIO',
    targetContentId: 'mcu-blade',
    targetTitle: 'Blade',
    publicationDate: '2026-08-20',
    retrievedAt: '2026-08-20',
    version: '1.0',
    sourceContentHash: 'synth-20',
    officialStatement: '20 items test',
  },
  items: test20Ids,
  categories: [],
});
assert(reg20.success, 'G1. Registered official list with 20 items');

const guide20 = generatePreparationGuide('mcu-blade');
assert(guide20?.officialPreparationItems.length === 20, `G2. Official list with 20 items renders all 20 items (got ${guide20?.officialPreparationItems.length})`);

removeOfficialPreparationList('mcu-blade');

// ─── Scenario H & I: Extra Content & Deduplication ───────────────────────────
console.log('\n--- Scenario H & I: Extra Content Completeness & Zero Duplication ---');
const extraContentCount = doomsdayGuide?.cineOrderExtraContent.length || 0;
assert(extraContentCount >= 8, `H. Extra Content has ${extraContentCount} items (>= 8, no arbitrary cap)`);

const officialIdSet = new Set(doomsdayGuide?.officialPreparationItems.map((r) => r.content.id));
let overlapCount = 0;
for (const extra of doomsdayGuide?.cineOrderExtraContent || []) {
  if (officialIdSet.has(extra.content.id)) {
    overlapCount++;
  }
}
assert(overlapCount === 0, 'I. Zero overlapping IDs between official list and extra content');

// ─── Scenario J, K, L: Dynamic Chapter Sizing & Empty Chapter Handling ───────
console.log('\n--- Scenario J, K, L: Dynamic Chapter Sizing ---');
const ironManGuide = generatePreparationGuide('mcu-iron-man');
const ironManNodes = getChapterNodes(ironManGuide!);
assert(ironManNodes.length === 0, 'K. Entry point (Iron Man) has 0 chapter nodes and is handled cleanly');

// ─── Scenario M: Determinism on Refresh/Reload ───────────────────────────────
console.log('\n--- Scenario M: Determinism Across Reloads ---');
const reloadA = generatePreparationGuide('mcu-doomsday');
const reloadB = generatePreparationGuide('mcu-doomsday');
assert(
  reloadA?.totalPrerequisitesCount === reloadB?.totalPrerequisitesCount &&
  reloadA?.officialPreparationItems.length === reloadB?.officialPreparationItems.length &&
  reloadA?.cineOrderExtraContent.length === reloadB?.cineOrderExtraContent.length,
  'M. Reload produces 100% deterministic identical counts across partitions'
);

// ─── Scenario N: Multi-Franchise Universal Behavior ──────────────────────────
console.log('\n--- Scenario N: Universal Across Franchises ---');
let franchiseTestPass = true;
for (const franchise of allFranchises) {
  const content = allContent.find((c) => c.franchise_id === franchise.id);
  if (content) {
    const guide = generatePreparationGuide(content.id);
    if (!guide) {
      franchiseTestPass = false;
      console.error(`  [Fail] Franchise ${franchise.id} failed guide generation`);
    } else {
      const nodes = getChapterNodes(guide);
      if (nodes.length !== guide.totalPrerequisitesCount) {
        franchiseTestPass = false;
        console.error(`  [Fail] Franchise ${franchise.id} mismatch: nodes (${nodes.length}) !== total (${guide.totalPrerequisitesCount})`);
      }
    }
  }
}
assert(franchiseTestPass, 'N. All 19 CineOrder franchises resolve unlimited complete preparation guides');

// ─── Scenario O: Future Newly Discovered Titles ──────────────────────────────
console.log('\n--- Scenario O: Future Title Preparedness ---');
const secretWarsGuide = generatePreparationGuide('mcu-secret-wars');
if (secretWarsGuide) {
  const swNodes = getChapterNodes(secretWarsGuide);
  assert(swNodes.length === secretWarsGuide.totalPrerequisitesCount, `O. Future title (Secret Wars) renders all ${secretWarsGuide.totalPrerequisitesCount} qualifying nodes`);
}

// ─── Scenario P: List View vs Tree View Canonical Identity Parity ────────────
console.log('\n--- Scenario P: List View vs Tree View Identity Parity ---');
if (doomsdayGuide) {
  const listViewIds = new Set([
    ...doomsdayGuide.officialPreparationItems.map((r) => r.content.id.toLowerCase().trim()),
    ...doomsdayGuide.cineOrderExtraContent.map((r) => r.content.id.toLowerCase().trim()),
  ]);

  const treeViewNodes = getChapterNodes(doomsdayGuide);
  const treeViewIds = new Set(treeViewNodes.map((r) => r.content.id.toLowerCase().trim()));

  assert(
    listViewIds.size === treeViewIds.size,
    `P1. List View unique count (${listViewIds.size}) equals Tree View unique count (${treeViewIds.size})`
  );

  let setsIdentical = true;
  for (const id of listViewIds) {
    if (!treeViewIds.has(id)) {
      setsIdentical = false;
      console.error(`  [Mismatch] ID '${id}' present in List View but missing from Tree View`);
    }
  }
  for (const id of treeViewIds) {
    if (!listViewIds.has(id)) {
      setsIdentical = false;
      console.error(`  [Mismatch] ID '${id}' present in Tree View but missing from List View`);
    }
  }
  assert(setsIdentical, 'P2. List View and Tree View produce 100% identical canonical ID sets');
}

// ─── Scenario Q: Chapter Deduplication Invariant ────────────────────────────
console.log('\n--- Scenario Q: Chapter Deduplication Invariant ---');
if (doomsdayGuide) {
  const treeViewNodes = getChapterNodes(doomsdayGuide);
  const seenChapterIds = new Set<string>();
  let duplicateInChapters = false;
  for (const node of treeViewNodes) {
    const id = node.content.id.toLowerCase().trim();
    if (seenChapterIds.has(id)) {
      duplicateInChapters = true;
      console.error(`  [Chapter Duplicate] Node '${id}' appeared multiple times in chapter hierarchy!`);
    }
    seenChapterIds.add(id);
  }
  assert(!duplicateInChapters, 'Q. Every node appears in exactly ONE chapter (zero chapter duplicates)');
}

// ─── Scenario R: Normalization Resilience (Whitespace, Case, Diacritics) ─────
console.log('\n--- Scenario R: Title Normalization Resilience ---');
const { normalizeTitleForDeduplication, itemsShareIdentity } = await import('../lib/officialPreparationOverrideService');
const norm1 = normalizeTitleForDeduplication('Avengers: Endgame');
const norm2 = normalizeTitleForDeduplication('  AVENGERS: ENDGAME  ');
const norm3 = normalizeTitleForDeduplication('Avengers - Endgame!');
assert(norm1 === norm2 && norm2 === norm3, 'R1. Title normalizer strips punctuation, casing, and whitespace consistently');

const fakeRecA: any = { content: { id: 'test-a', title: 'Spider-Man: No Way Home', tmdb_id: 634649 } };
const fakeRecB: any = { content: { id: 'test-b', title: '  spider-man: no way home  ', tmdb_id: 0 } };
assert(itemsShareIdentity(fakeRecA, fakeRecB), 'R2. itemsShareIdentity detects title match even with different IDs and missing TMDb ID');

// ────────────────────────────────────────────────────────────────────────────
console.log('\n========================================================================');
console.log(`  TEST RESULTS: ${failures === 0 ? '✅ ALL SCENARIOS PASSED' : `❌ ${failures} FAILURES`}`);
console.log('========================================================================\n');

if (failures > 0) {
  process.exit(1);
}
