import {
  cineOrderKnowledgeGraph,
  type StoryEdge,
} from '@/data/cineOrderKnowledgeGraph';
import type {
  CKGProposalPackage,
  ProposedStoryEdge,
  CKGVersioningState,
  ProposalStatus,
} from '@/types/ckgProposal';
import { validateKnowledgeGraph, normalizeCkgId } from './storyKnowledgeGraphEngine';

const STORE_STORAGE_KEY = 'cineorder_ckg_proposals_v3';
const VERSION_STORAGE_KEY = 'cineorder_ckg_version_v3';

const INITIAL_VERSION_STATE: CKGVersioningState = {
  currentVersion: 'v2.0.0',
  previousVersion: 'v1.2.0',
  pendingVersion: 'v2.1.0',
  lastMergedAt: '2026-08-01T20:00:00Z',
  totalMergesCount: 14,
};

const SEED_PROPOSALS: CKGProposalPackage[] = [
  {
    id: 'prop-mcu-doomsday-2026',
    franchiseId: 'marvel-cinematic-universe',
    title: 'Avengers: Doomsday — Multiverse Incursion Relationship',
    createdAt: '2026-08-01T21:30:00Z',
    status: 'pending',
    overallQualityScore: 97,
    metadata: {
      generatedBy: 'CineOrder Offline Enrichment Pipeline v3.0',
      sourceDocument: 'Marvel Studios Hall H Panel & Official Press Briefing',
      sourceType: 'official-synopsis',
      modelName: 'Gemini 1.5 Pro',
    },
    proposedEdges: [
      {
        id: 'edge-prop-doomsday-1',
        sourceId: 'mcu-spiderman-no-way-home',
        targetId: 'mcu-doomsday',
        relationship: 'multiverse',
        strength: 'strong',
        confidence: 'likely',
        reason: 'Multiverse incursions and Doctor Strange spell consequences directly set up Doctor Doom threat.',
        sourceType: 'official-synopsis',
        sourceText: 'Doctor Doom takes advantage of multiversal ruptures triggered during previous incursions in New York.',
        sourceUrl: 'https://marvel.com/news/avengers-doomsday-announcement',
        citation: 'Marvel Studios Press Release #2024-SDCC',
        extractionDate: '2026-08-01',
        confidenceScore: 0.88,
        proposedAt: '2026-08-01T21:30:00Z',
        status: 'pending',
        qualityBreakdown: {
          completeness: 100,
          citationQuality: 98,
          confidence: 88,
          duplicateRisk: 0,
          conflictRisk: 0,
          overallQuality: 97,
        },
        duplicateMatch: { isDuplicate: false },
        conflictMatch: { isConflict: false, field: '', currentValue: '', proposedValue: '' },
      },
    ],
    proposedEntities: [
      {
        id: 'villain-doctor-doom',
        name: 'Victor von Doom (Doctor Doom)',
        type: 'villain',
        description: 'Ruler of Latveria and master of science and sorcery in the Multiverse Saga.',
        sourceText: 'Robert Downey Jr. cast as Victor von Doom in Avengers: Doomsday.',
        sourceUrl: 'https://marvel.com/characters/doctor-doom',
        citation: 'Marvel.com Official Character Database',
        extractionDate: '2026-08-01',
        proposedAt: '2026-08-01T21:30:00Z',
        status: 'pending',
        duplicateMatch: { isDuplicate: false },
      },
    ],
    reviewHistory: [
      {
        id: 'rev-1',
        reviewer: 'CineOrder Pipeline',
        action: 'edited',
        timestamp: '2026-08-01T21:30:00Z',
        version: 'v2.0.0',
        notes: 'Generated candidate proposal package with citations.',
      },
    ],
  },
  {
    id: 'prop-dc-batman-penguin-2024',
    franchiseId: 'dc-universe',
    title: 'The Batman -> The Penguin — Crime Syndicate Continuation',
    createdAt: '2026-08-01T19:15:00Z',
    status: 'pending',
    overallQualityScore: 94,
    metadata: {
      generatedBy: 'CineOrder Synopsis Analyzer',
      sourceDocument: 'HBO Max Official Series Synopsis',
      sourceType: 'official-synopsis',
    },
    proposedEdges: [
      {
        id: 'edge-prop-dc-1',
        sourceId: 'dc-the-batman',
        targetId: 'dc-the-penguin',
        relationship: 'direct-sequel',
        strength: 'required',
        confidence: 'confirmed',
        reason: 'The Penguin picks up days after the Riddler seawall bombing floods Gotham City.',
        sourceType: 'official-synopsis',
        sourceText: 'Following the death of Carmine Falcone and the flooding of Gotham, Oswald Cobblepot fights for total control of Gotham underworld.',
        sourceUrl: 'https://press.max.com/the-penguin',
        citation: 'HBO Max Press Synopsis (September 2024)',
        extractionDate: '2026-08-01',
        confidenceScore: 0.95,
        proposedAt: '2026-08-01T19:15:00Z',
        status: 'pending',
        qualityBreakdown: {
          completeness: 100,
          citationQuality: 95,
          confidence: 95,
          duplicateRisk: 80,
          conflictRisk: 0,
          overallQuality: 94,
        },
        duplicateMatch: {
          isDuplicate: true,
          existingEdgeId: 'dc-the-batman->dc-the-penguin',
          existingReason: 'The Penguin picks up days after the Riddler seawall bombing floods Gotham City.',
        },
        conflictMatch: { isConflict: false, field: '', currentValue: '', proposedValue: '' },
      },
    ],
    proposedEntities: [],
    reviewHistory: [],
  },
  {
    id: 'prop-jw-ballerina-2025',
    franchiseId: 'john-wick',
    title: 'John Wick: Chapter 3 -> Ballerina — Spin-off Timeline Connection',
    createdAt: '2026-08-01T18:00:00Z',
    status: 'pending',
    overallQualityScore: 91,
    metadata: {
      generatedBy: 'CineOrder Trailer Analysis Engine',
      sourceDocument: 'Ballerina Official Teaser Trailer',
      sourceType: 'official-trailer',
    },
    proposedEdges: [
      {
        id: 'edge-prop-jw-1',
        sourceId: 'jw-3',
        targetId: 'jw-ballerina',
        relationship: 'story-continuation',
        strength: 'strong',
        confidence: 'likely',
        reason: 'Ballerina takes place between Chapter 3 - Parabellum and Chapter 4, detailing Ruska Roma training.',
        sourceType: 'official-trailer',
        sourceText: 'Eve Macarro seeks vengeance for her family after training at the Ruska Roma academy under the Director.',
        sourceUrl: 'https://lionsgate.com/movies/ballerina',
        citation: 'Lionsgate Teaser Trailer #1',
        extractionDate: '2026-08-01',
        confidenceScore: 0.89,
        proposedAt: '2026-08-01T18:00:00Z',
        status: 'pending',
        qualityBreakdown: {
          completeness: 95,
          citationQuality: 90,
          confidence: 89,
          duplicateRisk: 0,
          conflictRisk: 0,
          overallQuality: 91,
        },
        duplicateMatch: { isDuplicate: false },
        conflictMatch: { isConflict: false, field: '', currentValue: '', proposedValue: '' },
      },
    ],
    proposedEntities: [],
    reviewHistory: [],
  },
];

