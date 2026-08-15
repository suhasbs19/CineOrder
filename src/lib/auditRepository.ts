/**
 * CineOrder AuditRepository & Incremental Subgraph Regression Engine
 * Manages persistent snapshot audit records and calculates incremental affected subgraphs
 * for scalable regression testing when editing knowledge graph nodes.
 */

import type { RecommendationSnapshot, SnapshotSignature } from '@/types/recommendationService';
import { ContentAddressableSnapshotStore } from '@/lib/contentAddressableSnapshotStore';
import { cineOrderKnowledgeGraph, StoryEdge, CKGEdgeTraversal } from '@/data/cineOrderKnowledgeGraph';
import { executeKnowledgeGraphTraversal, normalizeCkgId } from '@/lib/storyKnowledgeGraphEngine';
import { validateRecommendationGraph, validateRecommendationDTOs } from '@/lib/recommendationValidator';
import { RecommendationService } from '@/lib/recommendationService';

export interface AuditRecord {
  checksum: string;
  targetId: string;
  signature: SnapshotSignature;
  snapshot: RecommendationSnapshot;
  persistedAt: string;
}

export class AuditRepository {
  private static repository = new Map<string, AuditRecord>();

  /**
   * Persists an immutable RecommendationSnapshot into the AuditRepository
   */
  static persist(snapshot: RecommendationSnapshot): AuditRecord {
    const checksum = snapshot.checksum;
    if (this.repository.has(checksum)) {
      return this.repository.get(checksum)!;
    }

    const record: AuditRecord = {
      checksum,
      targetId: snapshot.targetId,
      signature: snapshot.signature,
      snapshot,
      persistedAt: new Date().toISOString(),
    };

    this.repository.set(checksum, record);
    // Sync with content addressable store
    ContentAddressableSnapshotStore.saveSnapshot(snapshot);
    return record;
  }

  /**
   * Loads an audit record by its SHA-256 checksum
   */
  static loadByChecksum(checksum: string): AuditRecord | undefined {
    return this.repository.get(checksum);
  }

  /**
   * Lists all persisted audit records
   */
  static listAll(): AuditRecord[] {
    return Array.from(this.repository.values());
  }

  /**
   * Returns total count of audit records
   */
  static count(): number {
    return this.repository.size;
  }

  /**
   * Clears stored repository records
   */
  static clear(): void {
    this.repository.clear();
  }
}

// Register AuditRepository as L2 durable repository fallback for ContentAddressableSnapshotStore L1 cache misses
ContentAddressableSnapshotStore.registerL2Fallback((checksum) => {
  const record = AuditRepository.loadByChecksum(checksum);
  return record?.snapshot;
});

export type PartitionMode = 'STRICT' | 'CONNECTED' | 'GLOBAL';

export interface PartitionOptions {
  mode?: PartitionMode;
}

/**
 * Retrieves all title node IDs belonging to a specific franchise partition (e.g. 'mcu', 'dc', 'star-wars', 'harry-potter').
 */
export function getFranchisePartition(franchiseId: string): string[] {
  const normFranchise = franchiseId.toLowerCase().trim();
  const nodes = Object.values(cineOrderKnowledgeGraph.titleNodes);
  return nodes
    .filter((n) => (n.universe && n.universe.toLowerCase().includes(normFranchise)) || n.id.toLowerCase().startsWith(`${normFranchise}-`))
    .map((n) => normalizeCkgId(n.id));
}

/**
 * Resolves the explicit or derived CKGEdgeTraversal capability for a StoryEdge.
 * Separates story relationship semantics from traversal capability capabilities.
 */
export function resolveEdgeTraversal(
  edge: StoryEdge,
  srcUniverse?: string,
  tgtUniverse?: string
): CKGEdgeTraversal {
  if (edge.traversal) {
    return edge.traversal;
  }

  const isSameUniverse = Boolean(srcUniverse && tgtUniverse && srcUniverse === tgtUniverse);
  const isDeclaredCrossUniverseEdge =
    edge.relationship === 'multiverse' || edge.relationship === 'major-crossover';

  return {
    strict: isSameUniverse,
    connected: isSameUniverse || isDeclaredCrossUniverseEdge,
    global: true,
  };
}

/**
 * Calculates the forward affected subgraph (descendant titles) when a CKG node is modified.
 * Traversal decisions depend strictly on configuration-driven CKGEdgeTraversal capabilities:
 * - 'STRICT': Traverses edges with edge.traversal.strict === true.
 * - 'CONNECTED': Traverses edges with edge.traversal.connected === true.
 * - 'GLOBAL': Traverses edges with edge.traversal.global === true.
 */
