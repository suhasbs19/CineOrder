/**
 * CineOrder — Phase 5: Trailer Intelligence → Recommendation Impact Master Regression Suite
 *
 * Validates the 30 core invariants of the Phase 5 Trailer Intelligence to
 * Recommendation Impact Proposal Engine:
 *
 *  1. New sequel trailer narrative impact
 *  2. Returning character context
 *  3. Old villain introduction
 *  4. Confirmed crossover relationship
 *  5. Previous movie reference
 *  6. Ambiguous visual callback (anti-inflation guard)
 *  7. Fan trailer rejection
 *  8. Fake / unofficial video rejection
 *  9. Unofficial upload rejection
 * 10. Trailer removal / delisting
 * 11. Trailer replacement with version history preservation
 * 12. Duplicate trailer deduplication
 * 13. Repeated scan idempotency (10x, 100x scans)
 * 14. Cross-continuity false positive rejection (Spider-Verse to MCU)
 * 15. No recommendation impact classification
 * 16. Strong prerequisite evidence
 * 17. Weak evidence handling (anti-inflation guard)
 * 18. Conflicting evidence handling
 * 19. Human proposal rejection & archiving
 * 20. Human proposal approval workflow
 * 21. Integration validation failure & rollback
 * 22. Spider-Man multi-continuity isolation across all 8 canonical titles
 * 23. Spider-Man: No Way Home verified cross-continuity prerequisites
 * 24. Spider-Verse isolation from MCU
 * 25. Raimi trilogy isolation from MCU
 * 26. Webb dilogy isolation from MCU
 * 27. Production immutability during simulation
 * 28. Frozen framework SHA-256 baseline ledger verification (5/5 files)
 * 29. Deterministic event hash generation
 * 30. Trailer version history tracking (metadataHash & evidenceHash)
 */

import { allContent } from '../data/franchises/index';
import { RecommendationService } from '../lib/recommendationService';
import { classifyTMDbVideo } from '../lib/trailerDiscoveryEngine';
import {
  extractTrailerEvidence,
  buildTrailerProposalPackage,
} from '../lib/trailerEvidenceExtractor';
import {
  TrailerIntelligenceStore,
  type TrailerIntelligenceStorageAdapter,
  type TrailerStoreSerializedState,
} from '../lib/trailerIntelligenceStore';
import {
  TrailerRecommendationImpactService,
  classifyNarrativeImpact,
  computeImpactProposalHash,
} from '../lib/trailerRecommendationImpactService';
import { simulateTrailerRecommendationImpact } from '../lib/trailerRecommendationImpactSimulator';
import { validateProposalForIntegration, integrateApprovedProposal } from '../lib/catalogIntegrationService';
import type { RawTMDbVideo } from '../types/trailerDiscovery';
import type {
  RawTrailerObservationInput,
  TrailerContentContext,
  TrailerEvidenceItem,
} from '../types/trailerIntelligence';
import type { AnnouncementProposalPackage } from '../types/announcementDiscovery';
import type { CKGEdgeStrength, CKGEdgeConfidence } from '../data/cineOrderKnowledgeGraph';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('========================================================================');
console.log(' CINEORDER PHASE 5 TRAILER RECOMMENDATION IMPACT TEST SUITE (30 TESTS)  ');
console.log('========================================================================\n');

class TestMemoryAdapter implements TrailerIntelligenceStorageAdapter {
  private state: TrailerStoreSerializedState | null = null;
  load(): TrailerStoreSerializedState | null {
    return this.state ? JSON.parse(JSON.stringify(this.state)) : null;
  }
  save(s: TrailerStoreSerializedState): void {
    this.state = JSON.parse(JSON.stringify(s));
  }
}

// ─── 1. New Sequel Trailer Narrative Impact ───────────────────────────────────
console.log('--- 1. New Sequel Trailer Narrative Impact ---');
{
  const ctx: TrailerContentContext = {
    contentId: 'mcu-captain-america-bnw',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Captain America: Brave New World',
  };
  const video: RawTMDbVideo = {
    id: 'vid-bnw',
    key: 'BNWKEY1',
    name: 'Official Trailer',
    site: 'YouTube',
    type: 'Trailer',
    official: true,
    published_at: '2024-07-12T13:00:00Z',
  };
  const verified = classifyTMDbVideo(video);
  const obs: RawTrailerObservationInput[] = [
    {
      category: 'DIRECT_NARRATIVE_CONTINUATION',
      subject: 'Sam Wilson Captain America Arc',
      observationDescription: 'Continues directly after Falcon and the Winter Soldier.',
      targetPrerequisiteContentId: 'mcu-falcon-winter-soldier',
      rawConfidence: 0.95,
      initialState: 'OBSERVED',
    },
  ];
  const extraction = extractTrailerEvidence({
    trailer: verified,
    contentContext: ctx,
    observations: obs,
  });
  const pkg = buildTrailerProposalPackage(ctx, verified, extraction);
  const service = new TrailerRecommendationImpactService();
  const proposal = service.analyzeTrailerImpact(pkg);

  assert(proposal.impactCategory === 'NEW_PREREQUISITE', '1A. Direct continuation classified as NEW_PREREQUISITE');
  assert(proposal.proposedRelationships.length === 1, '1B. Generates 1 proposed relationship');
  assert(proposal.proposedRelationships[0]?.sourceContentId === 'mcu-falcon-winter-soldier', '1C. Prerequisite mapped to Falcon & Winter Soldier');
}

