import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Search, ChevronRight, Film, Tv, Clock, Star, Sparkles, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SafeImage } from '@/components/ui/SafeImage';
import { FranchiseCardSkeleton } from '@/components/ui/Skeleton';
import { UpcomingCard } from '@/components/ui/UpcomingCard';
import { AskCineOrderSection } from '@/components/home/AskCineOrderSection';
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
        <meta property="og:description" content="Movies, TV Series, Specials and Spin-offs in the correct order." />
      </Helmet>

      {/* ─── 1. Hero Section & Search ────────────────────────────── */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Gradients & Grid */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] opacity-30" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>
                {franchises.length} Franchises • {allContent.length}+ Titles • Watch Preparation
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
              Find the Perfect <span className="text-gradient">Watch Order</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-light max-w-2xl mx-auto mb-10 text-balance">
              Movies, TV Series, Specials and Spin-offs in the correct order. Never watch out of sequence again.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onSubmit={handleSearch}
            className="relative max-w-2xl mx-auto"
          >
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (val.trim()) {
                    navigate(`/search?q=${encodeURIComponent(val.trim())}`);
                  }
                }}
                placeholder="Search Marvel, Star Wars, Harry Potter..."
                className="w-full bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-lg text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all shadow-2xl shadow-black/20"
              />
            </div>
          </motion.form>

          {/* Quick Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mt-6"
          >
            {['Marvel', 'Star Wars', 'Harry Potter', 'DC', 'X-Men'].map((tag) => (
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

      {/* ─── 2. AI Advisor ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AskCineOrderSection />
      </section>

      {/* ─── 3. Continue Preparation ────────────────────────────── */}
      <ContinuePreparationWidget />

      {/* ─── 4. Upcoming Releases ───────────────────────────────── */}
      <UpcomingHomeSection />

      {/* ─── 5. Featured Franchises ─────────────────────────────── */}
      <FranchiseSection
        title="Featured Franchises"
        icon={<Star className="w-5 h-5 text-yellow-400" />}
        franchises={popular}
        onFranchiseClick={(f) => navigate(`/franchise/${f.slug}`)}
      />

      {/* ─── 7. Statistics ──────────────────────────────────────── */}
      <StatsSection />

      {/* ─── 8. Dynamic Personalized CTA Section ───────────────── */}
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

  const exampleQuestions = [
    'Can I skip Loki?',
    'Prepare me for Avengers: Secret Wars.',
    'I only have 6 hours.',
    'Explain the Multiverse.',
    'What should I watch after No Way Home?',
  ];

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
              onClick={() => navigate('/assistant')}
              className="inline-flex items-center gap-2.5 bg-surface hover:bg-white/10 text-white border border-white/10 hover:border-white/20 px-7 py-3.5 rounded-xl text-sm sm:text-base font-bold transition-all"
            >
              <Sparkles className="w-5 h-5 text-primary" />
              Ask AI Advisor
            </button>
          </div>

          {/* AI Example Question Chips */}
          <div className="pt-6 border-t border-white/10 space-y-3 relative z-10">
            <p className="text-xs text-muted font-medium flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Try asking CineOrder AI:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
              {exampleQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => navigate(`/assistant?q=${encodeURIComponent(q)}`)}
                  className="px-3.5 py-1.5 rounded-full bg-surface/80 hover:bg-white/10 border border-white/10 text-xs text-muted hover:text-white transition-all hover:scale-105"
                >
                  "{q}"
                </button>
              ))}
            </div>
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
              onClick={() => navigate('/assistant')}
              className="inline-flex items-center gap-2.5 bg-surface hover:bg-white/10 text-white border border-white/10 hover:border-white/20 px-7 py-3.5 rounded-xl text-sm sm:text-base font-bold transition-all"
            >
              <Sparkles className="w-5 h-5 text-primary" />
              Ask AI Advisor
            </button>
          </div>

          {/* AI Example Question Chips */}
          <div className="pt-6 border-t border-white/10 space-y-3 relative z-10">
            <p className="text-xs text-muted font-medium flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Try asking CineOrder AI:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
              {exampleQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => navigate(`/assistant?q=${encodeURIComponent(q)}`)}
                  className="px-3.5 py-1.5 rounded-full bg-surface/80 hover:bg-white/10 border border-white/10 text-xs text-muted hover:text-white transition-all hover:scale-105"
                >
                  "{q}"
                </button>
              ))}
            </div>
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
            onClick={() => navigate('/assistant')}
            className="inline-flex items-center gap-2.5 btn-primary-gradient px-8 py-4 rounded-xl text-sm sm:text-base font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-all"
          >
            <Sparkles className="w-5 h-5 text-white" />
            Ask AI Advisor
          </button>

          <button
            onClick={() => navigate('/planner')}
            className="inline-flex items-center gap-2.5 bg-surface hover:bg-white/10 text-white border border-white/10 hover:border-white/20 px-7 py-3.5 rounded-xl text-sm sm:text-base font-bold transition-all"
          >
            <Calendar className="w-5 h-5 text-primary" />
            Start Planning
          </button>
        </div>

        {/* AI Example Question Chips */}
        <div className="pt-6 border-t border-white/10 space-y-3 relative z-10">
          <p className="text-xs text-muted font-medium flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Try asking CineOrder AI:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {exampleQuestions.map((q) => (
              <button
                key={q}
                onClick={() => navigate(`/assistant?q=${encodeURIComponent(q)}`)}
                className="px-3.5 py-1.5 rounded-full bg-surface/80 hover:bg-white/10 border border-white/10 text-xs text-muted hover:text-white transition-all hover:scale-105"
              >
                "{q}"
              </button>
            ))}
          </div>
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-white">Upcoming Releases</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Live Countdowns
            </span>
          </div>
          <p className="text-xs text-muted">
            Future movies and TV series across all supported CineOrder universes.
          </p>
        </div>

        <button
          onClick={() => navigate('/upcoming')}
          className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          View All Upcoming <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] w-full rounded-xl bg-surface/50 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : upcomingItems.length === 0 ? (
        <div className="p-8 rounded-2xl glass-dark border border-white/10 text-center space-y-2">
          <p className="text-sm font-medium text-white">No upcoming releases right now.</p>
          <p className="text-xs text-muted">Check back soon for newly announced movies and TV series.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {upcomingItems.map((item) => (
            <UpcomingCard key={item.id} item={item} mode="upcoming" />
          ))}
        </div>
      )}
    </section>
  );
}
