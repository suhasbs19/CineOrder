export interface SearchAnalyticsState {
  totalQueries: number;
  emptyQueries: number;
  successfulQueries: number;
  typoCorrections: number;
  totalDurationMs: number;
  fastestMs: number;
  slowestMs: number;
  queryCounts: Record<string, number>;
  typoLog: Array<{ raw: string; corrected: string }>;
}

const STORAGE_KEY = 'cineorder-search-analytics';

function getDefaultAnalytics(): SearchAnalyticsState {
  return {
    totalQueries: 0,
    emptyQueries: 0,
    successfulQueries: 0,
    typoCorrections: 0,
    totalDurationMs: 0,
    fastestMs: 9999,
    slowestMs: 0,
    queryCounts: {},
    typoLog: [],
  };
}

export function getSearchAnalytics(): SearchAnalyticsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultAnalytics();
    const data = JSON.parse(raw);
    return { ...getDefaultAnalytics(), ...data };
  } catch {
    return getDefaultAnalytics();
  }
}

export function recordSearchEvent(
  query: string,
  durationMs: number,
  totalResults: number,
  wasTypoCorrected: boolean = false,
  rawQuery?: string
) {
  if (!query.trim()) return;

  const current = getSearchAnalytics();
  const cleanQuery = query.trim().toLowerCase();

  const totalQueries = current.totalQueries + 1;
  const emptyQueries = totalResults === 0 ? current.emptyQueries + 1 : current.emptyQueries;
  const successfulQueries = totalResults > 0 ? current.successfulQueries + 1 : current.successfulQueries;
  const typoCorrections = wasTypoCorrected ? current.typoCorrections + 1 : current.typoCorrections;

  const totalDurationMs = current.totalDurationMs + durationMs;
  const fastestMs = Math.min(current.fastestMs === 9999 ? durationMs : current.fastestMs, durationMs);
  const slowestMs = Math.max(current.slowestMs, durationMs);

  const queryCounts = { ...current.queryCounts };
  queryCounts[cleanQuery] = (queryCounts[cleanQuery] || 0) + 1;

  const typoLog = [...current.typoLog];
  if (wasTypoCorrected && rawQuery) {
    typoLog.unshift({ raw: rawQuery, corrected: query });
    if (typoLog.length > 10) typoLog.pop();
  }

  const updated: SearchAnalyticsState = {
    totalQueries,
    emptyQueries,
    successfulQueries,
    typoCorrections,
    totalDurationMs,
    fastestMs,
    slowestMs,
    queryCounts,
    typoLog,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore quota errors
  }
}

export function clearSearchAnalytics() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
