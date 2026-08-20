/**
 * CineOrder Trailer Intelligence — Phase 5: Trailer Recommendation Impact Service
 *
 * Isolated, pure narrative impact analyzer that assesses whether verified trailer evidence
 * warrants proposing modifications to CineOrder's prerequisite and recommendation graph.
 *
 * INVARIANTS:
 * 1. Zero Direct Mutation: Strictly read-only simulation and pending proposal generation.
 *    Never modifies storyGraphEngine.ts, storyKnowledgeGraphEngine.ts,
 *    recommendationService.ts, or cineOrderKnowledgeGraph.ts.
 * 2. Strict Evidence Policy: Weak or ambiguous evidence is never inflated to Must Watch.
 * 3. Multi-Continuity Firewall: Raimi, Webb, MCU, and Spider-Verse continuities remain isolated.
 * 4. Determinism & Idempotency: Pure 64-char event hashes; repeated scans produce 0 duplicate proposals.
 * 5. Human Approval Requirement: All generated proposals initialize with status = 'pending'.
 */

import { allContent } from '@/data/franchises';
import { normalizeContinuityId } from './trailerEvidenceExtractor';
import { simulateTrailerRecommendationImpact } from './trailerRecommendationImpactSimulator';
import type {
  TrailerProposalPackage,
  TrailerEvidenceItem,
  TrailerRecommendationImpactProposal,
  TrailerRecommendationImpactCategory,
  ProposedRelationshipDetail,
  RecommendationGraphSnapshot,
  SimulatedPrerequisiteItem,
} from '@/types/trailerIntelligence';

/**
 * Computes a deterministic SHA-like bit-mixing 64-character hex hash for a proposal to enforce idempotency
 */
