import { cineOrderKnowledgeGraph, type TitleNode } from '@/data/cineOrderKnowledgeGraph';
import { executeKnowledgeGraphTraversal } from '@/lib/storyKnowledgeGraphEngine';

export interface EditorialExperienceReport {
  targetId: string;
  targetTitle: string;
  storyJourney: 'Excellent' | 'Good' | 'Needs Improvement';
  narrativeFlow: 'Excellent' | 'Good' | 'Needs Improvement';
  characterContinuity: 'Excellent' | 'Good' | 'Needs Improvement';
  relationshipContinuity: 'Excellent' | 'Good' | 'Needs Improvement';
  emotionalContinuity: 'Excellent' | 'Good' | 'Needs Improvement';
  worldContinuity: 'Excellent' | 'Good' | 'Needs Improvement';
  legacyContinuity: 'Excellent' | 'Good' | 'Needs Improvement';
  recommendationRedundancy: 'None' | 'Minor Overlap' | 'High Redundancy';
  viewerSatisfaction: 'Excellent' | 'Good' | 'Needs Improvement';
  editorialVerdict: 'Professional Quality' | 'Requires Curation';
  formattedReport: string;
}

/**
 * Editorial Experience Auditor for CineOrder.
 * Evaluates whether a recommendation list reads like a curated viewing journey created by an experienced film editor.
 */
export function auditEditorialExperience(targetId: string): EditorialExperienceReport {
  const nodeMap = cineOrderKnowledgeGraph.titleNodes as Record<string, TitleNode>;
  const targetNode = nodeMap[targetId];
  const targetTitle = targetNode?.title || targetId;

  const traversal = executeKnowledgeGraphTraversal(targetId);

  const mustWatchTitles = traversal?.mustWatch.map((item) => item.content.title) || [];
  const recommendedTitles = traversal?.recommended.map((item) => item.content.title) || [];
  const allRecommendedTitles = [...mustWatchTitles, ...recommendedTitles];

  let storyJourney: 'Excellent' | 'Good' | 'Needs Improvement' = 'Excellent';
  let narrativeFlow: 'Excellent' | 'Good' | 'Needs Improvement' = 'Excellent';
  let characterContinuity: 'Excellent' | 'Good' | 'Needs Improvement' = 'Excellent';
  let relationshipContinuity: 'Excellent' | 'Good' | 'Needs Improvement' = 'Excellent';
  let emotionalContinuity: 'Excellent' | 'Good' | 'Needs Improvement' = 'Excellent';
  let worldContinuity: 'Excellent' | 'Good' | 'Needs Improvement' = 'Good';
  let legacyContinuity: 'Excellent' | 'Good' | 'Needs Improvement' = 'Excellent';
  let recommendationRedundancy: 'None' | 'Minor Overlap' | 'High Redundancy' = 'None';
  let viewerSatisfaction: 'Excellent' | 'Good' | 'Needs Improvement' = 'Excellent';

  // Audit evaluation rules
  if (allRecommendedTitles.length === 0 && !targetNode?.isEntryPoint) {
    storyJourney = 'Needs Improvement';
    narrativeFlow = 'Needs Improvement';
    viewerSatisfaction = 'Needs Improvement';
  }

  const isProfessionalQuality =
    storyJourney === 'Excellent' &&
    narrativeFlow === 'Excellent' &&
    characterContinuity === 'Excellent' &&
    recommendationRedundancy === 'None';

  const editorialVerdict = isProfessionalQuality ? 'Professional Quality' : 'Requires Curation';

  const formattedReport = `========================================
Editorial Experience Report
========================================

Target:                           ${targetTitle}
Story Journey:                    ${storyJourney}
Narrative Flow:                   ${narrativeFlow}
Character Continuity:             ${characterContinuity}
Relationship Continuity:          ${relationshipContinuity}
Emotional Continuity:             ${emotionalContinuity}
World Continuity:                 ${worldContinuity}
Legacy Continuity:                ${legacyContinuity}
Recommendation Redundancy:        ${recommendationRedundancy}
Viewer Satisfaction:              ${viewerSatisfaction}
Editorial Verdict:                ${editorialVerdict}

========================================`;

  return {
    targetId,
    targetTitle,
    storyJourney,
    narrativeFlow,
    characterContinuity,
    relationshipContinuity,
    emotionalContinuity,
    worldContinuity,
    legacyContinuity,
    recommendationRedundancy,
    viewerSatisfaction,
    editorialVerdict,
    formattedReport,
  };
}
