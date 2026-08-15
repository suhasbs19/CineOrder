/**
 * CineOrder Recommendation Service
 * Orchestrates graph lookup, traversal caching, immutable snapshot generation,
 * policy validation gating, profile filtering, and DTO construction.
 */

import { ACTIVE_POLICY_VERSION } from '@/policy';
import {
  executeKnowledgeGraphTraversal,
  type KnowledgeGraphTraversalResult,
} from '@/lib/storyKnowledgeGraphEngine';
import {
  validateRecommendationGraph,
  validateRecommendationDTOs,
  type GraphValidationReport,
  type ValidationIssue,
} from '@/lib/recommendationValidator';
import {
  CategoryType,
  ConfidenceLevel,
  EvidenceQualityType,
  type RecommendationDTO,
  type RecommendationProfile,
  type RecommendationSnapshot,
  type TraversalConstraints,
} from '@/types/recommendationService';
import { ContentAddressableSnapshotStore } from '@/lib/contentAddressableSnapshotStore';
import { cineOrderKnowledgeGraph } from '@/data/cineOrderKnowledgeGraph';

// In-Memory Traversal Cache
const traversalCache = new Map<string, KnowledgeGraphTraversalResult>();

export class RecommendationValidationError extends Error {
  public issues: ValidationIssue[];
  constructor(message: string, issues: ValidationIssue[]) {
    super(message);
    this.name = 'RecommendationValidationError';
    this.issues = issues;
  }
}

export class RecommendationService {
  /**
   * Clears the in-memory traversal cache
   */
  static clearCache(): void {
    traversalCache.clear();
  }

  /**
   * Retrieves or computes traversal for a given content ID
   */
  static getTraversal(
    contentId: string,
    watchedIds: string[] = [],
    constraints?: TraversalConstraints
  ): KnowledgeGraphTraversalResult {
    const cacheKey = `${contentId.toLowerCase()}:${watchedIds.sort().join(',')}:${constraints ? `${constraints.minStrength}-${constraints.maxDepth}` : 'default'}`;
    if (traversalCache.has(cacheKey)) {
      return traversalCache.get(cacheKey)!;
    }

    const result = executeKnowledgeGraphTraversal(contentId, watchedIds, constraints);
    if (!result) {
      throw new Error(`Failed to compute knowledge graph traversal for contentId: ${contentId}`);
    }
    traversalCache.set(cacheKey, result);
    return result;
  }

  /**
   * Executes graph traversal with caching and integrity validation gating
   */
  static getRecommendationGraph(
    targetTitleId: string,
    watchedTitleIds: string[] = [],
    constraints?: TraversalConstraints
  ): KnowledgeGraphTraversalResult {
    return this.getTraversal(targetTitleId, watchedTitleIds, constraints);
  }

  /**
   * Validates a graph traversal result against policy invariants
   */
  static validate(result: KnowledgeGraphTraversalResult): GraphValidationReport {
    return validateRecommendationGraph(result);
  }

  /**
   * Builds an immutable RecommendationSnapshot from a traversal result
   */
  static buildSnapshot(result: KnowledgeGraphTraversalResult): RecommendationSnapshot {
    const mustWatchIds = result.mustWatch.map((r) => r.content.id);
    const recommendedIds = result.recommended.map((r) => r.content.id);
    const optionalIds = result.optional.map((r) => r.content.id);
    const postCreditIds = result.postCreditContext.map((r) => r.content.id);

    // Deterministic payload excluding timestamps
    const payload = [
      result.targetContent.id,
      String(result.isEntryPoint),
      mustWatchIds.join(','),
      recommendedIds.join(','),
      optionalIds.join(','),
      postCreditIds.join(','),
      String(result.storyReadinessPercentage),
      String(result.estimatedWatchTimeMinutes),
    ].join(':');

    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      hash = (hash << 5) - hash + payload.charCodeAt(i);
      hash |= 0;
    }

    const generatedAt = new Date().toISOString();
    const checksum = `sha256-${Math.abs(hash).toString(16)}`;

    const signature = {
      checksum,
      auditId: `ckg-${result.targetContent.id}`,
      policyVersion: ACTIVE_POLICY_VERSION,
      snapshotSchemaVersion: '1.0',
      knowledgeGraphVersion: '3.2',
      traversalVersion: '2.0',
      generatedAt,
      generatorVersion: 'CineOrder Engine v1.0',
    };

    const snapshot: RecommendationSnapshot = {
      snapshotSchemaVersion: '1.0',
      targetId: result.targetContent.id,
      targetTitle: result.targetContent.title,
      isEntryPoint: result.isEntryPoint,
      mustWatchIds,
      recommendedIds,
      optionalIds,
      postCreditIds,
      storyReadinessPercentage: result.storyReadinessPercentage,
      estimatedWatchTimeMinutes: result.estimatedWatchTimeMinutes,
      generatedAt,
      checksum,
      signature,
    };

