import { useState, useEffect } from 'react';
import { allContent, franchises } from '@/data/franchises';
import { tmdb, tmdbImage } from '@/lib/tmdb';
import { calculateCountdown, formatReleaseDate } from '@/lib/upcomingUtils';
import { isTitleEquivalent } from '@/lib/utils';
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

export function useUpcomingReleases() {
  const [items, setItems] = useState<UpcomingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUpcoming() {
      try {
        setLoading(true);
        setError(null);

        const franchiseMap = new Map(franchises.map((f) => [f.id, f]));

        // Select candidate upcoming or recent releases
        const candidateSeed = allContent.filter((c) => {
          const st = (c.status || '').toString().toLowerCase();
          return (
            st === 'upcoming' ||
            st === 'in_production' ||
            st === 'tba' ||
            st === 'planned' ||
            (c.release_date && c.release_date >= '2025-01-01')
          );
        });

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
                    console.log(`[TMDb Investigation - Upcoming Series]`, {
                      seedTitle: c.title,
                      seedTmdbId: c.tmdb_id,
                      returnedTmdbId: tv.id,
                      returnedTitle,
                      posterPath: tv.poster_path,
                      backdropPath: tv.backdrop_path,
                      isValid,
                    });

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
                    console.log(`[TMDb Investigation - Upcoming Movie]`, {
                      seedTitle: c.title,
                      seedTmdbId: c.tmdb_id,
                      returnedTmdbId: m.id,
                      returnedTitle,
                      posterPath: m.poster_path,
                      backdropPath: m.backdrop_path,
                      isValid,
                    });

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

            let finalStatus: ReleaseStatus = calc.status;
            if ((seedStatus === 'upcoming' || seedStatus === 'in_production' || seedStatus === 'tba' || seedStatus === 'planned') && calc.status === 'Released') {
              finalStatus = 'Upcoming';
            }

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
          setItems(enrichedItems);
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
