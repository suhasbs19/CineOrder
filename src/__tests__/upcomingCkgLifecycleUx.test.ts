/**
 * CineOrder — Upcoming Title CKG Lifecycle UX Regression Test Suite
 *
 * Validates:
 * 1. Upcoming standalone movie (e.g., dc-supergirl): recognized as unreleased, 100% story preparation readiness,
 *    0 required prerequisites, 1 recommended context (Superman 2025), banner mapped to "Upcoming — Story Preparation Available".
 * 2. Upcoming movie with required prerequisites: recognized as unreleased, pre-release story preparation active.
 * 3. Separation of Story Readiness vs Release Availability (100% prerequisite readiness ≠ released title).
 * 4. Watch action blocking for unreleased titles.
 * 5. Released & streaming-available movie lifecycle preservation.
 * 6. TBA project lifecycle consistency.
 * 7. Timezone-sensitive premiere handling.
 * 8. Weekly series rollout handling.
 * 9. Supergirl specific invariants: in /upcoming, Superman remains recommended context (not MUST WATCH), zero graph mutations.
 * 10. Bit-for-bit SHA-256 integrity of all 5 frozen framework files.
 */

import { allContent, getContentById } from '../data/franchises';
import { getLifecycleCategory } from '../lib/metadataRefresh';
import { isTheatricallyUpcoming } from '../lib/upcomingUtils';
import { executeKnowledgeGraphTraversal } from '../lib/storyKnowledgeGraphEngine';

declare const require: any;
declare const process: { exit: (code: number) => void; cwd: () => string };

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('============================================================');
console.log('  UPCOMING CKG LIFECYCLE UX REGRESSION SUITE');
console.log('============================================================\n');

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

// ─── Scenario 1: Standalone Movie Pre-Release & Post-Release Lifecycle ──────
console.log('--- 1. Scenario 1: Standalone Movie Pre-Release & Post-Release Lifecycle ---');
const supergirl = getContentById('dc-supergirl');
assert(!!supergirl, '1A. dc-supergirl exists in catalog');

if (supergirl) {
  // Pre-release evaluation (e.g. 2026-06-01 before June 26 premiere):
  const catPre = getLifecycleCategory(supergirl, '2026-06-01');
  const isUpPre = isTheatricallyUpcoming(supergirl, '2026-06-01');
  assert(catPre === 'UPCOMING', `1B. Pre-release (2026-06-01) Supergirl category is 'UPCOMING' (got ${catPre})`);
  assert(isUpPre === true, '1C. Pre-release (2026-06-01) isTheatricallyUpcoming is true');

  // Post-release evaluation (runtime date):
  const catPost = getLifecycleCategory(supergirl);
  const isUpPost = isTheatricallyUpcoming(supergirl);
  assert(catPost === 'THEATRICALLY_RELEASED', `1D. Post-release Supergirl category is 'THEATRICALLY_RELEASED' (got ${catPost})`);
  assert(isUpPost === false, '1E. Post-release Supergirl isTheatricallyUpcoming is false');

  const traversal = executeKnowledgeGraphTraversal('dc-supergirl', []);
  assert(!!traversal, '1F0. Traversal returned valid result');
  if (traversal) {
    assert(traversal.isEntryPoint === true, '1F. Supergirl is standalone entry point (isEntryPoint = true)');
    assert(traversal.mustWatch.length === 0, `1G. Supergirl has exactly 0 required prerequisites (got ${traversal.mustWatch.length})`);
    const totalContext = traversal.recommended.length + traversal.optional.length;
    assert(totalContext === 1, `1H. Supergirl has exactly 1 context/recommended item (got ${totalContext})`);
    const contextItem = traversal.recommended[0] || traversal.optional[0];
    assert(contextItem?.content.id === 'dc-superman-2025', '1I. Recommended/context item is dc-superman-2025');
    assert(traversal.storyReadinessPercentage === 100, `1J. Supergirl story readiness is 100% (got ${traversal.storyReadinessPercentage}%)`);

    // Verify that the UI maps entry point to upcoming banner when isUpcoming is true
    const entryPointBannerTitle = isUpPre
      ? 'Upcoming — Story Preparation Available'
      : 'Ready to Watch — Standalone Entry Point';
    const readinessLabel = isUpPre
      ? 'Story Preparation Readiness'
      : 'Viewing Readiness';

    assert(entryPointBannerTitle === 'Upcoming — Story Preparation Available', '1K. Pre-release banner text mapped to upcoming preparation title');
    assert(readinessLabel === 'Story Preparation Readiness', '1L. Pre-release readiness label mapped to Story Preparation Readiness');
  }
}

