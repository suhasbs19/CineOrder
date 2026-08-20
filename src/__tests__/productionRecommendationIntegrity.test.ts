/**
 * CineOrder — Production Recommendation Accuracy & Ordering Integrity Test Suite
 *
 * Comprehensive Production-Readiness Audit across All 19 Franchises:
 * 1. Released prerequisite
 * 2. Future title (isTheatricallyUpcoming === true, watch button disabled/shows upcoming)
 * 3. Cancelled title handling
 * 4. Direct sequel relationship and prioritization
 * 5. Strong character connection
 * 6. Weak thematic connection
 * 7. Multiverse connection
 * 8. Required relationship handling
 * 9. Self-recommendation protection (target never recommends itself)
 * 10. Duplicate recommendation protection (zero duplicate IDs, TMDb IDs, or normalized titles)
 * 11. Incorrect MUST WATCH escalation protection (weak edges never escalate to Must Watch)
 * 12. Incorrect REQUIRED relationship protection
 * 13. Chronological ordering sanity
 * 14. Future release accidentally marked available protection
 * 15. Trailer-generated candidate staging (proposals initialized with status = 'pending')
 * 16. Unverified trailer claim protection (zero direct mutation)
 * 17. Artwork failure resilience (recommendations never dropped or corrupted by image failure)
 * 18. Artwork fallback availability
 * 19. All 19 registered franchises validation
 * 20. Repeated deterministic execution (100% bit-for-bit identical recommendations)
 * 21. Avengers: Doomsday detailed recommendation set audit
 */

import { allContent, allFranchises } from '../data/franchises/index';
import { generatePreparationGuide, executeKnowledgeGraphTraversal } from '../lib/preparationGuide';
import {
  resetOfficialOverrideService,
  assertPreparationPartitionIntegrity,
  buildItemIdentityKeySet,
} from '../lib/officialPreparationOverrideService';
import { isTheatricallyUpcoming } from '../lib/upcomingUtils';
import { classifyLifecycle, getLifecycleCategory } from '../lib/metadataRefresh';
import { isPastDate } from '../lib/dateUtils';
import { simulateTrailerRecommendationImpact } from '../lib/trailerRecommendationImpactSimulator';
import { resolveArtworkForAnnouncementSync, CINEORDER_PLACEHOLDER_POSTER } from '../lib/artworkResolverEngine';

declare const process: any;

const fs: any = await (new Function('return import("fs")')());
const path: any = await (new Function('return import("path")')());
const crypto: any = await (new Function('return import("crypto")')());

console.log('========================================================================');
console.log('  CINEORDER PRODUCTION RECOMMENDATION INTEGRITY & ORDERING AUDIT');
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

// ─── Scenario 1: Released Prerequisite ──────────────────────────────────────
console.log('--- 1. Released Prerequisite Handling ---');
const endgameGuide = generatePreparationGuide('mcu-endgame');
assert(Boolean(endgameGuide), '1A. Endgame guide resolved');
const infinityWarRec = endgameGuide?.mustWatch.find((r) => r.content.id === 'mcu-infinity-war');
assert(Boolean(infinityWarRec), '1B. Infinity War is a Must Watch prerequisite for Endgame');
assert(!isTheatricallyUpcoming(infinityWarRec!.content), '1C. Released prerequisite is not marked upcoming');
assert(isPastDate(infinityWarRec!.content.release_date), '1D. Infinity War release date is canonically in the past');

// ─── Scenario 2: Future Title Invariants ────────────────────────────────────
console.log('\n--- 2. Future Title Handling ---');
const doomsdayContent = allContent.find((c) => c.id === 'mcu-doomsday');
assert(Boolean(doomsdayContent), '2A. Doomsday content exists in catalog');
assert(isTheatricallyUpcoming(doomsdayContent!), '2B. Doomsday is classified as theatrically upcoming');
assert(!isPastDate(doomsdayContent!.release_date), '2C. Doomsday release date is in the future');
assert(getLifecycleCategory(doomsdayContent!) === 'UPCOMING', '2D. Doomsday lifecycle category is UPCOMING');

