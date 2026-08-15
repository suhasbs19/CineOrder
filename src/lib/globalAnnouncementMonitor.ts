import { allFranchises, allContent } from '../data/franchises/index';
import type { Content } from '../types';
import type {
  NormalizedSourceEvent,
  SourceEventType,
  ProposalCategory,
  DiscoveredAnnouncement,
  AnnouncementProposalPackage,
  AnnouncementCandidate,
  OfficialSourceVerification,
  ChangeProposalDiff,
  MonitorScanState,
  GlobalMonitoringConfig,
  DiscoveryScanResult,
} from '../types/announcementDiscovery';
import {
  verifyOfficialSource,
  matchOrCreateContentId,
  checkForDuplicates,
  generateMetadataCandidate,
  verifyArtworkUrls,
  slugifyTitle,
} from './announcementDiscoveryEngine';
import { getLifecycleCategory, computeOttAvailable } from './metadataRefresh';
import { isPastDate, normalizeDateStr } from './dateUtils';

// ============================================================================
// 1. MONITOR SCAN STATE & STORAGE KEYS
// ============================================================================
// ============================================================================
// 1. MONITOR SCAN STATE & STORAGE ADAPTERS
// ============================================================================
export const MONITOR_STATE_KEY = 'cineorder_announcement_monitor_state_v1';
export const MONITOR_PROPOSALS_KEY = 'cineorder_announcement_proposals_v1';

export const DEFAULT_MONITORING_CONFIG: GlobalMonitoringConfig = {
  scanFrequency: 'daily',
  rateLimitPerMinute: 60,
  minVerificationScore: 0.85,
  enableAutomaticProposalGeneration: true,
  enableDuplicateBlocking: true,
  enableConflictDetection: true,
  requestTimeoutMs: 5000,
  maxRetries: 3,
  backoffFactorMs: 500,
};

export interface MonitorStorageAdapter {
  load(): MonitorScanState | null;
  save(state: MonitorScanState): void;
}

export class UniversalStorageAdapter implements MonitorStorageAdapter {
  private memState: MonitorScanState | null = null;

  load(): MonitorScanState | null {
    if (this.memState) return { ...this.memState };

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(MONITOR_STATE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.warn('Failed to load monitor state from browser localStorage:', e);
      }
    }
    return null;
  }

  save(state: MonitorScanState): void {
    this.memState = { ...state };
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(MONITOR_STATE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to persist monitor state to localStorage:', e);
      }
    }
  }
}

// ============================================================================
// 2. EVENT HASH GENERATOR (Idempotency Guarantee)
// ============================================================================
export function generateEventHash(event: Partial<NormalizedSourceEvent>): string {
  const payload = [
    event.sourceUrl || '',
    event.eventType || '',
    (event.title || '').trim().toLowerCase(),
    event.franchiseCandidate || '',
    event.releaseDateCandidate || '',
    (event.streamingProviderCandidate || []).slice().sort().join(','),
    event.statusCandidate || '',
  ].join('|');

  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `evt-${Math.abs(hash).toString(16)}-${slugifyTitle(event.title || 'untitled').substring(0, 12)}`;
}

// ============================================================================
// 3. GLOBAL FRANCHISE MATCHER (Franchise-Agnostic with Dynamic Registry Indexing)
// ============================================================================
export interface FranchiseMatchResult {
  franchiseId: string;
  franchiseName: string;
  confidence: number;
  isConfident: boolean;
  matchReason: string;
}

const STATIC_FRANCHISE_KEYWORDS: Record<string, string[]> = {
  'marvel-cinematic-universe': ['marvel', 'mcu', 'avengers', 'spider-man', 'iron man', 'thor', 'captain america', 'wakanda', 'visionquest', 'blade', 'fantastic four', 'mutant'],
  'star-wars': ['star wars', 'jedi', 'sith', 'lucasfilm', 'mandalorian', 'skywalker', 'grogu', 'lightsaber'],
  'harry-potter': ['harry potter', 'hogwarts', 'wizarding world', 'dumbledore', 'voldemort', 'gryffindor'],
  'dc-universe': ['dc studios', 'dc extended universe', 'batman', 'superman', 'gotham', 'joker', 'justice league', 'wonder woman', 'green lantern', 'peacemaker'],
  'avatar': ['avatar', 'pandora', 'james cameron', 'na\'vi', 'sulley', 'eywa'],
  'alien': ['alien', 'xenomorph', 'weyland-yutani', 'facehugger', 'prometheus', 'ripley'],
  'jurassic-park': ['jurassic', 'dinosaur', 'ingen', 'isla nublar', 't-rex'],
  'transformers': ['transformer', 'autobot', 'decepticon', 'optimus prime', 'megatron', 'cybertron'],
  'john-wick': ['john wick', 'high table', 'continental', 'baba yaga', 'keanu reeves'],
  'fast-and-furious': ['fast & furious', 'toretto', 'dom toretto', 'fast x', 'fast and furious'],
  'mission-impossible': ['mission: impossible', 'ethan hunt', 'imf', 'tom cruise', 'dead reckoning'],
  'the-conjuring-universe': ['conjuring', 'ed and lorraine warren', 'annabelle', 'valak', 'the nun', 'the crooked man'],
  'x-men': ['x-men', 'wolverine', 'mutants', 'magneto', 'charles xavier', 'deadpool'],
  'the-lord-of-the-rings': ['lord of the rings', 'middle-earth', 'sauron', 'gandalf', 'mordor', 'one ring'],
  'the-hobbit': ['the hobbit', 'bilbo baggins', 'smaug', 'erebor', 'thorin'],
  'evil-dead': ['evil dead', 'necronomicon', 'ash williams', 'deadite'],
  'insidious': ['insidious', 'the further', 'elise rainier', 'astral projection'],
  'pirates-of-the-caribbean': ['pirates of the caribbean', 'jack sparrow', 'black pearl', 'davy jones'],
};

