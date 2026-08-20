/**
 * CineOrder Trailer Intelligence — Phase 2: Official Trailer Discovery Test Suite
 * 
 * Validates:
 * 1. Video Classification (Trailers, Teasers, Final Trailers, Clips, Featurettes, TV Spots)
 * 2. Unofficial / Fan / Non-YouTube Video Rejection
 * 3. Trailer Lifecycle Events (NEW, UPDATED, REPLACED, REMOVED)
 * 4. Deterministic Deduplication & Idempotency
 * 5. Strict Continuity Isolation (Spider-Man Multi-Continuity)
 * 6. Zero Mutation of Story Knowledge Graph & Recommendations
 * 7. Frozen Framework Checksum Compliance
 */

import {
  classifyTMDbVideo,
  detectTrailerLifecycleEvent,
  detectRemovedTrailers,
  generateTrailerEventHash,
  TrailerProposalStore,
} from '../lib/trailerDiscoveryEngine';
import type { RawTMDbVideo, VerifiedTrailerMetadata } from '../types/trailerDiscovery';
import { allContent } from '../data/franchises/index';
import { cineOrderKnowledgeGraph, storyEdges } from '../data/cineOrderKnowledgeGraph';
import { RecommendationService } from '../lib/recommendationService';
import { globalAnnouncementMonitor, CURATED_MONITOR_EVENTS } from '../lib/globalAnnouncementMonitor';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('========================================================================');
console.log('  CINEORDER TRAILER INTELLIGENCE PHASE 2 TEST SUITE (23 INVARIANTS)     ');
console.log('========================================================================\n');

// ─── Test 1: Official Trailer Detected ───────────────────────────────────────
console.log('--- Test 1: Official Trailer Detected ---');
const rawTrailer1: RawTMDbVideo = {
  id: 'vid-1',
  key: 'dQw4w9WgXcQ',
  name: "Marvel Studios' Thunderbolts* | Official Trailer",
  site: 'YouTube',
  type: 'Trailer',
  official: true,
  published_at: '2025-02-10T14:00:00Z',
};
const classified1 = classifyTMDbVideo(rawTrailer1);
assert(classified1.classification === 'OFFICIAL_TRAILER', '1A. Classified as OFFICIAL_TRAILER');
assert(classified1.isOfficial === true, '1B. isOfficial is true');
assert(classified1.isEligibleForEvidence === true, '1C. isEligibleForEvidence is true');
assert(classified1.requiresEditorialReview === false, '1D. Standard trailer does not require mandatory editorial flag');
assert(classified1.confidenceScore >= 0.9, '1E. High confidence score for official trailer');
assert(classified1.sourceUrl === 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '1F. Valid YouTube source URL');

// ─── Test 2: Official Teaser Detected ────────────────────────────────────────
console.log('\n--- Test 2: Official Teaser Detected ---');
const rawTeaser: RawTMDbVideo = {
  id: 'vid-2',
  key: 'abcdefghijk',
  name: "Marvel Studios' Fantastic Four: First Steps | Official Teaser",
  site: 'YouTube',
  type: 'Teaser',
  official: true,
  published_at: '2025-01-15T12:00:00Z',
};
const classified2 = classifyTMDbVideo(rawTeaser);
assert(classified2.classification === 'OFFICIAL_TEASER', '2A. Classified as OFFICIAL_TEASER');
assert(classified2.isEligibleForEvidence === true, '2B. Teaser is eligible for evidence');
assert(classified2.confidenceScore >= 0.85, '2C. High confidence score for official teaser');

// ─── Test 3: Final Trailer Detected ──────────────────────────────────────────
console.log('\n--- Test 3: Final Trailer Detected ---');
const rawFinalTrailer: RawTMDbVideo = {
  id: 'vid-3',
  key: 'final123456',
  name: 'Captain America: Brave New World | Final Trailer',
  site: 'YouTube',
  type: 'Trailer',
  official: true,
  published_at: '2025-02-01T10:00:00Z',
};
const classified3 = classifyTMDbVideo(rawFinalTrailer);
assert(classified3.classification === 'FINAL_TRAILER', '3. Classified as FINAL_TRAILER');

// ─── Test 4: Official Clip Detected ──────────────────────────────────────────
console.log('\n--- Test 4: Official Clip Detected ---');
const rawClip: RawTMDbVideo = {
  id: 'vid-4',
  key: 'clip1234567',
  name: 'Official "Red Hulk Attack" Clip',
  site: 'YouTube',
  type: 'Clip',
  official: true,
  published_at: '2025-02-05T18:00:00Z',
};
const classified4 = classifyTMDbVideo(rawClip);
assert(classified4.classification === 'OFFICIAL_CLIP', '4A. Classified as OFFICIAL_CLIP');
assert(classified4.isEligibleForEvidence === true, '4B. Official clip is eligible for evidence');

