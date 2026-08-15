/**
 * CineOrder Canonical Date Utilities
 * 
 * Provides timezone-invariant, deterministic date comparisons for release tracking,
 * countdown calculations, and lifecycle classifications.
 * 
 * Rules:
 *   1. All date string comparisons use normalized YYYY-MM-DD format.
 *   2. Lexicographical comparisons on YYYY-MM-DD strings are strictly chronological and timezone-immune.
 *   3. Day difference calculations normalize both dates to UTC midnight.
 */

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
 * Returns true if dateStr is on or before asOfDate (i.e. release has occurred).
 */
export function isPastDate(dateStr?: string | null, asOfDate?: string): boolean {
  const norm = normalizeDateStr(dateStr);
  if (!norm) return false;
  const today = getCanonicalTodayStr(asOfDate);
  return norm <= today;
}

/**
 * Returns true if dateStr is strictly after asOfDate (i.e. release is in the future).
 */
export function isFutureDate(dateStr?: string | null, asOfDate?: string): boolean {
  const norm = normalizeDateStr(dateStr);
  if (!norm) return false;
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
export function getDaysDifference(dateStr?: string | null, asOfDate?: string): number | null {
  const norm = normalizeDateStr(dateStr);
  if (!norm) return null;

  const todayStr = getCanonicalTodayStr(asOfDate);

  const [tYear, tMonth, tDay] = norm.split('-').map(Number);
  const [bYear, bMonth, bDay] = todayStr.split('-').map(Number);

  if (!tYear || !tMonth || !tDay || !bYear || !bMonth || !bDay) return null;

  const targetUtc = Date.UTC(tYear, tMonth - 1, tDay);
  const baseUtc = Date.UTC(bYear, bMonth - 1, bDay);

  const diffMs = targetUtc - baseUtc;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
