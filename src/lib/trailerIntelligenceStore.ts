/**
 * CineOrder Trailer Intelligence — Phase 3: Deterministic Store & Persistence Pipeline
 * 
 * Manages trailer lifecycle state, historical trailer versions, proposal tracking,
 * and deterministic event generation for GlobalAnnouncementMonitor integration.
 * 
 * INVARIANTS:
 * 1. Determinism: Zero Date.now() in event identities or hashes.
 * 2. Idempotency: 1 scan or 100 repeated scans produce 0 duplicate records or proposals.
 * 3. Non-Destructive: Older replaced/removed trailers preserved in historical records.
 * 4. Zero Automatic Production Mutation: All generated proposals strictly start as 'pending'.
 */

import { classifyTMDbVideo } from './trailerDiscoveryEngine';
import {
  extractTrailerEvidence,
  buildTrailerProposalPackage,
  normalizeContinuityId,
} from './trailerEvidenceExtractor';
import type {
  RawTMDbVideo,
  VerifiedTrailerMetadata,
  TrailerLifecycleEventType,
} from '@/types/trailerDiscovery';
import type {
  TrailerEvidenceItem,
  RawTrailerObservationInput,
  TrailerContentContext,
  TrailerProposalPackage,
  TrackedTrailerRecord,
  HistoricalTrailerVersion,
  TrailerMonitorScanResult,
  TrailerRecommendationImpactProposal,
  TrailerReviewAuditLogEntry,
} from '@/types/trailerIntelligence';
import { globalTrailerRecommendationImpactService } from './trailerRecommendationImpactService';
import type { ProposalStatus } from '@/types/ckgProposal';
import type { Content } from '@/types';

// ============================================================================
// 1. STORAGE KEYS & ADAPTERS
// ============================================================================
export const TRAILER_INTELLIGENCE_STORE_KEY = 'cineorder_trailer_intelligence_store_v1';

export interface TrailerStoreSerializedState {
  records: TrackedTrailerRecord[];
  proposals: TrailerProposalPackage[];
  eventHashes: string[];
  auditLogs?: TrailerReviewAuditLogEntry[];
}

export interface TrailerIntelligenceStorageAdapter {
  load(): TrailerStoreSerializedState | null;
  save(state: TrailerStoreSerializedState): void;
}

export class UniversalTrailerStorageAdapter implements TrailerIntelligenceStorageAdapter {
  private memoryState: TrailerStoreSerializedState | null = null;

  load(): TrailerStoreSerializedState | null {
    if (this.memoryState) {
      return {
        records: [...this.memoryState.records],
        proposals: [...this.memoryState.proposals],
        eventHashes: [...this.memoryState.eventHashes],
        auditLogs: [...(this.memoryState.auditLogs || [])],
      };
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(TRAILER_INTELLIGENCE_STORE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.records) && Array.isArray(parsed.proposals)) {
            return {
              ...parsed,
              auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
            };
          }
        }
      } catch (err) {
        console.warn('Failed to parse trailer intelligence store from localStorage:', err);
      }
    }
    return null;
  }

  save(state: TrailerStoreSerializedState): void {
    this.memoryState = {
      records: [...state.records],
      proposals: [...state.proposals],
      eventHashes: [...state.eventHashes],
      auditLogs: [...(state.auditLogs || [])],
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(TRAILER_INTELLIGENCE_STORE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error('Failed to persist trailer intelligence store to localStorage:', err);
      }
    }
  }
}

