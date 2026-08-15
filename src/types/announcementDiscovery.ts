import type { ProposedStoryEdge, ProposalStatus } from '@/types/ckgProposal';

export type OfficialSourceCredibility =
  | 'official-studio-press'
  | 'trade-publication'
  | 'tmdb-verified'
  | 'wikidata'
  | 'unverified-rumor';

export type SourceEventType =
  | 'NEW_ANNOUNCEMENT'
  | 'TITLE_CHANGE'
  | 'RELEASE_DATE_CHANGE'
  | 'CANCELLATION'
  | 'THEATRICAL_RELEASE'
  | 'DIGITAL_RELEASE'
  | 'STREAMING_RELEASE'
  | 'PROVIDER_CHANGE'
  | 'STATUS_CHANGE';

export type ProposalCategory =
  | 'NEW_TITLES'
  | 'METADATA_CHANGES'
  | 'RELEASE_DATE_CHANGES'
  | 'OTT_CHANGES'
  | 'CANCELLATIONS'
  | 'TITLE_CHANGES'
  | 'ARTWORK_CHANGES'
  | 'CONFLICTS';

export interface OfficialSourceVerification {
  isVerified: boolean;
  credibility: OfficialSourceCredibility;
  sourceUrl?: string;
  sourcePublisher: string;
  citation: string;
  verificationScore: number; // 0.0 to 1.0
  verificationNotes: string;
  verifiedAt: string;
}

export interface DiscoveredAnnouncement {
  rawTitle: string;
  franchiseId: string;
  mediaType: 'movie' | 'series';
  expectedReleaseDate?: string;
  synopsis?: string;
  tmdbId?: number;
  posterUrl?: string;
  backdropUrl?: string;
  director?: string;
  sourceUrl?: string;
  sourcePublisher: string;
  citation: string;
  rawSourceText?: string;
  announcementDate?: string;
  streamingProviders?: string[];
}

export interface NormalizedSourceEvent {
  id: string;
  source: string;
  sourceUrl: string;
  discoveredAt: string;
  publishedAt?: string;
  eventType: SourceEventType;
  title: string;
  mediaType: 'movie' | 'series';
  franchiseCandidate: string;
  releaseDateCandidate?: string;
  theatricalReleaseDateCandidate?: string;
  streamingProviderCandidate?: string[];
  statusCandidate?: string;
  synopsis?: string;
  director?: string;
  cast?: string[];
  genres?: string[];
  tmdbId?: number;
  posterUrl?: string;
  backdropUrl?: string;
  evidence: string;
  confidence: number; // 0.0 to 1.0
  previousValue?: string;
  proposedValue?: string;
  conflictSource?: {
    sourcePublisher: string;
    sourceUrl: string;
    conflictingValue: string;
    reason: string;
  };
}

export interface DuplicateCheckMatch {
  isDuplicate: boolean;
  matchType?: 'exact_tmdb_id' | 'exact_title' | 'exact_slug' | 'fuzzy_title_similarity';
  matchedContentId?: string;
  matchedTitle?: string;
  similarityScore?: number; // 0.0 to 1.0
  reason?: string;
}

export interface ChangeProposalDiff {
  fieldName: string;
  previousValue: string;
  proposedValue: string;
  lifecycleBefore?: string;
  lifecycleAfter?: string;
  diffSummary: string;
}

export interface AnnouncementCandidate {
  id: string;
  title: string;
  franchiseId: string;
  mediaType: 'movie' | 'series';
  tmdbId?: number;
  overview: string;
  releaseDate?: string;
  theatricalReleaseDate?: string;
  runtime?: number;
  rating?: number;
  status: 'upcoming' | 'in_production' | 'announced' | 'tba' | 'planned' | 'released' | 'cancelled';
  theatricalReleased: boolean;
  ottAvailable: boolean;
  digitalAvailable: boolean;
  subscriptionStreamingAvailable: boolean;
  providers: string[];
  director?: string;
  posterUrl: string;
  backdropUrl: string;
  isCanon: boolean;
  isRequired: boolean;
  lifecycleCategory: 'UPCOMING' | 'THEATRICALLY_RELEASED' | 'STREAMING_AVAILABLE';
  sourceVerification: OfficialSourceVerification;
  duplicateCheck: DuplicateCheckMatch;
  proposedEdges: ProposedStoryEdge[];
  candidateGeneratedAt: string;
  integrityValidationPassed: boolean;
  integrityNotes: string[];
}

export interface AnnouncementProposalPackage {
  id: string;
  franchiseId: string;
  franchiseName: string;
  title: string;
  category: ProposalCategory;
  eventType: SourceEventType;
  candidate: AnnouncementCandidate;
  proposedEdges: ProposedStoryEdge[];
  diff?: ChangeProposalDiff;
  status: ProposalStatus;
  overallQualityScore: number; // 0 to 100
  sourceVerification: OfficialSourceVerification;
  sourceEvent?: NormalizedSourceEvent;
  isConflict?: boolean;
  conflictDetails?: {
    primarySource: string;
    primaryValue: string;
    conflictingSource: string;
    conflictingValue: string;
    resolutionNote: string;
  };
  eventHash?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface MonitorScanState {
  lastScanAt: string;
  lastSuccessfulScanAt: string;
  totalScansCount: number;
  scanDurationMs: number;
  sourcesCheckedCount: number;
  sourcesFailedCount: number;
  duplicateEventsIgnoredCount: number;
  processedEventIds: string[];
  eventHashes: string[];
  sourceCooldowns: Record<string, string>; // sourceKey -> ISO timestamp
  failedSources: Array<{ source: string; error: string; timestamp: string }>;
  discoveredTitlesCount: number;
  proposalsCreatedCount: number;
  rejectedRumorsCount: number;
  conflictsDetectedCount: number;
}

export interface GlobalMonitoringConfig {
  scanFrequency: 'daily' | 'hourly' | 'manual';
  rateLimitPerMinute: number;
  minVerificationScore: number;
  enableAutomaticProposalGeneration: boolean;
  enableDuplicateBlocking: boolean;
  enableConflictDetection: boolean;
  requestTimeoutMs?: number;
  maxRetries?: number;
  backoffFactorMs?: number;
}

export interface DiscoveryScanResult {
  scanTimestamp: string;
  scanDurationMs?: number;
  totalAnnouncementsDiscovered: number;
  verifiedAnnouncementsCount: number;
  rejectedRumorsCount: number;
  duplicatesBlockedCount: number;
  duplicateEventsIgnoredCount?: number;
  sourcesCheckedCount?: number;
  sourcesFailedCount?: number;
  failedSources?: Array<{ source: string; error: string; timestamp: string }>;
  proposalsGenerated: AnnouncementProposalPackage[];
  franchiseBreakdown: Record<string, number>;
  categoryBreakdown: Record<ProposalCategory, number>;
}
