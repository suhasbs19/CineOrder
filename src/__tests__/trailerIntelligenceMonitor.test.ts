/**
 * CineOrder Trailer Intelligence — Phase 3: Continuous Monitor Integration & Idempotency Pipeline Test Suite
 * 
 * 24 Core Invariants:
 * 1. New official trailer detection
 * 2. Official teaser detection
 * 3. Fan trailer rejection
 * 4. Unsupported source rejection
 * 5. Duplicate trailer scan
 * 6. 10 repeated scans -> 0 duplicates
 * 7. Trailer metadata update
 * 8. Trailer replacement (NEW superseding TEASER)
 * 9. Trailer removal (Delisted trailer handling)
 * 10. Evidence hash stability
 * 11. Event hash stability
 * 12. Proposal hash stability
 * 13. Pending approval state (status = 'pending')
 * 14. No CKG mutation before approval
 * 15. No recommendation mutation before approval
 * 16. Continuity firewall
 * 17. Corrupted persistence recovery
 * 18. Missing metadata recovery
 * 19. Multiple franchises
 * 20. Multiple trailers for same title
 * 21. New trailer superseding teaser
 * 22. Historical trailer preservation
 * 23. Cross-run persistence
 * 24. Frozen framework invariant preservation
 */

import {
  TrailerIntelligenceStore,
  computeTrailerMetadataHash,
  computeEvidenceHash,
  computeTrailerLifecycleEventHash,
  type TrailerIntelligenceStorageAdapter,
  type TrailerStoreSerializedState,
} from '../lib/trailerIntelligenceStore';
import { globalAnnouncementMonitor } from '../lib/globalAnnouncementMonitor';
import type { RawTMDbVideo } from '../types/trailerDiscovery';
import type {
  TrailerContentContext,
  RawTrailerObservationInput,
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
console.log('  CINEORDER TRAILER INTELLIGENCE PHASE 3 MONITOR SUITE (24 INVARIANTS)  ');
console.log('========================================================================\n');

class MockStorageAdapter implements TrailerIntelligenceStorageAdapter {
  public savedState: TrailerStoreSerializedState | null = null;
  load(): TrailerStoreSerializedState | null {
    return this.savedState ? JSON.parse(JSON.stringify(this.savedState)) : null;
  }
  save(state: TrailerStoreSerializedState): void {
    this.savedState = JSON.parse(JSON.stringify(state));
  }
}

const mockAdapter = new MockStorageAdapter();
const store = new TrailerIntelligenceStore(mockAdapter);

const testContentMCU: TrailerContentContext = {
  contentId: 'mcu-thunderbolts-2025',
  franchiseId: 'marvel-cinematic-universe',
  continuityId: 'mcu-616',
  title: 'Thunderbolts*',
  tmdbId: 775312,
};

const rawOfficialTrailer: RawTMDbVideo = {
  id: 'vid-tb-1',
  key: 'dQw4w9WgXcQ',
  name: "Marvel Studios' Thunderbolts* | Official Trailer",
  site: 'YouTube',
  type: 'Trailer',
  official: true,
  published_at: '2025-02-10T14:00:00Z',
};

const rawTeaserVideo: RawTMDbVideo = {
  id: 'vid-tb-teaser',
  key: 'teaserKey12345',
  name: "Marvel Studios' Thunderbolts* | Official Teaser",
  site: 'YouTube',
  type: 'Teaser',
  official: true,
  published_at: '2024-09-23T12:00:00Z',
};

const rawFanTrailer: RawTMDbVideo = {
  id: 'vid-fan-1',
  key: 'fanKey9999999',
  name: 'Thunderbolts Concept Trailer (Fan-Made)',
  site: 'YouTube',
  type: 'Trailer',
  official: false,
  published_at: '2024-08-01T10:00:00Z',
};

const rawVimeoVideo: RawTMDbVideo = {
  id: 'vid-vimeo-1',
  key: 'vimeo12345678',
  name: 'Thunderbolts Vimeo Promo',
  site: 'Vimeo',
  type: 'Trailer',
  official: true,
  published_at: '2025-01-01T10:00:00Z',
};

const observationsMap: Record<string, RawTrailerObservationInput[]> = {
  dQw4w9WgXcQ: [
    {
      category: 'RETURNING_CHARACTER',
      subject: 'Yelena Belova',
      observationDescription: 'Yelena visits Alexei in his apartment.',
      timestampSeconds: 35,
      targetPrerequisiteContentId: 'mcu-black-widow',
    },
    {
      category: 'VILLAIN',
      subject: 'Bob Reynolds (The Sentry)',
      observationDescription: 'Bob is shown in the underground research facility.',
      timestampSeconds: 90,
    },
  ],
  teaserKey12345: [
    {
      category: 'RETURNING_CHARACTER',
      subject: 'Bucky Barnes',
      observationDescription: 'Bucky dressed in a suit attending a senate hearing.',
      timestampSeconds: 20,
    },
  ],
};

// ─── 1. New Official Trailer Detection ───────────────────────────────────────
console.log('--- Test 1: New Official Trailer Detection ---');
store.clear();
const res1 = store.processTrailerScan(testContentMCU, [rawOfficialTrailer], observationsMap);
assert(res1.newEventsCount === 1, '1A. Exactly 1 new trailer event detected');
assert(res1.proposalsGenerated.length === 1, '1B. Exactly 1 proposal package generated');
assert(res1.proposalsGenerated[0]!.videoKey === 'dQw4w9WgXcQ', '1C. Proposal key matches');
assert(res1.records.length === 1, '1D. 1 tracked record saved');

// ─── 2. Official Teaser Detection ────────────────────────────────────────────
console.log('\n--- Test 2: Official Teaser Detection ---');
store.clear();
const res2 = store.processTrailerScan(testContentMCU, [rawTeaserVideo], observationsMap);
assert(res2.newEventsCount === 1, '2A. Teaser detected as new event');
assert(res2.proposalsGenerated[0]!.videoClassification === 'OFFICIAL_TEASER', '2B. Classification is OFFICIAL_TEASER');

// ─── 3. Fan Trailer Rejection ────────────────────────────────────────────────
console.log('\n--- Test 3: Fan Trailer Rejection ---');
store.clear();
const res3 = store.processTrailerScan(testContentMCU, [rawFanTrailer], observationsMap);
assert(res3.rejectedCount === 1, '3A. Fan trailer rejected');
assert(res3.newEventsCount === 0, '3B. 0 new events from fan trailer');
assert(res3.proposalsGenerated.length === 0, '3C. 0 proposals generated from fan trailer');

// ─── 4. Unsupported Source Rejection ─────────────────────────────────────────
console.log('\n--- Test 4: Unsupported Source Rejection ---');
store.clear();
const res4 = store.processTrailerScan(testContentMCU, [rawVimeoVideo], observationsMap);
assert(res4.rejectedCount === 1, '4A. Non-YouTube source rejected');
assert(res4.proposalsGenerated.length === 0, '4B. 0 proposals from Vimeo source');

// ─── 5. Duplicate Trailer Scan ───────────────────────────────────────────────
console.log('\n--- Test 5: Duplicate Trailer Scan ---');
store.clear();
const scanA = store.processTrailerScan(testContentMCU, [rawOfficialTrailer], observationsMap);
const scanB = store.processTrailerScan(testContentMCU, [rawOfficialTrailer], observationsMap);
assert(scanA.newEventsCount === 1, '5A. Initial scan created 1 event');
assert(scanB.newEventsCount === 0, '5B. Duplicate scan created 0 new events');
assert(scanB.duplicatesBlockedCount === 1, '5C. Exactly 1 duplicate blocked');
assert(store.getAllProposals().length === 1, '5D. Store contains exactly 1 proposal');

// ─── 6. 10 Repeated Scans -> 0 Duplicates ───────────────────────────────────
console.log('\n--- Test 6: 10 Repeated Scans -> 0 Duplicates ---');
for (let i = 0; i < 10; i++) {
  const repeated = store.processTrailerScan(testContentMCU, [rawOfficialTrailer], observationsMap);
  assert(repeated.newEventsCount === 0, `6.${i} Repeat scan ${i + 1} produced 0 new events`);
  assert(repeated.duplicatesBlockedCount === 1, `6.${i} Repeat scan ${i + 1} flagged as duplicate`);
}
assert(store.getAllProposals().length === 1, '6A. Total proposals remains strictly 1 after 10 repeats');
assert(store.getTrackedRecords().length === 1, '6B. Total tracked records remains strictly 1');

// ─── 7. Trailer Metadata Update ──────────────────────────────────────────────
console.log('\n--- Test 7: Trailer Metadata Update ---');
const updatedTrailer: RawTMDbVideo = {
  ...rawOfficialTrailer,
  name: "Marvel Studios' Thunderbolts* | Final Trailer (Updated)",
};
const res7 = store.processTrailerScan(testContentMCU, [updatedTrailer], observationsMap);
assert(res7.updatedCount === 1, '7A. Update event detected');
assert(res7.proposalsGenerated.length === 1, '7B. Updated proposal generated');
assert(res7.proposalsGenerated[0]!.videoTitle.includes('Final Trailer'), '7C. Title updated in proposal');

// ─── 8. Trailer Replacement (Official Superseding Teaser) ───────────────────
console.log('\n--- Test 8: Trailer Replacement ---');
store.clear();
// First scan teaser
store.processTrailerScan(testContentMCU, [rawTeaserVideo], observationsMap);
// Then scan full trailer
const res8 = store.processTrailerScan(testContentMCU, [rawOfficialTrailer], observationsMap);
assert(res8.replacedCount === 1, '8A. Replacement detected');
assert(res8.proposalsGenerated.length === 1, '8B. New trailer proposal generated');
const records8 = store.getRecordsByContentId('mcu-thunderbolts-2025');
assert(records8.length === 2, '8C. Both trailer records preserved in store');

// ─── 9. Trailer Removal (Delisted Trailer Handling) ─────────────────────────
console.log('\n--- Test 9: Trailer Removal ---');
store.clear();
store.processTrailerScan(testContentMCU, [rawOfficialTrailer], observationsMap);
// Scan with empty list (trailer delisted)
const res9 = store.processTrailerScan(testContentMCU, [], observationsMap);
assert(res9.removedCount === 1, '9A. Delisted trailer detected');
const delistedRecord = store.getRecord(`tr-${testContentMCU.franchiseId}-${testContentMCU.contentId}-${rawOfficialTrailer.key}`);
assert(delistedRecord?.isDelisted === true, '9B. Record marked isDelisted: true');
assert(store.getAllProposals().length === 1, '9C. Active proposals preserved without deletion');

// ─── 10. Evidence Hash Stability ────────────────────────────────────────────
console.log('\n--- Test 10: Evidence Hash Stability ---');
const mockEv1 = [
  {
    id: 'ev-1',
    category: 'RETURNING_CHARACTER' as const,
    subject: 'Yelena',
    description: 'Yelena scene',
    videoKey: 'key1',
    videoTitle: 'Title1',
    confidence: 0.95,
    verificationState: 'OBSERVED' as const,
    prerequisiteImpact: 'OPTIONAL' as const,
  },
];
const h1A = computeEvidenceHash(mockEv1);
const h1B = computeEvidenceHash(mockEv1);
assert(h1A === h1B, '10A. Evidence hash is strictly deterministic');
assert(h1A.startsWith('eh-'), '10B. Evidence hash format valid');

// ─── 11. Event Hash Stability ───────────────────────────────────────────────
console.log('\n--- Test 11: Event Hash Stability ---');
const evtH1 = computeTrailerLifecycleEventHash('mcu', 'thunderbolts', 'key1', 'NEW_OFFICIAL_TRAILER', 'meta1', 'ev1');
const evtH2 = computeTrailerLifecycleEventHash('mcu', 'thunderbolts', 'key1', 'NEW_OFFICIAL_TRAILER', 'meta1', 'ev1');
assert(evtH1 === evtH2, '11A. Event hash is strictly deterministic');
assert(evtH1.startsWith('evt-tr-'), '11B. Event hash format valid');

// ─── 12. Proposal Hash Stability ────────────────────────────────────────────
console.log('\n--- Test 12: Proposal Hash Stability ---');
const metaH1 = computeTrailerMetadataHash('mcu', 'thunderbolts', 'key1', 'Title', 'OFFICIAL_TRAILER', '2025-01-01');
const metaH2 = computeTrailerMetadataHash('mcu', 'thunderbolts', 'key1', 'Title', 'OFFICIAL_TRAILER', '2025-01-01');
assert(metaH1 === metaH2, '12. Metadata hash is strictly deterministic');

// ─── 13. Pending Approval State ─────────────────────────────────────────────
console.log('\n--- Test 13: Pending Approval State ---');
store.clear();
const res13 = store.processTrailerScan(testContentMCU, [rawOfficialTrailer], observationsMap);
assert(res13.proposalsGenerated[0]!.reviewStatus === 'pending', '13A. Generated proposal is strictly "pending"');
assert(res13.records[0]!.status === 'pending', '13B. Tracked record status is "pending"');

// ─── 14. No CKG Mutation Before Approval ────────────────────────────────────
console.log('\n--- Test 14: No CKG Mutation Before Approval ---');
const ckgEdgesBefore = cineOrderKnowledgeGraph.edges.length;
store.processTrailerScan(testContentMCU, [rawOfficialTrailer], observationsMap);
assert(cineOrderKnowledgeGraph.edges.length === ckgEdgesBefore, '14. CKG edges count strictly unchanged');

// ─── 15. No Recommendation Mutation Before Approval ─────────────────────────
console.log('\n--- Test 15: No Recommendation Mutation Before Approval ---');
const travBefore = RecommendationService.getRecommendationGraph('mcu-iron-man');
store.processTrailerScan(testContentMCU, [rawOfficialTrailer], observationsMap);
const travAfter = RecommendationService.getRecommendationGraph('mcu-iron-man');
assert(travBefore.mustWatch.length === travAfter.mustWatch.length, '15. Must Watch count strictly unchanged');

// ─── 16. Continuity Firewall ────────────────────────────────────────────────
console.log('\n--- Test 16: Continuity Firewall ---');
const dcContent: TrailerContentContext = {
  contentId: 'dc-superman-2025',
  franchiseId: 'dc-universe',
  continuityId: 'dcu-gunn',
  title: 'Superman',
  tmdbId: 1064213,
};
const rawDCCrossoverTrailer: RawTMDbVideo = {
  id: 'vid-dc-1',
  key: 'dcSuperKey123',
  name: 'Superman | Official Teaser',
  site: 'YouTube',
  type: 'Teaser',
  official: true,
  published_at: '2025-01-10T12:00:00Z',
};
const dcObsCrossViolation: Record<string, RawTrailerObservationInput[]> = {
  dcSuperKey123: [
    {
      category: 'RETURNING_CHARACTER', // INCORRECT: cross-continuity character link
      subject: 'Batman (Affleck)',
      observationDescription: 'DCEU Batman cameo claim.',
      sourceContinuityId: 'dceu-snyder',
      targetPrerequisiteContentId: 'dceu-batman-v-superman',
    },
  ],
};
const res16 = store.processTrailerScan(dcContent, [rawDCCrossoverTrailer], dcObsCrossViolation);
assert(res16.proposalsGenerated[0]!.continuitySafetyPassed === false, '16A. Cross-continuity violation flagged');
assert(res16.proposalsGenerated[0]!.proposedStoryEdges.length === 0, '16B. Edge generation blocked for cross-continuity violation');

// ─── 17. Corrupted Persistence Recovery ─────────────────────────────────────
console.log('\n--- Test 17: Corrupted Persistence Recovery ---');
const corruptAdapter: TrailerIntelligenceStorageAdapter = {
  load: () => {
    throw new Error('Corrupt disk block simulated');
  },
  save: () => {},
};
let didCrash = false;
try {
  const resilientStore = new TrailerIntelligenceStore(corruptAdapter);
  assert(resilientStore.getTrackedRecords().length === 0, '17A. Resilient store initialized with empty state on corruption');
} catch {
  didCrash = true;
}
assert(!didCrash, '17B. No unhandled exception thrown during corruption recovery');

// ─── 18. Missing Metadata Recovery ──────────────────────────────────────────
console.log('\n--- Test 18: Missing Metadata Recovery ---');
store.clear();
const corruptVideoItem: RawTMDbVideo = {
  id: 'corrupt-1',
  key: '', // EMPTY
  name: '',
  site: 'YouTube',
  type: 'Trailer',
  official: true,
};
const res18 = store.processTrailerScan(testContentMCU, [corruptVideoItem], observationsMap);
assert(res18.rejectedCount === 1, '18A. Empty key safely rejected');
assert(res18.proposalsGenerated.length === 0, '18B. 0 proposals generated');

// ─── 19. Multiple Franchises ────────────────────────────────────────────────
console.log('\n--- Test 19: Multiple Franchises ---');
store.clear();
const swContent: TrailerContentContext = {
  contentId: 'sw-mandalorian-grogu-2026',
  franchiseId: 'star-wars',
  continuityId: 'star-wars-canon',
  title: 'The Mandalorian & Grogu',
  tmdbId: 123456,
};
const rawSWTrailer: RawTMDbVideo = {
  id: 'vid-sw-1',
  key: 'swMandoKey777',
  name: 'The Mandalorian & Grogu | Teaser',
  site: 'YouTube',
  type: 'Teaser',
  official: true,
  published_at: '2025-03-01T12:00:00Z',
};

store.processTrailerScan(testContentMCU, [rawOfficialTrailer], observationsMap);
store.processTrailerScan(swContent, [rawSWTrailer], {});
assert(store.getRecordsByContentId('mcu-thunderbolts-2025').length === 1, '19A. MCU record present');
assert(store.getRecordsByContentId('sw-mandalorian-grogu-2026').length === 1, '19B. Star Wars record present');
assert(store.getAllProposals().length === 2, '19C. 2 distinct franchise proposals tracked');

// ─── 20. Multiple Trailers for Same Title ───────────────────────────────────
console.log('\n--- Test 20: Multiple Trailers for Same Title ---');
store.clear();
const rawClipVideo: RawTMDbVideo = {
  id: 'vid-tb-clip-1',
  key: 'clipKey888888',
  name: 'Thunderbolts Elevator Fight Clip',
  site: 'YouTube',
  type: 'Clip',
  official: true,
  published_at: '2025-04-15T18:00:00Z',
};
store.processTrailerScan(testContentMCU, [rawOfficialTrailer, rawClipVideo], observationsMap);
const multiRecords = store.getRecordsByContentId('mcu-thunderbolts-2025');
assert(multiRecords.length === 2, '20A. Exactly 2 records tracked for same title');
assert(store.getAllProposals().length === 2, '20B. 2 proposals generated for same title');

// ─── 21. New Trailer Superseding Teaser ─────────────────────────────────────
console.log('\n--- Test 21: New Trailer Superseding Teaser ---');
store.clear();
store.processTrailerScan(testContentMCU, [rawTeaserVideo], observationsMap);
const repRes = store.processTrailerScan(testContentMCU, [rawOfficialTrailer], observationsMap);
assert(repRes.replacedCount === 1, '21. Teaser superseded by official trailer');

// ─── 22. Historical Trailer Preservation ────────────────────────────────────
console.log('\n--- Test 22: Historical Trailer Preservation ---');
const activeRec = store.getRecord(`tr-${testContentMCU.franchiseId}-${testContentMCU.contentId}-${rawOfficialTrailer.key}`);
assert(activeRec !== undefined, '22A. Active trailer record found');
const teaserRec = store.getRecord(`tr-${testContentMCU.franchiseId}-${testContentMCU.contentId}-${rawTeaserVideo.key}`);
assert(teaserRec !== undefined, '22B. Older teaser record preserved');
assert(teaserRec!.historicalVersions.length >= 1, '22C. Historical version entry logged on teaser');

// ─── 23. Cross-Run Persistence ──────────────────────────────────────────────
console.log('\n--- Test 23: Cross-Run Persistence ---');
const reloadedStore = new TrailerIntelligenceStore(mockAdapter);
assert(reloadedStore.getAllProposals().length === store.getAllProposals().length, '23A. Proposals reloaded accurately from storage');
assert(reloadedStore.getTrackedRecords().length === store.getTrackedRecords().length, '23B. Tracked records reloaded accurately from storage');

// ─── 24. Frozen Framework Invariant Preservation ────────────────────────────
console.log('\n--- Test 24: Frozen Framework Invariant Preservation ---');
assert(typeof RecommendationService.getRecommendationGraph === 'function', '24A. Recommendation engine intact');
assert(Array.isArray(cineOrderKnowledgeGraph.edges), '24B. Knowledge graph edges intact');
assert(typeof cineOrderKnowledgeGraph.titleNodes === 'object', '24C. Knowledge graph titleNodes intact');

// ─── Monitor Integration Verification ───────────────────────────────────────
console.log('\n--- Announcement Monitor Integration ---');
const monitorScan = globalAnnouncementMonitor.scanTrailerIntelligenceForContent(
  {
    id: 'mcu-thunderbolts-2025',
    franchise_id: 'marvel-cinematic-universe',
    title: 'Thunderbolts*',
  } as any,
  [rawOfficialTrailer],
  observationsMap
);
assert(monitorScan.evaluatedCount === 1, 'Monitor.scanTrailerIntelligenceForContent evaluated 1 video');

console.log('\n========================================================================');
console.log('  TRAILER INTELLIGENCE MONITOR SUITE: ✅ ALL 24 INVARIANTS PASSED!     ');
console.log('========================================================================\n');
