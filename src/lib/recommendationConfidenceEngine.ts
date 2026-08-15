import type { CKGEdgeConfidence } from '@/data/cineOrderKnowledgeGraph';

export interface RecommendationConfidenceEvaluation {
  confidenceScore: number;
  confidenceLevel: 'High' | 'Moderate' | 'Low';
  edgeConfidence: CKGEdgeConfidence;
  consensusCount: number;
  factors: {
    baseConfidenceWeight: number;
    depthPenalty: number;
    consensusBonus: number;
  };
}

/**
  Separation of Concern: Evaluates structural confidence in a recommendation,
  decoupled from editorial narrative scoring.
 */
export function evaluateRecommendationConfidence(
  edgeConfidence: CKGEdgeConfidence = 'confirmed',
  traversalDepth: number = 0,
  incomingEdgeCount: number = 1
): RecommendationConfidenceEvaluation {
  const baseScores: Record<CKGEdgeConfidence, number> = {
    confirmed: 95,
    'strongly-implied': 85,
    likely: 75,
    provisional: 60,
    limited: 55,
  };

  const baseConfidenceWeight = baseScores[edgeConfidence] ?? 80;
  const depthPenalty = Math.min(30, traversalDepth * 10);
  const consensusBonus = Math.min(15, (incomingEdgeCount - 1) * 5);

  const rawScore = baseConfidenceWeight - depthPenalty + consensusBonus;
  const confidenceScore = Math.min(100, Math.max(10, Math.round(rawScore)));

  const confidenceLevel: RecommendationConfidenceEvaluation['confidenceLevel'] =
    confidenceScore >= 80 ? 'High' : confidenceScore >= 60 ? 'Moderate' : 'Low';

  return {
    confidenceScore,
    confidenceLevel,
    edgeConfidence,
    consensusCount: incomingEdgeCount,
    factors: {
      baseConfidenceWeight,
      depthPenalty,
      consensusBonus,
    },
  };
}
