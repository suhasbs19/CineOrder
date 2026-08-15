import { useState, useEffect, useCallback } from 'react';
import { tmdb, isTMDbConfigured, tmdbImage, TMDbError } from '@/lib/tmdb';
import type { TMDbMovie, TMDbTVShow, TMDbCredits, TMDbVideos } from '@/lib/tmdb';
import { getFranchiseContent, getWatchOrders, franchises } from '@/data/franchises';
import { getFranchiseArtwork } from '@/data/franchiseArtwork';
import { supabase } from '@/lib/supabase';
import { normalizeTitle, isTitleEquivalent } from '@/lib/utils';
import type { Content, WatchOrder, CastMember } from '@/types';

interface UseTMDbContentResult {
  content: Content[];
  watchOrders: WatchOrder[];
  franchiseHeader: {
    poster_url: string;
    banner_url: string;
    logo_url: string;
  };
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches live TMDb data for all content in a franchise using strict ID & Title validation.
 * Merges ONLY matching TMDb records. Search API is used ONLY if tmdb_id is missing or direct call returns HTTP 404.
 */
export function useTMDbContent(franchiseId: string): UseTMDbContentResult {
  const initialArtwork = getFranchiseArtwork(franchiseId);

  const [content, setContent] = useState<Content[]>(() =>
    franchiseId ? getFranchiseContent(franchiseId) : []
  );
  const [watchOrders, setWatchOrders] = useState<WatchOrder[]>(() =>
    franchiseId ? getWatchOrders(franchiseId) : []
  );
  const [franchiseHeader, setFranchiseHeader] = useState({
    poster_url: initialArtwork.poster,
    banner_url: initialArtwork.banner,
    logo_url: initialArtwork.logo,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const refetch = useCallback(() => setFetchKey((k) => k + 1), []);

  useEffect(() => {
    if (!franchiseId) {
      setContent([]);
      setWatchOrders([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const art = getFranchiseArtwork(franchiseId);
      setFranchiseHeader({
        poster_url: art.poster,
        banner_url: art.banner,
        logo_url: art.logo,
      });

      const staticContent = getFranchiseContent(franchiseId);
      const staticWatchOrders = getWatchOrders(franchiseId, staticContent);

      if (!cancelled) {
        setContent(staticContent);
        setWatchOrders(staticWatchOrders);
      }

      if (!isTMDbConfigured() || staticContent.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const targetFranchise = franchises.find(
          (f) => f.id === franchiseId || f.slug === franchiseId
        );

        if (targetFranchise?.tmdb_collection_id) {
          tmdb
            .getCollection(targetFranchise.tmdb_collection_id)
            .then((coll) => {
              if (!cancelled && coll) {
                setFranchiseHeader((prev) => ({
                  ...prev,
                  poster_url: coll.poster_path ? tmdbImage.poster(coll.poster_path) : prev.poster_url,
                  banner_url: coll.backdrop_path ? tmdbImage.backdrop(coll.backdrop_path) : prev.banner_url,
                }));
              }
            })
            .catch(() => {});
        }

        const enrichedItems = await Promise.all(
          staticContent.map(async (item) => {
            try {
              return await enrichFromTMDb(item);
            } catch {
              return item;
            }
          })
        );

        const safeEnrichedItems = enrichedItems.map((item, idx) => item || staticContent[idx]);

        let finalWatchOrders = getWatchOrders(franchiseId, safeEnrichedItems);
        try {
          const { data: remoteOrders, error: sbError } = await supabase
            .from('watch_orders')
            .select('*')
            .eq('franchise_id', franchiseId)
            .order('position', { ascending: true });

          if (!sbError && remoteOrders && remoteOrders.length > 0) {
            const seenKeys = new Set<string>();
            const mappedRemoteOrders: WatchOrder[] = [];

            remoteOrders.forEach((o: any) => {
              const matchedContent = safeEnrichedItems.find((c) => c.id === o.content_id);
              if (!matchedContent) return;

              const dedupeKey = `${o.order_type}-${o.content_id}`;
              if (seenKeys.has(dedupeKey)) return;
              seenKeys.add(dedupeKey);

              mappedRemoteOrders.push({
                id: o.id || `${o.order_type}-${o.content_id}`,
                franchise_id: o.franchise_id,
                content_id: o.content_id,
                order_type: o.order_type,
                position: o.position,
                notes: o.notes || '',
                content: matchedContent,
              });
            });

            if (mappedRemoteOrders.length > 0) {
              const remoteContentIds = new Set(mappedRemoteOrders.map((o) => o.content_id));
              const missingItems = safeEnrichedItems.filter((c) => !remoteContentIds.has(c.id));
              if (missingItems.length > 0) {
                const fallbackOrders = getWatchOrders(franchiseId, safeEnrichedItems);
                fallbackOrders.forEach((so) => {
                  const key = `${so.order_type}-${so.content_id}`;
                  if (!seenKeys.has(key)) {
                    seenKeys.add(key);
                    mappedRemoteOrders.push(so);
                  }
                });
              }
              finalWatchOrders = mappedRemoteOrders;
            }
          }
        } catch {
          // Keep local finalWatchOrders
        }

        if (finalWatchOrders.length === 0) {
          finalWatchOrders = staticWatchOrders;
        }

        const ordersByType: Record<string, WatchOrder[]> = {};
        finalWatchOrders.forEach((o) => {
          if (!ordersByType[o.order_type]) {
            ordersByType[o.order_type] = [];
          }
          ordersByType[o.order_type]!.push(o);
        });

        const normalizedWatchOrders: WatchOrder[] = [];
        Object.values(ordersByType).forEach((group) => {
          group.forEach((order, idx) => {
            normalizedWatchOrders.push({
              ...order,
              position: idx + 1,
            });
          });
        });

        if (!cancelled) {
          setContent(safeEnrichedItems);
          setWatchOrders(normalizedWatchOrders.length > 0 ? normalizedWatchOrders : finalWatchOrders);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load TMDb data');
          setContent(staticContent);
          setWatchOrders(staticWatchOrders);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [franchiseId, fetchKey]);

  return { content, watchOrders, franchiseHeader, loading, error, refetch };
}

// ─── TMDb → Content Enrichment ──────────────────────────────

async function enrichFromTMDb(item: Content): Promise<Content> {
  if (!item.tmdb_id) {
    const fallback = await enrichFromSearchFallback(item);
    if (!fallback) return item;
    return mapEnrichedContent(item, fallback);
  }

  const isMovie = item.type !== 'series';
  let tmdbData: TMDbMovie | TMDbTVShow | null = null;
  let isConfirmed404 = false;

  try {
    tmdbData = isMovie
      ? await tmdb.getMovie(item.tmdb_id)
      : await tmdb.getTVShow(item.tmdb_id);

    if (tmdbData) {
      const returnedTitle = 'title' in tmdbData ? tmdbData.title : tmdbData.name;
      const idMatches = tmdbData.id === item.tmdb_id;
      const titleMatches = isTitleEquivalent(item.title, returnedTitle);
      const isValid = idMatches && titleMatches;

      console.log(`[TMDb Investigation]`, {
        seedTitle: item.title,
        seedTmdbId: item.tmdb_id,
        returnedTmdbId: tmdbData.id,
        returnedTitle: returnedTitle,
        posterPath: tmdbData.poster_path,
        backdropPath: tmdbData.backdrop_path,
        isValid,
      });

      if (!isValid) {
        tmdbData = null; // Reject TMDb response if ID or title fails validation!
      }
    }
  } catch (err: any) {
    if (err instanceof TMDbError && err.status === 404) {
      isConfirmed404 = true;
    }
    tmdbData = null;
  }

  // Use Search API ONLY if direct endpoint returned a confirmed 404
  if (!tmdbData && isConfirmed404) {
    tmdbData = await enrichFromSearchFallback(item);
  }

  if (!tmdbData) return item;

  return mapEnrichedContent(item, tmdbData);
}

async function mapEnrichedContent(item: Content, tmdbData: TMDbMovie | TMDbTVShow): Promise<Content> {
  const returnedTitle = 'title' in tmdbData ? tmdbData.title : tmdbData.name;
  const idMatches = !item.tmdb_id || tmdbData.id === item.tmdb_id;
  const titleMatches = normalizeTitle(returnedTitle) === normalizeTitle(item.title);

  if (!idMatches || !titleMatches) {
    return item;
  }

  const tmdbId = tmdbData.id;
  const isMovieObj = 'title' in tmdbData;

  const [credits, videos] = await Promise.all([
    isMovieObj
      ? tmdb.getMovieCredits(tmdbId).catch(() => null)
      : tmdb.getTVCredits(tmdbId).catch(() => null),
    isMovieObj
      ? tmdb.getMovieVideos(tmdbId).catch(() => null)
      : tmdb.getTVVideos(tmdbId).catch(() => null),
  ]);

  if (isMovieObj) {
    return mergeWithTMDbMovie(item, tmdbData as TMDbMovie, credits, videos);
  } else {
    return mergeWithTMDbTV(item, tmdbData as TMDbTVShow, credits, videos);
  }
}

// Rule 4: Validate Search Results strictly before accepting
async function enrichFromSearchFallback(item: Content): Promise<TMDbMovie | TMDbTVShow | null> {
  try {
    const isMovie = item.type === 'movie';
    const expectedYear = item.release_date ? item.release_date.slice(0, 4) : undefined;
    const normalizedTitle = normalizeTitle(item.title);

    const searchRes = isMovie
      ? await tmdb.searchMovies(item.title)
      : await tmdb.searchTV(item.title);

    if (!searchRes.results || searchRes.results.length === 0) return null;

    // Filter strictly by Title AND Release Year. NEVER pick arbitrary first result!
    const match = searchRes.results.find((r: any) => {
      const resTitle = normalizeTitle(r.title || r.name || '');
      const resOrigTitle = normalizeTitle(r.original_title || r.original_name || '');
      
      const titleMatches = resTitle === normalizedTitle || resOrigTitle === normalizedTitle;
      const resYear = (r.release_date || r.first_air_date || '').slice(0, 4);
      const yearMatches = !expectedYear || !resYear || resYear === expectedYear;

      return titleMatches && yearMatches;
    });

    if (match) {
      return isMovie
        ? await tmdb.getMovie(match.id).catch(() => null)
        : await tmdb.getTVShow(match.id).catch(() => null);
    }
  } catch {
    // Keep null
  }
  return null;
}

function mergeWithTMDbMovie(
  item: Content,
  movie: TMDbMovie,
  credits: TMDbCredits | null,
  videos: TMDbVideos | null
): Content {
  // Reject if returned ID does not match stored tmdb_id OR title fails normalization
  if (item.tmdb_id && movie.id !== item.tmdb_id) {
    return item;
  }
  if (normalizeTitle(movie.title) !== normalizeTitle(item.title)) {
    return item;
  }

  const director = credits?.crew.find((c) => c.job === 'Director')?.name || item.director;
  const cast = credits ? mapCast(credits.cast.slice(0, 8)) : item.cast;
  const trailer = findTrailer(videos) || item.trailer_url;

  return {
    ...item,
    title: item.title,
    overview: movie.overview || item.overview,
    poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : (item.poster_url || '/placeholder-poster.svg'),
    backdrop_url: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : (item.backdrop_url || '/placeholder-backdrop.svg'),
    release_date: movie.release_date || item.release_date,
    runtime: movie.runtime || item.runtime,
    rating: movie.vote_average ? parseFloat(movie.vote_average.toFixed(1)) : item.rating,
    genres: movie.genres?.length ? movie.genres.map((g) => g.name) : item.genres,
    status: mapStatus(movie.status),
    director,
    cast,
    trailer_url: trailer,
  };
}

function mergeWithTMDbTV(
  item: Content,
  tv: TMDbTVShow,
  credits: TMDbCredits | null,
  videos: TMDbVideos | null
): Content {
  // Reject if returned ID does not match stored tmdb_id OR title fails normalization
  if (item.tmdb_id && tv.id !== item.tmdb_id) {
    return item;
  }
  if (normalizeTitle(tv.name) !== normalizeTitle(item.title)) {
    return item;
  }

  const cast = credits ? mapCast(credits.cast.slice(0, 8)) : item.cast;
  const trailer = findTrailer(videos) || item.trailer_url;
  const avgRuntime = tv.episode_run_time?.length
    ? Math.round(tv.episode_run_time.reduce((a, b) => a + b, 0) / tv.episode_run_time.length)
    : item.runtime;

  return {
    ...item,
    title: item.title,
    overview: tv.overview || item.overview,
    poster_url: tv.poster_path ? `https://image.tmdb.org/t/p/w500${tv.poster_path}` : (item.poster_url || '/placeholder-poster.svg'),
    backdrop_url: tv.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tv.backdrop_path}` : (item.backdrop_url || '/placeholder-backdrop.svg'),
    release_date: tv.first_air_date || item.release_date,
    runtime: avgRuntime,
    season_count: tv.number_of_seasons || item.season_count,
    episode_count: tv.number_of_episodes || item.episode_count,
    rating: tv.vote_average ? parseFloat(tv.vote_average.toFixed(1)) : item.rating,
    genres: tv.genres?.length ? tv.genres.map((g) => g.name) : item.genres,
    status: mapStatus(tv.status),
    cast,
    trailer_url: trailer,
  };
}

// ─── Helpers ────────────────────────────────────────────────

function mapCast(tmdbCast: TMDbCredits['cast']): CastMember[] {
  return tmdbCast.map((c) => ({
    name: c.name,
    character: c.character,
    profile_url: tmdbImage.profile(c.profile_path),
  }));
}

function findTrailer(videos: TMDbVideos | null): string {
  if (!videos?.results.length) return '';

  const trailer =
    videos.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ||
    videos.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
    videos.results.find((v) => v.site === 'YouTube');

  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';
}

function mapStatus(tmdbStatus: string): Content['status'] {
  switch (tmdbStatus) {
    case 'Released':
    case 'Ended':
    case 'Canceled':
      return 'released';
    case 'Post Production':
    case 'In Production':
      return 'in_production';
    case 'Planned':
    case 'Rumored':
      return 'upcoming';
    default:
      return 'released';
  }
}
