/**
 * CineOrder Trailer Intelligence — Phase 4: Read-Only Recommendation Impact Simulator Test Suite
 * 
 * 22 Core Invariants:
 * 1. Empty evidence -> NO_CHANGE
 * 2. Optional character evidence
 * 3. Recommended evidence
 * 4. MUST_WATCH_CANDIDATE evidence
 * 5. Cross-continuity impact
 * 6. Conflicting evidence
 * 7. Low-confidence evidence
 * 8. Before / After diff calculation
 * 9. Simulator does not mutate CKG
 * 10. Simulator does not mutate recommendations
 * 11. Simulator does not mutate catalog
 * 12. Simulator is deterministic
 * 13. Repeated simulation produces identical output
 * 14. Pending proposal remains pending
 * 15. Rejected proposal remains rejected
 * 16. Historical trailer preserved
 * 17. Replacement trailer displayed correctly
 * 18. Removed trailer displayed correctly
 * 19. Spider-Man multiverse isolation
 * 20. Frozen framework invariant preservation
 * 21. Multi-franchise compatibility
 * 22. Pure functional execution
 */

import { simulateTrailerRecommendationImpact } from '../lib/trailerRecommendationImpactSimulator';
import { TrailerIntelligenceStore } from '../lib/trailerIntelligenceStore';
import { RecommendationService } from '../lib/recommendationService';
import { cineOrderKnowledgeGraph } from '../data/cineOrderKnowledgeGraph';
import { allContent } from '../data/franchises';
import type {
  TrailerProposalPackage,
  TrailerEvidenceItem,
  TrailerContentContext,
} from '../types/trailerIntelligence';
import type { RawTMDbVideo } from '../types/trailerDiscovery';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('========================================================================');
console.log('  CINEORDER TRAILER IMPACT SIMULATOR TEST SUITE (22 INVARIANTS)         ');
console.log('========================================================================\n');

const mockStore = new TrailerIntelligenceStore();

const baseThunderboltsPackage: TrailerProposalPackage = {
  id: 'prop-tb-sim-1',
  franchiseId: 'marvel-cinematic-universe',
  contentId: 'mcu-thunderbolts-2025',
  continuityId: 'mcu-616',
  tmdbId: 775312,
  videoKey: 'dQw4w9WgXcQ',
  videoSite: 'YouTube',
  videoTitle: "Marvel Studios' Thunderbolts* | Official Trailer",
  videoClassification: 'OFFICIAL_TRAILER',
  publishedTimestamp: '2025-02-10T14:00:00Z',
  evidenceItems: [
    {
      id: 'ev-tb-1',
      category: 'RETURNING_CHARACTER',
      subject: 'Yelena Belova',
      description: 'Yelena Belova reunites with Alexei Shostakov.',
      timestampSeconds: 35,
      timestampFormatted: '00:35',
      videoKey: 'dQw4w9WgXcQ',
      videoTitle: "Marvel Studios' Thunderbolts* | Official Trailer",
      confidence: 0.95,
      verificationState: 'OBSERVED',
      prerequisiteImpact: 'OPTIONAL',
      suggestedEdge: {
        sourceContentId: 'mcu-black-widow',
        targetContentId: 'mcu-thunderbolts-2025',
        relationship: 'character-development',
        strength: 'weak',
        confidence: 'likely',
        reason: 'Returning protagonist from Black Widow.',
      },
    },
    {
      id: 'ev-tb-2',
      category: 'VILLAIN',
      subject: 'Bob Reynolds (The Sentry / Void)',
      description: 'Bob Reynolds revealed in underground bunker.',
      timestampSeconds: 90,
      timestampFormatted: '01:30',
      videoKey: 'dQw4w9WgXcQ',
      videoTitle: "Marvel Studios' Thunderbolts* | Official Trailer",
      confidence: 0.90,
      verificationState: 'INFERRED',
      prerequisiteImpact: 'RECOMMENDED',
      suggestedEdge: {
        sourceContentId: 'mcu-black-widow',
        targetContentId: 'mcu-thunderbolts-2025',
        relationship: 'thematic-callback',
        strength: 'moderate',
        confidence: 'likely',
        reason: 'Thematic antagonist introduced.',
      },
    },
  ],
  proposedStoryEdges: [
    {
      id: 'p-tb-1',
      sourceId: 'mcu-black-widow',
      targetId: 'mcu-thunderbolts-2025',
      relationship: 'character-development',
      strength: 'weak',
      confidence: 'likely',
      reason: 'Returning protagonist.',
      sourceType: 'official-trailer',
      sourceText: 'Black Widow reunion',
      citation: 'Official Trailer',
      extractionDate: '2026-08-17',
      confidenceScore: 0.95,
      proposedAt: '2026-08-17T00:00:00Z',
      status: 'pending',
    },
  ],
  reviewStatus: 'pending',
  createdAt: '2026-08-17T00:00:00.000Z',
  overallConfidence: 0.92,
  continuitySafetyPassed: true,
};