export function matchFranchiseFromContext(
  title: string,
  synopsis?: string,
  sourceUrl?: string,
  explicitFranchiseId?: string
): FranchiseMatchResult {
  // 1. Explicit ID Resolution
  if (explicitFranchiseId) {
    const found = allFranchises.find((f) => f.id === explicitFranchiseId || f.slug === explicitFranchiseId);
    if (found) {
      return {
        franchiseId: found.id,
        franchiseName: found.name,
        confidence: 0.99,
        isConfident: true,
        matchReason: `Explicitly assigned valid franchise: ${found.name}`,
      };
    }
  }

  const text = `${title} ${synopsis || ''} ${sourceUrl || ''}`.toLowerCase();

  let bestFranchiseId = '';
  let bestScore = 0;
  let bestReason = '';

  // 2. Dynamic Franchise Auto-Discovery across allFranchises
  for (const f of allFranchises) {
    const fNameLower = f.name.toLowerCase();
    const fSlugLower = f.slug ? f.slug.toLowerCase() : f.id.toLowerCase();
    let hits = 0;
    const hitTokens: string[] = [];

    // Full name match (weight: 3)
    if (text.includes(fNameLower)) {
      hits += 3;
      hitTokens.push(f.name);
    }

    // Slug match (weight: 2)
    if (text.includes(fSlugLower.replace(/-/g, ' '))) {
      hits += 2;
      hitTokens.push(fSlugLower);
    }

    // Individual significant keywords from franchise name
    const words = fNameLower.split(/[\s-]+/).filter((w) => w.length >= 4 && !['the', 'and', 'universe'].includes(w));
    for (const w of words) {
      if (text.includes(w)) {
        hits += 1;
        hitTokens.push(w);
      }
    }

    // Curated keyword dictionary match
    const curated = STATIC_FRANCHISE_KEYWORDS[f.id] || [];
    for (const kw of curated) {
      if (text.includes(kw) && !hitTokens.includes(kw)) {
        hits += 1;
        hitTokens.push(kw);
      }
    }

    if (hits > bestScore) {
      bestScore = hits;
      bestFranchiseId = f.id;
      bestReason = `Matched franchise '${f.name}' via tokens [${[...new Set(hitTokens)].join(', ')}]`;
    }
  }

  if (bestScore > 0) {
    const f = allFranchises.find((item) => item.id === bestFranchiseId);
    const confidence = Math.min(0.98, 0.65 + bestScore * 0.1);
    return {
      franchiseId: bestFranchiseId,
      franchiseName: f?.name || bestFranchiseId,
      confidence,
      isConfident: confidence >= 0.70,
      matchReason: bestReason,
    };
  }

  // Fallback: Unknown franchise flagged for human review
  return {
    franchiseId: 'unknown-franchise',
    franchiseName: 'Unknown / Review Required',
    confidence: 0.2,
    isConfident: false,
    matchReason: 'Could not confidently match announcement to any registered franchise. Flagged for review.',
  };
}

// ============================================================================
// 4. CHANGE DETECTION ENGINE (Catalog Comparison)
// ============================================================================
export interface CatalogChangeDetectionResult {
  isExistingTitle: boolean;
  matchedContent?: Content;
  detectedEventType: SourceEventType;
  detectedCategory: ProposalCategory;
  diff?: ChangeProposalDiff;
}

