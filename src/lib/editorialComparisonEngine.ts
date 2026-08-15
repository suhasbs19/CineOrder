/**
 * CineOrder Editorial Comparison Engine
 *
 * Measures how closely the Knowledge Graph recommendation engine naturally matches
 * the editorial policy defined in editorialOverrides.ts.
 *
 * Iterates ALL Knowledge Graph title nodes (not just those with overrides) to ensure
 * unbiased coverage — detecting both unnecessary overrides and titles that may need them.
 *
 * Key outputs:
 *  - Per-title EditorialComparisonReport with full decision path diffs
 *  - Global report with Precision/Recall/F1 per bucket
 *  - Relationship Confusion Matrix
 *  - Engine Drift Score (category distance)
 *  - Coverage Report (quantifies override value)
 *  - Override Confidence Classification (Necessary → Definitely Removable)
 *  - Calibration Suggestions with Critical/High/Medium/Low priority
 *  - Calibration Simulation (in-memory, no code changes)
 *  - Markdown Report + CSV Export
 *  - Regression Mode (accuracy trend across runs)
 */

import {
  executeKnowledgeGraphTraversal,
  executeKnowledgeGraphTraversalRaw,
  normalizeCkgId,
} from './storyKnowledgeGraphEngine';
import { cineOrderKnowledgeGraph } from '@/data/cineOrderKnowledgeGraph';
import { EDITORIAL_OVERRIDES } from '@/data/editorialOverrides';
import { allContent } from '@/data/franchises';
import type { CategoryType } from '@/types/preparation';
import type { PreparationRecommendation } from '@/types/preparation';

// ---------------------------------------------------------------------------
// Category Distance — the foundation of the Drift Score
// ---------------------------------------------------------------------------

/**
 * Ordered distance values for each category.
 * Must Watch (4) → Safe To Skip (0).
 * Drift = |engineDistance − editorialDistance|
 * Range: 0 (exact match) → 4 (Must Watch vs Safe To Skip)
 */
export const CATEGORY_DISTANCE: Record<CategoryType, number> = {
  must_watch:   4,
  recommended:  3,
  optional:     2,
  post_credit:  1,
  safe_to_skip: 0,
};

function categoryDrift(a: CategoryType, b: CategoryType): number {
  return Math.abs((CATEGORY_DISTANCE[a] ?? 2) - (CATEGORY_DISTANCE[b] ?? 2));
}

// ---------------------------------------------------------------------------
// Score breakdown extracted from decisionPath
// ---------------------------------------------------------------------------

export interface ScoreBreakdown {
  edgeStrength:        number;
  relationship:        number;
  protagonistOverlap:  number;
  narrativeImportance: number;
  depth:               number;
  total:               number;
}

function extractBreakdown(rec: PreparationRecommendation): ScoreBreakdown {
  const bd = rec.decisionPath?.contributionBreakdown;
  return {
    edgeStrength:        bd?.edgeStrength        ?? 0,
    relationship:        bd?.relationship        ?? 0,
    protagonistOverlap:  bd?.protagonist         ?? 0,
    narrativeImportance: bd?.narrativeImportance ?? 0,
    depth:               bd?.depth               ?? 0,
    total:               bd?.totalScore          ?? rec.relevanceScore,
  };
}

// ---------------------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------------------

/** Which 5-signal component most explains the engine/editorial mismatch. */
export type MismatchSignal =
  | 'edgeStrength'
  | 'relationship'
  | 'depth'
  | 'protagonistOverlap'
  | 'narrativeImportance'
  | 'none';

/** Confidence that an editorial override can be safely removed. */
export type OverrideConfidence =
  | 'Necessary'
  | 'Likely Necessary'
  | 'Probably Removable'
  | 'Definitely Removable';

/** Priority of a calibration suggestion. */
export type CalibrationPriority = 'Critical' | 'High' | 'Medium' | 'Low';

// ---------------------------------------------------------------------------
// Difference per recommendation
// ---------------------------------------------------------------------------

export interface RecommendationDifference {
  sourceId:    string;
  sourceTitle: string;

  // Raw engine output
  engineCategory:       CategoryType;
  engineStrength:       string;
  engineRelationship:   string;
  engineScore:          number;
  engineConfidence:     string;
  engineScoreBreakdown: ScoreBreakdown;

  // Editorial output (with overrides)
  editorialCategory:     CategoryType;
  editorialStrength:     string;
  editorialRelationship: string;
  editorialScore:        number;
  editorialConfidence:   string;

  // Comparison
  matches:      boolean;
  categoryDiff: boolean;
  strengthDiff: boolean;
  scoreDelta:   number;   // engineScore − editorialScore (signed)
  driftScore:   number;   // |CATEGORY_DISTANCE[engine] − CATEGORY_DISTANCE[editorial]|

  /**
   * True when this item was injected solely by the editorial override layer —
   * BFS never reached it. These are excluded from engine accuracy calculations
   * because the engine was never capable of finding them via graph traversal.
   */
  isOverrideInjected: boolean;

  // Root cause
  dominantMismatchSignal: MismatchSignal;
  explanation:  string;
  suggestedFix: string;
}

// ---------------------------------------------------------------------------
// Per-title report
// ---------------------------------------------------------------------------

export interface EditorialComparisonReport {
  targetId:             string;
  targetTitle:          string;
  hasEditorialOverride: boolean;

  /** Accuracy over engine-found items only (excludes override-injected additions). */
  accuracy:     number;
  averageDrift: number;
  maxDrift:     number;
  precision:    Partial<Record<CategoryType, number>>;
  recall:       Partial<Record<CategoryType, number>>;
  f1:           Partial<Record<CategoryType, number>>;

  /** Recommendations the raw BFS engine found and categorised. */
  engineFoundCount:        number;
  /** Recommendations added purely by the override layer (not reachable via BFS). */
  overrideInjectedCount:   number;

  totalRecommendations:    number;  // engineFoundCount + overrideInjectedCount
  matchingRecommendations: number;  // within engine-found set
  mismatches:              number;  // within engine-found set
  differences:             RecommendationDifference[];
}

// ---------------------------------------------------------------------------
// Global aggregation types
// ---------------------------------------------------------------------------

export interface RelationshipStat {
  relationship:  string;
  totalCount:    number;
  matchCount:    number;
  mismatchCount: number;
  accuracy:      number;
  totalDrift:    number;
  avgDrift:      number;
}

export interface StrengthStat {
  strength:      string;
  totalCount:    number;
  matchCount:    number;
  mismatchCount: number;
  accuracy:      number;
  totalDrift:    number;
  avgDrift:      number;
}

export interface ScoreHeatmapRow {
  relationship:       string;
  avgEngineScore:     number;
  avgEditorialScore:  number;
  scoreDelta:         number;
  sampleCount:        number;
}

export interface ConfusionMatrixRow {
  relationship:      string;
  engineCategory:    CategoryType;
  editorialCategory: CategoryType;
  count:             number;
  totalDrift:        number;
  avgDrift:          number;
}

export interface OverrideAnalysisRow {
  targetId:            string;
  targetTitle:         string;
  sourceId:            string;
  sourceTitle:         string;
  overrideCategory:    CategoryType;
  engineWouldProduce:  CategoryType | 'absent';
  changedAnything:     boolean;
  drift:               number;
  confidence:          OverrideConfidence;
  reason:              string;
}

export interface SimulationResult {
  originalAccuracy:  number;
  simulatedAccuracy: number;
  delta:             number;
  description:       string;
}

export interface CalibrationSuggestion {
  priority:                CalibrationPriority;
  signal:                  MismatchSignal;
  key:                     string;
  currentValue:            number;
  suggestedDelta:          number;
  supportingMismatchCount: number;
  totalDrift:              number;
  avgDrift:                number;
  estimatedAccuracyGain:   number;
  simulation?:             SimulationResult;
}

export interface CoverageReport {
  titlesAnalyzed:         number;
  titlesWithOverrides:    number;
  titlesWithoutOverrides: number;

  /**
   * How many recommendations the raw engine found across all titles.
   * Override-injected items are excluded from this count.
   */
  totalEngineFound:      number;
  /** How many of those the engine categorised the same as editorial intent. */
  totalEngineMatches:    number;
  /** How many recommendations were injected purely by override rules (not BFS-reachable). */
  totalOverrideInjected: number;

