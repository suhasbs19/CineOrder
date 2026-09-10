import { useState, useEffect } from 'react';
import { allContent, franchises } from '@/data/franchises';
import { tmdb, tmdbImage } from '@/lib/tmdb';
import type { Content } from '@/types';

export interface RecommendedMovieItem {
  id: string | number;
  canonical_id?: string;
  tmdb_id?: number | null;
  title: string;
  poster_url: string;
  backdrop_url?: string;
  release_date?: string;
  rating?: number;
  overview?: string;
  franchise_name?: string;
  franchise_slug?: string;
  content?: Content;
}

/**
 * Builds the initial default recommended movies synchronously from the canonical knowledge catalog.
 * This guarantees zero layout delay, zero blank screens, and instantaneous rendering on initial component mount.
 */
export function buildInitialRecommendedMovies(): RecommendedMovieItem[] {
  const franchiseMap = new Map(franchises.map((f) => [f.id, f]));

  // Pick top-rated movies/animated features across franchises
  const candidateMovies = allContent
    .filter(
      (c) =>
        (c.type === 'movie' || c.type === 'animated') &&
        c.poster_url &&
        c.rating &&
        c.rating >= 7.5
    )
    .sort((a, b) => {
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (Math.abs(ratingDiff) > 0.1) return ratingDiff;
      return (b.release_date || '').localeCompare(a.release_date || '');
    })
    .slice(0, 12);

  return candidateMovies.map((c) => {
    const f = franchiseMap.get(c.franchise_id);
    return {
      id: c.id,
      canonical_id: c.id,
      tmdb_id: c.tmdb_id,
      title: c.title,
      poster_url: c.poster_url || '/placeholder-poster.svg',
      backdrop_url: c.backdrop_url || '/placeholder-backdrop.svg',
      release_date: c.release_date,
      rating: c.rating,
      overview: c.overview,
      franchise_name: f ? f.name : undefined,
      franchise_slug: f ? f.slug : undefined,
      content: c,
    };
  });
}

/**
 * Hook to retrieve recommended and popular movies for the Home page.
 * Synchronously provides canonical recommendations immediately on mount,
 * and seamlessly enriches with live TMDb trending data in the background.
 */
export function useRecommendedMovies() {
  const [movies, setMovies] = useState<RecommendedMovieItem[]>(() => buildInitialRecommendedMovies());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function enrichWithTrending() {
      try {
        const trendingData = await tmdb.getTrending('movie', 'week');
        if (!isMounted) return;

        if (trendingData?.results && trendingData.results.length > 0) {
          const franchiseMap = new Map(franchises.map((f) => [f.id, f]));
          const mappedTrending: RecommendedMovieItem[] = [];

          for (const m of trendingData.results) {
            if (!m.title || (!m.poster_path && !m.backdrop_path)) continue;

            const canonical = allContent.find(
              (c) =>
                (c.tmdb_id && c.tmdb_id === m.id) ||
                (c.title && c.title.toLowerCase() === (m.title || '').toLowerCase())
            );
            const parentFranchise = canonical ? franchiseMap.get(canonical.franchise_id) : undefined;

            mappedTrending.push({
              id: canonical ? canonical.id : m.id,
              canonical_id: canonical?.id,
              tmdb_id: m.id,
              title: canonical ? canonical.title : (m.title || 'Movie'),
              poster_url: (m.poster_path ? tmdbImage.poster(m.poster_path, 'w500') : canonical?.poster_url) || '/placeholder-poster.svg',
              backdrop_url: (m.backdrop_path ? tmdbImage.backdrop(m.backdrop_path, 'w780') : canonical?.backdrop_url) || '/placeholder-backdrop.svg',
              release_date: canonical?.release_date || m.release_date,
              rating: canonical?.rating || (m.vote_average ? Number(m.vote_average.toFixed(1)) : undefined),
              overview: canonical?.overview || m.overview,
              franchise_name: parentFranchise?.name,
              franchise_slug: parentFranchise?.slug,
              content: canonical,
            });
          }

          if (mappedTrending.length > 0 && isMounted) {
            const seenIds = new Set<string | number>();
            const combined: RecommendedMovieItem[] = [];

            for (const item of mappedTrending) {
              const key = item.canonical_id || item.id;
              if (!seenIds.has(key)) {
                seenIds.add(key);
                combined.push(item);
              }
            }

            // Fill up with curated canonical recommendations if trending list is small
            const seed = buildInitialRecommendedMovies();
            for (const item of seed) {
              const key = item.canonical_id || item.id;
              if (!seenIds.has(key) && combined.length < 12) {
                seenIds.add(key);
                combined.push(item);
              }
            }

            setMovies(combined.slice(0, 12));
          }
        }
      } catch (err: any) {
        console.warn('[useRecommendedMovies] Background trending fetch notice:', err?.message || err);
        if (isMounted && movies.length === 0) {
          setError('Unable to load trending movies.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    enrichWithTrending();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    movies,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      setMovies(buildInitialRecommendedMovies());
      setLoading(false);
    },
  };
}
