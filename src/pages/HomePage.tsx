import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Search, ChevronRight, Film, Tv, Clock, Star, Sparkles, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SafeImage } from '@/components/ui/SafeImage';
import { FranchiseCardSkeleton } from '@/components/ui/Skeleton';
import { UpcomingCard } from '@/components/ui/UpcomingCard';
import { ContinuePreparationWidget } from '@/components/home/ContinuePreparationWidget';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useUpcomingReleases } from '@/hooks/useUpcomingReleases';
import { getUpcomingTitles } from '@/lib/upcomingUtils';
import { getPopularFranchises, franchises, allContent } from '@/data/franchises';
import { usePlannerStore } from '@/store/plannerStore';
import { useWatchStore } from '@/store/watchStore';
import type { Franchise } from '@/types';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const popular = getPopularFranchises();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>CineOrder — Find the Perfect Watch Order for Every Franchise</title>
        <meta
          name="description"
          content="Discover the correct order to watch movies, TV series, specials and spin-offs. Get chronological and release viewing orders for Marvel, Star Wars, DC, Harry Potter and more."
        />
        <meta property="og:title" content="CineOrder — Find the Perfect Watch Order" />
        <meta
          property="og:description"
          content="Discover the correct order to watch movies, TV series, specials and spin-offs."
        />
      </Helmet>

      {/* ─── 1. Hero Section ────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-8 pb-10 sm:pt-20 sm:pb-24">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[200px] bg-accent-blue/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full glass-card text-xs sm:text-sm text-muted-light mb-4 sm:mb-6"
          >
            <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="truncate max-w-[260px] sm:max-w-none">Story Knowledge Graph & Traversal Engine</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-[1.15]"
          >
            Find the Perfect{' '}
            <span className="text-gradient">Watch Order</span>{' '}
            for Every Franchise
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 sm:mt-6 text-sm sm:text-xl text-muted-light max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Chronological timelines, release orders, and story prerequisite recommendations.
            Never wonder what to watch next.
          </motion.p>

          {/* Search Bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 sm:mt-8 max-w-xl mx-auto"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 sm:left-4 w-4 h-4 sm:w-5 sm:h-5 text-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Marvel, Star Wars, Batman..."
                className="w-full pl-10 sm:pl-12 pr-24 sm:pr-28 py-3 sm:py-4 bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl text-white placeholder-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-sm sm:text-base shadow-xl"
              />
              <button
                type="submit"
                className="absolute right-1.5 sm:right-2 px-3.5 sm:px-5 py-2 sm:py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors shadow-md"
              >
                Search
              </button>
            </div>
          </motion.form>

          {/* Quick tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="text-xs text-muted">Popular:</span>
            {['Marvel', 'Star Wars', 'DC', 'Harry Potter', 'Fast & Furious'].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-muted-light hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
              >
                {tag}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── 2. Continue Preparation ────────────────────────────── */}
      <ContinuePreparationWidget />

      {/* ─── 3. Upcoming Releases ───────────────────────────────── */}
      <UpcomingHomeSection />

      {/* ─── 4. Featured Franchises ─────────────────────────────── */}
      <FranchiseSection
        title="Featured Franchises"
        icon={<Star className="w-5 h-5 text-yellow-400" />}
        franchises={popular}
        onFranchiseClick={(f) => navigate(`/franchise/${f.slug}`)}
      />

      {/* ─── 5. Statistics ──────────────────────────────────────── */}
      <StatsSection />

      {/* ─── 6. Dynamic Personalized CTA Section ───────────────── */}
      <DynamicCTASection />
    </>
  );
}

// ─── Dynamic Personalized CTA Section ───────────────────────