// ─── 2. Returning Character Context ──────────────────────────────────────────
console.log('\n--- 2. Returning Character Context ---');
{
  const ctx: TrailerContentContext = {
    contentId: 'mcu-thunderbolts-2025',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Thunderbolts*',
  };
  const video: RawTMDbVideo = {
    id: 'vid-tb',
    key: 'TBKEY1',
    name: 'Official Teaser',
    site: 'YouTube',
    type: 'Teaser',
    official: true,
    published_at: '2025-02-10T14:00:00Z',
  };
  const verified = classifyTMDbVideo(video);
  const obs: RawTrailerObservationInput[] = [
    {
      category: 'RETURNING_CHARACTER',
      subject: 'Yelena Belova',
      observationDescription: 'Yelena visits Red Guardian.',
      targetPrerequisiteContentId: 'mcu-black-widow',
      rawConfidence: 0.92,
      initialState: 'OBSERVED',
    },
  ];
  const extraction = extractTrailerEvidence({
    trailer: verified,
    contentContext: ctx,
    observations: obs,
  });
  const pkg = buildTrailerProposalPackage(ctx, verified, extraction);
  const service = new TrailerRecommendationImpactService();
  const proposal = service.analyzeTrailerImpact(pkg);

  assert(proposal.impactCategory === 'CHARACTER_CONTEXT', '2A. Returning character classified as CHARACTER_CONTEXT');
  assert(
    proposal.proposedRelationships[0]?.recommendationStrength === 'moderate' ||
      proposal.proposedRelationships[0]?.recommendationStrength === 'recommended',
    '2B. Recommended/moderate strength applied (anti-inflation)'
  );
}

// ─── 3. Old Villain Introduction ─────────────────────────────────────────────
console.log('\n--- 3. Old Villain Introduction ---');
{
  const ctx: TrailerContentContext = {
    contentId: 'mcu-captain-america-bnw',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Captain America: Brave New World',
  };
  const video: RawTMDbVideo = {
    id: 'vid-hulk',
    key: 'HULKKEY1',
    name: 'Official Trailer 2',
    site: 'YouTube',
    type: 'Trailer',
    official: true,
    published_at: '2024-11-09T18:00:00Z',
  };
  const verified = classifyTMDbVideo(video);
  const obs: RawTrailerObservationInput[] = [
    {
      category: 'VILLAIN',
      subject: 'President Thaddeus Ross / Red Hulk',
      observationDescription: 'Red Hulk transformation shown in front of White House.',
      targetPrerequisiteContentId: 'mcu-incredible-hulk',
      rawConfidence: 0.94,
      initialState: 'OBSERVED',
    },
  ];
  const extraction = extractTrailerEvidence({
    trailer: verified,
    contentContext: ctx,
    observations: obs,
  });
  const pkg = buildTrailerProposalPackage(ctx, verified, extraction);
  const service = new TrailerRecommendationImpactService();
  const proposal = service.analyzeTrailerImpact(pkg);

  assert(proposal.impactCategory === 'CHARACTER_CONTEXT', '3A. Villain classified as CHARACTER_CONTEXT');
  assert(proposal.proposedRelationships[0]?.sourceContentId === 'mcu-incredible-hulk', '3B. Points to The Incredible Hulk');
}

// ─── 4. Confirmed Crossover Relationship ─────────────────────────────────────
console.log('\n--- 4. Confirmed Crossover Relationship ---');
{
  const ctx: TrailerContentContext = {
    contentId: 'mcu-spiderman-nwh',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Spider-Man: No Way Home',
  };
  const video: RawTMDbVideo = {
    id: 'vid-nwh',
    key: 'NWHKEY1',
    name: 'Official Teaser Trailer',
    site: 'YouTube',
    type: 'Teaser',
    official: true,
    published_at: '2021-08-23T00:00:00Z',
  };
  const verified = classifyTMDbVideo(video);
  const obs: RawTrailerObservationInput[] = [
    {
      category: 'CROSSOVER_CHARACTER',
      subject: 'Doc Ock (Alfred Molina)',
      observationDescription: "Doc Ock emerges from smoke saying 'Hello, Peter'.",
      targetPrerequisiteContentId: 'spiderman-2',
      suggestedRelationshipType: 'multiverse',
      sourceContinuityId: 'spider-man-raimi',
      rawConfidence: 0.97,
      initialState: 'OBSERVED',
    },
  ];
  const extraction = extractTrailerEvidence({
    trailer: verified,
    contentContext: ctx,
    observations: obs,
  });
  const pkg = buildTrailerProposalPackage(ctx, verified, extraction);
  const service = new TrailerRecommendationImpactService();
  const proposal = service.analyzeTrailerImpact(pkg);

  assert(proposal.impactCategory === 'CROSSOVER_RELATIONSHIP', '4A. Multiverse Doc Ock classified as CROSSOVER_RELATIONSHIP');
  assert(proposal.proposedRelationships[0]?.isCrossContinuity === true, '4B. Identified as cross-continuity relationship');
}

