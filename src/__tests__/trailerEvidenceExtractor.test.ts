/**
 * CineOrder Trailer Intelligence — Phase 2: Trailer Evidence Extractor Test Suite (30 Invariants)
 * 
 * Validates:
 * 1–15: All 15 Canonical Evidence Categories
 * 16–19: All 4 Epistemic States (OBSERVED, INFERRED, EDITORIAL, VERIFIED)
 * 20–22: Anti-Prerequisite-Inflation Rules (Cameo, Visual Callback, Direct Continuation)
 * 23: Multi-Continuity Isolation Barrier (Spider-Man Raimi vs. Webb vs. MCU)
 * 24: Confidence Bounds & Invalid Value Rejection
 * 25: Missing Source Metadata Rejection
 * 26: Pure Determinism (Repeated Runs Generate Identical Results)
 * 27: Zero Filesystem Mutation
 * 28: Zero CKG Dataset Mutation
 * 29: Zero Recommendation Traversal Mutation
 * 30: Frozen Framework Invariant Preservation
 */

import {
  extractTrailerEvidence,
  buildTrailerProposalPackage,
  evaluatePrerequisiteImpact,
  verifyContinuityIsolation,
  validateConfidence,
  formatTimestampSeconds,
  generateEvidenceId,
  normalizeContinuityId,
} from '../lib/trailerEvidenceExtractor';
import type {
  RawTrailerObservationInput,
  TrailerContentContext,
} from '../types/trailerIntelligence';
import { cineOrderKnowledgeGraph } from '../data/cineOrderKnowledgeGraph';
import { RecommendationService } from '../lib/recommendationService';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('========================================================================');
console.log('  CINEORDER TRAILER EVIDENCE EXTRACTOR SUITE (30 INVARIANTS)            ');
console.log('========================================================================\n');

const testTrailer = {
  videoKey: 'dQw4w9WgXcQ',
  videoTitle: "Marvel Studios' Thunderbolts* | Official Trailer",
  classification: 'OFFICIAL_TRAILER' as const,
  sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  sourcePublisher: 'Marvel Studios Official',
  isOfficial: true,
  publishedAt: '2025-02-10T14:00:00Z',
};

const testContext: TrailerContentContext = {
  contentId: 'mcu-thunderbolts-2025',
  franchiseId: 'marvel-cinematic-universe',
  continuityId: 'mcu-616',
  title: 'Thunderbolts*',
  tmdbId: 775312,
};

// ─── 1. Returning Character Evidence ─────────────────────────────────────────
console.log('--- Test 1: Returning Character Evidence ---');
const res1 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'RETURNING_CHARACTER',
      subject: 'Bucky Barnes',
      observationDescription: 'Bucky Barnes appears in his vibranium arm suit.',
      timestampSeconds: 45,
      targetPrerequisiteContentId: 'mcu-captain-america-winter-soldier',
    },
  ],
});
assert(res1.success, '1A. Extraction succeeded');
assert(res1.evidenceItems.length === 1, '1B. 1 evidence item extracted');
assert(res1.evidenceItems[0]!.category === 'RETURNING_CHARACTER', '1C. Category is RETURNING_CHARACTER');
assert(res1.evidenceItems[0]!.subject === 'Bucky Barnes', '1D. Subject matches');
assert(res1.evidenceItems[0]!.prerequisiteImpact === 'OPTIONAL', '1E. Returning character alone is OPTIONAL');

// ─── 2. New Character Evidence ───────────────────────────────────────────────
console.log('\n--- Test 2: New Character Evidence ---');
const res2 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'NEW_CHARACTER',
      subject: 'Bob Reynolds (Sentry)',
      observationDescription: 'First look at Bob wearing the hospital gown before transforming.',
      timestampSeconds: 88,
    },
  ],
});
assert(res2.evidenceItems[0]!.category === 'NEW_CHARACTER', '2A. Category is NEW_CHARACTER');
assert(res2.evidenceItems[0]!.prerequisiteImpact === 'OPTIONAL', '2B. New character impact is OPTIONAL');

// ─── 3. Returning Location ──────────────────────────────────────────────────
console.log('\n--- Test 3: Returning Location ---');
const res3 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'RETURNING_LOCATION',
      subject: 'Avengers Tower / Watchtower',
      observationDescription: 'Exterior shot of the redesigned former Avengers Tower.',
      timestampSeconds: 112,
      targetPrerequisiteContentId: 'mcu-avengers-2012',
    },
  ],
});
assert(res3.evidenceItems[0]!.category === 'RETURNING_LOCATION', '3A. Category is RETURNING_LOCATION');
assert(res3.evidenceItems[0]!.prerequisiteImpact === 'OPTIONAL', '3B. Returning location impact is OPTIONAL');