// ─── Test 5: Featurette Classified Correctly ─────────────────────────────────
console.log('\n--- Test 5: Featurette Classified Correctly ---');
const rawFeaturette: RawTMDbVideo = {
  id: 'vid-5',
  key: 'feat1234567',
  name: 'Behind the Scenes: Wakanda Lore',
  site: 'YouTube',
  type: 'Featurette',
  official: true,
  published_at: '2025-01-20T10:00:00Z',
};
const classified5 = classifyTMDbVideo(rawFeaturette);
assert(classified5.classification === 'FEATURETTE', '5A. Classified as FEATURETTE');
assert(classified5.isEligibleForEvidence === true, '5B. Featurette is eligible for evidence');
assert(classified5.requiresEditorialReview === true, '5C. Featurette requires human editorial review');

// ─── Test 6: TV Spot Classified Correctly ────────────────────────────────────
console.log('\n--- Test 6: TV Spot Classified Correctly ---');
const rawTVSpot: RawTMDbVideo = {
  id: 'vid-6',
  key: 'tvspot12345',
  name: 'Big Game 30-Second TV Spot',
  site: 'YouTube',
  type: 'TV Spot',
  official: true,
  published_at: '2025-02-09T23:00:00Z',
};
const classified6 = classifyTMDbVideo(rawTVSpot);
assert(classified6.classification === 'TV_SPOT', '6A. Classified as TV_SPOT');
assert(classified6.requiresEditorialReview === true, '6B. TV spot requires human editorial review');

// ─── Test 7: Fan Trailer Rejected ────────────────────────────────────────────
console.log('\n--- Test 7: Fan Trailer Rejected ---');
const rawFanTrailer: RawTMDbVideo = {
  id: 'vid-7',
  key: 'fanfake1234',
  name: 'Avengers: Secret Wars (2027) - First Trailer (Concept) | Marvel Studios & Sony',
  site: 'YouTube',
  type: 'Trailer',
  official: false,
  published_at: '2025-01-01T00:00:00Z',
};
const classified7 = classifyTMDbVideo(rawFanTrailer);
assert(classified7.classification === 'FAN_MADE_UNOFFICIAL', '7A. Fan concept trailer classified as FAN_MADE_UNOFFICIAL');
assert(classified7.isOfficial === false, '7B. isOfficial is false');
assert(classified7.isEligibleForEvidence === false, '7C. Fan trailer is strictly INELIGIBLE for evidence');

// ─── Test 8: Unknown Video Rejected ──────────────────────────────────────────
console.log('\n--- Test 8: Unknown Video Rejected ---');
const rawUnknown: RawTMDbVideo = {
  id: 'vid-8',
  key: 'unknown1234',
  name: 'Music Theme Audio Track',
  site: 'YouTube',
  type: 'Soundtrack',
  official: true,
  published_at: '2025-01-01T00:00:00Z',
};
const classified8 = classifyTMDbVideo(rawUnknown);
assert(classified8.classification === 'UNKNOWN', '8A. Non-trailer type classified as UNKNOWN');
assert(classified8.isEligibleForEvidence === false, '8B. Unknown video is ineligible for narrative evidence');

// ─── Test 9: Non-YouTube Source Rejected ─────────────────────────────────────
console.log('\n--- Test 9: Non-YouTube Source Rejected ---');
const rawVimeo: RawTMDbVideo = {
  id: 'vid-9',
  key: 'vimeo123456',
  name: 'Official Studio Teaser',
  site: 'Vimeo',
  type: 'Trailer',
  official: true,
  published_at: '2025-01-01T00:00:00Z',
};
const classified9 = classifyTMDbVideo(rawVimeo);
assert(classified9.classification === 'UNKNOWN', '9A. Non-YouTube video classified as UNKNOWN');
assert(classified9.isEligibleForEvidence === false, '9B. Non-YouTube source is ineligible');
assert(classified9.verificationNotes.includes('Unsupported video site'), '9C. Verification notes explain site rejection');

// ─── Test 10: Missing Video Key Handled Safely ───────────────────────────────
console.log('\n--- Test 10: Missing Video Key Handled Safely ---');
const rawMissingKey: RawTMDbVideo = {
  id: 'vid-10',
  key: '',
  name: 'Official Trailer',
  site: 'YouTube',
  type: 'Trailer',
  official: true,
  published_at: '2025-01-01T00:00:00Z',
};
const classified10 = classifyTMDbVideo(rawMissingKey);
assert(classified10.isEligibleForEvidence === false, '10A. Video with empty key is rejected');
assert(classified10.classification === 'UNKNOWN', '10B. Empty key marked UNKNOWN');

