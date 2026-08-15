import {
  GOLDEN_TRAVERSAL_SNAPSHOTS,
  type GoldenBenchmarkSnapshot,
} from '@/data/goldenTraversalSnapshots';
export type { GoldenBenchmarkSnapshot };
import { executeKnowledgeGraphTraversal, normalizeCkgId } from './storyKnowledgeGraphEngine';

export interface GoldenTraversalValidationResult {
  passed: boolean;
  totalSnapshotsTested: number;
  passedSnapshotsCount: number;
  errors: string[];
}

/**
 * Normalizes content ID sets for robust set comparison.
 */
function normalizeIdSet(ids: string[]): Set<string> {
  return new Set(ids.map((id) => normalizeCkgId(id)));
}

/**
 * Validates current graph traversal outputs against all verified golden snapshots.
 */
export function validateGoldenTraversalSnapshots(): GoldenTraversalValidationResult {
  const errors: string[] = [];
  let passedSnapshotsCount = 0;
  const snapshotList = Object.values(GOLDEN_TRAVERSAL_SNAPSHOTS);

  for (const snapshot of snapshotList) {
    const result = executeKnowledgeGraphTraversal(snapshot.targetId, []);

    if (!result) {
      errors.push(`❌ Traversal Regression for [${snapshot.targetTitle}] (${snapshot.targetId}): Traversal result returned null/undefined.`);
      continue;
    }

    const snapshotErrors: string[] = [];

    // 1. Entry Point Status Match
    if (result.isEntryPoint !== snapshot.expectedIsEntryPoint) {
      snapshotErrors.push(
        `Entry Point Status Mismatch: expected isEntryPoint=${snapshot.expectedIsEntryPoint}, got ${result.isEntryPoint}`
      );
    }

    // 2. Category Set Comparisons
    const actualMustWatchIds = normalizeIdSet(result.mustWatch.map((r) => r.content.id));
    const expectedMustWatchIds = normalizeIdSet(snapshot.expectedMustWatch);

    const actualRecommendedIds = normalizeIdSet(result.recommended.map((r) => r.content.id));
    const expectedRecommendedIds = normalizeIdSet(snapshot.expectedRecommended);

    const actualOptionalIds = normalizeIdSet(result.optional.map((r) => r.content.id));
    const expectedOptionalIds = normalizeIdSet(snapshot.expectedOptional);

    // Must Watch Diff
    for (const expId of expectedMustWatchIds) {
      if (!actualMustWatchIds.has(expId)) {
        snapshotErrors.push(`Missing Must Watch title: '${expId}'`);
      }
    }
    for (const actId of actualMustWatchIds) {
      if (!expectedMustWatchIds.has(actId)) {
        snapshotErrors.push(`Unexpected Must Watch title: '${actId}'`);
      }
    }

    // Recommended Diff
    for (const expId of expectedRecommendedIds) {
      if (!actualRecommendedIds.has(expId)) {
        snapshotErrors.push(`Missing Recommended title: '${expId}'`);
      }
    }
    for (const actId of actualRecommendedIds) {
      if (!expectedRecommendedIds.has(actId)) {
        snapshotErrors.push(`Unexpected Recommended title: '${actId}'`);
      }
    }

    // Extra Context (Optional) Diff
    for (const expId of expectedOptionalIds) {
      if (!actualOptionalIds.has(expId)) {
        snapshotErrors.push(`Missing Extra Context title: '${expId}'`);
      }
    }
    for (const actId of actualOptionalIds) {
      if (!expectedOptionalIds.has(actId)) {
        snapshotErrors.push(`Unexpected Extra Context title: '${actId}'`);
      }
    }

    if (snapshotErrors.length > 0) {
      errors.push(
        `❌ Traversal Regression in [${snapshot.targetTitle}] (${snapshot.targetId}):\n  - ` +
          snapshotErrors.join('\n  - ')
      );
    } else {
      passedSnapshotsCount++;
    }
  }

  return {
    passed: errors.length === 0,
    totalSnapshotsTested: Object.keys(GOLDEN_TRAVERSAL_SNAPSHOTS).length,
    passedSnapshotsCount,
    errors,
  };
}