// ============================================================================
// 2. DETERMINISTIC HASH GENERATORS (Zero Date.now() in identity)
// ============================================================================
export function computeTrailerMetadataHash(
  franchiseId: string,
  contentId: string,
  videoKey: string,
  videoTitle: string,
  classification: string,
  publishedAt?: string
): string {
  const payload = [
    (franchiseId || '').trim().toLowerCase(),
    (contentId || '').trim().toLowerCase(),
    (videoKey || '').trim(),
    (videoTitle || '').trim().toLowerCase(),
    (classification || '').trim().toUpperCase(),
    (publishedAt || '').trim(),
  ].join('|');

  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  let h3 = 0x9e3779b9;
  let h4 = 0x85ebca6b;

  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 2246822507);
    h4 = Math.imul(h4 ^ ch, 3266489909);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h3 ^ (h3 >>> 13), 3266489909);
  h3 = Math.imul(h3 ^ (h3 >>> 16), 2246822507) ^ Math.imul(h4 ^ (h4 >>> 13), 3266489909);
  h4 = Math.imul(h4 ^ (h4 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const hex3 = (h3 >>> 0).toString(16).padStart(8, '0');
  const hex4 = (h4 >>> 0).toString(16).padStart(8, '0');

  return `tm-${hex1}${hex2}${hex3}${hex4}`;
}

export function computeEvidenceHash(evidenceItems: TrailerEvidenceItem[]): string {
  if (!evidenceItems || evidenceItems.length === 0) {
    return 'ev-empty-0000000000000000';
  }

  const sortedPayload = evidenceItems
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((e) => `${e.id}|${e.category}|${e.subject}|${e.confidence}|${e.prerequisiteImpact}|${e.suggestedEdge?.relationship || 'none'}`)
    .join('||');

  let h1 = 0x12345678;
  let h2 = 0x87654321;
  let h3 = 0xdeadbeef;
  let h4 = 0xcafe1234;

  for (let i = 0; i < sortedPayload.length; i++) {
    const ch = sortedPayload.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2246822507);
    h2 = Math.imul(h2 ^ ch, 3266489909);
    h3 = Math.imul(h3 ^ ch, 2654435761);
    h4 = Math.imul(h4 ^ ch, 1597334677);
  }

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const hex3 = (h3 >>> 0).toString(16).padStart(8, '0');
  const hex4 = (h4 >>> 0).toString(16).padStart(8, '0');

  return `eh-${hex1}${hex2}${hex3}${hex4}`;
}

export function computeTrailerLifecycleEventHash(
  franchiseId: string,
  contentId: string,
  videoKey: string,
  eventType: TrailerLifecycleEventType,
  metadataHash: string,
  evidenceHash: string
): string {
  const payload = [
    (franchiseId || '').trim().toLowerCase(),
    (contentId || '').trim().toLowerCase(),
    (videoKey || '').trim(),
    eventType,
    metadataHash,
    evidenceHash,
  ].join('|');

  let h1 = 0x5a5a5a5a;
  let h2 = 0xa5a5a5a5;
  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `evt-tr-${eventType.toLowerCase().replace(/_/g, '-')}-${hex1}${hex2}`;
}

// ============================================================================
// 3. DETERMINISTIC TRAILER INTELLIGENCE STORE
// ============================================================================
export class TrailerIntelligenceStore {
  private records: Map<string, TrackedTrailerRecord> = new Map();
  private proposals: Map<string, TrailerProposalPackage> = new Map();
  private eventHashes: Set<string> = new Set();
  private auditLogs: TrailerReviewAuditLogEntry[] = [];
  private storageAdapter: TrailerIntelligenceStorageAdapter;

  constructor(adapter?: TrailerIntelligenceStorageAdapter) {
    this.storageAdapter = adapter || new UniversalTrailerStorageAdapter();
    this.load();
  }

  private load(): void {
    try {
      const state = this.storageAdapter.load();
      if (state) {
        this.records.clear();
        this.proposals.clear();
        this.eventHashes.clear();
        this.auditLogs = [];

        for (const rec of state.records) {
          this.records.set(rec.trailerIdentity, rec);
        }
        for (const prop of state.proposals) {
          this.proposals.set(prop.id, prop);
        }
        for (const hash of state.eventHashes) {
          this.eventHashes.add(hash);
        }
        if (Array.isArray(state.auditLogs)) {
          this.auditLogs = [...state.auditLogs];
        }
      } else {
        this.seedCuratedProposals();
      }
    } catch (err) {
      console.warn('TrailerIntelligenceStore: failed to load state from adapter, initializing empty:', err);
    }
  }

