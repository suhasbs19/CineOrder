import {
  cineOrderKnowledgeGraph,
  type TitleNode,
  type StoryEdge,
  type CKGEdgeStrength,
} from '@/data/cineOrderKnowledgeGraph';
export type { StoryEdge };
import { GOLDEN_TRAVERSAL_SNAPSHOTS } from '@/data/goldenTraversalSnapshots';
import { VERIFIED_STANDALONE_ENTRY_POINTS } from './storyKnowledgeGraphEngine';

export interface GraphIntegrityReport {
  passed: boolean;
  errorCount: number;
  warningCount: number;
  errors: string[];
  warnings: string[];
  rulesEvaluated: number;
}

const VALID_STRENGTHS: Set<CKGEdgeStrength> = new Set(['required', 'strong', 'moderate', 'weak']);
const VALID_RELATIONSHIPS: Set<string> = new Set([
  'direct-sequel',
  'story-continuation',
  'character-origin',
  'character-development',
  'mentor',
  'villain-origin',
  'shared-villain',
  'shared-character',
  'shared-event',
  'shared-object',
  'organization',
  'timeline',
  'multiverse',
  'world-building',
  'post-credit',
  'major-crossover',
  'thematic-callback',
  'same-universe-only',
]);

/**
 * Executes a full structural audit of the Knowledge Graph dataset prior to traversal.
 */
