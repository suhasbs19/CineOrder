import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Lock, Film, Sparkles, Heart, ArrowLeft, Share2, Check } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { fetchPublicProfileByUsername } from '@/lib/authService';
import type { PublicProfileData } from '@/types';

export default function PublicProfilePage() {
  const { username: rawUsername } = useParams<{ username: string }>();
  const cleanUsername = (rawUsername || '').replace(/^@/, '');

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<PublicProfileData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (cleanUsername) {
        const data = await fetchPublicProfileByUsername(cleanUsername);
        setProfileData(data);
      } else {
        setProfileData(null);
      }
      setLoading(false);
    }
    load();
  }, [cleanUsername]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <>
        <Helmet>
          <title>Private Profile — CineOrder</title>
        </Helmet>
        <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-card p-8 rounded-2xl border border-white/10 text-center shadow-xl"
          >
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Lock className="w-8 h-8 text-muted" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Movie Identity Private</h1>
            <p className="text-muted text-sm mb-6">
              The CineOrder profile <strong className="text-white">@{cleanUsername}</strong> is private or does not exist.
            </p>
            <Link to="/">
              <Button leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Return to Home
              </Button>
            </Link>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{profileData.display_name} (@{profileData.username}) — CineOrder Movie Identity</title>
      </Helmet>

      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-white/10 p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <Avatar
                  src={profileData.avatar_url}
                  alt={profileData.display_name}
                  size="xl"
                />
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-3xl font-bold">{profileData.display_name}</h1>
                    <span className="text-xs bg-primary/20 text-primary px-2.5 py-0.5 rounded-full font-semibold border border-primary/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Movie Identity
                    </span>
                  </div>
                  <p className="text-muted text-sm font-mono mt-0.5">@{profileData.username}</p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4">
                    {profileData.privacy.show_stats && profileData.stats && (
                      <>
                        <div className="text-xs text-muted">
                          <strong className="text-white font-bold text-sm block">{profileData.stats.total_watched}</strong>
                          Watched
                        </div>
                        <div className="text-xs text-muted">
                          <strong className="text-white font-bold text-sm block">{profileData.stats.hours_watched}h</strong>
                          Watch Time
                        </div>
                        <div className="text-xs text-muted">
                          <strong className="text-white font-bold text-sm block">{profileData.stats.favorite_genre}</strong>
                          Top Genre
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleShare}
                leftIcon={copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
              >
                {copied ? 'Copied Link!' : 'Share Identity'}
              </Button>
            </div>
          </motion.div>

          {/* Favorite Movies */}
          {profileData.privacy.show_favorite_movies && profileData.favorite_movies && profileData.favorite_movies.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary fill-primary" />
                Favorite Movies & Series
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {profileData.favorite_movies.map((movie) => (
                  <Card key={movie.id} glow className="group">
                    <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
                      <img
                        src={movie.poster_url}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-xs font-bold line-clamp-2 text-white">{movie.title}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Public Ratings */}
          {profileData.privacy.show_ratings && profileData.ratings && profileData.ratings.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Ratings
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profileData.ratings.map((r) => (
                  <div key={r.content_id} className="bg-card p-4 rounded-xl border border-white/5 flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{r.content_id}</span>
                    <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-amber-500/30">
                      ★ {r.rating} / 10
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Public Reviews */}
          {profileData.privacy.show_reviews && profileData.reviews && profileData.reviews.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Film className="w-5 h-5 text-purple-400" />
                Public Reviews
              </h2>
              <div className="space-y-3">
                {profileData.reviews.map((rev) => (
                  <div key={rev.id} className="bg-card p-4 rounded-xl border border-white/5 space-y-1">
                    <p className="text-xs font-bold text-primary">{rev.content_id}</p>
                    <p className="text-sm text-white/90 italic">"{rev.review_text}"</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Public Recommendations */}
          {profileData.privacy.show_recommendations && profileData.recommendations && profileData.recommendations.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-400" />
                Public Recommendations
              </h2>
              <div className="space-y-3">
                {profileData.recommendations.map((rec, i) => (
                  <div key={i} className="bg-card p-4 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{rec.title}</p>
                      <p className="text-xs text-muted mt-0.5">{rec.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Movie Taste & Top Genres */}
          {profileData.privacy.show_stats && profileData.top_genres && profileData.top_genres.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Film className="w-5 h-5 text-blue-400" />
                Movie Taste Profile
              </h2>
              <div className="bg-card rounded-2xl border border-white/5 p-6 flex flex-wrap gap-2">
                {profileData.top_genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white"
                  >
                    🎬 {genre}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