  public seedCuratedProposals(): void {
    if (this.proposals.size > 0) return;

    // 1. MCU Thunderbolts*
    const tbContext: TrailerContentContext = {
      contentId: 'mcu-thunderbolts-2025',
      franchiseId: 'marvel-cinematic-universe',
      continuityId: 'mcu-616',
      title: 'Thunderbolts*',
      tmdbId: 775312,
    };
    const tbVideo: RawTMDbVideo = {
      id: 'vid-tb-seed',
      key: 'dQw4w9WgXcQ',
      name: "Marvel Studios' Thunderbolts* | Official Trailer",
      site: 'YouTube',
      type: 'Trailer',
      official: true,
      published_at: '2025-02-10T14:00:00Z',
    };
    const tbObs: RawTrailerObservationInput[] = [
      {
        category: 'RETURNING_CHARACTER',
        subject: 'Yelena Belova',
        observationDescription: 'Yelena reunites with Alexei Shostakov (Red Guardian) in his rundown apartment.',
        timestampSeconds: 35,
        targetPrerequisiteContentId: 'mcu-black-widow',
        rawConfidence: 0.96,
        initialState: 'OBSERVED',
      },
      {
        category: 'RETURNING_CHARACTER',
        subject: 'Bucky Barnes',
        observationDescription: 'Bucky Barnes in a formal suit attending a congressional hearing before taking field action with his vibranium arm.',
        timestampSeconds: 65,
        targetPrerequisiteContentId: 'mcu-falcon-winter-soldier',
        rawConfidence: 0.95,
        initialState: 'OBSERVED',
      },
      {
        category: 'VILLAIN',
        subject: 'Bob Reynolds (The Sentry / Void)',
        observationDescription: 'Mysterious agent Bob introduced in vault setting with ominous power aura.',
        timestampSeconds: 98,
        rawConfidence: 0.91,
        initialState: 'INFERRED',
      },
      {
        category: 'FACTION_OR_ORGANIZATION',
        subject: 'OXE Group & Valentina Allegra de Fontaine',
        observationDescription: 'CIA Director Valentina monitoring black-ops team deployment.',
        timestampSeconds: 110,
        targetPrerequisiteContentId: 'mcu-black-widow',
        rawConfidence: 0.93,
        initialState: 'OBSERVED',
      },
    ];

    // 2. MCU Spider-Man: No Way Home (Multiverse Trailer)
    const nwhContext: TrailerContentContext = {
      contentId: 'mcu-spider-man-nwh',
      franchiseId: 'marvel-cinematic-universe',
      continuityId: 'mcu-616',
      title: 'Spider-Man: No Way Home',
      tmdbId: 634649,
    };
    const nwhVideo: RawTMDbVideo = {
      id: 'vid-nwh-seed',
      key: 'JfVOs4VSpmA',
      name: 'Spider-Man: No Way Home | Official Teaser Trailer',
      site: 'YouTube',
      type: 'Trailer',
      official: true,
      published_at: '2021-08-24T01:30:00Z',
    };
    const nwhObs: RawTrailerObservationInput[] = [
      {
        category: 'DIRECT_NARRATIVE_CONTINUATION',
        subject: 'Peter Parker Identity Crisis',
        observationDescription: 'Picks up directly from Far From Home cliffhanger where Mysterio revealed Peter Parker is Spider-Man.',
        timestampSeconds: 15,
        targetPrerequisiteContentId: 'mcu-spider-man-ffh',
        isDirectContinuityCliffhanger: true,
        rawConfidence: 0.99,
        initialState: 'OBSERVED',
      },
      {
        category: 'MULTIVERSE_REFERENCE',
        subject: 'Doctor Strange Multiversal Spell Breakdown',
        observationDescription: 'Sanctum Sanctorum memory spell tampering opens cracks across the multiverse.',
        timestampSeconds: 112,
        targetPrerequisiteContentId: 'mcu-dr-strange',
        rawConfidence: 0.98,
        initialState: 'OBSERVED',
      },
      {
        category: 'CROSSOVER_CHARACTER',
        subject: 'Doctor Otto Octavius (Doc Ock)',
        observationDescription: "Alfred Molina reprises Doc Ock with mechanical tentacles emerging saying 'Hello, Peter'.",
        timestampSeconds: 165,
        sourceContinuityId: 'spider-man-raimi',
        targetPrerequisiteContentId: 'spiderman-2',
        suggestedRelationshipType: 'multiverse',
        rawConfidence: 0.97,
        initialState: 'OBSERVED',
      },
      {
        category: 'CROSSOVER_CHARACTER',
        subject: 'Norman Osborn (Green Goblin)',
        observationDescription: 'Iconic pumpkin bomb clattering on freeway with Willem Dafoe goblin cackle.',
        timestampSeconds: 148,
        sourceContinuityId: 'spider-man-raimi',
        targetPrerequisiteContentId: 'spiderman-1',
        suggestedRelationshipType: 'multiverse',
        rawConfidence: 0.95,
        initialState: 'OBSERVED',
      },
      {
        category: 'CROSSOVER_CHARACTER',
        subject: 'Electro / Yellow Lightning Clues',
        observationDescription: 'Yellow electric bolts striking squad cars and sand storm callbacks.',
        timestampSeconds: 135,
        sourceContinuityId: 'amazing-spider-man',
        targetPrerequisiteContentId: 'amazing-spiderman-2',
        suggestedRelationshipType: 'multiverse',
        rawConfidence: 0.94,
        initialState: 'OBSERVED',
      },
    ];

    // 3. Captain America: Brave New World
    const bnwContext: TrailerContentContext = {
      contentId: 'mcu-captain-america-bnw',
      franchiseId: 'marvel-cinematic-universe',
      continuityId: 'mcu-616',
      title: 'Captain America: Brave New World',
      tmdbId: 823464,
    };
    const bnwVideo: RawTMDbVideo = {
      id: 'vid-bnw-seed',
      key: '1pHDWnXmK7Y',
      name: "Marvel Studios' Captain America: Brave New World | Official Teaser",
      site: 'YouTube',
      type: 'Teaser',
      official: true,
      published_at: '2024-07-12T13:00:00Z',
    };
    const bnwObs: RawTrailerObservationInput[] = [
      {
        category: 'DIRECT_NARRATIVE_CONTINUATION',
        subject: 'Sam Wilson as Captain America',
        observationDescription: 'Sam Wilson operating under official Captain America role following Falcon and the Winter Soldier resolution.',
        timestampSeconds: 25,
        targetPrerequisiteContentId: 'mcu-falcon-winter-soldier',
        isDirectContinuityCliffhanger: true,
        rawConfidence: 0.98,
        initialState: 'OBSERVED',
      },
      {
        category: 'RETURNING_CHARACTER',
        subject: 'President Thaddeus Ross / Red Hulk',
        observationDescription: 'President Ross meeting with Sam at White House, culminating in Red Hulk transformation.',
        timestampSeconds: 95,
        targetPrerequisiteContentId: 'mcu-incredible-hulk',
        rawConfidence: 0.94,
        initialState: 'OBSERVED',
      },
      {
        category: 'VISUAL_CALLBACK',
        subject: 'Celestial Tiamut Island in Indian Ocean',
        observationDescription: 'Aerial battle around the petrified Celestial corpse emerging from the ocean.',
        timestampSeconds: 60,
        targetPrerequisiteContentId: 'mcu-eternals',
        isVisualCallbackOnly: true,
        rawConfidence: 0.89,
        initialState: 'OBSERVED',
      },
    ];

    // 4. Star Wars: The Mandalorian & Grogu
    const swContext: TrailerContentContext = {
      contentId: 'sw-mandalorian-grogu-2026',
      franchiseId: 'star-wars',
      continuityId: 'star-wars-canon',
      title: 'The Mandalorian & Grogu',
      tmdbId: 123456,
    };
    const swVideo: RawTMDbVideo = {
      id: 'vid-sw-seed',
      key: 'swMandoTeaserKey',
      name: 'The Mandalorian & Grogu | Special D23 Look',
      site: 'YouTube',
      type: 'Teaser',
      official: true,
      published_at: '2024-08-10T19:00:00Z',
    };
    const swObs: RawTrailerObservationInput[] = [
      {
        category: 'SEQUEL_PREQUEL_CONTINUITY',
        subject: 'Din Djarin and Din Grogu Adventure',
        observationDescription: 'Theatrical continuation of Din Djarin taking on New Republic bounty contracts with Grogu.',
        timestampSeconds: 20,
        targetPrerequisiteContentId: 'sw-mandalorian',
        rawConfidence: 0.95,
        initialState: 'INFERRED',
      },
      {
        category: 'RETURNING_LOCATION',
        subject: 'Nevarro & Imperial Base Remains',
        observationDescription: 'AT-AT walkers patrolling snow planet terrain and Nevarro landing strip.',
        timestampSeconds: 45,
        rawConfidence: 0.90,
        initialState: 'OBSERVED',
      },
    ];

    this.processTrailerScan(tbContext, [tbVideo], { [tbVideo.key]: tbObs });
    this.processTrailerScan(nwhContext, [nwhVideo], { [nwhVideo.key]: nwhObs });
    this.processTrailerScan(bnwContext, [bnwVideo], { [bnwVideo.key]: bnwObs });
    this.processTrailerScan(swContext, [swVideo], { [swVideo.key]: swObs });
  }