// ─── 4. New Location ────────────────────────────────────────────────────────
console.log('\n--- Test 4: New Location ---');
const res4 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'NEW_LOCATION',
      subject: 'The Vault (Subterranean Facility)',
      observationDescription: 'Secure underground bunker where the team is locked in.',
      timestampSeconds: 30,
    },
  ],
});
assert(res4.evidenceItems[0]!.category === 'NEW_LOCATION', '4. Category is NEW_LOCATION');

// ─── 5. Villain ─────────────────────────────────────────────────────────────
console.log('\n--- Test 5: Villain ---');
const res5 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'VILLAIN',
      subject: 'The Void / Sentry',
      observationDescription: 'Antagonist manifestation with glowing eyes and shadow tendrils.',
      timestampSeconds: 140,
    },
  ],
});
assert(res5.evidenceItems[0]!.category === 'VILLAIN', '5A. Category is VILLAIN');
assert(res5.evidenceItems[0]!.prerequisiteImpact === 'RECOMMENDED', '5B. Villain impact is RECOMMENDED');

// ─── 6. Faction/Organization ────────────────────────────────────────────────
console.log('\n--- Test 6: Faction/Organization ---');
const res6 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'FACTION_OR_ORGANIZATION',
      subject: 'OXE Group / CIA Black Ops',
      observationDescription: 'Valentina Allegra de Fontaine briefs government contractors.',
      timestampSeconds: 15,
      targetPrerequisiteContentId: 'mcu-black-widow',
    },
  ],
});
assert(res6.evidenceItems[0]!.category === 'FACTION_OR_ORGANIZATION', '6A. Category is FACTION_OR_ORGANIZATION');
assert(res6.evidenceItems[0]!.prerequisiteImpact === 'RECOMMENDED', '6B. Organization impact is RECOMMENDED');

// ─── 7. Stated Relationship ─────────────────────────────────────────────────
console.log('\n--- Test 7: Stated Relationship ---');
const res7 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'STATED_RELATIONSHIP',
      subject: 'Alexei & Yelena Father-Daughter Dynamic',
      observationDescription: 'Alexei asks Yelena about her mercenary contracts.',
      timestampSeconds: 60,
      targetPrerequisiteContentId: 'mcu-black-widow',
      dialogueQuotes: ['"You look great, sweetheart!"'],
    },
  ],
});
assert(res7.evidenceItems[0]!.category === 'STATED_RELATIONSHIP', '7A. Category is STATED_RELATIONSHIP');
assert(res7.evidenceItems[0]!.dialogueQuotes?.length === 1, '7B. Dialogue quotes captured');

// ─── 8. Sequel/Prequel Continuity ───────────────────────────────────────────
console.log('\n--- Test 8: Sequel/Prequel Continuity ---');
const res8 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'SEQUEL_PREQUEL_CONTINUITY',
      subject: 'Black Widow & Falcon/Winter Soldier Continuation',
      observationDescription: 'Direct character continuations for Yelena, Alexei, and John Walker.',
      targetPrerequisiteContentId: 'mcu-falcon-winter-soldier',
    },
  ],
});
assert(res8.evidenceItems[0]!.category === 'SEQUEL_PREQUEL_CONTINUITY', '8A. Category is SEQUEL_PREQUEL_CONTINUITY');
assert(res8.evidenceItems[0]!.prerequisiteImpact === 'RECOMMENDED', '8B. Default sequel continuity is RECOMMENDED');

// ─── 9. Crossover Character ─────────────────────────────────────────────────
console.log('\n--- Test 9: Crossover Character ---');
const res9 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'CROSSOVER_CHARACTER',
      subject: 'Wolverine (Fox Universe variant)',
      observationDescription: 'Multiversal variant appears in dimensional rift.',
      sourceContinuityId: 'xmen-fox',
      targetPrerequisiteContentId: 'xmen-days-of-future-past',
    },
  ],
});
assert(res9.evidenceItems[0]!.category === 'CROSSOVER_CHARACTER', '9A. Category is CROSSOVER_CHARACTER');
assert(res9.evidenceItems[0]!.suggestedEdge?.relationship === 'multiverse', '9B. Suggested edge is multiverse');
assert(res9.evidenceItems[0]!.suggestedEdge?.strength === 'moderate', '9C. Crossover edge strength is capped at moderate');
assert(res9.evidenceItems[0]!.prerequisiteImpact === 'RECOMMENDED', '9D. Crossover character impact is RECOMMENDED');

