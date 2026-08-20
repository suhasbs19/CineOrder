import type { Content } from '@/types';
import type { UpcomingItem, ReleaseStatus } from '@/hooks/useUpcomingReleases';
import { computeOttAvailable, classifyLifecycle } from './metadataRefresh';
import { getDaysDifference, normalizeDateStr, type ReleaseInstantOptions } from './dateUtils';
import { compareReleaseDates } from './releaseOrdering';

export interface CountdownInfo {
  daysTotal: number | null;
  daysSinceRelease: number | null;
  text: string;
  formattedDate: string;
  status: ReleaseStatus;
}

export function formatReleaseDate(dateStr?: string): string {
  if (!dateStr) return 'To Be Announced';
  const norm = normalizeDateStr(dateStr);
  if (!norm) return dateStr;
  const [year, month, day] = norm.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function calculateCountdown(
  dateStr?: string,
  _seedStatus?: string,
  asOfDate?: string,
  options?: ReleaseInstantOptions
): CountdownInfo {
  if (!dateStr) {
    return {
      daysTotal: null,
      daysSinceRelease: null,
      text: 'Release Date TBA',
      formattedDate: 'To Be Announced',
      status: 'TBA',
    };
  }

  const daysDiff = getDaysDifference(dateStr, asOfDate, options);
  const formattedDate = formatReleaseDate(dateStr);

  if (daysDiff === null) {
    return {
      daysTotal: null,
      daysSinceRelease: null,
      text: 'Release Date TBA',
      formattedDate: dateStr,
      status: 'TBA',
    };
  }

  if (daysDiff < 0) {
    const daysSinceRelease = Math.abs(daysDiff);
    return {
      daysTotal: daysDiff,
      daysSinceRelease,
      text: 'Now Available',
      formattedDate,
      status: 'Released',
    };
  } else if (daysDiff === 0) {
    return {
      daysTotal: 0,
      daysSinceRelease: 0,
      text: 'Releasing Today!',
      formattedDate,
      status: 'Upcoming',
    };
  } else if (daysDiff === 1) {
    return {
      daysTotal: 1,
      daysSinceRelease: null,
      text: 'Releasing Tomorrow!',
      formattedDate,
      status: 'Upcoming',
    };
  } else if (daysDiff <= 60) {
    return {
      daysTotal: daysDiff,
      daysSinceRelease: null,
      text: `${daysDiff} Days Left`,
      formattedDate,
      status: 'Upcoming',
    };
  } else {
    const months = Math.floor(daysDiff / 30);
    return {
      daysTotal: daysDiff,
      daysSinceRelease: null,
      text: `${months} Months Left`,
      formattedDate,
      status: 'Upcoming',
    };
  }
}

/**
 * Returns true ONLY if the item has NOT been theatrically released yet.
 * Used by the Upcoming Movies Section (Home & /upcoming).
 * Single authoritative source: delegates directly to classifyLifecycle().
 */
export function isTheatricallyUpcoming(item: UpcomingItem | Content, asOfDate?: string): boolean {
  const rawItem = ((item as any).content || item) as Content;
  const lifecycle = classifyLifecycle(rawItem, asOfDate);
  return lifecycle === 'upcoming' || lifecycle === 'announced';
}

const NON_OTT_PROVIDER_NAMES = new Set([
  'theaters',
  'theaters only',
  'in theaters',
  'cinema',
  'none',
  'unavailable',
  'unknown',
  'placeholder',
  'tba',
]);

export type ProviderType = 'THEATRICAL' | 'DIGITAL_PVOD' | 'SUBSCRIPTION' | 'HOME_VIDEO' | 'UNKNOWN';

export function classifyProviderType(providerName: string): ProviderType {
  const name = (providerName || '').trim().toLowerCase();
  if (!name || NON_OTT_PROVIDER_NAMES.has(name)) return 'THEATRICAL';
  if (name.includes('theater') || name.includes('cinema') || name.includes('none') || name.includes('tba')) return 'THEATRICAL';
  if (
    name.includes('apple tv') ||
    name.includes('prime video') ||
    name.includes('vudu') ||
    name.includes('google play') ||
    name.includes('itunes') ||
    name.includes('digital') ||
    name.includes('pvod') ||
    name.includes('rent') ||
    name.includes('buy')
  ) {
    return 'DIGITAL_PVOD';
  }
  if (
    name.includes('netflix') ||
    name.includes('disney') ||
    name.includes('max') ||
    name.includes('hulu') ||
    name.includes('peacock') ||
    name.includes('paramount') ||
    name.includes('shudder') ||
    name.includes('starz')
  ) {
    return 'SUBSCRIPTION';
  }
  if (name.includes('bluray') || name.includes('dvd') || name.includes('4k')) {
    return 'HOME_VIDEO';
  }
  return 'UNKNOWN';
}

/**
 * Returns true ONLY if the item is available on OTT streaming / home viewing.
 * Single source of truth for recommendation lifecycle mode.
 * Delegates to canonical `computeOttAvailable(item)`.
 */
export function isOttAvailable(item: UpcomingItem | Content): boolean {
  const rawItem = ((item as any).content || item) as Content;
  return computeOttAvailable(rawItem);
}

/**
 * Canonical helper for upcoming section inclusion (theatrically unreleased content).
 */
export function isUpcomingItem(item: UpcomingItem | Content, asOfDate?: string): boolean {
  return isTheatricallyUpcoming(item, asOfDate);
}

/**
 * Returns true ONLY if the item was released in the last maxDays (default 90 days).
 * Never returns true for upcoming/unreleased items.
 */
export function isRecentlyReleasedItem(item: UpcomingItem | Content, maxDays: number = 90, asOfDate?: string): boolean {
  const rawItem = ((item as any).content || item) as Content;
  if (isTheatricallyUpcoming(rawItem, asOfDate)) {
    return false;
  }
  const releaseDate = rawItem.theatrical_release_date || rawItem.release_date;
  if (!releaseDate) return false;

  const daysDiff = getDaysDifference(releaseDate, asOfDate);
  if (daysDiff === null || daysDiff > 0) return false;

  const daysSince = Math.abs(daysDiff);
  return daysSince <= maxDays;
}

/**
 * Returns only upcoming titles sorted by nearest release date first (TBA at the bottom).
 */
export function getUpcomingTitles(items: UpcomingItem[], asOfDate?: string): UpcomingItem[] {
  const filtered = items.filter((item) => isUpcomingItem(item, asOfDate));
  return filtered.sort(compareReleaseDates);
}

/**
 * Returns only recently released titles from the last 90 days sorted by most recent first.
 */
export function getRecentlyReleasedTitles(items: UpcomingItem[], maxDays: number = 90, asOfDate?: string): UpcomingItem[] {
  const filtered = items.filter((item) => isRecentlyReleasedItem(item, maxDays, asOfDate));

  return filtered.sort((a, b) => {
    return compareReleaseDates(b, a); // Descending (most recent first)
  });
}