  private save(): void {
    try {
      this.storageAdapter.save({
        records: Array.from(this.records.values()),
        proposals: Array.from(this.proposals.values()),
        eventHashes: Array.from(this.eventHashes.values()),
        auditLogs: [...this.auditLogs],
      });
    } catch (err) {
      console.error('TrailerIntelligenceStore: failed to save state to adapter:', err);
    }
  }

  public getTrackedRecords(): TrackedTrailerRecord[] {
    return Array.from(this.records.values());
  }

  public getRecord(trailerIdentity: string): TrackedTrailerRecord | undefined {
    return this.records.get(trailerIdentity);
  }

  public getRecordsByContentId(contentId: string): TrackedTrailerRecord[] {
    const norm = contentId.trim().toLowerCase();
    return Array.from(this.records.values()).filter((r) => r.contentId.toLowerCase() === norm);
  }

  public getPendingProposals(): TrailerProposalPackage[] {
    return Array.from(this.proposals.values()).filter((p) => p.reviewStatus === 'pending');
  }

  public getAllProposals(): TrailerProposalPackage[] {
    return Array.from(this.proposals.values());
  }

  public getProposalById(id: string): TrailerProposalPackage | undefined {
    return this.proposals.get(id);
  }

  public getAuditLogs(): TrailerReviewAuditLogEntry[] {
    return [...this.auditLogs];
  }

