/**
 * CineOrder Trailer Intelligence — Phase 2: Pure Trailer Evidence Extractor Engine
 * 
 * Pure, deterministic extraction engine that transforms verified trailer metadata
 * and explicitly supplied observations into structured, categorized evidence items
 * and candidate CKG story edges.
 * 
 * INVARIANTS:
 * 1. 100% Pure & Deterministic: No Date.now(), Math.random(), UUIDs, or mutable globals.
 * 2. Zero-Fabrication: Decouples OBSERVED vs. INFERRED vs. EDITORIAL vs. VERIFIED.
 * 3. Anti-Inflation: Cameos, visual callbacks, and character appearances are never auto-elevated to Must Watch.
 * 4. Multi-Continuity Firewall: Strict isolation across distinct franchise continuities.
 * 5. Zero Graph Mutation: Strictly produces unmerged proposal objects without touching CKG production data.
 */

import type {
  CKGEdgeRelationship,
  CKGEdgeStrength,
  CKGEdgeConfidence,
} from '@/data/cineOrderKnowledgeGraph';
import type { ProposedStoryEdge } from '@/types/ckgProposal';
import type {
  TrailerClassification,
  VerifiedTrailerMetadata,
  TrailerEvidenceCategory,
  TrailerEvidenceEpistemicState,
  PrerequisiteImpact,
  SuggestedTrailerStoryEdge,
  TrailerEvidenceItem,
  RawTrailerObservationInput,
  TrailerContentContext,
  TrailerProposalPackage,
  TrailerExtractionResult,
} from '@/types/trailerIntelligence';

// ============================================================================
// 1. KNOWN CONTINUITY IDENTIFIERS & CROSS-CONTINUITY MAP
// ============================================================================
export const KNOWN_CONTINUITIES = [
  'spider-man-raimi',
  'spider-man-webb',
  'mcu-616',
  'marvel-cinematic-universe',
  'spider-verse-animated',
  'ssu-sony',
  'dcu-gunn',
  'dceu-snyder',
  'batman-reeves',
  'batman-nolan',
  'star-wars-canon',
  'star-wars-legends',
  'xmen-fox',
  'middle-earth-canon',
  'wizarding-world-canon',
] as const;

// Normalized continuity aliases
export function normalizeContinuityId(continuityId?: string): string {
  if (!continuityId) return 'unknown-continuity';
  const clean = continuityId.trim().toLowerCase();
  if (clean === 'mcu' || clean === 'marvel-cinematic-universe' || clean === 'mcu-616') {
    return 'mcu-616';
  }
  if (clean === 'raimi' || clean === 'spider-man-raimi' || clean === 'tobey-maguire') {
    return 'spider-man-raimi';
  }
  if (clean === 'webb' || clean === 'spider-man-webb' || clean === 'andrew-garfield') {
    return 'spider-man-webb';
  }
  if (clean === 'spider-verse' || clean === 'spider-verse-animated' || clean === 'miles-morales') {
    return 'spider-verse-animated';
  }
  if (clean === 'ssu' || clean === 'ssu-sony' || clean === 'sony-spider-man-universe') {
    return 'ssu-sony';
  }
  if (clean === 'dcu' || clean === 'dcu-gunn' || clean === 'dc-universe') {
    return 'dcu-gunn';
  }
  if (clean === 'dceu' || clean === 'dceu-snyder' || clean === 'dc-extended-universe') {
    return 'dceu-snyder';
  }
  if (clean === 'reeves' || clean === 'batman-reeves' || clean === 'the-batman') {
    return 'batman-reeves';
  }
  if (clean === 'nolan' || clean === 'batman-nolan' || clean === 'dark-knight') {
    return 'batman-nolan';
  }
  return clean;
}