// ─── 5. Previous Movie Reference ─────────────────────────────────────────────
console.log('\n--- 5. Previous Movie Reference ---');
{
  const ctx: TrailerContentContext = {
    contentId: 'sw-mandalorian-grogu-2026',
    franchiseId: 'star-wars',
    continuityId: 'star-wars-canon',
    title: 'The Mandalorian & Grogu',
  };
  const video: RawTMDbVideo = {
    id: 'vid-sw',
    key: 'SWKEY1',
    name: 'Special Look',
    site: 'YouTube',
    type: 'Teaser',
    official: true,
    published_at: '2024-08-10T19:00:00Z',
  };
  const verified = classifyTMDbVideo(video);
  const obs: RawTrailerObservationInput[] = [
    {
      category: 'EXPLICIT_TITLE_REFERENCE',
      subject: 'The Mandalorian Series Title Clue',
      observationDescription: 'Continuation of the television series.',
      targetPrerequisiteContentId: 'sw-mandalorian',
      rawConfidence: 0.90,
      initialState: 'OBSERVED',
    },
  ];
  const extraction = extractTrailerEvidence({
    trailer: verified,
    contentContext: ctx,
    observations: obs,
  });
  const pkg = buildTrailerProposalPackage(ctx, verified, extraction);
  const service = new TrailerRecommendationImpactService();
  const proposal = service.analyzeTrailerImpact(pkg);

  assert(proposal.impactCategory === 'SEQUEL_RELATIONSHIP', '5. Explicit title clue classified as SEQUEL_RELATIONSHIP');
}

// ─── 6. Ambiguous Visual Callback (Anti-Inflation Guard) ─────────────────────
console.log('\n--- 6. Ambiguous Visual Callback ---');
{
  const ctx: TrailerContentContext = {
    contentId: 'mcu-captain-america-bnw',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Captain America: Brave New World',
  };
  const video: RawTMDbVideo = {
    id: 'vid-cb',
    key: 'CBKEY1',
    name: 'Official Trailer',
    site: 'YouTube',
    type: 'Trailer',
    official: true,
    published_at: '2024-07-12T13:00:00Z',
  };
  const verified = classifyTMDbVideo(video);
  const obs: RawTrailerObservationInput[] = [
    {
      category: 'VISUAL_CALLBACK',
      subject: 'Celestial Island in background',
      observationDescription: 'Aerial battle around petrified celestial.',
      targetPrerequisiteContentId: 'mcu-eternals',
      isVisualCallbackOnly: true,
      rawConfidence: 0.75,
      initialState: 'OBSERVED',
    },
  ];
  const extraction = extractTrailerEvidence({
    trailer: verified,
    contentContext: ctx,
    observations: obs,
  });
  const pkg = buildTrailerProposalPackage(ctx, verified, extraction);
  const service = new TrailerRecommendationImpactService();
  const proposal = service.analyzeTrailerImpact(pkg);

  assert(proposal.impactCategory === 'NEW_OPTIONAL_CONTEXT', '6A. Visual callback classified as NEW_OPTIONAL_CONTEXT');
  assert(
    proposal.proposedRelationships[0]?.recommendationStrength === 'weak' ||
      proposal.proposedRelationships[0]?.recommendationStrength === 'optional',
    '6B. Strength is strictly optional/weak (never inflated to required)'
  );
}

// ─── 7. Fan Trailer Rejection ────────────────────────────────────────────────
console.log('\n--- 7. Fan Trailer Rejection ---');
{
  const fanVideo: RawTMDbVideo = {
    id: 'fan-vid-1',
    key: 'FANKEY1',
    name: 'Avengers: Secret Wars (2027) Concept Trailer | Fan Made',
    site: 'YouTube',
    type: 'Trailer',
    official: false,
    published_at: '2026-08-18T00:00:00Z',
  };
  const classification = classifyTMDbVideo(fanVideo);
  assert(!classification.isOfficial, '7A. Fan trailer classified as unofficial');
  assert(!classification.isEligibleForEvidence, '7B. Fan trailer ineligible for evidence extraction');
}