// ─── 1. Empty Evidence -> NO_CHANGE ──────────────────────────────────────────
console.log('--- Test 1: Empty Evidence -> NO_CHANGE ---');
const emptyProposal: TrailerProposalPackage = {
  ...baseThunderboltsPackage,
  id: 'prop-empty',
  evidenceItems: [],
  proposedStoryEdges: [],
};
const rep1 = simulateTrailerRecommendationImpact(emptyProposal);
assert(rep1.primaryImpactCategory === 'NO_CHANGE', '1A. Primary impact is NO_CHANGE for empty evidence');
assert(rep1.diff.newMustWatchCandidates.length === 0, '1B. 0 new must watch candidates');
assert(rep1.diff.newRecommended.length === 0, '1C. 0 new recommended links');
assert(rep1.diff.newOptional.length === 0, '1D. 0 new optional links');
assert(rep1.isReadOnlySimulation === true, '1E. Report marked read-only simulation');

// ─── 2. Optional Character Evidence ──────────────────────────────────────────
console.log('\n--- Test 2: Optional Character Evidence ---');
const optionalProposal: TrailerProposalPackage = {
  ...baseThunderboltsPackage,
  id: 'prop-opt',
  evidenceItems: [baseThunderboltsPackage.evidenceItems[0]!],
  proposedStoryEdges: [],
};
const rep2 = simulateTrailerRecommendationImpact(optionalProposal);
assert(rep2.primaryImpactCategory === 'NEW_OPTIONAL', '2A. Primary impact is NEW_OPTIONAL');
assert(rep2.diff.newOptional.length === 1, '2B. Exactly 1 optional link projected');
assert(rep2.diff.newMustWatchCandidates.length === 0, '2C. Character cameo never inflates to Must Watch');

// ─── 3. Recommended Evidence ────────────────────────────────────────────────
console.log('\n--- Test 3: Recommended Evidence ---');
const recProposal: TrailerProposalPackage = {
  ...baseThunderboltsPackage,
  id: 'prop-rec',
  evidenceItems: [baseThunderboltsPackage.evidenceItems[1]!],
  proposedStoryEdges: [],
};
const rep3 = simulateTrailerRecommendationImpact(recProposal);
assert(rep3.primaryImpactCategory === 'NEW_RECOMMENDED', '3A. Primary impact is NEW_RECOMMENDED');
assert(rep3.diff.newRecommended.length === 1, '3B. Exactly 1 recommended link projected');

