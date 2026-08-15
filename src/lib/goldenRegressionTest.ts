/**
 * Automated Golden Regression Runner & 100% CKG Dataset Auditor
 * Compares live Knowledge Graph traversal outputs against immutable baseline snapshots
 * and performs deterministic traversal verification across ALL title nodes in the CKG.
 */

import { executeKnowledgeGraphTraversal, normalizeCkgId } from '@/lib/storyKnowledgeGraphEngine';
import { cineOrderKnowledgeGraph } from '@/data/cineOrderKnowledgeGraph';
import { GOLDEN_TRAVERSAL_SNAPSHOTS } from '@/data/goldenTraversalSnapshots';
import { validateRecommendationGraph, validateRecommendationDTOs } from '@/lib/recommendationValidator';
import { RecommendationService } from '@/lib/recommendationService';

export interface RegressionDiff {
  targetId: string;
  category: string;
  type: 'ADDED' | 'REMOVED' | 'MISMATCH' | 'POLICY_FAILURE';
  expected: string;
  actual: string;
}

export interface GoldenRegressionReport {
  isPassed: boolean;
  auditedSnapshotCount: number;
  totalCkgTitlesAudited: number;
  passedTitleCount: number;
  diffs: RegressionDiff[];
}

/**
 * Runs automated regression testing for all golden recommendation snapshots and 100% of CKG titles.
 */
export function runGoldenRegressionTest(): GoldenRegressionReport {
  const diffs: RegressionDiff[] = [];
  const allNodes = Object.values(cineOrderKnowledgeGraph.titleNodes);
  let passedTitleCount = 0;

  // 1. Audit Explicit Baseline Golden Snapshots
  const snapshots = Object.values(GOLDEN_TRAVERSAL_SNAPSHOTS);
  for (const snapshot of snapshots) {
    const live = executeKnowledgeGraphTraversal(normalizeCkgId(snapshot.targetId), []);
    if (!live) {
      diffs.push({
        targetId: snapshot.targetId,
        category: 'TARGET_LOOKUP',
        type: 'REMOVED',
        expected: snapshot.targetTitle,
        actual: 'NOT_FOUND_IN_LIVE_GRAPH',
      });
      continue;
    }

    if (live.isEntryPoint !== snapshot.expectedIsEntryPoint) {
      diffs.push({
        targetId: snapshot.targetId,
        category: 'IS_ENTRY_POINT',
        type: 'MISMATCH',
        expected: String(snapshot.expectedIsEntryPoint),
        actual: String(live.isEntryPoint),
      });
    }

    const checkCategoryDiffs = (
      categoryName: string,
      expectedIds: string[],
      actualIds: string[]
    ) => {
      const expSet = new Set(expectedIds.map((id) => id.toLowerCase()));
      const actSet = new Set(actualIds.map((id) => id.toLowerCase()));

      for (const id of expectedIds) {
        if (!actSet.has(id.toLowerCase())) {
          diffs.push({
            targetId: snapshot.targetId,
            category: categoryName,
            type: 'REMOVED',
            expected: id,
            actual: 'MISSING_FROM_LIVE',
          });
        }
      }

      for (const id of actualIds) {
        if (!expSet.has(id.toLowerCase())) {
          diffs.push({
            targetId: snapshot.targetId,
            category: categoryName,
            type: 'ADDED',
            expected: 'NOT_IN_GOLDEN',
            actual: id,
          });
        }
      }
    };

    checkCategoryDiffs(
      'MUST_WATCH',
      snapshot.expectedMustWatch,
      live.mustWatch.map((r) => r.content.id)
    );
    checkCategoryDiffs(
      'RECOMMENDED',
      snapshot.expectedRecommended,
      live.recommended.map((r) => r.content.id)
    );
  }

  // 2. Audit 100% of Title Nodes in CKG Dataset
  for (const node of allNodes) {
    const targetId = normalizeCkgId(node.id);
    const run1 = executeKnowledgeGraphTraversal(targetId, []);
    if (!run1) {
      diffs.push({
        targetId,
        category: 'TRAVERSAL_EXECUTION',
        type: 'POLICY_FAILURE',
        expected: 'Valid Traversal Result',
        actual: 'NULL_OR_UNDEFINED',
      });
      continue;
    }

    // Policy Gate Check
    const graphReport = validateRecommendationGraph(run1);
    if (!graphReport.isValid) {
      diffs.push({
        targetId,
        category: 'RECOMMENDATION_VALIDATOR',
        type: 'POLICY_FAILURE',
        expected: 'Valid Policy Invariants',
        actual: `${graphReport.issues.length} Invariant Violations`,
      });
    }

    // DTO Version Matrix Check
    const dtos = RecommendationService.buildDTOs(run1);
    const dtoIssues = validateRecommendationDTOs(dtos);
    if (dtoIssues.length > 0) {
      diffs.push({
        targetId,
        category: 'DTO_VERSION_MATRIX',
        type: 'POLICY_FAILURE',
        expected: 'Complete Version Matrix',
        actual: `${dtoIssues.length} DTO Version Matrix Errors`,
      });
    }

    // Determinism Check
    const run2 = executeKnowledgeGraphTraversal(targetId, []);
    const run1Ids = [...run1.mustWatch, ...run1.recommended].map((r) => r.content.id).join(',');
    const run2Ids = [...run2!.mustWatch, ...run2!.recommended].map((r) => r.content.id).join(',');
    if (run1Ids !== run2Ids) {
      diffs.push({
        targetId,
        category: 'DETERMINISM_CHECK',
        type: 'MISMATCH',
        expected: run1Ids,
        actual: run2Ids,
      });
    }

    if (graphReport.isValid && dtoIssues.length === 0) {
      passedTitleCount++;
    }
  }

  return {
    isPassed: diffs.length === 0,
    auditedSnapshotCount: snapshots.length,
    totalCkgTitlesAudited: allNodes.length,
    passedTitleCount,
    diffs,
  };
}