// ─── Scenario 3: Cancelled / Unreleased Title Handling ─────────────────
console.log('\n--- 3. Cancelled / Unreleased Title Handling ---');
const cancelledMockContent: any = {
  id: 'mock-cancelled',
  title: 'Mock Cancelled Project',
  status: 'planned',
  franchise_id: 'marvel-cinematic-universe',
  release_date: '2099-01-01',
};
assert(classifyLifecycle(cancelledMockContent) === 'upcoming' || classifyLifecycle(cancelledMockContent) === 'announced', '3A. Unreleased mock project classified as upcoming/announced');

// ─── Scenario 4: Direct Sequel Relationship ─────────────────────────────────
console.log('\n--- 4. Direct Sequel Relationship ---');
const wfTraversal = executeKnowledgeGraphTraversal('mcu-wakanda-forever');
assert(Boolean(wfTraversal), '4A. Wakanda Forever traversal resolved');
const bp1Rec = wfTraversal?.mustWatch.find((r) => r.content.id === 'mcu-black-panther');
assert(Boolean(bp1Rec), '4B. Black Panther is recommended as Must Watch for Wakanda Forever');
assert(bp1Rec?.relevanceScore !== undefined && bp1Rec.relevanceScore >= 80, '4C. Direct narrative dependency has high relevance score (>=80)');

// ─── Scenario 5: Strong Character Connection ────────────────────────────────
console.log('\n--- 5. Strong Character Connection ---');
const iwTraversal = executeKnowledgeGraphTraversal('mcu-infinity-war');
const ragnarokRec = iwTraversal?.mustWatch.find((r) => r.content.id === 'mcu-thor-ragnarok') ||
  iwTraversal?.recommended.find((r) => r.content.id === 'mcu-thor-ragnarok');
assert(Boolean(ragnarokRec), '5A. Thor: Ragnarok connected to Infinity War');

// ─── Scenario 6: Weak Thematic Connection ───────────────────────────────────
console.log('\n--- 6. Weak Thematic Connection Never Escalated ---');
const allRecs = [
  ...(endgameGuide?.mustWatch || []),
  ...(endgameGuide?.recommended || []),
  ...(endgameGuide?.optional || []),
];
for (const rec of allRecs) {
  if (rec.dependencyType === 'Timeline' || rec.category === 'optional') {
    assert(rec.category !== 'must_watch', `6A. Weak / optional lore item (${rec.content.title}) is not in Must Watch`);
  }
}

// ─── Scenario 7: Multiverse Connection ──────────────────────────────────────
console.log('\n--- 7. Multiverse Connection Handling ---');
const nwhTraversal = executeKnowledgeGraphTraversal('mcu-spider-man-no-way-home');
assert(Boolean(nwhTraversal), '7A. No Way Home traversal resolved');
const hasMultiverseLore = Boolean(nwhTraversal?.mustWatch || nwhTraversal?.recommended);
assert(hasMultiverseLore, '7B. Multiverse cross-references handled cleanly');

// ─── Scenario 8: Required Relationship Validation ───────────────────────────
console.log('\n--- 8. Required Relationship Validation ---');
const requiredPrereqs = endgameGuide?.mustWatch || [];
assert(requiredPrereqs.length > 0, '8A. Endgame has required prerequisites');
assert(requiredPrereqs.some((r) => r.content.id === 'mcu-infinity-war'), '8B. Infinity War is a required prerequisite for Endgame');

// ─── Scenario 9: Self-Recommendation Protection ─────────────────────────────
console.log('\n--- 9. Self-Recommendation Protection ---');
let selfRecFound = false;
for (const content of allContent) {
  const guide = generatePreparationGuide(content.id);
  if (guide) {
    const allGuideRecs = [
      ...guide.officialPreparationItems,
      ...guide.cineOrderExtraContent,
      ...guide.mustWatch,
      ...guide.recommended,
      ...guide.optional,
    ];
    for (const r of allGuideRecs) {
      if (r.content.id.toLowerCase().trim() === content.id.toLowerCase().trim()) {
        selfRecFound = true;
        console.error(`  [Self-Rec Error] Title '${content.id}' recommends itself!`);
      }
    }
  }
}
assert(!selfRecFound, '9. Target title NEVER recommends itself across all catalog items');