// ─── 4. MUST_WATCH_CANDIDATE Evidence ───────────────────────────────────────
console.log('\n--- Test 4: MUST_WATCH_CANDIDATE Evidence ---');
const mustWatchItem: TrailerEvidenceItem = {
  id: 'ev-cliffhanger',
  category: 'DIRECT_NARRATIVE_CONTINUATION',
  subject: 'Direct Cliffhanger Sequel',
  description: 'Continues directly from previous film climax.',
  videoKey: 'vid1',
  videoTitle: 'Title',
  confidence: 0.98,
  verificationState: 'OBSERVED',
  prerequisiteImpact: 'MUST_WATCH_CANDIDATE',
  suggestedEdge: {
    sourceContentId: 'mcu-black-widow',
    targetContentId: 'mcu-thunderbolts-2025',
    relationship: 'direct-sequel',
    strength: 'strong',
    confidence: 'confirmed',
    reason: 'Direct narrative sequel link.',
  },
};
const mwProposal: TrailerProposalPackage = {
  ...baseThunderboltsPackage,
  id: 'prop-mw',
  evidenceItems: [mustWatchItem],
  proposedStoryEdges: [],
};
const rep4 = simulateTrailerRecommendationImpact(mwProposal);
assert(rep4.primaryImpactCategory === 'NEW_MUST_WATCH_CANDIDATE', '4A. Primary impact is NEW_MUST_WATCH_CANDIDATE');
assert(rep4.diff.newMustWatchCandidates.length === 1, '4B. 1 must watch candidate projected');

// ─── 5. Cross-Continuity Impact ─────────────────────────────────────────────
console.log('\n--- Test 5: Cross-Continuity Impact ---');
const crossContinuityItem: TrailerEvidenceItem = {
  id: 'ev-crossover-1',
  category: 'CROSSOVER_CHARACTER',
  subject: 'Doctor Otto Octavius (Doc Ock)',
  description: 'Doc Ock arrives from Raimi universe.',
  videoKey: 'vidNWH',
  videoTitle: 'Spider-Man: No Way Home Trailer',
  confidence: 0.97,
  verificationState: 'OBSERVED',
  prerequisiteImpact: 'RECOMMENDED',
  continuityId: 'spider-man-raimi',
  suggestedEdge: {
    sourceContentId: 'spiderman-2',
    targetContentId: 'mcu-spider-man-nwh',
    relationship: 'multiverse',
    strength: 'moderate',
    confidence: 'confirmed',
    reason: 'Multiverse crossover character.',
    isCrossover: true,
  },
};
const nwhProposal: TrailerProposalPackage = {
  id: 'prop-nwh-cross',
  franchiseId: 'marvel-cinematic-universe',
  contentId: 'mcu-spider-man-nwh',
  continuityId: 'mcu-616',
  tmdbId: 634649,
  videoKey: 'JfVOs4VSpmA',
  videoSite: 'YouTube',
  videoTitle: 'Spider-Man: No Way Home Teaser Trailer',
  videoClassification: 'OFFICIAL_TRAILER',
  evidenceItems: [crossContinuityItem],
  proposedStoryEdges: [],
  reviewStatus: 'pending',
  createdAt: '2026-08-17T00:00:00.000Z',
  overallConfidence: 0.97,
  continuitySafetyPassed: true,
};
const rep5 = simulateTrailerRecommendationImpact(nwhProposal);
assert(rep5.primaryImpactCategory === 'CROSS_CONTINUITY_IMPACT', '5A. Primary impact is CROSS_CONTINUITY_IMPACT');
assert(rep5.diff.crossContinuityLinks.length === 1, '5B. Cross-continuity link captured');
assert(rep5.diff.crossContinuityLinks[0]!.sourceContinuity === 'spider-man-raimi', '5C. Source continuity correctly identified');
assert(rep5.diff.crossContinuityLinks[0]!.targetContinuity === 'mcu-616', '5D. Target continuity correctly identified');

