import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Search,
  X,
  Clock,
  Film,
  Tv,
  Sparkles,
  Mic,
  MicOff,
  Grid,
  ArrowRight,
  CornerDownLeft,
  SlidersHorizontal,
  Command,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SafeImage } from '@/components/ui/SafeImage';
import { SearchResultCard } from '@/components/ui/SearchResultCard';
import { SearchSkeleton } from '@/components/ui/SearchSkeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { searchFranchises, franchises, searchAllContent, allContent, getContentById } from '@/data/franchises';
import { tmdb, tmdbImage, isTMDbConfigured } from '@/lib/tmdb';
import type { TMDbSearchResult } from '@/lib/tmdb';
import type { Franchise } from '@/types';
import { cn } from '@/lib/utils';
import {
  getCachedSearchResult,
  setCachedSearchResult,
  rankItemsByRelevance,
  highlightMatchText,
} from '@/lib/searchUtils';
import { recordSearchEvent } from '@/lib/searchAnalyticsStore';

type SearchCategory = 'all' | 'franchises' | 'movies' | 'tv';
type ContentFilter = 'all' | 'released' | 'upcoming' | 'mcu' | 'animation';

const categoryTabs: { id: SearchCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Results', icon: <Grid className="w-4 h-4" /> },
  { id: 'franchises', label: 'Franchises', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'movies', label: 'Movies', icon: <Film className="w-4 h-4" /> },
  { id: 'tv', label: 'TV Series', icon: <Tv className="w-4 h-4" /> },
];

const subFilters: { id: ContentFilter; label: string }[] = [
  { id: 'all', label: 'All Content' },
  { id: 'released', label: 'Released' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'mcu', label: 'MCU' },
  { id: 'animation', label: 'Animation' },
];

const MISSPELLING_MAP: Record<string, string> = {
  spiderman: 'spider-man',
  spidr: 'spider',
  avenegers: 'avengers',
  avenger: 'avengers',
  marval: 'marvel',
  marvle: 'marvel',
  batamn: 'batman',
  batmn: 'batman',
  starwars: 'star wars',
  johnwick: 'john wick',
  harrypotr: 'harry potter',
  potter: 'harry potter',
  jurasic: 'jurassic',
  jurasicpark: 'jurassic park',
  transforers: 'transformers',
  loke: 'loki',
};

function normalizeQuery(rawQuery: string): string {
  const clean = rawQuery.trim().toLowerCase();
  if (MISSPELLING_MAP[clean]) {
    return MISSPELLING_MAP[clean];
  }
  const words = clean.split(/\s+/).map((w) => MISSPELLING_MAP[w] || w);
  return words.join(' ');
}