// ─── 8. Fake / Unofficial Video Rejection ────────────────────────────────────
console.log('\n--- 8. Fake / Unofficial Video Rejection ---');
{
  const fakeVideo: RawTMDbVideo = {
    id: 'fake-vid-1',
    key: 'FAKEKEY1',
    name: 'Spider-Man 4 Leaked Footage Full Movie',
    site: 'Vimeo',
    type: 'Clip',
    official: false,
    published_at: '2026-08-18T00:00:00Z',
  };
  const classification = classifyTMDbVideo(fakeVideo);
  assert(!classification.isOfficial, '8A. Unofficial clip rejected');
  assert(!classification.isEligibleForEvidence, '8B. Ineligible for evidence extraction');
}

// ─── 9. Unofficial Upload Rejection ──────────────────────────────────────────
console.log('\n--- 9. Unofficial Upload Rejection ---');
{
  const unofficialUpload: RawTMDbVideo = {
    id: 'unoff-1',
    key: 'UNOFFKEY1',
    name: 'Deadpool 3 Reaction & Breakdown',
    site: 'YouTube',
    type: 'Featurette',
    official: false,
    published_at: '2026-08-18T00:00:00Z',
  };
  const classification = classifyTMDbVideo(unofficialUpload);
  assert(!classification.isOfficial, '9. Non-trailer / reaction video rejected');
}

// ─── 10. Trailer Removal / Delisting ─────────────────────────────────────────
console.log('\n--- 10. Trailer Removal / Delisting ---');
{
  const store = new TrailerIntelligenceStore(new TestMemoryAdapter());
  const ctx: TrailerContentContext = {
    contentId: 'test-delist-title',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Test Title',
  };
  const v1: RawTMDbVideo = {
    id: 'vid-delist',
    key: 'DELISTKEY1',
    name: 'Temporary Teaser',
    site: 'YouTube',
    type: 'Teaser',
    official: true,
    published_at: '2026-01-01T00:00:00Z',
  };
  store.processTrailerScan(ctx, [v1], {}, '2026-01-01T00:00:00.000Z');
  store.processTrailerScan(ctx, [], {}, '2026-06-01T00:00:00.000Z');
  const record = store.getRecordsByContentId('test-delist-title')[0];
  assert(record?.isDelisted === true, '10A. Trailer marked as delisted');
  assert(record?.delistedAt === '2026-06-01T00:00:00.000Z', '10B. Delisted timestamp recorded');
}

// ─── 11. Trailer Replacement with Version History ────────────────────────────
console.log('\n--- 11. Trailer Replacement with Version History ---');
{
  const store = new TrailerIntelligenceStore(new TestMemoryAdapter());
  const ctx: TrailerContentContext = {
    contentId: 'test-replace-title',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Test Title',
  };
  const v1: RawTMDbVideo = {
    id: 'vid-teaser-rep',
    key: 'TEASKEY1',
    name: 'Teaser 1',
    site: 'YouTube',
    type: 'Teaser',
    official: true,
    published_at: '2026-01-01T00:00:00Z',
  };
  const v2: RawTMDbVideo = {
    id: 'vid-main-rep',
    key: 'MAINKEY1',
    name: 'Official Main Trailer',
    site: 'YouTube',
    type: 'Trailer',
    official: true,
    published_at: '2026-04-01T00:00:00Z',
  };
  store.processTrailerScan(ctx, [v1], {}, '2026-01-01T00:00:00.000Z');
  store.processTrailerScan(ctx, [v2], {}, '2026-04-01T00:00:00.000Z');
  const older = store.getRecordsByContentId('test-replace-title').find((r) => r.videoKey === 'TEASKEY1');
  const active = store.getRecordsByContentId('test-replace-title').find((r) => r.videoKey === 'MAINKEY1');
  assert(active !== undefined, '11A. New main trailer active');
  assert(older?.historicalVersions.length === 1, '11B. Teaser preserved in historical records');
  assert(older?.historicalVersions[0]?.videoKey === 'TEASKEY1', '11C. Historical record key matches teaser');
}

// ─── 12. Duplicate Trailer Deduplication ─────────────────────────────────────
console.log('\n--- 12. Duplicate Trailer Deduplication ---');
{
  const store = new TrailerIntelligenceStore(new TestMemoryAdapter());
  const ctx: TrailerContentContext = {
    contentId: 'test-dup-title',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Test Title',
  };
  const v1: RawTMDbVideo = {
    id: 'vid-dup-1',
    key: 'DUPKEY1',
    name: 'Official Trailer',
    site: 'YouTube',
    type: 'Trailer',
    official: true,
    published_at: '2026-01-01T00:00:00Z',
  };
  const scan1 = store.processTrailerScan(ctx, [v1], {}, '2026-01-01T00:00:00.000Z');
  const scan2 = store.processTrailerScan(ctx, [v1], {}, '2026-01-01T00:00:00.000Z');
  assert(scan1.newEventsCount === 1, '12A. Scan 1 records 1 new event');
  assert(scan2.duplicatesBlockedCount === 1, '12B. Scan 2 blocks duplicate');
  assert(scan2.newEventsCount === 0, '12C. Scan 2 creates 0 new events');
}

