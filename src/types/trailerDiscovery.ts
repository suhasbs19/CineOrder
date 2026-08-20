import type { ProposalStatus } from './ckgProposal';

export type TrailerClassification =
  | 'OFFICIAL_TRAILER'
  | 'OFFICIAL_TEASER'
  | 'FINAL_TRAILER'
  | 'OFFICIAL_CLIP'
  | 'FEATURETTE'
  | 'TV_SPOT'
  | 'FAN_MADE_UNOFFICIAL'
  | 'UNKNOWN';

export type TrailerEvidenceVerificationState =
  | 'OBSERVED'
  | 'INFERRED'
  | 'EDITORIAL'
  | 'VERIFIED';

export type TrailerLifecycleEventType =
  | 'NEW_OFFICIAL_TRAILER'
  | 'TRAILER_UPDATED'
  | 'TRAILER_REPLACED'
  | 'TRAILER_REMOVED';

export interface RawTMDbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at?: string;
  iso_639_1?: string;
  iso_3166_1?: string;
  size?: number;
}

export interface VerifiedTrailerMetadata {
  videoKey: string;
  videoTitle: string;
  videoSite: 'YouTube' | string;
  videoType: string;
  classification: TrailerClassification;
  isOfficial: boolean;
  isEligibleForEvidence: boolean;
  requiresEditorialReview: boolean;
  publishedAt?: string;
  sourceUrl: string;
  embedUrl: string;
  verificationNotes: string;
  confidenceScore: number;
}

export interface DiscoveredTrailerEvent {
  id: string;
  eventHash: string;
  eventType: TrailerLifecycleEventType;
  franchiseId: string;
  contentId: string;
  continuity?: string;
  tmdbId: number;
  mediaType: 'movie' | 'series';
  title: string;
  discoveredAt: string;
  trailer: VerifiedTrailerMetadata;
  supersededVideoKey?: string;
  status: ProposalStatus; // always defaults to 'pending'
}

export interface TrailerDiscoveryScanResult {
  scanTimestamp: string;
  titlesScanned: number;
  trailersFound: number;
  officialTrailersDiscovered: number;
  rejectedVideosCount: number;
  newEventsGenerated: number;
  duplicateEventsIgnored: number;
  events: DiscoveredTrailerEvent[];
}