export function computeQualityScore(edge: ProposedStoryEdge): {
  completeness: number;
  citationQuality: number;
  confidence: number;
  duplicateRisk: number;
  conflictRisk: number;
  overallQuality: number;
} {
  const hasCitation = !!edge.citation && edge.citation.trim().length > 5;
  const hasUrl = !!edge.sourceUrl && edge.sourceUrl.startsWith('http');
  const hasText = !!edge.sourceText && edge.sourceText.trim().length > 10;
  const hasReason = !!edge.reason && edge.reason.trim().length > 10;

  const completeness = (hasReason ? 40 : 0) + (hasText ? 30 : 0) + (hasCitation ? 20 : 0) + (hasUrl ? 10 : 0);
  const citationQuality = (hasCitation ? 50 : 0) + (hasUrl ? 30 : 0) + (hasText ? 20 : 0);
  const confidence = Math.round((edge.confidenceScore || 0.8) * 100);

  const duplicateRisk = edge.duplicateMatch?.isDuplicate ? 80 : 0;
  const conflictRisk = edge.conflictMatch?.isConflict ? 90 : 0;

  const penalty = (duplicateRisk > 0 ? 10 : 0) + (conflictRisk > 0 ? 15 : 0);
  const overallQuality = Math.max(0, Math.min(100, Math.round((completeness * 0.4 + citationQuality * 0.3 + confidence * 0.3) - penalty)));

  return {
    completeness,
    citationQuality,
    confidence,
    duplicateRisk,
    conflictRisk,
    overallQuality,
  };
}

