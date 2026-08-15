import type { KnowledgeGraphTraversalResult } from './storyKnowledgeGraphEngine';

export interface CQVValidationReport {
  passed: boolean;
  errorCount: number;
  warningCount: number;
  errors: string[];
  warnings: string[];
  rulesEvaluated: number;
}

/**
 * Recommendation Quality Validation Framework (CQV)
 * Evaluates the quality, consistency, readiness calculation, watch time math, and spoiler safety of generated recommendations.
 */
export function validateRecommendationQuality(
  result: KnowledgeGraphTraversalResult
): CQVValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  let rulesEvaluated = 0;

  if (!result) {
    return {
      passed: false,
      errorCount: 1,
      warningCount: 0,
      errors: ['❌ CQV Error: Traversal result is null or undefined.'],
      warnings: [],
      rulesEvaluated: 1,
    };
  }

  // Rule 1: Category Exclusivity & Rule 3: Duplicate Recommendation Detection
  rulesEvaluated++;
  const seenMap = new Map<string, string>();
  const categories = [
    { name: 'Must Watch', list: result.mustWatch },
    { name: 'Recommended', list: result.recommended },
    { name: 'Extra Context', list: result.optional },
  ];

  for (const cat of categories) {
    for (const rec of cat.list) {
      const id = rec.content.id;
      if (seenMap.has(id)) {
        errors.push(
          `❌ Duplicate Category / Title: '${rec.content.title}' (${id}) appears in both '${seenMap.get(
            id
          )}' and '${cat.name}'.`
        );
      } else {
        seenMap.set(id, cat.name);
      }
    }
  }

  // Rule 2: Priority Ordering
  rulesEvaluated++;
  const minMustWatchScore =
    result.mustWatch.length > 0
      ? Math.min(...result.mustWatch.map((r) => r.relevanceScore))
      : 100;

  for (const rec of result.recommended) {
    if (rec.relevanceScore > minMustWatchScore) {
      warnings.push(
        `⚠ Priority Score Inversion: Recommended item '${rec.content.title}' (${rec.relevanceScore}) has higher score than minimum Must Watch item (${minMustWatchScore}).`
      );
    }
  }

  // Rule 4: Relevance Ordering within categories
  rulesEvaluated++;
  for (const cat of categories) {
    for (let i = 0; i < cat.list.length - 1; i++) {
      const curr = cat.list[i]!;
      const next = cat.list[i + 1]!;
      if (curr.relevanceScore < next.relevanceScore) {
        errors.push(
          `❌ Relevance Ordering Error in '${cat.name}': '${curr.content.title}' (${curr.relevanceScore}) is placed before '${next.content.title}' (${next.relevanceScore}).`
        );
      }
    }
  }

  // Rule 5: Narrative Continuity & Rule 6: Recommendation Justification
  rulesEvaluated++;
  for (const rec of result.mustWatch) {
    if (!rec.reason || rec.reason.trim() === '') {
      errors.push(
        `❌ Missing Narrative Rationale: Must Watch item '${rec.content.title}' has no explanation.`
      );
    }
    const hasChips =
      (rec.introduces && rec.introduces.length > 0) ||
      (rec.continues && rec.continues.length > 0);
    if (!hasChips && (!rec.whyItMatters || rec.whyItMatters.trim() === '')) {
      warnings.push(
        `⚠ Low Narrative Continuity Context: Must Watch item '${rec.content.title}' lacks character/lore tags.`
      );
    }
  }

  for (const rec of [...result.recommended, ...result.optional]) {
    rulesEvaluated++;
    if (!rec.reason || rec.reason.trim() === '') {
      warnings.push(
        `⚠ Missing Narrative Rationale: Recommendation '${rec.content.title}' (${rec.category}) has no explanation.`
      );
    }
  }

  // Rule 7: Empty Category Validation
  rulesEvaluated++;
  for (const cat of categories) {
    if (cat.list.length === 0 && !Array.isArray(cat.list)) {
      errors.push(`❌ Invalid Empty Category Format: '${cat.name}' is not an array.`);
    }
  }

  // Rule 8: Watch Time Validation
  rulesEvaluated++;
  const expectedWatchTime = [...result.mustWatch, ...result.recommended]
    .filter((r) => !r.isWatched)
    .reduce((sum, r) => sum + (r.content.runtime || 120), 0);

  if (result.estimatedWatchTimeMinutes !== expectedWatchTime) {
    errors.push(
      `❌ Invalid Watch Time: Expected ${expectedWatchTime} minutes (Must Watch + Recommended), actual reported ${result.estimatedWatchTimeMinutes} minutes.`
    );
  }

  // Rule 9: Readiness Validation
  rulesEvaluated++;
  const unwatchedMustWatch = result.mustWatch.filter((r) => !r.isWatched);
  if (unwatchedMustWatch.length > 0 && result.storyReadinessPercentage === 100) {
    errors.push(
      `❌ Invalid Story Readiness: Readiness reported as 100% despite ${unwatchedMustWatch.length} unwatched Must Watch prerequisites.`
    );
  }

  // Rule 10: Spoiler Safety
  rulesEvaluated++;
  for (const rec of [...result.mustWatch, ...result.recommended, ...result.optional]) {
    if (rec.spoilerFreeExplanation && rec.spoilerFreeExplanation.toLowerCase().includes('spoiler alert')) {
      warnings.push(`⚠ Spoiler Alert Warning in Context: '${rec.content.title}' contains potential spoiler language.`);
    }
  }

  // Rule 11: Recommendation Inflation Audit
  rulesEvaluated++;
  if (result.mustWatch.length > 5) {
    warnings.push(
      `⚠ Recommendation Inflation Warning: Target '${result.targetContent.title}' has ${result.mustWatch.length} Must Watch prerequisites.`
    );
  }

  // Rule 12: Franchise Isolation Audit
  rulesEvaluated++;
  const targetFranchise = result.targetContent.franchise_id;
  for (const rec of [...result.mustWatch, ...result.recommended, ...result.optional]) {
    if (rec.content.franchise_id !== targetFranchise && !rec.reason.toLowerCase().includes('crossover')) {
      warnings.push(
        `⚠ Cross-Franchise Recommendation: '${rec.content.title}' (${rec.content.franchise_id}) recommended for '${result.targetContent.title}' (${targetFranchise}).`
      );
    }
  }

  // Rule 13: Post-Credit Isolation & Non-Inflation Audit
  rulesEvaluated++;
  if (result.postCreditContext && result.postCreditContext.length > 0) {
    for (const pcRec of result.postCreditContext) {
      if (pcRec.category === 'must_watch') {
        errors.push(
          `❌ Post-Credit Policy Violation: Post-credit item '${pcRec.content.title}' cannot be categorized as Must Watch.`
        );
      }
      if (seenMap.has(pcRec.content.id)) {
        errors.push(
          `❌ Post-Credit Leakage Error: '${pcRec.content.title}' (${pcRec.content.id}) appears in both Post-Credit Context and '${seenMap.get(
            pcRec.content.id
          )}'.`
        );
      }
    }
  }

  // Rule 14: Narrative Scope Isolation Audit
  rulesEvaluated++;
  if (result.postCreditContext) {
    for (const pcRec of result.postCreditContext) {
      // Must not be present in main prerequisite count
      if (result.mustWatch.some((r) => r.content.id === pcRec.content.id) ||
          result.recommended.some((r) => r.content.id === pcRec.content.id) ||
          result.optional.some((r) => r.content.id === pcRec.content.id)) {
        errors.push(
          `❌ Rule 14 Violation — Narrative Scope Leakage: '${pcRec.content.title}' (post-credit) leaked into main feature recommendation lists.`
        );
      }
    }
  }

  return {
    passed: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
    rulesEvaluated,
  };
}