// ============================================================================
// 2. DETERMINISTIC SLUG & ID GENERATION HELPERS
// ============================================================================
export function slugifyText(text: string): string {
  return (text || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

export function formatTimestampSeconds(seconds: number): string {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    return '00:00';
  }
  const totalSecs = Math.floor(seconds);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const remainingSecs = totalSecs % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(remainingSecs).padStart(2, '0');

  if (hours > 0) {
    const hh = String(hours).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function generateEvidenceId(
  contentId: string,
  videoKey: string,
  category: TrailerEvidenceCategory,
  subject: string,
  index: number
): string {
  const normContent = slugifyText(contentId);
  const normVideo = slugifyText(videoKey);
  const normCat = category.toLowerCase().replace(/_/g, '-');
  const normSub = slugifyText(subject);
  return `ev-${normContent}-${normVideo}-${normCat}-${normSub}-${index}`;
}

// ============================================================================
// 3. CONFIDENCE VALIDATION (Strict Bounds: 0.0 <= c <= 1.0)
// ============================================================================
export function validateConfidence(rawConfidence?: number): {
  valid: boolean;
  value: number;
  error?: string;
} {
  if (rawConfidence === undefined || rawConfidence === null) {
    return { valid: true, value: 0.85 }; // Default baseline confidence
  }
  if (typeof rawConfidence !== 'number' || isNaN(rawConfidence)) {
    return { valid: false, value: 0.0, error: 'Confidence must be a valid numeric value.' };
  }
  if (rawConfidence < 0.0 || rawConfidence > 1.0) {
    return {
      valid: false,
      value: Math.max(0.0, Math.min(1.0, rawConfidence)),
      error: `Confidence value ${rawConfidence} is out of bounds. Must be strictly between 0.0 and 1.0.`,
    };
  }
  return { valid: true, value: Number(rawConfidence.toFixed(4)) };
}

// ============================================================================
// 4. ANTI-PREREQUISITE-INFLATION EVALUATION RULES
// ============================================================================
export function evaluatePrerequisiteImpact(
  category: TrailerEvidenceCategory,
  observation: RawTrailerObservationInput,
  isCrossContinuity: boolean
): PrerequisiteImpact {
  // Cross-continuity is capped at RECOMMENDED or OPTIONAL
  if (isCrossContinuity) {
    if (category === 'MULTIVERSE_REFERENCE' || category === 'CROSSOVER_CHARACTER') {
      return observation.isCameoAppearance ? 'OPTIONAL' : 'RECOMMENDED';
    }
    return 'OPTIONAL';
  }

  // Explicit cameo is strictly non-mandatory
  if (observation.isCameoAppearance) {
    return 'OPTIONAL';
  }

  // Visual callbacks alone are non-mandatory
  if (category === 'VISUAL_CALLBACK' || observation.isVisualCallbackOnly) {
    return 'OPTIONAL';
  }

  // Direct narrative continuations & cliffhangers can become MUST_WATCH_CANDIDATE
  if (
    category === 'DIRECT_NARRATIVE_CONTINUATION' ||
    observation.isDirectContinuityCliffhanger
  ) {
    return 'MUST_WATCH_CANDIDATE';
  }

  // Sequel / Prequel continuity with explicit cliffhanger
  if (category === 'SEQUEL_PREQUEL_CONTINUITY') {
    return observation.isDirectContinuityCliffhanger
      ? 'MUST_WATCH_CANDIDATE'
      : 'RECOMMENDED';
  }

  // Character appearance alone is NOT required
  if (category === 'RETURNING_CHARACTER' || category === 'NEW_CHARACTER') {
    return 'OPTIONAL';
  }

  // Antagonists, stated relationships, or factions
  if (
    category === 'VILLAIN' ||
    category === 'FACTION_OR_ORGANIZATION' ||
    category === 'STATED_RELATIONSHIP' ||
    category === 'EXPLICIT_TITLE_REFERENCE'
  ) {
    return 'RECOMMENDED';
  }

  // Background lore, timeline clues, locations, general signals
  if (
    category === 'RETURNING_LOCATION' ||
    category === 'NEW_LOCATION' ||
    category === 'TIMELINE_CLUE' ||
    category === 'FRANCHISE_CONTINUITY_SIGNAL'
  ) {
    return 'OPTIONAL';
  }

  return 'NONE';
}

// ============================================================================
// 5. MULTI-CONTINUITY ISOLATION FIREWALL
// ============================================================================
export function verifyContinuityIsolation(
  targetContinuityId: string,
  sourceContinuityId?: string,
  category?: TrailerEvidenceCategory
): {
  passed: boolean;
  isCrossContinuity: boolean;
  notes: string[];
} {
  const normTarget = normalizeContinuityId(targetContinuityId);
  const normSource = normalizeContinuityId(sourceContinuityId || targetContinuityId);
  const isCross = normTarget !== normSource;
  const notes: string[] = [];

  if (!isCross) {
    return { passed: true, isCrossContinuity: false, notes };
  }

  // Cross-Continuity Detected: Check if explicitly allowed under Multiverse/Crossover rules
  const isCrossoverCategory =
    category === 'MULTIVERSE_REFERENCE' || category === 'CROSSOVER_CHARACTER';

  if (!isCrossoverCategory) {
    notes.push(
      `Continuity Barrier Violation: Title in '${normTarget}' attempted to link to '${normSource}' without explicit MULTIVERSE_REFERENCE or CROSSOVER_CHARACTER classification.`
    );
    return { passed: false, isCrossContinuity: true, notes };
  }

  notes.push(
    `Cross-Continuity Crossover Verified: Linking '${normSource}' to '${normTarget}' under strict Multiverse/Crossover policy.`
  );
  return { passed: true, isCrossContinuity: true, notes };
}

// ============================================================================
// 6. SUGGESTED CKG STORY EDGE BUILDER
// ============================================================================
export function buildSuggestedStoryEdge(
  contentContext: TrailerContentContext,
  observation: RawTrailerObservationInput,
  category: TrailerEvidenceCategory,
  impact: PrerequisiteImpact,
  isCrossContinuity: boolean
): SuggestedTrailerStoryEdge | undefined {
  if (!observation.targetPrerequisiteContentId) {
    return undefined;
  }

  const sourceContentId = observation.targetPrerequisiteContentId.trim();
  const targetContentId = contentContext.contentId.trim();

  if (sourceContentId === targetContentId) {
    return undefined; // Self-loop prevention
  }

  let relationship: CKGEdgeRelationship =
    observation.suggestedRelationshipType || 'story-continuation';
  let strength: CKGEdgeStrength = 'moderate';
  let confidence: CKGEdgeConfidence = 'likely';

  // Cross-Continuity Edge Rules
  if (isCrossContinuity) {
    relationship = 'multiverse';
    strength = 'moderate'; // HARD-CAPPED: Never 'required' for cross-continuity
    confidence = 'likely';
  } else {
    // Intra-Continuity Mapping
    switch (category) {
      case 'DIRECT_NARRATIVE_CONTINUATION':
        relationship = 'direct-sequel';
        strength = 'strong'; // Candidate for Must Watch, but NEVER production 'required' at extraction
        confidence = 'confirmed';
        break;
      case 'SEQUEL_PREQUEL_CONTINUITY':
        relationship = 'direct-sequel';
        strength = impact === 'MUST_WATCH_CANDIDATE' ? 'strong' : 'moderate';
        confidence = 'likely';
        break;
      case 'RETURNING_CHARACTER':
      case 'NEW_CHARACTER':
        relationship = 'shared-character';
        strength = observation.isCameoAppearance ? 'weak' : 'moderate';
        confidence = 'likely';
        break;
      case 'VILLAIN':
        relationship = 'shared-villain';
        strength = 'moderate';
        confidence = 'likely';
        break;
      case 'FACTION_OR_ORGANIZATION':
        relationship = 'organization';
        strength = 'moderate';
        confidence = 'likely';
        break;
      case 'VISUAL_CALLBACK':
        relationship = 'thematic-callback';
        strength = 'weak';
        confidence = 'likely';
        break;
      case 'EXPLICIT_TITLE_REFERENCE':
        relationship = 'story-continuation';
        strength = 'moderate';
        confidence = 'likely';
        break;
      case 'TIMELINE_CLUE':
        relationship = 'timeline';
        strength = 'weak';
        confidence = 'likely';
        break;
      default:
        relationship = observation.suggestedRelationshipType || 'world-building';
        strength = 'weak';
        confidence = 'provisional';
        break;
    }
  }

  const reason =
    observation.observationDescription ||
    `Identified ${category.replace(/_/g, ' ').toLowerCase()} relationship in official trailer.`;

  return {
    sourceContentId,
    targetContentId,
    relationship,
    strength,
    confidence,
    reason,
    narrativeScope: 'main-feature',
    isCrossover: isCrossContinuity,
  };
}

// ============================================================================
// 7. PURE TRAILER EVIDENCE EXTRACTOR (Primary Entrypoint)
// ============================================================================
export interface TrailerExtractionInput {
  trailer: VerifiedTrailerMetadata | {
    videoKey: string;
    videoTitle: string;
    classification?: TrailerClassification;
    sourceUrl?: string;
    sourcePublisher?: string;
    isOfficial?: boolean;
    publishedAt?: string;
  };
  contentContext: TrailerContentContext;
  observations: RawTrailerObservationInput[];
}

export function extractTrailerEvidence(
  input: TrailerExtractionInput
): TrailerExtractionResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const evidenceItems: TrailerEvidenceItem[] = [];
  const proposedEdges: ProposedStoryEdge[] = [];
  const continuitySafetyNotes: string[] = [];
  let allContinuityPassed = true;

  // 1. Validate Source Metadata Presence
  const videoKey = (input.trailer?.videoKey || '').trim();
  const videoTitle = (input.trailer?.videoTitle || '').trim();

  if (!videoKey) {
    errors.push('Missing required trailer video key.');
  }
  if (!videoTitle) {
    errors.push('Missing required trailer video title.');
  }
  if (!input.contentContext?.contentId) {
    errors.push('Missing required target content ID.');
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
      warnings,
      evidenceItems: [],
      proposedEdges: [],
      continuitySafetyPassed: false,
      continuitySafetyNotes: ['Source metadata validation failed.'],
      targetContentId: input.contentContext?.contentId || 'unknown',
      franchiseId: input.contentContext?.franchiseId || 'unknown',
      continuityId: input.contentContext?.continuityId || 'unknown',
      totalEvidenceCount: 0,
      mustWatchCandidateCount: 0,
      recommendedCount: 0,
      optionalCount: 0,
    };
  }

  const targetContinuity = normalizeContinuityId(input.contentContext.continuityId);
  let mustWatchCount = 0;
  let recommendedCount = 0;
  let optionalCount = 0;

  // 2. Iterate Over Supplied Observations (Pure & Deterministic)
  input.observations.forEach((obs, idx) => {
    // Validate Subject & Description
    const subject = (obs.subject || '').trim();
    if (!subject) {
      warnings.push(`Observation at index ${idx} missing subject. Skipped.`);
      return;
    }
    const description = (obs.observationDescription || '').trim();
    if (!description) {
      warnings.push(`Observation for '${subject}' at index ${idx} missing description.`);
    }

    // Validate & Normalize Confidence
    const confResult = validateConfidence(obs.rawConfidence);
    if (!confResult.valid && confResult.error) {
      errors.push(`Observation '${subject}' (index ${idx}): ${confResult.error}`);
      return; // Reject invalid confidence
    }

    // Multi-Continuity Verification
    const sourceContinuity = obs.sourceContinuityId
      ? normalizeContinuityId(obs.sourceContinuityId)
      : targetContinuity;
    const contCheck = verifyContinuityIsolation(targetContinuity, sourceContinuity, obs.category);

    if (!contCheck.passed) {
      allContinuityPassed = false;
      contCheck.notes.forEach((n) => continuitySafetyNotes.push(n));
      warnings.push(
        `Observation '${subject}' failed continuity isolation barrier. Cross-continuity links without MULTIVERSE_REFERENCE or CROSSOVER_CHARACTER are isolated.`
      );
    } else if (contCheck.isCrossContinuity) {
      contCheck.notes.forEach((n) => continuitySafetyNotes.push(n));
    }

    // Evaluate Prerequisite Impact
    const impact = evaluatePrerequisiteImpact(obs.category, obs, contCheck.isCrossContinuity);
    if (impact === 'MUST_WATCH_CANDIDATE') mustWatchCount++;
    else if (impact === 'RECOMMENDED') recommendedCount++;
    else if (impact === 'OPTIONAL') optionalCount++;

    // Epistemic State: Zero-Fabrication Rule
    // By default, raw visual observations are 'OBSERVED' or 'INFERRED'. Never 'VERIFIED' automatically.
    const verificationState: TrailerEvidenceEpistemicState =
      obs.initialState === 'VERIFIED'
        ? 'EDITORIAL' // Down-grade unverified raw claims to EDITORIAL
        : obs.initialState || 'OBSERVED';

    // Format Timestamp
    const formattedTimestamp =
      obs.timestampFormatted ||
      (typeof obs.timestampSeconds === 'number'
        ? formatTimestampSeconds(obs.timestampSeconds)
        : undefined);

    // Build Evidence Item ID
    const evidenceId = generateEvidenceId(
      input.contentContext.contentId,
      videoKey,
      obs.category,
      subject,
      idx + 1
    );

    // Build Suggested Story Edge (if applicable & passed continuity check)
    let suggestedEdge: SuggestedTrailerStoryEdge | undefined;
    if (obs.targetPrerequisiteContentId && contCheck.passed) {
      suggestedEdge = buildSuggestedStoryEdge(
        input.contentContext,
        obs,
        obs.category,
        impact,
        contCheck.isCrossContinuity
      );

      if (suggestedEdge) {
        // Construct Candidate ProposedStoryEdge for CKG Proposal Store
        const edgeId = `edge-${evidenceId}`;
        const proposedEdge: ProposedStoryEdge = {
          id: edgeId,
          sourceId: suggestedEdge.sourceContentId,
          targetId: suggestedEdge.targetContentId,
          relationship: suggestedEdge.relationship,
          strength: suggestedEdge.strength,
          confidence: suggestedEdge.confidence,
          reason: suggestedEdge.reason,
          sourceType: 'official-trailer',
          sourceText: `[Trailer Evidence: ${obs.category}] ${subject} — ${description}`,
          sourceUrl: input.trailer.sourceUrl || (videoKey ? `https://www.youtube.com/watch?v=${videoKey}` : undefined),
          citation: `Official Trailer: "${videoTitle}"`,
          extractionDate: '2026-08-17',
          confidenceScore: confResult.value,
          proposedAt: '2026-08-17T00:00:00.000Z',
          status: 'pending', // Strict non-bypassable pending status
          narrativeScope: suggestedEdge.narrativeScope || 'main-feature',
        };
        proposedEdges.push(proposedEdge);
      }
    }

    const item: TrailerEvidenceItem = {
      id: evidenceId,
      category: obs.category,
      subject,
      description,
      timestampSeconds: obs.timestampSeconds,
      timestampFormatted: formattedTimestamp,
      videoKey,
      videoTitle,
      confidence: confResult.value,
      verificationState,
      prerequisiteImpact: impact,
      suggestedEdge,
      narrativeScope: suggestedEdge?.narrativeScope || 'main-feature',
      continuityId: obs.sourceContinuityId ? normalizeContinuityId(obs.sourceContinuityId) : targetContinuity,
      sourceTrailerUrl: input.trailer.sourceUrl,
      sourcePublisher: (input.trailer as any).sourcePublisher || 'Official Studio',
      visualClues: obs.visualClues || [],
      dialogueQuotes: obs.dialogueQuotes || [],
    };

    evidenceItems.push(item);
  });

  return {
    success: errors.length === 0,
    errors,
    warnings,
    evidenceItems,
    proposedEdges,
    continuitySafetyPassed: allContinuityPassed,
    continuitySafetyNotes,
    targetContentId: input.contentContext.contentId,
    franchiseId: input.contentContext.franchiseId,
    continuityId: targetContinuity,
    totalEvidenceCount: evidenceItems.length,
    mustWatchCandidateCount: mustWatchCount,
    recommendedCount: recommendedCount,
    optionalCount: optionalCount,
  };
}

// ============================================================================
// 8. PURE PROPOSAL PACKAGE BUILDER
// ============================================================================
export function buildTrailerProposalPackage(
  contentContext: TrailerContentContext,
  trailer: VerifiedTrailerMetadata | {
    videoKey: string;
    videoTitle: string;
    videoSite?: string;
    classification?: TrailerClassification;
    publishedAt?: string;
  },
  extractionResult: TrailerExtractionResult,
  fixedCreatedAt = '2026-08-17T00:00:00.000Z'
): TrailerProposalPackage {
  const normContinuity = normalizeContinuityId(contentContext.continuityId);
  const videoKey = (trailer.videoKey || '').trim();
  const pkgId = `prop-trailer-${contentContext.franchiseId}-${contentContext.contentId}-${videoKey}`;

  // Compute aggregate confidence
  let confSum = 0;
  extractionResult.evidenceItems.forEach((e) => {
    confSum += e.confidence;
  });
  const overallConfidence =
    extractionResult.evidenceItems.length > 0
      ? Number((confSum / extractionResult.evidenceItems.length).toFixed(2))
      : 0.85;

  const qualityScore = Math.round(
    overallConfidence * 70 +
      (extractionResult.evidenceItems.length > 0 ? 20 : 0) +
      (extractionResult.continuitySafetyPassed ? 10 : 0)
  );

  return {
    id: pkgId,
    franchiseId: contentContext.franchiseId,
    contentId: contentContext.contentId,
    continuityId: normContinuity,
    tmdbId: contentContext.tmdbId || 0,
    videoKey,
    videoSite: (trailer as any).videoSite || 'YouTube',
    videoTitle: trailer.videoTitle || 'Official Trailer',
    videoClassification: trailer.classification || 'OFFICIAL_TRAILER',
    publishedTimestamp: trailer.publishedAt,
    evidenceItems: extractionResult.evidenceItems,
    proposedStoryEdges: extractionResult.proposedEdges,
    reviewStatus: 'pending', // 100% strictly pending
    createdAt: fixedCreatedAt,
    overallConfidence,
    continuitySafetyPassed: extractionResult.continuitySafetyPassed,
    continuitySafetyNotes: extractionResult.continuitySafetyNotes,
    qualityBreakdown: {
      completeness: extractionResult.evidenceItems.length > 0 ? 100 : 0,
      citationQuality: 95,
      confidence: Math.round(overallConfidence * 100),
      overallQuality: qualityScore,
    },
  };
}
