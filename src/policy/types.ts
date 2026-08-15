import type { CKGEdgeRelationship, CKGEdgeStrength } from '@/data/cineOrderKnowledgeGraph';
import type { CategoryType, ImportanceLevel } from '@/types/preparation';

export type ProtagonistOverlapType = 'primary-protagonist' | 'ensemble-protagonist' | 'supporting' | 'none';
export type NarrativeImportanceLevel = 'critical-lead' | 'major-arc' | 'supporting-context' | 'minor-cameo';

export interface PolicyContext {
  strength: CKGEdgeStrength;
  relationship: CKGEdgeRelationship;
  traversalDepth: number;
  spoilerRisk: 'none' | 'low' | 'medium' | 'high';
  protagonistOverlap: ProtagonistOverlapType;
  narrativeImportance: NarrativeImportanceLevel;
}

export interface SignalContributionBreakdown {
  edgeStrength: number;
  relationship: number;
  protagonist: number;
  narrativeImportance: number;
  depth: number;
  totalScore: number;
}

export type CategoryResult = {
  category: CategoryType;
  importance: ImportanceLevel;
  relevanceScore: number;
  impactScore: number;
  narrativeScore?: number;
  contributionBreakdown?: SignalContributionBreakdown;
};

export type PolicyEntry = { default: CategoryResult } & Partial<
  Record<CKGEdgeRelationship, CategoryResult>
>;

export type CategoryPolicyTable = Record<CKGEdgeStrength, PolicyEntry>;

export interface RecommendationPolicy {
  version: string;
  name: string;
  description: string;
  table: CategoryPolicyTable;
  mapEdgeToCategory: (context: PolicyContext) => CategoryResult & {
    policyLookup: string;
    depthDampened: boolean;
  };
}