export function validateGraphIntegrity(): GraphIntegrityReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  let rulesEvaluated = 0;

  const { titleNodes, edges } = cineOrderKnowledgeGraph;

  // Helper to normalize IDs
  const normalizeId = (id: string) => id.trim().toLowerCase();

  const nodeMap = new Map<string, TitleNode>();
  const rawNodeIds: string[] = [];

  // Rule 2: Duplicate Node IDs
  rulesEvaluated++;
  for (const key of Object.keys(titleNodes)) {
    const normKey = normalizeId(key);
    if (nodeMap.has(normKey)) {
      errors.push(`❌ Duplicate Node ID: '${key}' appears multiple times in titleNodes.`);
    } else {
      nodeMap.set(normKey, titleNodes[key]!);
      rawNodeIds.push(key);
    }
  }

  const seenEdges = new Set<string>();
  const adjacencyList = new Map<string, string[]>();

  for (const nodeKey of nodeMap.keys()) {
    adjacencyList.set(nodeKey, []);
  }

  for (const edge of edges) {
    const srcId = normalizeId(edge.sourceId);
    const tgtId = normalizeId(edge.targetId);

    // Rule 1: Missing Node Detection
    rulesEvaluated++;
    if (!nodeMap.has(srcId)) {
      errors.push(
        `❌ Graph Integrity Error — Missing Node\n  Source Node: '${edge.sourceId}' (referenced by edge targeting '${edge.targetId}') does not exist in titleNodes.`
      );
    }
    if (!nodeMap.has(tgtId)) {
      errors.push(
        `❌ Graph Integrity Error — Missing Node\n  Target Node: '${edge.targetId}' (referenced by edge from '${edge.sourceId}') does not exist in titleNodes.`
      );
    }

    // Rule 3: Duplicate Edge Detection
    rulesEvaluated++;
    const edgeKey = `${srcId}->${tgtId}:${edge.relationship}`;
    if (seenEdges.has(edgeKey)) {
      errors.push(
        `❌ Duplicate Edge\n  Movie: '${edge.targetId}' has duplicate prerequisite edge from '${edge.sourceId}' (${edge.relationship}).`
      );
    } else {
      seenEdges.add(edgeKey);
    }

    // Rule 4: Self Dependency Detection
    rulesEvaluated++;
    if (srcId === tgtId) {
      errors.push(`❌ Self Dependency Error\n  Movie: '${edge.sourceId}' cannot depend on itself.`);
    }

    // Rule 6: Invalid Relationship Strength
    rulesEvaluated++;
    if (!VALID_STRENGTHS.has(edge.strength)) {
      errors.push(
        `❌ Invalid Relationship Strength\n  Edge '${edge.sourceId} -> ${edge.targetId}' has invalid strength '${edge.strength}'.`
      );
    }

    // Rule 7: Invalid Relationship Type
    rulesEvaluated++;
    if (!VALID_RELATIONSHIPS.has(edge.relationship)) {
      errors.push(
        `❌ Invalid Relationship Type\n  Edge '${edge.sourceId} -> ${edge.targetId}' has invalid relationship type '${edge.relationship}'.`
      );
    }

    // Build directed graph for cycle detection
    if (nodeMap.has(srcId) && nodeMap.has(tgtId) && srcId !== tgtId) {
      const neighbors = adjacencyList.get(srcId) || [];
      neighbors.push(tgtId);
      adjacencyList.set(srcId, neighbors);
    }
  }

  // Rule 5: Circular Dependency Detection (DFS Cycle Detection)
  rulesEvaluated++;
  const visitedState = new Map<string, 'unvisited' | 'visiting' | 'visited'>();
  const path: string[] = [];

  function detectCycleDFS(curr: string): boolean {
    visitedState.set(curr, 'visiting');
    path.push(curr);

    const neighbors = adjacencyList.get(curr) || [];
    for (const neighbor of neighbors) {
      const state = visitedState.get(neighbor) || 'unvisited';
      if (state === 'visiting') {
        const cycleStartIndex = path.indexOf(neighbor);
        const cycle = path.slice(cycleStartIndex).concat(neighbor);
        errors.push(
          `❌ Circular Dependency Detected\n  Cycle Path:\n  ` + cycle.join('\n  ↓\n  ')
        );
        return true;
      }
      if (state === 'unvisited') {
        if (detectCycleDFS(neighbor)) return true;
      }
    }

    path.pop();
    visitedState.set(curr, 'visited');
    return false;
  }

  for (const nodeKey of nodeMap.keys()) {
    if ((visitedState.get(nodeKey) || 'unvisited') === 'unvisited') {
      detectCycleDFS(nodeKey);
    }
  }

  // Node-level validations
  for (const [normId, node] of nodeMap.entries()) {
    // Rule 8 & Rule 10: Character References & Duplicate Character Tags
    rulesEvaluated++;
    if (node.characters) {
      const charSet = new Set<string>();
      for (const charName of node.characters) {
        if (!charName || charName.trim() === '') {
          errors.push(`❌ Invalid Character Reference on movie '${normId}': Empty character name tag.`);
        } else {
          const normChar = charName.trim().toLowerCase();
          if (charSet.has(normChar)) {
            errors.push(`❌ Duplicate Character Tag on movie '${normId}': '${charName}' appears multiple times.`);
          } else {
            charSet.add(normChar);
          }
        }
      }
    }

    // Rule 9 & Rule 11: Saga References & Duplicate Lore Tags
    rulesEvaluated++;
    if (node.saga && node.saga.trim() === '') {
      errors.push(`❌ Invalid Saga Reference on movie '${normId}': Empty saga tag.`);
    }

    const loreArrays = [
      { name: 'storyArcs', arr: node.storyArcs },
      { name: 'objects', arr: node.objects },
      { name: 'organizations', arr: node.organizations },
      { name: 'villains', arr: node.villains },
    ];

    for (const { name, arr } of loreArrays) {
      if (arr) {
        const tagSet = new Set<string>();
        for (const tag of arr) {
          if (!tag || tag.trim() === '') {
            errors.push(`❌ Invalid Tag in ${name} on movie '${normId}': Empty tag.`);
          } else {
            const normTag = tag.trim().toLowerCase();
            if (tagSet.has(normTag)) {
              errors.push(`❌ Duplicate Tag in ${name} on movie '${normId}': '${tag}' appears multiple times.`);
            } else {
              tagSet.add(normTag);
            }
          }
        }
      }
    }
  }

  // Rule 12: Entry Point Consistency
  rulesEvaluated++;
  for (const entryPointId of VERIFIED_STANDALONE_ENTRY_POINTS) {
    const normEntryId = normalizeId(entryPointId);
    const incomingCriticalEdges = edges.filter(
      (e) =>
        normalizeId(e.targetId) === normEntryId &&
        (e.strength === 'required' || e.strength === 'strong')
    );
    if (incomingCriticalEdges.length > 0) {
      errors.push(
        `❌ Entry Point Consistency Failure\n  Verified standalone entry point '${entryPointId}' has ${incomingCriticalEdges.length} incoming critical prerequisite edge(s).`
      );
    }
  }

  // Rule 13: Golden Snapshot Coverage
  rulesEvaluated++;
  for (const snapshot of Object.values(GOLDEN_TRAVERSAL_SNAPSHOTS)) {
    const normTarget = normalizeId(snapshot.targetId);
    if (!nodeMap.has(normTarget)) {
      errors.push(
        `❌ Golden Snapshot Coverage Failure\n  Snapshot for '${snapshot.targetTitle}' references deleted or non-existent movie ID '${snapshot.targetId}'.`
      );
    }
  }

  // Rule 14: Reachability Audit (Warnings for Orphan Nodes)
  rulesEvaluated++;
  for (const [normId, node] of nodeMap.entries()) {
    const hasIncoming = edges.some((e) => normalizeId(e.targetId) === normId);
    const hasOutgoing = edges.some((e) => normalizeId(e.sourceId) === normId);

    if (!hasIncoming && !hasOutgoing) {
      warnings.push(
        `⚠ Warning — Unreachable Orphan Movie: '${node.title}' (${normId}) has no incoming or outgoing graph connections.`
      );
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