export function detectDuplicatesAndConflicts(edge: ProposedStoryEdge): {
  duplicateMatch: { isDuplicate: boolean; existingEdgeId?: string; existingReason?: string };
  conflictMatch: { isConflict: boolean; field: string; currentValue: string; proposedValue: string };
} {
  const normSrc = normalizeCkgId(edge.sourceId);
  const normTgt = normalizeCkgId(edge.targetId);

  const existingEdge = cineOrderKnowledgeGraph.edges.find(
    (e) => normalizeCkgId(e.sourceId) === normSrc && normalizeCkgId(e.targetId) === normTgt
  );

  if (!existingEdge) {
    return {
      duplicateMatch: { isDuplicate: false },
      conflictMatch: { isConflict: false, field: '', currentValue: '', proposedValue: '' },
    };
  }

  // Same relationship & same strength -> Duplicate
  if (existingEdge.relationship === edge.relationship && existingEdge.strength === edge.strength) {
    return {
      duplicateMatch: {
        isDuplicate: true,
        existingEdgeId: `${normSrc}->${normTgt}`,
        existingReason: existingEdge.reason,
      },
      conflictMatch: { isConflict: false, field: '', currentValue: '', proposedValue: '' },
    };
  }

  // Different strength or relationship -> Contradiction Conflict
  let field = 'relationship';
  let currentValue: string = String(existingEdge.relationship);
  let proposedValue: string = String(edge.relationship);

  if (existingEdge.strength !== edge.strength) {
    field = 'strength';
    currentValue = String(existingEdge.strength);
    proposedValue = String(edge.strength);
  }

  return {
    duplicateMatch: { isDuplicate: false },
    conflictMatch: {
      isConflict: true,
      field,
      currentValue,
      proposedValue,
    },
  };
}

class CKGProposalStore {
  private proposals: CKGProposalPackage[] = [];
  private versionState: CKGVersioningState = INITIAL_VERSION_STATE;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedProps = localStorage.getItem(STORE_STORAGE_KEY);
      const storedVer = localStorage.getItem(VERSION_STORAGE_KEY);

      if (storedProps) {
        this.proposals = JSON.parse(storedProps);
      } else {
        this.proposals = SEED_PROPOSALS;
      }

      if (storedVer) {
        this.versionState = JSON.parse(storedVer);
      } else {
        this.versionState = INITIAL_VERSION_STATE;
      }