function DynamicCTASection() {
  const navigate = useNavigate();
  const { activePlan } = usePlannerStore();
  const { watchHistory } = useWatchStore();

  const watchedCount = useMemo(() => {
    return Object.keys(watchHistory).filter((k) => watchHistory[k]).length;
  }, [watchHistory]);

  let planProgressPct = 0;
  if (activePlan && activePlan.schedule.length > 0) {
    const done = activePlan.schedule.filter((i) => i.isCompleted).length;
    planProgressPct = Math.round((done / activePlan.schedule.length) * 100);
  }

  // State 1: Active Preparation Plan
  if (activePlan) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-card to-card border border-primary/30 p-8 sm:p-12 text-center shadow-2xl space-y-6"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="space-y-3 relative z-10 max-w-2xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
              Active Watch Plan
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              🎬 Continue your preparation
            </h2>
            <p className="text-muted-light text-base sm:text-lg">
              You're <span className="text-primary font-bold">{planProgressPct}% ready</span> for{' '}
              <span className="text-white font-bold">{activePlan.targetTitle}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 relative z-10">
            <button
              onClick={() => navigate('/planner')}
              className="inline-flex items-center gap-2.5 btn-primary-gradient px-8 py-4 rounded-xl text-sm sm:text-base font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-all"
            >
              <Calendar className="w-5 h-5 text-white" />
              Resume Preparation
            </button>

            <button
              onClick={() => navigate('/search')}
              className="inline-flex items-center gap-2.5 bg-surface hover:bg-white/10 text-white border border-white/10 hover:border-white/20 px-7 py-3.5 rounded-xl text-sm sm:text-base font-bold transition-all"
            >
              <Search className="w-5 h-5 text-primary" />
              Explore Franchises
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  // State 2: Watched Content (No Active Plan)
  if (watchedCount > 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-card to-card border border-primary/30 p-8 sm:p-12 text-center shadow-2xl space-y-6"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="space-y-3 relative z-10 max-w-2xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
              {watchedCount} Titles Completed
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              🎬 Ready for your next movie?
            </h2>
            <p className="text-muted-light text-base sm:text-lg">
              Generate another personalized watch plan based on your watch history.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 relative z-10">
            <button
              onClick={() => navigate('/planner')}
              className="inline-flex items-center gap-2.5 btn-primary-gradient px-8 py-4 rounded-xl text-sm sm:text-base font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-all"
            >
              <Calendar className="w-5 h-5 text-white" />
              Start Planning
            </button>

            <button
              onClick={() => navigate('/search')}
              className="inline-flex items-center gap-2.5 bg-surface hover:bg-white/10 text-white border border-white/10 hover:border-white/20 px-7 py-3.5 rounded-xl text-sm sm:text-base font-bold transition-all"
            >
              <Search className="w-5 h-5 text-primary" />
              Explore Franchises
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  // State 3: New / Default User
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-card to-card border border-primary/30 p-8 sm:p-12 text-center shadow-2xl space-y-6"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="space-y-3 relative z-10 max-w-2xl mx-auto">
          <span className="px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
            Ready for the Next Chapter?
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            🎬 Don't know where to start?
          </h2>
          <p className="text-muted-light text-base sm:text-lg">
            Tell CineOrder what you want to watch, and we'll build your preparation plan.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 relative z-10">
          <button
            onClick={() => navigate('/planner')}
            className="inline-flex items-center gap-2.5 btn-primary-gradient px-8 py-4 rounded-xl text-sm sm:text-base font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-all"
          >
            <Calendar className="w-5 h-5 text-white" />
            Start Planning
          </button>

          <button
            onClick={() => navigate('/search')}
            className="inline-flex items-center gap-2.5 bg-surface hover:bg-white/10 text-white border border-white/10 hover:border-white/20 px-7 py-3.5 rounded-xl text-sm sm:text-base font-bold transition-all"
          >
            <Search className="w-5 h-5 text-primary" />
            Explore Watch Orders
          </button>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Franchise Section ──────────────────────────────────────

function FranchiseSection({
  title,
  icon,
  franchises,
  onFranchiseClick,
}: {
  title: string;
  icon: React.ReactNode;
  franchises: Franchise[];
  onFranchiseClick: (f: Franchise) => void;
}) {
  const navigate = useNavigate();
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <button
          type="button"
          onClick={() => navigate('/search?type=franchises')}
          className="flex items-center gap-1 text-sm font-semibold text-muted-light hover:text-primary transition-colors cursor-pointer"
        >
          View All <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div ref={ref} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {isVisible
          ? franchises.map((franchise, i) => (
              <motion.div
                key={franchise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <FranchiseCard franchise={franchise} onClick={() => onFranchiseClick(franchise)} />
              </motion.div>
            ))
          : franchises.map((_, i) => <FranchiseCardSkeleton key={i} />)}
      </div>
    </section>
  );
}

// ─── Franchise Card ─────────────────────────────────────────

function FranchiseCard({ franchise, onClick }: { franchise: Franchise; onClick: () => void }) {
  return (
    <Card
      onClick={onClick}
      glow
      data-franchise-id={franchise.id}
      data-artwork-hash={franchise.poster_url?.split('/').pop()}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <SafeImage
          src={franchise.poster_url}
          alt={franchise.name}
          fallbackSrc="/placeholder-poster.svg"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
          <h3 className="text-sm font-bold line-clamp-2 leading-tight text-white">{franchise.name}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="flex items-center gap-1 text-xs text-muted-light">
              <Film className="w-3 h-3 text-primary" /> {franchise.total_movies}
            </span>
            {franchise.total_series > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-light">
                <Tv className="w-3 h-3 text-blue-400" /> {franchise.total_series}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Stats Section ──────────────────────────────────────────

function StatsSection() {
  const stats = [
    { label: 'Franchises', value: `${franchises.length}+`, icon: <Sparkles className="w-6 h-6" /> },
    { label: 'Movies & Shows', value: `${allContent.length}+`, icon: <Film className="w-6 h-6" /> },
    { label: 'Watch Orders', value: '36+', icon: <Clock className="w-6 h-6" /> },
    { label: 'Hours of Content', value: '500+', icon: <Tv className="w-6 h-6" /> },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center p-6 rounded-2xl bg-card border border-white/5"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
              {stat.icon}
            </div>
            <div className="text-3xl font-black text-white">{stat.value}</div>
            <div className="text-sm text-muted mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Upcoming Releases Section ────────────────────────────────

function UpcomingHomeSection() {
  const navigate = useNavigate();
  const { items, loading } = useUpcomingReleases();

  const upcomingItems = useMemo(() => getUpcomingTitles(items).slice(0, 4), [items]);

  return (
    <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-4">
      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold text-white truncate">Upcoming Releases</h2>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Live Countdowns
            </span>
          </div>
          <p className="text-xs text-muted truncate sm:whitespace-normal">
            Future movies and TV series across all supported CineOrder universes.
          </p>
        </div>

        <button
          onClick={() => navigate('/upcoming')}
          className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:text-primary-hover transition-colors flex-shrink-0"
        >
          View All <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex sm:flex-col gap-3 glass-dark p-3 sm:p-4 rounded-2xl border border-white/10">
              <div className="w-[105px] sm:w-full aspect-[2/3] rounded-xl bg-surface/50 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 bg-surface/50 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-surface/50 rounded animate-pulse" />
                <div className="h-7 w-full bg-surface/50 rounded animate-pulse mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : upcomingItems.length === 0 ? (
        <div className="p-6 sm:p-8 rounded-2xl glass-dark border border-white/10 text-center space-y-2">
          <p className="text-sm font-medium text-white">No upcoming releases right now.</p>
          <p className="text-xs text-muted">Check back soon for newly announced movies and TV series.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {upcomingItems.map((item) => (
            <UpcomingCard key={item.id} item={item} mode="upcoming" />
          ))}
        </div>
      )}
    </section>
  );
}
