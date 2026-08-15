import { cineOrderKnowledgeGraph } from '@/data/cineOrderKnowledgeGraph';
import {
  GOLDEN_TRAVERSAL_SNAPSHOTS,
  type GoldenBenchmarkSnapshot,
} from '@/data/goldenTraversalSnapshots';
export type { GoldenBenchmarkSnapshot };
import { executeKnowledgeGraphTraversal, normalizeCkgId } from './storyKnowledgeGraphEngine';

export interface GraphRegressionReport {
  passed: boolean;
  errorCount: number;
  warningCount: number;
  errors: string[];
  warnings: string[];
  rulesEvaluated: number;
}

/**
 * Graph Regression Validator
 * For every golden snapshot:
 * 1. Verify every Must Watch title has at least one valid narrative path to the target.
 * 2. Verify every Recommended title is not classified as Must Watch.
 * 3. Verify every Extra Context title cannot be promoted unless a new explicit graph edge justifies it.
 * 4. Detect duplicate recommendations appearing in multiple categories.
 * 5. Ensure traversal ordering is deterministic (same graph → same output every run).
 */
export function validateGraphRegression(): GraphRegressionReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  let rulesEvaluated = 0;

  const { edges } = cineOrderKnowledgeGraph;

  // Build forward adjacency map (sourceId -> array of targetIds) using normalized CKG IDs
  const forwardAdjacency = new Map<string, string[]>();
  for (const edge of edges) {
    const src = normalizeCkgId(edge.sourceId);
    const tgt = normalizeCkgId(edge.targetId);
    if (!forwardAdjacency.has(src)) {
      forwardAdjacency.set(src, []);
    }
    forwardAdjacency.get(src)!.push(tgt);
  }

  // Helper BFS to check if directed narrative path exists from startId to endId
  function pathExists(startId: string, endId: string): boolean {
    const start = normalizeCkgId(startId);
    const end = normalizeCkgId(endId);
    if (start === end) return true;

    const queue: string[] = [start];
    const visited = new Set<string>([start]);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const neighbors = forwardAdjacency.get(curr) || [];
      for (const n of neighbors) {
        if (n === end) return true;
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
        }
      }
    }
    return false;
  }

  for (const snapshot of Object.values(GOLDEN_TRAVERSAL_SNAPSHOTS)) {
    const normTarget = normalizeCkgId(snapshot.targetId);

    // Rule 5: Ensure traversal ordering is deterministic (same graph → same output every run)
    rulesEvaluated++;
    const run1 = executeKnowledgeGraphTraversal(snapshot.targetId, []);
    const run2 = executeKnowledgeGraphTraversal(snapshot.targetId, []);

    if (!run1 || !run2) {
      errors.push(
        `❌ Graph Regression Error: Traversal returned null/undefined for '${snapshot.targetTitle}' (${snapshot.targetId}).`
      );
      continue;
    }

    const run1Must = run1.mustWatch.map((r) => normalizeCkgId(r.content.id)).join(',');
    const run2Must = run2.mustWatch.map((r) => normalizeCkgId(r.content.id)).join(',');
    const run1Rec = run1.recommended.map((r) => normalizeCkgId(r.content.id)).join(',');
    const run2Rec = run2.recommended.map((r) => normalizeCkgId(r.content.id)).join(',');
    const run1Opt = run1.optional.map((r) => normalizeCkgId(r.content.id)).join(',');
    const run2Opt = run2.optional.map((r) => normalizeCkgId(r.content.id)).join(',');
    const run1Skip = run1.safeToSkip.map((r) => normalizeCkgId(r.content.id)).join(',');
    const run2Skip = run2.safeToSkip.map((r) => normalizeCkgId(r.content.id)).join(',');

    if (
      run1Must !== run2Must ||
      run1Rec !== run2Rec ||
      run1Opt !== run2Opt ||
      run1Skip !== run2Skip
    ) {
      errors.push(
        `❌ Nondeterministic Traversal Failure: Consecutive runs for '${snapshot.targetTitle}' (${snapshot.targetId}) produced different outputs or ordering.`
      );
    }

    // Rule 1: Verify every Must Watch title has at least one valid narrative path to the target
    rulesEvaluated++;
    const mustWatchToTest = new Set([
      ...snapshot.expectedMustWatch.map(normalizeCkgId),
      ...run1.mustWatch.map((r) => normalizeCkgId(r.content.id)),
    ]);

    for (const mwId of mustWatchToTest) {
      if (!pathExists(mwId, normTarget)) {
        errors.push(
          `❌ Broken Narrative Path: Must Watch title '${mwId}' has no directed narrative path to target '${snapshot.targetId}' for snapshot '${snapshot.targetTitle}'.`
        );
      }
    }

    // Rule 2: Verify every Recommended title is not classified as Must Watch
    rulesEvaluated++;
    const actualMustSet = new Set(run1.mustWatch.map((r) => normalizeCkgId(r.content.id)));

    for (const recId of snapshot.expectedRecommended.map(normalizeCkgId)) {
      if (actualMustSet.has(recId)) {
        errors.push(
          `❌ Category Ceiling Breach: Recommended title '${recId}' was illegally classified as Must Watch for snapshot '${snapshot.targetTitle}'.`
        );
      }
    }

    for (const rec of run1.recommended) {
      const normRecId = normalizeCkgId(rec.content.id);
      if (actualMustSet.has(normRecId)) {
        errors.push(
          `❌ Category Ceiling Breach: Title '${normRecId}' is classified as both Recommended and Must Watch for snapshot '${snapshot.targetTitle}'.`
        );
      }
    }

    // Rule 3: Verify every Extra Context title cannot be promoted unless a new explicit graph edge justifies it
    rulesEvaluated++;
    const actualRecSet = new Set(run1.recommended.map((r) => normalizeCkgId(r.content.id)));

    for (const optId of snapshot.expectedOptional.map(normalizeCkgId)) {
      if (actualMustSet.has(optId) || actualRecSet.has(optId)) {
        const promotedCategory = actualMustSet.has(optId) ? 'Must Watch' : 'Recommended';
        // Search for an explicit directed edge from optId to targetId with required or strong strength
        const explicitEdge = edges.find((e) => {
          const s = normalizeCkgId(e.sourceId);
          const t = normalizeCkgId(e.targetId);
          return (
            s === optId &&
            t === normTarget &&
            (e.strength === 'required' || e.strength === 'strong')
          );
        });

        if (!explicitEdge) {
          errors.push(
            `❌ Extra Context Promotion Breach: Extra Context title '${optId}' was illegally promoted to ${promotedCategory} for snapshot '${snapshot.targetTitle}' without a justifying explicit graph edge.`
          );
        }
      }
    }

    // Rule 4: Detect duplicate recommendations appearing in multiple categories
    rulesEvaluated++;
    const seenCategoryMap = new Map<string, string>();
    const categories = [
      { name: 'Must Watch', list: run1.mustWatch },
      { name: 'Recommended', list: run1.recommended },
      { name: 'Extra Context', list: run1.optional },
      { name: 'Safe To Skip', list: run1.safeToSkip },
    ];

    for (const cat of categories) {
      for (const item of cat.list) {
        const normId = normalizeCkgId(item.content.id);
        if (seenCategoryMap.has(normId)) {
          const prevCat = seenCategoryMap.get(normId)!;
          errors.push(
            `❌ Duplicate Recommendation: Title '${item.content.title}' (${normId}) appears in multiple categories ('${prevCat}' and '${cat.name}') for snapshot '${snapshot.targetTitle}'.`
          );
        } else {
          seenCategoryMap.set(normId, cat.name);
        }
      }
    }
  }

  return {
    passed: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
    rulesEvaluated,
  };
}