export function detectCatalogChanges(
  event: NormalizedSourceEvent
): CatalogChangeDetectionResult {
  // 1. Check exact TMDB ID
  let match = event.tmdbId ? allContent.find((c) => c.tmdb_id === event.tmdbId) : undefined;

  // 2. Check exact or normalized slug match / title match
  if (!match) {
    const eventSlug = slugifyTitle(event.title);
    match = allContent.find((c) => {
      const cSlug = slugifyTitle(c.title);
      return cSlug === eventSlug || c.id === `${c.franchise_id}-${eventSlug}` || c.title.trim().toLowerCase() === event.title.trim().toLowerCase();
    });
  }

  // 3. Check fuzzy match
  if (!match) {
    const dupCheck = checkForDuplicates(event.title, event.tmdbId, event.franchiseCandidate);
    if (dupCheck.isDuplicate && dupCheck.matchedContentId) {
      match = allContent.find((c) => c.id === dupCheck.matchedContentId);
    }
  }

  if (!match) {
    return {
      isExistingTitle: false,
      detectedEventType: event.eventType || 'NEW_ANNOUNCEMENT',
      detectedCategory: 'NEW_TITLES',
    };
  }

  // Title was found in catalog -> Inspect for modifications
  const current = match;

  // Priority 1: Check for Cancellation
  if (event.eventType === 'CANCELLATION' || event.statusCandidate === 'cancelled') {
    return {
      isExistingTitle: true,
      matchedContent: current,
      detectedEventType: 'CANCELLATION',
      detectedCategory: 'CANCELLATIONS',
      diff: {
        fieldName: 'status',
        previousValue: current.status,
        proposedValue: 'cancelled',
        lifecycleBefore: getLifecycleCategory(current),
        lifecycleAfter: 'UPCOMING',
        diffSummary: `Status changed from '${current.status}' to 'cancelled'.`,
      },
    };
  }

  // Priority 2: Check for Release Date Change
  const normEventDate = normalizeDateStr(event.releaseDateCandidate);
  if (event.eventType === 'RELEASE_DATE_CHANGE' || (normEventDate && normEventDate !== current.release_date)) {
    const proposedDate = normEventDate || current.release_date;
    const mockUpdatedContent: Content = { ...current, release_date: proposedDate };
    return {
      isExistingTitle: true,
      matchedContent: current,
      detectedEventType: 'RELEASE_DATE_CHANGE',
      detectedCategory: 'RELEASE_DATE_CHANGES',
      diff: {
        fieldName: 'release_date',
        previousValue: current.release_date,
        proposedValue: proposedDate,
        lifecycleBefore: getLifecycleCategory(current),
        lifecycleAfter: getLifecycleCategory(mockUpdatedContent),
        diffSummary: `Release date changed from '${current.release_date}' to '${proposedDate}'.`,
      },
    };
  }

  // Priority 3: Check for OTT / Streaming Provider Changes
  const currentProviders = (current.streaming_providers || []).map((p) => p.provider_name).join(', ') || 'None';
  const proposedProviders = (event.streamingProviderCandidate || []).join(', ');
  if (
    event.eventType === 'STREAMING_RELEASE' ||
    event.eventType === 'PROVIDER_CHANGE' ||
    event.eventType === 'DIGITAL_RELEASE' ||
    (proposedProviders && proposedProviders !== currentProviders)
  ) {
    const isReleased = current.theatrical_released || isPastDate(current.release_date);
    const mockUpdatedContent: Content = {
      ...current,
      ott_available: isReleased,
      subscription_streaming_available: isReleased,
      streaming_providers: (event.streamingProviderCandidate || []).map((name, idx) => ({
        id: `sp-${idx}`,
        content_id: current.id,
        provider_name: name,
        provider_logo: '',
        url: '',
        country: 'US',
      })),
    };

    return {
      isExistingTitle: true,
      matchedContent: current,
      detectedEventType: event.eventType || 'PROVIDER_CHANGE',
      detectedCategory: 'OTT_CHANGES',
      diff: {
        fieldName: 'streaming_providers',
        previousValue: currentProviders,
        proposedValue: proposedProviders || currentProviders,
        lifecycleBefore: getLifecycleCategory(current),
        lifecycleAfter: isReleased ? 'STREAMING_AVAILABLE' : getLifecycleCategory(mockUpdatedContent),
        diffSummary: `Streaming providers updated from [${currentProviders}] to [${proposedProviders || currentProviders}].`,
      },
    };
  }

  // Priority 4: Check for Title Rename
  if (event.eventType === 'TITLE_CHANGE' || (event.title && slugifyTitle(event.title) !== slugifyTitle(current.title))) {
    return {
      isExistingTitle: true,
      matchedContent: current,
      detectedEventType: 'TITLE_CHANGE',
      detectedCategory: 'TITLE_CHANGES',
      diff: {
        fieldName: 'title',
        previousValue: current.title,
        proposedValue: event.title.trim(),
        diffSummary: `Title renamed from '${current.title}' to '${event.title.trim()}'.`,
      },
    };
  }

  return {
    isExistingTitle: true,
    matchedContent: current,
    detectedEventType: 'STATUS_CHANGE',
    detectedCategory: 'METADATA_CHANGES',
    diff: {
      fieldName: 'metadata',
      previousValue: `Status: ${current.status}`,
      proposedValue: `Status: ${event.statusCandidate || current.status}`,
      diffSummary: `General metadata update detected for existing catalog entry '${current.title}'.`,
    },
  };
}