function parseCategoryParam(paramValue: string | null): SearchCategory | null {
  if (!paramValue) return null;
  const val = paramValue.toLowerCase();
  if (val === 'franchises' || val === 'franchise') return 'franchises';
  if (val === 'movies' || val === 'movie') return 'movies';
  if (val === 'tv' || val === 'series' || val === 'shows') return 'tv';
  if (val === 'all') return 'all';
  return null;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  const urlCategory = parseCategoryParam(searchParams.get('type') || searchParams.get('category'));
  const initialCategory: SearchCategory = urlCategory || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<SearchCategory>(initialCategory);
  const [userSelectedTab, setUserSelectedTab] = useState<SearchCategory | null>(urlCategory);
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all');

  const [searchResults, setSearchResults] = useState<{
    franchises: Franchise[];
    movies: TMDbSearchResult['results'];
    tv: TMDbSearchResult['results'];
  }>({
    franchises: franchises,
    movies: [],
    tv: [],
  });

  const [categoryCounts, setCategoryCounts] = useState<Record<SearchCategory, number>>({
    all: franchises.length,
    franchises: franchises.length,
    movies: 0,
    tv: 0,
  });

  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cineorder-searches') || '[]');
    } catch {
      return [];
    }
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const debouncedQuery = useDebounce(query, 250);
  const normalizedDebouncedQuery = normalizeQuery(debouncedQuery);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isEditing =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);

      if (
        (e.key === '/' && !isEditing) ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    const parsed = parseCategoryParam(searchParams.get('type') || searchParams.get('category'));
    if (parsed) {
      setCategory(parsed);
      setUserSelectedTab(parsed);
    } else if (!searchParams.get('q')) {
      setCategory('all');
    }
  }, [searchParams]);

  useEffect(() => {
    const currentQ = searchParams.get('q') || '';
    if (debouncedQuery.trim() !== currentQ.trim()) {
      const newParams = new URLSearchParams(searchParams);
      if (debouncedQuery.trim()) {
        newParams.set('q', debouncedQuery.trim());
      } else {
        newParams.delete('q');
      }
      setSearchParams(newParams, { replace: true });
    }
  }, [debouncedQuery, searchParams, setSearchParams]);

  useEffect(() => {
    const urlCat = parseCategoryParam(searchParams.get('type') || searchParams.get('category'));
    const activeCategory = urlCat || userSelectedTab || category || 'all';

    if (!normalizedDebouncedQuery.trim()) {
      const defaultMovies = allContent
        .filter((c) => c.type === 'movie' || c.type === 'animated')
        .map((c) => ({
          id: c.id,
          canonical_id: c.id,
          tmdb_id: c.tmdb_id,
          title: c.title,
          name: c.title,
          poster_path: c.poster_url,
          backdrop_path: c.backdrop_url,
          overview: c.overview,
          release_date: c.release_date,
          first_air_date: c.release_date,
          vote_average: c.rating,
          media_type: 'movie' as const,
        }));

      const defaultTV = allContent
        .filter((c) => c.type === 'series')
        .map((c) => ({
          id: c.id,
          canonical_id: c.id,
          tmdb_id: c.tmdb_id,
          title: c.title,
          name: c.title,
          poster_path: c.poster_url,
          backdrop_path: c.backdrop_url,
          overview: c.overview,
          release_date: c.release_date,
          first_air_date: c.release_date,
          vote_average: c.rating,
          media_type: 'tv' as const,
        }));

      setSearchResults({
        franchises: franchises,
        movies: defaultMovies as any,
        tv: defaultTV as any,
      });
      setCategoryCounts({
        all: franchises.length + defaultMovies.length + defaultTV.length,
        franchises: franchises.length,
        movies: defaultMovies.length,
        tv: defaultTV.length,
      });
      setCategory(activeCategory);
      setLoading(false);
      return;
    }

    const startTime = Date.now();
    const cacheKey = `${normalizedDebouncedQuery.trim()}_${contentFilter}`;
    const cachedData = getCachedSearchResult<any>(cacheKey);

    if (cachedData) {
      setSearchResults(cachedData.searchResults);
      setCategoryCounts(cachedData.categoryCounts);
      setCategory(urlCat || cachedData.targetCategory);
      setLoading(false);

      recordSearchEvent(
        normalizedDebouncedQuery,
        1,
        cachedData.categoryCounts.all,
        normalizedDebouncedQuery !== debouncedQuery.trim().toLowerCase(),
        query
      );
      return;
    }

    let cancelled = false;
    setLoading(true);

    const rawFranchises = searchFranchises(normalizedDebouncedQuery);
    const matchedFranchises = rankItemsByRelevance(rawFranchises, normalizedDebouncedQuery);

    const localContentMatches = searchAllContent(normalizedDebouncedQuery);
    const localMovies = localContentMatches
      .filter((c) => c.type === 'movie' || c.type === 'animated')
      .map((c) => ({
        id: c.id,
        canonical_id: c.id,
        tmdb_id: c.tmdb_id,
        title: c.title,
        name: c.title,
        poster_path: c.poster_url,
        backdrop_path: c.backdrop_url,
        overview: c.overview,
        release_date: c.release_date,
        first_air_date: c.release_date,
        vote_average: c.rating,
        media_type: 'movie' as const,
      }));

    const localTV = localContentMatches
      .filter((c) => c.type === 'series')
      .map((c) => ({
        id: c.id,
        canonical_id: c.id,
        tmdb_id: c.tmdb_id,
        title: c.title,
        name: c.title,
        poster_path: c.poster_url,
        backdrop_path: c.backdrop_url,
        overview: c.overview,
        release_date: c.release_date,
        first_air_date: c.release_date,
        vote_average: c.rating,
        media_type: 'tv' as const,
      }));

    async function executeMultiCategorySearch() {
      let finalMovies: TMDbSearchResult['results'] = localMovies as any;
      let finalTV: TMDbSearchResult['results'] = localTV as any;

      if (isTMDbConfigured()) {
        try {
          const [moviesData, tvData] = await Promise.all([
            tmdb.searchMovies(normalizedDebouncedQuery).catch(() => ({ results: [] })),
            tmdb.searchTV(normalizedDebouncedQuery).catch(() => ({ results: [] })),
          ]);

          if (!cancelled) {
            const remoteMovies = (moviesData.results || []).map((r) => ({
              ...r,
              media_type: 'movie' as const,
            }));
            const remoteMovieIds = new Set(remoteMovies.map((r) => r.id));
            finalMovies = [
              ...remoteMovies,
              ...localMovies.filter((m) => !m.tmdb_id || !remoteMovieIds.has(m.tmdb_id)),
            ] as any;

            const remoteTV = (tvData.results || []).map((r) => ({
              ...r,
              media_type: 'tv' as const,
            }));
            const remoteTVIds = new Set(remoteTV.map((r) => r.id));
            finalTV = [
              ...remoteTV,
              ...localTV.filter((t) => !t.tmdb_id || !remoteTVIds.has(t.tmdb_id)),
            ] as any;
          }
        } catch {
        }
      }

      if (cancelled) return;

      finalMovies = rankItemsByRelevance(finalMovies, normalizedDebouncedQuery);
      finalTV = rankItemsByRelevance(finalTV, normalizedDebouncedQuery);

      const totalSum = matchedFranchises.length + finalMovies.length + finalTV.length;
      const counts: Record<SearchCategory, number> = {
        all: totalSum,
        franchises: matchedFranchises.length,
        movies: finalMovies.length,
        tv: finalTV.length,
      };

      const resultsPayload = {
        franchises: matchedFranchises,
        movies: finalMovies,
        tv: finalTV,
      };

      setSearchResults(resultsPayload);
      setCategoryCounts(counts);

      let targetCategory: SearchCategory;
      const urlCatOverride = parseCategoryParam(searchParams.get('type') || searchParams.get('category'));

      if (urlCatOverride) {
        targetCategory = urlCatOverride;
      } else if (userSelectedTab && userSelectedTab !== 'all' && counts[userSelectedTab] > 0) {
        targetCategory = userSelectedTab;
      } else {
        targetCategory = 'all';
      }

      setCategory(targetCategory);
      setLoading(false);

      const durationMs = Date.now() - startTime;
      setCachedSearchResult(cacheKey, {
        searchResults: resultsPayload,
        categoryCounts: counts,
        targetCategory,
      });

      recordSearchEvent(
        normalizedDebouncedQuery,
        durationMs,
        totalSum,
        normalizedDebouncedQuery !== debouncedQuery.trim().toLowerCase(),
        query
      );
    }

    executeMultiCategorySearch();

    return () => {
      cancelled = true;
    };
  }, [normalizedDebouncedQuery, category, userSelectedTab, contentFilter, searchParams]);

  useEffect(() => {
    if (debouncedQuery.trim() && !recentSearches.includes(debouncedQuery.trim())) {
      const updated = [debouncedQuery.trim(), ...recentSearches].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem('cineorder-searches', JSON.stringify(updated));
    }
  }, [debouncedQuery]);

  const startVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice search is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0]?.transcript;
      if (transcript) {
        setQuery(transcript);
        setShowSuggestions(true);
      }
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const clearSearch = () => {
    setQuery('');
    const urlCat = parseCategoryParam(searchParams.get('type') || searchParams.get('category'));
    const defaultCat = urlCat || 'all';
    setSearchParams(urlCat ? { type: urlCat } : {}, { replace: true });
    setUserSelectedTab(urlCat);
    setShowSuggestions(false);
    setSearchResults({
      franchises: franchises,
      movies: [],
      tv: [],
    });
    setCategoryCounts({
      all: franchises.length,
      franchises: franchises.length,
      movies: 0,
      tv: 0,
    });
    setCategory(defaultCat);
  };

  const handleTabClick = (tabId: SearchCategory) => {
    setUserSelectedTab(tabId);
    setCategory(tabId);
    const params: Record<string, string> = {};
    if (query.trim()) {
      params.q = query.trim();
    }
    if (tabId !== 'all') {
      params.type = tabId;
    }
    setSearchParams(params);
  };

  const removeRecentSearch = (search: string) => {
    const updated = recentSearches.filter((s) => s !== search);
    setRecentSearches(updated);
    localStorage.setItem('cineorder-searches', JSON.stringify(updated));
  };

  const handleTMDbResultClick = useCallback(
    (result: TMDbSearchResult['results'][0] | any) => {
      setShowSuggestions(false);
      const rawId = String(result.canonical_id || result.id || '');
      const canonicalContent = getContentById(rawId);
      const targetId = canonicalContent ? canonicalContent.id : rawId;
      navigate(`/movie/${targetId}`);
    },
    [navigate]
  );

  const handleFranchiseClick = useCallback(
    (slug: string) => {
      setShowSuggestions(false);
      navigate(`/franchise/${slug}`);
    },
    [navigate]
  );

  const suggestions = (() => {
    if (!debouncedQuery.trim()) return [];

    const list: Array<{
      id: string | number;
      type: 'franchise' | 'movie' | 'tv';
      title: string;
      subtitle?: string;
      image?: string | null;
      raw: any;
    }> = [];

    searchResults.franchises.slice(0, 2).forEach((f) => {
      list.push({
        id: `f-${f.id}`,
        type: 'franchise',
        title: f.name,
        subtitle: `Franchise • ${f.total_movies} Movies`,
        image: f.poster_url,
        raw: f,
      });
    });

    searchResults.movies.slice(0, 3).forEach((m) => {
      list.push({
        id: `m-${m.id}`,
        type: 'movie',
        title: m.title || (m as any).name || 'Movie',
        subtitle: m.release_date
          ? `Movie • ${new Date(m.release_date).getFullYear()}`
          : 'Movie',
        image: tmdbImage.poster(m.poster_path, 'w185'),
        raw: m,
      });
    });

    searchResults.tv.slice(0, 2).forEach((t) => {
      list.push({
        id: `t-${t.id}`,
        type: 'tv',
        title: t.name || (t as any).title || 'TV Series',
        subtitle: t.first_air_date
          ? `TV Series • ${new Date(t.first_air_date).getFullYear()}`
          : 'TV Series',
        image: tmdbImage.poster(t.poster_path, 'w185'),
        raw: t,
      });
    });

    return list.slice(0, 6);
  })();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = selectedIndex >= 0 ? suggestions[selectedIndex] : suggestions[0];
      if (target) {
        if (target.type === 'franchise') {
          handleFranchiseClick(target.raw.slug);
        } else {
          handleTMDbResultClick(target.raw);
        }
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const filterResultsList = useCallback(
    <T extends { release_date?: string; first_air_date?: string; overview?: string; title?: string; name?: string }>(
      list: T[]
    ): T[] => {
      if (contentFilter === 'all') return list;

      const now = new Date().toISOString().slice(0, 10);

      return list.filter((item) => {
        const date = item.release_date || item.first_air_date || '';
        const titleText = (item.title || item.name || '').toLowerCase();
        const overviewText = (item.overview || '').toLowerCase();

        if (contentFilter === 'released') return date && date <= now;
        if (contentFilter === 'upcoming') return !date || date > now;
        if (contentFilter === 'mcu')
          return titleText.includes('marvel') || overviewText.includes('marvel') || titleText.includes('avengers');
        if (contentFilter === 'animation')
          return (
            titleText.includes('animated') ||
            overviewText.includes('animation') ||
            titleText.includes('spider-verse')
          );
        return true;
      });
    },
    [contentFilter]
  );

  const filteredMovies = filterResultsList(searchResults.movies);
  const filteredTV = filterResultsList(searchResults.tv);

  const activeResultsCount = categoryCounts[category];
  const totalResultsAcrossCategories = categoryCounts.all;
  const isTypingMisspelled =
    normalizedDebouncedQuery !== debouncedQuery.trim().toLowerCase();

  return (
    <>
      <Helmet>
        <title>{query ? `"${query}" — Search CineOrder` : 'Explore Franchises — CineOrder'}</title>
        <meta
          name="description"
          content="Search and explore movie franchises, movies, and TV shows. Find the perfect watch order for Marvel, Star Wars, DC and more."
        />
      </Helmet>

      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl sm:text-4xl font-bold">
                {query ? 'Search Results' : 'Explore'}
              </h1>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-muted">
                <Command className="w-3.5 h-3.5" /> + K or <span className="text-white font-bold px-1 bg-white/10 rounded">/</span> to focus
              </div>
            </div>

            <div className="relative max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                    setSelectedIndex(-1);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search franchises, movies, TV shows..."
                  className="w-full bg-card border border-white/10 rounded-xl pl-12 pr-28 py-3.5 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all"
                  autoFocus
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={startVoiceSearch}
                    className={cn(
                      'p-1.5 rounded-lg transition-all',
                      isListening
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                        : 'text-muted hover:text-white hover:bg-white/10'
                    )}
                    title={isListening ? 'Listening...' : 'Voice Search'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {query && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && query.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-white/5"
                  >
                    <div className="px-3 py-2 text-[11px] font-mono text-muted uppercase tracking-wider flex justify-between items-center bg-white/[0.02]">
                      <span>Instant Suggestions</span>
                      <span className="hidden sm:flex items-center gap-1 text-[10px]">
                        <CornerDownLeft className="w-3 h-3" /> Use ↑↓ to navigate
                      </span>
                    </div>

                    <div className="p-1">
                      {suggestions.map((item, idx) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (item.type === 'franchise') {
                              handleFranchiseClick(item.raw.slug);
                            } else {
                              handleTMDbResultClick(item.raw);
                            }
                          }}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all',
                            idx === selectedIndex
                              ? 'bg-primary/20 text-white border border-primary/30'
                              : 'hover:bg-white/5 text-muted-light hover:text-white'
                          )}
                        >
                          <div className="w-8 h-11 rounded overflow-hidden bg-black/40 flex-shrink-0 border border-white/10">
                            <SafeImage
                              src={item.image}
                              alt={item.title}
                              fallbackSrc="/placeholder-poster.svg"
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate text-white">
                              {highlightMatchText(item.title, normalizedDebouncedQuery)}
                            </div>
                            <div className="text-xs text-muted truncate">{item.subtitle}</div>
                          </div>

                          <div className="flex items-center gap-1">
                            {item.type === 'franchise' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Franchise
                              </span>
                            )}
                            {item.type === 'movie' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                Movie
                              </span>
                            )}
                            {item.type === 'tv' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                TV
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {query && isTypingMisspelled && (
            <div className="mb-4 text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Showing results for: <span className="font-bold underline">{normalizedDebouncedQuery}</span> (corrected from "{query}")
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none w-full sm:w-auto">
              {categoryTabs.map((tab) => {
                const count = categoryCounts[tab.id];
                const isSelected = category === tab.id;
                const hasQuery = Boolean(debouncedQuery.trim());

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
                      isSelected
                        ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]'
                        : 'bg-surface border border-white/10 text-muted-light hover:text-white hover:border-white/20'
                    )}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {hasQuery && (
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-bold font-mono transition-colors',
                          isSelected
                            ? 'bg-white/20 text-white'
                            : count > 0
                            ? 'bg-primary/20 text-primary-light border border-primary/30'
                            : 'bg-white/5 text-muted'
                        )}
                      >
                        ({count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {query.trim().length > 0 && (
              <div className="flex items-center gap-1.5 bg-card/60 border border-white/10 rounded-full p-1 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted ml-2 mr-1" />
                {subFilters.map((sf) => (
                  <button
                    key={sf.id}
                    onClick={() => setContentFilter(sf.id)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-semibold transition-all',
                      contentFilter === sf.id
                        ? 'bg-white/20 text-white font-bold shadow'
                        : 'text-muted hover:text-white'
                    )}
                  >
                    {sf.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!query && recentSearches.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
              <h2 className="text-sm font-medium text-muted-light mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Searches
              </h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <div
                    key={search}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface border border-white/10 text-sm group"
                  >
                    <button
                      onClick={() => setQuery(search)}
                      className="text-muted-light hover:text-white transition-colors"
                    >
                      {search}
                    </button>
                    <button
                      onClick={() => removeRecentSearch(search)}
                      className="text-muted hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {loading ? (
            <SearchSkeleton count={12} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={category + contentFilter + (debouncedQuery || 'empty')}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {category === 'all' && totalResultsAcrossCategories > 0 && (
                  <div className="space-y-12">
                    {/* 1. Franchises */}
                    {searchResults.franchises.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                            <Sparkles className="w-5 h-5 text-amber-400" /> Franchises ({searchResults.franchises.length})
                          </h2>
                          <button
                            onClick={() => handleTabClick('franchises')}
                            className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            View All Franchises ({searchResults.franchises.length}) <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                          {searchResults.franchises.slice(0, 6).map((franchise) => (
                            <Card
                              key={`all-franchise-${franchise.id}`}
                              data-franchise-id={franchise.id}
                              data-artwork-hash={franchise.poster_url?.split('/').pop()}
                              glow
                              className="group cursor-pointer"
                              onClick={() => handleFranchiseClick(franchise.slug)}
                            >
                              <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
                                <SafeImage
                                  src={franchise.poster_url}
                                  alt={franchise.name}
                                  fallbackSrc="/placeholder-poster.svg"
                                  loading="lazy"
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                  <h3 className="text-sm font-bold line-clamp-2 leading-tight">
                                    {highlightMatchText(franchise.name, normalizedDebouncedQuery)}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span className="flex items-center gap-1 text-xs text-muted-light">
                                      <Film className="w-3 h-3" /> {franchise.total_movies}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. Movies */}
                    {filteredMovies.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                            <Film className="w-5 h-5 text-blue-400" /> Movies ({filteredMovies.length})
                          </h2>
                          <button
                            onClick={() => handleTabClick('movies')}
                            className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            View All Movies ({filteredMovies.length}) <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                          {filteredMovies.slice(0, 6).map((result, i) => (
                            <SearchResultCard
                              key={`all-movie-${result.id}-${i}`}
                              result={result as any}
                              index={i}
                              searchQuery={normalizedDebouncedQuery}
                              onClick={() => handleTMDbResultClick(result)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. TV Series */}
                    {filteredTV.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                            <Tv className="w-5 h-5 text-purple-400" /> TV Series ({filteredTV.length})
                          </h2>
                          <button
                            onClick={() => handleTabClick('tv')}
                            className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            View All TV Shows ({filteredTV.length}) <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                          {filteredTV.slice(0, 6).map((result, i) => (
                            <SearchResultCard
                              key={`all-tv-${result.id}-${i}`}
                              result={result as any}
                              index={i}
                              searchQuery={normalizedDebouncedQuery}
                              onClick={() => handleTMDbResultClick(result)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {category === 'franchises' && (
                  <>
                    {searchResults.franchises.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {searchResults.franchises.map((franchise, i) => (
                          <motion.div
                            key={franchise.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                          >
                            <Card
                              data-franchise-id={franchise.id}
                              data-artwork-hash={franchise.poster_url?.split('/').pop()}
                              glow
                              className="group cursor-pointer"
                              onClick={() => handleFranchiseClick(franchise.slug)}
                            >
                              <div className="relative aspect-[2/3] overflow-hidden">
                                <SafeImage
                                  src={franchise.poster_url}
                                  alt={franchise.name}
                                  fallbackSrc="/placeholder-poster.svg"
                                  loading="lazy"
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                  <h3 className="text-sm font-bold line-clamp-2 leading-tight">
                                    {highlightMatchText(franchise.name, normalizedDebouncedQuery)}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span className="flex items-center gap-1 text-xs text-muted-light">
                                      <Film className="w-3 h-3" /> {franchise.total_movies}
                                    </span>
                                    {franchise.total_series > 0 && (
                                      <span className="flex items-center gap-1 text-xs text-muted-light">
                                        <Tv className="w-3 h-3" /> {franchise.total_series}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <Search className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No franchises found for "{query}"</h3>
                        <p className="text-muted">Try another search term or switch categories above.</p>
                      </div>
                    )}
                  </>
                )}

                {category === 'movies' && (
                  <>
                    {filteredMovies.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredMovies.map((result, i) => (
                          <SearchResultCard
                            key={`movie-${result.id}-${i}`}
                            result={result as any}
                            index={i}
                            searchQuery={normalizedDebouncedQuery}
                            onClick={() => handleTMDbResultClick(result)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <Search className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No movies found for "{query}"</h3>
                        <p className="text-muted">Try checking for typos or adjusting filters.</p>
                      </div>
                    )}
                  </>
                )}

                {category === 'tv' && (
                  <>
                    {filteredTV.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredTV.map((result, i) => (
                          <SearchResultCard
                            key={`tv-${result.id}-${i}`}
                            result={result as any}
                            index={i}
                            searchQuery={normalizedDebouncedQuery}
                            onClick={() => handleTMDbResultClick(result)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <Search className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No TV series found for "{query}"</h3>
                        <p className="text-muted">Try checking for typos or adjusting filters.</p>
                      </div>
                    )}
                  </>
                )}

                {query && totalResultsAcrossCategories === 0 && (
                  <div className="max-w-md mx-auto text-center py-16 px-4">
                    <Search className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-white">No exact matches for "{query}"</h3>
                    <p className="text-muted text-sm mb-6">
                      We couldn't find any franchises, movies, or TV series matching your term.
                    </p>

                    <div className="bg-card border border-white/10 rounded-2xl p-5 shadow-xl text-left">
                      <div className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" /> Try searching for:
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {['Spider-Man', 'Batman', 'Marvel', 'Star Wars', 'Avengers', 'Loki'].map((term) => (
                          <button
                            key={term}
                            onClick={() => setQuery(term)}
                            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/30 hover:text-primary-light text-xs font-medium text-white transition-all cursor-pointer"
                          >
                            • {term}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={clearSearch}
                        className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                      >
                        Browse All Franchises <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {query && activeResultsCount > 0 && !loading && (
            <p className="text-sm text-muted mt-6 font-mono">
              Found {activeResultsCount}{' '}
              {category === 'all'
                ? 'total result'
                : category === 'franchises'
                ? 'franchise'
                : category === 'tv'
                ? 'TV show'
                : category.slice(0, -1)}
              {activeResultsCount !== 1 ? 's' : ''} for "{query}"
            </p>
          )}
        </div>
      </div>
    </>
  );
}