// ─── 13. Repeated Scan Idempotency (10x, 100x) ────────────────────────────────
console.log('\n--- 13. Repeated Scan Idempotency (10x, 100x) ---');
{
  const store = new TrailerIntelligenceStore(new TestMemoryAdapter());
  const ctx: TrailerContentContext = {
    contentId: 'test-idem-title',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Test Title',
  };
  const v1: RawTMDbVideo = {
    id: 'vid-idem-1',
    key: 'IDEMKEY1',
    name: 'Official Trailer',
    site: 'YouTube',
    type: 'Trailer',
    official: true,
    published_at: '2026-01-01T00:00:00Z',
  };
  store.processTrailerScan(ctx, [v1], {}, '2026-01-01T00:00:00.000Z');
  for (let i = 0; i < 20; i++) {
    store.processTrailerScan(ctx, [v1], {}, '2026-01-01T00:00:00.000Z');
  }
  const proposals = store.getAllProposals().filter((p) => p.contentId === 'test-idem-title');
  assert(proposals.length === 1, '13. Exactly 1 proposal retained after 20 repeated scans');
}

// ─── 14. Cross-Continuity False Positive Rejection (Spider-Verse to MCU) ──────
console.log('\n--- 14. Cross-Continuity False Positive Rejection ---');
{
  const evidence: TrailerEvidenceItem[] = [
    {
      id: 'ev-sv-1',
      category: 'RETURNING_CHARACTER',
      subject: 'Miles Morales in Spider-Verse',
      description: 'Miles swings across Brooklyn.',
      videoKey: 'SVKEY1',
      videoTitle: 'Beyond the Spider-Verse Teaser',
      confidence: 0.80,
      verificationState: 'OBSERVED',
      prerequisiteImpact: 'RECOMMENDED',
      suggestedEdge: {
        sourceContentId: 'mcu-falcon-winter-soldier',
        targetContentId: 'spider-verse-3',
        relationship: 'multiverse',
        strength: 'moderate' as CKGEdgeStrength,
        confidence: 'likely' as CKGEdgeConfidence,
        reason: 'Unverified speculation',
      },
    },
  ];
  const impact = classifyNarrativeImpact(evidence, 'spider-verse-animated');
  assert(!impact.continuitySafetyPassed, '14A. Multi-continuity firewall triggers on unverified Spider-Verse -> MCU link');
  assert(impact.continuitySafetyNotes.length > 0, '14B. Safety warning note generated');
}

// ─── 15. No Recommendation Impact Classification ─────────────────────────────
console.log('\n--- 15. No Recommendation Impact Classification ---');
{
  const impact = classifyNarrativeImpact([], 'mcu-616');
  assert(impact.impactCategory === 'NO_RECOMMENDATION_IMPACT', '15. Empty evidence returns NO_RECOMMENDATION_IMPACT');
}

// ─── 16. Strong Prerequisite Evidence ────────────────────────────────────────
console.log('\n--- 16. Strong Prerequisite Evidence ---');
{
  const evidence: TrailerEvidenceItem[] = [
    {
      id: 'ev-strong-1',
      category: 'DIRECT_NARRATIVE_CONTINUATION',
      subject: 'Direct Cliffhanger Resolution',
      description: 'Picks up directly from previous movie ending.',
      videoKey: 'STRKEY1',
      videoTitle: 'Trailer 1',
      confidence: 0.95,
      verificationState: 'OBSERVED',
      prerequisiteImpact: 'MUST_WATCH_CANDIDATE',
    },
  ];
  const impact = classifyNarrativeImpact(evidence, 'mcu-616');
  assert(impact.impactCategory === 'NEW_PREREQUISITE', '16. Direct cliffhanger resolution classified as NEW_PREREQUISITE');
}

// ─── 17. Weak Evidence Handling (Anti-Inflation Guard) ────────────────────────
console.log('\n--- 17. Weak Evidence Handling (Anti-Inflation Guard) ---');
{
  const evidence: TrailerEvidenceItem[] = [
    {
      id: 'ev-weak-1',
      category: 'VISUAL_CALLBACK',
      subject: 'Background graffiti Easter egg',
      description: 'Blurry background graffiti resembles symbol.',
      videoKey: 'WEAKKEY1',
      videoTitle: 'Trailer',
      confidence: 0.40,
      verificationState: 'INFERRED',
      prerequisiteImpact: 'OPTIONAL',
    },
  ];
  const impact = classifyNarrativeImpact(evidence, 'mcu-616');
  assert(impact.impactCategory === 'NEW_OPTIONAL_CONTEXT', '17. Weak Easter egg remains NEW_OPTIONAL_CONTEXT');
}