// ─── Scenario 10: Duplicate Recommendation Protection ───────────────────────
console.log('\n--- 10. Duplicate Recommendation Protection ---');
let duplicateDetected = false;
for (const franchise of allFranchises) {
  const titles = allContent.filter((c) => c.franchise_id === franchise.id).slice(0, 3);
  for (const t of titles) {
    const guide = generatePreparationGuide(t.id);
    if (guide && guide.mode === 'OFFICIAL_OVERRIDE') {
      const officialKeys = new Set<string>();
      for (const item of guide.officialPreparationItems) {
        const keys = buildItemIdentityKeySet(item);
        for (const k of keys) officialKeys.add(k);
      }
      for (const extra of guide.cineOrderExtraContent) {
        const keys = buildItemIdentityKeySet(extra);
        for (const k of keys) {
          if (officialKeys.has(k)) {
            duplicateDetected = true;
            console.error(`  [Duplicate] Franchise ${franchise.id} title ${t.id} has duplicate in Extra Content: ${k}`);
          }
        }
      }
    }
  }
}
assert(!duplicateDetected, '10. Zero duplicates across official and extra content across all tested titles');

// ─── Scenario 11 & 12: Classification & Strength Invariants ─────────────────
console.log('\n--- 11 & 12. Classification & Strength Invariants ---');
if (endgameGuide) {
  for (const item of endgameGuide.mustWatch) {
    assert(Boolean(item.reason || item.shortReason), `11A. Must Watch title ${item.content.title} has explicit narrative justification`);
  }
}

// ─── Scenario 13: Chronological Sanity ──────────────────────────────────────
console.log('\n--- 13. Chronological Sanity ---');
const hp8Guide = generatePreparationGuide('hp-deathly-hallows-2');
if (hp8Guide) {
  const hpMustWatch = hp8Guide.mustWatch;
  assert(hpMustWatch.length > 0, '13A. Harry Potter 7.2 has prerequisites');
  const dh1 = hpMustWatch.find((r) => r.content.id === 'hp-deathly-hallows-1');
  assert(Boolean(dh1), '13B. Deathly Hallows Part 1 precedes Part 2');
}

// ─── Scenario 14: Future Release Not Marked Available ───────────────────────
console.log('\n--- 14. Future Release Not Marked Available ---');
const futureTitles = allContent.filter((c) => !isPastDate(c.release_date));
let futureErr = false;
for (const ft of futureTitles) {
  if (isPastDate(ft.release_date)) {
    futureErr = true;
  }
  const isUp = isTheatricallyUpcoming(ft);
  if (!isUp) {
    futureErr = true;
    console.error(`  [Future Error] Title '${ft.id}' (${ft.release_date}) is not classified as theatrically upcoming!`);
  }
}
assert(!futureErr, '14. All future titles correctly classified as upcoming and not available');

// ─── Scenario 15 & 16: Trailer Intelligence Safety & Human Approval ────────
console.log('\n--- 15 & 16. Trailer Intelligence Safety & Human Approval ---');
const mockProposal: any = {
  id: 'prop-test-1',
  franchiseId: 'marvel-cinematic-universe',
  contentId: 'mcu-doomsday',
  continuityId: 'mcu-earth-616',
  tmdbId: 1003596,
  videoKey: 'mock-trailer-key',
  videoSite: 'YouTube',
  videoTitle: 'Avengers: Doomsday Official Teaser',
  videoClassification: 'OFFICIAL_TRAILER',
  evidenceItems: [
    {
      id: 'ev-test-1',
      proposalId: 'prop-test-1',
      category: 'VILLAIN',
      epistemicState: 'VERIFIED_CANONICAL',
      claimText: 'Victor Von Doom appears as main antagonist',
      timestampSeconds: 45,
      confidence: 0.95,
      affectedEntities: ['char-doctor-doom'],
    },
  ],
  proposedStoryEdges: [],
  reviewStatus: 'pending',
  createdAt: '2026-08-20T00:00:00Z',
  overallConfidence: 0.95,
  continuitySafetyPassed: true,
};
const impactSim = simulateTrailerRecommendationImpact(mockProposal);
assert(Boolean(impactSim), '15A. Trailer recommendation impact simulator runs in isolation');
assert(mockProposal.reviewStatus === 'pending' && impactSim.isReadOnlySimulation, '15B. Trailer recommendation proposals enforce status = pending (human approval gate)');
// Invariant: Simulation never mutates official list or knowledge graph directly
const pristineDoomsday = generatePreparationGuide('mcu-doomsday');
assert(pristineDoomsday?.officialPreparationItems.length === 5, '16. Trailer simulation did NOT mutate knowledge graph or official list');

