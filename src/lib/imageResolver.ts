/**
 * CineOrder Canonical Image Resolution System
 * Provides deterministic, ID-based poster, backdrop, and franchise artwork resolution.
 */

import type { Content, Franchise } from '@/types';
import { tmdbImage } from '@/lib/tmdb';

export const CINEORDER_PLACEHOLDER_POSTER = '/placeholder-poster.svg';
export const CINEORDER_PLACEHOLDER_BACKDROP = '/placeholder-backdrop.svg';

/**
 * Resolves poster image for a content item.
 * Prioritizes item's verified poster_url, then TMDB ID image path, then CineOrder fallback.
 * Strictly prevents leaking artwork from another title or franchise.
 */
export function resolveContentPoster(content?: Partial<Content> | null): string {
  if (!content) return CINEORDER_PLACEHOLDER_POSTER;

  const rawPoster = (content.poster_url || '').trim();

  // If poster_url is valid and not a generic placeholder
  if (
    rawPoster &&
    rawPoster !== CINEORDER_PLACEHOLDER_POSTER &&
    rawPoster !== '/placeholder.svg'
  ) {
    if (rawPoster.startsWith('http://') || rawPoster.startsWith('https://')) {
      return rawPoster;
    }
    if (rawPoster.startsWith('/')) {
      return tmdbImage.poster(rawPoster);
    }
  }

  // Fallback to CineOrder placeholder
  return CINEORDER_PLACEHOLDER_POSTER;
}

/**
 * Resolves backdrop image for a content item.
 */
export function resolveContentBackdrop(content?: Partial<Content> | null): string {
  if (!content) return CINEORDER_PLACEHOLDER_BACKDROP;

  const rawBackdrop = (content.backdrop_url || '').trim();

  if (
    rawBackdrop &&
    rawBackdrop !== CINEORDER_PLACEHOLDER_BACKDROP &&
    rawBackdrop !== '/placeholder.svg'
  ) {
    if (rawBackdrop.startsWith('http://') || rawBackdrop.startsWith('https://')) {
      return rawBackdrop;
    }
    if (rawBackdrop.startsWith('/')) {
      return tmdbImage.backdrop(rawBackdrop);
    }
  }

  // Fallback to poster if backdrop is missing, or fallback backdrop
  const poster = resolveContentPoster(content);
  if (poster !== CINEORDER_PLACEHOLDER_POSTER) {
    return poster;
  }

  return CINEORDER_PLACEHOLDER_BACKDROP;
}

/**
 * Resolves artwork for a franchise.
 */
export function resolveFranchiseArtwork(franchise?: Partial<Franchise> | null): {
  poster: string;
  banner: string;
} {
  if (!franchise) {
    return {
      poster: CINEORDER_PLACEHOLDER_POSTER,
      banner: CINEORDER_PLACEHOLDER_BACKDROP,
    };
  }

  const poster = (franchise.poster_url || '').trim() || CINEORDER_PLACEHOLDER_POSTER;
  const banner = (franchise.banner_url || '').trim() || CINEORDER_PLACEHOLDER_BACKDROP;

  return {
    poster: poster.startsWith('http') || poster.startsWith('/') ? poster : CINEORDER_PLACEHOLDER_POSTER,
    banner: banner.startsWith('http') || banner.startsWith('/') ? banner : CINEORDER_PLACEHOLDER_BACKDROP,
  };
}