// ─── 6. Conflicting Evidence ────────────────────────────────────────────────
console.log('\n--- Test 6: Conflicting Evidence ---');
const conflictProposal: TrailerProposalPackage = {
  ...baseThunderboltsPackage,
  id: 'prop-conflict',
  evidenceItems: [
    {
      ...baseThunderboltsPackage.evidenceItems[0]!,
      confidence: 0.35, // Low confidence contradiction
    },
  ],
  proposedStoryEdges: [],
  continuitySafetyPassed: false, // Flagged
};
const rep6 = simulateTrailerRecommendationImpact(conflictProposal);
assert(rep6.diff.conflictsDetected.length > 0, '6A. Conflicts or low-confidence flagged in diff');
assert(rep6.primaryImpactCategory === 'CONFLICTING_EVIDENCE' || rep6.primaryImpactCategory === 'REVIEW_REQUIRED', '6B. Flagged as CONFLICTING_EVIDENCE / REVIEW_REQUIRED');

// ─── 7. Low-Confidence Evidence ─────────────────────────────────────────────
console.log('\n--- Test 7: Low-Confidence Evidence ---');
const lowConfProposal: TrailerProposalPackage = {
  ...baseThunderboltsPackage,
  id: 'prop-low-conf',
  evidenceItems: [
    {
      ...baseThunderboltsPackage.evidenceItems[0]!,
      confidence: 0.40,
    },
  ],
  proposedStoryEdges: [],
};
const rep7 = simulateTrailerRecommendationImpact(lowConfProposal);
assert(rep7.diff.conflictsDetected.some((c) => c.includes('Low confidence')), '7. Low confidence warning populated');

// ─── 8. Before / After Diff Calculation ──────────────────────────────────────
console.log('\n--- Test 8: Before / After Diff Calculation ---');
const rep8 = simulateTrailerRecommendationImpact(baseThunderboltsPackage);
assert(typeof rep8.currentProductionPrerequisites === 'object', '8A. Current production prerequisites defined');
assert(typeof rep8.simulatedPrerequisites === 'object', '8B. Simulated prerequisites defined');
assert(rep8.safetyNotes.some((n) => n.includes('PRODUCTION STORY KNOWLEDGE GRAPH UNCHANGED')), '8C. Prominent simulation notice present');

// ─── 9. Simulator Does NOT Mutate CKG ───────────────────────────────────────
console.log('\n--- Test 9: Simulator Does NOT Mutate CKG ---');
const edgesBefore = cineOrderKnowledgeGraph.edges.length;
const titleNodesCountBefore = Object.keys(cineOrderKnowledgeGraph.titleNodes).length;
simulateTrailerRecommendationImpact(baseThunderboltsPackage);
simulateTrailerRecommendationImpact(nwhProposal);
simulateTrailerRecommendationImpact(mwProposal);
assert(cineOrderKnowledgeGraph.edges.length === edgesBefore, '9A. CKG edges count strictly unchanged');
assert(Object.keys(cineOrderKnowledgeGraph.titleNodes).length === titleNodesCountBefore, '9B. CKG titleNodes count strictly unchanged');

// ─── 10. Simulator Does NOT Mutate Recommendations ──────────────────────────
console.log('\n--- Test 10: Simulator Does NOT Mutate Recommendations ---');
const recBefore = RecommendationService.getRecommendationGraph('mcu-iron-man');
simulateTrailerRecommendationImpact(baseThunderboltsPackage);
const recAfter = RecommendationService.getRecommendationGraph('mcu-iron-man');
assert(recBefore.mustWatch.length === recAfter.mustWatch.length, '10A. Must Watch count unchanged');
assert(recBefore.recommended.length === recAfter.recommended.length, '10B. Recommended count unchanged');

// ─── 11. Simulator Does NOT Mutate Catalog ───────────────────────────────────
console.log('\n--- Test 11: Simulator Does NOT Mutate Catalog ---');
const catalogLenBefore = allContent.length;
simulateTrailerRecommendationImpact(baseThunderboltsPackage);
assert(allContent.length === catalogLenBefore, '11. allContent length unchanged');

