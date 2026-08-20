/**
 * CineOrder Trailer Intelligence — Phase 2: Canonical Type System
 * 
 * Defines the core evidentiary taxonomy, 4-tier epistemic states,
 * prerequisite impact levels, structured trailer evidence items,
 * and immutable proposal structures.
 * 
 * Preserves CineOrder v1.0-framework-freeze with zero framework creep.
 */

import type {
  CKGEdgeRelationship,
  CKGEdgeStrength,
  CKGEdgeConfidence,
} from '@/data/cineOrderKnowledgeGraph';
import type {
  ProposedStoryEdge,
  ProposedEntityNode,
  ProposalStatus,
} from './ckgProposal';
import type {
  TrailerClassification,
  TrailerEvidenceVerificationState,
  TrailerLifecycleEventType,
  RawTMDbVideo,
  VerifiedTrailerMetadata,
} from './trailerDiscovery';

// Re-export existing foundational types for seamless interoperability
export type {
  TrailerClassification,
  TrailerEvidenceVerificationState,
  TrailerLifecycleEventType,
  RawTMDbVideo,
  VerifiedTrailerMetadata,
};

// ============================================================================
// 1. 15 CANONICAL TRAILER EVIDENCE CATEGORIES
// ============================================================================
export type TrailerEvidenceCategory =
  | 'RETURNING_CHARACTER'
  | 'NEW_CHARACTER'
  | 'RETURNING_LOCATION'
  | 'NEW_LOCATION'
  | 'VILLAIN'
  | 'FACTION_OR_ORGANIZATION'
  | 'STATED_RELATIONSHIP'
  | 'SEQUEL_PREQUEL_CONTINUITY'
  | 'CROSSOVER_CHARACTER'
  | 'MULTIVERSE_REFERENCE'
  | 'TIMELINE_CLUE'
  | 'DIRECT_NARRATIVE_CONTINUATION'
  | 'VISUAL_CALLBACK'
  | 'EXPLICIT_TITLE_REFERENCE'
  | 'FRANCHISE_CONTINUITY_SIGNAL';

// ============================================================================
// 2. 4-TIER EPISTEMIC CLASSIFICATION TAXONOMY
// ============================================================================
export type TrailerEvidenceEpistemicState =
  | 'OBSERVED'   // Objective sensory fact directly observed in trailer
  | 'INFERRED'   // Machine/engine hypothesis deduced from observation
  | 'EDITORIAL'  // Human-curated or reviewer-modified proposal
  | 'VERIFIED';  // Formally approved and integrated into production CKG

// ============================================================================
// 3. PREREQUISITE IMPACT TAXONOMY (Anti-Inflation Guard)
// ============================================================================
export type PrerequisiteImpact =
  | 'NONE'                  // General world-building / no prerequisite effect
  | 'OPTIONAL'              // Cameo, Easter egg, visual callback, background context
  | 'RECOMMENDED'           // Enhances thematic context or character journey
  | 'MUST_WATCH_CANDIDATE'; // High-confidence direct narrative continuation (Never auto-promoted to production 'required')

// ============================================================================
// 4. STRUCTURED EVIDENCE ITEM
// ============================================================================
export interface SuggestedTrailerStoryEdge {
  sourceContentId: string;
  targetContentId: string;
  relationship: CKGEdgeRelationship;
  strength: CKGEdgeStrength;
  confidence: CKGEdgeConfidence;
  reason: string;
  narrativeScope?: 'main-feature' | 'post-credit';
  isCrossover?: boolean;
}

export interface TrailerEvidenceItem {
  id: string;
  category: TrailerEvidenceCategory;
  subject: string;
  description: string;
  timestampSeconds?: number;
  timestampFormatted?: string;
  videoKey: string;
  videoTitle: string;
  confidence: number; // Strictly bounded: 0.0 <= confidence <= 1.0
  verificationState: TrailerEvidenceEpistemicState;
  prerequisiteImpact: PrerequisiteImpact;
  suggestedEdge?: SuggestedTrailerStoryEdge;
  narrativeScope?: 'main-feature' | 'post-credit';
  continuityId?: string;
  sourceTrailerUrl?: string;
  sourcePublisher?: string;
  visualClues?: string[];
  dialogueQuotes?: string[];
  matchedCkgEntityId?: string;
}

// ============================================================================
// 5. RAW INPUT OBSERVATION CONTRACT (Pure Extractor Input)
// ============================================================================
export interface RawTrailerObservationInput {
  category: TrailerEvidenceCategory;
  subject: string;
  observationDescription: string;
  timestampSeconds?: number;
  timestampFormatted?: string;
  rawConfidence?: number; // 0.0 to 1.0
  initialState?: TrailerEvidenceEpistemicState;
  targetPrerequisiteContentId?: string;
  suggestedRelationshipType?: CKGEdgeRelationship;
  sourceContinuityId?: string;
  isDirectContinuityCliffhanger?: boolean;
  isCameoAppearance?: boolean;
  isVisualCallbackOnly?: boolean;
  visualClues?: string[];
  dialogueQuotes?: string[];
}

