import { executeKnowledgeGraphTraversal } from './storyKnowledgeGraphEngine';
import type { CategoryType } from '@/types/preparation';

export interface ScoreStabilityBenchmark {
  targetId: string;
  sourceId: string;
  sourceTitle: string;
  expectedMinScore: number;
  expectedMaxScore: number;
  expectedCategory: CategoryType;
}

export interface CalibrationReport {
  valid: boolean;
  totalBenchmarks: number;
  passedBenchmarks: number;
  failedBenchmarks: number;
  discrepancies: Array<{
    targetId: string;
    sourceId: string;
    sourceTitle: string;
    actualScore?: number;
    expectedRange: string;
    actualCategory?: string;
    expectedCategory: string;
    reason: string;
  }>;
}

export const SCORE_STABILITY_BENCHMARKS: ScoreStabilityBenchmark[] = [
  // Black Widow Benchmarks
  {
    targetId: 'mcu-black-widow',
    sourceId: 'mcu-civil-war',
    sourceTitle: 'Captain America: Civil War',
    expectedMinScore: 96.0,
    expectedMaxScore: 100.0,
    expectedCategory: 'must_watch',
  },
  {
    targetId: 'mcu-black-widow',
    sourceId: 'mcu-avengers',
    sourceTitle: 'The Avengers',
    expectedMinScore: 65.0,
    expectedMaxScore: 78.0,
    expectedCategory: 'optional',
  },
  {
    targetId: 'mcu-black-widow',
    sourceId: 'mcu-winter-soldier',
    sourceTitle: 'Captain America: The Winter Soldier',
    expectedMinScore: 65.0,
    expectedMaxScore: 78.0,
    expectedCategory: 'optional',
  },
  // NOTE: Iron Man 2 → Black Widow benchmark removed. Edge deleted by editorial review 2026-08-05.
  // Rationale: Natasha franchise debut cameo only; no plot/character/world dependency on Red Room storyline.

  // Falcon & Winter Soldier Benchmarks
  {
    targetId: 'mcu-tfatws',
    sourceId: 'mcu-civil-war',
    sourceTitle: 'Captain America: Civil War',
    expectedMinScore: 90.0,
    expectedMaxScore: 100.0,
    expectedCategory: 'must_watch',
  },
  {
    targetId: 'mcu-tfatws',
    sourceId: 'mcu-endgame',
    sourceTitle: 'Avengers: Endgame',
    expectedMinScore: 90.0,
    expectedMaxScore: 100.0,
    expectedCategory: 'must_watch',
  },
  {
    targetId: 'mcu-tfatws',
    sourceId: 'mcu-infinity-war',
    sourceTitle: 'Avengers: Infinity War',
    expectedMinScore: 60.0,
    expectedMaxScore: 76.0,
    expectedCategory: 'optional',
  },
  {
    targetId: 'mcu-tfatws',
    sourceId: 'mcu-winter-soldier',
    sourceTitle: 'Captain America: The Winter Soldier',
    expectedMinScore: 78.0,
    expectedMaxScore: 88.0,
    expectedCategory: 'recommended',
  },
];

export function validatePolicyCalibration(): CalibrationReport {
  const discrepancies: CalibrationReport['discrepancies'] = [];
  let passed = 0;

  for (const b of SCORE_STABILITY_BENCHMARKS) {
    const res = executeKnowledgeGraphTraversal(b.targetId);
    if (!res) {
      discrepancies.push({
        targetId: b.targetId,
        sourceId: b.sourceId,
        sourceTitle: b.sourceTitle,
        expectedRange: `[${b.expectedMinScore}, ${b.expectedMaxScore}]`,
        expectedCategory: b.expectedCategory,
        reason: `Target ${b.targetId} could not be resolved by traversal engine.`,
      });
      continue;
    }

    const allRecs = [
      ...res.mustWatch,
      ...res.recommended,
      ...res.optional,
      ...res.postCreditContext,
      ...res.safeToSkip,
    ];

    const cleanSource = b.sourceId.replace(/-/g, '').toLowerCase();

    const item = allRecs.find(
      (r) =>
        r.content.id === b.sourceId ||
        r.content.id.replace(/-/g, '').toLowerCase() === cleanSource
    );

    if (!item) {
      discrepancies.push({
        targetId: b.targetId,
        sourceId: b.sourceId,
        sourceTitle: b.sourceTitle,
        expectedRange: `[${b.expectedMinScore}, ${b.expectedMaxScore}]`,
        expectedCategory: b.expectedCategory,
        reason: `Source title ${b.sourceTitle} missing from traversal result.`,
      });
      continue;
    }

    const score = item.decisionPath?.narrativeScore ?? 0;
    const category = item.category;

    const isScoreValid = score >= b.expectedMinScore && score <= b.expectedMaxScore;
    const isCategoryValid = category === b.expectedCategory;

    if (isScoreValid && isCategoryValid) {
      passed++;
    } else {
      discrepancies.push({
        targetId: b.targetId,
        sourceId: b.sourceId,
        sourceTitle: b.sourceTitle,
        actualScore: score,
        expectedRange: `[${b.expectedMinScore}, ${b.expectedMaxScore}]`,
        actualCategory: category,
        expectedCategory: b.expectedCategory,
        reason: !isCategoryValid
          ? `Category mismatch: expected '${b.expectedCategory}', got '${category}'`
          : `Score instability: expected range [${b.expectedMinScore}, ${b.expectedMaxScore}], got ${score}`,
      });
    }
  }

  return {
    valid: discrepancies.length === 0,
    totalBenchmarks: SCORE_STABILITY_BENCHMARKS.length,
    passedBenchmarks: passed,
    failedBenchmarks: discrepancies.length,
    discrepancies,
  };
}