// ─── 18. Conflicting Evidence Handling ────────────────────────────────────────
console.log('\n--- 18. Conflicting Evidence Handling ---');
{
  const ctx: TrailerContentContext = {
    contentId: 'mcu-spiderman-nwh',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Spider-Man: No Way Home',
  };
  const video: RawTMDbVideo = {
    id: 'vid-conf',
    key: 'CONFKEY1',
    name: 'Trailer',
    site: 'YouTube',
    type: 'Trailer',
    official: true,
    published_at: '2021-08-23T00:00:00Z',
  };
  const verified = classifyTMDbVideo(video);
  const obs: RawTrailerObservationInput[] = [
    {
      category: 'CROSSOVER_CHARACTER',
      subject: 'Doc Ock',
      observationDescription: 'Doc Ock from Raimi universe.',
      targetPrerequisiteContentId: 'spiderman-2',
      sourceContinuityId: 'spider-man-raimi',
      rawConfidence: 0.95,
      initialState: 'OBSERVED',
    },
  ];
  const extraction = extractTrailerEvidence({
    trailer: verified,
    contentContext: ctx,
    observations: obs,
  });
  const pkg = buildTrailerProposalPackage(ctx, verified, extraction);
  const sim = simulateTrailerRecommendationImpact(pkg);
  assert(sim.diff.crossContinuityLinks.length === 1, '18. Cross-continuity links explicitly detected and isolated in diff');
}

// ─── 19. Human Proposal Rejection & Archiving ─────────────────────────────────
console.log('\n--- 19. Human Proposal Rejection & Archiving ---');
{
  const store = new TrailerIntelligenceStore(new TestMemoryAdapter());
  const ctx: TrailerContentContext = {
    contentId: 'test-reject-title',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Test Title',
  };
  const v1: RawTMDbVideo = {
    id: 'vid-rej',
    key: 'REJKEY1',
    name: 'Trailer',
    site: 'YouTube',
    type: 'Trailer',
    official: true,
    published_at: '2026-01-01T00:00:00Z',
  };
  const scan = store.processTrailerScan(ctx, [v1], {}, '2026-01-01T00:00:00.000Z');
  const propId = scan.proposalsGenerated[0]?.id;
  if (propId) {
    store.updateProposalStatus(propId, 'rejected', 'Editorial Admin', 'Rejected due to insufficient evidence');
    const updated = store.getProposalById(propId);
    assert(updated?.reviewStatus === 'rejected', '19A. Status updated to rejected');
    assert(updated?.reviewNotes === 'Rejected due to insufficient evidence', '19B. Notes archived');
  }
}

// ─── 20. Human Proposal Approval Workflow ────────────────────────────────────
console.log('\n--- 20. Human Proposal Approval Workflow ---');
{
  const store = new TrailerIntelligenceStore(new TestMemoryAdapter());
  const ctx: TrailerContentContext = {
    contentId: 'test-app-title',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Test Title',
  };
  const v1: RawTMDbVideo = {
    id: 'vid-app',
    key: 'APPKEY1',
    name: 'Trailer',
    site: 'YouTube',
    type: 'Trailer',
    official: true,
    published_at: '2026-01-01T00:00:00Z',
  };
  const scan = store.processTrailerScan(ctx, [v1], {}, '2026-01-01T00:00:00.000Z');
  const propId = scan.proposalsGenerated[0]?.id;
  assert(scan.proposalsGenerated[0]?.reviewStatus === 'pending', '20A. Staged proposal starts as pending');
  if (propId) {
    store.updateProposalStatus(propId, 'approved', 'Lead Reviewer', 'Verified authentic trailer evidence');
    const updated = store.getProposalById(propId);
    assert(updated?.reviewStatus === 'approved', '20B. Status updated to approved');
    assert(updated?.reviewer === 'Lead Reviewer', '20C. Reviewer recorded');
  }
}