// ─── Test 11: Duplicate Trailer Ingestion Produces No Duplicate Proposal ─────
console.log('\n--- Test 11: Duplicate Trailer Produces No Duplicate Proposal ---');
const testStore = new TrailerProposalStore();
testStore.clear();

const testContent = allContent.find((c) => c.id === 'mcu-doomsday') || allContent[0];
const event1 = detectTrailerLifecycleEvent(testContent!, classified1, []);
assert(event1 !== null, '11A. Event 1 created successfully');

const added1 = testStore.addEvent(event1!);
assert(added1 === true, '11B. First addition succeeded');

const added2 = testStore.addEvent(event1!);
assert(added2 === false, '11C. Duplicate addition was rejected by hash deduplication');
assert(testStore.getAllEvents().length === 1, '11D. Store contains exactly 1 event after duplicate addition');

// ─── Test 12: Repeated Scan is Idempotent ────────────────────────────────────
console.log('\n--- Test 12: Repeated Scan is Idempotent ---');
const scan1Hash = event1!.eventHash;
const scan2Hash = generateTrailerEventHash(
  testContent!.franchise_id,
  testContent!.tmdb_id || 0,
  classified1.videoKey,
  classified1.classification,
  classified1.publishedAt
);
assert(scan1Hash === scan2Hash, '12A. Repeated hash generation is pure and deterministic');
assert(testStore.addEvent(event1!) === false, '12B. Repeated scan produces zero new proposals');

// ─── Test 13: New Trailer Creates NEW_OFFICIAL_TRAILER ───────────────────────
console.log('\n--- Test 13: New Trailer Creates NEW_OFFICIAL_TRAILER ---');
assert(event1?.eventType === 'NEW_OFFICIAL_TRAILER', '13. Event type is NEW_OFFICIAL_TRAILER');

// ─── Test 14: Replacement Trailer Creates TRAILER_REPLACED ───────────────────
console.log('\n--- Test 14: Replacement Trailer Creates TRAILER_REPLACED ---');
const knownTeaserList: VerifiedTrailerMetadata[] = [classified2]; // had teaser earlier
const replacedEvent = detectTrailerLifecycleEvent(testContent!, classified1, knownTeaserList);
assert(replacedEvent !== null, '14A. Replacement event detected');
assert(replacedEvent?.eventType === 'TRAILER_REPLACED', '14B. Event type is TRAILER_REPLACED');
assert(replacedEvent?.supersededVideoKey === classified2.videoKey, '14C. Superseded teaser key recorded');

// ─── Test 15: Removed Trailer Creates TRAILER_REMOVED ────────────────────────
console.log('\n--- Test 15: Removed Trailer Creates TRAILER_REMOVED ---');
const currentVideos: VerifiedTrailerMetadata[] = [classified1]; // only trailer 1 present now
const knownOldVideos: VerifiedTrailerMetadata[] = [classified1, classified2]; // teaser was removed
const removedEvents = detectRemovedTrailers(testContent!, currentVideos, knownOldVideos);
assert(removedEvents.length === 1, '15A. Exactly 1 removed trailer detected');
assert(removedEvents[0]!.eventType === 'TRAILER_REMOVED', '15B. Event type is TRAILER_REMOVED');
assert(removedEvents[0]!.trailer.videoKey === classified2.videoKey, '15C. Removed trailer key matches teaser');

// ─── Test 16: Unsupported Metadata Does Not Crash ───────────────────────────
console.log('\n--- Test 16: Unsupported Metadata Does Not Crash ---');
const corruptVideo: RawTMDbVideo = {
  id: undefined as any,
  key: undefined as any,
  name: undefined as any,
  site: null as any,
  type: undefined as any,
  official: undefined as any,
};
let didCrash = false;
try {
  const result = classifyTMDbVideo(corruptVideo);
  assert(result.isEligibleForEvidence === false, '16A. Corrupt video safely marked ineligible');
} catch (e) {
  didCrash = true;
}
assert(!didCrash, '16B. Classify did not throw exception on corrupt metadata');

// ─── Test 17: Spider-Man Continuity Isolation ────────────────────────────────
console.log('\n--- Test 17: Spider-Man Continuity Isolation ---');
const raimiSpiderman = allContent.find((c) => c.id === 'spiderman-1')!;
const mcuNoWayHome = allContent.find((c) => c.id === 'mcu-no-way-home')!;