// ─── 12. Simulator is Deterministic ─────────────────────────────────────────
console.log('\n--- Test 12: Simulator is Deterministic ---');
const rep12A = simulateTrailerRecommendationImpact(baseThunderboltsPackage);
const rep12B = simulateTrailerRecommendationImpact(baseThunderboltsPackage);
assert(JSON.stringify(rep12A) === JSON.stringify(rep12B), '12. Identical input produces 100% bit-for-bit identical report');

// ─── 13. Repeated Simulation Produces Identical Output ──────────────────────
console.log('\n--- Test 13: Repeated Simulation Produces Identical Output ---');
const baseStr = JSON.stringify(simulateTrailerRecommendationImpact(baseThunderboltsPackage));
for (let i = 0; i < 10; i++) {
  const currentStr = JSON.stringify(simulateTrailerRecommendationImpact(baseThunderboltsPackage));
  assert(currentStr === baseStr, `13.${i} Repeat simulation ${i + 1} is strictly identical`);
}

// ─── 14. Pending Proposal Remains Pending ───────────────────────────────────
console.log('\n--- Test 14: Pending Proposal Remains Pending ---');
mockStore.clear();
const scanRes = mockStore.processTrailerScan(
  {
    contentId: 'mcu-thunderbolts-2025',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Thunderbolts*',
  },
  [
    {
      id: 'vid-1',
      key: 'dQw4w9WgXcQ',
      name: "Marvel Studios' Thunderbolts* | Official Trailer",
      site: 'YouTube',
      type: 'Trailer',
      official: true,
    },
  ]
);
assert(scanRes.proposalsGenerated[0]!.reviewStatus === 'pending', '14. Proposal status is strictly pending');

// ─── 15. Rejected Proposal Remains Rejected ─────────────────────────────────
console.log('\n--- Test 15: Rejected Proposal Remains Rejected ---');
const pkgId = scanRes.proposalsGenerated[0]!.id;
mockStore.updateProposalStatus(pkgId, 'rejected', 'Reviewer Jane', 'Insufficient evidence');
const updatedPkg = mockStore.getProposalById(pkgId);
assert(updatedPkg?.reviewStatus === 'rejected', '15A. Status updated to rejected');
assert(updatedPkg?.reviewNotes === 'Insufficient evidence', '15B. Review notes preserved');

// ─── 16. Historical Trailer Preserved ───────────────────────────────────────
console.log('\n--- Test 16: Historical Trailer Preserved ---');
mockStore.clear();
const teaserVid: RawTMDbVideo = {
  id: 'vid-t',
  key: 'teaserKey',
  name: 'Teaser',
  site: 'YouTube',
  type: 'Teaser',
  official: true,
};
const fullVid: RawTMDbVideo = {
  id: 'vid-f',
  key: 'fullKey',
  name: 'Official Trailer',
  site: 'YouTube',
  type: 'Trailer',
  official: true,
};
const ctx: TrailerContentContext = {
  contentId: 'mcu-thunderbolts-2025',
  franchiseId: 'marvel-cinematic-universe',
  continuityId: 'mcu-616',
  title: 'Thunderbolts*',
};
mockStore.processTrailerScan(ctx, [teaserVid]);
mockStore.processTrailerScan(ctx, [fullVid]);
const teaserRec = mockStore.getRecord(`tr-${ctx.franchiseId}-${ctx.contentId}-${teaserVid.key}`);
assert(teaserRec !== undefined, '16A. Teaser record exists in store');
assert(teaserRec!.historicalVersions.length >= 1, '16B. Teaser record archived historical version');

// ─── 17. Replacement Trailer Displayed Correctly ────────────────────────────
console.log('\n--- Test 17: Replacement Trailer Displayed Correctly ---');
const fullRec = mockStore.getRecord(`tr-${ctx.franchiseId}-${ctx.contentId}-${fullVid.key}`);
assert(fullRec !== undefined, '17A. Full trailer record active');
assert(fullRec?.classification === 'OFFICIAL_TRAILER', '17B. Full trailer classification matches');

