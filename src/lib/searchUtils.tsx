import React from 'react';

// In-memory cache for instant 0ms cached searches
const cacheMap = new Map<string, any>();

export function getCachedSearchResult<T>(key: string): T | undefined {
  return cacheMap.get(key.trim().toLowerCase());
}

export function setCachedSearchResult(key: string, data: any) {
  if (cacheMap.size > 200) {
    // Clear oldest 50 entries when cache gets large
    const keys = Array.from(cacheMap.keys()).slice(0, 50);
    keys.forEach((k) => cacheMap.delete(k));
  }
  cacheMap.set(key.trim().toLowerCase(), data);
}

/**
 * Ranks search results by relevance score:
 * 1. Exact match (100)
 * 2. Starts with query (80)
 * 3. Word boundary match (60)
 * 4. Contains query (40)
 * 5. Partial match (10)
 */
export function rankItemsByRelevance<T extends { title?: string; name?: string }>(
  items: T[],
  query: string
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  const scoreItem = (item: T): number => {
    const text = (item.title || item.name || '').toLowerCase();
    if (!text) return 0;

    if (text === q) return 100;
    if (text.startsWith(q)) return 80;

    const words = text.split(/[\s:&-]+/);
    if (words.some((w) => w.startsWith(q))) return 60;
    if (text.includes(q)) return 40;

    return 10;
  };

  return [...items].sort((a, b) => scoreItem(b) - scoreItem(a));
}

/**
 * Highlights matching query text with a glowing gold/primary mark tag
 */
export function highlightMatchText(text: string, query: string): React.ReactNode {
  if (!query || !query.trim() || !text) return text;

  const q = query.trim();
  const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  if (parts.length <= 1) return text;

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-primary/30 text-amber-300 font-bold rounded px-0.5 border border-primary/40"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