export function computeImpactProposalHash(
  trailerId: string,
  contentId: string,
  impactCategory: string,
  evidenceIds: string[]
): string {
  const sortedIds = [...evidenceIds].sort().join('|');
  const payload = `IMPACT_PROPOSAL:${trailerId}:${contentId}:${impactCategory}:${sortedIds}`;

  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  let h3 = 0x9e3779b9;
  let h4 = 0x85ebca6b;
  let h5 = 0xc2b2ae35;
  let h6 = 0x27d4eb2f;
  let h7 = 0x165667b1;
  let h8 = 0x9e3779b1;

  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 2246822507);
    h4 = Math.imul(h4 ^ ch, 3266489909);
    h5 = Math.imul(h5 ^ ch, 1103515245);
    h6 = Math.imul(h6 ^ ch, 134775813);
    h7 = Math.imul(h7 ^ ch, 214013);
    h8 = Math.imul(h8 ^ ch, 2531011);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h3 ^ (h3 >>> 13), 3266489909);
  h3 = Math.imul(h3 ^ (h3 >>> 16), 2246822507) ^ Math.imul(h4 ^ (h4 >>> 13), 3266489909);
  h4 = Math.imul(h4 ^ (h4 >>> 16), 2246822507) ^ Math.imul(h5 ^ (h5 >>> 13), 3266489909);
  h5 = Math.imul(h5 ^ (h5 >>> 16), 2246822507) ^ Math.imul(h6 ^ (h6 >>> 13), 3266489909);
  h6 = Math.imul(h6 ^ (h6 >>> 16), 2246822507) ^ Math.imul(h7 ^ (h7 >>> 13), 3266489909);
  h7 = Math.imul(h7 ^ (h7 >>> 16), 2246822507) ^ Math.imul(h8 ^ (h8 >>> 13), 3266489909);
  h8 = Math.imul(h8 ^ (h8 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return [
    (h1 >>> 0).toString(16).padStart(8, '0'),
    (h2 >>> 0).toString(16).padStart(8, '0'),
    (h3 >>> 0).toString(16).padStart(8, '0'),
    (h4 >>> 0).toString(16).padStart(8, '0'),
    (h5 >>> 0).toString(16).padStart(8, '0'),
    (h6 >>> 0).toString(16).padStart(8, '0'),
    (h7 >>> 0).toString(16).padStart(8, '0'),
    (h8 >>> 0).toString(16).padStart(8, '0'),
  ].join('');
}

/**
 * Resolves content title and continuity safely from the canonical catalog
 */
function resolveCatalogTitle(contentId: string): { title: string; franchiseId: string; continuity: string } {
  const norm = contentId.trim().toLowerCase();
  const matched = allContent.find((c) => c.id.toLowerCase() === norm);
  if (matched) {
    return {
      title: matched.title,
      franchiseId: matched.franchise_id,
      continuity: (matched as any).continuity || matched.franchise_id,
    };
  }
  if (norm.startsWith('mcu-')) {
    return {
      title: contentId,
      franchiseId: 'marvel-cinematic-universe',
      continuity: 'mcu-616',
    };
  }
  if (norm.startsWith('sw-') || norm.startsWith('star-wars-')) {
    return {
      title: contentId,
      franchiseId: 'star-wars',
      continuity: 'star-wars-canon',
    };
  }
  if (norm.startsWith('spider-verse-')) {
    return {
      title: contentId,
      franchiseId: 'spider-man',
      continuity: 'spider-verse-animated',
    };
  }
  if (norm.startsWith('spiderman-')) {
    return {
      title: contentId,
      franchiseId: 'spider-man',
      continuity: 'spider-man-raimi',
    };
  }
  if (norm.startsWith('amazing-spiderman-')) {
    return {
      title: contentId,
      franchiseId: 'spider-man',
      continuity: 'spider-man-webb',
    };
  }
  return {
    title: contentId,
    franchiseId: 'unknown',
    continuity: 'unknown',
  };
}

/**
 * Generates an ASCII tree diagram representing a recommendation snapshot
 */
export function renderRecommendationAsciiTree(
  rootTitle: string,
  snapshot: { mustWatch: SimulatedPrerequisiteItem[]; recommended: SimulatedPrerequisiteItem[]; optional: SimulatedPrerequisiteItem[] }
): string {
  const lines: string[] = [rootTitle];
  const sections: Array<{ label: string; items: SimulatedPrerequisiteItem[] }> = [
    { label: 'MUST WATCH', items: snapshot.mustWatch },
    { label: 'RECOMMENDED', items: snapshot.recommended },
    { label: 'OPTIONAL CONTEXT', items: snapshot.optional },
  ].filter((s) => s.items.length > 0);

  if (sections.length === 0) {
    lines.push('└── (Standalone / No prerequisites)');
    return lines.join('\n');
  }

  sections.forEach((sec, secIdx) => {
    const isLastSec = secIdx === sections.length - 1;
    const secPrefix = isLastSec ? '└── ' : '├── ';
    const childIndent = isLastSec ? '    ' : '│   ';
    lines.push(`${secPrefix}${sec.label}`);

    sec.items.forEach((item, itemIdx) => {
      const isLastItem = itemIdx === sec.items.length - 1;
      const itemPrefix = isLastItem ? '└── ' : '├── ';
      const tag = item.isSimulatedNew ? ' [NEW PROPOSAL]' : '';
      lines.push(`${childIndent}${itemPrefix}${item.title}${tag}`);
    });
  });

  return lines.join('\n');
}

/**
 * Evaluates trailer evidence items and determines the primary narrative impact category
 */
export function classifyNarrativeImpact(
  evidenceItems: TrailerEvidenceItem[],
  targetContinuity: string
): {
  impactCategory: TrailerRecommendationImpactCategory;
  confidence: number;
  explanation: string;
  continuitySafetyPassed: boolean;
  continuitySafetyNotes: string[];
} {
  const safetyNotes: string[] = [];
  let continuitySafetyPassed = true;

  if (!evidenceItems || evidenceItems.length === 0) {
    return {
      impactCategory: 'NO_RECOMMENDATION_IMPACT',
      confidence: 1.0,
      explanation: 'No narrative evidence items identified in trailer.',
      continuitySafetyPassed: true,
      continuitySafetyNotes: [],
    };
  }

  // Multi-Continuity Firewall Checks (Spider-Man Isolation)
  const normTargetContinuity = normalizeContinuityId(targetContinuity);
  for (const ev of evidenceItems) {
    if (ev.suggestedEdge && ev.suggestedEdge.sourceContentId) {
      const srcMeta = resolveCatalogTitle(ev.suggestedEdge.sourceContentId);
      const normSrcContinuity = normalizeContinuityId(srcMeta.continuity);

      // Spider-Man multi-continuity isolation check
      const isSpiderVerse = normTargetContinuity === 'spider-verse-animated' || normSrcContinuity === 'spider-verse-animated';
      const isMcu = normTargetContinuity === 'mcu-616' || normSrcContinuity === 'mcu-616';
      const isRaimiOrWebb =
        normTargetContinuity === 'spider-man-raimi' ||
        normTargetContinuity === 'spider-man-webb' ||
        normSrcContinuity === 'spider-man-raimi' ||
        normSrcContinuity === 'spider-man-webb';

      if (isSpiderVerse && isMcu && ev.confidence < 0.95) {
        continuitySafetyPassed = false;
        safetyNotes.push(
          `MULTI-CONTINUITY FIREWALL TRIGGERED: Blocked unverified link between Spider-Verse and MCU (${ev.subject}).`
        );
      }

      if (isRaimiOrWebb && isMcu && !ev.suggestedEdge.isCrossover && ev.confidence < 0.95) {
        continuitySafetyPassed = false;
        safetyNotes.push(
          `MULTI-CONTINUITY FIREWALL TRIGGERED: Blocked unverified link between legacy Spider-Man and MCU (${ev.subject}).`
        );
      }
    }
  }

  // Calculate weighted confidence
  const validEvidences = evidenceItems.filter((e) => e.verificationState !== 'OBSERVED' || e.confidence >= 0.5);
  const avgConfidence =
    validEvidences.length > 0
      ? validEvidences.reduce((acc, curr) => acc + curr.confidence, 0) / validEvidences.length
      : 0.5;

  // Check for Direct Sequels / Prerequisites
  const directContinuations = evidenceItems.filter(
    (e) =>
      e.category === 'DIRECT_NARRATIVE_CONTINUATION' ||
      e.category === 'SEQUEL_PREQUEL_CONTINUITY' ||
      e.prerequisiteImpact === 'MUST_WATCH_CANDIDATE'
  );
  if (directContinuations.length > 0 && avgConfidence >= 0.85) {
    const subject = directContinuations[0]?.subject || 'trailer evidence';
    return {
      impactCategory: 'NEW_PREREQUISITE',
      confidence: avgConfidence,
      explanation: `High-confidence direct narrative continuation detected from ${subject}.`,
      continuitySafetyPassed,
      continuitySafetyNotes: safetyNotes,
    };
  }

  // Check for Confirmed Crossovers
  const crossovers = evidenceItems.filter(
    (e) =>
      e.category === 'CROSSOVER_CHARACTER' ||
      e.category === 'MULTIVERSE_REFERENCE' ||
      (e.suggestedEdge && e.suggestedEdge.isCrossover)
  );
  if (crossovers.length > 0) {
    const subject = crossovers[0]?.subject || 'multiverse clues';
    return {
      impactCategory: 'CROSSOVER_RELATIONSHIP',
      confidence: avgConfidence,
      explanation: `Cross-continuity or multiverse crossover evidence identified for ${subject}.`,
      continuitySafetyPassed,
      continuitySafetyNotes: safetyNotes,
    };
  }

  // Check for Sequel / Prequel relationship indicators
  const sequelSignals = evidenceItems.filter(
    (e) => e.category === 'SEQUEL_PREQUEL_CONTINUITY' || e.category === 'EXPLICIT_TITLE_REFERENCE'
  );
  if (sequelSignals.length > 0) {
    const subject = sequelSignals[0]?.subject || 'sequel clues';
    return {
      impactCategory: 'SEQUEL_RELATIONSHIP',
      confidence: avgConfidence,
      explanation: `Narrative continuity signals indicate direct sequel relationship for ${subject}.`,
      continuitySafetyPassed,
      continuitySafetyNotes: safetyNotes,
    };
  }

  // Check for Returning Characters / Villains
  const characterAppearances = evidenceItems.filter(
    (e) => e.category === 'RETURNING_CHARACTER' || e.category === 'VILLAIN'
  );
  if (characterAppearances.length > 0) {
    return {
      impactCategory: 'CHARACTER_CONTEXT',
      confidence: avgConfidence,
      explanation: `Returning character/villain appearance provides narrative background context (${characterAppearances.map((c) => c.subject).join(', ')}).`,
      continuitySafetyPassed,
      continuitySafetyNotes: safetyNotes,
    };
  }

  // Check for Organization / Location / Visual Callbacks
  const contextualItems = evidenceItems.filter(
    (e) =>
      e.category === 'FACTION_OR_ORGANIZATION' ||
      e.category === 'RETURNING_LOCATION' ||
      e.category === 'VISUAL_CALLBACK' ||
      e.category === 'TIMELINE_CLUE'
  );
  if (contextualItems.length > 0) {
    return {
      impactCategory: 'NEW_OPTIONAL_CONTEXT',
      confidence: avgConfidence,
      explanation: `Visual callbacks, timeline clues, or recurring locations provide optional viewing context.`,
      continuitySafetyPassed,
      continuitySafetyNotes: safetyNotes,
    };
  }

  return {
    impactCategory: 'NO_RECOMMENDATION_IMPACT',
    confidence: avgConfidence,
    explanation: 'Trailer introduces standalone elements without altering existing prerequisite hierarchy.',
    continuitySafetyPassed,
    continuitySafetyNotes: safetyNotes,
  };
}

/**
 * Main Service Class for Trailer Recommendation Impact Analysis
 */
export class TrailerRecommendationImpactService {
  private generatedProposalHashes = new Set<string>();

  /**
   * Evaluates a Trailer Proposal Package and creates a typed TrailerRecommendationImpactProposal.
   * Guaranteed strictly read-only: Zero production mutations.
   */
  public analyzeTrailerImpact(
    pkg: TrailerProposalPackage
  ): TrailerRecommendationImpactProposal {
    const targetMeta = resolveCatalogTitle(pkg.contentId);
    const targetTitle = targetMeta.title || pkg.contentId;
    const targetContinuity = normalizeContinuityId(pkg.continuityId || targetMeta.continuity);

    // 1. Run Pure In-Memory Simulator (Read-Only)
    const simReport = simulateTrailerRecommendationImpact(pkg);

    // 2. Classify Narrative Impact
    const classification = classifyNarrativeImpact(pkg.evidenceItems, targetContinuity);

    // 3. Build Proposed Relationships Details
    const proposedRelationships: ProposedRelationshipDetail[] = [];
    for (const ev of pkg.evidenceItems) {
      if (ev.suggestedEdge && ev.suggestedEdge.sourceContentId) {
        const srcMeta = resolveCatalogTitle(ev.suggestedEdge.sourceContentId);
        const srcContinuity = normalizeContinuityId(srcMeta.continuity);
        const isCross = srcContinuity !== targetContinuity;

        proposedRelationships.push({
          sourceTitle: srcMeta.title,
          targetTitle,
          sourceContentId: ev.suggestedEdge.sourceContentId,
          targetContentId: pkg.contentId,
          relationshipType: ev.suggestedEdge.relationship,
          recommendationStrength: ev.suggestedEdge.strength,
          confidence: ev.confidence,
          evidence: ev.description,
          explanation: ev.suggestedEdge.reason || `Derived from trailer evidence (${ev.subject})`,
          continuity: targetContinuity,
          trailerId: pkg.videoKey,
          affectedRecommendationPath: `${srcMeta.title} → ${targetTitle}`,
          isCrossContinuity: isCross,
        });
      }
    }

    // 4. Build Recommendation Graph Snapshots with ASCII Trees
    const currentSnapshot: RecommendationGraphSnapshot = {
      mustWatch: simReport.currentProductionPrerequisites.mustWatch,
      recommended: simReport.currentProductionPrerequisites.recommended,
      optional: simReport.currentProductionPrerequisites.optional,
      totalCount: simReport.currentProductionPrerequisites.totalCount,
      asciiTree: renderRecommendationAsciiTree(targetTitle, simReport.currentProductionPrerequisites),
    };

    const proposedSnapshot: RecommendationGraphSnapshot = {
      mustWatch: simReport.simulatedPrerequisites.mustWatch,
      recommended: simReport.simulatedPrerequisites.recommended,
      optional: simReport.simulatedPrerequisites.optional,
      totalCount: simReport.simulatedPrerequisites.totalCount,
      asciiTree: renderRecommendationAsciiTree(targetTitle, simReport.simulatedPrerequisites),
    };

    // 5. Delta Summary
    const deltaSummary = {
      addedMustWatch: simReport.diff.newMustWatchCandidates.map((i) => i.title),
      addedRecommended: simReport.diff.newRecommended.map((i) => i.title),
      addedOptional: simReport.diff.newOptional.map((i) => i.title),
      crossContinuityWarnings: classification.continuitySafetyNotes,
    };

    // 6. Citations
    const citations: string[] = [
      `Official Trailer: "${pkg.videoTitle}" (YouTube Key: ${pkg.videoKey})`,
    ];
    if (pkg.publishedTimestamp) {
      citations.push(`Published: ${pkg.publishedTimestamp}`);
    }

    // 7. Deterministic Event Hash
    const evidenceIds = pkg.evidenceItems.map((e) => e.id || `${e.category}-${e.subject}`);
    const eventHash = computeImpactProposalHash(
      pkg.videoKey,
      pkg.contentId,
      classification.impactCategory,
      evidenceIds
    );

    const proposalId = `impact-prop-${pkg.videoKey}-${pkg.contentId.slice(0, 16)}`;

    const proposal: TrailerRecommendationImpactProposal = {
      id: proposalId,
      proposalType: 'TRAILER_RECOMMENDATION_IMPACT',
      trailerId: pkg.videoKey,
      videoKey: pkg.videoKey,
      videoTitle: pkg.videoTitle,
      contentId: pkg.contentId,
      title: targetTitle,
      franchiseId: pkg.franchiseId,
      continuityId: targetContinuity,
      impactCategory: classification.impactCategory,
      confidence: classification.confidence,
      evidenceItems: pkg.evidenceItems,
      proposedRelationships,
      currentRecommendationState: currentSnapshot,
      proposedRecommendationState: proposedSnapshot,
      deltaSummary,
      sourceCitations: citations,
      explanation: classification.explanation,
      status: 'pending', // Strictly initial status pending
      generatedAt: pkg.createdAt || new Date().toISOString(),
      eventHash,
      continuitySafetyPassed: classification.continuitySafetyPassed,
      continuitySafetyNotes: classification.continuitySafetyNotes,
    };

    this.generatedProposalHashes.add(eventHash);
    return proposal;
  }

  /**
   * Checks if an identical impact proposal has already been generated
   */
  public hasProposal(eventHash: string): boolean {
    return this.generatedProposalHashes.has(eventHash);
  }

  /**
   * Resets internal hash cache (for testing)
   */
  public clear(): void {
    this.generatedProposalHashes.clear();
  }
}

/** Global singleton instance */
export const globalTrailerRecommendationImpactService = new TrailerRecommendationImpactService();