// ─── 18. Removed Trailer Displayed Correctly ────────────────────────────────
console.log('\n--- Test 18: Removed Trailer Displayed Correctly ---');
mockStore.processTrailerScan(ctx, []); // Delist all
const delistedRec = mockStore.getRecord(`tr-${ctx.franchiseId}-${ctx.contentId}-${fullVid.key}`);
assert(delistedRec?.isDelisted === true, '18. Delisted record marked isDelisted: true');

// ─── 19. Spider-Man Multiverse Isolation ────────────────────────────────────
console.log('\n--- Test 19: Spider-Man Multiverse Isolation ---');
const spidermanRep = simulateTrailerRecommendationImpact(nwhProposal);
assert(spidermanRep.diff.crossContinuityLinks.length === 1, '19A. Cross-continuity isolated to Raimi universe');
assert(spidermanRep.primaryImpactCategory === 'CROSS_CONTINUITY_IMPACT', '19B. Classified as CROSS_CONTINUITY_IMPACT');

// ─── 20. Frozen Framework Invariant Preservation ────────────────────────────
console.log('\n--- Test 20: Frozen Framework Invariant Preservation ---');
assert(typeof RecommendationService.getRecommendationGraph === 'function', '20A. RecommendationService intact');
assert(Array.isArray(cineOrderKnowledgeGraph.edges), '20B. Knowledge graph edges intact');

// ─── 21. Multi-Franchise Compatibility ──────────────────────────────────────
console.log('\n--- Test 21: Multi-Franchise Compatibility ---');
const swProposal: TrailerProposalPackage = {
  id: 'prop-sw-test',
  franchiseId: 'star-wars',
  contentId: 'sw-mandalorian-grogu-2026',
  continuityId: 'star-wars-canon',
  tmdbId: 123456,
  videoKey: 'swKey1',
  videoSite: 'YouTube',
  videoTitle: 'The Mandalorian & Grogu Teaser',
  videoClassification: 'OFFICIAL_TEASER',
  evidenceItems: [
    {
      id: 'ev-sw-1',
      category: 'SEQUEL_PREQUEL_CONTINUITY',
      subject: 'The Mandalorian Season 3 Continuation',
      description: 'Theatrical continuation of Din Djarin adventures.',
      videoKey: 'swKey1',
      videoTitle: 'The Mandalorian & Grogu Teaser',
      confidence: 0.95,
      verificationState: 'INFERRED',
      prerequisiteImpact: 'RECOMMENDED',
      suggestedEdge: {
        sourceContentId: 'sw-mandalorian',
        targetContentId: 'sw-mandalorian-grogu-2026',
        relationship: 'direct-sequel',
        strength: 'moderate',
        confidence: 'likely',
        reason: 'Theatrical continuation of Mandalorian series.',
      },
    },
  ],
  proposedStoryEdges: [],
  reviewStatus: 'pending',
  createdAt: '2026-08-17T00:00:00.000Z',
  overallConfidence: 0.95,
  continuitySafetyPassed: true,
};
const rep21 = simulateTrailerRecommendationImpact(swProposal);
assert(rep21.franchiseId === 'star-wars', '21A. Star Wars franchise recognized');
assert(rep21.diff.newRecommended.length === 1, '21B. Recommended prerequisite link projected');

// ─── 22. Pure Functional Execution ──────────────────────────────────────────
console.log('\n--- Test 22: Pure Functional Execution ---');
let threwError = false;
try {
  simulateTrailerRecommendationImpact({
    ...baseThunderboltsPackage,
    contentId: 'completely-unknown-content-id-xyz',
  });
} catch {
  threwError = true;
}
assert(!threwError, '22. Handled unknown content gracefully without throwing exception');

console.log('\n========================================================================');
console.log('  TRAILER IMPACT SIMULATOR SUITE: ✅ ALL 22 INVARIANTS PASSED!          ');
console.log('========================================================================\n');
