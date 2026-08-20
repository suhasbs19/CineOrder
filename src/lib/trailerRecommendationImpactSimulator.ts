/**
 * CineOrder Trailer Intelligence — Phase 4: Read-Only Recommendation Impact Simulator
 * 
 * Computes a strictly read-only, hypothetical projection of how trailer evidence
 * would affect prerequisite recommendations if approved by human editors.
 * 
 * INVARIANTS:
 * 1. Read-Only: Zero mutation of CKG, RecommendationService, catalog, or watch orders.
 * 2. Determinism: Zero Date.now() or Math.random().
 * 3. Anti-Inflation: Cameos, visual callbacks, and low confidence evidence never inflate to Must Watch.
 * 4. Multi-Continuity Firewall: Cross-continuity edges are strictly isolated and labeled.
 */

import { allContent } from '@/data/franchises';
import { RecommendationService } from './recommendationService';
import { normalizeContinuityId } from './trailerEvidenceExtractor';
import type {
  TrailerProposalPackage,
  TrailerEvidenceItem,
  SimulatedPrerequisiteItem,
  TrailerRecommendationImpactReport,
  TrailerImpactClassification,
} from '@/types/trailerIntelligence';

/**
 * Finds title metadata from canonical catalog
 */
function findCatalogTitle(contentId: string): { title: string; continuity?: string } {
  const norm = contentId.trim().toLowerCase();
  const matched = allContent.find((c) => c.id.toLowerCase() === norm);
  if (matched) {
    return {
      title: matched.title,
      continuity: (matched as any).continuity || matched.franchise_id,
    };
  }
  return {
    title: contentId,
    continuity: undefined,
  };
}

/**
 * Executes a pure, read-only recommendation impact simulation for a given trailer proposal.
 */
