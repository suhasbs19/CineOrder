/**
 * CineOrder Trailer Intelligence — Phase 2: Official Trailer Discovery & Video Ingestion Engine
 * 
 * Ingests, verifies, and classifies official TMDb videos into structured trailer metadata.
 * Zero Story Knowledge Graph mutations or recommendation adjustments occur at discovery time.
 */

import { tmdb } from './tmdb';
import type { Content } from '../types';
import type {
  RawTMDbVideo,
  VerifiedTrailerMetadata,
  DiscoveredTrailerEvent,
  TrailerClassification,
  TrailerLifecycleEventType,
} from '../types/trailerDiscovery';

// ============================================================================
// 1. REPUTABLE YOUTUBE ID REGEX & FAN KEYWORDS
// ============================================================================
const YOUTUBE_KEY_REGEX = /^[a-zA-Z0-9_-]{6,16}$/;

const FAN_UNOFFICIAL_PATTERNS = [
  /\bfan\s*made\b/i,
  /\bconcept\s*trailer\b/i,
  /\bfan\s*trailer\b/i,
  /\bfan\s*edit\b/i,
  /\btribute\b/i,
  /\bparody\b/i,
  /\bdeepfake\b/i,
  /\bpitch\s*concept\b/i,
  /\bleak(ed)?\b/i,
  /\brumor\b/i,
];

// ============================================================================
// 2. DETERMINISTIC EVENT HASH GENERATOR (Idempotency Guarantee)
// ============================================================================
export function generateTrailerEventHash(
  franchiseId: string,
  tmdbId: number,
  videoKey: string,
  videoType: string,
  publishedAt?: string
): string {
  const payload = [
    (franchiseId || '').trim().toLowerCase(),
    String(tmdbId || 0),
    (videoKey || '').trim(),
    (videoType || '').trim().toLowerCase(),
    (publishedAt || '').trim(),
  ].join('|');

  // Universal deterministic 64-character hex hash
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

  // Repeat for 64-char pseudo-SHA256 signature
  return `tr-${hex1}${hex2}${hex3}${hex4}${hex2}${hex1}${hex4}${hex3}`;
}

// ============================================================================
// 3. VIDEO CLASSIFICATION & OFFICIAL SOURCE VERIFICATION
// ============================================================================
export function classifyTMDbVideo(raw: RawTMDbVideo): VerifiedTrailerMetadata {
  const isYouTube = (raw.site || '').trim().toLowerCase() === 'youtube';
  const hasValidKey = Boolean(raw.key && YOUTUBE_KEY_REGEX.test(raw.key.trim()));
  const videoTitle = (raw.name || '').trim();
  const rawType = (raw.type || '').trim();

  // 1. Check YouTube Platform Requirement
  if (!isYouTube || !hasValidKey) {
    return {
      videoKey: raw.key || '',
      videoTitle: videoTitle || 'Unknown Video',
      videoSite: raw.site || 'Unknown',
      videoType: rawType || 'Unknown',
      classification: 'UNKNOWN',
      isOfficial: false,
      isEligibleForEvidence: false,
      requiresEditorialReview: false,
      publishedAt: raw.published_at,
      sourceUrl: isYouTube && raw.key ? `https://www.youtube.com/watch?v=${raw.key}` : '',
      embedUrl: isYouTube && raw.key ? `https://www.youtube.com/embed/${raw.key}` : '',
      verificationNotes: !isYouTube
        ? `Rejected: Unsupported video site '${raw.site}'. Only YouTube is verified.`
        : 'Rejected: Missing or malformed YouTube key.',
      confidenceScore: 0.0,
    };
  }

  // 2. Check Fan / Unofficial Markers
  const hasFanTitle = FAN_UNOFFICIAL_PATTERNS.some((pattern) => pattern.test(videoTitle));
  const isFlaggedUnofficial = raw.official === false || hasFanTitle;

  if (isFlaggedUnofficial) {
    return {
      videoKey: raw.key,
      videoTitle,
      videoSite: 'YouTube',
      videoType: rawType,
      classification: 'FAN_MADE_UNOFFICIAL',
      isOfficial: false,
      isEligibleForEvidence: false,
      requiresEditorialReview: false,
      publishedAt: raw.published_at,
      sourceUrl: `https://www.youtube.com/watch?v=${raw.key}`,
      embedUrl: `https://www.youtube.com/embed/${raw.key}`,
      verificationNotes: hasFanTitle
        ? 'Rejected: Fan-made, concept, or unofficial keywords detected in title.'
        : 'Rejected: TMDb metadata explicitly marked as unofficial (official = false).',
      confidenceScore: 0.0,
    };
  }

  // 3. Classify Video Type
  let classification: TrailerClassification = 'UNKNOWN';
  const normalizedType = rawType.toLowerCase();

  if (normalizedType === 'trailer') {
    if (/final\s*trailer/i.test(videoTitle) || /main\s*trailer/i.test(videoTitle)) {
      classification = 'FINAL_TRAILER';
    } else if (/teaser/i.test(videoTitle)) {
      classification = 'OFFICIAL_TEASER';
    } else {
      classification = 'OFFICIAL_TRAILER';
    }
  } else if (normalizedType === 'teaser') {
    classification = 'OFFICIAL_TEASER';
  } else if (normalizedType === 'clip') {
    classification = 'OFFICIAL_CLIP';
  } else if (normalizedType === 'featurette' || normalizedType === 'behind the scenes' || normalizedType === 'bloopers') {
    classification = 'FEATURETTE';
  } else if (normalizedType === 'tv spot' || normalizedType === 'promo' || normalizedType === 'tv') {
    classification = 'TV_SPOT';
  }

  // 4. Determine Evidentiary Weight & Eligibility
  let isEligibleForEvidence = false;
  let requiresEditorialReview = false;
  let confidenceScore = 0.0;

  switch (classification) {
    case 'OFFICIAL_TRAILER':
    case 'FINAL_TRAILER':
      isEligibleForEvidence = true;
      requiresEditorialReview = false;
      confidenceScore = 0.95;
      break;
    case 'OFFICIAL_TEASER':
    case 'OFFICIAL_CLIP':
      isEligibleForEvidence = true;
      requiresEditorialReview = false;
      confidenceScore = 0.90;
      break;
    case 'FEATURETTE':
    case 'TV_SPOT':
      isEligibleForEvidence = true;
      requiresEditorialReview = true;
      confidenceScore = 0.70;
      break;
    case 'UNKNOWN':
    default:
      isEligibleForEvidence = false;
      requiresEditorialReview = false;
      confidenceScore = 0.0;
      break;
  }

  return {
    videoKey: raw.key,
    videoTitle,
    videoSite: 'YouTube',
    videoType: rawType,
    classification,
    isOfficial: true,
    isEligibleForEvidence,
    requiresEditorialReview,
    publishedAt: raw.published_at,
    sourceUrl: `https://www.youtube.com/watch?v=${raw.key}`,
    embedUrl: `https://www.youtube.com/embed/${raw.key}`,
    verificationNotes: `Verified ${classification} from official YouTube source.`,
    confidenceScore,
  };
}