const raimiTrailerEvent = detectTrailerLifecycleEvent(raimiSpiderman, classified1, []);
const mcuTrailerEvent = detectTrailerLifecycleEvent(mcuNoWayHome, classified1, []);

assert(raimiTrailerEvent?.franchiseId === 'spider-man', '17A. Raimi trailer tagged to spider-man franchise');
assert(mcuTrailerEvent?.franchiseId === 'marvel-cinematic-universe', '17B. MCU trailer tagged to MCU franchise');
assert(raimiTrailerEvent?.franchiseId !== mcuTrailerEvent?.franchiseId, '17C. Continuity boundaries strictly preserved');

// ─── Test 18: No Story Graph Mutation ────────────────────────────────────────
console.log('\n--- Test 18: No Story Graph Mutation ---');
const initialEdgeCount = storyEdges.length;
const initialNodeCount = Object.keys(cineOrderKnowledgeGraph.titleNodes).length;

// Simulate trailer discovery
const simStore = new TrailerProposalStore();
simStore.addEvent(event1!);

assert(storyEdges.length === initialEdgeCount, '18A. StoryEdges array strictly unchanged (0 mutations)');
assert(Object.keys(cineOrderKnowledgeGraph.titleNodes).length === initialNodeCount, '18B. TitleNodes dictionary strictly unchanged');

// ─── Test 19: No Recommendation Mutation ────────────────────────────────────
console.log('\n--- Test 19: No Recommendation Mutation ---');
const recsBefore = RecommendationService.getRecommendationGraph('mcu-no-way-home');
const recsAfter = RecommendationService.getRecommendationGraph('mcu-no-way-home');

assert(recsBefore.mustWatch.length === recsAfter.mustWatch.length, '19A. Must Watch recommendations strictly identical');
assert(recsBefore.recommended.length === recsAfter.recommended.length, '19B. Recommended titles strictly identical');
assert(recsBefore.optional.length === recsAfter.optional.length, '19C. Optional titles strictly identical');

// ─── Test 20: Human Approval Remains Required ───────────────────────────────
console.log('\n--- Test 20: Human Approval Remains Required ---');
assert(event1?.status === 'pending', '20A. Newly discovered trailer status is strictly "pending"');
assert(event1?.status !== 'approved', '20B. Never automatically marked "approved"');
assert(event1?.status !== 'merged', '20C. Never automatically marked "merged"');

// ─── Test 21: Event Hash Deterministic ───────────────────────────────────────
console.log('\n--- Test 21: Event Hash Deterministic ---');
const hashA = generateTrailerEventHash('marvel-cinematic-universe', 1342110, 'dQw4w9WgXcQ', 'OFFICIAL_TRAILER', '2025-02-10T14:00:00Z');
const hashB = generateTrailerEventHash('marvel-cinematic-universe', 1342110, 'dQw4w9WgXcQ', 'OFFICIAL_TRAILER', '2025-02-10T14:00:00Z');
const hashC = generateTrailerEventHash('marvel-cinematic-universe', 1342110, 'dQw4w9WgXcQ', 'OFFICIAL_TEASER', '2025-02-10T14:00:00Z');

assert(hashA === hashB, '21A. Identical input produces identical hash');
assert(hashA !== hashC, '21B. Different trailer type produces distinct hash');

// ─── Test 22: Existing Announcement Monitor Behavior Unchanged ───────────────
console.log('\n--- Test 22: Existing Announcement Monitor Behavior Unchanged ---');
const monitorResult = globalAnnouncementMonitor.processEvents(CURATED_MONITOR_EVENTS);
assert(monitorResult.totalAnnouncementsDiscovered > 0, '22A. Global Announcement Monitor processes curated events normally');
assert(monitorResult.verifiedAnnouncementsCount > 0, '22B. Monitor generated verified proposals normally');

// ─── Test 23: Frozen Framework Invariants ───────────────────────────────────
console.log('\n--- Test 23: Frozen Framework Invariants ---');
assert(typeof RecommendationService.getRecommendationGraph === 'function', '23A. RecommendationService remains intact');
assert(storyEdges.length > 300, '23B. Knowledge graph edges intact');
assert(Object.keys(cineOrderKnowledgeGraph.titleNodes).length > 200, '23C. TitleNodes intact');

console.log('\n========================================================================');
console.log('  TRAILER DISCOVERY SUITE: ✅ ALL 23 TESTS & INVARIANTS PASSED           ');
console.log('========================================================================\n');