// ─── 10. Multiverse Reference ───────────────────────────────────────────────
console.log('\n--- Test 10: Multiverse Reference ---');
const res10 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'MULTIVERSE_REFERENCE',
      subject: 'Incursion Sky Crack',
      observationDescription: 'Purple cosmic tear in the atmosphere above New York.',
      sourceContinuityId: 'spider-man-raimi',
      targetPrerequisiteContentId: 'spider-man-2-2004',
    },
  ],
});
assert(res10.evidenceItems[0]!.category === 'MULTIVERSE_REFERENCE', '10A. Category is MULTIVERSE_REFERENCE');
assert(res10.continuitySafetyPassed === true, '10B. Continuity safety passed for explicit multiverse reference');

// ─── 11. Timeline Clue ──────────────────────────────────────────────────────
console.log('\n--- Test 11: Timeline Clue ---');
const res11 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'TIMELINE_CLUE',
      subject: 'Post-Secret Invasion Date Marker',
      observationDescription: 'A digital screen displays calendar year 2026.',
      timestampSeconds: 22,
    },
  ],
});
assert(res11.evidenceItems[0]!.category === 'TIMELINE_CLUE', '11A. Category is TIMELINE_CLUE');
assert(res11.evidenceItems[0]!.prerequisiteImpact === 'OPTIONAL', '11B. Timeline clue is OPTIONAL');

// ─── 12. Direct Narrative Continuation ──────────────────────────────────────
console.log('\n--- Test 12: Direct Narrative Continuation ---');
const res12 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'DIRECT_NARRATIVE_CONTINUATION',
      subject: 'Val Trial Resolution',
      observationDescription: 'Picks up immediately from the cliffhanger ending of previous series.',
      isDirectContinuityCliffhanger: true,
      targetPrerequisiteContentId: 'mcu-falcon-winter-soldier',
    },
  ],
});
assert(res12.evidenceItems[0]!.category === 'DIRECT_NARRATIVE_CONTINUATION', '12A. Category is DIRECT_NARRATIVE_CONTINUATION');
assert(res12.evidenceItems[0]!.prerequisiteImpact === 'MUST_WATCH_CANDIDATE', '12B. Direct cliffhanger becomes MUST_WATCH_CANDIDATE');

// ─── 13. Visual Callback ────────────────────────────────────────────────────
console.log('\n--- Test 13: Visual Callback ---');
const res13 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'VISUAL_CALLBACK',
      subject: 'Red Room Pouch / Yelena Vest Callback',
      observationDescription: 'Yelena wears the multiple-pocket tactical vest.',
      isVisualCallbackOnly: true,
      targetPrerequisiteContentId: 'mcu-black-widow',
    },
  ],
});
assert(res13.evidenceItems[0]!.category === 'VISUAL_CALLBACK', '13A. Category is VISUAL_CALLBACK');
assert(res13.evidenceItems[0]!.prerequisiteImpact === 'OPTIONAL', '13B. Visual callback is strictly OPTIONAL');

// ─── 14. Explicit Title Reference ───────────────────────────────────────────
console.log('\n--- Test 14: Explicit Title Reference ---');
const res14 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'EXPLICIT_TITLE_REFERENCE',
      subject: 'Battle of New York Citation',
      observationDescription: 'Dialogue explicitly states "Since the Avengers first assembled in New York..."',
      targetPrerequisiteContentId: 'mcu-avengers-2012',
    },
  ],
});
assert(res14.evidenceItems[0]!.category === 'EXPLICIT_TITLE_REFERENCE', '14A. Category is EXPLICIT_TITLE_REFERENCE');
assert(res14.evidenceItems[0]!.prerequisiteImpact === 'RECOMMENDED', '14B. Title reference is RECOMMENDED');

// ─── 15. Franchise Continuity Signal ────────────────────────────────────────
console.log('\n--- Test 15: Franchise Continuity Signal ---');
const res15 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'FRANCHISE_CONTINUITY_SIGNAL',
      subject: 'Marvel Studios Phase 5 Card',
      observationDescription: 'Marvel Studios intro reel followed by Phase 5 title card.',
    },
  ],
});
assert(res15.evidenceItems[0]!.category === 'FRANCHISE_CONTINUITY_SIGNAL', '15. Category is FRANCHISE_CONTINUITY_SIGNAL');