  public getAuditLogsForProposal(proposalId: string): TrailerReviewAuditLogEntry[] {
    return this.auditLogs.filter((a) => a.proposalId === proposalId);
  }

  public clear(): void {
    this.records.clear();
    this.proposals.clear();
    this.eventHashes.clear();
    this.auditLogs = [];
    this.save();
  }

  public updateProposalStatus(
    proposalId: string,
    status: ProposalStatus,
    reviewer = 'Human Editorial Team',
    notes?: string
  ): boolean {
    const prop = this.proposals.get(proposalId);
    if (!prop) return false;

    const previousStatus = prop.reviewStatus;
    prop.reviewStatus = status;
    prop.reviewer = reviewer;
    prop.reviewTimestamp = '2026-08-17T00:00:00.000Z';
    if (notes) prop.reviewNotes = notes;

    // Update corresponding tracked record status
    for (const rec of this.records.values()) {
      if (rec.generatedProposalIds.includes(proposalId)) {
        rec.status = status;
      }
    }

    // Sync corresponding impact proposal status
    for (const imp of this.getImpactProposals()) {
      if (imp.id === proposalId || imp.trailerId === prop.videoKey || imp.contentId === prop.contentId) {
        imp.status = status;
        imp.reviewer = reviewer;
        imp.reviewTimestamp = '2026-08-17T00:00:00.000Z';
        if (notes) imp.reviewNotes = notes;
      }
    }

    const actionType: 'APPROVE' | 'REJECT' | 'ARCHIVE' | 'RESET' =
      status === 'approved'
        ? 'APPROVE'
        : (notes && notes.includes('[ARCHIVED]'))
        ? 'ARCHIVE'
        : status === 'rejected'
        ? 'REJECT'
        : 'RESET';

    const affectedTitles = Array.from(
      new Set(
        [
          prop.contentId,
          ...prop.evidenceItems
            .map((e) => e.suggestedEdge?.sourceContentId)
            .filter((id): id is string => Boolean(id)),
        ]
      )
    );

    const auditEntry: TrailerReviewAuditLogEntry = {
      id: `audit-${proposalId}-${this.auditLogs.length + 1}`,
      proposalId,
      trailerId: prop.videoKey,
      contentId: prop.contentId,
      franchiseId: prop.franchiseId,
      reviewer,
      action: actionType,
      timestamp: '2026-08-17T00:00:00.000Z',
      previousStatus,
      newStatus: status,
      rationale: notes || `Proposal marked as ${status}`,
      affectedTitles,
    };
    this.auditLogs.unshift(auditEntry);

    this.save();
    return true;
  }

