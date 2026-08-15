import type { CategoryResult, CategoryPolicyTable, RecommendationPolicy, PolicyContext } from './types';

const POLICY_MUST_WATCH: CategoryResult = { category: 'must_watch', importance: 'Critical', relevanceScore: 98, impactScore: 10 };
const POLICY_RECOMMENDED: CategoryResult = { category: 'recommended', importance: 'High', relevanceScore: 85, impactScore: 8 };
const POLICY_RECOMMENDED_SOFT: CategoryResult = { category: 'recommended', importance: 'Medium', relevanceScore: 70, impactScore: 7 };
const POLICY_EXTRA_CONTEXT: CategoryResult = { category: 'optional', importance: 'Medium', relevanceScore: 60, impactScore: 6 };
const POLICY_POST_CREDIT: CategoryResult = { category: 'post_credit', importance: 'Low', relevanceScore: 40, impactScore: 4 };
const POLICY_SAFE_TO_SKIP: CategoryResult = { category: 'safe_to_skip', importance: 'Low', relevanceScore: 30, impactScore: 3 };

export const CATEGORY_POLICY_V6_TABLE: CategoryPolicyTable = {
  required: {
    default: POLICY_MUST_WATCH,
  },
  strong: {
    default: POLICY_RECOMMENDED,
  },
  moderate: {
    default: POLICY_EXTRA_CONTEXT,
    'direct-sequel': POLICY_RECOMMENDED_SOFT,
    'story-continuation': POLICY_RECOMMENDED_SOFT,
    'character-development': POLICY_EXTRA_CONTEXT,
    'character-origin': POLICY_EXTRA_CONTEXT,
    'mentor': POLICY_EXTRA_CONTEXT,
    'villain-origin': POLICY_EXTRA_CONTEXT,
    'shared-villain': POLICY_EXTRA_CONTEXT,
    'shared-character': POLICY_EXTRA_CONTEXT,
    'shared-event': POLICY_EXTRA_CONTEXT,
    'shared-object': POLICY_EXTRA_CONTEXT,
    'organization': POLICY_EXTRA_CONTEXT,
    'timeline': POLICY_EXTRA_CONTEXT,
    'multiverse': POLICY_EXTRA_CONTEXT,
    'world-building': POLICY_EXTRA_CONTEXT,
    'major-crossover': POLICY_EXTRA_CONTEXT,
    'thematic-callback': POLICY_EXTRA_CONTEXT,
    'same-universe-only': POLICY_EXTRA_CONTEXT,
    'post-credit': POLICY_POST_CREDIT,
  },
  'post-credit': {
    default: POLICY_POST_CREDIT,
  },
  weak: {
    default: POLICY_SAFE_TO_SKIP,
  },
};

export const POLICY_V6: RecommendationPolicy = {
  version: '6.0',
  name: 'Multi-Signal Narrative Dependency Policy v6.0',
  description: 'Six-axis evaluation policy (strength, relationship, depth, spoilerRisk, protagonistOverlap, narrativeImportance).',
  table: CATEGORY_POLICY_V6_TABLE,
  mapEdgeToCategory: (context: PolicyContext) => {
    const { strength, relationship, traversalDepth, protagonistOverlap, narrativeImportance } = context;
    const entry = CATEGORY_POLICY_V6_TABLE[strength] ?? { default: POLICY_EXTRA_CONTEXT };
    const hasSpecificKey = relationship in entry;
    const base = (entry as Record<string, CategoryResult>)[relationship] ?? entry.default;
    const policyLookup = `CATEGORY_POLICY['${strength}']${hasSpecificKey ? `['${relationship}']` : '.default'}`;

    let depthDampened = false;
    let finalResult = base;

    // Signal Refinement 1: Moderate edge with primary protagonist lead at depth 0 promoted to soft recommended
    if (
      base.category === 'optional' &&
      strength === 'moderate' &&
      traversalDepth === 0 &&
      narrativeImportance === 'critical-lead' &&
      protagonistOverlap === 'primary-protagonist'
    ) {
      finalResult = POLICY_RECOMMENDED_SOFT;
    }

    // Signal Refinement 2: Depth dampening for indirect edges (depth >= 1) or minor narrative importance
    if (
      (base.category === 'recommended' && strength === 'moderate' && traversalDepth >= 2) ||
      (base.category === 'recommended' && traversalDepth >= 1 && (relationship === 'character-development' || relationship === 'character-origin')) ||
      (base.category === 'recommended' && narrativeImportance === 'minor-cameo') ||
      (base.category === 'recommended' && traversalDepth >= 1 && protagonistOverlap === 'none')
    ) {
      depthDampened = true;
      finalResult = POLICY_EXTRA_CONTEXT;
    }

    return {
      ...finalResult,
      policyLookup,
      depthDampened,
    };
  },
};
