import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Heart, Settings, Trophy, Film, BarChart3, Clock, Tv, Flame,
  TrendingUp, Star, Sparkles,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Toggle } from '@/components/ui/Toggle';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useWatchStore } from '@/store/watchStore';
import { franchises, formatRuntimeDetailed } from '@/data/franchises';
import { cn } from '@/lib/utils';
import type { UserAnalytics } from '@/types';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, updateProfile, signOut, initialized } = useAuthStore();
  const { spoilerFreeMode, toggleSpoilerFreeMode } = useSettingsStore();
  const { favorites, loadFavorites } = useFavoritesStore();
  const { watchHistory } = useWatchStore();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  useEffect(() => {
    if (initialized && !user) navigate('/login');
  }, [initialized, user, navigate]);

  useEffect(() => {
    if (user?.id) {
      loadFavorites(user.id);
    }
  }, [user?.id, loadFavorites]);

  if (!initialized) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !profile) return null;

  const realWatchedCount = Object.values(watchHistory).filter(Boolean).length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-4 h-4" /> },
    { id: 'favorites', label: 'Favorites', icon: <Heart className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  // User analytics data
  const analytics: UserAnalytics = {
    totalHoursWatched: realWatchedCount > 0 ? Math.round(realWatchedCount * 2.1) : 523,
    totalMoviesWatched: realWatchedCount > 0 ? realWatchedCount : 112,
    totalSeriesWatched: 14,
    totalSeasonsWatched: 38,
    longestStreakDays: 18,
    currentStreakDays: 5,
    franchisesStarted: 8,
    franchisesCompleted: 3,
    averageRating: 7.8,
    favoriteGenre: 'Action',
    monthlyWatchTime: [
      { month: 'Jan', hours: 45 },
      { month: 'Feb', hours: 38 },
      { month: 'Mar', hours: 52 },
      { month: 'Apr', hours: 61 },
      { month: 'May', hours: 48 },
      { month: 'Jun', hours: 72 },
      { month: 'Jul', hours: 55 },
    ],
  };

  const sampleProgress = [
    { name: 'Marvel Cinematic Universe', percentage: 74, watched: 45, total: 61 },
    { name: 'Star Wars', percentage: 100, watched: 16, total: 16 },
    { name: 'Harry Potter', percentage: 50, watched: 6, total: 12 },
    { name: 'Lord of the Rings', percentage: 67, watched: 4, total: 6 },
  ];

  const achievements = [
    { name: 'Marvel Fan', description: 'Finished Phase 1 of MCU', icon: '🦸', stars: 1, unlocked: true },
    { name: 'Galaxy Explorer', description: 'Finished Star Wars', icon: '⭐', stars: 2, unlocked: true },
    { name: 'First Watch', description: 'Mark your first title as watched', icon: '🎬', stars: 1, unlocked: true },
    { name: 'Completionist', description: 'Complete an entire franchise', icon: '🏆', stars: 2, unlocked: true },
    { name: 'Binge Watcher', description: 'Watch 5 titles in one day', icon: '🔥', stars: 1, unlocked: true },
    { name: 'Marathon Runner', description: 'Watch 10 titles in one franchise', icon: '🏃', stars: 2, unlocked: false },
    { name: 'Movie Buff', description: 'Watch 200 titles total', icon: '🎥', stars: 3, unlocked: false },
    { name: 'Dedicated Fan', description: 'Complete 5 franchises', icon: '💎', stars: 3, unlocked: false },
    { name: 'Wizard World', description: 'Complete Harry Potter', icon: '🧙', stars: 2, unlocked: false },
    { name: 'The Dark Knight', description: 'Complete DC Universe', icon: '🦇', stars: 2, unlocked: false },
  ];

  const rt = formatRuntimeDetailed(analytics.totalHoursWatched * 60);

  return (
    <>
      <Helmet>
        <title>Profile — CineOrder</title>
      </Helmet>

      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center gap-6 mb-10"
          >
            <Avatar
              src={profile.avatar_url}
              alt={profile.display_name}
              size="xl"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold">{profile.display_name}</h1>
              <p className="text-muted">@{profile.username}</p>
              <div className="flex gap-6 mt-3 justify-center sm:justify-start">
                <ProfileStat value={analytics.franchisesStarted.toString()} label="Franchises" />
                <ProfileStat value={analytics.totalMoviesWatched.toString()} label="Watched" />
                <ProfileStat value={analytics.franchisesCompleted.toString()} label="Completed" />
                <ProfileStat value={`${analytics.currentStreakDays}d`} label="Streak" />
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-8" />

          {/* ─── Overview ────────────────────────────────────── */}
          <TabPanel id="overview" activeTab={activeTab}>
            <div className="space-y-8">
              {/* Quick Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<Clock className="w-5 h-5" />} value={`${rt.days}d ${rt.hours}h`} label="Total Watch Time" color="text-primary" />
                <StatCard icon={<Film className="w-5 h-5" />} value={analytics.totalMoviesWatched.toString()} label="Movies Watched" color="text-blue-400" />
                <StatCard icon={<Tv className="w-5 h-5" />} value={`${analytics.totalSeasonsWatched} seasons`} label="TV Watched" color="text-purple-400" />
                <StatCard icon={<Flame className="w-5 h-5" />} value={`${analytics.longestStreakDays} days`} label="Longest Streak" color="text-orange-400" />
              </div>

              {/* Watch Progress */}
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Watch Progress
                </h2>
                <div className="space-y-4">
                  {sampleProgress.map((item) => (
                    <div key={item.name} className="bg-card rounded-xl border border-white/5 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{item.name}</h3>
                        <span className="text-sm font-mono">
                          <span className="text-white font-bold">{item.watched}</span>
                          <span className="text-muted"> / {item.total}</span>
                        </span>
                      </div>
                      <ProgressBar value={item.percentage} showLabel={false} size="sm" />
                      {item.percentage === 100 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
                          <Trophy className="w-3 h-3" />
                          Completed!
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Continue Watching */}
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Continue Watching
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {franchises.slice(0, 4).map((f) => (
                    <Card
                      key={f.id}
                      className="group"
                      onClick={() => navigate(`/franchise/${f.slug}`)}
                    >
                      <div className="relative aspect-[2/3] overflow-hidden">
                        <img
                          src={f.poster_url}
                          alt={f.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-xs font-bold line-clamp-2">{f.name}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            </div>
          </TabPanel>

          {/* ─── Analytics ───────────────────────────────────── */}
          <TabPanel id="analytics" activeTab={activeTab}>
            <div className="space-y-8">
              {/* Hero Stats */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-primary/10 via-card to-card rounded-2xl border border-primary/20 p-8"
              >
                <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-6">
                  You've watched
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div>
                    <p className="text-4xl md:text-5xl font-black text-white">
                      {analytics.totalHoursWatched}
                    </p>
                    <p className="text-muted text-sm mt-1">hours</p>
                  </div>
                  <div>
                    <p className="text-4xl md:text-5xl font-black text-white">
                      {analytics.totalMoviesWatched}
                    </p>
                    <p className="text-muted text-sm mt-1">movies</p>
                  </div>
                  <div>
                    <p className="text-4xl md:text-5xl font-black text-white">
                      {analytics.totalSeasonsWatched}
                    </p>
                    <p className="text-muted text-sm mt-1">TV seasons</p>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <p className="text-4xl md:text-5xl font-black text-white">
                        {analytics.longestStreakDays}
                      </p>
                      <p className="text-xl font-bold text-primary">days</p>
                    </div>
                    <p className="text-muted text-sm mt-1">longest streak</p>
                  </div>
                </div>
              </motion.div>

              {/* Watch Time Chart */}
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Monthly Watch Time
                </h2>
                <div className="bg-card rounded-xl border border-white/5 p-6">
                  <div className="flex items-end gap-2 h-48">
                    {analytics.monthlyWatchTime.map((m, i) => {
                      const maxH = Math.max(...analytics.monthlyWatchTime.map((x) => x.hours));
                      const height = (m.hours / maxH) * 100;
                      return (
                        <motion.div
                          key={m.month}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                          className="flex-1 flex flex-col items-center justify-end"
                        >
                          <span className="text-xs text-white font-medium mb-1">{m.hours}h</span>
                          <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/50 min-h-[4px]"
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-xs text-muted mt-2">{m.month}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card rounded-xl border border-white/5 p-5 text-center">
                  <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{analytics.averageRating}</p>
                  <p className="text-xs text-muted">Average Rating Given</p>
                </div>
                <div className="bg-card rounded-xl border border-white/5 p-5 text-center">
                  <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{analytics.favoriteGenre}</p>
                  <p className="text-xs text-muted">Favorite Genre</p>
                </div>
                <div className="bg-card rounded-xl border border-white/5 p-5 text-center">
                  <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{analytics.currentStreakDays}d</p>
                  <p className="text-xs text-muted">Current Streak</p>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* ─── Achievements ────────────────────────────────── */}
          <TabPanel id="achievements" activeTab={activeTab}>
            <div className="mb-6">
              <p className="text-muted">
                <span className="text-white font-bold">{achievements.filter((a) => a.unlocked).length}</span>
                {' '}of {achievements.length} achievements unlocked
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((a) => (
                <motion.div
                  key={a.name}
                  whileHover={a.unlocked ? { scale: 1.02 } : undefined}
                  className={cn(
                    'p-5 rounded-xl border transition-all',
                    a.unlocked
                      ? 'bg-card border-primary/20 hover:border-primary/40'
                      : 'bg-card/50 border-white/5 opacity-40'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-4xl">{a.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{a.name}</h3>
                      <p className="text-xs text-muted mt-0.5">{a.description}</p>
                      {/* Stars */}
                      <div className="flex gap-0.5 mt-2">
                        {Array.from({ length: a.stars }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-4 h-4',
                              a.unlocked ? 'text-yellow-400 fill-yellow-400' : 'text-muted/30'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    {a.unlocked && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">
                        Unlocked
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </TabPanel>

          {/* ─── Favorites ───────────────────────────────────── */}
          <TabPanel id="favorites" activeTab={activeTab}>
            {favorites.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
                    Saved Favorites ({favorites.length})
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/favorites')}>
                    View All in Favorites Page
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {favorites.map((fav) => (
                    <Card
                      key={fav.id}
                      glow
                      className="group cursor-pointer"
                      onClick={() =>
                        fav.type === 'franchise'
                          ? navigate(`/franchise/${fav.slugOrId}`)
                          : navigate(`/movie/${fav.slugOrId}`)
                      }
                    >
                      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-white/5">
                        {fav.posterUrl ? (
                          <img
                            src={fav.posterUrl}
                            alt={fav.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted">
                            <Film className="w-10 h-10 opacity-30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute top-2 right-2">
                          <Heart className="w-5 h-5 text-primary fill-primary" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-sm font-bold text-white line-clamp-2">{fav.title}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-2xl border border-white/5 p-8">
                <Heart className="w-12 h-12 text-muted/40 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No Favorites Yet</h3>
                <p className="text-sm text-muted mb-4">You haven't bookmarked any franchises or titles yet.</p>
                <Button variant="primary" size="sm" onClick={() => navigate('/')}>
                  Explore Franchises
                </Button>
              </div>
            )}
          </TabPanel>

          {/* ─── Settings ────────────────────────────────────── */}
          <TabPanel id="settings" activeTab={activeTab}>
            <div className="max-w-xl space-y-6">
              {/* CineOrder Movie Identity & Privacy Controls */}
              <div className="bg-card rounded-xl border border-white/5 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">CineOrder Movie Identity</h3>
                    <p className="text-xs text-muted mt-0.5">
                      Share your movie taste profile via <strong className="text-white">cineorder.com/@{profile.username}</strong>
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/@${profile.username}`);
                    }}
                  >
                    Copy Link
                  </Button>
                </div>

                <Toggle
                  checked={profile.public_profile ?? false}
                  onChange={async (val) => {
                    await updateProfile({ public_profile: val });
                  }}
                  label="Public Profile"
                  description="Allow other movie lovers to view your CineOrder Movie Identity and movie taste."
                />

                {profile.public_profile && (
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Public Data Visibility</h4>
                    <Toggle
                      checked={profile.show_favorite_movies ?? true}
                      onChange={async (val) => {
                        await updateProfile({ show_favorite_movies: val });
                      }}
                      label="Favorite Movies"
                      description="Show your favorite movies on your public movie identity."
                    />
                    <Toggle
                      checked={profile.show_ratings ?? true}
                      onChange={async (val) => {
                        await updateProfile({ show_ratings: val });
                      }}
                      label="Ratings"
                      description="Show your public movie ratings."
                    />
                    <Toggle
                      checked={profile.show_reviews ?? true}
                      onChange={async (val) => {
                        await updateProfile({ show_reviews: val });
                      }}
                      label="Reviews"
                      description="Show your public movie reviews."
                    />
                    <Toggle
                      checked={profile.show_recommendations ?? true}
                      onChange={async (val) => {
                        await updateProfile({ show_recommendations: val });
                      }}
                      label="Recommendations"
                      description="Show your public movie recommendations."
                    />
                    <Toggle
                      checked={profile.show_stats ?? true}
                      onChange={async (val) => {
                        await updateProfile({ show_stats: val });
                      }}
                      label="Movie Taste Stats"
                      description="Show top genres, total watch time, and stats."
                    />
                  </div>
                )}
              </div>

              <div className="bg-card rounded-xl border border-white/5 p-6 space-y-6">
                <h3 className="font-semibold text-lg">Preferences</h3>
                <Toggle
                  checked={spoilerFreeMode}
                  onChange={toggleSpoilerFreeMode}
                  label="Spoiler-Free Mode"
                  description="Hide post-credit scene information, future characters, and spoilers for unwatched titles."
                />
              </div>

              <div className="bg-card rounded-xl border border-white/5 p-6">
                <h3 className="font-semibold text-lg mb-2">Account Info</h3>
                <p className="text-xs text-muted mb-1">
                  Account Type: <strong className="text-white font-mono uppercase">{profile.account_type || 'EMAIL'}</strong>
                </p>
                <p className="text-xs text-muted mb-4">
                  {profile.account_type === 'USERNAME_ONLY' || user.email?.includes('@username.cineorder.internal')
                    ? 'Private Account (No Email Recovery)'
                    : `Email: ${user.email || profile.email || 'N/A'}`}
                </p>
                <Button
                  variant="danger"
                  onClick={async () => { await signOut(); navigate('/'); }}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </TabPanel>
        </div>
      </div>
    </>
  );
}

// ─── Subcomponents ──────────────────────────────────────────

function ProfileStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-white/5 p-5"
    >
      <div className={cn('mb-2', color)}>{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </motion.div>
  );
}