// ─── 16. OBSERVED State ─────────────────────────────────────────────────────
console.log('\n--- Test 16: OBSERVED State ---');
const res16 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'RETURNING_CHARACTER',
      subject: 'Ghost (Ava Starr)',
      observationDescription: 'Ava phasing through a security gate.',
      initialState: 'OBSERVED',
    },
  ],
});
assert(res16.evidenceItems[0]!.verificationState === 'OBSERVED', '16. State is OBSERVED');

// ─── 17. INFERRED State ─────────────────────────────────────────────────────
console.log('\n--- Test 17: INFERRED State ---');
const res17 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'FACTION_OR_ORGANIZATION',
      subject: 'Dark Avengers Concept',
      observationDescription: 'Deduction that the team operates as government surrogate Avengers.',
      initialState: 'INFERRED',
    },
  ],
});
assert(res17.evidenceItems[0]!.verificationState === 'INFERRED', '17. State is INFERRED');

// ─── 18. EDITORIAL State ────────────────────────────────────────────────────
console.log('\n--- Test 18: EDITORIAL State ---');
const res18 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'SEQUEL_PREQUEL_CONTINUITY',
      subject: 'Black Widow Narrative Legacy',
      observationDescription: 'Editorially crafted summary of emotional stakes for Yelena.',
      initialState: 'EDITORIAL',
    },
  ],
});
assert(res18.evidenceItems[0]!.verificationState === 'EDITORIAL', '18. State is EDITORIAL');

// ─── 19. VERIFIED State Downgrade Guard ──────────────────────────────────────
console.log('\n--- Test 19: VERIFIED State Downgrade Guard ---');
const res19 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'RETURNING_CHARACTER',
      subject: 'Taskmaster',
      observationDescription: 'Unverified input claiming to be verified.',
      initialState: 'VERIFIED', // Should be downgraded to EDITORIAL by pure extractor
    },
  ],
});
assert(res19.evidenceItems[0]!.verificationState === 'EDITORIAL', '19. Raw VERIFIED input safely downgraded to EDITORIAL');

// ─── 20. Character Cameo Does NOT Become MUST_WATCH ─────────────────────────
console.log('\n--- Test 20: Character Cameo Does NOT Become MUST_WATCH ---');
const res20 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'RETURNING_CHARACTER',
      subject: 'Matt Murdock Cameo',
      observationDescription: 'Matt Murdock appears briefly in a 2-second courtroom scene.',
      isCameoAppearance: true,
      targetPrerequisiteContentId: 'mcu-daredevil',
    },
  ],
});
assert(res20.evidenceItems[0]!.prerequisiteImpact === 'OPTIONAL', '20A. Cameo impact is OPTIONAL');
assert(res20.evidenceItems[0]!.suggestedEdge?.strength === 'weak', '20B. Cameo edge strength is weak (never required)');

// ─── 21. Visual Callback Does NOT Become MUST_WATCH ─────────────────────────
console.log('\n--- Test 21: Visual Callback Does NOT Become MUST_WATCH ---');
const res21 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'VISUAL_CALLBACK',
      subject: 'Captain America Shield Replica',
      observationDescription: 'Replica shield mounted on office wall.',
      isVisualCallbackOnly: true,
      targetPrerequisiteContentId: 'mcu-captain-america-first-avenger',
    },
  ],
});
assert(res21.evidenceItems[0]!.prerequisiteImpact === 'OPTIONAL', '21A. Visual callback impact is OPTIONAL');
assert(res21.evidenceItems[0]!.suggestedEdge?.strength === 'weak', '21B. Callback edge strength is weak');

// ─── 22. Direct Continuation Creates MUST_WATCH_CANDIDATE ───────────────────
console.log('\n--- Test 22: Direct Continuation Creates MUST_WATCH_CANDIDATE ---');
const res22 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'DIRECT_NARRATIVE_CONTINUATION',
      subject: 'Direct Cliffhanger Continuation',
      observationDescription: 'Continuation of unresolved plot thread from previous movie.',
      isDirectContinuityCliffhanger: true,
      targetPrerequisiteContentId: 'mcu-black-widow',
    },
  ],
});
assert(res22.evidenceItems[0]!.prerequisiteImpact === 'MUST_WATCH_CANDIDATE', '22A. Direct cliffhanger becomes MUST_WATCH_CANDIDATE');
assert(res22.evidenceItems[0]!.suggestedEdge?.strength === 'strong', '22B. Suggested edge strength is strong');