// ============================================================================
// 4. TRAILER LIFECYCLE EVENT DETECTOR
// ============================================================================
export function detectTrailerLifecycleEvent(
  content: Content,
  verifiedTrailer: VerifiedTrailerMetadata,
  knownTrailers: VerifiedTrailerMetadata[] = []
): DiscoveredTrailerEvent | null {
  if (!verifiedTrailer.isEligibleForEvidence || verifiedTrailer.classification === 'UNKNOWN' || verifiedTrailer.classification === 'FAN_MADE_UNOFFICIAL') {
    return null;
  }

  const existing = knownTrailers.find((t) => t.videoKey === verifiedTrailer.videoKey);
  const nowIso = new Date().toISOString();
  const tmdbId = content.tmdb_id || 0;

  if (!existing) {
    // Check if this new trailer supersedes an older teaser
    const olderTeaser = knownTrailers.find(
      (t) => t.classification === 'OFFICIAL_TEASER' && (verifiedTrailer.classification === 'OFFICIAL_TRAILER' || verifiedTrailer.classification === 'FINAL_TRAILER')
    );

    const eventType: TrailerLifecycleEventType = olderTeaser ? 'TRAILER_REPLACED' : 'NEW_OFFICIAL_TRAILER';
    const eventHash = generateTrailerEventHash(
      content.franchise_id,
      tmdbId,
      verifiedTrailer.videoKey,
      verifiedTrailer.classification,
      verifiedTrailer.publishedAt
    );

    return {
      id: `prop-trailer-${content.franchise_id}-${content.id}-${verifiedTrailer.videoKey}`,
      eventHash,
      eventType,
      franchiseId: content.franchise_id,
      contentId: content.id,
      continuity: (content as any).continuity || content.franchise_id,
      tmdbId,
      mediaType: content.type === 'series' ? 'series' : 'movie',
      title: content.title,
      discoveredAt: nowIso,
      trailer: verifiedTrailer,
      supersededVideoKey: olderTeaser ? olderTeaser.videoKey : undefined,
      status: 'pending', // Strict human-approval gate
    };
  }

  // If already known, check if metadata updated
  const metadataChanged =
    existing.videoTitle !== verifiedTrailer.videoTitle ||
    existing.classification !== verifiedTrailer.classification ||
    existing.confidenceScore !== verifiedTrailer.confidenceScore;

  if (metadataChanged) {
    const eventHash = generateTrailerEventHash(
      content.franchise_id,
      tmdbId,
      verifiedTrailer.videoKey,
      verifiedTrailer.classification,
      verifiedTrailer.publishedAt
    );

    return {
      id: `prop-trailer-update-${content.franchise_id}-${content.id}-${verifiedTrailer.videoKey}`,
      eventHash,
      eventType: 'TRAILER_UPDATED',
      franchiseId: content.franchise_id,
      contentId: content.id,
      continuity: (content as any).continuity || content.franchise_id,
      tmdbId,
      mediaType: content.type === 'series' ? 'series' : 'movie',
      title: content.title,
      discoveredAt: nowIso,
      trailer: verifiedTrailer,
      status: 'pending',
    };
  }

  return null;
}

