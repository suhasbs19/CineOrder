import { executeKnowledgeGraphTraversal, type KnowledgeGraphTraversalResult } from '@/lib/storyKnowledgeGraphEngine';
import type { PreparationGuideData } from '@/types/preparation';

/**
 * Generates an automatic Story Knowledge Graph Preparation Guide for a target content item.
 * Uses backward edge traversal, edge-strength deterministic categorization,
 * merged connection paths, and edge-based entry point detection.
 */
export function generatePreparationGuide(
  contentId: string,
  watchedContentIds: string[] | Set<string> = []
): PreparationGuideData | null {
  const result: KnowledgeGraphTraversalResult | null = executeKnowledgeGraphTraversal(contentId, watchedContentIds);
  if (!result) return null;

  return {
    targetContent: result.targetContent,
    mustWatch: result.mustWatch,
    recommended: result.recommended,
    optional: result.optional,
    safeToSkip: result.safeToSkip,
    estimatedWatchTimeMinutes: result.estimatedWatchTimeMinutes,
    formattedWatchTime: result.formattedWatchTime,
    storyReadinessPercentage: result.storyReadinessPercentage,
    watchedCount: result.watchedCount,
    totalPrerequisitesCount: result.totalPrerequisitesCount,
    isEntryPoint: result.isEntryPoint,
    entryPointMessage: result.entryPointMessage,
  };
}

export { executeKnowledgeGraphTraversal };
