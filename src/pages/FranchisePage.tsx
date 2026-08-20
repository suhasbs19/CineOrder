import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Film, Tv, Clock, Star, Calendar, Check, Eye, EyeOff,
  Play, Info, ListOrdered, Map, Loader2, AlertCircle, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { InteractiveTimeline } from '@/components/ui/Timeline';
import { StreamingDots } from '@/components/ui/StreamingBadges';
import { useAuthStore } from '@/store/authStore';
import { useWatchStore } from '@/store/watchStore';
import { useFilterStore } from '@/store/filterStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useRecommendation } from '@/hooks/useRecommendation';
import { useTMDbContent } from '@/hooks/useTMDbContent';
import {
  getFranchiseBySlug,
  getFranchiseStats, formatRuntimeDetailed,
} from '@/data/franchises';
import {
  formatRuntime, formatYear, cn,
} from '@/lib/utils';
import { sortWatchOrdersByReleaseDate } from '@/lib/releaseOrdering';
import { isTheatricallyUpcoming } from '@/lib/upcomingUtils';
import type { WatchOrder, OrderType } from '@/types';
import { SafeImage } from '@/components/ui/SafeImage';

export default function FranchisePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<OrderType>('release');
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const franchise = getFranchiseBySlug(slug || '');
  const { watchOrders, franchiseHeader, loading, error, refetch } = useTMDbContent(franchise?.id || '');
  const stats = franchise ? getFranchiseStats(franchise.id) : null;
  const { resetFilters, hasActiveFilters } = useFilterStore();

  const { user } = useAuthStore();
  const { isWatched, toggleWatched } = useWatchStore();
  const { filters } = useFilterStore();
  const { spoilerFreeMode } = useSettingsStore();
  const { nextItem, reason } = useRecommendation(watchOrders, activeTab);

  const tabs = [
    {
      id: 'release' as const,
      label: 'Release Order',
      icon: <Calendar className="w-4 h-4" />,
      tooltipHeader: '🎬 Release Order',
      description: 'Watch in the order the movies and series were originally released.',
    },
    {
      id: 'chronological' as const,
      label: 'Chronological Order',
      icon: <Clock className="w-4 h-4" />,
      tooltipHeader: '📅 Chronological Order',
      description: 'Watch according to the timeline of events within the story universe.',
    },
  ];

  const filteredOrders = useMemo(() => {
    if (!franchise) return [];
    let orders = watchOrders
      .filter((o) => o.order_type === activeTab && o.franchise_id === franchise.id && o.content?.franchise_id === franchise.id);

    if (activeTab === 'release') {
      orders = sortWatchOrdersByReleaseDate(orders);
    } else {
      orders = orders.sort((a, b) => a.position - b.position);
    }

    if (filters.types.length > 0) {
      orders = orders.filter((o) => o.content && filters.types.includes(o.content.type));
    }
    if (filters.canon === 'canon') {
      orders = orders.filter((o) => o.content?.is_canon);
    } else if (filters.canon === 'non-canon') {
      orders = orders.filter((o) => o.content && !o.content.is_canon);
    }
    if (filters.required === 'required') {
      orders = orders.filter((o) => o.content?.is_required);
    } else if (filters.required === 'optional') {
      orders = orders.filter((o) => o.content && !o.content.is_required);
    }

    return orders;
  }, [watchOrders, activeTab, filters]);

  const watchedCount = filteredOrders.filter((o) => o.content && isWatched(o.content_id)).length;
  const watchedSet = new Set(filteredOrders.filter((o) => o.content && isWatched(o.content_id)).map((o) => o.content_id));
  const totalRuntime = filteredOrders.reduce((sum, o) => sum + (o.content?.runtime || 0), 0);
  const watchedRuntime = filteredOrders
    .filter((o) => o.content && isWatched(o.content_id))
    .reduce((sum, o) => sum + (o.content?.runtime || 0), 0);

  if (!franchise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Franchise Not Found</h1>
          <p className="text-muted mb-6">The franchise you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const displayMoviesCount = stats ? stats.movies : franchise.total_movies;
  const displaySeriesCount = stats ? stats.series : franchise.total_series;
  const displayRuntime = stats ? stats.totalRuntime : franchise.total_runtime;
  const rt = formatRuntimeDetailed(displayRuntime);

  return (
    <>
      <Helmet>
        <title>{franchise.name} Watch Order — CineOrder</title>
        <meta name="description" content={`Find the perfect watch order for ${franchise.name}. ${franchise.description.slice(0, 155)}`} />
        <meta property="og:title" content={`${franchise.name} Watch Order — CineOrder`} />
        <meta property="og:image" content={franchiseHeader.banner_url || franchise.banner_url} />
      </Helmet>

      {/* ─── Banner ────────────────────────────────────────────── */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <SafeImage
          src={franchiseHeader.banner_url || franchise.banner_url}
          alt={franchise.name}
          fallbackSrc="/placeholder-backdrop.svg"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-8">
          <div className="flex gap-6 items-end">
            <div className="hidden sm:block w-36 md:w-44 rounded-xl shadow-2xl border border-white/10 overflow-hidden">
              <SafeImage
                src={franchiseHeader.poster_url || franchise.poster_url}
                alt={franchise.name}
                fallbackSrc="/placeholder-poster.svg"
                className="w-full h-full object-cover"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="pb-2"
            >
              <h1 className="text-3xl md:text-5xl font-black mb-3">{franchise.name}</h1>
              <p className="text-muted-light text-sm md:text-base max-w-2xl line-clamp-3 mb-4">
                {franchise.description}
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-4">
                <Stat icon={<Film className="w-4 h-4" />} label={`${displayMoviesCount} Movies`} />
                {displaySeriesCount > 0 && (
                  <Stat icon={<Tv className="w-4 h-4" />} label={`${displaySeriesCount} Series`} />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Total Watch Time Card ──────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/90 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-wrap items-center gap-4 sm:gap-6"
        >
          {/* Total Runtime */}
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Total Runtime</p>
              <p className="text-xl font-bold">
                {rt.days > 0 && <span>{rt.days} <span className="text-sm text-muted font-normal">days</span> </span>}
                {rt.hours > 0 && <span>{rt.hours} <span className="text-sm text-muted font-normal">hours</span> </span>}
                {rt.minutes > 0 && <span>{rt.minutes} <span className="text-sm text-muted font-normal">min</span></span>}
              </p>
            </div>
          </div>

          {/* Content breakdown */}
          <div className="flex flex-wrap gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{displayMoviesCount}</p>
              <p className="text-xs text-muted">Movies</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{displaySeriesCount}</p>
              <p className="text-xs text-muted">Series</p>
            </div>
            {stats && stats.specials > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.specials}</p>
                <p className="text-xs text-muted">Specials</p>
              </div>
            )}
            {stats && stats.games > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.games}</p>
                <p className="text-xs text-muted">Games</p>
              </div>
            )}
            {stats && stats.books > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.books}</p>
                <p className="text-xs text-muted">Books</p>
              </div>
            )}
            {stats && stats.comics > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.comics}</p>
                <p className="text-xs text-muted">Comics</p>
              </div>
            )}
            {stats && stats.podcasts > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.podcasts}</p>
                <p className="text-xs text-muted">Podcasts</p>
              </div>
            )}
            {stats && (
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-2xl font-bold">{stats.averageRating}</span>
                </div>
                <p className="text-xs text-muted">Avg Rating</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ─── Content Area ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Smart Recommendation */}
        {user && nextItem && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-card to-card border border-primary/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Play className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-primary font-semibold uppercase tracking-wider">What should you watch next?</p>
                <p className="text-white text-lg font-bold truncate">{nextItem.title}</p>
                <p className="text-sm text-muted-light mt-0.5">
                  <span className="text-primary">Why?</span> {reason}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate(`/movie/${nextItem.id}`)}
                className="flex-shrink-0"
              >
                View Details
              </Button>
            </div>
          </motion.div>
        )}

        {/* Enhanced Progress Bar */}
        {filteredOrders.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-light">
                <span className="text-white font-bold text-lg">{watchedCount}</span>
                <span className="text-muted"> / {filteredOrders.length}</span>
                <span className="text-muted"> watched</span>
              </span>
              <span className="text-sm text-muted">
                {watchedRuntime > 0 && (
                  <>
                    <span className="text-white font-medium">{formatRuntime(watchedRuntime)}</span>
                    <span> of {formatRuntime(totalRuntime)}</span>
                  </>
                )}
              </span>
            </div>
            <ProgressBar
              value={watchedCount}
              max={filteredOrders.length}
              size="md"
              showLabel={false}
            />
          </div>
        )}

        {/* Tabs + View Toggle */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex-1 overflow-x-auto">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as OrderType)} />
          </div>

          <div className="flex gap-1 bg-surface rounded-lg p-1 flex-shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-1.5 rounded text-xs font-medium transition-colors',
                viewMode === 'list' ? 'bg-primary text-white' : 'text-muted hover:text-white'
              )}
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={cn(
                'px-3 py-1.5 rounded text-xs font-medium transition-colors',
                viewMode === 'timeline' ? 'bg-primary text-white' : 'text-muted hover:text-white'
              )}
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content View with Loading / Error / Filtered handling */}
        {loading && watchOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted text-sm font-medium">Loading franchise titles...</p>
          </div>
        ) : !loading && error && watchOrders.length === 0 ? (
          <div className="text-center py-16 bg-card/50 rounded-2xl border border-red-500/20 p-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Failed to load franchise content</h3>
            <p className="text-muted text-sm mb-6 max-w-md mx-auto">{error}</p>
            <Button onClick={refetch} leftIcon={<RefreshCw className="w-4 h-4" />}>
              Try Again
            </Button>
          </div>
        ) : viewMode === 'timeline' ? (
          <InteractiveTimeline
            orders={filteredOrders}
            watchedIds={watchedSet}
            onToggleWatched={(id) => toggleWatched(id)}
          />
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-card/40 rounded-2xl border border-white/5 p-8">
                <Info className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-muted text-lg mb-4">No items match your current filters.</p>
                {hasActiveFilters() && (
                  <Button variant="secondary" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                )}
              </div>
            ) : (
              filteredOrders.map((order, index) => (
                <WatchOrderItem
                  key={order.id}
                  order={order}
                  index={index}
                  isWatched={order.content ? isWatched(order.content_id) : false}
                  onToggleWatched={() => {
                    if (order.content) {
                      toggleWatched(order.content_id);
                    }
                  }}
                  onViewDetails={() => navigate(`/movie/${order.content_id}`)}
                  isLoggedIn={true}
                  spoilerFree={spoilerFreeMode && !isWatched(order.content_id)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Stat Pill ──────────────────────────────────────────────

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-light">
      {icon}
      <span>{label}</span>
    </div>
  );
}

// ─── Watch Order Item ───────────────────────────────────────

function WatchOrderItem({
  order,
  index,
  isWatched: watched,
  onToggleWatched,
  onViewDetails,
  isLoggedIn,
  spoilerFree,
}: {
  order: WatchOrder;
  index: number;
  isWatched: boolean;
  onToggleWatched: () => void;
  onViewDetails: () => void;
  isLoggedIn: boolean;
  spoilerFree: boolean;
}) {
  const content = order.content;
  if (!content) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'flex gap-4 p-4 rounded-xl border transition-all duration-200 group cursor-pointer',
        watched
          ? 'bg-surface/50 border-green-500/20'
          : 'bg-card border-white/5 hover:border-white/10'
      )}
      onClick={onViewDetails}
    >
      {/* Position Number */}
      <div className="flex items-center justify-center w-8 text-2xl font-black text-muted/30 flex-shrink-0">
        {order.position}
      </div>

      {/* Poster */}
      <div className="relative w-16 sm:w-20 flex-shrink-0">
        <SafeImage
          src={content.poster_url}
          alt={content.title}
          fallbackSrc="/placeholder-poster.svg"
          loading="lazy"
          className={cn(
            'w-full aspect-[2/3] object-cover rounded-lg',
            watched && 'opacity-60'
          )}
        />
        {watched && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
            <Check className="w-6 h-6 text-green-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-start gap-2 mb-1">
          <h3 className={cn(
            'font-semibold text-sm sm:text-base truncate',
            watched ? 'text-muted-light' : 'text-white'
          )}>
            {content.title}
          </h3>
          <Badge contentType={content.type} className="flex-shrink-0" />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted mb-2">
          <span>{formatYear(content.release_date)}</span>
          {content.runtime > 0 && <span>{formatRuntime(content.runtime)}</span>}
          {content.season_count && <span>{content.season_count} Season{content.season_count > 1 ? 's' : ''}</span>}
          {content.episode_count && <span>{content.episode_count} Episodes</span>}
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            {content.rating.toFixed(1)}
          </span>
        </div>

        <p className={cn(
          'text-xs text-muted line-clamp-2',
          spoilerFree && 'blur-sm select-none'
        )}>
          {content.overview}
        </p>

        {/* Streaming Providers */}
        {content.streaming_providers && content.streaming_providers.length > 0 && (
          <div className="mt-2">
            <StreamingDots providers={content.streaming_providers} />
          </div>
        )}

        {order.notes && (
          <p className="text-xs text-primary/70 mt-1.5 italic">💡 {order.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="hidden sm:flex flex-col gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {isLoggedIn && (
          isTheatricallyUpcoming(content) ? (
            <button
              disabled
              className="p-2 rounded-lg bg-white/5 text-muted/30 cursor-not-allowed border border-white/5"
              title="Not yet released — cannot be marked as watched"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onToggleWatched}
              className={cn(
                'p-2 rounded-lg transition-colors',
                watched
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
              )}
              title={watched ? 'Mark as unwatched' : 'Mark as watched'}
            >
              {watched ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}
