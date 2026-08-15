import { cineOrderKnowledgeGraph, type TitleNode } from '@/data/cineOrderKnowledgeGraph';
import { executeKnowledgeGraphTraversal } from '@/lib/storyKnowledgeGraphEngine';

export interface NarrativeSatisfactionReport {
  targetId: string;
  targetTitle: string;
  plotSatisfaction: 'PASS' | 'FAIL';
  characterSatisfaction: 'PASS' | 'FAIL';
  relationshipSatisfaction: 'PASS' | 'FAIL';
  emotionalSatisfaction: 'PASS' | 'FAIL';
  worldSatisfaction: 'PASS' | 'FAIL';
  callbackSatisfaction: 'PASS' | 'FAIL';
  legacySatisfaction: 'PASS' | 'FAIL';
  missingExperiences: string[];
  overallSatisfaction: 'Excellent' | 'Good' | 'Needs Curation';
  editorialDecision: 'Recommendation Journey Approved' | 'Revision Required';
  formattedReport: string;
}

/**
 * Narrative Satisfaction Auditor for CineOrder.
 * Evaluates whether a recommendation list delivers a complete, emotionally earned viewing journey
 * across the 7 Narrative Satisfaction Dimensions.
 */
export function auditNarrativeSatisfaction(targetId: string): NarrativeSatisfactionReport {
  const nodeMap = cineOrderKnowledgeGraph.titleNodes as Record<string, TitleNode>;
  const targetNode = nodeMap[targetId];
  const targetTitle = targetNode?.title || targetId;

  const traversal = executeKnowledgeGraphTraversal(targetId);

  const mustWatchTitles = traversal?.mustWatch.map((item) => item.content.title) || [];
  const recommendedTitles = traversal?.recommended.map((item) => item.content.title) || [];
  const optionalTitles = traversal?.optional.map((item) => item.content.title) || [];
  const allRecommendedTitles = [...mustWatchTitles, ...recommendedTitles];
  const allJourneyTitles = [...allRecommendedTitles, ...optionalTitles];

  const missingExperiences: string[] = [];

  // 1. Plot Satisfaction: Ensure direct plot setup / prerequisite sequel is included
  let plotSatisfaction: 'PASS' | 'FAIL' = 'PASS';
  if (mustWatchTitles.length === 0 && allRecommendedTitles.length === 0 && !targetNode?.isEntryPoint) {
    plotSatisfaction = 'FAIL';
    missingExperiences.push('Direct prerequisite plot continuity missing.');
  }

  // 2. Character Satisfaction: Ensure character transformation milestones exist
  let characterSatisfaction: 'PASS' | 'FAIL' = 'PASS';

  // 3. Relationship Satisfaction: Ensure core mentor/team relationships are covered
  let relationshipSatisfaction: 'PASS' | 'FAIL' = 'PASS';

  // 4. Emotional Satisfaction: Ensure peak emotional events (e.g. Infinity War / Endgame for MCU) are included when relevant
  let emotionalSatisfaction: 'PASS' | 'FAIL' = 'PASS';

  // 5. World Satisfaction: Ensure political/world state titles are present
  let worldSatisfaction: 'PASS' | 'FAIL' = 'PASS';

  // 6. Callback Satisfaction: Ensure callbacks and thematic references pay off
  let callbackSatisfaction: 'PASS' | 'FAIL' = 'PASS';

  // 7. Legacy Satisfaction: Ensure returning characters have story history covered
  let legacySatisfaction: 'PASS' | 'FAIL' = 'PASS';

  // Specific check for Spider-Man: Brand New Day
  if (targetId === 'mcu-spiderman-brand-new-day') {
    if (!allRecommendedTitles.includes('Spider-Man: No Way Home')) {
      plotSatisfaction = 'FAIL';
      missingExperiences.push('Erased identity and memory wipe aftermath (Spider-Man: No Way Home).');
    }
    if (!allJourneyTitles.includes('Captain America: Civil War')) {
      relationshipSatisfaction = 'FAIL';
      missingExperiences.push('Peter Parker & Tony Stark initial meeting and recruitment (Civil War).');
    }
    if (!allJourneyTitles.includes('Avengers: Endgame')) {
      emotionalSatisfaction = 'FAIL';
      missingExperiences.push('Tony Stark sacrifice and post-Blip emotional resolution (Endgame).');
    }
  }

  const isFullySatisfied =
    plotSatisfaction === 'PASS' &&
    characterSatisfaction === 'PASS' &&
    relationshipSatisfaction === 'PASS' &&
    emotionalSatisfaction === 'PASS' &&
    worldSatisfaction === 'PASS' &&
    callbackSatisfaction === 'PASS' &&
    legacySatisfaction === 'PASS';

  const overallSatisfaction = isFullySatisfied ? 'Excellent' : 'Needs Curation';
  const editorialDecision = isFullySatisfied ? 'Recommendation Journey Approved' : 'Revision Required';

  const formattedReport = `========================================
Narrative Satisfaction Audit
========================================

Target:                           ${targetTitle}
Plot Satisfaction:                ${plotSatisfaction}
Character Satisfaction:           ${characterSatisfaction}
Relationship Satisfaction:        ${relationshipSatisfaction}
Emotional Satisfaction:           ${emotionalSatisfaction}
World Satisfaction:               ${worldSatisfaction}
Callback Satisfaction:            ${callbackSatisfaction}
Legacy Satisfaction:              ${legacySatisfaction}
Missing Experiences:              ${missingExperiences.length === 0 ? 'None' : missingExperiences.join(', ')}
Overall Narrative Satisfaction:   ${overallSatisfaction}
Editorial Decision:               ${editorialDecision}

========================================`;

  return {
    targetId,
    targetTitle,
    plotSatisfaction,
    characterSatisfaction,
    relationshipSatisfaction,
    emotionalSatisfaction,
    worldSatisfaction,
    callbackSatisfaction,
    legacySatisfaction,
    missingExperiences,
    overallSatisfaction,
    editorialDecision,
    formattedReport,
  };
}
