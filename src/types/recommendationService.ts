/**
 * CineOrder Recommendation Service Type System
 * Core Data Transfer Objects, System Versioning Matrix, and Profiles
 */

export enum CategoryType {
  MUST_WATCH = 'must_watch',
  RECOMMENDED = 'recommended',
  EXTRA_CONTEXT = 'optional',
  POST_CREDIT = 'post_credit',
}

export enum EvidenceQualityType {
  DIRECT_DIALOGUE = 'DIRECT_DIALOGUE',
  ON_SCREEN_EVENT = 'ON_SCREEN_EVENT',
  VISUAL_ESTABLISHMENT = 'VISUAL_ESTABLISHMENT',
  IMPLIED = 'IMPLIED',
}

export enum ConfidenceLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum EdgeCategoryType {
  CHARACTER = 'character',
  STORY = 'story',
  TECHNOLOGY = 'technology',
  WORLD = 'world',
  POST_CREDIT = 'post_credit',
}

export interface StructuredTimestamp {
  startTimeSeconds?: number;
  endTimeSeconds?: number;
  formattedTimestamp?: string;
}

export interface SnapshotSignature {
  checksum: string;
  auditId: string;
  policyVersion: string;
  snapshotSchemaVersion: string;
  knowledgeGraphVersion: string;
  traversalVersion: string;
  generatedAt: string;
  generatorVersion: string;
}

export interface RecommendationSnapshot {
  snapshotSchemaVersion: '1.0';
  targetId: string;
  targetTitle: string;
  isEntryPoint: boolean;
  mustWatchIds: string[];
  recommendedIds: string[];
  optionalIds: string[];
  postCreditIds: string[];
  storyReadinessPercentage: number;
  estimatedWatchTimeMinutes: number;
  generatedAt: string;
  checksum: string;
  signature: SnapshotSignature;
}

export interface EvidenceReference {
  type: EvidenceQualityType;
  description: string;
  timestamp?: StructuredTimestamp;
}

export interface SystemVersionMatrix {
  policyVersion: string;
  knowledgeGraphVersion: string;
  traversalVersion: string;
  snapshotSchemaVersion: string;
  dtoVersion: string;
  schemaVersion: string;
  auditId: string;
  generatedAt: string;
}

export interface AuditMetadata {
  auditId: string;
  policyVersion: string;
  schemaVersion: string;
  auditedBy: string;
  generatedAt: string;
  systemVersions: SystemVersionMatrix;
  signature: SnapshotSignature;
}

export interface RecommendationDTO {
  recommendationId: string;
  targetTitleId: string;
  candidateTitleId: string;
  category: CategoryType;
  shortReason: string;
  detailedReasons: string[];
  evidenceSource?: 'editorial' | 'graph';
  narrativeReasons: string[];
  evidence: EvidenceReference[];
  policyExplanation: string;
  confidence: ConfidenceLevel;
  impactScore: number;
  relevanceScore: number;
  auditMetadata: AuditMetadata;
}

export type PresentationModule = 'storyReadiness' | 'timeline' | 'dependencyGraph' | 'inspector';

export interface TraversalConstraints {
  minStrength: 'required' | 'strong' | 'moderate' | 'weak';
  maxDepth: number;
}

export interface RecommendationProfile {
  id: 'minimalist' | 'balanced' | 'complete' | 'completionist';
  name: string;
  description: string;
  iconName: string;
  visibleCategories: CategoryType[];
  enabledModules: PresentationModule[];
  evidenceBadgeStyle: 'stars' | 'text' | 'compact';
  traversalConstraints: TraversalConstraints;
}

export const SYSTEM_PROFILES: Record<string, RecommendationProfile> = {
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Displays mandatory plot-blocking prerequisites only.',
    iconName: 'Zap',
    visibleCategories: [CategoryType.MUST_WATCH],
    enabledModules: ['storyReadiness', 'inspector'],
    evidenceBadgeStyle: 'compact',
    traversalConstraints: {
      minStrength: 'required',
      maxDepth: 1,
    },
  },
  balanced: {
    id: 'balanced',
    name: 'Balanced',
    description: 'The optimal blend of plot essentials and key character context.',
    iconName: 'Scale',
    visibleCategories: [CategoryType.MUST_WATCH, CategoryType.RECOMMENDED],
    enabledModules: ['storyReadiness', 'timeline', 'dependencyGraph', 'inspector'],
    evidenceBadgeStyle: 'stars',
    traversalConstraints: {
      minStrength: 'strong',
      maxDepth: 3,
    },
  },
  complete: {
    id: 'complete',
    name: 'Complete',
    description: 'Includes lore background, callbacks, and post-credit setup.',
    iconName: 'BookOpen',
    visibleCategories: [
      CategoryType.MUST_WATCH,
      CategoryType.RECOMMENDED,
      CategoryType.EXTRA_CONTEXT,
      CategoryType.POST_CREDIT,
    ],
    enabledModules: ['storyReadiness', 'timeline', 'dependencyGraph', 'inspector'],
    evidenceBadgeStyle: 'stars',
    traversalConstraints: {
      minStrength: 'moderate',
      maxDepth: 4,
    },
  },
  completionist: {
    id: 'completionist',
    name: 'Completionist',
    description: 'Full franchise timeline journey in release/chronological order.',
    iconName: 'Trophy',
    visibleCategories: [
      CategoryType.MUST_WATCH,
      CategoryType.RECOMMENDED,
      CategoryType.EXTRA_CONTEXT,
      CategoryType.POST_CREDIT,
    ],
    enabledModules: ['storyReadiness', 'timeline', 'dependencyGraph', 'inspector'],
    evidenceBadgeStyle: 'text',
    traversalConstraints: {
      minStrength: 'weak',
      maxDepth: 5,
    },
  },
};