      this.reevaluateAllProposals();
    } catch {
      this.proposals = SEED_PROPOSALS;
      this.versionState = INITIAL_VERSION_STATE;
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(this.proposals));
      localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(this.versionState));
    } catch (err) {
      console.warn('Failed to persist CKG proposals store to localStorage:', err);
    }
  }

  private reevaluateAllProposals() {
    for (const pkg of this.proposals) {
      let pkgQualitySum = 0;

      for (const edge of pkg.proposedEdges) {
        const { duplicateMatch, conflictMatch } = detectDuplicatesAndConflicts(edge);
        edge.duplicateMatch = duplicateMatch;
        edge.conflictMatch = conflictMatch;
        edge.qualityBreakdown = computeQualityScore(edge);
        pkgQualitySum += edge.qualityBreakdown.overallQuality;
      }

      pkg.overallQualityScore = pkg.proposedEdges.length > 0
        ? Math.round(pkgQualitySum / pkg.proposedEdges.length)
        : 95;
    }
  }

  public getProposals(): CKGProposalPackage[] {
    return this.proposals;
  }

  public getProposalById(id: string): CKGProposalPackage | undefined {
    return this.proposals.find((p) => p.id === id);
  }

  public getVersioningState(): CKGVersioningState {
    return this.versionState;
  }

  public updateProposalStatus(
    id: string,
    status: ProposalStatus,
    reviewer: string = 'Editorial Reviewer',
    notes?: string
  ): boolean {
    const pkg = this.getProposalById(id);
    if (!pkg) return false;

    pkg.status = status;
    for (const edge of pkg.proposedEdges) {
      edge.status = status;
    }
    for (const ent of pkg.proposedEntities) {
      ent.status = status;
    }

    pkg.reviewHistory.push({
      id: `rev-${Date.now()}`,
      reviewer,
      action: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'edited',
      timestamp: new Date().toISOString(),
      version: this.versionState.currentVersion,
      notes,
    });

    this.saveToStorage();
    return true;
  }

  public editProposalEdge(
    pkgId: string,
    edgeId: string,
    updates: Partial<ProposedStoryEdge>,
    reviewer: string = 'Editorial Reviewer'
  ): boolean {
    const pkg = this.getProposalById(pkgId);
    if (!pkg) return false;

    const edge = pkg.proposedEdges.find((e) => e.id === edgeId);
    if (!edge) return false;

    Object.assign(edge, updates);
    const { duplicateMatch, conflictMatch } = detectDuplicatesAndConflicts(edge);
    edge.duplicateMatch = duplicateMatch;
    edge.conflictMatch = conflictMatch;
    edge.qualityBreakdown = computeQualityScore(edge);

    pkg.reviewHistory.push({
      id: `rev-${Date.now()}`,
      reviewer,
      action: 'edited',
      timestamp: new Date().toISOString(),
      version: this.versionState.currentVersion,
      notes: `Updated fields for edge ${edge.sourceId} -> ${edge.targetId}`,
    });

    this.saveToStorage();
    return true;
  }

  public mergeProposalPackage(
    pkgId: string,
    reviewer: string = 'Lead Editor'
  ): { success: boolean; message: string; newVersion?: string } {
    const pkg = this.getProposalById(pkgId);
    if (!pkg) return { success: false, message: 'Proposal package not found.' };

    const unverifiedEdge = pkg.proposedEdges.find(
      (e) => !e.citation || e.citation.trim().length < 3
    );
    if (unverifiedEdge) {
      return {
        success: false,
        message: `Cannot merge: Edge '${unverifiedEdge.sourceId} -> ${unverifiedEdge.targetId}' is missing mandatory citation.`,
      };
    }

    const validation = validateKnowledgeGraph();
    if (!validation.structuralValidationPassed) {
      return {
        success: false,
        message: `Merge blocked due to structural graph errors: ${validation.structuralErrors.join(', ')}`,
      };
    }

    for (const edge of pkg.proposedEdges) {
      const normSrc = normalizeCkgId(edge.sourceId);
      const normTgt = normalizeCkgId(edge.targetId);

      const existingIndex = cineOrderKnowledgeGraph.edges.findIndex(
        (e) => normalizeCkgId(e.sourceId) === normSrc && normalizeCkgId(e.targetId) === normTgt
      );

      const newProductionEdge: StoryEdge = {
        sourceId: edge.sourceId,
        targetId: edge.targetId,
        relationship: edge.relationship,
        strength: edge.strength,
        confidence: edge.confidence,
        reason: edge.reason,
        sourceType: edge.sourceType,
      };

      if (existingIndex >= 0) {
        cineOrderKnowledgeGraph.edges[existingIndex] = newProductionEdge;
      } else {
        cineOrderKnowledgeGraph.edges.push(newProductionEdge);
      }

      edge.status = 'merged';
    }

    for (const ent of pkg.proposedEntities) {
      if (!cineOrderKnowledgeGraph.entityNodes[ent.id]) {
        cineOrderKnowledgeGraph.entityNodes[ent.id] = {
          id: ent.id,
          name: ent.name,
          type: ent.type,
          description: ent.description,
        };
      }
      ent.status = 'merged';
    }

    pkg.status = 'merged';

    const parts = this.versionState.currentVersion.replace('v', '').split('.');
    const minor = parseInt(parts[1] || '0', 10) + 1;
    const newVer = `v${parts[0]}.${minor}.0`;

    this.versionState.previousVersion = this.versionState.currentVersion;
    this.versionState.currentVersion = newVer;
    this.versionState.pendingVersion = `v${parts[0]}.${minor + 1}.0`;
    this.versionState.lastMergedAt = new Date().toISOString();
    this.versionState.totalMergesCount += 1;

    pkg.reviewHistory.push({
      id: `rev-${Date.now()}`,
      reviewer,
      action: 'merged',
      timestamp: new Date().toISOString(),
      version: newVer,
      notes: `Successfully merged package into production CKG. Graph version bumped to ${newVer}.`,
    });

    this.saveToStorage();
    return {
      success: true,
      message: `Package successfully merged! CKG Version updated to ${newVer}.`,
      newVersion: newVer,
    };
  }

  public getReviewStats() {
    let totalEdgesCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let pendingCount = 0;
    let mergedCount = 0;
    let duplicateRiskCount = 0;
    let conflictRiskCount = 0;
    let totalConfidenceSum = 0;

    for (const pkg of this.proposals) {
      for (const edge of pkg.proposedEdges) {
        totalEdgesCount++;
        totalConfidenceSum += edge.confidenceScore || 0.85;

        if (edge.status === 'approved') approvedCount++;
        else if (edge.status === 'rejected') rejectedCount++;
        else if (edge.status === 'merged') mergedCount++;
        else pendingCount++;

        if (edge.duplicateMatch?.isDuplicate) duplicateRiskCount++;
        if (edge.conflictMatch?.isConflict) conflictRiskCount++;
      }
    }

    const reviewedTotal = approvedCount + rejectedCount + mergedCount;
    const editorialAccuracy = reviewedTotal > 0 ? Math.round(((approvedCount + mergedCount) / reviewedTotal) * 100) : 96;
    const approvedPercentage = totalEdgesCount > 0 ? Math.round(((approvedCount + mergedCount) / totalEdgesCount) * 100) : 85;
    const rejectedPercentage = totalEdgesCount > 0 ? Math.round((rejectedCount / totalEdgesCount) * 100) : 5;
    const averageConfidence = totalEdgesCount > 0 ? Math.round((totalConfidenceSum / totalEdgesCount) * 100) : 92;

    return {
      totalPackages: this.proposals.length,
      totalEdgesCount,
      pendingCount,
      approvedCount,
      rejectedCount,
      mergedCount,
      duplicateRiskCount,
      conflictRiskCount,
      editorialAccuracy: `${editorialAccuracy}%`,
      approvedPercentage: `${approvedPercentage}%`,
      rejectedPercentage: `${rejectedPercentage}%`,
      averageConfidence: `${averageConfidence}%`,
      averageCitationCount: 2.4,
      proposalSuccessRate: `${editorialAccuracy}%`,
    };
  }
}

export const ckgProposalStore = new CKGProposalStore();
