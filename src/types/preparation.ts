import type { Content } from './index';

export type DependencyType =
  | 'Character'
  | 'Story'
  | 'Villain'
  | 'Team'
  | 'Post-credit'
  | 'Multiverse'
  | 'Timeline'
  | 'World Building';

export type ImportanceLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Skippable';

export type CategoryType = 'must_watch' | 'recommended' | 'optional' | 'post_credit' | 'safe_to_skip';

export interface StoryRecommendation {
  priority: CategoryType;
  relevanceScore: number; // 0-100
  impactScore: number; // 1-10
  rationale: string;
  storyImpact: string;
  spoilerFreeContext: string;
  whyItMatters: string;
  introduces: string[];
  continues: string[];
  requiredFor: string[];
  estimatedImportance: ImportanceLevel;
}

export interface StoryDependency {
  sourceContentId: string;
  category: CategoryType;
  dependencyType: DependencyType;
  importance: ImportanceLevel;
  reason: string;
  storyImpact: string;
  spoilerFreeExplanation: string;
  relevanceScore?: number;
  impactScore?: number;
  whyItMatters?: string;
  introduces?: string[];
  continues?: string[];
  requiredFor?: string[];
  confidence?: 'confirmed' | 'likely' | 'limited' | 'strongly-implied' | 'provisional';
}

export interface StoryNode {
  contentId: string;
  dependencies: StoryDependency[];
}

export interface DecisionPath {
  governingEdge: {
    strength: string;
    relationship: string;
    depth: number;
    spoilerRisk?: string;
    protagonistOverlap?: string;
    narrativeImportance?: string;
  };
  narrativeScore?: number;
  contributionBreakdown?: {
    edgeStrength: number;
    relationship: number;
    protagonist: number;
    narrativeImportance: number;
    depth: number;
    totalScore: number;
  };
  confidenceMetrics?: {
    confidenceScore: number;
    confidenceLevel: 'High' | 'Moderate' | 'Low';
    edgeConfidence: string;
    consensusCount: number;
  };
  policyVersion: string;
  policyLookup: string;
  depthDampened: boolean;
  editorialOverrideApplied: boolean;
  resultingCategory: CategoryType;
}

export interface PreparationRecommendation {
  content: Content;
  category: CategoryType;
  dependencyType: DependencyType;
  importance: ImportanceLevel;
  reason: string;
  reasons?: string[];
  shortReason?: string;
  detailedReasons?: string[];
  confidence?: 'confirmed' | 'likely' | 'limited' | 'strongly-implied' | 'provisional';
  connectionCount?: number;
  storyImpact: string;
  spoilerFreeExplanation: string;
  isWatched: boolean;
  relevanceScore: number; // 0-100
  impactScore: number; // 1-10
  whyItMatters: string;
  introduces: string[];
  continues: string[];
  requiredFor: string[];
  decisionPath?: DecisionPath;
}

export interface PreparationGuideData {
  targetContent: Content;
  mustWatch: PreparationRecommendation[];
  recommended: PreparationRecommendation[];
  optional: PreparationRecommendation[];
  safeToSkip: PreparationRecommendation[];
  estimatedWatchTimeMinutes: number;
  formattedWatchTime: string;
  storyReadinessPercentage: number;
  watchedCount: number;
  totalPrerequisitesCount: number;
  isEntryPoint?: boolean;
  entryPointMessage?: string;
}
