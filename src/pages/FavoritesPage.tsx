import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Heart, Film, Compass, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { franchises } from '@/data/franchises';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { favorites, removeFavorite, loadFavorites } = useFavoritesStore();
  const [filter, setFilter] = useState<'all' | 'franchise' | 'movie'>('all');

  useEffect(() => {
    if (user?.id) {
      loadFavorites(user.id);
    }
  }, [user?.id, loadFavorites]);

  // Merge posters from local franchise registry if posterUrl was empty
  const enrichedFavorites = favorites.map((fav) => {
    if (!fav.posterUrl && fav.type === 'franchise') {
      const match = franchises.find((f) => f.id === fav.id || f.slug === fav.slugOrId);
      if (match) {
        return { ...fav, posterUrl: match.poster_url, title: match.name };
      }
    }
    return fav;
  });

  const filteredItems = enrichedFavorites.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'franchise') return item.type === 'franchise';
    return item.type === 'movie' || item.type === 'series';
  });

  const handleCardClick = (item: typeof favorites[0]) => {
    if (item.type === 'franchise') {
      navigate(`/franchise/${item.slugOrId}`);
    } else {
      navigate(`/movie/${item.slugOrId}`);
    }
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeFavorite(id, user?.id);
  };

  return (
    <>
      <Helmet>
        <title>My Favorites — CineOrder</title>
        <meta name="description" content="Manage and browse your favorite movie franchises and titles." />
      </Helmet>

      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-primary" />
                </div>
                <h1 className="text-3xl font-bold text-white">My Favorites</h1>
              </div>
              <p className="text-sm text-muted">
                Your saved franchises and titles ready for quick access and tracking.
              </p>
            </div>

            {/* Filter Tabs */}
            {enrichedFavorites.length > 0 && (
              <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10 self-start sm:self-auto">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filter === 'all' ? 'bg-primary text-white' : 'text-muted hover:text-white'
                  }`}
                >
                  All ({enrichedFavorites.length})
                </button>
                <button
                  onClick={() => setFilter('franchise')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filter === 'franchise' ? 'bg-primary text-white' : 'text-muted hover:text-white'
                  }`}
                >
                  Franchises ({enrichedFavorites.filter((f) => f.type === 'franchise').length})
                </button>
                <button
                  onClick={() => setFilter('movie')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filter === 'movie' ? 'bg-primary text-white' : 'text-muted hover:text-white'
                  }`}
                >
                  Titles ({enrichedFavorites.filter((f) => f.type !== 'franchise').length})
                </button>
              </div>
            )}
          </motion.div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-white/10 bg-card p-12 text-center max-w-xl mx-auto my-12"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No Favorites Saved Yet</h2>
              <p className="text-sm text-muted mb-6">
                Start building your personalized collection by bookmarking franchises and movies as you explore.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => navigate('/')}
                  leftIcon={<Compass className="w-4 h-4" />}
                >
                  Explore Franchises
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/search')}
                  leftIcon={<Film className="w-4 h-4" />}
                >
                  Search Titles
                </Button>
              </div>
            </motion.div>
          )}

          {/* Grid of Favorites */}
          {filteredItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              <AnimatePresence>
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      glow
                      className="group cursor-pointer h-full flex flex-col overflow-hidden bg-card border-white/10 hover:border-primary/40 transition-all"
                      onClick={() => handleCardClick(item)}
                    >
                      <div className="relative aspect-[2/3] w-full overflow-hidden bg-white/5">
                        {item.posterUrl ? (
                          <img
                            src={item.posterUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted">
                            <Film className="w-12 h-12 opacity-30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                          <Badge variant="default" className="text-[10px] uppercase font-bold py-0.5 px-2 bg-black/60 backdrop-blur-md">
                            {item.type}
                          </Badge>
                          <button
                            type="button"
                            onClick={(e) => handleRemove(e, item.id)}
                            title="Remove from favorites"
                            className="pointer-events-auto w-7 h-7 rounded-full bg-black/70 hover:bg-red-500/80 text-white/80 hover:text-white flex items-center justify-center transition-colors shadow-md backdrop-blur-md"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Bottom Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