// ============================================================================
// 5. CONTINUOUS GLOBAL ANNOUNCEMENT MONITOR CLASS
// ============================================================================
export class GlobalAnnouncementMonitor {
  private config: GlobalMonitoringConfig;
  private state: MonitorScanState;
  private storageAdapter: MonitorStorageAdapter;

  constructor(config?: Partial<GlobalMonitoringConfig>, storageAdapter?: MonitorStorageAdapter) {
    this.config = { ...DEFAULT_MONITORING_CONFIG, ...config };
    this.storageAdapter = storageAdapter || new UniversalStorageAdapter();
    this.state = this.loadState();
  }

  private loadState(): MonitorScanState {
    const loaded = this.storageAdapter.load();
    if (loaded) return loaded;

    return {
      lastScanAt: new Date().toISOString(),
      lastSuccessfulScanAt: new Date().toISOString(),
      totalScansCount: 0,
      scanDurationMs: 0,
      sourcesCheckedCount: 0,
      sourcesFailedCount: 0,
      duplicateEventsIgnoredCount: 0,
      processedEventIds: [],
      eventHashes: [],
      sourceCooldowns: {},
      failedSources: [],
      discoveredTitlesCount: 0,
      proposalsCreatedCount: 0,
      rejectedRumorsCount: 0,
      conflictsDetectedCount: 0,
    };
  }

  private saveState(): void {
    this.storageAdapter.save(this.state);
  }

  public getState(): MonitorScanState {
    return { ...this.state };
  }

  public resetState(): void {
    this.state = {
      lastScanAt: new Date().toISOString(),
      lastSuccessfulScanAt: new Date().toISOString(),
      totalScansCount: 0,
      scanDurationMs: 0,
      sourcesCheckedCount: 0,
      sourcesFailedCount: 0,
      duplicateEventsIgnoredCount: 0,
      processedEventIds: [],
      eventHashes: [],
      sourceCooldowns: {},
      failedSources: [],
      discoveredTitlesCount: 0,
      proposalsCreatedCount: 0,
      rejectedRumorsCount: 0,
      conflictsDetectedCount: 0,
    };
    this.saveState();
  }