  public getImpactProposals(): TrailerRecommendationImpactProposal[] {
    const results: TrailerRecommendationImpactProposal[] = [];
    for (const p of this.proposals.values()) {
      results.push(globalTrailerRecommendationImpactService.analyzeTrailerImpact(p));
    }
    return results;
  }

  public getImpactProposalById(id: string): TrailerRecommendationImpactProposal | undefined {
    return this.getImpactProposals().find((p) => p.id === id);
  }

  public updateImpactProposalStatus(
    id: string,
    status: ProposalStatus,
    reviewer = 'Human Editorial Team',
    notes?: string
  ): boolean {
    for (const p of this.proposals.values()) {
      const imp = globalTrailerRecommendationImpactService.analyzeTrailerImpact(p);
      if (imp.id === id || p.id === id) {
        return this.updateProposalStatus(p.id, status, reviewer, notes);
      }
    }
    return false;
  }

  /**
   * Primary Ingestion & Event Detection Function for a Single Title
   */
  public processTrailerScan(
    contentContext: TrailerContentContext,
    rawVideos: RawTMDbVideo[],
    observationsMap: Record<string, RawTrailerObservationInput[]> = {},
    fixedTimestamp = '2026-08-17T00:00:00.000Z'
  ): {
    evaluatedCount: number;
    newEventsCount: number;
    updatedCount: number;
    replacedCount: number;
    removedCount: number;
    duplicatesBlockedCount: number;
    rejectedCount: number;
    proposalsGenerated: TrailerProposalPackage[];
    records: TrackedTrailerRecord[];
  } {
    const targetContinuity = normalizeContinuityId(contentContext.continuityId);
    const validVerifiedTrailers: VerifiedTrailerMetadata[] = [];
    const proposalsGenerated: TrailerProposalPackage[] = [];
    const activeVideoKeys = new Set<string>();

    let newEventsCount = 0;
    let updatedCount = 0;
    let replacedCount = 0;
    let removedCount = 0;
    let duplicatesBlockedCount = 0;
    let rejectedCount = 0;

    // 1. Classify & Validate Raw TMDb Videos
    for (const raw of rawVideos) {
      const verified = classifyTMDbVideo(raw);
      if (!verified.isEligibleForEvidence || !verified.isOfficial) {
        rejectedCount++;
        continue;
      }
      validVerifiedTrailers.push(verified);
      activeVideoKeys.add(verified.videoKey);
    }

    const existingForContent = this.getRecordsByContentId(contentContext.contentId);

    // 2. Process Valid Trailers (Detect NEW, UPDATED, REPLACED)
    for (const trailer of validVerifiedTrailers) {
      const trailerIdentity = `tr-${contentContext.franchiseId}-${contentContext.contentId}-${trailer.videoKey}`;
      const existing = this.records.get(trailerIdentity);
      const observations = observationsMap[trailer.videoKey] || [];

      // Extract Evidence Deterministically
      const extraction = extractTrailerEvidence({
        trailer,
        contentContext: { ...contentContext, continuityId: targetContinuity },
        observations,
      });

      const metadataHash = computeTrailerMetadataHash(
        contentContext.franchiseId,
        contentContext.contentId,
        trailer.videoKey,
        trailer.videoTitle,
        trailer.classification,
        trailer.publishedAt
      );
      const evidenceHash = computeEvidenceHash(extraction.evidenceItems);

      if (!existing) {
        // Check if this new trailer supersedes an older active teaser/trailer
        const olderTrailer = existingForContent.find(
          (r) =>
            !r.isDelisted &&
            (r.classification === 'OFFICIAL_TEASER' || r.classification === 'OFFICIAL_TRAILER') &&
            (trailer.classification === 'OFFICIAL_TRAILER' || trailer.classification === 'FINAL_TRAILER') &&
            r.videoKey !== trailer.videoKey
        );

        const eventType: TrailerLifecycleEventType = olderTrailer ? 'TRAILER_REPLACED' : 'NEW_OFFICIAL_TRAILER';
        const eventHash = computeTrailerLifecycleEventHash(
          contentContext.franchiseId,
          contentContext.contentId,
          trailer.videoKey,
          eventType,
          metadataHash,
          evidenceHash
        );

        if (this.eventHashes.has(eventHash)) {
          duplicatesBlockedCount++;
          continue;
        }

        // Build Historical Records for superseded trailer
        const historicalVersions: HistoricalTrailerVersion[] = [];
        if (olderTrailer) {
          historicalVersions.push({
            videoKey: olderTrailer.videoKey,
            videoTitle: olderTrailer.videoTitle,
            classification: olderTrailer.classification,
            supersededAt: fixedTimestamp,
            metadataHash: olderTrailer.metadataHash,
            evidenceHash: olderTrailer.evidenceHash,
          });
          olderTrailer.historicalVersions.push(...historicalVersions);
          replacedCount++;
        } else {
          newEventsCount++;
        }

        // Build Proposal Package (Strictly Pending)
        const proposal = buildTrailerProposalPackage(
          { ...contentContext, continuityId: targetContinuity },
          trailer,
          extraction,
          fixedTimestamp
        );

        const newRecord: TrackedTrailerRecord = {
          trailerIdentity,
          contentId: contentContext.contentId,
          franchiseId: contentContext.franchiseId,
          continuityId: targetContinuity,
          tmdbId: contentContext.tmdbId || 0,
          videoKey: trailer.videoKey,
          videoTitle: trailer.videoTitle,
          classification: trailer.classification,
          isOfficial: trailer.isOfficial,
          sourceUrl: trailer.sourceUrl,
          metadataHash,
          evidenceHash,
          eventHash,
          firstSeenAt: fixedTimestamp,
          lastSeenAt: fixedTimestamp,
          status: 'pending',
          historicalVersions,
          generatedProposalIds: [proposal.id],
          evidenceCount: extraction.evidenceItems.length,
          isDelisted: false,
        };

        this.records.set(trailerIdentity, newRecord);
        this.proposals.set(proposal.id, proposal);
        this.eventHashes.add(eventHash);
        proposalsGenerated.push(proposal);
      } else {
        // Existing trailer detected: Check for Metadata or Evidence update
        const hasChanged =
          existing.metadataHash !== metadataHash ||
          existing.evidenceHash !== evidenceHash;

        if (hasChanged) {
          const eventType: TrailerLifecycleEventType = 'TRAILER_UPDATED';
          const eventHash = computeTrailerLifecycleEventHash(
            contentContext.franchiseId,
            contentContext.contentId,
            trailer.videoKey,
            eventType,
            metadataHash,
            evidenceHash
          );

          if (this.eventHashes.has(eventHash)) {
            duplicatesBlockedCount++;
            continue;
          }

          // Archive old version to historical list before update
          existing.historicalVersions.push({
            videoKey: existing.videoKey,
            videoTitle: existing.videoTitle,
            classification: existing.classification,
            supersededAt: fixedTimestamp,
            metadataHash: existing.metadataHash,
            evidenceHash: existing.evidenceHash,
          });

          // Build Updated Proposal Package
          const updatedProposal = buildTrailerProposalPackage(
            { ...contentContext, continuityId: targetContinuity },
            trailer,
            extraction,
            fixedTimestamp
          );

          existing.videoTitle = trailer.videoTitle;
          existing.classification = trailer.classification;
          existing.metadataHash = metadataHash;
          existing.evidenceHash = evidenceHash;
          existing.eventHash = eventHash;
          existing.lastSeenAt = fixedTimestamp;
          existing.evidenceCount = extraction.evidenceItems.length;
          existing.isDelisted = false;
          if (!existing.generatedProposalIds.includes(updatedProposal.id)) {
            existing.generatedProposalIds.push(updatedProposal.id);
          }

          this.proposals.set(updatedProposal.id, updatedProposal);
          this.eventHashes.add(eventHash);
          proposalsGenerated.push(updatedProposal);
          updatedCount++;
        } else {
          // Idempotent duplicate: identical metadata & evidence
          duplicatesBlockedCount++;
        }
      }
    }

    // 3. Detect Delisted / Removed Trailers
    for (const existingRec of existingForContent) {
      if (!existingRec.isDelisted && !activeVideoKeys.has(existingRec.videoKey)) {
        const eventType: TrailerLifecycleEventType = 'TRAILER_REMOVED';
        const eventHash = computeTrailerLifecycleEventHash(
          contentContext.franchiseId,
          contentContext.contentId,
          existingRec.videoKey,
          eventType,
          existingRec.metadataHash,
          existingRec.evidenceHash
        );

        if (!this.eventHashes.has(eventHash)) {
          existingRec.isDelisted = true;
          existingRec.delistedAt = fixedTimestamp;
          this.eventHashes.add(eventHash);
          removedCount++;
        }
      }
    }

    this.save();

    return {
      evaluatedCount: rawVideos.length,
      newEventsCount,
      updatedCount,
      replacedCount,
      removedCount,
      duplicatesBlockedCount,
      rejectedCount,
      proposalsGenerated,
      records: Array.from(this.records.values()),
    };
  }

