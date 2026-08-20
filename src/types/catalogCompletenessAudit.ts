/**
 * CineOrder — Universal Global Catalog Completeness & Narrative Dependency Audit Types
 */

import type { ContentType } from '@/types';
import type { CKGEdgeRelationship, CKGEdgeStrength } from '@/data/cineOrderKnowledgeGraph';

export type CompletenessGapType =
  | 'MISSING_CANONICAL_TITLE'
  | 'MISSING_PREREQUISITE'
  | 'MISSING_SEQUEL'
  | 'MISSING_PREQUEL'
  | 'MISSING_SPINOFF'
  | 'MISSING_SERIES'
  | 'MISSING_CROSSOVER_CONTEXT'
  | 'MISSING_CONTINUITY_ENTRY';

export type CompletenessAuditFindingStatus =
  | 'VERIFIED_PRESENT'
  | 'VERIFIED_MISSING'
  | 'POSSIBLE_MISSING'
  | 'AMBIGUOUS'
  | 'NOT_VERIFIABLE';

export type ProposalReviewStatus = 'pending' | 'approved' | 'rejected' | 'integrated';

export interface ProposedStoryRelationshipCandidate {
  sourceId: string;
  targetId: string;
  relationship: CKGEdgeRelationship;
  strength: CKGEdgeStrength;
  confidence: 'confirmed' | 'high' | 'provisional';
  reason: string;
  editorialImportance: 'primary' | 'secondary' | 'background';
}

export interface CandidateMissingTitleProposal {
  proposalId: string;
  gapType: CompletenessGapType;
  title: string;
  tmdbId: number | null;
  mediaType: ContentType;
  franchiseId: string;
  franchiseName: string;
  continuity: string;
  releaseDate: string | null;
  releaseYear: string | null;
  overview: string;
  director?: string;
  reasonsDetected: string[];
  evidence: {
    source: string;
    sourceType: 'official-studio-press' | 'tmdb-collection' | 'narrative-edge-reference' | 'continuity-gap-analysis';
    verificationStatus: 'verified' | 'provisional' | 'unverified';
    confidenceScore: number; // 0.0 - 1.0
    citations: string[];
  };
  duplicateCheck: {
    isDuplicate: boolean;
    existingContentId?: string;
    existingTitle?: string;
    duplicateReason?: string;
  };
  artworkResolution: {
    posterUrl: string;
    backdropUrl: string;
    resolutionState: 'VERIFIED' | 'PARTIAL' | 'FALLBACK' | 'AMBIGUOUS' | 'FAILED';
    source: 'tmdb' | 'studio' | 'fallback';
  };
  lifecycleClassification: {
    status: 'released' | 'upcoming' | 'in_production' | 'tba' | 'planned';
    lifecycleStatus: 'announced' | 'upcoming' | 'theatrically_released' | 'digital_available' | 'subscription_available';
    lifecycleCategory: 'UPCOMING' | 'THEATRICALLY_RELEASED' | 'STREAMING_AVAILABLE';
    ottAvailable: boolean;
  };
  chronologicalPlacement: {
    recommendedPosition: number;
    referencePrecedingTitleId?: string;
    referenceSucceedingTitleId?: string;
    releaseDateSortKey: string;
  };
  proposedStoryRelationships: ProposedStoryRelationshipCandidate[];
  reviewStatus: ProposalReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FranchiseAuditSummary {
  franchiseId: string;
  franchiseName: string;
  slug: string;
  totalCatalogTitles: number;
  moviesCount: number;
  seriesCount: number;
  knownContinuities: string[];
  missingCount: number;
  proposals: CandidateMissingTitleProposal[];
  brokenDependenciesCount: number;
  orphanNodesCount: number;
  auditStatus: 'COMPLETE_VERIFIED' | 'GAPS_DETECTED' | 'ACTION_REQUIRED';
}

export interface BrokenGraphDependencyFinding {
  edgeSourceId: string;
  edgeTargetId: string;
  relationship: string;
  brokenNodeId: string;
  missingInCatalog: boolean;
  missingInTitleNodes: boolean;
  recommendationAction: string;
}

export interface GlobalCompletenessAuditReport {
  timestamp: string;
  auditEngineVersion: string;
  totalFranchisesAudited: number;
  totalTitlesAudited: number;
  totalStoryEdgesAudited: number;
  totalGapsDetected: number;
  gapCountsByType: Record<CompletenessGapType, number>;
  findingCountsByStatus: Record<CompletenessAuditFindingStatus, number>;
  brokenGraphDependencies: BrokenGraphDependencyFinding[];
  franchiseSummaries: FranchiseAuditSummary[];
  allProposals: CandidateMissingTitleProposal[];
  summaryMetrics: {
    verifiedMissingTitlesCount: number;
    possibleMissingTitlesCount: number;
    missingPrerequisitesCount: number;
    continuityGapsCount: number;
    brokenGraphDependenciesCount: number;
    duplicateRisksCount: number;
    ambiguousCandidatesCount: number;
    pendingApprovalsCount: number;
    approvedIntegrationsCount: number;
  };
  auditVerdict: 'HEALTHY_CANONICAL' | 'PROPOSALS_PENDING_REVIEW' | 'CRITICAL_GAPS_DETECTED';
}
