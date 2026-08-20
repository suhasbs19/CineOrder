import { useState, useEffect } from 'react';
import { allContent, franchises } from '@/data/franchises';
import { tmdb, tmdbImage } from '@/lib/tmdb';
import { calculateCountdown, formatReleaseDate } from '@/lib/upcomingUtils';
import { isTitleEquivalent } from '@/lib/utils';
import { preloadImages } from '@/lib/imagePreload';
import { sortContentByReleaseDate, compareReleaseDates } from '@/lib/releaseOrdering';
import type { Content } from '@/types';

export type ReleaseStatus = 'Upcoming' | 'Released' | 'Delayed' | 'TBA';

export interface UpcomingItem {
  id: string;
  tmdb_id: number | null;
  title: string;
  type: string;
  franchise_id: string;
  franchise_name: string;
  franchise_slug: string;
  franchise_logo?: string;
  poster_url: string;
  backdrop_url: string;
  overview: string;
  release_date: string;
  status: ReleaseStatus;
  countdown: {
    daysTotal: number | null;
    daysSinceRelease: number | null;
    text: string;
    formattedDate: string;
  };
  content?: Content;
}

export { calculateCountdown, formatReleaseDate };

/**
 * Builds candidate upcoming items synchronously from the canonical catalog.
 * This guarantees zero layout delay or blank page flashes during component mounting.
 */
export function buildInitialUpcomingItems(): UpcomingItem[] {
  const franchiseMap = new Map(franchises.map((f) => [f.id, f]));

  const candidateSeed = sortContentByReleaseDate(
    allContent.filter((c) => {
      const st = (c.status || '').toString().toLowerCase();
      return (
        st === 'upcoming' ||
        st === 'in_production' ||
        st === 'tba' ||
        st === 'planned' ||
        (c.release_date && c.release_date >= '2025-01-01')
      );
    })
  );

  return candidateSeed.map((c) => {
    const f = franchiseMap.get(c.franchise_id);
    const poster = c.poster_url || '/placeholder-poster.svg';
    const backdrop = c.backdrop_url || '/placeholder-backdrop.svg';
    const seedStatus = (c.status || '').toString().toLowerCase();
    const calc = calculateCountdown(c.release_date, seedStatus);

    return {
      id: c.id,
      tmdb_id: c.tmdb_id,
      title: c.title,
      type: c.type,
      franchise_id: c.franchise_id,
      franchise_name: f ? f.name : c.franchise_id,
      franchise_slug: f ? f.slug : c.franchise_id,
      poster_url: poster,
      backdrop_url: backdrop,
      overview: c.overview,
      release_date: c.release_date,
      status: calc.status,
      countdown: {
        daysTotal: calc.daysTotal,
        daysSinceRelease: calc.daysSinceRelease,
        text: calc.text,
        formattedDate: calc.formattedDate,
      },
      content: c,
    } as UpcomingItem;
  });
}

export function useUpcomingReleases() {
  const [items, setItems] = useState<UpcomingItem[]>(() => buildInitialUpcomingItems());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Preload verified poster URLs in background for immediate rendering
    const verifiedUrls = items
      .map((it) => it.poster_url)
      .filter((url) => Boolean(url && url.startsWith('http')));
    if (verifiedUrls.length > 0) {
      preloadImages(verifiedUrls);
    }

    async function loadUpcoming() {
      try {
        const franchiseMap = new Map(franchises.map((f) => [f.id, f]));

        const candidateSeed = sortContentByReleaseDate(
          allContent.filter((c) => {
            const st = (c.status || '').toString().toLowerCase();
            return (
              st === 'upcoming' ||
              st === 'in_production' ||
              st === 'tba' ||
              st === 'planned' ||
              (c.release_date && c.release_date >= '2025-01-01')
            );
          })
        );

        const enrichedItems = await Promise.all(
          candidateSeed.map(async (c) => {
            const f = franchiseMap.get(c.franchise_id);

            let poster = c.poster_url || '/placeholder-poster.svg';
            let backdrop = c.backdrop_url || '/placeholder-backdrop.svg';
            let title = c.title;
            let releaseDate = c.release_date;
            let overview = c.overview;

            if (c.tmdb_id) {
              try {
                if (c.type === 'series') {
                  const tv = await tmdb.getTVShow(c.tmdb_id);
                  if (tv) {
                    const returnedTitle = tv.name;
                    const isValid = tv.id === c.tmdb_id && isTitleEquivalent(c.title, returnedTitle);
                    if (isValid) {
                      if (tv.poster_path) poster = tmdbImage.poster(tv.poster_path);
                      if (tv.backdrop_path) backdrop = tmdbImage.backdrop(tv.backdrop_path);
                      if (tv.first_air_date) releaseDate = tv.first_air_date;
                      if (tv.overview) overview = tv.overview;
                    }
                  }
                } else {
                  const m = await tmdb.getMovie(c.tmdb_id);
                  if (m) {
                    const returnedTitle = m.title;
                    const isValid = m.id === c.tmdb_id && isTitleEquivalent(c.title, returnedTitle);
                    if (isValid) {
                      if (m.poster_path) poster = tmdbImage.poster(m.poster_path);
                      if (m.backdrop_path) backdrop = tmdbImage.backdrop(m.backdrop_path);
                      if (m.release_date) releaseDate = m.release_date;
                      if (m.overview) overview = m.overview;
                    }
                  }
                }
              } catch (e) {
                // Keep fallback seed data on API failure
              }
            }

            const seedStatus = (c.status || '').toString().toLowerCase();

            // Ensure seed release_date takes precedence if item is explicitly upcoming/in_production in seed and TMDb returned an older date
            if (
              (seedStatus === 'upcoming' || seedStatus === 'in_production' || seedStatus === 'tba') &&
              c.release_date &&
              (!releaseDate || releaseDate < c.release_date)
            ) {
              releaseDate = c.release_date;
            }

            const calc = calculateCountdown(releaseDate, seedStatus);
            const finalStatus: ReleaseStatus = calc.status;

            return {
              id: c.id,
              tmdb_id: c.tmdb_id,
              title,
              type: c.type,
              franchise_id: c.franchise_id,
              franchise_name: f ? f.name : c.franchise_id,
              franchise_slug: f ? f.slug : c.franchise_id,
              poster_url: poster,
              backdrop_url: backdrop,
              overview,
              release_date: releaseDate,
              status: finalStatus,
              countdown: {
                daysTotal: calc.daysTotal,
                daysSinceRelease: calc.daysSinceRelease,
                text: calc.text,
                formattedDate: calc.formattedDate,
              },
              content: c,
            } as UpcomingItem;
          })
        );

        if (isMounted) {
          setItems([...enrichedItems].sort(compareReleaseDates));
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load upcoming releases');
          setLoading(false);
        }
      }
    }

    loadUpcoming();

    return () => {
      isMounted = false;
    };
  }, []);

  return { items, loading, error };
}