  /**
   * Scans an array of catalog titles and aggregates scan results
   */
  public scanCatalogTitles(
    titles: Content[],
    titleVideosMap: Record<string, RawTMDbVideo[]>,
    observationsMap: Record<string, Record<string, RawTrailerObservationInput[]>> = {},
    fixedTimestamp = '2026-08-17T00:00:00.000Z'
  ): TrailerMonitorScanResult {
    let trailersEvaluated = 0;
    let newTrailersDiscovered = 0;
    let trailersUpdated = 0;
    let trailersReplaced = 0;
    let trailersRemoved = 0;
    let duplicatesBlocked = 0;
    let rejectedUnofficialCount = 0;
    const allProposalsGenerated: TrailerProposalPackage[] = [];

    for (const title of titles) {
      const rawVideos = titleVideosMap[title.id] || [];
      const titleObs = observationsMap[title.id] || {};
      const context: TrailerContentContext = {
        contentId: title.id,
        franchiseId: title.franchise_id,
        continuityId: (title as any).continuity || title.franchise_id,
        title: title.title,
        tmdbId: title.tmdb_id || undefined,
      };

      const result = this.processTrailerScan(context, rawVideos, titleObs, fixedTimestamp);

      trailersEvaluated += result.evaluatedCount;
      newTrailersDiscovered += result.newEventsCount;
      trailersUpdated += result.updatedCount;
      trailersReplaced += result.replacedCount;
      trailersRemoved += result.removedCount;
      duplicatesBlocked += result.duplicatesBlockedCount;
      rejectedUnofficialCount += result.rejectedCount;
      allProposalsGenerated.push(...result.proposalsGenerated);
    }

    return {
      scanTimestamp: fixedTimestamp,
      titlesScanned: titles.length,
      trailersEvaluated,
      newTrailersDiscovered,
      trailersUpdated,
      trailersReplaced,
      trailersRemoved,
      duplicatesBlocked,
      rejectedUnofficialCount,
      proposalsGenerated: allProposalsGenerated,
      trackedRecords: Array.from(this.records.values()),
    };
  }
}

// Global Singleton Instance
export const globalTrailerIntelligenceStore = new TrailerIntelligenceStore();
