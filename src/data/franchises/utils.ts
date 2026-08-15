import type { Content, ContentType, WatchOrder, OrderType, StreamingProvider } from '@/types';
import { isPastDate } from '@/lib/dateUtils';

export function sp(contentId: string, names: string[]): StreamingProvider[] {
  const providerLogos: Record<string, string> = {
    'Disney+': 'https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg',
    'Max': 'https://image.tmdb.org/t/p/w92/j5ngyTPAy6KCEK6p4iU5fPpG15.jpg',
    'Netflix': 'https://image.tmdb.org/t/p/w92/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg',
    'Prime Video': 'https://image.tmdb.org/t/p/w92/pbpGOndOQ76e18S3C3jTbbM9G0.jpg',
    'Apple TV+': 'https://image.tmdb.org/t/p/w92/6ZhmkqfJ1tJotP5N9mUaY2vNbp.jpg',
    'Peacock': 'https://image.tmdb.org/t/p/w92/gpeqlnfXqCO30T6yN9Z0J20G0.jpg',
    'Paramount+': 'https://image.tmdb.org/t/p/w92/fi83B1oztoS47xxcemFdPMhIzK.jpg',
    'JioHotstar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Disney%2B_Hotstar_logo.svg/200px-Disney%2B_Hotstar_logo.svg.png',
  };

  return names.map((name, i) => ({
    id: `${contentId}-sp-${i}`,
    content_id: contentId,
    provider_name: name,
    provider_logo: providerLogos[name] || '',
    url: '#',
    country: 'US',
  }));
}

export function buildContent({
  id,
  franchise_id,
  tmdb_id,
  title,
  type = 'movie',
  poster_url = '',
  backdrop_url = '',
  overview = '',
  release_date,
  runtime = 120,
  episode_count = null,
  season_count = null,
  rating = 7.5,
  status = 'released',
  genres = ['Action', 'Adventure', 'Sci-Fi'],
  director = '',
  cast = [],
  trailer_url = '',
  is_canon = true,
  is_required = true,
  providers = ['Prime Video'],
  ott_available,
  theatrical_release_date,
  theatrical_released,
  digital_available,
  digital_release_date,
  subscription_streaming_available,
  subscription_streaming_release_date,
  lifecycle_status,
  metadata_checked_at,
  release_metadata_checked_at,
  ott_metadata_checked_at,
}: {
  id: string;
  franchise_id: string;
  tmdb_id: number | null;
  title: string;
  type?: ContentType;
  poster_url?: string;
  backdrop_url?: string;
  overview?: string;
  release_date: string;
  runtime?: number;
  episode_count?: number | null;
  season_count?: number | null;
  rating?: number;
  status?: 'released' | 'upcoming' | 'in_production' | 'tba' | 'planned';
  genres?: string[];
  director?: string;
  cast?: { name: string; character: string; profile_url?: string }[];
  trailer_url?: string;
  is_canon?: boolean;
  is_required?: boolean;
  providers?: string[];
  ott_available?: boolean;
  theatrical_release_date?: string;
  theatrical_released?: boolean;
  digital_available?: boolean;
  digital_release_date?: string;
  subscription_streaming_available?: boolean;
  subscription_streaming_release_date?: string;
  lifecycle_status?: 'announced' | 'upcoming' | 'theatrically_released' | 'digital_available' | 'subscription_available';
  metadata_checked_at?: string;
  release_metadata_checked_at?: string;
  ott_metadata_checked_at?: string;
}): Content {
  const isOtt = ott_available !== undefined
    ? ott_available
    : (status === 'released' && providers.length > 0 && !providers.includes('Theaters Only') && !providers.includes('None'));

  const isTheatricalReleased = theatrical_released !== undefined
    ? theatrical_released
    : (status === 'released' || (status !== 'upcoming' && status !== 'in_production' && status !== 'tba' && status !== 'planned' && Boolean(release_date) && isPastDate(release_date)));

  const isDigAvail = digital_available !== undefined
    ? digital_available
    : (isOtt && providers.some((p) => ['Apple TV+', 'Prime Video', 'Digital', 'PVOD'].includes(p)));

  const isSubAvail = subscription_streaming_available !== undefined
    ? subscription_streaming_available
    : (isOtt && providers.some((p) => ['Netflix', 'Disney+', 'Max', 'Hulu', 'Peacock', 'Paramount+', 'Shudder'].includes(p)));

  const effectiveOtt = ott_available !== undefined
    ? ott_available
    : (isDigAvail || isSubAvail || isOtt);

  let computedLifecycle = lifecycle_status;
  if (!computedLifecycle) {
    if (isSubAvail) computedLifecycle = 'subscription_available';
    else if (isDigAvail) computedLifecycle = 'digital_available';
    else if (isTheatricalReleased) computedLifecycle = 'theatrically_released';
    else if (status === 'upcoming' || status === 'in_production') computedLifecycle = 'upcoming';
    else computedLifecycle = 'announced';
  }

  return {
    id,
    franchise_id,
    tmdb_id,
    title,
    type,
    poster_url: poster_url || '/placeholder-poster.svg',
    backdrop_url: backdrop_url || '/placeholder-backdrop.svg',
    overview,
    release_date,
    runtime,
    episode_count,
    season_count,
    rating,
    status,
    genres,
    director,
    cast: cast.map((c) => ({
      name: c.name,
      character: c.character,
      profile_url: c.profile_url || '',
    })),
    trailer_url,
    is_canon,
    is_required,
    streaming_providers: sp(id, providers),
    ott_available: effectiveOtt,
    theatrical_release_date: theatrical_release_date || release_date,
    theatrical_released: isTheatricalReleased,
    digital_available: isDigAvail,
    digital_release_date: digital_release_date || undefined,
    subscription_streaming_available: isSubAvail,
    subscription_streaming_release_date: subscription_streaming_release_date || undefined,
    lifecycle_status: computedLifecycle,
    metadata_checked_at: metadata_checked_at || '2026-08-11T00:00:00.000Z',
    release_metadata_checked_at: release_metadata_checked_at || '2026-08-11T00:00:00.000Z',
    ott_metadata_checked_at: ott_metadata_checked_at || '2026-08-11T00:00:00.000Z',
    created_at: '2024-01-01',
  };
}

export function buildWatchOrder({
  id,
  franchise_id,
  content_id,
  order_type,
  position,
  notes = '',
}: {
  id: string;
  franchise_id: string;
  content_id: string;
  order_type: OrderType;
  position: number;
  notes?: string;
}): WatchOrder {
  return {
    id,
    franchise_id,
    content_id,
    order_type,
    position,
    notes,
  };
}