export function simulateTrailerRecommendationImpact(
  proposal: TrailerProposalPackage
): TrailerRecommendationImpactReport {
  const targetContinuity = normalizeContinuityId(proposal.continuityId);
  const targetMeta = findCatalogTitle(proposal.contentId);
  const targetTitle = targetMeta.title || proposal.contentId;

  // 1. Retrieve Current Production Prerequisites (Safely Read-Only)
  const currentMustWatch: SimulatedPrerequisiteItem[] = [];
  const currentRecommended: SimulatedPrerequisiteItem[] = [];
  const currentOptional: SimulatedPrerequisiteItem[] = [];
  const currentPrereqIds = new Set<string>();

  try {
    const prodTraversal = RecommendationService.getRecommendationGraph(proposal.contentId);
    if (prodTraversal) {
      for (const item of prodTraversal.mustWatch) {
        currentPrereqIds.add(item.content.id.toLowerCase());
        currentMustWatch.push({
          contentId: item.content.id,
          title: item.content.title,
          strength: 'required',
          relationship: item.dependencyType || 'direct-sequel',
          confidence: item.confidence || 'confirmed',
          category: 'must_watch',
          isSimulatedNew: false,
          reason: item.storyImpact || item.reason || 'Production Must Watch prerequisite',
          continuityId: (item.content as any).continuity || item.content.franchise_id,
        });
      }

      for (const item of prodTraversal.recommended) {
        currentPrereqIds.add(item.content.id.toLowerCase());
        currentRecommended.push({
          contentId: item.content.id,
          title: item.content.title,
          strength: 'recommended',
          relationship: item.dependencyType || 'story-continuation',
          confidence: item.confidence || 'confirmed',
          category: 'recommended',
          isSimulatedNew: false,
          reason: item.storyImpact || item.reason || 'Production Recommended prerequisite',
          continuityId: (item.content as any).continuity || item.content.franchise_id,
        });
      }

      for (const item of prodTraversal.optional) {
        currentPrereqIds.add(item.content.id.toLowerCase());
        currentOptional.push({
          contentId: item.content.id,
          title: item.content.title,
          strength: 'optional',
          relationship: item.dependencyType || 'world-building',
          confidence: item.confidence || 'confirmed',
          category: 'optional',
          isSimulatedNew: false,
          reason: item.storyImpact || item.reason || 'Production Optional context',
          continuityId: (item.content as any).continuity || item.content.franchise_id,
        });
      }
    }
  } catch {
    // Target is an upcoming / unindexed title; production traversal defaults to empty
  }

  // 2. Simulate Hypothetical Changes
  const simMustWatch: SimulatedPrerequisiteItem[] = [...currentMustWatch];
  const simRecommended: SimulatedPrerequisiteItem[] = [...currentRecommended];
  const simOptional: SimulatedPrerequisiteItem[] = [...currentOptional];

  const newMustWatchCandidates: SimulatedPrerequisiteItem[] = [];
  const newRecommended: SimulatedPrerequisiteItem[] = [];
  const newOptional: SimulatedPrerequisiteItem[] = [];
  const crossContinuityLinks: TrailerRecommendationImpactReport['diff']['crossContinuityLinks'] = [];
  const conflictsDetected: string[] = [];
  const safetyNotes: string[] = [
    'SIMULATION ONLY — PRODUCTION STORY KNOWLEDGE GRAPH UNCHANGED.',
    'All simulated prerequisite relationships require explicit human editorial review before integration.',
  ];

  interface SimulatedEdgeEntry {
    sourceContentId: string;
    targetContentId: string;
    relationship: string;
    strength: string;
    confidence: string;
    reason: string;
    isCrossover?: boolean;
  }

  // Helper map from sourceContentId -> highest impact evidence item
  const edgeSourceMap = new Map<string, { edge: SimulatedEdgeEntry; evidence: TrailerEvidenceItem }>();

  for (const ev of proposal.evidenceItems) {
    if (ev.suggestedEdge && ev.suggestedEdge.sourceContentId) {
      const srcId = ev.suggestedEdge.sourceContentId.trim().toLowerCase();
      const existing = edgeSourceMap.get(srcId);
      if (!existing || ev.confidence > existing.evidence.confidence) {
        edgeSourceMap.set(srcId, {
          edge: {
            sourceContentId: ev.suggestedEdge.sourceContentId,
            targetContentId: ev.suggestedEdge.targetContentId,
            relationship: ev.suggestedEdge.relationship,
            strength: ev.suggestedEdge.strength,
            confidence: ev.suggestedEdge.confidence,
            reason: ev.suggestedEdge.reason,
            isCrossover: ev.suggestedEdge.isCrossover,
          },
          evidence: ev,
        });
      }
    }
  }

  // Also include any proposedStoryEdges not tied directly to a single evidence item
  for (const edge of proposal.proposedStoryEdges) {
    const srcContentId = edge.sourceId || (edge as any).sourceContentId || '';
    const srcId = srcContentId.trim().toLowerCase();
    if (srcId && !edgeSourceMap.has(srcId)) {
      // Find matching evidence if any
      const matchingEv = proposal.evidenceItems.find(
        (e) => e.suggestedEdge?.sourceContentId.toLowerCase() === srcId
      ) || {
        id: `ev-edge-${srcId}`,
        category: 'SEQUEL_PREQUEL_CONTINUITY' as const,
        subject: srcContentId,
        description: edge.reason,
        videoKey: proposal.videoKey,
        videoTitle: proposal.videoTitle,
        confidence: edge.confidence === 'confirmed' ? 0.95 : edge.confidence === 'likely' ? 0.85 : 0.70,
        verificationState: 'INFERRED' as const,
        prerequisiteImpact: edge.strength === 'strong' ? 'MUST_WATCH_CANDIDATE' as const : 'RECOMMENDED' as const,
      };
      edgeSourceMap.set(srcId, {
        edge: {
          sourceContentId: srcContentId,
          targetContentId: edge.targetId || (edge as any).targetContentId || proposal.contentId,
          relationship: edge.relationship,
          strength: edge.strength,
          confidence: edge.confidence,
          reason: edge.reason,
          isCrossover: edge.relationship === 'multiverse' || edge.relationship === 'major-crossover',
        },
        evidence: matchingEv,
      });
    }
  }

  // Process each simulated edge
  for (const [srcNormId, { edge, evidence }] of edgeSourceMap.entries()) {
    const srcMeta = findCatalogTitle(edge.sourceContentId);
    const srcContinuity = normalizeContinuityId(evidence.continuityId || srcMeta.continuity || targetContinuity);
    const isCrossContinuity = srcContinuity !== targetContinuity || edge.isCrossover === true;

    if (isCrossContinuity) {
      crossContinuityLinks.push({
        sourceContentId: edge.sourceContentId,
        sourceContinuity: srcContinuity,
        targetContentId: proposal.contentId,
        targetContinuity,
        relationship: edge.relationship,
        confidence: edge.confidence,
        reason: edge.reason,
      });

      safetyNotes.push(
        `Cross-continuity link detected (${srcContinuity} -> ${targetContinuity}). Preserved under multi-continuity firewall.`
      );
    }

    // Check if source title is already in production prerequisites
    if (currentPrereqIds.has(srcNormId)) {
      continue;
    }

    // Classify into Simulated Category
    if (evidence.prerequisiteImpact === 'MUST_WATCH_CANDIDATE' && !isCrossContinuity) {
      const item: SimulatedPrerequisiteItem = {
        contentId: edge.sourceContentId,
        title: srcMeta.title,
        strength: 'strong',
        relationship: edge.relationship,
        confidence: edge.confidence,
        category: 'must_watch',
        isSimulatedNew: true,
        evidenceId: evidence.id,
        reason: `[Simulated Must-Watch] ${evidence.description}`,
        continuityId: srcContinuity,
        isCrossContinuity: false,
      };
      simMustWatch.push(item);
      newMustWatchCandidates.push(item);
    } else if (
      evidence.prerequisiteImpact === 'RECOMMENDED' ||
      (evidence.prerequisiteImpact === 'MUST_WATCH_CANDIDATE' && isCrossContinuity)
    ) {
      const item: SimulatedPrerequisiteItem = {
        contentId: edge.sourceContentId,
        title: srcMeta.title,
        strength: isCrossContinuity ? 'moderate' : edge.strength,
        relationship: edge.relationship,
        confidence: edge.confidence,
        category: 'recommended',
        isSimulatedNew: true,
        evidenceId: evidence.id,
        reason: isCrossContinuity
          ? `[Simulated Cross-Continuity Context] ${evidence.description}`
          : `[Simulated Recommended] ${evidence.description}`,
        continuityId: srcContinuity,
        isCrossContinuity,
      };
      simRecommended.push(item);
      newRecommended.push(item);
    } else if (evidence.prerequisiteImpact === 'OPTIONAL') {
      const item: SimulatedPrerequisiteItem = {
        contentId: edge.sourceContentId,
        title: srcMeta.title,
        strength: 'weak',
        relationship: edge.relationship,
        confidence: edge.confidence,
        category: 'optional',
        isSimulatedNew: true,
        evidenceId: evidence.id,
        reason: `[Simulated Optional Context] ${evidence.description}`,
        continuityId: srcContinuity,
        isCrossContinuity,
      };
      simOptional.push(item);
      newOptional.push(item);
    }
  }

  // Detect Conflicting / Low Confidence Signals
  for (const ev of proposal.evidenceItems) {
    if (ev.confidence < 0.50) {
      conflictsDetected.push(`Low confidence evidence item (${ev.id}: ${ev.subject}) with score ${(ev.confidence * 100).toFixed(0)}%.`);
    }
  }

  if (proposal.continuitySafetyPassed === false) {
    conflictsDetected.push('Proposal failed continuity safety barriers. Review required.');
  }

  // 3. Determine Primary Impact Classification
  let primaryImpactCategory: TrailerImpactClassification = 'NO_CHANGE';

  if (conflictsDetected.length > 0 && newMustWatchCandidates.length === 0 && newRecommended.length === 0) {
    primaryImpactCategory = 'CONFLICTING_EVIDENCE';
  } else if (crossContinuityLinks.length > 0) {
    primaryImpactCategory = 'CROSS_CONTINUITY_IMPACT';
  } else if (newMustWatchCandidates.length > 0) {
    primaryImpactCategory = 'NEW_MUST_WATCH_CANDIDATE';
  } else if (newRecommended.length > 0) {
    primaryImpactCategory = 'NEW_RECOMMENDED';
  } else if (newOptional.length > 0) {
    primaryImpactCategory = 'NEW_OPTIONAL';
  } else if (proposal.evidenceItems.length > 0) {
    primaryImpactCategory = 'NO_CHANGE';
  }

  // 4. Build Evidence Summary Breakdown
  const evidenceSummary = proposal.evidenceItems.map((ev) => {
    let contribution = 'World-building context / no prerequisite modification';
    if (ev.prerequisiteImpact === 'MUST_WATCH_CANDIDATE') {
      contribution = 'Promotes source predecessor to hypothetical Must Watch candidate';
    } else if (ev.prerequisiteImpact === 'RECOMMENDED') {
      contribution = 'Adds recommended contextual prerequisite link';
    } else if (ev.prerequisiteImpact === 'OPTIONAL') {
      contribution = 'Adds optional background / visual callback reference';
    }

    return {
      evidenceId: ev.id,
      category: ev.category,
      subject: ev.subject,
      epistemicState: ev.verificationState,
      prerequisiteImpact: ev.prerequisiteImpact,
      confidence: ev.confidence,
      simulatedContribution: contribution,
    };
  });

  return {
    targetContentId: proposal.contentId,
    targetTitle,
    franchiseId: proposal.franchiseId,
    continuityId: targetContinuity,
    isReadOnlySimulation: true,
    primaryImpactCategory,
    currentProductionPrerequisites: {
      mustWatch: currentMustWatch,
      recommended: currentRecommended,
      optional: currentOptional,
      totalCount: currentMustWatch.length + currentRecommended.length + currentOptional.length,
    },
    simulatedPrerequisites: {
      mustWatch: simMustWatch,
      recommended: simRecommended,
      optional: simOptional,
      totalCount: simMustWatch.length + simRecommended.length + simOptional.length,
    },
    diff: {
      newMustWatchCandidates,
      newRecommended,
      newOptional,
      crossContinuityLinks,
      conflictsDetected,
    },
    safetyNotes,
    evidenceSummary,
  };
}
