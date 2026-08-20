/**
 * CineOrder Canonical Release-Date Ordering & Validation Utility
 *
 * Single centralized engine for all release-date and chronological sorting across CineOrder.
 * Guarantees:
 *  1. Canonical date resolution (release_date, theatrical_release_date, first_air_date) normalized to YYYY-MM-DD.
 *  2. Pure chronological date comparison based on parsed UTC dates.
 *  3. Complete independence from source array insertion order.
 *  4. Deterministic secondary sorting for identical release dates (Title -> ID).
 *  5. Graceful handling of missing/TBA dates (placed at the end deterministically).
 *  6. Comprehensive chronological inversion validation.
 */

import type { Content, WatchOrder } from '@/types';
import { normalizeDateStr } from './dateUtils';

export interface ChronologicalInversion {
  earlierTitle: string;
  earlierDate: string;
  earlierIndex: number;
  laterTitle: string;
  laterDate: string;
  laterIndex: number;
}

export interface ChronologicalValidationResult {
  isValid: boolean;
  errors: string[];
  inversions: ChronologicalInversion[];
  invalidDateItems: Array<{ id: string; title: string; rawDate?: string }>;
}

/**
 * Extracts and normalizes the canonical release date from any content-like object.
 * Checks primary `release_date`, followed by `theatrical_release_date`, `first_air_date`,
 * and nested `content` properties.
 */
export function getCanonicalReleaseDate(item: any): string | null {
  if (!item || typeof item !== 'object') return null;

  const rawItem = item.content && typeof item.content === 'object' ? item.content : item;

  const candidateDate =
    rawItem.release_date ||
    rawItem.theatrical_release_date ||
    rawItem.first_air_date ||
    rawItem.expectedReleaseDate ||
    rawItem.releaseDateCandidate ||
    rawItem.releaseDate;

  return normalizeDateStr(candidateDate);
}

/**
 * Extracts the display title from any content-like object or watch order.
 */
export function getItemTitle(item: any): string {
  if (!item || typeof item !== 'object') return '';
  const rawItem = item.content && typeof item.content === 'object' ? item.content : item;
  return (rawItem.title || rawItem.name || rawItem.rawTitle || '').trim();
}

/**
 * Extracts the unique identifier from any content-like object or watch order.
 */
export function getItemId(item: any): string {
  if (!item || typeof item !== 'object') return '';
  const rawItem = item.content && typeof item.content === 'object' ? item.content : item;
  return (rawItem.id || item.content_id || item.id || '').trim();
}

/**
 * Centralized release date comparator for any two titles or watch orders.
 *
 * Rules:
 *  - Both items with valid canonical release dates: sorted chronologically (earliest first).
 *  - Valid date vs Missing/TBA date: valid date appears first.
 *  - Both missing/TBA dates: deterministic secondary tie-breaker.
 *  - Identical dates: deterministic secondary tie-breaker (Title alphabetically -> Stable ID).
 */
export function compareReleaseDates(a: any, b: any): number {
  if (a === b) return 0;
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;

  const dateA = getCanonicalReleaseDate(a);
  const dateB = getCanonicalReleaseDate(b);

  if (dateA && dateB) {
    if (dateA !== dateB) {
      // YYYY-MM-DD strings are strictly lexicographically ordered and timezone-immune
      return dateA.localeCompare(dateB);
    }
  } else if (dateA && !dateB) {
    return -1; // Item A has a date, goes before TBA
  } else if (!dateA && dateB) {
    return 1; // Item B has a date, goes before TBA
  }

  // Secondary deterministic tie-breaker: Title (case-insensitive)
  const titleA = getItemTitle(a);
  const titleB = getItemTitle(b);
  const titleCompare = titleA.localeCompare(titleB, undefined, { sensitivity: 'base' });
  if (titleCompare !== 0) {
    return titleCompare;
  }

  // Tertiary deterministic tie-breaker: Unique ID
  const idA = getItemId(a);
  const idB = getItemId(b);
  return idA.localeCompare(idB);
}

/**
 * Returns a new array of content items sorted strictly by canonical release date.
 */
export function sortContentByReleaseDate<T extends { release_date?: string; title?: string; id?: string }>(
  items: T[]
): T[] {
  return [...items].sort(compareReleaseDates);
}

/**
 * Returns a new array of upcoming items sorted strictly by canonical release date ascending
 * (earliest upcoming release date first, TBA at the bottom).
 */
export function sortUpcomingContent<T extends { release_date?: string; title?: string; id?: string }>(
  items: T[]
): T[] {
  return [...items].sort(compareReleaseDates);
}

/**
 * Returns a new array of items sorted strictly by release date descending
 * (most recent releases first).
 */
export function sortRecentlyReleasedContent<T extends { release_date?: string; title?: string; id?: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => compareReleaseDates(b, a));
}

/**
 * Returns a new array of WatchOrders sorted strictly by canonical release date
 * with sequential `position` (1, 2, 3... N) assigned.
 */
export function sortWatchOrdersByReleaseDate(
  orders: WatchOrder[],
  contentOverrides?: Content[]
): WatchOrder[] {
  const contentMap = contentOverrides
    ? new Map(contentOverrides.map((c) => [c.id, c]))
    : null;

  const hydrated = orders.map((order) => {
    if (!order.content && contentMap && contentMap.has(order.content_id)) {
      return {
        ...order,
        content: contentMap.get(order.content_id),
      };
    }
    return order;
  });

  const sorted = [...hydrated].sort(compareReleaseDates);

  return sorted.map((order, index) => ({
    ...order,
    position: index + 1,
  }));
}

/**
 * Validates whether a list of items is in strict chronological order.
 * Detects any inverted pairs (e.g. a 2027 title appearing before a 2026 title).
 */
export function validateChronologicalOrdering(items: any[]): ChronologicalValidationResult {
  const errors: string[] = [];
  const inversions: ChronologicalInversion[] = [];
  const invalidDateItems: Array<{ id: string; title: string; rawDate?: string }> = [];

  for (let i = 0; i < items.length; i++) {
    const current = items[i];
    const currentDate = getCanonicalReleaseDate(current);
    const currentTitle = getItemTitle(current);
    const currentId = getItemId(current);

    const rawDate = (current?.content?.release_date || current?.release_date);
    const isExplicitTba = typeof rawDate === 'string' && (rawDate.trim().toUpperCase() === 'TBA' || rawDate.trim() === '');
    if (rawDate && !currentDate && !isExplicitTba) {
      invalidDateItems.push({ id: currentId, title: currentTitle, rawDate });
      errors.push(`Invalid date format for '${currentTitle}' (${currentId}): '${rawDate}'`);
    }

    if (i > 0) {
      const prev = items[i - 1];
      const prevDate = getCanonicalReleaseDate(prev);
      const prevTitle = getItemTitle(prev);

      if (prevDate && currentDate && prevDate > currentDate) {
        const inv: ChronologicalInversion = {
          earlierTitle: prevTitle,
          earlierDate: prevDate,
          earlierIndex: i - 1,
          laterTitle: currentTitle,
          laterDate: currentDate,
          laterIndex: i,
        };
        inversions.push(inv);
        errors.push(
          `Chronological Inversion: '${prevTitle}' (${prevDate}) at position ${i} appears before '${currentTitle}' (${currentDate}) at position ${i + 1}.`
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    inversions,
    invalidDateItems,
  };
}