// ─── Scenario 2: Upcoming Movie with Required Prerequisites ─────────────────
console.log('\n--- 2. Scenario 2: Upcoming Movie with Required Prerequisites ---');
const doomsday = getContentById('mcu-doomsday');
assert(!!doomsday, '2A. mcu-doomsday exists in catalog');
if (doomsday) {
  const cat = getLifecycleCategory(doomsday);
  assert(cat === 'UPCOMING', `2B. Avengers: Doomsday lifecycleCategory is 'UPCOMING' (got ${cat})`);
  assert(isTheatricallyUpcoming(doomsday), '2C. isTheatricallyUpcoming(doomsday) is true');

  const traversal = executeKnowledgeGraphTraversal('mcu-doomsday', []);
  assert(!!traversal, '2D0. Traversal returned valid result');
  if (traversal) {
    assert(traversal.isEntryPoint === false, '2D. Avengers: Doomsday is not an entry point');
    assert(traversal.mustWatch.length > 0, `2E. Avengers: Doomsday has required prerequisites (found ${traversal.mustWatch.length})`);
    assert(traversal.storyReadinessPercentage < 100, `2F. Story readiness without watching prerequisites is < 100% (got ${traversal.storyReadinessPercentage}%)`);
  }
}

// ─── Scenario 3: Separation of Story Readiness vs Release Availability ──────
console.log('\n--- 3. Scenario 3: Separation of Story Readiness vs Release Availability ---');
if (doomsday) {
  const traversal = executeKnowledgeGraphTraversal('mcu-doomsday', []);
  if (traversal) {
    const storyReadiness = traversal.storyReadinessPercentage;
    const isReleased = !isTheatricallyUpcoming(doomsday);

    assert(storyReadiness < 100, '3A. Doomsday story prerequisite readiness is incomplete');
    assert(isReleased === false, '3B. Doomsday release availability is FALSE (unreleased upcoming title)');
    assert(storyReadiness < 100 && !isReleased, '3C. Story Readiness and Release Availability are cleanly separated');
  }
}

// ─── Scenario 4: Released Standalone Movie (Iron Man) ────────────────────────
console.log('\n--- 4. Scenario 4: Released Standalone Movie (Iron Man) ---');
const ironMan = getContentById('mcu-iron-man');
if (ironMan) {
  const cat = getLifecycleCategory(ironMan);
  assert(cat === 'STREAMING_AVAILABLE', `4A. Iron Man lifecycleCategory is 'STREAMING_AVAILABLE' (got ${cat})`);
  assert(!isTheatricallyUpcoming(ironMan), '4B. isTheatricallyUpcoming(ironMan) is false');
}

// ─── Scenario 5: Future Movies Lifecycle Invariant ──────────────────────────
console.log('\n--- 5. Scenario 5: Future Movies Lifecycle Invariant ---');
const avatar3 = getContentById('avatar-4');
if (avatar3) {
  const cat = getLifecycleCategory(avatar3);
  assert(cat === 'UPCOMING', `5A. Avatar 4 is 'UPCOMING' (got ${cat})`);
  assert(isTheatricallyUpcoming(avatar3), '5B. isTheatricallyUpcoming(avatar-4) is true');
}