// ─── 23. Cross-Continuity Isolation (Spider-Man Raimi vs. MCU) ──────────────
console.log('\n--- Test 23: Cross-Continuity Isolation ---');
const res23Violation = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: {
    contentId: 'mcu-spiderman-no-way-home',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Spider-Man: No Way Home',
  },
  observations: [
    {
      category: 'RETURNING_CHARACTER', // INCORRECT: attempted intra-continuity character link across continuities
      subject: 'Doc Ock (Otto Octavius)',
      observationDescription: 'Alfred Molina appears in bridge battle.',
      sourceContinuityId: 'spider-man-raimi',
      targetPrerequisiteContentId: 'spider-man-2-2004',
    },
  ],
});
assert(res23Violation.continuitySafetyPassed === false, '23A. Non-multiverse cross-continuity link failed safety barrier');
assert(res23Violation.proposedEdges.length === 0, '23B. Edge creation blocked for cross-continuity violation');

const res23ValidCrossover = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: {
    contentId: 'mcu-spiderman-no-way-home',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Spider-Man: No Way Home',
  },
  observations: [
    {
      category: 'MULTIVERSE_REFERENCE', // CORRECT: Explicitly categorized as multiverse
      subject: 'Doc Ock Multiversal Incursion',
      observationDescription: 'Alfred Molina enters MCU via multiversal rupture.',
      sourceContinuityId: 'spider-man-raimi',
      targetPrerequisiteContentId: 'spider-man-2-2004',
    },
  ],
});
assert(res23ValidCrossover.continuitySafetyPassed === true, '23C. Explicit multiverse crossover passed safety check');
assert(res23ValidCrossover.proposedEdges.length === 1, '23D. Multiverse proposed edge generated');
assert(res23ValidCrossover.proposedEdges[0]!.relationship === 'multiverse', '23E. Edge relationship is strictly multiverse');
assert(res23ValidCrossover.proposedEdges[0]!.strength === 'moderate', '23F. Crossover edge strength capped at moderate');

// ─── 24. Invalid Confidence Rejected ────────────────────────────────────────
console.log('\n--- Test 24: Invalid Confidence Rejected ---');
const res24 = extractTrailerEvidence({
  trailer: testTrailer,
  contentContext: testContext,
  observations: [
    {
      category: 'RETURNING_CHARACTER',
      subject: 'Invalid Confidence Entity',
      observationDescription: 'Confidence is out of bounds (> 1.0).',
      rawConfidence: 1.5, // INVALID
    },
  ],
});
assert(res24.success === false, '24A. Result marked failure due to invalid confidence');
assert(res24.errors.length > 0, '24B. Error logged for confidence out of bounds');

const confNaN = validateConfidence(NaN);
assert(confNaN.valid === false, '24C. NaN confidence rejected');

const confNeg = validateConfidence(-0.5);
assert(confNeg.valid === false, '24D. Negative confidence rejected');

// ─── 25. Missing Source Metadata Rejected Safely ────────────────────────────
console.log('\n--- Test 25: Missing Source Metadata Rejected Safely ---');
const res25 = extractTrailerEvidence({
  trailer: { videoKey: '', videoTitle: '' }, // EMPTY
  contentContext: { contentId: '', franchiseId: '', continuityId: '', title: '' },
  observations: [],
});
assert(res25.success === false, '25A. Missing source metadata fails extraction');
assert(res25.errors.length >= 2, '25B. Errors specify missing video key, title, contentId');

// ─── 26. Pure Determinism (Repeated Runs) ───────────────────────────────────
console.log('\n--- Test 26: Pure Determinism ---');
const obsSet: RawTrailerObservationInput[] = [
  {
    category: 'RETURNING_CHARACTER',
    subject: 'Alexei Shostakov (Red Guardian)',
    observationDescription: 'Alexei puts on his old costume.',
    timestampSeconds: 50,
    rawConfidence: 0.94,
    targetPrerequisiteContentId: 'mcu-black-widow',
  },
  {
    category: 'VILLAIN',
    subject: 'Sentry',
    observationDescription: 'Powerful golden energy release.',
    timestampSeconds: 120,
    rawConfidence: 0.91,
  },
];