// ============================================================================
// 5. TRAILER REMOVAL DETECTOR
// ============================================================================
export function detectRemovedTrailers(
  content: Content,
  currentVideos: VerifiedTrailerMetadata[],
  knownTrailers: VerifiedTrailerMetadata[]
): DiscoveredTrailerEvent[] {
  const currentKeys = new Set(currentVideos.map((v) => v.videoKey));
  const removed: DiscoveredTrailerEvent[] = [];
  const nowIso = new Date().toISOString();
  const tmdbId = content.tmdb_id || 0;

  for (const known of knownTrailers) {
    if (!currentKeys.has(known.videoKey)) {
      const eventHash = generateTrailerEventHash(
        content.franchise_id,
        tmdbId,
        known.videoKey,
        'REMOVED',
        known.publishedAt
      );

      removed.push({
        id: `prop-trailer-removed-${content.franchise_id}-${content.id}-${known.videoKey}`,
        eventHash,
        eventType: 'TRAILER_REMOVED',
        franchiseId: content.franchise_id,
        contentId: content.id,
        continuity: (content as any).continuity || content.franchise_id,
        tmdbId,
        mediaType: content.type === 'series' ? 'series' : 'movie',
        title: content.title,
        discoveredAt: nowIso,
        trailer: known,
        status: 'pending',
      });
    }
  }

  return removed;
}

// ============================================================================
// 6. CONTENT TRAILER DISCOVERY PIPELINE
// ============================================================================
export async function discoverTrailersForContent(
  content: Content,
  knownTrailers: VerifiedTrailerMetadata[] = []
): Promise<DiscoveredTrailerEvent[]> {
  if (!content.tmdb_id) return [];

  let rawVideos: RawTMDbVideo[] = [];

  try {
    if (content.type === 'series') {
      const res = await tmdb.getTVVideos(content.tmdb_id);
      rawVideos = (res.results || []) as RawTMDbVideo[];
    } else {
      const res = await tmdb.getMovieVideos(content.tmdb_id);
      rawVideos = (res.results || []) as RawTMDbVideo[];
    }
  } catch (error) {
    // Non-fatal: network/TMDb fallback
    return [];
  }

  const events: DiscoveredTrailerEvent[] = [];
  const verifiedList: VerifiedTrailerMetadata[] = [];

  for (const raw of rawVideos) {
    const verified = classifyTMDbVideo(raw);
    if (verified.isEligibleForEvidence) {
      verifiedList.push(verified);
      const event = detectTrailerLifecycleEvent(content, verified, knownTrailers);
      if (event) {
        events.push(event);
      }
    }
  }

  // Detect removed trailers
  const removedEvents = detectRemovedTrailers(content, verifiedList, knownTrailers);
  events.push(...removedEvents);

  return events;
}

// ============================================================================
// 7. IN-MEMORY & PERSISTENT PROPOSAL STORE FOR TRAILER INTELLIGENCE
// ============================================================================
export const TRAILER_PROPOSALS_STORAGE_KEY = 'cineorder_trailer_proposals_v1';

export class TrailerProposalStore {
  private proposals: Map<string, DiscoveredTrailerEvent> = new Map();
  private processedHashes: Set<string> = new Set();

  constructor() {
    this.load();
  }

  load(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(TRAILER_PROPOSALS_STORAGE_KEY);
        if (raw) {
          const list: DiscoveredTrailerEvent[] = JSON.parse(raw);
          for (const item of list) {
            this.proposals.set(item.id, item);
            this.processedHashes.add(item.eventHash);
          }
        }
      } catch (e) {
        console.warn('Failed to load trailer proposals from localStorage:', e);
      }
    }
  }

  save(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const list = Array.from(this.proposals.values());
        window.localStorage.setItem(TRAILER_PROPOSALS_STORAGE_KEY, JSON.stringify(list));
      } catch (e) {
        console.error('Failed to save trailer proposals to localStorage:', e);
      }
    }
  }

  addEvent(event: DiscoveredTrailerEvent): boolean {
    if (this.processedHashes.has(event.eventHash)) {
      return false; // Idempotent deduplication
    }

    this.proposals.set(event.id, event);
    this.processedHashes.add(event.eventHash);
    this.save();
    return true;
  }

  getPendingEvents(): DiscoveredTrailerEvent[] {
    return Array.from(this.proposals.values()).filter((e) => e.status === 'pending');
  }

  getAllEvents(): DiscoveredTrailerEvent[] {
    return Array.from(this.proposals.values());
  }

  getEventById(id: string): DiscoveredTrailerEvent | undefined {
    return this.proposals.get(id);
  }

  clear(): void {
    this.proposals.clear();
    this.processedHashes.clear();
    this.save();
  }
}

export const globalTrailerProposalStore = new TrailerProposalStore();