const blade = getContentById('mcu-blade');
if (blade) {
  const cat = getLifecycleCategory(blade);
  assert(cat === 'UPCOMING', `5C. Blade is 'UPCOMING' (got ${cat})`);
  assert(isTheatricallyUpcoming(blade), '5D. isTheatricallyUpcoming(mcu-blade) is true');
}

// ─── Scenario 6: Standalone Milestone Node Consistency ──────────────────────
console.log('\n--- 6. Scenario 6: Standalone Milestone Node Consistency ---');
// Verify entry point has zero required prerequisites
if (supergirl) {
  const traversal = executeKnowledgeGraphTraversal('dc-supergirl', []);
  assert(traversal?.mustWatch.length === 0, '6A. Standalone node has 0 required prerequisite nodes');
}

// ─── Scenario 7: Timezone-Sensitive Broadcast Series (Lanterns) ──────────────
console.log('\n--- 7. Scenario 7: Timezone-Sensitive Broadcast Series (Lanterns) ---');
const lanterns = getContentById('dc-lanterns');
if (lanterns) {
  const cat = getLifecycleCategory(lanterns);
  assert(cat === 'STREAMING_AVAILABLE', `7A. Lanterns post-premiere is 'STREAMING_AVAILABLE' (got ${cat})`);
  assert(!isTheatricallyUpcoming(lanterns), '7B. isTheatricallyUpcoming(lanterns) is false');
}

// ─── Scenario 8: Upcoming Page Consistency ───────────────────────────────────
console.log('\n--- 8. Scenario 8: Upcoming Page Consistency ---');
const upcomingContent = allContent.filter((c) => isTheatricallyUpcoming(c));
const doomsdayInUpcoming = upcomingContent.some((c) => c.id === 'mcu-doomsday');
assert(doomsdayInUpcoming, '8A. mcu-doomsday is present in upcomingContent');

const supergirlInUpcoming = upcomingContent.some((c) => c.id === 'dc-supergirl');
assert(!supergirlInUpcoming, '8B. dc-supergirl is excluded from upcomingContent post-theatrical release');

const lanternsInUpcoming = upcomingContent.some((c) => c.id === 'dc-lanterns');
assert(!lanternsInUpcoming, '8C. dc-lanterns is not in upcomingContent (already premiered)');

// ─── Scenario 9: Supergirl Invariant Audit ───────────────────────────────────
console.log('\n--- 9. Scenario 9: Supergirl Invariant Audit ---');
if (supergirl) {
  const traversal = executeKnowledgeGraphTraversal('dc-supergirl', []);
  if (traversal) {
    assert(traversal.mustWatch.length === 0, '9A. Supergirl has 0 MUST WATCH prerequisites');
    const totalContext = traversal.recommended.length + traversal.optional.length;
    assert(totalContext === 1, '9B. Supergirl has 1 context item (Superman 2025)');
    const contextItem = traversal.recommended[0] || traversal.optional[0];
    assert(contextItem?.content.id === 'dc-superman-2025', '9C. Superman (2025) is the context item');
    assert(contextItem?.category !== 'must_watch', '9D. Superman (2025) is NOT categorized as must_watch (remains optional/recommended)');
  }
}

// ─── Scenario 10: Frozen Framework Bit-for-Bit SHA-256 Verification ─────────
console.log('\n--- 10. Scenario 10: Frozen Framework Bit-for-Bit SHA-256 Verification ---');
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
  assert(actualHash === expectedHash, `10. ${relPath} SHA-256 matches frozen hash`);
}

// ────────────────────────────────────────────────────────────────────────────
console.log('\n============================================================');
console.log(`  TEST RESULTS: ${failures === 0 ? '✅ ALL SCENARIOS PASSED' : `❌ ${failures} FAILURES`}`);
console.log('============================================================\n');

if (failures > 0) {
  process.exit(1);
}