  /**
   * True engine accuracy = totalEngineMatches / totalEngineFound.
   * Not split by with/without-override title groups (the old tautological split is removed).
   */
  engineAccuracy:              number;
  /**
   * Of the 24 override-bearing titles only: engine accuracy over BFS-found items.
   * Shows how accurate the engine is on exactly the titles overrides were written for.
   */
  engineAccuracyOnOverrideTitles:    number;
  /**
   * Of the 86 titles with no overrides: always 100% by construction (engine IS the result).
   * Retained for completeness but noted as tautological.
   */
  engineAccuracyOnNonOverrideTitles: number;

  /** improvementFromOverrides is retired — overrides don't improve accuracy, they change output. */
}

export const SYSTEM_VERSIONS = {
  knowledgeGraph: '3.4',
  traversal:      '2.1',
  policy:         '6.2',
  comparison:     '1.0',
};

export const KNOWLEDGE_GRAPH_VERSION   = SYSTEM_VERSIONS.knowledgeGraph;
export const TRAVERSAL_VERSION         = SYSTEM_VERSIONS.traversal;
export const POLICY_VERSION            = SYSTEM_VERSIONS.policy;
export const COMPARISON_ENGINE_VERSION = SYSTEM_VERSIONS.comparison;

/** Data-driven engine health status based on measurable accuracy & drift thresholds */
export function deriveEngineStatus(
  accuracy: number,
  drift: number
): 'Excellent' | 'Healthy' | 'Stable' | 'Unstable' | 'Needs Calibration' {
  if (drift > 1.0) return 'Unstable';
  if (accuracy >= 98 && drift <= 0.05) return 'Excellent';
  if (accuracy >= 95 && drift <= 0.15) return 'Healthy';
  if (accuracy >= 90) return 'Stable';
  return 'Needs Calibration';
}

export interface ReportMetadata {
  generatedAt:              string;
  knowledgeGraphVersion:   string;
  traversalVersion:        string;
  policyVersion:           string;
  comparisonEngineVersion: string;
  gitCommit:               string;
  durationMs:              number;
  formattedDuration:       string;
}

export interface OverrideEffectiveness {
  totalOverrides:     number;
  activeOverrides:    number;
  redundantOverrides: number;
  effectiveness:     number; // % (active / total)
}

export interface OverrideStability {
  previousActiveCount?: number;
  currentActiveCount:   number;
  activeDelta?:         number;
  newlyRedundant:       number;
  newlyNecessary:       number;
}

export interface GlobalEditorialComparisonReport {
  generatedAt:  string;
  metadata:     ReportMetadata;
  coverageReport: CoverageReport;
  overrideEffectiveness: OverrideEffectiveness;
  overrideStability: OverrideStability;

  overallAccuracy:  number;
  overallDrift:     number;
  globalPrecision:  Partial<Record<CategoryType, number>>;
  globalRecall:     Partial<Record<CategoryType, number>>;
  globalF1:         Partial<Record<CategoryType, number>>;

  titlesAnalyzed:          number;
  totalRecommendations:    number;
  matchingRecommendations: number;
  mismatches:              number;

  relationshipStats:      RelationshipStat[];
  strengthStats:          StrengthStat[];
  scoreHeatmap:           ScoreHeatmapRow[];
  confusionMatrix:        ConfusionMatrixRow[];
  overrideAnalysis:       OverrideAnalysisRow[];
  calibrationSuggestions: CalibrationSuggestion[];
  targetReports:          EditorialComparisonReport[];

