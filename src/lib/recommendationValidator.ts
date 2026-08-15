/**
 * CineOrder Recommendation Validator
 * Performs invariant integrity checks on knowledge graph traversal outputs, DTO version signatures, and edge schemas.
 */

import type { KnowledgeGraphTraversalResult } from '@/lib/storyKnowledgeGraphEngine';
import { CategoryType, RecommendationDTO } from '@/types/recommendationService';
import { cineOrderKnowledgeGraph, StoryEdge, CKGEdgeStrength } from '@/data/cineOrderKnowledgeGraph';

export interface ValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  targetId?: string;
  candidateId?: string;
}

export interface GraphValidationReport {
  isValid: boolean;
  issues: ValidationIssue[];
  auditedNodeCount: number;
  checkedEdgeCount: number;
}

/**
 * Validates traversal result invariants.
 */
export function validateRecommendationGraph(
  result: KnowledgeGraphTraversalResult
): GraphValidationReport {
  const issues: ValidationIssue[] = [];
  const targetId = result.targetContent.id;
  let checkedEdgeCount = 0;

  const allRecs = [
    ...result.mustWatch.map((r) => ({ ...r, category: CategoryType.MUST_WATCH })),
    ...result.recommended.map((r) => ({ ...r, category: CategoryType.RECOMMENDED })),
    ...result.optional.map((r) => ({ ...r, category: CategoryType.EXTRA_CONTEXT })),
    ...result.postCreditContext.map((r) => ({ ...r, category: CategoryType.POST_CREDIT })),
  ];

  const seenIds = new Set<string>();

  for (const item of allRecs) {
    checkedEdgeCount++;
    const candId = item.content.id;

    // Rule 1: Self-Cycle Prevention
    if (candId.toLowerCase() === targetId.toLowerCase()) {
      issues.push({
        severity: 'error',
        code: 'SELF_CYCLE_DETECTED',
        message: `Self-cycle detected: Target movie ${targetId} listed as its own prerequisite.`,
        targetId,
        candidateId: candId,
      });
    }

    // Rule 2 & 10: Duplicate Candidate Prevention across categories
    if (seenIds.has(candId.toLowerCase())) {
      issues.push({
        severity: 'error',
        code: 'DUPLICATE_CANDIDATE_COLLISION',
        message: `Candidate ${candId} appears multiple times across recommendation categories.`,
        targetId,
        candidateId: candId,
      });
    } else {
      seenIds.add(candId.toLowerCase());
    }

    // Rule 3: Valid Reason & Evidence Requirement
    if (!item.reason || item.reason.trim().length === 0) {
      issues.push({
        severity: 'warning',
        code: 'MISSING_REASON',
        message: `Candidate ${candId} is missing narrative justification reason.`,
        targetId,
        candidateId: candId,
      });
    }

    // Rule 4 & 6: Post-Credit Isolation & Readiness Check
    if (item.category === CategoryType.POST_CREDIT) {
      if (item.importance === 'Critical' || item.importance === 'High') {
        issues.push({
          severity: 'error',
          code: 'POST_CREDIT_IMPROPER_ELEVATION',
          message: `Post-credit candidate ${candId} cannot be elevated to Critical or High importance.`,
          targetId,
          candidateId: candId,
        });
      }
    }

    // Rule 5 & 7: Non-Post-Credit Leakage Check
    if (item.category === CategoryType.MUST_WATCH || item.category === CategoryType.RECOMMENDED) {
      if (item.dependencyType === 'Post-credit') {
        issues.push({
          severity: 'error',
          code: 'POST_CREDIT_LEAKAGE',
          message: `Post-credit candidate ${candId} leaked into ${item.category} category.`,
          targetId,
          candidateId: candId,
        });
      }
    }
  }

  const hasErrors = issues.some((i) => i.severity === 'error');

  return {
    isValid: !hasErrors,
    issues,
    auditedNodeCount: seenIds.size + 1,
    checkedEdgeCount,
  };
}

/**
 * Rule 8 & 9: Validates DTO Version Signature Matrix Completeness.
 */
export function validateRecommendationDTOs(dtos: RecommendationDTO[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const dto of dtos) {
    const sys = dto.auditMetadata?.systemVersions;
    if (!sys) {
      issues.push({
        severity: 'error',
        code: 'VERSION_SIGNATURE_MISSING',
        message: `DTO candidate ${dto.candidateTitleId} is missing systemVersions matrix.`,
        candidateId: dto.candidateTitleId,
      });
      continue;
    }

    if (
      !sys.policyVersion ||
      !sys.knowledgeGraphVersion ||
      !sys.traversalVersion ||
      !sys.snapshotSchemaVersion ||
      !sys.dtoVersion ||
      !sys.schemaVersion ||
      !sys.auditId ||
      !sys.generatedAt
    ) {
      issues.push({
        severity: 'error',
        code: 'VERSION_SIGNATURE_INCOMPLETE',
        message: `DTO candidate ${dto.candidateTitleId} contains incomplete system version matrix.`,
        candidateId: dto.candidateTitleId,
      });
    }
  }

  return issues;
}

/**
 * Enforces CKG Story Edge Invariants (post-credit alignment & enum completeness).
 */
export function validateCkgStoryEdges(edges: StoryEdge[] = cineOrderKnowledgeGraph.edges): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const validStrengths: CKGEdgeStrength[] = ['required', 'strong', 'moderate', 'weak', 'post-credit'];

  for (const edge of edges) {
    // Rule 8: Weight Consistency Check
    if (!validStrengths.includes(edge.strength)) {
      issues.push({
        severity: 'error',
        code: 'INVALID_EDGE_STRENGTH',
        message: `Edge ${edge.sourceId} -> ${edge.targetId} has unknown strength '${edge.strength}'.`,
        targetId: edge.targetId,
        candidateId: edge.sourceId,
      });
    }

    if (edge.strength === 'post-credit') {
      if (edge.relationship !== 'post-credit') {
        issues.push({
          severity: 'warning',
          code: 'POST_CREDIT_RELATIONSHIP_MISMATCH',
          message: `Edge ${edge.sourceId} -> ${edge.targetId} has strength 'post-credit' but relationship is '${edge.relationship}'.`,
          targetId: edge.targetId,
          candidateId: edge.sourceId,
        });
      }
      if (edge.narrativeScope !== 'post-credit') {
        issues.push({
          severity: 'warning',
          code: 'POST_CREDIT_SCOPE_MISMATCH',
          message: `Edge ${edge.sourceId} -> ${edge.targetId} has strength 'post-credit' but narrativeScope is '${edge.narrativeScope}'.`,
          targetId: edge.targetId,
          candidateId: edge.sourceId,
        });
      }
    }
  }

  return issues;
}