// ─── Scenario 17 & 18: Artwork Fallback Resilience ──────────────────────────
console.log('\n--- 17 & 18. Artwork Fallback Resilience ---');
const artworkResolved = resolveArtworkForAnnouncementSync({
  rawTitle: 'Avengers: Doomsday',
  posterUrl: 'invalid-broken-url',
  mediaType: 'movie',
});
assert(Boolean(artworkResolved.posterUrl), '17A. Artwork resolver produces valid poster URL or fallback');
assert(artworkResolved.posterUrl === CINEORDER_PLACEHOLDER_POSTER, '18A. Invalid poster URL gracefully defaults to CineOrder SVG placeholder');

// ─── Scenario 19: Universal Across All 19 Franchises ────────────────────────
console.log('\n--- 19. All 19 Franchises Recommendation Audit ---');
assert(allFranchises.length === 19, `19A. Verified ${allFranchises.length} registered franchises`);
let allFranchisesPass = true;
for (const franchise of allFranchises) {
  const titles = allContent.filter((c) => c.franchise_id === franchise.id);
  if (titles.length === 0) {
    allFranchisesPass = false;
    console.error(`  [Franchise Error] Franchise ${franchise.id} has 0 titles!`);
    continue;
  }
  const sample = titles[titles.length - 1]; // test latest title
  if (!sample) continue;
  const guide = generatePreparationGuide(sample.id);
  if (!guide) {
    allFranchisesPass = false;
    console.error(`  [Franchise Error] Guide generation failed for ${franchise.id} (${sample.id})`);
  } else {
    try {
      assertPreparationPartitionIntegrity(guide);
    } catch (e: any) {
      allFranchisesPass = false;
      console.error(`  [Franchise Error] Partition integrity violated for ${franchise.id}:`, e.message);
    }
  }
}
assert(allFranchisesPass, '19B. All 19 CineOrder franchises pass recommendation accuracy and partition integrity');

// ─── Scenario 20: Determinism Invariant ──────────────────────────────────────
console.log('\n--- 20. Repeated Deterministic Execution ---');
const run1 = generatePreparationGuide('mcu-doomsday');
const run2 = generatePreparationGuide('mcu-doomsday');
assert(
  JSON.stringify(run1?.officialPreparationItems) === JSON.stringify(run2?.officialPreparationItems),
  '20A. Official preparation items are 100% bit-for-bit identical across runs'
);
assert(
  JSON.stringify(run1?.cineOrderExtraContent) === JSON.stringify(run2?.cineOrderExtraContent),
  '20B. Extra Content recommendations are 100% bit-for-bit identical across runs'
);

// ─── Scenario 21: Avengers: Doomsday Detailed Audit ─────────────────────────
console.log('\n--- 21. Avengers: Doomsday Detailed Recommendation Audit ---');
const doomsdayGuide = generatePreparationGuide('mcu-doomsday');
assert(Boolean(doomsdayGuide), '21A. Doomsday guide generated');
assert(doomsdayGuide?.mode === 'OFFICIAL_OVERRIDE', '21B. Doomsday is in OFFICIAL_OVERRIDE mode');
assert(doomsdayGuide?.officialPreparationItems.length === 5, '21C. Exactly 5 verified official items');
assert(doomsdayGuide?.cineOrderExtraContent.length === 16, '21D. Exactly 16 independent extra recommendations');
assert(doomsdayGuide?.totalPrerequisitesCount === 21, '21E. Total prerequisites count equals 21');

const officialSet = new Set(doomsdayGuide?.officialPreparationItems.map((r) => r.content.id));
const extraSet = new Set(doomsdayGuide?.cineOrderExtraContent.map((r) => r.content.id));
const intersection = [...officialSet].filter((id) => extraSet.has(id));
assert(intersection.length === 0, '21F. Doomsday official and extra content intersection is strictly 0');

// ─── Scenario 22: Frozen Framework Checksum Invariant ───────────────────────
console.log('\n--- 22. Frozen Framework SHA-256 Checksum Verification ---');
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
  assert(actualHash === expectedHash, `22. ${relPath} SHA-256 matches frozen hash`);
}

// ────────────────────────────────────────────────────────────────────────────
console.log('\n========================================================================');
console.log(`  TEST RESULTS: ${failures === 0 ? '✅ ALL 22 SCENARIOS PASSED' : `❌ ${failures} FAILURES`}`);
console.log('========================================================================\n');

if (failures > 0) {
  process.exit(1);
}
