import { cacheGet, cacheSet } from './tmdbCache';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const DEMO_API_KEY = 'c62243b23b1f08ee913d4bbda4a3053b';
const API_KEY = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_TMDB_API_KEY as string) || DEMO_API_KEY;

// Log API Key presence safely without printing secret key
console.log(`[TMDb Config] API key loaded: ${Boolean(API_KEY) ? 'YES' : 'NO'}`);

// Cache TTLs
const TTL_1H = 60 * 60 * 1000;
const TTL_24H = 24 * 60 * 60 * 1000;
const TTL_7D = 7 * 24 * 60 * 60 * 1000;

export interface TMDbTelemetry {
  url: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  attempt: number;
  cached?: boolean;
  exceptionName?: string;
  exceptionMessage?: string;
  httpStatus?: number;
  tmdbStatusCode?: number;
  tmdbStatusMessage?: string;
}

export class TMDbError extends Error {
  status: number; // 0 if no response received!
  statusCode?: number;
  statusMessage?: string;
  url: string;
  errorType: 'http' | 'rate_limit' | 'timeout' | 'network' | 'cors' | 'json_parse';
  telemetry: TMDbTelemetry;

  constructor(
    message: string,
    status: number,
    url: string,
    errorType: 'http' | 'rate_limit' | 'timeout' | 'network' | 'cors' | 'json_parse',
    telemetry: TMDbTelemetry,
    statusCode?: number,
    statusMessage?: string
  ) {
    super(message);
    this.name = 'TMDbError';
    this.status = status;
    this.url = url;
    this.errorType = errorType;
    this.telemetry = telemetry;
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
  }
}

// ─── Image URL Builders ─────────────────────────────────────

