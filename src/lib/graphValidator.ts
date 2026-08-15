/**
 * CineOrder Knowledge Graph (CKG) Static Graph Validator
 * Performs static structural integrity checks on the CKG dataset:
 * - DAG Cycle Detection (Tarjan's DFS)
 * - Edge Schema Alignment & Enum Completeness
 * - Orphan Node Detection
 * - Strength Mapping Completeness
 */

import { cineOrderKnowledgeGraph, TitleNode, CKGEdgeStrength } from '@/data/cineOrderKnowledgeGraph';

export interface GraphValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  nodeId?: string;
  sourceId?: string;
  targetId?: string;
}

export interface CkgStaticAuditReport {
  isValid: boolean;
  issues: GraphValidationIssue[];
  totalNodeCount: number;
  totalEdgeCount: number;
  orphanNodeCount: number;
  hasCycles: boolean;
}

/**
 * Validates static structural integrity of the CineOrder Knowledge Graph.
 */
export function validateCkgDataset(
  graph = cineOrderKnowledgeGraph
): CkgStaticAuditReport {
  const issues: GraphValidationIssue[] = [];
  const nodes = Object.values(graph.titleNodes);
  const edges = graph.edges;
  const validStrengths: CKGEdgeStrength[] = ['required', 'strong', 'moderate', 'weak', 'post-credit'];

  const nodeMap = new Map<string, TitleNode>();
  nodes.forEach((n) => nodeMap.set(n.id.toLowerCase(), n));

  const incomingCounts = new Map<string, number>();
  const outgoingCounts = new Map<string, number>();
  nodes.forEach((n) => {
    incomingCounts.set(n.id.toLowerCase(), 0);
    outgoingCounts.set(n.id.toLowerCase(), 0);
  });

  // 1. Edge Schema & Reference Integrity Check
  for (const edge of edges) {
    const srcId = edge.sourceId.toLowerCase();
    const tgtId = edge.targetId.toLowerCase();

    if (!nodeMap.has(srcId)) {
      issues.push({
        severity: 'error',
        code: 'MISSING_SOURCE_NODE',
        message: `Edge references non-existent source node '${edge.sourceId}'.`,
        sourceId: edge.sourceId,
        targetId: edge.targetId,
      });
    }

    if (!nodeMap.has(tgtId)) {
      issues.push({
        severity: 'error',
        code: 'MISSING_TARGET_NODE',
        message: `Edge references non-existent target node '${edge.targetId}'.`,
        sourceId: edge.sourceId,
        targetId: edge.targetId,
      });
    }

    // Rule 8: Strength Enum & Schema Consistency Check
    if (!validStrengths.includes(edge.strength)) {
      issues.push({
        severity: 'error',
        code: 'INVALID_EDGE_STRENGTH',
        message: `Edge ${edge.sourceId} -> ${edge.targetId} has unknown strength '${edge.strength}'.`,
        sourceId: edge.sourceId,
        targetId: edge.targetId,
      });
    }

    if (edge.strength === 'post-credit') {
      if (edge.relationship !== 'post-credit') {
        issues.push({
          severity: 'warning',
          code: 'POST_CREDIT_RELATIONSHIP_MISMATCH',
          message: `Edge ${edge.sourceId} -> ${edge.targetId} has strength 'post-credit' but relationship is '${edge.relationship}'.`,
          sourceId: edge.sourceId,
          targetId: edge.targetId,
        });
      }
      if (edge.narrativeScope !== 'post-credit') {
        issues.push({
          severity: 'warning',
          code: 'POST_CREDIT_SCOPE_MISMATCH',
          message: `Edge ${edge.sourceId} -> ${edge.targetId} has strength 'post-credit' but narrativeScope is '${edge.narrativeScope}'.`,
          sourceId: edge.sourceId,
          targetId: edge.targetId,
        });
      }
    }

    outgoingCounts.set(srcId, (outgoingCounts.get(srcId) || 0) + 1);
    incomingCounts.set(tgtId, (incomingCounts.get(tgtId) || 0) + 1);
  }

  // 2. Orphan Node Detection Check
  let orphanNodeCount = 0;
  for (const node of nodes) {
    const id = node.id.toLowerCase();
    const inc = incomingCounts.get(id) || 0;
    const out = outgoingCounts.get(id) || 0;
    if (inc === 0 && out === 0) {
      orphanNodeCount++;
      issues.push({
        severity: 'warning',
        code: 'ORPHAN_NODE_DETECTED',
        message: `Title node '${node.id}' (${node.title}) has 0 incoming and 0 outgoing edges in CKG.`,
        nodeId: node.id,
      });
    }
  }

  // 3. DAG Cycle Detection (DFS Cycle Check)
  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n.id.toLowerCase(), []));
  edges.forEach((e) => {
    const list = adj.get(e.sourceId.toLowerCase());
    if (list) list.push(e.targetId.toLowerCase());
  });

  const visitedState = new Map<string, 0 | 1 | 2>(); // 0: unvisited, 1: visiting, 2: visited
  nodes.forEach((n) => visitedState.set(n.id.toLowerCase(), 0));
  let hasCycles = false;

  function dfs(u: string, path: string[]) {
    visitedState.set(u, 1);
    path.push(u);

    const neighbors = adj.get(u) || [];
    for (const v of neighbors) {
      const state = visitedState.get(v) || 0;
      if (state === 1) {
        hasCycles = true;
        issues.push({
          severity: 'error',
          code: 'DAG_CYCLE_DETECTED',
          message: `Cycle detected in Knowledge Graph: ${[...path, v].join(' -> ')}.`,
          nodeId: v,
        });
      } else if (state === 0) {
        dfs(v, path);
      }
    }

    path.pop();
    visitedState.set(u, 2);
  }

  for (const node of nodes) {
    const id = node.id.toLowerCase();
    if (visitedState.get(id) === 0) {
      dfs(id, []);
    }
  }

  const hasErrors = issues.some((i) => i.severity === 'error');

  return {
    isValid: !hasErrors,
    issues,
    totalNodeCount: nodes.length,
    totalEdgeCount: edges.length,
    orphanNodeCount,
    hasCycles,
  };
}