  /**
   * Resilient HTTP Fetcher with Timeout, Exponential Backoff, Rate-Limiting, and Error Isolation
   */
  public async fetchWithResilience<T = any>(
    url: string,
    sourceKey: string,
    options?: { timeoutMs?: number; maxRetries?: number; backoffMs?: number }
  ): Promise<{ data: T | null; error: string | null; skippedDueToCooldown?: boolean }> {
    const now = new Date().toISOString();
    const timeoutMs = options?.timeoutMs || this.config.requestTimeoutMs || 5000;
    const maxRetries = options?.maxRetries ?? this.config.maxRetries ?? 3;
    const backoffMs = options?.backoffMs || this.config.backoffFactorMs || 500;

    // Check domain cooldown
    const cooldownExpiry = this.state.sourceCooldowns[sourceKey];
    if (cooldownExpiry && new Date(cooldownExpiry).getTime() > Date.now()) {
      return { data: null, error: `Source ${sourceKey} is in cooldown until ${cooldownExpiry}`, skippedDueToCooldown: true };
    }

    this.state.sourcesCheckedCount += 1;

    let attempt = 0;
    while (attempt < maxRetries) {
      attempt++;
      try {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

        const response = await fetch(url, {
          signal: controller ? controller.signal : undefined,
          headers: { 'User-Agent': 'CineOrder-AnnouncementMonitor/1.0' },
        });

        if (timer) clearTimeout(timer);

        if (response.status === 429) {
          // Rate limit hit -> set 60s cooldown
          const cooldownUntil = new Date(Date.now() + 60000).toISOString();
          this.state.sourceCooldowns[sourceKey] = cooldownUntil;
          this.state.failedSources.push({ source: sourceKey, error: 'HTTP 429 Rate Limit Exceeded', timestamp: now });
          this.saveState();
          return { data: null, error: 'HTTP 429 Rate Limit Exceeded' };
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return { data, error: null };
      } catch (err: any) {
        if (attempt >= maxRetries) {
          const errMsg = err?.message || 'Network request failed';
          this.state.sourcesFailedCount += 1;
          this.state.failedSources.push({ source: sourceKey, error: errMsg, timestamp: now });
          this.saveState();
          return { data: null, error: errMsg };
        }
        // Exponential backoff delay
        await new Promise((res) => setTimeout(res, backoffMs * Math.pow(2, attempt - 1)));
      }
    }

    return { data: null, error: 'Max retries exhausted' };
  }

  /**
   * Main scan function: Process normalized events across all franchises.
   */
  public processEvents(
    events: NormalizedSourceEvent[],
    options?: { forceScan?: boolean }
  ): DiscoveryScanResult {
    const startTime = Date.now();
    const scanTimestamp = new Date().toISOString();
    const proposals: AnnouncementProposalPackage[] = [];
    const franchiseBreakdown: Record<string, number> = {};
    const categoryBreakdown: Record<ProposalCategory, number> = {
      NEW_TITLES: 0,
      METADATA_CHANGES: 0,
      RELEASE_DATE_CHANGES: 0,
      OTT_CHANGES: 0,
      CANCELLATIONS: 0,
      TITLE_CHANGES: 0,
      ARTWORK_CHANGES: 0,
      CONFLICTS: 0,
    };

    let verifiedCount = 0;
    let rejectedCount = 0;
    let duplicatesBlocked = 0;
    let duplicatesIgnored = 0;

    for (const rawEvent of events) {
      try {
        // 1. Generate Event Hash for Deduplication
        const hash = generateEventHash(rawEvent);
        const isAlreadyProcessed = this.state.eventHashes.includes(hash);

        if (isAlreadyProcessed && !options?.forceScan) {
          duplicatesIgnored++;
          continue;
        }

        // 2. Authoritative Source Verification
        const sourceVer = verifyOfficialSource(rawEvent.source, rawEvent.sourceUrl, rawEvent.evidence);
        if (!sourceVer.isVerified || sourceVer.verificationScore < this.config.minVerificationScore) {
          rejectedCount++;
          continue;
        }
        verifiedCount++;

        // 3. Franchise Matching (Franchise-Agnostic with dynamic auto-indexing)
        const franchiseMatch = matchFranchiseFromContext(
          rawEvent.title,
          rawEvent.synopsis,
          rawEvent.sourceUrl,
          rawEvent.franchiseCandidate
        );

        franchiseBreakdown[franchiseMatch.franchiseId] = (franchiseBreakdown[franchiseMatch.franchiseId] || 0) + 1;

        // 4. Conflicting Sources Check
        if (rawEvent.conflictSource) {
          const conflictPkg: AnnouncementProposalPackage = {
            id: `prop-conflict-${Date.now()}-${slugifyTitle(rawEvent.title).substring(0, 14)}`,
            franchiseId: franchiseMatch.franchiseId,
            franchiseName: franchiseMatch.franchiseName,
            title: `[CONFLICT] ${rawEvent.title} — Contradictory Release Reports`,
            category: 'CONFLICTS',
            eventType: rawEvent.eventType,
            candidate: this.buildCandidateFromEvent(rawEvent, franchiseMatch.franchiseId, sourceVer),
            proposedEdges: [],
            status: 'pending',
            overallQualityScore: 70,
            sourceVerification: sourceVer,
            sourceEvent: rawEvent,
            isConflict: true,
            conflictDetails: {
              primarySource: rawEvent.source,
              primaryValue: rawEvent.releaseDateCandidate || rawEvent.title,
              conflictingSource: rawEvent.conflictSource.sourcePublisher,
              conflictingValue: rawEvent.conflictSource.conflictingValue,
              resolutionNote: `Conflicting reports between ${rawEvent.source} and ${rawEvent.conflictSource.sourcePublisher}: ${rawEvent.conflictSource.reason}`,
            },
            eventHash: hash,
            createdAt: scanTimestamp,
          };

          categoryBreakdown.CONFLICTS++;
          proposals.push(conflictPkg);
          this.recordProcessedEvent(rawEvent.id, hash);
          continue;
        }

        // 5. Change Detection against 225-item Catalog
        const changeResult = detectCatalogChanges(rawEvent);

        if (changeResult.isExistingTitle && changeResult.matchedContent) {
          const matched = changeResult.matchedContent;
          const changePkg: AnnouncementProposalPackage = {
            id: `prop-mod-${changeResult.detectedCategory.toLowerCase()}-${Date.now()}-${matched.id}`,
            franchiseId: matched.franchise_id,
            franchiseName: franchiseMatch.franchiseName,
            title: `[${changeResult.detectedCategory.replace('_', ' ')}] ${matched.title}`,
            category: changeResult.detectedCategory,
            eventType: changeResult.detectedEventType,
            candidate: this.buildCandidateFromEvent(rawEvent, matched.franchise_id, sourceVer, matched.id),
            proposedEdges: [],
            diff: changeResult.diff,
            status: 'pending',
            overallQualityScore: Math.round(sourceVer.verificationScore * 100),
            sourceVerification: sourceVer,
            sourceEvent: rawEvent,
            eventHash: hash,
            createdAt: scanTimestamp,
          };

          categoryBreakdown[changeResult.detectedCategory]++;
          proposals.push(changePkg);
          this.recordProcessedEvent(rawEvent.id, hash);
          continue;
        }

        // 6. New Title Discovery Pipeline
        const dupCheck = checkForDuplicates(rawEvent.title, rawEvent.tmdbId, franchiseMatch.franchiseId);
        if (dupCheck.isDuplicate) {
          duplicatesBlocked++;
        }

        const discAnnounce: DiscoveredAnnouncement = {
          rawTitle: rawEvent.title,
          franchiseId: franchiseMatch.franchiseId,
          mediaType: rawEvent.mediaType,
          expectedReleaseDate: rawEvent.releaseDateCandidate,
          synopsis: rawEvent.synopsis,
          tmdbId: rawEvent.tmdbId,
          director: rawEvent.director,
          posterUrl: rawEvent.posterUrl,
          backdropUrl: rawEvent.backdropUrl,
          sourceUrl: rawEvent.sourceUrl,
          sourcePublisher: rawEvent.source,
          citation: rawEvent.evidence,
          streamingProviders: rawEvent.streamingProviderCandidate,
        };

        const candidate = generateMetadataCandidate(discAnnounce);
        const pkgId = `prop-new-${Date.now()}-${candidate.id}`;

        let qualityScore = 60;
        if (sourceVer.isVerified) qualityScore += 25;
        if (!dupCheck.isDuplicate) qualityScore += 10;
        if (candidate.releaseDate) qualityScore += 5;

        const newTitlePkg: AnnouncementProposalPackage = {
          id: pkgId,
          franchiseId: franchiseMatch.franchiseId,
          franchiseName: franchiseMatch.franchiseName,
          title: `[NEW TITLE] ${rawEvent.title}`,
          category: 'NEW_TITLES',
          eventType: 'NEW_ANNOUNCEMENT',
          candidate,
          proposedEdges: candidate.proposedEdges,
          status: 'pending',
          overallQualityScore: Math.min(100, qualityScore),
          sourceVerification: sourceVer,
          sourceEvent: rawEvent,
          eventHash: hash,
          createdAt: scanTimestamp,
        };

        categoryBreakdown.NEW_TITLES++;
        proposals.push(newTitlePkg);
        this.recordProcessedEvent(rawEvent.id, hash);
      } catch (eventErr: any) {
        console.error(`[GlobalMonitor] Error isolating event ${rawEvent.id}:`, eventErr);
        this.state.failedSources.push({
          source: rawEvent.source || 'unknown',
          error: eventErr?.message || String(eventErr),
          timestamp: scanTimestamp,
        });
      }
    }

    const durationMs = Date.now() - startTime;
    this.state.lastScanAt = scanTimestamp;
    this.state.lastSuccessfulScanAt = scanTimestamp;
    this.state.totalScansCount += 1;
    this.state.scanDurationMs = durationMs;
    this.state.discoveredTitlesCount += proposals.length;
    this.state.duplicateEventsIgnoredCount += duplicatesIgnored;
    this.state.proposalsCreatedCount += proposals.length;
    this.state.rejectedRumorsCount += rejectedCount;
    this.state.conflictsDetectedCount += categoryBreakdown.CONFLICTS;
    this.saveState();

    return {
      scanTimestamp,
      scanDurationMs: durationMs,
      totalAnnouncementsDiscovered: events.length,
      verifiedAnnouncementsCount: verifiedCount,
      rejectedRumorsCount: rejectedCount,
      duplicatesBlockedCount: duplicatesBlocked,
      duplicateEventsIgnoredCount: duplicatesIgnored,
      sourcesCheckedCount: events.length,
      sourcesFailedCount: this.state.failedSources.length,
      failedSources: [...this.state.failedSources],
      proposalsGenerated: proposals,
      franchiseBreakdown,
      categoryBreakdown,
    };
  }

  private recordProcessedEvent(eventId: string, hash: string): void {
    if (!this.state.processedEventIds.includes(eventId)) {
      this.state.processedEventIds.push(eventId);
    }
    if (!this.state.eventHashes.includes(hash)) {
      this.state.eventHashes.push(hash);
    }
  }

  private buildCandidateFromEvent(
    event: NormalizedSourceEvent,
    franchiseId: string,
    sourceVer: OfficialSourceVerification,
    existingId?: string
  ): AnnouncementCandidate {
    const artwork = verifyArtworkUrls(event.posterUrl, event.backdropUrl);
    const relDate = normalizeDateStr(event.releaseDateCandidate);
    const candidateId = existingId || matchOrCreateContentId(event.title, franchiseId).id;

    const mockContent: Content = {
      id: candidateId,
      tmdb_id: event.tmdbId || 0,
      title: event.title.trim(),
      type: event.mediaType,
      franchise_id: franchiseId,
      overview: event.synopsis || `Official overview for ${event.title}.`,
      release_date: relDate || '2028-01-01',
      theatrical_release_date: event.theatricalReleaseDateCandidate || relDate || '2028-01-01',
      runtime: 120,
      rating: 8.0,
      status: (event.statusCandidate === 'cancelled' ? 'cancelled' : 'upcoming') as any,
      theatrical_released: false,
      ott_available: false,
      digital_available: false,
      subscription_streaming_available: false,
      streaming_providers: (event.streamingProviderCandidate || []).map((name, idx) => ({
        id: `sp-${idx}`,
        content_id: candidateId,
        provider_name: name,
        provider_logo: '',
        url: '',
        country: 'US',
      })),
      director: event.director || '',
      genres: event.genres || [],
      cast: (event.cast || []).map((name) => ({ name, character: 'TBA', profile_url: '' })),
      trailer_url: '',
      episode_count: null,
      season_count: null,
      poster_url: artwork.poster,
      backdrop_url: artwork.backdrop,
      is_canon: true,
      is_required: true,
      created_at: new Date().toISOString(),
    };

    const lifecycleCategory = getLifecycleCategory(mockContent);
    const ottAvailable = computeOttAvailable(mockContent);

    return {
      id: candidateId,
      title: event.title.trim(),
      franchiseId,
      mediaType: event.mediaType,
      tmdbId: event.tmdbId,
      overview: mockContent.overview || '',
      releaseDate: relDate || undefined,
      theatricalReleaseDate: mockContent.theatrical_release_date || undefined,
      runtime: mockContent.runtime,
      rating: mockContent.rating,
      status: mockContent.status as any,
      theatricalReleased: false,
      ottAvailable,
      digitalAvailable: false,
      subscriptionStreamingAvailable: false,
      providers: event.streamingProviderCandidate || [],
      director: event.director,
      posterUrl: artwork.poster,
      backdropUrl: artwork.backdrop,
      isCanon: true,
      isRequired: true,
      lifecycleCategory,
      sourceVerification: sourceVer,
      duplicateCheck: { isDuplicate: Boolean(existingId) },
      proposedEdges: [],
      candidateGeneratedAt: new Date().toISOString(),
      integrityValidationPassed: true,
      integrityNotes: ['Candidate processed via Global Announcement Monitor.'],
    };
  }
}

// ============================================================================
// 6. CURATED CONTINUOUS MONITOR FEED (All Franchises + VisionQuest)
// ============================================================================
export const CURATED_MONITOR_EVENTS: NormalizedSourceEvent[] = [
  // 1. Natural Discovery of VisionQuest (Validation Case)
  {
    id: 'evt-mcu-visionquest-2026',
    source: 'Marvel Studios Official',
    sourceUrl: 'https://marvel.com/articles/tv-shows/visionquest-announcement',
    discoveredAt: '2026-08-15T12:00:00Z',
    publishedAt: '2026-08-15T10:00:00Z',
    eventType: 'NEW_ANNOUNCEMENT',
    title: 'VisionQuest',
    mediaType: 'series',
    franchiseCandidate: 'marvel-cinematic-universe',
    releaseDateCandidate: '2026-10-14',
    streamingProviderCandidate: ['Disney+'],
    statusCandidate: 'upcoming',
    synopsis: 'Paul Bettany returns as White Vision exploring his newfound memories and existential identity after Westview.',
    director: 'Terry Matalas',
    cast: ['Paul Bettany', 'James Spader'],
    genres: ['Action', 'Sci-Fi', 'Drama'],
    tmdbId: 1342110,
    evidence: 'Marvel Studios Official TV Production Announcement at SDCC',
    confidence: 0.98,
  },
  // 2. Star Wars: Dawn of the Jedi (New Movie)
  {
    id: 'evt-sw-dawn-jedi-2028',
    source: 'Lucasfilm Official',
    sourceUrl: 'https://starwars.com/news/future-slate',
    discoveredAt: '2026-08-15T12:00:00Z',
    publishedAt: '2026-08-15T10:00:00Z',
    eventType: 'NEW_ANNOUNCEMENT',
    title: 'Star Wars: Dawn of the Jedi',
    mediaType: 'movie',
    franchiseCandidate: 'star-wars',
    releaseDateCandidate: '2028-12-15',
    statusCandidate: 'upcoming',
    synopsis: 'James Mangold directs the origin story of the Force 25,000 years in the past.',
    director: 'James Mangold',
    tmdbId: 1111001,
    evidence: 'Star Wars Celebration Official Film Slate Announcement',
    confidence: 0.98,
  },
  // 3. Release Date Change: The Batman: Part II (2026-10-02 -> 2027-05-07)
  {
    id: 'evt-dc-batman-date-change-2026',
    source: 'Variety',
    sourceUrl: 'https://variety.com/2026/film/news/the-batman-part-2-delayed-1236892/',
    discoveredAt: '2026-08-15T12:00:00Z',
    publishedAt: '2026-08-15T11:00:00Z',
    eventType: 'RELEASE_DATE_CHANGE',
    title: 'The Batman: Part II',
    mediaType: 'movie',
    franchiseCandidate: 'dc-universe',
    releaseDateCandidate: '2027-05-07',
    tmdbId: 1011985,
    previousValue: '2026-10-02',
    proposedValue: '2027-05-07',
    evidence: 'Warner Bros. Pictures Theatrical Calendar Modification Announcement',
    confidence: 0.94,
  },
  // 4. OTT Streaming Provider Announcement: Avatar: Fire and Ash (Already released -> confirmed JioHotstar / Disney+)
  {
    id: 'evt-avatar-ott-update-2026',
    source: '20th Century Studios Press',
    sourceUrl: 'https://20thcenturystudios.com/press/avatar-fire-and-ash-streaming',
    discoveredAt: '2026-08-15T12:00:00Z',
    publishedAt: '2026-08-15T10:00:00Z',
    eventType: 'STREAMING_RELEASE',
    title: 'Avatar: Fire and Ash',
    mediaType: 'movie',
    franchiseCandidate: 'avatar',
    releaseDateCandidate: '2025-12-19',
    streamingProviderCandidate: ['Disney+', 'JioHotstar'],
    tmdbId: 83533,
    evidence: 'Official OTT Streaming Premiere Press Release',
    confidence: 0.98,
  },
  // 5. Cancellation Event: Unreleased spin-off project cancelled
  {
    id: 'evt-conj-spinoff-cancel',
    source: 'The Hollywood Reporter',
    sourceUrl: 'https://hollywoodreporter.com/movies/movie-news/the-crooked-man-cancelled-warner-bros-1235289/',
    discoveredAt: '2026-08-15T12:00:00Z',
    publishedAt: '2026-08-15T10:00:00Z',
    eventType: 'CANCELLATION',
    title: 'The Crooked Man',
    mediaType: 'movie',
    franchiseCandidate: 'the-conjuring-universe',
    statusCandidate: 'cancelled',
    evidence: 'Studio official statement confirming project will not move forward.',
    confidence: 0.92,
  },
  // 6. Conflicting Release Date Reports between Studio and Trade
  {
    id: 'evt-ff-fast11-conflict',
    source: 'Universal Pictures Official',
    sourceUrl: 'https://universalpictures.com/movies/fast-x-part-2',
    discoveredAt: '2026-08-15T12:00:00Z',
    publishedAt: '2026-08-15T10:00:00Z',
    eventType: 'RELEASE_DATE_CHANGE',
    title: 'Fast X: Part 2',
    mediaType: 'movie',
    franchiseCandidate: 'fast-and-furious',
    releaseDateCandidate: '2026-06-18',
    tmdbId: 1056731,
    evidence: 'Universal Studios Theatrical Calendar Announcement',
    confidence: 0.96,
    conflictSource: {
      sourcePublisher: 'Deadline Trade Exclusive',
      sourceUrl: 'https://deadline.com/2026/film/fast-x-part-2-delayed-2027/',
      conflictingValue: '2027-04-23',
      reason: 'Deadline reports potential production shift to 2027 pending script revisions.',
    },
  },
  // 7. Unverified Rumor Blog (Should be rejected)
  {
    id: 'evt-rumor-spider-man-5',
    source: 'We Got This Covered',
    sourceUrl: 'https://wegotthiscovered.com/movies/spider-man-5-announced/',
    discoveredAt: '2026-08-15T12:00:00Z',
    publishedAt: '2026-08-15T10:00:00Z',
    eventType: 'NEW_ANNOUNCEMENT',
    title: 'Spider-Man 5: Secret Alliance',
    mediaType: 'movie',
    franchiseCandidate: 'marvel-cinematic-universe',
    releaseDateCandidate: '2029-07-01',
    evidence: 'Anonymous forum leak regarding Sony/Marvel negotiations',
    confidence: 0.35,
  },
];

// Singleton instance
export const globalAnnouncementMonitor = new GlobalAnnouncementMonitor();
