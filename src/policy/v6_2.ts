import type { CategoryPolicyTable, RecommendationPolicy, PolicyContext } from './types';
import type { CategoryType, ImportanceLevel } from '@/types/preparation';

const STRENGTH_SCORES: Record<string, number> = {
  required: 100,
  strong: 80,
  moderate: 60,
  'post-credit': 40,
  weak: 20,
};

const RELATIONSHIP_SCORES: Record<string, number> = {
  'direct-sequel': 100,
  'story-continuation': 90,
  'character-origin': 80,
  'character-development': 70,
  mentor: 65,
  'villain-origin': 65,
  'shared-villain': 60,
  'shared-character': 55,
  'shared-event': 60,
  'shared-object': 60,
  organization: 50,
  timeline: 65,
  multiverse: 65,
  'world-building': 50,
  'major-crossover': 75,
  'thematic-callback': 45,
  'same-universe-only': 30,
  'post-credit': 40,
};

const OVERLAP_SCORES: Record<string, number> = {
  'primary-protagonist': 100,
  'ensemble-protagonist': 75,
  supporting: 50,
  none: 10,
};

const IMPORTANCE_SCORES: Record<string, number> = {
  'critical-lead': 100,
  'major-arc': 75,
  'supporting-context': 50,
  'minor-cameo': 25,
};

const DEPTH_SCORES: Record<number, number> = {
  0: 100,
  1: 65,
  2: 40,
  3: 20,
};

export const CATEGORY_POLICY_V6_2_TABLE: CategoryPolicyTable = {
  required: { default: { category: 'must_watch', importance: 'Critical', relevanceScore: 98, impactScore: 10 } },
  strong: { default: { category: 'recommended', importance: 'High', relevanceScore: 85, impactScore: 8 } },
  moderate: { default: { category: 'optional', importance: 'Medium', relevanceScore: 60, impactScore: 6 } },
  'post-credit': { default: { category: 'post_credit', importance: 'Low', relevanceScore: 40, impactScore: 4 } },
  weak: { default: { category: 'safe_to_skip', importance: 'Low', relevanceScore: 30, impactScore: 3 } },
};

export const POLICY_V6_2: RecommendationPolicy = {
  version: '6.2',
  name: 'Calibrated Independent Scoring Policy v6.2',
  description: '5-signal independent score engine with decoupled relationship/strength weights and UI-only spoiler risk.',
  table: CATEGORY_POLICY_V6_2_TABLE,
  mapEdgeToCategory: (context: PolicyContext) => {
    const { strength, relationship, traversalDepth, protagonistOverlap, narrativeImportance } = context;

    const sScore = STRENGTH_SCORES[strength] ?? 50;
    const rScore = RELATIONSHIP_SCORES[relationship] ?? 50;
    const pScore = OVERLAP_SCORES[protagonistOverlap] ?? 20;
    const iScore = IMPORTANCE_SCORES[narrativeImportance] ?? 50;
    const dScore = DEPTH_SCORES[traversalDepth] ?? 20;

    // 5-Signal Multi-Dimensional Scoring (SpoilerRisk removed from score, kept for UI badges)
    const rawScore =
      0.40 * sScore +
      0.20 * rScore +
      0.15 * pScore +
      0.15 * iScore +
      0.10 * dScore;

    const narrativeScore = Math.round(rawScore * 10) / 10;

    let category: CategoryType = 'optional';
    let importance: ImportanceLevel = 'Medium';
    let relevanceScore = Math.min(100, Math.max(10, Math.round(narrativeScore)));
    let impactScore = Math.min(10, Math.max(1, Math.round(narrativeScore / 10)));
    let depthDampened = false;

    if (strength === 'post-credit' || relationship === 'post-credit') {
      category = 'post_credit';
      importance = 'Low';
    } else if (narrativeScore >= 95 || strength === 'required') {
      category = 'must_watch';
      importance = 'Critical';
    } else if (narrativeScore >= 78) {
      category = 'recommended';
      importance = 'High';
    } else if (narrativeScore >= 50) {
      category = 'optional';
      importance = 'Medium';
      if (sScore >= 80 && dScore < 100) {
        depthDampened = true;
      }
    } else {
      category = 'safe_to_skip';
      importance = 'Low';
    }

    const edgeStrengthContrib = Math.round(0.40 * sScore * 10) / 10;
    const relationshipContrib = Math.round(0.20 * rScore * 10) / 10;
    const protagonistContrib = Math.round(0.15 * pScore * 10) / 10;
    const narrativeImportanceContrib = Math.round(0.15 * iScore * 10) / 10;
    const depthContrib = Math.round(0.10 * dScore * 10) / 10;

    const contributionBreakdown = {
      edgeStrength: edgeStrengthContrib,
      relationship: relationshipContrib,
      protagonist: protagonistContrib,
      narrativeImportance: narrativeImportanceContrib,
      depth: depthContrib,
      totalScore: narrativeScore,
    };

    const policyLookup = `SCORE_MODEL[v6.2] (Score: ${narrativeScore.toFixed(1)})`;

    return {
      category,
      importance,
      relevanceScore,
      impactScore,
      narrativeScore,
      contributionBreakdown,
      policyLookup,
      depthDampened,
    };
  },
};
