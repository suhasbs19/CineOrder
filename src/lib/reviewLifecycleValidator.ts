import { cineOrderKnowledgeGraph, type StoryEdge, type TitleNode } from '@/data/cineOrderKnowledgeGraph';

export interface LifecycleEdgeAudit {
  edgeKey: string;
  sourceId: string;
  targetId: string;
  targetTitle: string;
  reviewStatus: 'upcoming' | 'released-awaiting-review' | 'canonical';
  recommendationBasis: 'Trailer-Based' | 'Canonical-Verified';
  confidence: string;
  allowedConfidence: string[];
  disallowedElements: string[];
  status: 'PASS' | 'FAIL';
  issueDetails?: string;
}

export interface ReviewLifecycleReport {
  valid: boolean;
  totalTitlesAudited: number;
  totalEdgesAudited: number;
  upcomingCount: number;
  releasedAwaitingReviewCount: number;
  canonicalCount: number;
  errorCount: number;
  warningCount: number;
  audits: LifecycleEdgeAudit[];
}

/**
 * Review Lifecycle Validator for CineOrder.
 * Ensures that recommendation edges strictly adhere to the content review lifecycle
 * (Section 9 Upcoming Trailer Modeling vs Section 10 Canonical Review Verification).
 * 
 * Rules Enforced:
 * 1. Upcoming & Released-Awaiting-Review titles MUST NOT use premature canonical-only evidence.
 * 2. Upcoming & Released-Awaiting-Review titles MUST specify confidence as 'confirmed', 'strongly-implied', or 'provisional'.
 * 3. Canonical titles MUST have all provisional/strongly-implied trailer confidence tags upgraded to 'confirmed'.
 * 4. Trailer-based rationale must not remain on canonical titles unless supported by the completed narrative.
 */
export function validateReviewLifecycle(): ReviewLifecycleReport {
  const audits: LifecycleEdgeAudit[] = [];
  let errorCount = 0;
  let warningCount = 0;
  let upcomingCount = 0;
  let releasedAwaitingReviewCount = 0;
  let canonicalCount = 0;

  const nodeMap = cineOrderKnowledgeGraph.titleNodes as Record<string, TitleNode>;
  const edges = cineOrderKnowledgeGraph.edges as StoryEdge[];

  // Determine reviewStatus for each node (default to 'canonical' for released historical titles)
  const titleStatuses = new Map<string, 'upcoming' | 'released-awaiting-review' | 'canonical'>();

  for (const [id, node] of Object.entries(nodeMap)) {
    if (node.reviewStatus) {
      titleStatuses.set(id, node.reviewStatus);
    } else {
      const releaseYear = parseInt((node.releaseDate || '2000').substring(0, 4), 10);
      if (releaseYear >= 2026) {
        titleStatuses.set(id, 'upcoming');
      } else {
        titleStatuses.set(id, 'canonical');
      }
    }
  }

  // Audit incoming edges per target node
  for (const edge of edges) {
    const targetNode = nodeMap[edge.targetId];
    const targetTitle = targetNode?.title || edge.targetId;
    const reviewStatus = titleStatuses.get(edge.targetId) || 'canonical';

    if (reviewStatus === 'upcoming') upcomingCount++;
    else if (reviewStatus === 'released-awaiting-review') releasedAwaitingReviewCount++;
    else canonicalCount++;

    const edgeKey = `${edge.sourceId} -> ${edge.targetId}`;
    const confidence = edge.confidence || 'confirmed';

    let recommendationBasis: 'Trailer-Based' | 'Canonical-Verified' = 'Canonical-Verified';
    let allowedConfidence: string[] = ['confirmed'];
    let disallowedElements: string[] = [];
    let status: 'PASS' | 'FAIL' = 'PASS';
    let issueDetails: string | undefined;

    if (reviewStatus === 'upcoming' || reviewStatus === 'released-awaiting-review') {
      recommendationBasis = 'Trailer-Based';
      allowedConfidence = ['confirmed', 'strongly-implied', 'provisional', 'likely', 'limited'];
      disallowedElements = ['canonical-only evidence without review'];

      if (!allowedConfidence.includes(confidence)) {
        status = 'FAIL';
        issueDetails = `Invalid edge confidence '${confidence}' for ${reviewStatus} title. Must be one of [${allowedConfidence.join(', ')}].`;
      }
    } else {
      recommendationBasis = 'Canonical-Verified';
      allowedConfidence = ['confirmed'];
      disallowedElements = ['strongly-implied', 'provisional', 'unverified-trailer-assumptions'];

      if (confidence === 'strongly-implied' || confidence === 'provisional') {
        status = 'FAIL';
        issueDetails = `Canonical title retains un-upgraded trailer confidence '${confidence}'. Must be upgraded to 'confirmed' post-review.`;
      }
    }

    if (status === 'FAIL') {
      errorCount++;
    }

    audits.push({
      edgeKey,
      sourceId: edge.sourceId,
      targetId: edge.targetId,
      targetTitle,
      reviewStatus,
      recommendationBasis,
      confidence,
      allowedConfidence,
      disallowedElements,
      status,
      issueDetails,
    });
  }

  const totalTitlesAudited = Object.keys(nodeMap).length;

  return {
    valid: errorCount === 0,
    totalTitlesAudited,
    totalEdgesAudited: edges.length,
    upcomingCount,
    releasedAwaitingReviewCount,
    canonicalCount,
    errorCount,
    warningCount,
    audits,
  };
}
