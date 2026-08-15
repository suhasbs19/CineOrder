import type { StoryEdge, EntityNode } from '@/data/cineOrderKnowledgeGraph';

export type ProposalStatus = 'pending' | 'approved' | 'rejected' | 'merged';
export type ProposalSourceType = 'official-synopsis' | 'official-trailer' | 'tmdb' | 'wikidata' | 'editorial-research';

export interface ProposedStoryEdge extends StoryEdge {
  id: string;
  sourceText: string;
  sourceUrl?: string;
  citation: string;
  extractionDate: string;
  confidenceScore: number; // 0.0 to 1.0
  proposedAt: string;
  status: ProposalStatus;
  reviewNotes?: string;
  
  // Phase 3 Refinement Additions
  qualityBreakdown?: {
    completeness: number;
    citationQuality: number;
    confidence: number;
    duplicateRisk: number;
    conflictRisk: number;
    overallQuality: number;
  };
  duplicateMatch?: {
    isDuplicate: boolean;
    existingEdgeId?: string;
    existingReason?: string;
  };
  conflictMatch?: {
    isConflict: boolean;
    field: string;
    currentValue: string;
    proposedValue: string;
  };
}

export interface ProposedEntityNode extends EntityNode {
  sourceText: string;
  sourceUrl?: string;
  citation: string;
  extractionDate: string;
  proposedAt: string;
  status: ProposalStatus;
  duplicateMatch?: {
    isDuplicate: boolean;
    existingEntityId?: string;
  };
}

export interface ProposalReviewHistoryEntry {
  id: string;
  reviewer: string;
  action: 'approved' | 'rejected' | 'merged' | 'edited';
  timestamp: string;
  version: string;
  notes?: string;
  changesSummary?: string;
}

export interface CKGProposalPackage {
  id: string;
  franchiseId: string;
  title: string;
  createdAt: string;
  proposedEdges: ProposedStoryEdge[];
  proposedEntities: ProposedEntityNode[];
  status: ProposalStatus;
  overallQualityScore: number; // 0 to 100
  metadata: {
    generatedBy: string;
    sourceDocument: string;
    sourceType: ProposalSourceType;
    modelName?: string;
  };
  reviewHistory: ProposalReviewHistoryEntry[];
}

export interface CKGVersioningState {
  currentVersion: string;
  previousVersion: string;
  pendingVersion: string;
  lastMergedAt?: string;
  totalMergesCount: number;
}