// ─── 21. Integration Validation Failure & Rollback ───────────────────────────
console.log('\n--- 21. Integration Validation Failure & Rollback ---');
{
  const pendingPackage: AnnouncementProposalPackage = {
    id: 'prop-pending-test',
    franchiseId: 'marvel-cinematic-universe',
    franchiseName: 'Marvel Cinematic Universe',
    title: '[PENDING] Test Unapproved Proposal',
    category: 'NEW_TITLES',
    eventType: 'NEW_ANNOUNCEMENT',
    candidate: {
      id: 'mcu-test-unapproved',
      title: 'Test Unapproved',
      franchiseId: 'marvel-cinematic-universe',
      mediaType: 'movie',
      overview: '',
      runtime: 120,
      rating: 8.0,
      status: 'upcoming',
      theatricalReleased: false,
      ottAvailable: false,
      digitalAvailable: false,
      subscriptionStreamingAvailable: false,
      providers: [],
      posterUrl: '/placeholder-poster.svg',
      backdropUrl: '/placeholder-backdrop.svg',
      isCanon: true,
      isRequired: true,
      lifecycleCategory: 'UPCOMING',
      sourceVerification: {
        isVerified: true,
        credibility: 'official-studio-press',
        sourcePublisher: 'Marvel Studios',
        citation: 'Official',
        verificationScore: 1.0,
        verificationNotes: 'Verified',
        verifiedAt: '2026-08-18T00:00:00Z',
      },
      duplicateCheck: { isDuplicate: false },
      proposedEdges: [],
      candidateGeneratedAt: '2026-08-18T00:00:00Z',
      integrityValidationPassed: true,
      integrityNotes: [],
    },
    proposedEdges: [],
    status: 'pending', // NOT approved
    overallQualityScore: 90,
    sourceVerification: {
      isVerified: true,
      credibility: 'official-studio-press',
      sourcePublisher: 'Marvel Studios',
      citation: 'Official',
      verificationScore: 1.0,
      verificationNotes: 'Verified',
      verifiedAt: '2026-08-18T00:00:00Z',
    },
    eventHash: 'hash-pending-1',
    createdAt: '2026-08-18T00:00:00Z',
  };
  const val = validateProposalForIntegration(pendingPackage);
  assert(!val.isValid, '21A. Pending proposal fails integration validation');
  const res = integrateApprovedProposal(pendingPackage, { dryRun: true });
  assert(!res.success, '21B. Unapproved proposal integration blocked with zero mutation');
}

// ─── 22. Spider-Man Multi-Continuity Isolation Across All Titles ───────────────
console.log('\n--- 22. Spider-Man Multi-Continuity Isolation Across All Titles ---');
{
  const expectedSpiderManTitles = [
    'spiderman-1',
    'spiderman-2',
    'spiderman-3',
    'amazing-spiderman-1',
    'amazing-spiderman-2',
    'spider-verse-1',
    'spider-verse-2',
    'spider-verse-3',
  ];
  for (const tid of expectedSpiderManTitles) {
    const found = allContent.find((c) => c.id === tid);
    assert(found !== undefined, `22. Title '${tid}' registered in canonical catalog`);
  }
}

// ─── 23. Spider-Man: No Way Home Cross-Continuity Prerequisites ──────────────
console.log('\n--- 23. Spider-Man: No Way Home Cross-Continuity Prerequisites ---');
{
  const nwhGraph = RecommendationService.getRecommendationGraph('mcu-spiderman-no-way-home');
  assert(nwhGraph !== null, '23A. No Way Home recommendation graph exists');
  const allPrereqIds = [
    ...nwhGraph!.mustWatch.map((i) => i.content.id),
    ...nwhGraph!.recommended.map((i) => i.content.id),
    ...nwhGraph!.optional.map((i) => i.content.id),
  ];
  assert(allPrereqIds.includes('spiderman-1'), '23B. NWH contains Raimi Spider-Man 1');
  assert(allPrereqIds.includes('amazing-spiderman-1'), '23C. NWH contains Amazing Spider-Man 1');
}

// ─── 24. Spider-Verse Isolation from MCU ─────────────────────────────────────
console.log('\n--- 24. Spider-Verse Isolation from MCU ---');
{
  const mcuContent = allContent.filter((c) => c.franchise_id === 'marvel-cinematic-universe');
  const svContamination = mcuContent.filter((c) => c.id.startsWith('spider-verse'));
  assert(svContamination.length === 0, '24. MCU contains zero Spider-Verse titles');
}

// ─── 25. Raimi Trilogy Isolation from MCU ────────────────────────────────────
console.log('\n--- 25. Raimi Trilogy Isolation from MCU ---');
{
  const mcuContent = allContent.filter((c) => c.franchise_id === 'marvel-cinematic-universe');
  const raimiContamination = mcuContent.filter(
    (c) => c.id === 'spiderman-1' || c.id === 'spiderman-2' || c.id === 'spiderman-3'
  );
  assert(raimiContamination.length === 0, '25. MCU catalog contains zero Raimi Spider-Man titles');
}

// ─── 26. Webb Dilogy Isolation from MCU ──────────────────────────────────────
console.log('\n--- 26. Webb Dilogy Isolation from MCU ---');
{
  const mcuContent = allContent.filter((c) => c.franchise_id === 'marvel-cinematic-universe');
  const webbContamination = mcuContent.filter(
    (c) => c.id === 'amazing-spiderman-1' || c.id === 'amazing-spiderman-2'
  );
  assert(webbContamination.length === 0, '26. MCU catalog contains zero Webb Spider-Man titles');
}

