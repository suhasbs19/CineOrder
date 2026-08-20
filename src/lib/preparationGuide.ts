import { executeKnowledgeGraphTraversal } from '@/lib/storyKnowledgeGraphEngine';
import { resolvePreparationGuide } from '@/lib/officialPreparationOverrideService';
import type { PreparationGuideData } from '@/types/preparation';

/**
 * Generates an automatic Preparation Guide for a target content item.
 * Automatically prefers studio-verified Official Preparation Lists (OFFICIAL_OVERRIDE mode)
 * over algorithmic Story Knowledge Graph traversals (GRAPH_RECOMMENDATION mode).
 */
export function generatePreparationGuide(
  contentId: string,
  watchedContentIds: string[] | Set<string> = []
): PreparationGuideData | null {
  return resolvePreparationGuide(contentId, watchedContentIds);
}

export { executeKnowledgeGraphTraversal };

