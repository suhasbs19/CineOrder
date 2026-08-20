import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Star, ChevronLeft, ChevronRight, Play,
  Heart, Eye, CheckCircle, Share2, Film,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StreamingBadges } from '@/components/ui/StreamingBadges';
import { getContentById, getWatchOrders, franchises } from '@/data/franchises';
import { useTMDbContent } from '@/hooks/useTMDbContent';
import { formatRuntime, formatYear, formatDate } from '@/lib/utils';
import { getLifecycleCategory } from '@/lib/metadataRefresh';
import { sortWatchOrdersByReleaseDate } from '@/lib/releaseOrdering';
import { isTheatricallyUpcoming } from '@/lib/upcomingUtils';
import { useAuthStore } from '@/store/authStore';
import { useWatchStore } from '@/store/watchStore';
import { useFavoritesStore } from '@/store/favoritesStore';

import { SafeImage } from '@/components/ui/SafeImage';
import { PreparationGuide } from '@/components/ui/PreparationGuide';

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const staticContent = getContentById(id || '');
  const { content: franchiseItems, watchOrders: remoteWatchOrders } = useTMDbContent(staticContent?.franchise_id || '');
  const content = franchiseItems.find((c) => c.id === staticContent?.id || c.id === id) || staticContent;

  const { user } = useAuthStore();
  const { isWatched, toggleWatched } = useWatchStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const isUpcomingTitle = staticContent ? isTheatricallyUpcoming(staticContent) : (content ? isTheatricallyUpcoming(content) : false);

  // Canonical lifecycle label derived from the STATIC catalog entry.
  // This is the same data source used by PreparationGuide (via executeKnowledgeGraphTraversal → allContent).
  // We deliberately do NOT use the TMDB-enriched `content.status` here because TMDB may return
  // "Released" for titles whose editorial lifecycle state is still UPCOMING (e.g., theatrical_released: false).
  const canonicalStatusLabel = (() => {
    if (!staticContent) return 'Unknown';
    const cat = getLifecycleCategory(staticContent);
    if (cat === 'STREAMING_AVAILABLE') return 'Streaming Available';
    if (cat === 'THEATRICALLY_RELEASED') return 'In Theaters';
    if (cat === 'UPCOMING') {
      const s = staticContent.status;
      if (s === 'in_production') return 'In Production';
      if (s === 'tba' || s === 'planned') return 'Announced';
      return 'Upcoming';
    }
    return 'Announced';
  })();

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Title Not Found</h1>
          <p className="text-muted mb-6">The title you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const franchise = franchises.find((f) => f.id === content.franchise_id);
  const watchOrders = remoteWatchOrders.length > 0 ? remoteWatchOrders : getWatchOrders(content.franchise_id);
  const releaseOrders = sortWatchOrdersByReleaseDate(
    watchOrders.filter((o) => o.order_type === 'release'),
    franchiseItems
  );

  const currentIndex = releaseOrders.findIndex((o) => o.content_id === content.id);
  const prevItem = currentIndex > 0 ? releaseOrders[currentIndex - 1]?.content : null;
  const nextItem = currentIndex < releaseOrders.length - 1 ? releaseOrders[currentIndex + 1]?.content : null;

  const youtubeId = content.trailer_url?.includes('youtube.com')
    ? new URL(content.trailer_url).searchParams.get('v')
    : null;

  return (
    <>
      <Helmet>
        <title>{content.title} — CineOrder</title>
        <meta name="description" content={content.overview.slice(0, 160)} />
        <meta property="og:title" content={`${content.title} — CineOrder`} />
        <meta property="og:image" content={content.backdrop_url || content.poster_url} />
      </Helmet>

      {/* ─── Backdrop Hero ─────────────────────────────────────── */}
      <section className="relative h-[55vh] md:h-[65vh] overflow-hidden">
        <SafeImage
          src={content.backdrop_url || content.poster_url}
          alt={content.title}
          fallbackSrc="/placeholder-backdrop.svg"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-20 left-4 sm:left-8 z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-sm hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-8">
          <div className="flex gap-6 items-end w-full">
            {/* Poster */}
            <div className="hidden md:block w-48 lg:w-56 rounded-xl shadow-2xl border border-white/10 overflow-hidden">
              <SafeImage
                src={content.poster_url}
                alt={content.title}
                fallbackSrc="/placeholder-poster.svg"
                className="w-full h-full object-cover"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 pb-2"
            >
              {franchise && (
                <button
                  onClick={() => navigate(`/franchise/${franchise.slug}`)}
                  className="inline-flex items-center gap-1 text-primary text-sm hover:underline mb-2 font-medium"
                >
                  <Film className="w-3.5 h-3.5" />
                  {franchise.name}
                </button>
              )}

              <h1 className="text-2xl sm:text-5xl lg:text-7xl font-black text-white drop-shadow-2xl mb-3 tracking-tight">
                {content.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-semibold text-muted-light mb-4">
                <span>{formatYear(content.release_date)}</span>
                {content.runtime > 0 && (
                  <>
                    <span className="text-muted">•</span>
                    <span>{formatRuntime(content.runtime)}</span>
                  </>
                )}
                <span className="text-muted">•</span>
                <span className="flex items-center gap-1 text-yellow-400 font-bold">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  {content.rating.toFixed(1)}
                </span>
                <Badge contentType={content.type} className="ml-2" />
                {content.is_canon && (
                  <Badge variant="success">Canon</Badge>
                )}
                {content.is_required && (
                  <Badge variant="primary">Required</Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {youtubeId && (
                  <Button
                    leftIcon={<Play className="w-4 h-4" />}
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank')}
                  >
                    Watch Trailer
                  </Button>
                )}
                {isUpcomingTitle ? (
                  <Button
                    variant="secondary"
                    disabled
                    className="opacity-60 cursor-not-allowed border border-white/10"
                    title="This title has not premiered yet and cannot be marked as watched."
                  >
                    Not Yet Released
                  </Button>
                ) : (
                  <Button
                    variant={isWatched(content.id) ? 'secondary' : 'outline'}
                    leftIcon={isWatched(content.id) ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Eye className="w-4 h-4" />}
                    onClick={() => toggleWatched(content.id)}
                    className={isWatched(content.id) ? 'bg-green-500/20 text-green-400 border border-green-500/30' : ''}
                  >
                    {isWatched(content.id) ? 'Watched' : 'Mark Watched'}
                  </Button>
                )}
                <Button
                  variant={isFavorite(content.id) ? 'secondary' : 'ghost'}
                  size="icon"
                  title={isFavorite(content.id) ? 'Remove from favorites' : 'Add to favorites'}
                  onClick={() =>
                    toggleFavorite(
                      {
                        id: content.id,
                        type: 'movie',
                        title: content.title,
                        posterUrl: content.poster_url,
                        slugOrId: content.id,
                        franchiseId: content.franchise_id,
                        rating: content.rating,
                        year: formatYear(content.release_date),
                      },
                      user?.id
                    )
                  }
                  className={isFavorite(content.id) ? 'text-primary border border-primary/30 bg-primary/20' : ''}
                >
                  <Heart className={`w-5 h-5 ${isFavorite(content.id) ? 'fill-primary text-primary' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Details ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Preparation Guide */}
            <PreparationGuide contentId={content.id} />

            {/* Overview */}
            <section>
              <h2 className="text-xl font-bold mb-3">Overview</h2>
              <p className="text-muted-light leading-relaxed">{content.overview}</p>
            </section>

            {/* Trailer */}
            {youtubeId && (
              <section>
                <h2 className="text-xl font-bold mb-3">Trailer</h2>
                <div className="aspect-video rounded-xl overflow-hidden border border-white/10">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={`${content.title} Trailer`}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </section>
            )}

            {/* Cast */}
            {content.cast.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-3">Cast</h2>
                <div className="scroll-container flex gap-4 pb-2">
                  {content.cast.map((member) => (
                    <div key={member.name} className="flex-shrink-0 w-28 text-center">
                      <img
                        src={member.profile_url}
                        alt={member.name}
                        className="w-20 h-20 rounded-full object-cover mx-auto mb-2 border-2 border-white/10"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1A1A1A&color=E50914&size=80`;
                        }}
                      />
                      <p className="text-xs font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted truncate">{member.character}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-card rounded-xl border border-white/5 p-5 space-y-4">
              <h3 className="font-semibold text-lg">Details</h3>
              <InfoRow label="Director" value={content.director || 'N/A'} />
              <InfoRow label="Release Date" value={formatDate(content.release_date)} />
              <InfoRow label="Runtime" value={content.runtime > 0 ? formatRuntime(content.runtime) : 'N/A'} />
              <InfoRow label="Status" value={canonicalStatusLabel} />
              {content.genres.length > 0 && (
                <div>
                  <p className="text-xs text-muted mb-1.5">Genres</p>
                  <div className="flex flex-wrap gap-1.5">
                    {content.genres.map((genre) => (
                      <Badge key={genre}>{genre}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Streaming Availability */}
            <div className="bg-card rounded-xl border border-white/5 p-5">
              <h3 className="font-semibold text-lg mb-3">Where to Watch</h3>
              {content.streaming_providers && content.streaming_providers.length > 0 ? (
                <StreamingBadges providers={content.streaming_providers} title={content.title} size="md" />
              ) : (
                <p className="text-sm text-muted">Streaming information currently unavailable for this title.</p>
              )}
            </div>
          </div>
        </div>

        {/* ─── Previous / Next Navigation ──────────────────────── */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-between">
          {prevItem ? (
            <button
              onClick={() => navigate(`/movie/${prevItem.id}`)}
              className="flex items-center gap-3 p-4 rounded-xl bg-card border border-white/5 hover:border-white/10 transition-all flex-1 text-left"
            >
              <ChevronLeft className="w-5 h-5 text-muted flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted">Previous</p>
                <p className="text-sm font-medium truncate">{prevItem.title}</p>
              </div>
            </button>
          ) : <div className="flex-1" />}

          {nextItem ? (
            <button
              onClick={() => navigate(`/movie/${nextItem.id}`)}
              className="flex items-center gap-3 p-4 rounded-xl bg-card border border-white/5 hover:border-white/10 transition-all flex-1 text-right justify-end"
            >
              <div className="min-w-0">
                <p className="text-xs text-muted">Next</p>
                <p className="text-sm font-medium truncate">{nextItem.title}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted flex-shrink-0" />
            </button>
          ) : <div className="flex-1" />}
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted mb-0.5">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
