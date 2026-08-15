import { tmdb, TMDbError } from '@/lib/tmdb';
import { isTitleEquivalent } from '@/lib/utils';
import type { Content } from '@/types';

export type VerificationStatus = 'Pass' | 'Pending' | 'Fail';

export interface MetadataVerificationResult {
  status: VerificationStatus;
  statusBadge: 'Pass' | 'Pending' | 'Fail';
  catalogTitle: string;
  catalogId: string;
  catalogTmdbId: number | null;
  returnedTitle: string;
  returnedTmdbId: number | null;
  returnedMediaType: 'movie' | 'tv' | 'unknown';
  isMovie: boolean;
  reason: string;
  expectedValue: string;
  returnedValue: string;
  suggestedAction: string;
  httpCode: number;
  endpointUsed: string;
}

/**
 * Single-source-of-truth metadata verification function.
 * Evaluates catalog item against TMDB API, classifying into PASS, PENDING, or FAIL
 * with explicit reasons and actionable suggestions.
 */
export async function verifyTitleMetadata(item: Content): Promise<MetadataVerificationResult> {
  const isMovieType = item.type !== 'series';
  const isUnreleased =
    item.status === 'in_production' ||
    item.status === 'upcoming' ||
    item.status === 'tba' ||
    item.status === 'planned' ||
    !item.release_date;

  const endpointUsed = item.tmdb_id
    ? isMovieType ? `/movie/${item.tmdb_id}` : `/tv/${item.tmdb_id}`
    : `/search/${isMovieType ? 'movie' : 'tv'}?query=${encodeURIComponent(item.title)}`;

  // 1. Missing TMDB ID
  if (!item.tmdb_id) {
    return {
      status: 'Pending',
      statusBadge: 'Pending',
      catalogTitle: item.title,
      catalogId: item.id,
      catalogTmdbId: null,
      returnedTitle: 'N/A',
      returnedTmdbId: null,
      returnedMediaType: 'unknown',
      isMovie: isMovieType,
      reason: 'PENDING — Official TMDB metadata not yet verified',
      expectedValue: 'Official TMDB Listing',
      returnedValue: 'Pending TMDB ID',
      suggestedAction: 'Await official TMDB listing or seed ID when available.',
      httpCode: 200,
      endpointUsed,
    };
  }

  // 2. Fetch TMDB record
  try {
    const res: any = isMovieType
      ? await tmdb.getMovie(item.tmdb_id)
      : await tmdb.getTVShow(item.tmdb_id);

    if (!res || !res.id) {
      if (isUnreleased) {
        return {
          status: 'Pending',
          statusBadge: 'Pending',
          catalogTitle: item.title,
          catalogId: item.id,
          catalogTmdbId: item.tmdb_id,
          returnedTitle: 'N/A',
          returnedTmdbId: null,
          returnedMediaType: 'unknown',
          isMovie: isMovieType,
          reason: 'PENDING — Official TMDB metadata not yet verified',
          expectedValue: `TMDB Record ${item.tmdb_id}`,
          returnedValue: 'Empty Response',
          suggestedAction: 'Await TMDB page population for upcoming title.',
          httpCode: 404,
          endpointUsed,
        };
      } else {
        return {
          status: 'Fail',
          statusBadge: 'Fail',
          catalogTitle: item.title,
          catalogId: item.id,
          catalogTmdbId: item.tmdb_id,
          returnedTitle: 'N/A',
          returnedTmdbId: null,
          returnedMediaType: 'unknown',
          isMovie: isMovieType,
          reason: 'TMDB ID unresolvable (404 Not Found)',
          expectedValue: `Valid TMDB Record for ${item.tmdb_id}`,
          returnedValue: '404 Not Found',
          suggestedAction: 'Verify and replace stored TMDB ID.',
          httpCode: 404,
          endpointUsed,
        };
      }
    }

    const returnedTitle = res.title || res.name || 'N/A';
    const returnedTmdbId = res.id;
    const returnedMediaType = isMovieType ? 'movie' : 'tv';

    // Verify ID matches
    if (returnedTmdbId !== item.tmdb_id) {
      return {
        status: 'Fail',
        statusBadge: 'Fail',
        catalogTitle: item.title,
        catalogId: item.id,
        catalogTmdbId: item.tmdb_id,
        returnedTitle,
        returnedTmdbId,
        returnedMediaType,
        isMovie: isMovieType,
        reason: 'TMDB ID mismatch',
        expectedValue: `ID ${item.tmdb_id}`,
        returnedValue: `ID ${returnedTmdbId}`,
        suggestedAction: `Correct catalog tmdb_id to ${returnedTmdbId}.`,
        httpCode: 200,
        endpointUsed,
      };
    }

    // Verify Title Equivalence using canonical normalization
    const titleMatch = isTitleEquivalent(item.title, returnedTitle);

    if (!titleMatch) {
      if (isUnreleased) {
        return {
          status: 'Pending',
          statusBadge: 'Pending',
          catalogTitle: item.title,
          catalogId: item.id,
          catalogTmdbId: item.tmdb_id,
          returnedTitle,
          returnedTmdbId,
          returnedMediaType,
          isMovie: isMovieType,
          reason: 'PENDING — Official TMDB metadata not yet verified',
          expectedValue: item.title,
          returnedValue: returnedTitle,
          suggestedAction: 'Await title alignment upon official trailer/release.',
          httpCode: 200,
          endpointUsed,
        };
      } else {
        return {
          status: 'Fail',
          statusBadge: 'Fail',
          catalogTitle: item.title,
          catalogId: item.id,
          catalogTmdbId: item.tmdb_id,
          returnedTitle,
          returnedTmdbId,
          returnedMediaType,
          isMovie: isMovieType,
          reason: `Title / TMDB ID mismatch: Stored ID ${item.tmdb_id} resolves to "${returnedTitle}"`,
          expectedValue: item.title,
          returnedValue: returnedTitle,
          suggestedAction: `Update catalog tmdb_id for "${item.title}". Stored ID resolves to unrelated title "${returnedTitle}".`,
          httpCode: 200,
          endpointUsed,
        };
      }
    }

    // All checks pass
    return {
      status: 'Pass',
      statusBadge: 'Pass',
      catalogTitle: item.title,
      catalogId: item.id,
      catalogTmdbId: item.tmdb_id,
      returnedTitle,
      returnedTmdbId,
      returnedMediaType,
      isMovie: isMovieType,
      reason: 'TMDB ID exists and resolves to the intended title.',
      expectedValue: item.title,
      returnedValue: returnedTitle,
      suggestedAction: 'Verified & Validated',
      httpCode: 200,
      endpointUsed,
    };
  } catch (err: any) {
    if (err instanceof TMDbError && err.status === 404) {
      if (isUnreleased) {
        return {
          status: 'Pending',
          statusBadge: 'Pending',
          catalogTitle: item.title,
          catalogId: item.id,
          catalogTmdbId: item.tmdb_id,
          returnedTitle: 'N/A',
          returnedTmdbId: null,
          returnedMediaType: 'unknown',
          isMovie: isMovieType,
          reason: 'PENDING — Official TMDB metadata not yet verified',
          expectedValue: `Official TMDB Listing for ${item.title}`,
          returnedValue: 'HTTP 404',
          suggestedAction: 'Pending official TMDB listing creation.',
          httpCode: 404,
          endpointUsed,
        };
      } else {
        return {
          status: 'Fail',
          statusBadge: 'Fail',
          catalogTitle: item.title,
          catalogId: item.id,
          catalogTmdbId: item.tmdb_id,
          returnedTitle: 'N/A',
          returnedTmdbId: null,
          returnedMediaType: 'unknown',
          isMovie: isMovieType,
          reason: 'Endpoint 404 Not Found',
          expectedValue: `HTTP 200 for ${endpointUsed}`,
          returnedValue: 'HTTP 404',
          suggestedAction: 'Check stored TMDB ID for correctness.',
          httpCode: 404,
          endpointUsed,
        };
      }
    }

    return {
      status: isUnreleased ? 'Pending' : 'Fail',
      statusBadge: isUnreleased ? 'Pending' : 'Fail',
      catalogTitle: item.title,
      catalogId: item.id,
      catalogTmdbId: item.tmdb_id,
      returnedTitle: 'N/A',
      returnedTmdbId: null,
      returnedMediaType: 'unknown',
      isMovie: isMovieType,
      reason: err?.message || 'API Fetch Error',
      expectedValue: item.title,
      returnedValue: 'Error',
      suggestedAction: 'Retry API connection.',
      httpCode: err?.status || 500,
      endpointUsed,
    };
  }
}
