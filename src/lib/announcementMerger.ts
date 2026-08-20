import type { Content } from '../types';
import type { AnnouncementProposalPackage } from '../types/announcementDiscovery';
import { allContent } from '../data/franchises/index';

export interface MergeResult {
  success: boolean;
  message: string;
  generatedContent?: Content;
  typescriptSnippet?: string;
  mergedAt?: string;
}

export function generateFranchiseContentSnippet(pkg: AnnouncementProposalPackage): string {
  const c = pkg.candidate;

  if (pkg.category === 'RELEASE_DATE_CHANGES') {
    return `// In src/data/franchises/${pkg.franchiseId}.ts:
// Update item '${c.id}' release date:
// Previous: ${pkg.diff?.previousValue || 'N/A'}
// Proposed: ${pkg.diff?.proposedValue || c.releaseDate}
release_date: '${c.releaseDate}',
theatrical_release_date: '${c.theatricalReleaseDate || c.releaseDate}',`;
  }

  if (pkg.category === 'OTT_CHANGES') {
    return `// In src/data/franchises/${pkg.franchiseId}.ts:
// Update item '${c.id}' OTT/Streaming providers:
// Previous: ${pkg.diff?.previousValue || 'N/A'}
// Proposed: ${pkg.diff?.proposedValue || c.providers.join(', ')}
providers: ${JSON.stringify(c.providers)},
ott_available: ${c.ottAvailable},
subscription_streaming_available: ${c.subscriptionStreamingAvailable},`;
  }

  if (pkg.category === 'TITLE_CHANGES') {
    return `// In src/data/franchises/${pkg.franchiseId}.ts:
// Update item '${c.id}' title:
// Previous: ${pkg.diff?.previousValue || 'N/A'}
// Proposed: ${pkg.diff?.proposedValue || c.title}
title: ${JSON.stringify(c.title)},`;
  }

  if (pkg.category === 'CANCELLATIONS') {
    return `// In src/data/franchises/${pkg.franchiseId}.ts:
// Update item '${c.id}' status to cancelled:
status: 'cancelled',`;
  }

  if (pkg.category === 'ARTWORK_CHANGES') {
    return `// In src/data/franchises/${pkg.franchiseId}.ts:
// Update item '${c.id}' artwork:
poster_url: '${c.posterUrl}',
backdrop_url: '${c.backdropUrl}',`;
  }

  if (pkg.category === 'METADATA_CHANGES') {
    return `// In src/data/franchises/${pkg.franchiseId}.ts:
// Update item '${c.id}' metadata:
status: '${c.status}',
overview: ${JSON.stringify(c.overview)},`;
  }

  // Default NEW_TITLES snippet
  return `  buildContent({
    id: '${c.id}',
    franchise_id: '${c.franchiseId}',
    tmdb_id: ${c.tmdbId || 0},
    title: ${JSON.stringify(c.title)},
    type: '${c.mediaType}',
    poster_url: '${c.posterUrl}',
    backdrop_url: '${c.backdropUrl}',
    overview: ${JSON.stringify(c.overview)},
    release_date: '${c.releaseDate || '2028-01-01'}',
    theatrical_release_date: '${c.theatricalReleaseDate || c.releaseDate || '2028-01-01'}',
    runtime: ${c.runtime || 120},
    rating: ${c.rating || 8.0},
    status: '${c.status === 'announced' ? 'upcoming' : c.status}',
    theatrical_released: ${c.theatricalReleased},
    ott_available: ${c.ottAvailable},
    digital_available: ${c.digitalAvailable},
    subscription_streaming_available: ${c.subscriptionStreamingAvailable},
    director: ${c.director ? JSON.stringify(c.director) : 'undefined'},
    providers: ${JSON.stringify(c.providers)},
  }),`;
}

export function mergeAnnouncementProposal(
  pkg: AnnouncementProposalPackage,
  reviewer: string = 'Editorial Admin'
): MergeResult {
  if (pkg.status !== 'approved') {
    return {
      success: false,
      message: `Cannot merge proposal '${pkg.id}': Status is '${pkg.status}' (Must be 'approved' by editorial review first).`,
    };
  }

  const c = pkg.candidate;
  const isModification = pkg.category !== 'NEW_TITLES';

  // Duplicate Check for new titles
  const existing = allContent.find((item) => item.id === c.id || (c.tmdbId && item.tmdb_id === c.tmdbId));
  if (!isModification && existing) {
    return {
      success: false,
      message: `Cannot merge: Target ID '${c.id}' already exists in production catalog as '${existing.title}'.`,
    };
  }

  // Generate canonical Content object
  const validStatus: Content['status'] = c.status === 'announced' ? 'upcoming' : (c.status as any);

  const generatedContent: Content = {
    id: c.id,
    tmdb_id: c.tmdbId || 0,
    title: c.title,
    type: c.mediaType,
    franchise_id: c.franchiseId,
    overview: c.overview,
    release_date: c.releaseDate || '2028-01-01',
    theatrical_release_date: c.theatricalReleaseDate || c.releaseDate || '2028-01-01',
    runtime: c.runtime || 120,
    rating: c.rating || 8.0,
    status: validStatus,
    theatrical_released: c.theatricalReleased,
    ott_available: c.ottAvailable,
    digital_available: c.digitalAvailable,
    subscription_streaming_available: c.subscriptionStreamingAvailable,
    streaming_providers: [],
    director: c.director || '',
    genres: [],
    cast: [],
    trailer_url: '',
    episode_count: null,
    season_count: null,
    poster_url: c.posterUrl,
    backdrop_url: c.backdropUrl,
    is_canon: c.isCanon,
    is_required: c.isRequired,
    created_at: new Date().toISOString(),
  };

  const tsSnippet = generateFranchiseContentSnippet(pkg);

  // Update proposal status in package
  pkg.status = 'merged';
  pkg.reviewedBy = reviewer;
  pkg.reviewedAt = new Date().toISOString();
  pkg.reviewNotes = `Successfully merged by ${reviewer} into franchise ${pkg.franchiseName} (${pkg.category}).`;

  return {
    success: true,
    message: `Successfully merged proposal '${c.title}' (${pkg.category}) for franchise '${pkg.franchiseName}'!`,
    generatedContent,
    typescriptSnippet: tsSnippet,
    mergedAt: pkg.reviewedAt,
  };
}
