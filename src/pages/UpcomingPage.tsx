import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Calendar, Film, Tv, Sparkles, Filter, Search, AlertCircle, Play, Clock } from 'lucide-react';
import { useUpcomingReleases } from '@/hooks/useUpcomingReleases';
import { getUpcomingTitles, getRecentlyReleasedTitles } from '@/lib/upcomingUtils';
import { UpcomingCard } from '@/components/ui/UpcomingCard';
import { franchises } from '@/data/franchises';
import { Skeleton } from '@/components/ui/Skeleton';

type MainSectionTab = 'upcoming' | 'recently_released' | 'all';

export default function UpcomingPage() {
  const { items, loading, error } = useUpcomingReleases();

  const [activeMainTab, setActiveMainTab] = useState<MainSectionTab>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFranchise, setSelectedFranchise] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const upcomingList = useMemo(() => getUpcomingTitles(items), [items]);
  const recentlyReleasedList = useMemo(() => getRecentlyReleasedTitles(items, 90), [items]);
  const allTrackerList = useMemo(() => [...upcomingList, ...recentlyReleasedList], [upcomingList, recentlyReleasedList]);

  // Apply filters consistently across datasets
  const filterList = (list: typeof items) => {
    return list.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesFranchise = item.franchise_name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesFranchise) return false;
      }

      // Franchise
      if (selectedFranchise !== 'all' && item.franchise_id !== selectedFranchise) {
        return false;
      }

      // Type
      if (selectedType !== 'all') {
        if (selectedType === 'movie' && item.type === 'series') return false;
        if (selectedType === 'series' && item.type !== 'series') return false;
      }

      return true;
    });
  };

  const filteredUpcoming = useMemo(
    () => filterList(upcomingList),
    [upcomingList, searchQuery, selectedFranchise, selectedType]
  );
  const filteredRecentlyReleased = useMemo(
    () => filterList(recentlyReleasedList),
    [recentlyReleasedList, searchQuery, selectedFranchise, selectedType]
  );
  const filteredAll = useMemo(
    () => filterList(allTrackerList),
    [allTrackerList, searchQuery, selectedFranchise, selectedType]
  );

  const filteredItems = useMemo(() => {
    if (activeMainTab === 'upcoming') return filteredUpcoming;
    if (activeMainTab === 'recently_released') return filteredRecentlyReleased;
    return filteredAll;
  }, [activeMainTab, filteredUpcoming, filteredRecentlyReleased, filteredAll]);

  // Next major arrival for spotlight banner
  const featuredItem = useMemo(() => {
    return filteredUpcoming[0] || upcomingList[0] || null;
  }, [filteredUpcoming, upcomingList]);

  return (
    <>
      <Helmet>
        <title>Upcoming & Recent Releases — CineOrder</title>
        <meta
          name="description"
          content="Track upcoming movie and TV series releases and recently released titles across Marvel, Star Wars, DC, Harry Potter, and major franchises."
        />
      </Helmet>

      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
            >
              <Calendar className="w-4 h-4" />
              <span>Official Release Tracker</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-black text-white tracking-tight"
            >
              Upcoming & <span className="text-gradient">Recent Releases</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-light text-base sm:text-lg"
            >
              Live countdowns to future chapters and fresh titles available now.
            </motion.p>
          </div>

          {/* Featured Spotlight Banner */}
          {!loading && featuredItem && activeMainTab === 'upcoming' && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Next Major Arrival</span>
              </div>
              <UpcomingCard item={featuredItem} featured mode="upcoming" />
            </section>
          )}

          {/* Section Selector Tabs */}
          <div className="flex justify-start sm:justify-center border-b border-white/10 pb-4 overflow-x-auto max-w-full">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-surface/80 border border-white/10 flex-shrink-0">
              <button
                onClick={() => setActiveMainTab('upcoming')}
                className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                  activeMainTab === 'upcoming'
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-muted hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Upcoming Releases</span>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-white/20">
                  {filteredUpcoming.length}
                </span>
              </button>

              <button
                onClick={() => setActiveMainTab('recently_released')}
                className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                  activeMainTab === 'recently_released'
                    ? 'bg-green-500 text-black shadow-lg shadow-green-500/25'
                    : 'text-muted hover:text-white'
                }`}
              >
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Recently Released</span>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-black/20">
                  {filteredRecentlyReleased.length}
                </span>
              </button>

              <button
                onClick={() => setActiveMainTab('all')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeMainTab === 'all'
                    ? 'bg-white/20 text-white'
                    : 'text-muted hover:text-white'
                }`}
              >
                All ({filteredAll.length})
              </button>
            </div>
          </div>

          {/* Controls & Filters */}
          <div className="glass-dark p-6 rounded-2xl border border-white/10 space-y-6">
            {/* Search Bar & Type Selectors */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search input */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search releases..."
                  className="w-full bg-surface border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedType === 'all'
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'bg-surface text-muted hover:text-white border border-white/10'
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setSelectedType('movie')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedType === 'movie'
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'bg-surface text-muted hover:text-white border border-white/10'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  Movies
                </button>
                <button
                  onClick={() => setSelectedType('series')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedType === 'series'
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'bg-surface text-muted hover:text-white border border-white/10'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  TV Series
                </button>
              </div>
            </div>

            {/* Franchise Pills */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter by Franchise:</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                <button
                  onClick={() => setSelectedFranchise('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedFranchise === 'all'
                      ? 'bg-white/20 text-white font-bold border border-white/30'
                      : 'bg-surface/80 text-muted hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  All Franchises
                </button>
                {franchises.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFranchise(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedFranchise === f.id
                        ? 'bg-primary/90 text-white font-bold border border-primary/40'
                        : 'bg-surface/80 text-muted hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-6 rounded-xl bg-accent-red/10 border border-accent-red/30 text-accent-red flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Grid */}
          {!loading && !error && (
            <>
              {filteredItems.length === 0 ? (
                <div className="text-center py-16 space-y-4 glass-dark rounded-2xl border border-white/10 p-8">
                  <div className="w-16 h-16 rounded-full bg-surface border border-white/10 flex items-center justify-center mx-auto text-muted">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">No Releases Found</h3>
                  <p className="text-muted text-sm max-w-md mx-auto">
                    {activeMainTab === 'upcoming'
                      ? 'No upcoming releases right now. Check back soon for newly announced movies and TV series.'
                      : 'No releases match your current search or filter criteria.'}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedFranchise('all');
                      setSelectedType('all');
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-white transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>
                      Showing {filteredItems.length}{' '}
                      {activeMainTab === 'upcoming'
                        ? 'upcoming'
                        : activeMainTab === 'recently_released'
                        ? 'recently released'
                        : 'total tracked'}{' '}
                      titles
                    </span>
                    <span>
                      {activeMainTab === 'upcoming'
                        ? 'Sorted by nearest release'
                        : activeMainTab === 'recently_released'
                        ? 'Sorted by most recent'
                        : 'Sorted by release schedule'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                      <UpcomingCard
                        key={item.id}
                        item={item}
                        mode={item.status === 'Released' ? 'recently_released' : 'upcoming'}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