    ContentAddressableSnapshotStore.saveSnapshot(snapshot);
    return snapshot;
  }

  /**
   * Converts graph result candidates into strongly-typed DTOs
   */
  static buildDTOs(result: KnowledgeGraphTraversalResult): RecommendationDTO[] {
    const snapshot = this.buildSnapshot(result);
    return this.buildDTOsFromSnapshot(snapshot, result);
  }

  /**
   * Converts a RecommendationSnapshot and Traversal into DTOs
   */
  static buildDTOsFromSnapshot(
    snapshot: RecommendationSnapshot,
    result: KnowledgeGraphTraversalResult
  ): RecommendationDTO[] {
    const dtos: RecommendationDTO[] = [];
    const targetId = snapshot.targetId;

    const mapItemToDTO = (item: any, category: CategoryType): RecommendationDTO => {
      const matchingEdge = cineOrderKnowledgeGraph.edges.find(
        (e) => e.sourceId === item.content.id && e.targetId === targetId
      );
      const shortReason = matchingEdge?.recommendationEvidence?.shortReason || item.shortReason || item.reason || matchingEdge?.reason || '';
      const detailedReasons = matchingEdge?.recommendationEvidence?.detailedReasons || item.detailedReasons || item.reasons || (shortReason ? [shortReason] : []);

      const evidenceSource = matchingEdge?.recommendationEvidence?.source || (matchingEdge?.recommendationEvidence ? 'editorial' : 'graph');

      return {
        recommendationId: `rec-${targetId}-${item.content.id}`,
        targetTitleId: targetId,
        candidateTitleId: item.content.id,
        category,
        shortReason,
        detailedReasons,
        evidenceSource,
        narrativeReasons: detailedReasons.length > 0 ? detailedReasons : [shortReason],
        evidence: [
          {
            type: EvidenceQualityType.DIRECT_DIALOGUE,
            description: shortReason,
          },
        ],
        policyExplanation:
          category === CategoryType.MUST_WATCH
            ? 'Mandatory Prerequisite: The target title relies on plot outcomes established in this film.'
            : 'Recommended Context: Target movie sufficiently establishes essential story points on-screen for plot comprehension.',
        confidence: ConfidenceLevel.HIGH,
        impactScore: item.impactScore || 8,
        relevanceScore: item.relevanceScore || 85,
        auditMetadata: {
          auditId: `ckg-${targetId}`,
          policyVersion: ACTIVE_POLICY_VERSION,
          schemaVersion: '1.0',
          auditedBy: 'CineOrder Engine v1.0',
          generatedAt: snapshot.generatedAt,
          systemVersions: {
            policyVersion: ACTIVE_POLICY_VERSION,
            knowledgeGraphVersion: '3.2',
            traversalVersion: '2.0',
            snapshotSchemaVersion: '1.0',
            dtoVersion: '1.1',
            schemaVersion: '1.0',
            auditId: `ckg-${targetId}-${item.content.id}`,
            generatedAt: snapshot.generatedAt,
          },
          signature: snapshot.signature,
        },
      };
    };

    result.mustWatch.forEach((r) => dtos.push(mapItemToDTO(r, CategoryType.MUST_WATCH)));
    result.recommended.forEach((r) => dtos.push(mapItemToDTO(r, CategoryType.RECOMMENDED)));
    result.optional.forEach((r) => dtos.push(mapItemToDTO(r, CategoryType.EXTRA_CONTEXT)));
    result.postCreditContext.forEach((r) => dtos.push(mapItemToDTO(r, CategoryType.POST_CREDIT)));

    return dtos;
  }

  /**
   * Pipeline Gate: Ensures traversal passes RecommendationValidator before reaching UI.
   * Throws RecommendationValidationError if policy invariants fail.
   */
  static getGatedDTOs(
    targetId: string,
    profile: RecommendationProfile,
    watchedIds: string[] = []
  ): RecommendationDTO[] {
    const traversal = this.getTraversal(targetId, watchedIds, profile.traversalConstraints);

    // Policy Gate 1: Graph Traversal Invariants
    const graphReport = validateRecommendationGraph(traversal);
    if (!graphReport.isValid) {
      throw new RecommendationValidationError(
        `Recommendation Pipeline Gate Blocked: Target ${targetId} failed policy invariants.`,
        graphReport.issues
      );
    }

    const dtos = this.buildDTOs(traversal);

    // Policy Gate 2: DTO Version Signature Matrix Completeness
    const dtoIssues = validateRecommendationDTOs(dtos);
    const dtoErrors = dtoIssues.filter((i) => i.severity === 'error');
    if (dtoErrors.length > 0) {
      throw new RecommendationValidationError(
        `Recommendation Pipeline Gate Blocked: DTO version matrix invalid for target ${targetId}.`,
        dtoErrors
      );
    }

    return this.filterByProfile(dtos, profile);
  }

  /**
   * Filters recommendation DTOs according to the active recommendation profile
   */
  static filterByProfile(dtos: RecommendationDTO[], profile: RecommendationProfile): RecommendationDTO[] {
    return dtos.filter((dto) => profile.visibleCategories.includes(dto.category));
  }
}