export function getAffectedSubgraph(
  modifiedNodeId: string,
  options: PartitionOptions = { mode: 'STRICT' }
): string[] {
  const normModified = normalizeCkgId(modifiedNodeId);
  const edges = cineOrderKnowledgeGraph.edges;
  const nodes = cineOrderKnowledgeGraph.titleNodes;
  const mode = options.mode || 'STRICT';

  // Build forward adjacency list: source -> targets
  const forwardAdj = new Map<string, string[]>();
  Object.keys(nodes).forEach((id) => forwardAdj.set(normalizeCkgId(id), []));

  for (const edge of edges) {
    const src = normalizeCkgId(edge.sourceId);
    const tgt = normalizeCkgId(edge.targetId);
    const srcNode = nodes[src] || Object.values(nodes).find((n) => normalizeCkgId(n.id) === src);
    const tgtNode = nodes[tgt] || Object.values(nodes).find((n) => normalizeCkgId(n.id) === tgt);

    const traversal = resolveEdgeTraversal(edge, srcNode?.universe, tgtNode?.universe);

    if (mode === 'STRICT' && !traversal.strict) {
      continue;
    }
    if (mode === 'CONNECTED' && !traversal.connected) {
      continue;
    }
    if (mode === 'GLOBAL' && !traversal.global) {
      continue;
    }

    const list = forwardAdj.get(src) || [];
    list.push(tgt);
    forwardAdj.set(src, list);
  }

  const affected = new Set<string>();
  affected.add(normModified);

  const queue = [normModified];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const descendants = forwardAdj.get(current) || [];
    for (const d of descendants) {
      if (!affected.has(d)) {
        affected.add(d);
        queue.push(d);
      }
    }
  }

  return Array.from(affected);
}

export interface IncrementalRegressionReport {
  modifiedNodeId: string;
  affectedSubgraphCount: number;
  affectedNodeIds: string[];
  passedCount: number;
  isPassed: boolean;
  errors: string[];
}

/**
 * Executes high-speed incremental regression testing strictly on the affected subgraph.
 */
export function runIncrementalRegressionTest(modifiedNodeId: string): IncrementalRegressionReport {
  const affectedIds = getAffectedSubgraph(modifiedNodeId);
  const errors: string[] = [];
  let passedCount = 0;

  for (const targetId of affectedIds) {
    const traversal = executeKnowledgeGraphTraversal(targetId, []);
    if (!traversal) {
      errors.push(`Incremental Regression Error: Traversal for affected node '${targetId}' returned null.`);
      continue;
    }

    const graphReport = validateRecommendationGraph(traversal);
    if (!graphReport.isValid) {
      errors.push(`Incremental Regression Policy Error: Node '${targetId}' failed ${graphReport.issues.length} policy invariants.`);
    }

    const dtos = RecommendationService.buildDTOs(traversal);
    const dtoIssues = validateRecommendationDTOs(dtos);
    if (dtoIssues.length > 0) {
      errors.push(`Incremental Regression DTO Error: Node '${targetId}' failed DTO version matrix check.`);
    }

    if (graphReport.isValid && dtoIssues.length === 0) {
      passedCount++;
    }
  }

  return {
    modifiedNodeId,
    affectedSubgraphCount: affectedIds.length,
    affectedNodeIds: affectedIds,
    passedCount,
    isPassed: errors.length === 0,
    errors,
  };
}

export type ChangeType =
  | 'NODE_METADATA_ONLY'
  | 'STORY_EDGE_CHANGE'
  | 'TRAVERSAL_ALGORITHM_CHANGE'
  | 'VALIDATOR_LOGIC_CHANGE'
  | 'POLICY_ENGINE_VERSION_CHANGE'
  | 'SCHEMA_VERSION_CHANGE';

export type RegressionScope = 'TARGET_NODE' | 'AFFECTED_SUBGRAPH' | 'FULL_DATASET';

export interface ScopeClassificationResult {
  changeType: ChangeType;
  recommendedScope: RegressionScope;
  targetNodeId?: string;
  titlesToAuditCount: number;
  titlesToAuditList: string[];
  reason: string;
}

/**
 * Classifies the required regression testing scope based on the nature of the change.
 * Determines whether to run target-only, incremental subgraph, or 100% full dataset regression.
 */
export function classifyRegressionScope(
  changeType: ChangeType,
  targetNodeId?: string
): ScopeClassificationResult {
  const allNodes = Object.keys(cineOrderKnowledgeGraph.titleNodes).map(normalizeCkgId);

  switch (changeType) {
    case 'NODE_METADATA_ONLY': {
      const norm = targetNodeId ? normalizeCkgId(targetNodeId) : '';
      return {
        changeType,
        recommendedScope: 'TARGET_NODE',
        targetNodeId: norm,
        titlesToAuditCount: norm ? 1 : 0,
        titlesToAuditList: norm ? [norm] : [],
        reason: `Node metadata change only affects single title '${norm}'.`,
      };
    }

    case 'STORY_EDGE_CHANGE': {
      const norm = targetNodeId ? normalizeCkgId(targetNodeId) : '';
      const affected = norm ? getAffectedSubgraph(norm) : [];
      return {
        changeType,
        recommendedScope: 'AFFECTED_SUBGRAPH',
        targetNodeId: norm,
        titlesToAuditCount: affected.length,
        titlesToAuditList: affected,
        reason: `Graph edge change affects target title '${norm}' and its ${affected.length - 1} forward descendants.`,
      };
    }

    case 'TRAVERSAL_ALGORITHM_CHANGE':
    case 'VALIDATOR_LOGIC_CHANGE':
    case 'POLICY_ENGINE_VERSION_CHANGE':
    case 'SCHEMA_VERSION_CHANGE':
    default:
      return {
        changeType,
        recommendedScope: 'FULL_DATASET',
        targetNodeId,
        titlesToAuditCount: allNodes.length,
        titlesToAuditList: allNodes,
        reason: `Global change type '${changeType}' invalidates global traversal/policy assumptions; full dataset audit required.`,
      };
  }
}