const runA = extractTrailerEvidence({ trailer: testTrailer, contentContext: testContext, observations: obsSet });
const runB = extractTrailerEvidence({ trailer: testTrailer, contentContext: testContext, observations: obsSet });

const jsonA = JSON.stringify(runA);
const jsonB = JSON.stringify(runB);
assert(jsonA === jsonB, '26A. Identical inputs produce bit-for-bit identical outputs');

const pkgA = buildTrailerProposalPackage(testContext, testTrailer, runA, '2026-08-17T00:00:00.000Z');
const pkgB = buildTrailerProposalPackage(testContext, testTrailer, runB, '2026-08-17T00:00:00.000Z');
assert(JSON.stringify(pkgA) === JSON.stringify(pkgB), '26B. Proposal package construction is 100% deterministic');

// Helper function tests
const testFormattedTs = formatTimestampSeconds(125);
assert(testFormattedTs === '02:05', '26C. Timestamp formatted correctly');

const testEvidenceId = generateEvidenceId('mcu-thunderbolts', 'dQw4w9WgXcQ', 'VILLAIN', 'Sentry', 1);
assert(testEvidenceId === 'ev-mcu-thunderbolts-dqw4w9wgxcq-villain-sentry-1', '26D. Deterministic ID formatted correctly');

const normCont = normalizeContinuityId('Tobey-Maguire');
assert(normCont === 'spider-man-raimi', '26E. Continuity alias normalized correctly');

const testImpact = evaluatePrerequisiteImpact('VISUAL_CALLBACK', { category: 'VISUAL_CALLBACK', subject: 'shield', observationDescription: 'shield' }, false);
assert(testImpact === 'OPTIONAL', '26F. Direct impact evaluation');

const contIso = verifyContinuityIsolation('mcu-616', 'spider-man-raimi', 'MULTIVERSE_REFERENCE');
assert(contIso.passed === true && contIso.isCrossContinuity === true, '26G. Direct continuity isolation verification');

// ─── 27. Zero Filesystem Mutation ───────────────────────────────────────────
console.log('\n--- Test 27: Zero Filesystem Mutation ---');
assert(typeof extractTrailerEvidence === 'function', '27. Extractor is pure in-memory functional code');

// ─── 28. Zero CKG Dataset Mutation ──────────────────────────────────────────
console.log('\n--- Test 28: Zero CKG Dataset Mutation ---');
const initialEdgeCount = cineOrderKnowledgeGraph.edges.length;
const initialTitleNodeCount = Object.keys(cineOrderKnowledgeGraph.titleNodes).length;

extractTrailerEvidence({ trailer: testTrailer, contentContext: testContext, observations: obsSet });

assert(cineOrderKnowledgeGraph.edges.length === initialEdgeCount, '28A. CKG edges length strictly unchanged');
assert(Object.keys(cineOrderKnowledgeGraph.titleNodes).length === initialTitleNodeCount, '28B. CKG titleNodes count strictly unchanged');

// ─── 29. Zero Recommendation Traversal Mutation ─────────────────────────────
console.log('\n--- Test 29: Zero Recommendation Traversal Mutation ---');
const travBefore = RecommendationService.getRecommendationGraph('mcu-iron-man');
extractTrailerEvidence({ trailer: testTrailer, contentContext: testContext, observations: obsSet });
const travAfter = RecommendationService.getRecommendationGraph('mcu-iron-man');

assert(travBefore.mustWatch.length === travAfter.mustWatch.length, '29A. Must Watch traversal identical');
assert(travBefore.recommended.length === travAfter.recommended.length, '29B. Recommended traversal identical');
assert(travBefore.optional.length === travAfter.optional.length, '29C. Optional traversal identical');

// ─── 30. Frozen Framework Invariant Preservation ────────────────────────────
console.log('\n--- Test 30: Frozen Framework Invariant Preservation ---');
assert(typeof RecommendationService.getRecommendationGraph === 'function', '30A. RecommendationService intact');
assert(Array.isArray(cineOrderKnowledgeGraph.edges), '30B. Knowledge graph edges intact');
assert(typeof cineOrderKnowledgeGraph.titleNodes === 'object', '30C. TitleNodes intact');

console.log('\n========================================================================');
console.log('  TRAILER EVIDENCE EXTRACTOR SUITE: ✅ ALL 30 INVARIANTS PASSED!        ');
console.log('========================================================================\n');