// ============================================================================
// 6. CONTENT CONTEXT FOR EXTRACTION
// ============================================================================
export interface TrailerContentContext {
  contentId: string;
  franchiseId: string;
  continuityId: string;
  title: string;
  tmdbId?: number;
}

// ============================================================================
// 7. TRAILER PROPOSAL PACKAGE (Phase 1 Approved Model)
// ============================================================================
export interface TrailerProposalPackage {
  id: string;
  franchiseId: string;
  contentId: string;
  continuityId: string;
  tmdbId: number;
  videoKey: string;
  videoSite: string;
  videoTitle: string;
  videoClassification: TrailerClassification;
  publishedTimestamp?: string;
  evidenceItems: TrailerEvidenceItem[];
  proposedStoryEdges: ProposedStoryEdge[];
  proposedEntityNodes?: ProposedEntityNode[];
  reviewStatus: ProposalStatus; // 'pending' | 'approved' | 'rejected' | 'merged'
  reviewer?: string;
  reviewTimestamp?: string;
  reviewNotes?: string;
  createdAt: string;
  overallConfidence: number;
  continuitySafetyPassed: boolean;
  continuitySafetyNotes?: string[];
  qualityBreakdown?: {
    completeness: number;
    citationQuality: number;
    confidence: number;
    overallQuality: number;
  };
}

// ============================================================================
// 8. PURE EXTRACTOR RESULT
// ============================================================================
export interface TrailerExtractionResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  evidenceItems: TrailerEvidenceItem[];
  proposedEdges: ProposedStoryEdge[];
  continuitySafetyPassed: boolean;
  continuitySafetyNotes: string[];
  targetContentId: string;
  franchiseId: string;
  continuityId: string;
  totalEvidenceCount: number;
  mustWatchCandidateCount: number;
  recommendedCount: number;
  optionalCount: number;
}

// ============================================================================
// 9. DETERMINISTIC STORE & PERSISTENCE TYPES
// ============================================================================
export interface HistoricalTrailerVersion {
  videoKey: string;
  videoTitle: string;
  classification: TrailerClassification;
  supersededAt: string;
  metadataHash: string;
  evidenceHash: string;
}

export interface TrackedTrailerRecord {
  trailerIdentity: string;
  contentId: string;
  franchiseId: string;
  continuityId: string;
  tmdbId: number;
  videoKey: string;
  videoTitle: string;
  classification: TrailerClassification;
  isOfficial: boolean;
  sourceUrl: string;
  metadataHash: string;
  evidenceHash: string;
  eventHash: string;
  firstSeenAt: string;
  lastSeenAt: string;
  status: ProposalStatus;
  historicalVersions: HistoricalTrailerVersion[];
  generatedProposalIds: string[];
  evidenceCount: number;
  isDelisted?: boolean;
  delistedAt?: string;
}

export interface TrailerMonitorScanResult {
  scanTimestamp: string;
  titlesScanned: number;
  trailersEvaluated: number;
  newTrailersDiscovered: number;
  trailersUpdated: number;
  trailersReplaced: number;
  trailersRemoved: number;
  duplicatesBlocked: number;
  rejectedUnofficialCount: number;
  proposalsGenerated: TrailerProposalPackage[];
  trackedRecords: TrackedTrailerRecord[];
}

// ============================================================================
// 10. READ-ONLY RECOMMENDATION IMPACT SIMULATOR TYPES
// ============================================================================
export type TrailerImpactClassification =
  | 'NEW_MUST_WATCH_CANDIDATE'
  | 'NEW_RECOMMENDED'
  | 'NEW_OPTIONAL'
  | 'CROSS_CONTINUITY_IMPACT'
  | 'NO_CHANGE'
  | 'CONFLICTING_EVIDENCE'
  | 'REVIEW_REQUIRED';

export interface SimulatedPrerequisiteItem {
  contentId: string;
  title: string;
  strength: string;
  relationship: string;
  confidence: string;
  category: 'must_watch' | 'recommended' | 'optional';
  isSimulatedNew: boolean;
  evidenceId?: string;
  reason: string;
  continuityId?: string;
  isCrossContinuity?: boolean;
}

