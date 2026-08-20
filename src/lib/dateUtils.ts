/**
 * CineOrder Canonical Date Utilities
 * 
 * Provides timezone-invariant, deterministic date comparisons for release tracking,
 * countdown calculations, and lifecycle classifications with market timezone awareness.
 * 
 * Rules:
 *   1. All date string comparisons use normalized YYYY-MM-DD format by default.
 *   2. Lexicographical comparisons on YYYY-MM-DD strings are strictly chronological and timezone-immune.
 *   3. Day difference calculations normalize both dates to UTC midnight.
 *   4. Timezone & market conversions accurately map US Eastern premiere times (e.g. 21:00 ET)
 *      to regional availability dates (e.g. next-day IST in India).
 */

export interface ReleaseInstantOptions {
  asOfDate?: string;
  asOfInstant?: string | Date;
  market?: 'US' | 'IN' | 'UTC' | string;
  premiereTimeET?: string; // e.g. "21:00"
  userTimeZone?: string;
}

/**
 * Normalizes an arbitrary date string (ISO, YYYY-MM-DD, or Date instance) to 'YYYY-MM-DD'.
 * Returns null if the string is empty or invalid.
 */
export function normalizeDateStr(dateStr?: string | null): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // Match YYYY-MM-DD prefix directly if present
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch && ymdMatch[1] && ymdMatch[2] && ymdMatch[3]) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    if (year >= 1800 && year <= 2200 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`;
    }
  }

  // Fallback parse for non-standard formats
  const parsed = Date.parse(trimmed);
  if (isNaN(parsed)) return null;
  const d = new Date(parsed);
  return d.toISOString().split('T')[0] || null;
}

/**
 * Returns today's date formatted as 'YYYY-MM-DD'.
 * If an optional asOfDate is provided, returns that normalized asOfDate.
 */
export function getCanonicalTodayStr(asOfDate?: string): string {
  if (asOfDate) {
    const normalized = normalizeDateStr(asOfDate);
    if (normalized) return normalized;
  }
  return new Date().toISOString().split('T')[0]!;
}

/**
 * Converts a US Eastern release date (and optional ET premiere time) to a specific regional market date.
 * For example:
 *   US: 2026-08-16 21:00 ET (EDT is UTC-4) -> UTC: 2026-08-17 01:00 -> India (IST, UTC+5:30): 2026-08-17 06:30.
 *   For market === 'IN', returns '2026-08-17'.
 *   For market === 'US', returns '2026-08-16'.
 */
export function getMarketReleaseDate(
  usReleaseDate: string,
  market: 'US' | 'IN' | 'UTC' | string = 'US',
  premiereTimeET: string = '21:00'
): string {
  const norm = normalizeDateStr(usReleaseDate);
  if (!norm) return usReleaseDate;

  const m = (market || 'US').toUpperCase();
  if (m === 'US') {
    return norm;
  }

  const [yearStr, monthStr, dayStr] = norm.split('-');
  const year = parseInt(yearStr || '2026', 10);
  const month = parseInt(monthStr || '1', 10);
  const day = parseInt(dayStr || '1', 10);

  // Determine US Eastern offset (EDT is UTC-4 during daylight saving time March-November)
  // August is EDT (UTC-4)
  const isEDT = month >= 3 && month <= 11;
  const etOffsetHours = isEDT ? 4 : 5;

  const [pTimeH, pTimeM] = (premiereTimeET || '21:00').split(':').map((n) => parseInt(n, 10));
  const hour = isNaN(pTimeH ?? 21) ? 21 : (pTimeH ?? 21);
  const minute = isNaN(pTimeM ?? 0) ? 0 : (pTimeM ?? 0);

  // UTC epoch for this US Eastern premiere instant
  const utcMs = Date.UTC(year, month - 1, day, hour + etOffsetHours, minute, 0);
  const utcDate = new Date(utcMs);

  if (m === 'UTC') {
    return utcDate.toISOString().split('T')[0]!;
  }

  if (m === 'IN' || m === 'INDIA' || m === 'IST') {
    // IST is UTC + 5:30
    const istMs = utcMs + (5 * 60 + 30) * 60 * 1000;
    const istDate = new Date(istMs);
    return istDate.toISOString().split('T')[0]!;
  }

  return norm;
}

/**
 * Checks whether a specific release instant has passed with timezone and market awareness.
 */
export function isReleaseInstantPassed(
  releaseDate?: string | null,
  options?: ReleaseInstantOptions
): boolean {
  if (!releaseDate) return false;
  const norm = normalizeDateStr(releaseDate);
  if (!norm) return false;

  const market = options?.market || 'US';
  const marketDate = getMarketReleaseDate(norm, market, options?.premiereTimeET);

  if (options?.asOfInstant) {
    const asOfMs = typeof options.asOfInstant === 'string'
      ? Date.parse(options.asOfInstant)
      : options.asOfInstant.getTime();

    if (!isNaN(asOfMs)) {
      const [y, m, d] = norm.split('-').map(Number);
      if (y && m && d) {
        const isEDT = m >= 3 && m <= 11;
        const etOffset = isEDT ? 4 : 5;
        const [pH, pM] = (options.premiereTimeET || '21:00').split(':').map(Number);
        const instantUtcMs = Date.UTC(y, m - 1, d, (pH || 21) + etOffset, pM || 0, 0);
        return asOfMs >= instantUtcMs;
      }
    }
  }

  const asOfStr = getCanonicalTodayStr(options?.asOfDate);
  return marketDate <= asOfStr;
}

/**
 * Returns true if dateStr is on or before asOfDate (i.e. release has occurred).
 */
export function isPastDate(
  dateStr?: string | null,
  asOfDate?: string,
  options?: ReleaseInstantOptions
): boolean {
  const norm = normalizeDateStr(dateStr);
  if (!norm) return false;

  if (options) {
    return isReleaseInstantPassed(norm, { ...options, asOfDate: asOfDate || options.asOfDate });
  }

  const today = getCanonicalTodayStr(asOfDate);
  return norm <= today;
}

/**
 * Returns true if dateStr is strictly after asOfDate (i.e. release is in the future).
 */
export function isFutureDate(
  dateStr?: string | null,
  asOfDate?: string,
  options?: ReleaseInstantOptions
): boolean {
  const norm = normalizeDateStr(dateStr);
  if (!norm) return false;

  if (options) {
    return !isReleaseInstantPassed(norm, { ...options, asOfDate: asOfDate || options.asOfDate });
  }

  const today = getCanonicalTodayStr(asOfDate);
  return norm > today;
}

/**
 * Returns true if dateStr matches asOfDate exactly (i.e. releasing today).
 */
export function isToday(dateStr?: string | null, asOfDate?: string): boolean {
  const norm = normalizeDateStr(dateStr);
  if (!norm) return false;
  const today = getCanonicalTodayStr(asOfDate);
  return norm === today;
}

/**
 * Calculates signed day difference between target date and asOfDate (UTC midnight).
 * Positive -> target is in the future (e.g. +5 days).
 * Zero -> target is today.
 * Negative -> target is in the past (e.g. -10 days).
 * Returns null if target date is missing or unparseable.
 */
export function getDaysDifference(
  dateStr?: string | null,
  asOfDate?: string,
  options?: ReleaseInstantOptions
): number | null {
  const norm = normalizeDateStr(dateStr);
  if (!norm) return null;

  const targetDate = options?.market
    ? getMarketReleaseDate(norm, options.market, options.premiereTimeET)
    : norm;

  const todayStr = getCanonicalTodayStr(asOfDate || options?.asOfDate);

  const [tYear, tMonth, tDay] = targetDate.split('-').map(Number);
  const [bYear, bMonth, bDay] = todayStr.split('-').map(Number);

  if (!tYear || !tMonth || !tDay || !bYear || !bMonth || !bDay) return null;

  const targetUtc = Date.UTC(tYear, tMonth - 1, tDay);
  const baseUtc = Date.UTC(bYear, bMonth - 1, bDay);

  const diffMs = targetUtc - baseUtc;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