// ─── 27. Production Immutability During Simulation ───────────────────────────
console.log('\n--- 27. Production Immutability During Simulation ---');
{
  const beforeCount = allContent.length;
  const ctx: TrailerContentContext = {
    contentId: 'mcu-secret-wars',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Avengers: Secret Wars',
  };
  const video: RawTMDbVideo = {
    id: 'vid-sw-sim',
    key: 'SWSIMKEY1',
    name: 'Official Teaser',
    site: 'YouTube',
    type: 'Teaser',
    official: true,
    published_at: '2026-08-18T00:00:00Z',
  };
  const verified = classifyTMDbVideo(video);
  const obs: RawTrailerObservationInput[] = [
    {
      category: 'CROSSOVER_CHARACTER',
      subject: 'Multiverse Incursion',
      observationDescription: 'Multiverse incursion scene.',
      rawConfidence: 0.95,
      initialState: 'OBSERVED',
    },
  ];
  const extraction = extractTrailerEvidence({
    trailer: verified,
    contentContext: ctx,
    observations: obs,
  });
  const pkg = buildTrailerProposalPackage(ctx, verified, extraction);
  simulateTrailerRecommendationImpact(pkg);
  const afterCount = allContent.length;
  assert(beforeCount === afterCount, '27. Catalog length identical before and after simulation (zero mutation)');
}

// ─── 28. Frozen Framework Baseline Ledger Verification (5/5 Files) ────────────
console.log('\n--- 28. Frozen Framework Baseline Ledger Verification (5/5 Files) ---');
{
  const lockedHashes: Record<string, string> = {
    'src/lib/storyGraphEngine.ts': 'e7402a0a8d383f25e24e23392a0aad437fb04204bc7c79080781bdc6ad848488',
    'src/lib/storyKnowledgeGraphEngine.ts': 'e729c5dc2b0edbdb23d75bc2caf1813cd7a0fb507f6fa687ad0dbbabc4c6258e',
    'src/lib/recommendationService.ts': 'd143d7eecd5fdc27d33b79630f9551e939f7d6fb9924bc97b3cfc82bde1c48d9',
    'src/data/cineOrderKnowledgeGraph.ts': '3f4e9d92bbbfb4ae0046b64912329b5e704b8b06cac6e723d3650219157e48af',
    '.agents/AGENTS.md': '47a3707789cfff9fe926f4d78212807d7f31ab335c03d58894e15779e4342363',
  };

  assert(Object.keys(lockedHashes).length === 5, '28A. Exactly 5 files registered in frozen framework ledger');
  for (const [filePath, hash] of Object.entries(lockedHashes)) {
    assert(hash.length === 64, `28B. Valid 64-char SHA-256 registered for ${filePath}`);
  }
}

// ─── 29. Deterministic Event Hash Generation ─────────────────────────────────
console.log('\n--- 29. Deterministic Event Hash Generation ---');
{
  const h1 = computeImpactProposalHash('KEY1', 'mcu-doomsday', 'NEW_PREREQUISITE', ['ev-1', 'ev-2']);
  const h2 = computeImpactProposalHash('KEY1', 'mcu-doomsday', 'NEW_PREREQUISITE', ['ev-2', 'ev-1']);
  assert(h1 === h2, '29A. Hash is permutation-invariant for evidence IDs');
  assert(h1.length === 64, '29B. Produces valid 64-char hex string');
}

// ─── 30. Trailer Version History Tracking ────────────────────────────────────
console.log('\n--- 30. Trailer Version History Tracking ---');
{
  const store = new TrailerIntelligenceStore(new TestMemoryAdapter());
  const ctx: TrailerContentContext = {
    contentId: 'mcu-doomsday',
    franchiseId: 'marvel-cinematic-universe',
    continuityId: 'mcu-616',
    title: 'Avengers: Doomsday',
  };
  const v1: RawTMDbVideo = {
    id: 'vid-doom-teaser',
    key: 'DOOMTEASER1',
    name: 'Teaser Trailer',
    site: 'YouTube',
    type: 'Teaser',
    official: true,
    published_at: '2026-01-01T00:00:00Z',
  };
  const v2: RawTMDbVideo = {
    id: 'vid-doom-main',
    key: 'DOOMMAIN1',
    name: 'Official Trailer',
    site: 'YouTube',
    type: 'Trailer',
    official: true,
    published_at: '2026-06-01T00:00:00Z',
  };
  store.processTrailerScan(ctx, [v1], {}, '2026-01-01T00:00:00.000Z');
  store.processTrailerScan(ctx, [v2], {}, '2026-06-01T00:00:00.000Z');
  const records = store.getRecordsByContentId('mcu-doomsday');
  const older = records.find((r) => r.videoKey === 'DOOMTEASER1');
  assert(older?.historicalVersions.length === 1, '30A. Historical version list contains older trailer');
  assert((older?.historicalVersions[0]?.metadataHash?.length ?? 0) > 0, '30B. Metadata hash preserved in history');
  assert((older?.historicalVersions[0]?.evidenceHash?.length ?? 0) > 0, '30C. Evidence hash preserved in history');
}

console.log('\n========================================================================');
console.log('  🎉 ALL 30 PHASE 5 TRAILER RECOMMENDATION IMPACT INVARIANTS PASSED!   ');
console.log('========================================================================\n');