export interface TrailerRecommendationImpactReport {
  targetContentId: string;
  targetTitle: string;
  franchiseId: string;
  continuityId: string;
  isReadOnlySimulation: true;
  primaryImpactCategory: TrailerImpactClassification;
  currentProductionPrerequisites: {
    mustWatch: SimulatedPrerequisiteItem[];
    recommended: SimulatedPrerequisiteItem[];
    optional: SimulatedPrerequisiteItem[];
    totalCount: number;
  };
  simulatedPrerequisites: {
    mustWatch: SimulatedPrerequisiteItem[];
    recommended: SimulatedPrerequisiteItem[];
    optional: SimulatedPrerequisiteItem[];
    totalCount: number;
  };
  diff: {
    newMustWatchCandidates: SimulatedPrerequisiteItem[];
    newRecommended: SimulatedPrerequisiteItem[];
    newOptional: SimulatedPrerequisiteItem[];
    crossContinuityLinks: Array<{
      sourceContentId: string;
      sourceContinuity: string;
      targetContentId: string;
      targetContinuity: string;
      relationship: string;
      confidence: string;
      reason: string;
    }>;
    conflictsDetected: string[];
  };
  safetyNotes: string[];
  evidenceSummary: Array<{
    evidenceId: string;
    category: TrailerEvidenceCategory;
    subject: string;
    epistemicState: TrailerEvidenceEpistemicState;
    prerequisiteImpact: PrerequisiteImpact;
    confidence: number;
    simulatedContribution: string;
  }>;
}

// ============================================================================
// 11. PHASE 5: TRAILER RECOMMENDATION IMPACT PROPOSAL TYPES
// ============================================================================
export type TrailerRecommendationImpactCategory =
  | 'NEW_PREREQUISITE'
  | 'NEW_RECOMMENDED_CONTEXT'
  | 'NEW_OPTIONAL_CONTEXT'
  | 'SEQUEL_RELATIONSHIP'
  | 'PREQUEL_RELATIONSHIP'
  | 'CROSSOVER_RELATIONSHIP'
  | 'CHARACTER_CONTEXT'
  | 'CONTINUITY_CONTEXT'
  | 'NO_RECOMMENDATION_IMPACT';

export interface ProposedRelationshipDetail {
  sourceTitle: string;
  targetTitle: string;
  sourceContentId: string;
  targetContentId: string;
  relationshipType: CKGEdgeRelationship | string;
  recommendationStrength: CKGEdgeStrength | 'required' | 'recommended' | 'optional';
  confidence: CKGEdgeConfidence | number;
  evidence: string;
  explanation: string;
  continuity: string;
  trailerId: string;
  affectedRecommendationPath: string;
  isCrossContinuity?: boolean;
}

export interface RecommendationGraphSnapshot {
  mustWatch: SimulatedPrerequisiteItem[];
  recommended: SimulatedPrerequisiteItem[];
  optional: SimulatedPrerequisiteItem[];
  totalCount: number;
  asciiTree?: string;
}

export interface TrailerRecommendationImpactProposal {
  id: string;
  proposalType: 'TRAILER_RECOMMENDATION_IMPACT';
  trailerId: string;
  videoKey: string;
  videoTitle: string;
  contentId: string;
  title: string;
  franchiseId: string;
  continuityId: string;
  impactCategory: TrailerRecommendationImpactCategory;
  confidence: number;
  evidenceItems: TrailerEvidenceItem[];
  proposedRelationships: ProposedRelationshipDetail[];
  currentRecommendationState: RecommendationGraphSnapshot;
  proposedRecommendationState: RecommendationGraphSnapshot;
  deltaSummary: {
    addedMustWatch: string[];
    addedRecommended: string[];
    addedOptional: string[];
    crossContinuityWarnings: string[];
  };
  sourceCitations: string[];
  explanation: string;
  status: ProposalStatus; // 'pending' | 'approved' | 'rejected' | 'archived' | 'merged'
  reviewer?: string;
  reviewTimestamp?: string;
  reviewNotes?: string;
  generatedAt: string;
  eventHash: string;
  continuitySafetyPassed: boolean;
  continuitySafetyNotes: string[];
}

// ============================================================================
// 10. REVIEW AUDIT LOGGING & FILTERING TYPES (Phase 6)
// ============================================================================
export interface TrailerReviewAuditLogEntry {
  id: string;
  proposalId: string;
  trailerId: string;
  contentId: string;
  franchiseId: string;
  reviewer: string;
  action: 'APPROVE' | 'REJECT' | 'ARCHIVE' | 'RESET';
  timestamp: string;
  previousStatus: ProposalStatus;
  newStatus: ProposalStatus;
  rationale: string;
  affectedTitles: string[];
}

export interface TrailerReviewFilterOptions {
  searchQuery?: string;
  franchiseId?: string | 'all';
  continuityId?: string | 'all';
  proposalStatus?: ProposalStatus | 'all';
  impactCategory?: TrailerRecommendationImpactCategory | 'all';
  mustWatchOnly?: boolean;
  hasCrossContinuityWarning?: boolean;
  minConfidence?: number;
}