  previousAccuracy?: number;
  accuracyTrend?:    '+' | '-' | '=';
  accuracyDelta?:    number;
  previousDrift?:    number;
  driftTrend?:       '+' | '-' | '=';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ALL_CATEGORIES: CategoryType[] = [
  'must_watch', 'recommended', 'optional', 'post_credit', 'safe_to_skip',
];

/** Build a lookup map: normalizedSourceId → PreparationRecommendation across all buckets */
function buildSourceMap(
  result: ReturnType<typeof executeKnowledgeGraphTraversal>
): Map<string, PreparationRecommendation> {
  const map = new Map<string, PreparationRecommendation>();
  if (!result) return map;
  const all: PreparationRecommendation[] = [
    ...result.mustWatch,
    ...result.recommended,
    ...result.optional,
    ...result.postCreditContext,
    ...result.safeToSkip,
  ];
  for (const rec of all) {
    map.set(normalizeCkgId(rec.content.id), rec);
  }
  return map;
}

/**
 * Identify which 5-signal component diverges most from the editorial expected score.
 * Uses proportional deviation: how much would each component need to change to reach editorialScore?
 */
function dominantSignal(
  bd: ScoreBreakdown,
  editorialScore: number
): MismatchSignal {
  if (bd.total === editorialScore) return 'none';

  const weights: Record<MismatchSignal, number> = {
    edgeStrength:        0.40,
    relationship:        0.20,
    protagonistOverlap:  0.15,
    narrativeImportance: 0.15,
    depth:               0.10,
    none:                0,
  };

  const scale = bd.total !== 0 ? editorialScore / bd.total : 1;
  let best: MismatchSignal = 'none';
  let bestVal = 0;

  const contribs: Record<MismatchSignal, number> = {
    edgeStrength:        bd.edgeStrength,
    relationship:        bd.relationship,
    protagonistOverlap:  bd.protagonistOverlap,
    narrativeImportance: bd.narrativeImportance,
    depth:               bd.depth,
    none:                0,
  };

  for (const [sig, contrib] of Object.entries(contribs) as [MismatchSignal, number][]) {
    if (sig === 'none') continue;
    const delta = Math.abs(contrib - contrib * scale);
    const weighted = delta * (weights[sig] ?? 0);
    if (weighted > bestVal) { bestVal = weighted; best = sig; }
  }
  return best;
}

function buildExplanation(diff: Omit<RecommendationDifference, 'explanation' | 'suggestedFix'>): string {
  if (diff.matches) return 'Engine and editorial agree.';
  const parts: string[] = [];
  if (diff.categoryDiff) {
    parts.push(`Category: engine=${diff.engineCategory} editorial=${diff.editorialCategory} (drift ${diff.driftScore})`);
  }
  if (diff.strengthDiff) {
    parts.push(`Strength: engine=${diff.engineStrength} editorial=${diff.editorialStrength}`);
  }
  if (diff.scoreDelta !== 0) {
    const dir = diff.scoreDelta > 0 ? 'over-scores' : 'under-scores';
    parts.push(
      `Score: engine=${diff.engineScore.toFixed(1)} editorial=${diff.editorialScore.toFixed(1)} ` +
      `(engine ${dir} by ${Math.abs(diff.scoreDelta).toFixed(1)}pts)`
    );
  }
  return parts.join('. ');
}

function buildSuggestedFix(diff: Omit<RecommendationDifference, 'explanation' | 'suggestedFix'>): string {
  if (diff.matches) return '';
  const direction = diff.scoreDelta > 0 ? 'Reduce' : 'Increase';
  const abs = Math.abs(diff.scoreDelta).toFixed(1);
  switch (diff.dominantMismatchSignal) {
    case 'edgeStrength':        return `${direction} edge strength weight for '${diff.engineStrength}' by ~${abs}pts.`;
    case 'relationship':        return `${direction} relationship score for '${diff.engineRelationship}' by ~${abs}pts.`;
    case 'depth':               return `${direction} depth penalty multiplier by ~${abs}pts.`;
    case 'protagonistOverlap':  return `${direction} protagonist overlap score to better reflect editorial intent.`;
    case 'narrativeImportance': return `${direction} narrative importance weight by ~${abs}pts.`;
    default:                    return `${direction} overall scoring by ~${abs}pts for this relationship/strength combination.`;
  }
}

function calcPrecisionRecallF1(
  diffs: RecommendationDifference[],
  category: CategoryType
): { precision: number; recall: number; f1: number } {
  const tp = diffs.filter((d) => d.engineCategory === category && d.editorialCategory === category).length;
  const fp = diffs.filter((d) => d.engineCategory === category && d.editorialCategory !== category).length;
  const fn = diffs.filter((d) => d.engineCategory !== category && d.editorialCategory === category).length;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall    = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1        = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  return {
    precision: Math.round(precision * 1000) / 10,
    recall:    Math.round(recall    * 1000) / 10,
    f1:        Math.round(f1        * 1000) / 10,
  };
}

function overrideConfidenceFromDrift(drift: number, absent: boolean): OverrideConfidence {
  if (absent || drift >= 3) return 'Necessary';
  if (drift === 2)          return 'Likely Necessary';
  if (drift === 1)          return 'Probably Removable';
  return 'Definitely Removable';
}

function calibrationPriority(mismatchCount: number, avgDrift: number): CalibrationPriority {
  if (mismatchCount >= 20 || avgDrift >= 2.5) return 'Critical';
  if (mismatchCount >= 10 || avgDrift >= 1.5) return 'High';
  if (mismatchCount >= 5)                     return 'Medium';
  return 'Low';
}

// ---------------------------------------------------------------------------
// compareEngineWithEditorial — single target
// ---------------------------------------------------------------------------

/**
 * Runs dual traversal (raw + editorial) for one target title and produces a
 * full decision path diff including drift scores and Precision/Recall/F1 per bucket.
 */
export function compareEngineWithEditorial(targetId: string): EditorialComparisonReport | null {
  const rawResult  = executeKnowledgeGraphTraversalRaw(targetId, []);
  const editResult = executeKnowledgeGraphTraversal(targetId, []);
  if (!editResult) return null;

  const targetTitle        = editResult.targetContent.title;
  const normId             = normalizeCkgId(targetId);
  const hasEditorialOverride = Boolean(EDITORIAL_OVERRIDES[normId] || EDITORIAL_OVERRIDES[targetId]);

  const rawMap  = buildSourceMap(rawResult);
  const editMap = buildSourceMap(editResult);

  // Union of all source IDs seen in either result
  const allSourceIds = new Set([...rawMap.keys(), ...editMap.keys()]);
  const differences: RecommendationDifference[] = [];

  for (const srcId of allSourceIds) {
    const rawRec  = rawMap.get(srcId);
    const editRec = editMap.get(srcId);

    const engineCat:       CategoryType = rawRec?.category  ?? 'safe_to_skip';
    const editorialCat:    CategoryType = editRec?.category ?? 'safe_to_skip';
    const engineStrength               = rawRec?.decisionPath?.governingEdge?.strength       ?? 'weak';
    const editorialStrength            = editRec?.decisionPath?.governingEdge?.strength      ?? 'weak';
    const engineRelationship           = rawRec?.decisionPath?.governingEdge?.relationship   ?? 'same-universe-only';
    const editorialRelationship        = editRec?.decisionPath?.governingEdge?.relationship  ?? 'same-universe-only';
    const engineScore                  = rawRec?.decisionPath?.narrativeScore  ?? rawRec?.relevanceScore  ?? 0;
    const editorialScore               = editRec?.decisionPath?.narrativeScore ?? editRec?.relevanceScore ?? 0;
    const engineConf                   = rawRec?.confidence  ?? 'limited';
    const editorialConf                = editRec?.confidence ?? 'limited';
    const breakdown                    = rawRec ? extractBreakdown(rawRec) : {
      edgeStrength: 0, relationship: 0, protagonistOverlap: 0, narrativeImportance: 0, depth: 0, total: 0,
    };

    const matches      = engineCat === editorialCat;
    const categoryDiff = !matches;
    const strengthDiff = engineStrength !== editorialStrength;
    const scoreDelta   = Math.round((engineScore - editorialScore) * 10) / 10;
    const driftScore   = categoryDrift(engineCat, editorialCat);
    const sourceTitle  = rawRec?.content.title ?? editRec?.content.title ?? srcId;

    const domSignal: MismatchSignal = !matches ? dominantSignal(breakdown, editorialScore) : 'none';

    const isOverrideInjected = rawRec === undefined; // only in editMap → added by override layer

    const partial: Omit<RecommendationDifference, 'explanation' | 'suggestedFix'> = {
      sourceId: srcId,
      sourceTitle,
      engineCategory: engineCat,
      engineStrength,
      engineRelationship,
      engineScore:    Math.round(engineScore    * 10) / 10,
      engineConfidence: engineConf,
      engineScoreBreakdown: breakdown,
      editorialCategory: editorialCat,
      editorialStrength,
      editorialRelationship,
      editorialScore: Math.round(editorialScore * 10) / 10,
      editorialConfidence: editorialConf,
      matches,
      categoryDiff,
      strengthDiff,
      scoreDelta,
      driftScore,
      isOverrideInjected,
      dominantMismatchSignal: domSignal,
    };

    differences.push({
      ...partial,
      explanation:  buildExplanation(partial),
      suggestedFix: buildSuggestedFix(partial),
    });
  }

  // Split into engine-found vs override-injected
  // Engine-found: items rawMap actually produced via BFS (rawRec !== undefined)
  // Override-injected: items only in editMap, added by the override layer — engine could not find these
  const engineFoundDiffs   = differences.filter((d) => !d.isOverrideInjected);
  const overrideInjected   = differences.filter((d) =>  d.isOverrideInjected);

  // Accuracy is computed only over engine-found items — override-injected items are
  // not a fair test of engine accuracy because they were never reachable via BFS.
  const matching   = engineFoundDiffs.filter((d) => d.matches).length;
  const total      = engineFoundDiffs.length;
  const mismatches = total - matching;
  const accuracy   = total > 0 ? Math.round((matching / total) * 1000) / 10 : 100;

  const drifts    = engineFoundDiffs.map((d) => d.driftScore);
  const avgDrift  = drifts.length > 0 ? Math.round((drifts.reduce((a, b) => a + b, 0) / drifts.length) * 100) / 100 : 0;
  const maxDrift  = drifts.length > 0 ? Math.max(...drifts) : 0;

  const precision: Partial<Record<CategoryType, number>> = {};
  const recall:    Partial<Record<CategoryType, number>> = {};
  const f1:        Partial<Record<CategoryType, number>> = {};
  for (const cat of ALL_CATEGORIES) {
    const stats = calcPrecisionRecallF1(engineFoundDiffs, cat);
    precision[cat] = stats.precision;
    recall[cat]    = stats.recall;
    f1[cat]        = stats.f1;
  }

  return {
    targetId,
    targetTitle,
    hasEditorialOverride,
    accuracy,
    averageDrift: avgDrift,
    maxDrift,
    precision,
    recall,
    f1,
    engineFoundCount:        total,
    overrideInjectedCount:   overrideInjected.length,
    totalRecommendations:    differences.length,
    matchingRecommendations: matching,
    mismatches,
    differences,
  };
}

// ---------------------------------------------------------------------------
// compareEntireKnowledgeGraph — iterates ALL KG title nodes
// ---------------------------------------------------------------------------

/**
 * Iterates ALL Knowledge Graph title nodes (not just titles with overrides) to produce
 * an unbiased global editorial comparison report.
 *
 * Override analysis is performed as a secondary step AFTER comparison, not as the
 * primary iteration source. This prevents analytical bias toward pre-overridden titles.
 */
export function compareEntireKnowledgeGraph(
  providedSnapshot?: AccuracySnapshot,
  options?: { gitCommit?: string; durationMs?: number }
): GlobalEditorialComparisonReport {
  const generatedAt  = new Date().toISOString();
  const titleNodeIds = Object.keys(cineOrderKnowledgeGraph.titleNodes);

  const targetReports:  EditorialComparisonReport[] = [];
  const allDifferences: RecommendationDifference[]  = [];

  let titlesWithOverrides    = 0;
  let titlesWithoutOverrides = 0;

  for (const normId of titleNodeIds) {
    const report = compareEngineWithEditorial(normId);
    if (!report) continue;

    targetReports.push(report);
    allDifferences.push(...report.differences);

    if (report.hasEditorialOverride) titlesWithOverrides++;
    else titlesWithoutOverrides++;
  }

  // Coverage Report — based on engine-found items only (not override-injected)
  let totalEngineFound   = 0;
  let totalEngineMatches = 0;
  let totalOverrideInj   = 0;
  let engineFoundOnOverrideTitles   = 0;
  let engineMatchesOnOverrideTitles = 0;
  let engineFoundOnNonOverrideTitles   = 0;
  let engineMatchesOnNonOverrideTitles = 0;

  for (const r of targetReports) {
    totalEngineFound   += r.engineFoundCount;
    totalEngineMatches += r.matchingRecommendations;
    totalOverrideInj   += r.overrideInjectedCount;
    if (r.hasEditorialOverride) {
      engineFoundOnOverrideTitles   += r.engineFoundCount;
      engineMatchesOnOverrideTitles += r.matchingRecommendations;
    } else {
      engineFoundOnNonOverrideTitles   += r.engineFoundCount;
      engineMatchesOnNonOverrideTitles += r.matchingRecommendations;
    }
  }

  const engineAccuracy = totalEngineFound > 0
    ? Math.round((totalEngineMatches / totalEngineFound) * 1000) / 10 : 100;
  const engineAccuracyOnOverrideTitles = engineFoundOnOverrideTitles > 0
    ? Math.round((engineMatchesOnOverrideTitles / engineFoundOnOverrideTitles) * 1000) / 10 : 100;
  const engineAccuracyOnNonOverrideTitles = engineFoundOnNonOverrideTitles > 0
    ? Math.round((engineMatchesOnNonOverrideTitles / engineFoundOnNonOverrideTitles) * 1000) / 10 : 100;

  const coverageReport: CoverageReport = {
    titlesAnalyzed:              targetReports.length,
    titlesWithOverrides,
    titlesWithoutOverrides,
    totalEngineFound,
    totalEngineMatches,
    totalOverrideInjected:          totalOverrideInj,
    engineAccuracy,
    engineAccuracyOnOverrideTitles,
    engineAccuracyOnNonOverrideTitles,
  };

  // Global accuracy & drift — computed over engine-found items only
  const engineFoundDiffsGlobal  = allDifferences.filter((d) => !d.isOverrideInjected);
  const totalRecs    = engineFoundDiffsGlobal.length;
  const totalMatches = engineFoundDiffsGlobal.filter((d) => d.matches).length;
  const overallAccuracy = totalRecs > 0 ? Math.round((totalMatches / totalRecs) * 1000) / 10 : 100;
  const totalMismatches = totalRecs - totalMatches;

  const allDrifts    = engineFoundDiffsGlobal.map((d) => d.driftScore);
  const overallDrift = allDrifts.length > 0
    ? Math.round((allDrifts.reduce((a, b) => a + b, 0) / allDrifts.length) * 100) / 100 : 0;

  // Global Precision/Recall/F1 — over engine-found diffs only
  const globalPrecision: Partial<Record<CategoryType, number>> = {};
  const globalRecall:    Partial<Record<CategoryType, number>> = {};
  const globalF1:        Partial<Record<CategoryType, number>> = {};
  for (const cat of ALL_CATEGORIES) {
    const s = calcPrecisionRecallF1(engineFoundDiffsGlobal, cat);
    globalPrecision[cat] = s.precision;
    globalRecall[cat]    = s.recall;
    globalF1[cat]        = s.f1;
  }

  // Relationship/Strength/Heatmap/Confusion stats — engine-found diffs only
  const statsBase = engineFoundDiffsGlobal;

  // Relationship Stats
  const relMap = new Map<string, { total: number; match: number; totalDrift: number }>();
  for (const d of statsBase) {
    const key = d.engineRelationship || d.editorialRelationship;
    if (!relMap.has(key)) relMap.set(key, { total: 0, match: 0, totalDrift: 0 });
    const s = relMap.get(key)!;
    s.total++;
    if (d.matches) s.match++;
    s.totalDrift += d.driftScore;
  }
  const relationshipStats: RelationshipStat[] = Array.from(relMap.entries())
    .map(([rel, s]) => ({
      relationship:  rel,
      totalCount:    s.total,
      matchCount:    s.match,
      mismatchCount: s.total - s.match,
      accuracy:      Math.round((s.match / s.total) * 1000) / 10,
      totalDrift:    s.totalDrift,
      avgDrift:      Math.round((s.totalDrift / s.total) * 100) / 100,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  // Strength Stats
  const strMap = new Map<string, { total: number; match: number; totalDrift: number }>();
  for (const d of statsBase) {
    const key = d.engineStrength;
    if (!strMap.has(key)) strMap.set(key, { total: 0, match: 0, totalDrift: 0 });
    const s = strMap.get(key)!;
    s.total++;
    if (d.matches) s.match++;
    s.totalDrift += d.driftScore;
  }
  const strengthStats: StrengthStat[] = Array.from(strMap.entries())
    .map(([str, s]) => ({
      strength:      str,
      totalCount:    s.total,
      matchCount:    s.match,
      mismatchCount: s.total - s.match,
      accuracy:      Math.round((s.match / s.total) * 1000) / 10,
      totalDrift:    s.totalDrift,
      avgDrift:      Math.round((s.totalDrift / s.total) * 100) / 100,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  // Score Heatmap
  const heatMap = new Map<string, { engineScores: number[]; editScores: number[] }>();
  for (const d of statsBase) {
    const key = d.engineRelationship;
    if (!heatMap.has(key)) heatMap.set(key, { engineScores: [], editScores: [] });
    heatMap.get(key)!.engineScores.push(d.engineScore);
    heatMap.get(key)!.editScores.push(d.editorialScore);
  }
  const scoreHeatmap: ScoreHeatmapRow[] = Array.from(heatMap.entries())
    .map(([rel, h]) => {
      const avgE = h.engineScores.reduce((a, b) => a + b, 0) / h.engineScores.length;
      const avgR = h.editScores.reduce((a, b) => a + b, 0)   / h.editScores.length;
      return {
        relationship:      rel,
        avgEngineScore:    Math.round(avgE * 10) / 10,
        avgEditorialScore: Math.round(avgR * 10) / 10,
        scoreDelta:        Math.round((avgE - avgR) * 10) / 10,
        sampleCount:       h.engineScores.length,
      };
    })
    .sort((a, b) => Math.abs(b.scoreDelta) - Math.abs(a.scoreDelta));

  // Confusion Matrix (mismatches only, engine-found)
  const confMap = new Map<string, { count: number; totalDrift: number }>();
  for (const d of statsBase) {
    if (d.matches) continue;
    const key = `${d.engineRelationship}|${d.engineCategory}|${d.editorialCategory}`;
    if (!confMap.has(key)) confMap.set(key, { count: 0, totalDrift: 0 });
    const s = confMap.get(key)!;
    s.count++;
    s.totalDrift += d.driftScore;
  }
  const confusionMatrix: ConfusionMatrixRow[] = Array.from(confMap.entries())
    .map(([key, s]) => {
      const [rel, eng, edit] = key.split('|');
      return {
        relationship:      rel ?? '',
        engineCategory:    (eng  ?? 'safe_to_skip') as CategoryType,
        editorialCategory: (edit ?? 'safe_to_skip') as CategoryType,
        count:             s.count,
        totalDrift:        s.totalDrift,
        avgDrift:          Math.round((s.totalDrift / s.count) * 100) / 100,
      };
    })
    .sort((a, b) => b.count - a.count);

  // Override Analysis — secondary step after comparison, using EDITORIAL_OVERRIDES to classify each rule
  const overrideAnalysis: OverrideAnalysisRow[] = [];
  for (const [overrideTargetId, overrideConfig] of Object.entries(EDITORIAL_OVERRIDES)) {
    const targetReport = targetReports.find(
      (r) => normalizeCkgId(r.targetId) === normalizeCkgId(overrideTargetId)
    );
    for (const rule of overrideConfig.rules) {
      const srcId      = normalizeCkgId(rule.sourceId);
      const srcContent = allContent.find((c) => c.id === rule.sourceId || normalizeCkgId(c.id) === srcId);
      const sourceTitle = srcContent?.title ?? rule.sourceId;

      const diff = targetReport?.differences.find((d) => d.sourceId === srcId);
      const engineWouldProduce: CategoryType | 'absent' = diff?.engineCategory ?? 'absent';
      const overrideCategory: CategoryType = rule.categoryOverride ?? diff?.editorialCategory ?? 'optional';

      const absent         = engineWouldProduce === 'absent';
      const drift          = absent ? 4 : categoryDrift(engineWouldProduce as CategoryType, overrideCategory);
      const changedAnything = drift > 0;

      overrideAnalysis.push({
        targetId:          overrideTargetId,
        targetTitle:       overrideConfig.targetId,
        sourceId:          rule.sourceId,
        sourceTitle,
        overrideCategory,
        engineWouldProduce,
        changedAnything,
        drift,
        confidence:        overrideConfidenceFromDrift(drift, absent),
        reason:            rule.reason,
      });
    }
  }

  const totalOverrides = overrideAnalysis.length;
  const activeOverrides = overrideAnalysis.filter((o) => o.changedAnything).length;
  const redundantOverrides = totalOverrides - activeOverrides;
  const effectiveness = totalOverrides > 0
    ? Math.round((activeOverrides / totalOverrides) * 1000) / 10
    : 0;

  const overrideEffectiveness: OverrideEffectiveness = {
    totalOverrides,
    activeOverrides,
    redundantOverrides,
    effectiveness,
  };

  // Calibration Suggestions — aggregate mismatches by dominant signal + key (engine-found only)
  const sigMap = new Map<
    string,
    { signal: MismatchSignal; key: string; count: number; totalDrift: number; totalScoreDelta: number }
  >();
  for (const d of engineFoundDiffsGlobal) {
    if (d.matches || d.dominantMismatchSignal === 'none') continue;
    const key = d.dominantMismatchSignal === 'relationship' ? d.engineRelationship
              : d.dominantMismatchSignal === 'edgeStrength' ? d.engineStrength
              : d.dominantMismatchSignal;
    const mapKey = `${d.dominantMismatchSignal}:${key}`;
    if (!sigMap.has(mapKey)) sigMap.set(mapKey, { signal: d.dominantMismatchSignal, key, count: 0, totalDrift: 0, totalScoreDelta: 0 });
    const s = sigMap.get(mapKey)!;
    s.count++;
    s.totalDrift       += d.driftScore;
    s.totalScoreDelta  += d.scoreDelta;
  }

  const calibrationSuggestions: CalibrationSuggestion[] = Array.from(sigMap.values())
    .map((s) => {
      const avgDrift      = Math.round((s.totalDrift      / s.count) * 100) / 100;
      const avgDelta      = s.totalScoreDelta / s.count;
      const suggestedDelta = Math.round(-avgDelta * 10) / 10;
      const priority      = calibrationPriority(s.count, avgDrift);
      return {
        priority,
        signal:                  s.signal,
        key:                     s.key,
        currentValue:            0,
        suggestedDelta,
        supportingMismatchCount: s.count,
        totalDrift:              s.totalDrift,
        avgDrift,
        estimatedAccuracyGain:   0,
      };
    })
    .sort((a, b) => {
      const order: Record<CalibrationPriority, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return order[a.priority] - order[b.priority] || b.supportingMismatchCount - a.supportingMismatchCount;
    });

  // Regression Mode & Stability Tracking
  const activeOverrideKeys = overrideAnalysis
    .filter((o) => o.changedAnything)
    .map((o) => `${o.targetId}:${o.sourceId}`);
  const redundantOverrideKeys = overrideAnalysis
    .filter((o) => !o.changedAnything)
    .map((o) => `${o.targetId}:${o.sourceId}`);

  const snapshot = providedSnapshot ?? loadPreviousSnapshot();
  const previousAccuracy = snapshot.previousAccuracy;
  const previousDrift    = snapshot.previousDrift;

  let newlyRedundant = 0;
  let newlyNecessary = 0;
  if (snapshot.activeOverrideKeys) {
    const prevActiveSet = new Set(snapshot.activeOverrideKeys);
    newlyRedundant = redundantOverrideKeys.filter((k) => prevActiveSet.has(k)).length;
  }
  if (snapshot.redundantOverrideKeys) {
    const prevRedundantSet = new Set(snapshot.redundantOverrideKeys);
    newlyNecessary = activeOverrideKeys.filter((k) => prevRedundantSet.has(k)).length;
  }

  const prevActiveCount = snapshot.activeOverrideKeys?.length;
  const currentActiveCount = activeOverrideKeys.length;
  const activeDelta = prevActiveCount !== undefined ? currentActiveCount - prevActiveCount : undefined;

  const overrideStability: OverrideStability = {
    previousActiveCount: prevActiveCount,
    currentActiveCount,
    activeDelta,
    newlyRedundant,
    newlyNecessary,
  };

  saveSnapshot(overallAccuracy, overallDrift, activeOverrideKeys, redundantOverrideKeys);

  let accuracyTrend: '+' | '-' | '=' | undefined;
  let accuracyDelta: number | undefined;
  let driftTrend: '+' | '-' | '=' | undefined;
  if (previousAccuracy !== undefined) {
    accuracyDelta = Math.round((overallAccuracy - previousAccuracy) * 10) / 10;
    accuracyTrend = accuracyDelta > 0 ? '+' : accuracyDelta < 0 ? '-' : '=';
  }
  if (previousDrift !== undefined) {
    const driftDelta = Math.round((overallDrift - previousDrift) * 100) / 100;
    // lower drift = improvement, so '+' means drift went down
    driftTrend = driftDelta < 0 ? '+' : driftDelta > 0 ? '-' : '=';
  }

  const durationMs = options?.durationMs ?? 0;
  const formattedDuration = durationMs >= 1000 ? `${(durationMs / 1000).toFixed(2)}s` : `${durationMs}ms`;
  const metadata: ReportMetadata = {
    generatedAt,
    knowledgeGraphVersion:   KNOWLEDGE_GRAPH_VERSION,
    traversalVersion:        TRAVERSAL_VERSION,
    policyVersion:           POLICY_VERSION,
    comparisonEngineVersion: COMPARISON_ENGINE_VERSION,
    gitCommit:               options?.gitCommit ?? 'head',
    durationMs,
    formattedDuration,
  };

  return {
    generatedAt,
    metadata,
    coverageReport,
    overrideEffectiveness,
    overrideStability,
    overallAccuracy,
    overallDrift,
    globalPrecision,
    globalRecall,
    globalF1,
    titlesAnalyzed:          targetReports.length,
    totalRecommendations:    totalRecs,
    matchingRecommendations: totalMatches,
    mismatches:              totalMismatches,
    relationshipStats,
    strengthStats,
    scoreHeatmap,
    confusionMatrix,
    overrideAnalysis,
    calibrationSuggestions,
    targetReports,
    previousAccuracy,
    accuracyTrend,
    accuracyDelta,
    previousDrift,
    driftTrend,
  };
}

// ---------------------------------------------------------------------------
// Calibration Simulation — in-memory, zero code changes
// ---------------------------------------------------------------------------

/** Relationship score table mirrored from policy v6_2 for simulation */
const BASE_RELATIONSHIP_SCORES: Record<string, number> = {
  'direct-sequel':         100,
  'story-continuation':     90,
  'character-origin':       80,
  'character-development':  70,
  'mentor':                 65,
  'villain-origin':         65,
  'shared-villain':         60,
  'shared-character':       55,
  'shared-event':           60,
  'shared-object':          60,
  'organization':           50,
  'timeline':               65,
  'multiverse':             65,
  'world-building':         50,
  'major-crossover':        75,
  'thematic-callback':      45,
  'same-universe-only':     30,
  'post-credit':            40,
};

const BASE_STRENGTH_SCORES: Record<string, number> = {
  'required':    100,
  'strong':       80,
  'moderate':     60,
  'post-credit':  40,
  'weak':         20,
};

/**
 * Simulates the effect of adjusting relationship or strength scoring weights
 * without modifying any source code. Uses in-memory score table patching.
 *
 * @example
 *   simulateCalibration({ 'story-continuation': +4, 'shared-event': -12 })
 *   // → { originalAccuracy: 94.0, simulatedAccuracy: 97.1, delta: +3.1 }
 */
export function simulateCalibration(overrides: Record<string, number>): SimulationResult {
  const patchedRel = { ...BASE_RELATIONSHIP_SCORES };
  const patchedStr = { ...BASE_STRENGTH_SCORES };
  for (const [key, delta] of Object.entries(overrides)) {
    if (key in patchedRel) patchedRel[key] = (patchedRel[key] ?? 50) + delta;
    if (key in patchedStr) patchedStr[key] = (patchedStr[key] ?? 50) + delta;
  }

  const titleNodeIds = Object.keys(cineOrderKnowledgeGraph.titleNodes);
  let simMatches = 0, simTotal = 0;
  let origMatches = 0, origTotal = 0;

  for (const normId of titleNodeIds) {
    const rawResult  = executeKnowledgeGraphTraversalRaw(normId, []);
    const editResult = executeKnowledgeGraphTraversal(normId, []);
    if (!editResult) continue;

    const rawMap  = buildSourceMap(rawResult);
    const editMap = buildSourceMap(editResult);
    // Only compare items the engine found via BFS (skip override-injected additions)
    const engineSourceIds = new Set(rawMap.keys());

    for (const srcId of engineSourceIds) {
      const rawRec  = rawMap.get(srcId);
      const editRec = editMap.get(srcId);
      const editorialCat: CategoryType = editRec?.category ?? (rawRec?.category ?? 'safe_to_skip');

      origTotal++;
      if ((rawRec?.category ?? 'safe_to_skip') === editorialCat) origMatches++;

      if (rawRec?.decisionPath?.contributionBreakdown) {
        const bd  = rawRec.decisionPath.contributionBreakdown;
        const rel = rawRec.decisionPath.governingEdge.relationship;
        const str = rawRec.decisionPath.governingEdge.strength;

        // Reverse-engineer individual signal inputs from contribution values
        const sScore = patchedStr[str] ?? 50;
        const rScore = patchedRel[rel] ?? 50;
        // bd.protagonist = 0.15 * pScore → pScore = bd.protagonist / 0.15
        const pScore = bd.protagonist         > 0 ? bd.protagonist         / 0.15 : 10;
        const iScore = bd.narrativeImportance > 0 ? bd.narrativeImportance / 0.15 : 50;
        const dScore = bd.depth               > 0 ? bd.depth               / 0.10 : 20;

        const simScore = 0.40 * sScore + 0.20 * rScore + 0.15 * pScore + 0.15 * iScore + 0.10 * dScore;

        let simCat: CategoryType = 'safe_to_skip';
        if (str === 'post-credit' || rel === 'post-credit') simCat = 'post_credit';
        else if (simScore >= 95 || str === 'required')      simCat = 'must_watch';
        else if (simScore >= 78)                            simCat = 'recommended';
        else if (simScore >= 50)                            simCat = 'optional';

        simTotal++;
        if (simCat === editorialCat) simMatches++;
      } else {
        simTotal++;
        if ((rawRec?.category ?? 'safe_to_skip') === editorialCat) simMatches++;
      }
    }
  }

  const originalAccuracy  = origTotal > 0 ? Math.round((origMatches / origTotal) * 1000) / 10 : 100;
  const simulatedAccuracy = simTotal  > 0 ? Math.round((simMatches  / simTotal)  * 1000) / 10 : 100;
  const delta             = Math.round((simulatedAccuracy - originalAccuracy) * 10) / 10;
  const overrideDesc      = Object.entries(overrides)
    .map(([k, v]) => `${k} ${v >= 0 ? '+' : ''}${v}`)
    .join(', ');

  return {
    originalAccuracy,
    simulatedAccuracy,
    delta,
    description: `Simulation: [${overrideDesc}] → ${simulatedAccuracy}% (${delta >= 0 ? '+' : ''}${delta}%)`,
  };
}

// ---------------------------------------------------------------------------
// Regression Mode — accuracy & stability trend persistence
// ---------------------------------------------------------------------------

export interface AccuracySnapshot {
  previousAccuracy?: number;
  previousDrift?: number;
  activeOverrideKeys?: string[];
  redundantOverrideKeys?: string[];
  timestamp?: string;
}

const REGRESSION_STORAGE_KEY = 'cineorder_editorial_accuracy_snapshot';

export function loadPreviousSnapshot(): AccuracySnapshot {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(REGRESSION_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as AccuracySnapshot;
    }
  } catch { /* ignore */ }
  return {};
}

export function saveSnapshot(
  accuracy: number,
  drift: number,
  activeOverrideKeys: string[],
  redundantOverrideKeys: string[]
): void {
  const data: AccuracySnapshot = {
    previousAccuracy: accuracy,
    previousDrift: drift,
    activeOverrideKeys,
    redundantOverrideKeys,
    timestamp: new Date().toISOString(),
  };

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(REGRESSION_STORAGE_KEY, JSON.stringify(data));
    }
  } catch { /* ignore */ }
}

export function loadPreviousAccuracy(): { previousAccuracy?: number; previousDrift?: number } {
  const s = loadPreviousSnapshot();
  return { previousAccuracy: s.previousAccuracy, previousDrift: s.previousDrift };
}

export function saveAccuracy(accuracy: number, drift: number): void {
  saveSnapshot(accuracy, drift, [], []);
}

// ---------------------------------------------------------------------------
// CSV Export
// ---------------------------------------------------------------------------

/**
 * Generates a CSV string from a global report.
 * Columns: target, source, engineCategory, editorialCategory, relationship,
 *          strength, drift, scoreDelta, dominantSignal, suggestedFix
 */
export function generateCSVExport(report: GlobalEditorialComparisonReport): string {
  const header = [
    'target', 'source', 'engineCategory', 'editorialCategory',
    'relationship', 'strength', 'drift', 'scoreDelta', 'dominantSignal', 'suggestedFix',
  ].join(',');

  const rows: string[] = [header];
  for (const tr of report.targetReports) {
    for (const d of tr.differences) {
      rows.push([
        JSON.stringify(tr.targetTitle),
        JSON.stringify(d.sourceTitle),
        d.engineCategory,
        d.editorialCategory,
        d.engineRelationship,
        d.engineStrength,
        String(d.driftScore),
        String(d.scoreDelta),
        d.dominantMismatchSignal,
        JSON.stringify(d.suggestedFix),
      ].join(','));
    }
  }
  return rows.join('\n');
}

// ---------------------------------------------------------------------------
// Markdown Report
// ---------------------------------------------------------------------------

const TREND_ICON: Record<string, string> = { '+': '▲', '-': '▼', '=': '─' };

function categoryLabel(cat: CategoryType | 'absent'): string {
  if (cat === 'absent') return '(absent)';
  switch (cat) {
    case 'must_watch':   return 'Must Watch';
    case 'recommended':  return 'Recommended';
    case 'optional':     return 'Extra Context';
    case 'post_credit':  return 'Post Credit';
    case 'safe_to_skip': return 'Safe To Skip';
    default:             return String(cat);
  }
}

function priorityBadge(p: CalibrationPriority): string {
  switch (p) {
    case 'Critical': return '🔴 Critical';
    case 'High':     return '🟠 High';
    case 'Medium':   return '🟡 Medium';
    case 'Low':      return '🟢 Low';
  }
}

/** Full global markdown report */
export function generateMarkdownReport(report: GlobalEditorialComparisonReport): string {
  const lines: string[] = [];

  lines.push('# CineOrder Editorial Comparison Report');
  lines.push('');
  lines.push('## System Metadata');
  lines.push('');
  lines.push('| System Component | Version / Value |');
  lines.push('|------------------|-----------------|');
  lines.push(`| **Generated** | ${report.metadata.generatedAt.split('T')[0]} |`);
  lines.push(`| **Knowledge Graph** | v${report.metadata.knowledgeGraphVersion} |`);
  lines.push(`| **Traversal Engine** | v${report.metadata.traversalVersion} |`);
  lines.push(`| **Policy Version** | v${report.metadata.policyVersion} |`);
  lines.push(`| **Comparison Engine** | v${report.metadata.comparisonEngineVersion} |`);
  lines.push(`| **Git Commit** | \`${report.metadata.gitCommit}\` |`);
  lines.push(`| **Duration** | ${report.metadata.formattedDuration} |`);
  lines.push('');

  // Regression Trend
  if (report.previousAccuracy !== undefined && report.accuracyTrend && report.accuracyDelta !== undefined) {
    const icon = TREND_ICON[report.accuracyTrend] ?? '';
    lines.push(`> **Regression Trend**: Previous ${report.previousAccuracy}% → Today ${report.overallAccuracy}%  ${icon} ${report.accuracyDelta >= 0 ? '+' : ''}${report.accuracyDelta}%`);
    lines.push('');
  }

  // Global Statistics
  lines.push('## Global Statistics');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Overall Accuracy | **${report.overallAccuracy}%** |`);
  lines.push(`| Overall Drift | ${report.overallDrift} |`);
  lines.push(`| Titles Analysed | ${report.titlesAnalyzed} |`);
  lines.push(`| Total Recommendations | ${report.totalRecommendations} |`);
  lines.push(`| Matching | ${report.matchingRecommendations} |`);
  lines.push(`| Mismatches | ${report.mismatches} |`);
  lines.push('');

  // Coverage Report
  const cr = report.coverageReport;
  lines.push('## Coverage Report');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Titles Analysed | ${cr.titlesAnalyzed} |`);
  lines.push(`| Titles With Overrides | ${cr.titlesWithOverrides} |`);
  lines.push(`| Titles Without Overrides | ${cr.titlesWithoutOverrides} |`);
  lines.push(`| Engine-Found Recommendations | ${cr.totalEngineFound} |`);
  lines.push(`| Override-Injected Recommendations | ${cr.totalOverrideInjected} |`);
  lines.push(`| Engine Accuracy (all titles, BFS-found) | ${cr.engineAccuracy}% |`);
  lines.push(`| Engine Accuracy (override titles only) | ${cr.engineAccuracyOnOverrideTitles}% |`);
  lines.push(`| Engine Accuracy (non-override titles) | ${cr.engineAccuracyOnNonOverrideTitles}% _(tautological)_ |`);
  lines.push('');

  // Precision / Recall / F1
  lines.push('## Precision / Recall / F1 by Category');
  lines.push('');
  lines.push('| Category | Precision | Recall | F1 |');
  lines.push('|----------|-----------|--------|-----|');
  for (const cat of ALL_CATEGORIES) {
    lines.push(`| ${categoryLabel(cat)} | ${report.globalPrecision[cat] ?? 0}% | ${report.globalRecall[cat] ?? 0}% | ${report.globalF1[cat] ?? 0}% |`);
  }
  lines.push('');

  // Relationship Statistics
  lines.push('## Relationship Statistics');
  lines.push('');
  lines.push('| Relationship | Total | Matches | Mismatches | Accuracy | Avg Drift |');
  lines.push('|-------------|-------|---------|------------|----------|-----------|');
  for (const r of report.relationshipStats) {
    lines.push(`| ${r.relationship} | ${r.totalCount} | ${r.matchCount} | ${r.mismatchCount} | ${r.accuracy}% | ${r.avgDrift} |`);
  }
  lines.push('');

  // Strength Statistics
  lines.push('## Strength Statistics');
  lines.push('');
  lines.push('| Strength | Total | Matches | Mismatches | Accuracy | Avg Drift |');
  lines.push('|----------|-------|---------|------------|----------|-----------|');
  for (const s of report.strengthStats) {
    lines.push(`| ${s.strength} | ${s.totalCount} | ${s.matchCount} | ${s.mismatchCount} | ${s.accuracy}% | ${s.avgDrift} |`);
  }
  lines.push('');

  // Score Heatmap
  lines.push('## Score Heatmap');
  lines.push('');
  lines.push('| Relationship | Avg Engine | Avg Editorial | Delta | Samples |');
  lines.push('|-------------|-----------|--------------|-------|---------|');
  for (const h of report.scoreHeatmap) {
    lines.push(`| ${h.relationship} | ${h.avgEngineScore} | ${h.avgEditorialScore} | ${h.scoreDelta >= 0 ? '+' : ''}${h.scoreDelta} | ${h.sampleCount} |`);
  }
  lines.push('');

  // Confusion Matrix
  lines.push('## Relationship Confusion Matrix');
  lines.push('');
  lines.push('| Relationship | Engine | Editorial | Count | Avg Drift |');
  lines.push('|-------------|--------|-----------|-------|-----------|');
  for (const c of report.confusionMatrix.slice(0, 30)) {
    lines.push(`| ${c.relationship} | ${categoryLabel(c.engineCategory)} | ${categoryLabel(c.editorialCategory)} | ${c.count} | ${c.avgDrift} |`);
  }
  lines.push('');

  // Override Analysis
  lines.push('## Override Analysis');
  lines.push('');
  if (report.overrideEffectiveness) {
    const oe = report.overrideEffectiveness;
    lines.push(`### Override Effectiveness: ${oe.effectiveness}%`);
    lines.push(`- **Total Overrides:** ${oe.totalOverrides}`);
    lines.push(`- **Active Overrides:** ${oe.activeOverrides} _(rules that alter engine recommendation)_`);
    lines.push(`- **Redundant Overrides:** ${oe.redundantOverrides} _(rules subsumed by engine, candidate for removal)_`);
    lines.push('');
  }
  lines.push('| Target | Source | Override | Engine | Drift | Confidence | Changed? |');
  lines.push('|--------|--------|----------|--------|-------|------------|---------|');
  for (const o of report.overrideAnalysis) {
    lines.push(`| ${o.targetTitle} | ${o.sourceTitle} | ${categoryLabel(o.overrideCategory)} | ${categoryLabel(o.engineWouldProduce)} | ${o.drift} | ${o.confidence} | ${o.changedAnything ? 'Yes' : 'No'} |`);
  }
  lines.push('');

  // Calibration Suggestions
  lines.push('## Engine Calibration Suggestions');
  lines.push('');
  for (const s of report.calibrationSuggestions) {
    const dir = s.suggestedDelta >= 0 ? 'Increase' : 'Reduce';
    const abs = Math.abs(s.suggestedDelta);
    lines.push(`**${priorityBadge(s.priority)}** — ${dir} \`${s.key}\` (${s.signal}) by ~${abs}pts`);
    lines.push(`> ${s.supportingMismatchCount} mismatches · avgDrift ${s.avgDrift}${s.simulation ? ` · Simulated gain: ${s.simulation.delta >= 0 ? '+' : ''}${s.simulation.delta}%` : ''}`);
    lines.push('');
  }

  // Per-Title Reports
  lines.push('---');
  lines.push('');
  lines.push('## Per-Title Reports');
  lines.push('');

  for (const tr of report.targetReports) {
    if (tr.differences.length === 0) continue;
    lines.push(`${'='.repeat(56)}`);
    lines.push(
      `**Target: ${tr.targetTitle}**  ` +
      `Accuracy: ${tr.accuracy}%  Drift: avg ${tr.averageDrift} max ${tr.maxDrift}` +
      (tr.hasEditorialOverride ? '  📋 has overrides' : '')
    );
    lines.push(`${'='.repeat(56)}`);
    lines.push('');

    for (const d of tr.differences) {
      const matchStr = d.matches ? '✓ Match' : '✗ Mismatch';
      lines.push(
        `**${d.sourceTitle}**  ` +
        `Engine: ${categoryLabel(d.engineCategory)}  Editorial: ${categoryLabel(d.editorialCategory)}  ${matchStr}`
      );
      if (!d.matches) {
        lines.push(
          `> Score: ${d.engineScoreBreakdown.edgeStrength} ` +
          `+ ${d.engineScoreBreakdown.relationship} ` +
          `+ ${d.engineScoreBreakdown.protagonistOverlap} ` +
          `+ ${d.engineScoreBreakdown.narrativeImportance} ` +
          `+ ${d.engineScoreBreakdown.depth} ` +
          `= **${d.engineScore}**  (Editorial: ${d.editorialScore})  Drift: ${d.driftScore}`
        );
        lines.push(`> ${d.explanation}`);
        if (d.suggestedFix) lines.push(`> 🔧 ${d.suggestedFix}`);
      }
      lines.push('');
    }
    lines.push(`Accuracy: ${tr.accuracy}%`);
    lines.push('');
  }

  return lines.join('\n');
}

/** Single-target focused markdown report */
export function generateSingleTargetMarkdownReport(report: EditorialComparisonReport): string {
  const lines: string[] = [];
  const eq = '='.repeat(56);
  const hr = '─'.repeat(44);
  lines.push(eq);
  lines.push(`Target: ${report.targetTitle}`);
  lines.push(eq);
  lines.push(`Accuracy: ${report.accuracy}%  |  Avg Drift: ${report.averageDrift}  |  Max Drift: ${report.maxDrift}`);
  lines.push('');

  for (const d of report.differences) {
    lines.push(hr);
    lines.push(d.sourceTitle);
    lines.push(`  Engine:    ${categoryLabel(d.engineCategory)}  score ${d.engineScore}  ${d.engineRelationship}  ${d.engineStrength}`);
    lines.push(`  Editorial: ${categoryLabel(d.editorialCategory)}  score ${d.editorialScore}  ${d.editorialRelationship}  ${d.editorialStrength}`);
    if (d.matches) {
      lines.push('  ✓ Match');
    } else {
      lines.push(`  ✗ Mismatch  (drift ${d.driftScore})`);
      lines.push(
        `  Score breakdown: ${d.engineScoreBreakdown.edgeStrength} ` +
        `+ ${d.engineScoreBreakdown.relationship} ` +
        `+ ${d.engineScoreBreakdown.protagonistOverlap} ` +
        `+ ${d.engineScoreBreakdown.narrativeImportance} ` +
        `+ ${d.engineScoreBreakdown.depth} ` +
        `= ${d.engineScore}`
      );
      lines.push(`  ${d.explanation}`);
      if (d.suggestedFix) lines.push(`  🔧 ${d.suggestedFix}`);
    }
  }
  lines.push(eq);
  lines.push(`Accuracy: ${report.accuracy}%`);
  lines.push(eq);
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Executive Summary & Override Health Reports
// ---------------------------------------------------------------------------

/**
 * Generates an executive summary ASCII dashboard box.
 */
export function generateExecutiveSummary(report: GlobalEditorialComparisonReport): string {
  const m   = report.metadata;
  const oe  = report.overrideEffectiveness;
  const st  = report.overrideStability;
  const nec = report.overrideAnalysis.filter((o) => o.confidence === 'Necessary').length;
  const lik = report.overrideAnalysis.filter((o) => o.confidence === 'Likely Necessary').length;
  const def = report.overrideAnalysis.filter((o) => o.confidence === 'Definitely Removable').length;

  const highestPriority = report.calibrationSuggestions[0]?.priority ?? 'None';
  const engineStatus = deriveEngineStatus(report.overallAccuracy, report.overallDrift);
  const dateStr = m.generatedAt ? m.generatedAt.split('T')[0] : '';

  const lines: string[] = [];
  lines.push('========================================');
  lines.push(' Recommendation Engine Health           ');
  lines.push('========================================');
  lines.push(` Generated............... ${dateStr}`);
  lines.push(` Knowledge Graph......... v${m.knowledgeGraphVersion}`);
  lines.push(` Traversal Engine........ v${m.traversalVersion}`);
  lines.push(` Policy Version.......... v${m.policyVersion}`);
  lines.push(` Comparison Engine....... v${m.comparisonEngineVersion}`);
  lines.push(` Git Commit.............. ${m.gitCommit}`);
  lines.push(` Execution Duration...... ${m.formattedDuration}`);
  lines.push(' --------------------------------------');
  lines.push(` Overall Accuracy........ ${report.overallAccuracy}%`);
  lines.push(` Average Drift........... ${report.overallDrift}`);
  lines.push(` Override Effectiveness.. ${oe.effectiveness}%`);
  lines.push(` Active Overrides........ ${oe.activeOverrides}${st.activeDelta !== undefined ? ` (${st.activeDelta >= 0 ? '+' : ''}${st.activeDelta})` : ''}`);
  lines.push(` Redundant Overrides..... ${oe.redundantOverrides} (${def} definitely removable)`);
  lines.push(` Necessary Overrides..... ${nec}`);
  lines.push(` Likely Necessary........ ${lik}`);
  if (st.newlyRedundant > 0 || st.newlyNecessary > 0) {
    lines.push(` Newly Redundant......... ${st.newlyRedundant}`);
    lines.push(` Newly Necessary......... ${st.newlyNecessary}`);
  }
  lines.push(` Calibration Priority.... ${highestPriority}`);
  lines.push(` Engine Status........... ${engineStatus}`);
  lines.push('========================================');
  return lines.join('\n');
}

/**
 * Generates structured JSON report object for reports/override-health.json
 */
export function generateOverrideHealthJson(report: GlobalEditorialComparisonReport): Record<string, unknown> {
  const today = new Date().toISOString().split('T')[0];
  const overridesMap: Record<string, unknown> = {};

  for (const o of report.overrideAnalysis) {
    const key = `${o.targetId}:${o.sourceId}`;
    overridesMap[key] = {
      targetId:          o.targetId,
      targetTitle:       o.targetTitle,
      sourceId:          o.sourceId,
      sourceTitle:       o.sourceTitle,
      status:            o.changedAnything ? 'active' : 'redundant',
      changedAnything:   o.changedAnything,
      drift:             o.drift,
      confidence:        o.confidence,
      overrideCategory:   o.overrideCategory,
      engineWouldProduce: o.engineWouldProduce,
      reason:            o.reason,
      lastChecked:       today,
    };
  }

  return {
    generatedAt:   report.generatedAt,
    lastChecked:   today,
    metadata:      report.metadata,
    effectiveness: report.overrideEffectiveness,
    stability:     report.overrideStability,
    overrides:     overridesMap,
  };
}

/**
 * Generates markdown report for reports/override-health.md
 */
export function generateOverrideHealthMd(report: GlobalEditorialComparisonReport): string {
  const st    = report.overrideStability;
  const today = new Date().toISOString().split('T')[0];
  const lines: string[] = [];

  lines.push('# CineOrder Override Health & Editorial Knowledge Alignment Report');
  lines.push(`_Last Checked: ${today}_`);
  lines.push('');
  lines.push('```text');
  lines.push(generateExecutiveSummary(report));
  lines.push('```');
  lines.push('');
  lines.push('## Stability & Subsumption Metrics');
  lines.push(`- **Current Active Overrides:** ${st.currentActiveCount}${st.activeDelta !== undefined ? ` (Delta: ${st.activeDelta >= 0 ? '+' : ''}${st.activeDelta})` : ''}`);
  lines.push(`- **Newly Redundant (this run):** ${st.newlyRedundant}`);
  lines.push(`- **Newly Necessary (this run):** ${st.newlyNecessary}`);
  lines.push('');
  const totalEdges = cineOrderKnowledgeGraph.edges.length;
  const edgesWithEvidence = cineOrderKnowledgeGraph.edges.filter((e) => !!e.recommendationEvidence).length;
  const fallbackGraphEdges = totalEdges - edgesWithEvidence;
  const coveragePct = totalEdges > 0 ? ((edgesWithEvidence / totalEdges) * 100).toFixed(1) : '0';
  lines.push('## Recommendation Evidence Coverage');
  lines.push(`- **Total Graph Edges:** ${totalEdges}`);
  lines.push(`- **Edges with Editorial Evidence:** ${edgesWithEvidence} (${coveragePct}%)`);
  lines.push(`- **Fallback Graph Evidence:** ${fallbackGraphEdges}`);
  lines.push(`- **MCU Release Gate Target:** ≥95.0%`);
  lines.push('');
  lines.push('## Editorial Knowledge Alignment Protocol');
  lines.push('Overrides are temporary learning scaffolding. Active overrides must be resolved through graph improvements using the standardized taxonomy:');
  lines.push('');
  lines.push('| Action Type | Description | Mandatory Fields |');
  lines.push('| :--- | :--- | :--- |');
  lines.push('| `EDGE_STRENGTH_CHANGE` | Adjust edge strength weight (`required`, `strong`, `moderate`, `weak`). | `Location`, `Old`, `New` |');
  lines.push('| `RELATIONSHIP_CHANGE` | Modify taxonomy relationship type (`direct-sequel`, `story-continuation`, etc.). | `Location`, `Old`, `New` |');
  lines.push('| `EDGE_ADDITION` | Insert a missing edge between two nodes. | `Location`, `Relationship`, `Strength` |');
  lines.push('| `EDGE_REMOVAL` | Prune an invalid or non-existent dependency edge. | `Location`, `Reason` |');
  lines.push('| `NARRATIVE_EVIDENCE_UPDATE` | Expand narrative text/rationale without affecting numerical score. | `Location`, `AddedEvidence` |');
  lines.push('');
  lines.push('## Detailed Rule Health Ledger');
  lines.push('');
  lines.push('| Target | Source | Status | Confidence | Engine Would Produce | Override Category | Reason |');
  lines.push('|--------|--------|--------|------------|----------------------|-------------------|--------|');

  for (const o of report.overrideAnalysis) {
    const statusBadge = o.changedAnything ? '⚠️ Active' : '✅ Redundant';
    lines.push(`| ${o.targetTitle} | ${o.sourceTitle} | ${statusBadge} | ${o.confidence} | ${o.engineWouldProduce} | ${o.overrideCategory} | ${o.reason} |`);
  }

  lines.push('');
  return lines.join('\n');
}