export const tmdbImage = {
  poster: (path?: string | null, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500') => {
    if (!path) return '/placeholder-poster.svg';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/placeholder')) return path;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  },
  backdrop: (path?: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') => {
    if (!path) return '/placeholder-backdrop.svg';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/placeholder')) return path;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  },
  profile: (path?: string | null, size: 'w185' | 'h632' | 'original' = 'w185') => {
    if (!path) return '/placeholder-avatar.svg';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/placeholder')) return path;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  },
  logo: (path?: string | null, size: 'w92' | 'w154' | 'w300' = 'w154') => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  },
  franchiseLogo: (slug: string, path?: string | null, size: 'w92' | 'w154' | 'w300' = 'w154') => {
    if (path) {
      if (path.startsWith('http://') || path.startsWith('https://')) return path;
      return `${TMDB_IMAGE_BASE}/${size}${path}`;
    }
    return `/logos/${slug}.svg`;
  },
};

// ─── API Fetch Helper (with caching, retry & telemetry instrumentation) ───

async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string> = {},
  ttl = TTL_1H,
  retries = 3
): Promise<T> {
  const apiKey = API_KEY && API_KEY !== 'your_tmdb_api_key' ? API_KEY : DEMO_API_KEY;

  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  const cacheKey = `${endpoint}?${sortedParams}`;

  const cached = cacheGet<T>(cacheKey);
  if (cached !== undefined) {
    if (typeof cached === 'object' && cached !== null) {
      (cached as any)._telemetry = {
        url: cacheKey,
        startTime: Date.now(),
        endTime: Date.now(),
        durationMs: 1,
        attempt: 1,
        httpStatus: 200,
        cached: true,
      };
    }
    return cached;
  }

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  let attempt = 0;
  let delay = 300;

  while (attempt < retries) {
    attempt++;
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      clearTimeout(timeoutId);

      const endTime = Date.now();
      const telemetry: TMDbTelemetry = {
        url: url.toString(),
        startTime,
        endTime,
        durationMs: endTime - startTime,
        attempt,
        httpStatus: response.status,
      };

      // Exponential backoff on Rate Limit (HTTP 429)
      if (response.status === 429 && attempt < retries) {
        console.warn(`[TMDb Telemetry 429] Retrying endpoint ${endpoint} (Attempt ${attempt}/${retries}) after ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
        continue;
      }

      if (!response.ok) {
        let tmdbStatusCode: number | undefined;
        let tmdbStatusMessage: string | undefined;

        try {
          const errJson = await response.json();
          tmdbStatusCode = errJson?.status_code;
          tmdbStatusMessage = errJson?.status_message;
        } catch {
          // ignore json parse error on non-200
        }

        telemetry.tmdbStatusCode = tmdbStatusCode;
        telemetry.tmdbStatusMessage = tmdbStatusMessage;

        const msg = tmdbStatusMessage
          ? `TMDb Error (${response.status}): ${tmdbStatusMessage}`
          : `TMDb API Error: ${response.status} ${response.statusText}`;

        console.error(`[TMDb Fetch Failed] ${endpoint} -> Status ${response.status}: ${msg}`);

        throw new TMDbError(
          msg,
          response.status,
          url.toString(),
          response.status === 429 ? 'rate_limit' : 'http',
          telemetry,
          tmdbStatusCode,
          tmdbStatusMessage
        );
      }

      let data: T;
      try {
        data = (await response.json()) as T;
      } catch {
        throw new TMDbError(
          'Failed to parse TMDb JSON response',
          response.status,
          url.toString(),
          'json_parse',
          telemetry
        );
      }

      cacheSet(cacheKey, data, ttl);
      return data;
    } catch (err: any) {
      clearTimeout(timeoutId);
      const endTime = Date.now();

      if (err instanceof TMDbError) {
        throw err;
      }

      const telemetry: TMDbTelemetry = {
        url: url.toString(),
        startTime,
        endTime,
        durationMs: endTime - startTime,
        attempt,
        exceptionName: err?.name || 'Error',
        exceptionMessage: err?.message || 'Fetch failed',
        httpStatus: 0, // No response received!
      };

      if (err?.name === 'AbortError') {
        if (attempt < retries) {
          console.warn(`[TMDb Timeout] Retrying ${endpoint} (Attempt ${attempt}/${retries})...`);
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
        throw new TMDbError('Request timeout (>15s)', 408, url.toString(), 'timeout', telemetry);
      }

      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
        continue;
      }

      throw new TMDbError(
        err?.message || 'Network Error (Failed to Fetch)',
        0,
        url.toString(),
        'network',
        telemetry
      );
    }
  }

  const now = Date.now();
  throw new TMDbError(
    'Max retries exceeded',
    500,
    url.toString(),
    'http',
    { url: url.toString(), startTime: now, endTime: now, durationMs: 0, attempt: retries }
  );
}

/**
 * Check whether the TMDb API key is configured.
 */
export function isTMDbConfigured(): boolean {
  return true;
}

// ─── TMDb Types ─────────────────────────────────────────────

export interface TMDbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  vote_average: number;
  genres: { id: number; name: string }[];
  status: string;
}

export interface TMDbTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  episode_run_time: number[];
  vote_average: number;
  number_of_seasons: number;
  number_of_episodes: number;
  genres: { id: number; name: string }[];
  status: string;
}

export interface TMDbSearchResult {
  page: number;
  total_pages: number;
  total_results: number;
  results: Array<{
    id: number;
    title?: string;
    name?: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    media_type: 'movie' | 'tv' | 'person';
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    profile_path?: string | null;
  }>;
}

export interface TMDbCredits {
  cast: Array<{
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }>;
  crew: Array<{
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }>;
}

export interface TMDbVideos {
  results: Array<{
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
    official: boolean;
  }>;
}

export interface TMDbWatchProviders {
  results: Record<string, {
    link?: string;
    flatrate?: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
    rent?: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
    buy?: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
  }>;
}

export interface TMDbCollection {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  parts: Array<{
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    media_type: string;
  }>;
}

export interface TMDbPerson {
  id: number;
  name: string;
  biography: string;
  profile_path: string | null;
  birthday: string | null;
  place_of_birth: string | null;
  known_for_department: string;
}

export interface TMDbPersonCredits {
  cast: Array<{
    id: number;
    title?: string;
    name?: string;
    character: string;
    media_type: string;
    poster_path: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
  }>;
}

// ─── API Functions ──────────────────────────────────────────

export const tmdb = {
  // Search
  searchMulti: (query: string, page = 1) =>
    tmdbFetch<TMDbSearchResult>('/search/multi', { query, page: String(page) }, TTL_1H),

  searchMovies: (query: string, page = 1) =>
    tmdbFetch<TMDbSearchResult>('/search/movie', { query, page: String(page) }, TTL_1H),

  searchTV: (query: string, page = 1) =>
    tmdbFetch<TMDbSearchResult>('/search/tv', { query, page: String(page) }, TTL_1H),

  searchPerson: (query: string, page = 1) =>
    tmdbFetch<TMDbSearchResult>('/search/person', { query, page: String(page) }, TTL_1H),

  // Movie details
  getMovie: (id: number) =>
    tmdbFetch<TMDbMovie>(`/movie/${id}`, {}, TTL_24H),

  getMovieCredits: (id: number) =>
    tmdbFetch<TMDbCredits>(`/movie/${id}/credits`, {}, TTL_7D),

  getMovieVideos: (id: number) =>
    tmdbFetch<TMDbVideos>(`/movie/${id}/videos`, {}, TTL_24H),

  getMovieProviders: (id: number) =>
    tmdbFetch<TMDbWatchProviders>(`/movie/${id}/watch/providers`, {}, TTL_24H),

  // TV details
  getTVShow: (id: number) =>
    tmdbFetch<TMDbTVShow>(`/tv/${id}`, {}, TTL_24H),

  getTVCredits: (id: number) =>
    tmdbFetch<TMDbCredits>(`/tv/${id}/credits`, {}, TTL_7D),

  getTVVideos: (id: number) =>
    tmdbFetch<TMDbVideos>(`/tv/${id}/videos`, {}, TTL_24H),

  getTVProviders: (id: number) =>
    tmdbFetch<TMDbWatchProviders>(`/tv/${id}/watch/providers`, {}, TTL_24H),

  // Collections
  getCollection: (id: number) =>
    tmdbFetch<TMDbCollection>(`/collection/${id}`, {}, TTL_24H),

  // Person
  getPerson: (id: number) =>
    tmdbFetch<TMDbPerson>(`/person/${id}`, {}, TTL_7D),

  getPersonMovieCredits: (id: number) =>
    tmdbFetch<TMDbPersonCredits>(`/person/${id}/movie_credits`, {}, TTL_24H),

  getPersonCombinedCredits: (id: number) =>
    tmdbFetch<TMDbPersonCredits>(`/person/${id}/combined_credits`, {}, TTL_24H),

  // Trending & Upcoming
  getTrending: (mediaType: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week') =>
    tmdbFetch<TMDbSearchResult>(`/trending/${mediaType}/${timeWindow}`, {}, TTL_1H),

  getUpcomingMovies: (page = 1) =>
    tmdbFetch<TMDbSearchResult>('/movie/upcoming', { page: String(page) }, TTL_1H),

  getTVOnTheAir: (page = 1) =>
    tmdbFetch<TMDbSearchResult>('/tv/on_the_air', { page: String(page) }, TTL_1H),
};
