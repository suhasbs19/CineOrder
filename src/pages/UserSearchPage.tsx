import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Users,
  Search,
  X,
  ShieldCheck,
  Film,
  ArrowRight,
  Sparkles,
  UserX,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDebounce } from '@/hooks/useDebounce';
import { searchPublicUsers } from '@/lib/authService';
import type { PublicUserSearchResult } from '@/types';

export default function UserSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 250);
  const [results, setResults] = useState<PublicUserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery.trim()));

  const inputRef = useRef<HTMLInputElement>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    const clean = searchQuery.trim().replace(/^@+/, '');
    if (!clean) {
      setResults([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const data = await searchPublicUsers(clean, 24);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      setSearchParams(
        debouncedQuery.trim() ? { q: debouncedQuery.trim() } : {},
        { replace: true }
      );
      performSearch(debouncedQuery);
    } else {
      setSearchParams({}, { replace: true });
      setResults([]);
      setLoading(false);
      setHasSearched(false);
    }
  }, [debouncedQuery, performSearch, setSearchParams]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setSearchParams({}, { replace: true });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
    }
  };

  return (
    <>
      <Helmet>
        <title>Search Users — CineOrder</title>
        <meta
          name="description"
          content="Find CineOrder movie enthusiasts by username. Discover public movie identities and watch taste profiles."
        />
      </Helmet>

      <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header Navigation & Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Search Users</h1>
            </div>
            <p className="text-sm text-muted">
              Discover CineOrder members by username and explore their public movie identities.
            </p>
          </div>

          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-muted hover:text-white transition-colors border border-white/10 shadow-sm"
          >
            <Film className="w-3.5 h-3.5 text-primary" />
            <span>Search Movies & Franchises</span>
            <ArrowRight className="w-3 h-3 text-muted" />
          </Link>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleFormSubmit} className="mb-6 relative z-10">
          <div className="relative flex items-center">
            <div className="absolute left-4 flex items-center pointer-events-none text-muted font-mono text-lg font-bold">
              @
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter username (e.g. spiderfan, suhas, cinebuff)..."
              className="w-full pl-10 pr-28 py-3.5 bg-card/80 backdrop-blur-md rounded-2xl border border-white/15 text-white placeholder-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base shadow-xl"
              autoFocus
            />

            <div className="absolute right-3 flex items-center gap-1.5">
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <Button
                type="submit"
                size="sm"
                className="px-4 py-1.5 rounded-xl font-medium"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-center gap-2 mt-3 px-2 text-xs text-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>
              Respects user privacy: only <strong className="text-white/90">Public Profiles</strong> appear in search results. Private accounts remain unlisted.
            </span>
          </div>
        </form>

        {/* Search Results Area */}
        <div className="mt-8">
          {loading ? (
            /* Loading Skeletons */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card/40 rounded-2xl border border-white/5 p-5 animate-pulse flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-2/3" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                    <div className="h-3 bg-white/5 rounded w-1/3 pt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            /* Result List */
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Found {results.length} {results.length === 1 ? 'user' : 'users'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {results.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="p-5 h-full flex flex-col justify-between hover:border-primary/40 transition-all group bg-card/60 backdrop-blur-sm">
                        <div>
                          <div className="flex items-start gap-3.5 mb-3">
                            <Avatar
                              src={user.avatar_url}
                              alt={user.display_name}
                              size="md"
                              className="border border-white/10 group-hover:border-primary/30 transition-colors"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-bold text-white truncate group-hover:text-primary transition-colors">
                                {user.display_name}
                              </h3>
                              <p className="text-xs font-mono text-muted truncate">
                                @{user.username}
                              </p>
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                                <Sparkles className="w-2.5 h-2.5" />
                                Movie Identity
                              </span>
                            </div>
                          </div>

                          {user.show_stats && user.total_watched !== undefined && (
                            <div className="flex items-center gap-3 text-xs text-muted mt-2 pt-2 border-t border-white/5">
                              <div>
                                <span className="font-semibold text-white">{user.total_watched}</span> Watched
                              </div>
                              {user.favorite_genre && (
                                <>
                                  <span className="text-white/20">•</span>
                                  <div>
                                    <span className="font-semibold text-white">{user.favorite_genre}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/profile/${user.username}`)}
                            className="w-full text-xs font-medium group-hover:bg-primary group-hover:text-white transition-colors"
                          >
                            <span>View Profile</span>
                            <ArrowRight className="w-3 h-3 ml-1.5" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ) : hasSearched ? (
            /* No Results State */
            <div className="bg-card/30 rounded-2xl border border-white/10 p-12 text-center max-w-md mx-auto my-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10 text-muted">
                <UserX className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-1">No public users found</h3>
              <p className="text-sm text-muted mb-4">
                No public profiles matched <strong className="text-white">@{query.replace(/^@+/, '')}</strong>.
              </p>
              <p className="text-xs text-muted/70">
                Tip: Usernames must be active and set to Public Profile visibility to appear in search.
              </p>
            </div>
          ) : (
            /* Initial / Empty Query State */
            <div className="bg-card/20 rounded-2xl border border-white/5 p-12 text-center max-w-lg mx-auto my-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20 text-primary">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-1">Find CineOrder Movie Identities</h3>
              <p className="text-sm text-muted mb-4">
                Enter a username or display name to discover public profiles and movie tastes.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted">
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">Exact lookup</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">Partial autocomplete</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">Case-insensitive</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
