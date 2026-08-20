import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Settings, LogOut, Check, Save,
  AlertCircle, Lock, ExternalLink
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Avatar } from '@/components/ui/Avatar';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, signOut, initialized } = useAuthStore();
  const { spoilerFreeMode, toggleSpoilerFreeMode } = useSettingsStore();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [savingName, setSavingName] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && !user) {
      navigate('/login');
    }
  }, [initialized, user, navigate]);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile?.display_name]);

  if (!user || !profile) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSaveDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaveSuccess(false);

    if (!displayName.trim()) {
      setErrorMsg('Display name cannot be empty.');
      return;
    }

    setSavingName(true);
    try {
      await updateProfile({ display_name: displayName.trim() });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update display name.');
    } finally {
      setSavingName(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>Settings — CineOrder</title>
        <meta name="description" content="Manage your CineOrder account preferences, privacy, and identity." />
      </Helmet>

      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold text-white">Account Settings</h1>
            </div>
            <p className="text-sm text-muted">
              Configure your profile identity, privacy controls, and experience preferences.
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* 1. Profile Identity */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-white/10 p-6 shadow-xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <Avatar
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  size="lg"
                />
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {profile.display_name}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-normal">
                      @{profile.username}
                    </span>
                  </h2>
                  <p className="text-xs text-muted mt-0.5">{profile.email || user.email}</p>
                </div>
              </div>

              <form onSubmit={handleSaveDisplayName} className="space-y-4">
                <div>
                  <label htmlFor="display-name-input" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Display Name
                  </label>
                  <div className="flex gap-3">
                    <input
                      id="display-name-input"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      maxLength={50}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={savingName || displayName === profile.display_name}
                      leftIcon={saveSuccess ? <Check className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4" />}
                    >
                      {savingName ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save'}
                    </Button>
                  </div>
                  {errorMsg && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errorMsg}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    CineOrder Handle
                  </label>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 text-sm">
                    <span className="text-white font-mono">@{profile.username}</span>
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Unique ID
                    </span>
                  </div>
                </div>
              </form>
            </motion.div>

            {/* 2. CineOrder Movie Identity & Privacy */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-white/10 p-6 shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-white">Public Profile & Privacy</h3>
                  <p className="text-xs text-muted mt-0.5">
                    Manage how your movie journey appears to other CineOrder users.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/@${profile.username}`)}
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  View Public Profile
                </Button>
              </div>

              <div className="divide-y divide-white/5 space-y-4">
                <div className="pt-2">
                  <Toggle
                    checked={profile.public_profile ?? false}
                    onChange={async (val) => await updateProfile({ public_profile: val })}
                    label="Make Profile Public"
                    description="Allow other users to search for and view your profile."
                  />
                </div>

                <div className="pt-4">
                  <Toggle
                    checked={profile.show_favorite_movies ?? true}
                    onChange={async (val) => await updateProfile({ show_favorite_movies: val })}
                    label="Show Favorite Titles"
                    description="Display your favorited franchises and movies."
                  />
                </div>

                <div className="pt-4">
                  <Toggle
                    checked={profile.show_stats ?? true}
                    onChange={async (val) => await updateProfile({ show_stats: val })}
                    label="Show Watch Statistics"
                    description="Display hours watched and completion milestones."
                  />
                </div>

                <div className="pt-4">
                  <Toggle
                    checked={profile.show_ratings ?? true}
                    onChange={async (val) => await updateProfile({ show_ratings: val })}
                    label="Show Ratings"
                    description="Display movie ratings you've submitted."
                  />
                </div>
              </div>
            </motion.div>

            {/* 3. Viewing Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-white/10 p-6 shadow-xl"
            >
              <h3 className="font-semibold text-lg text-white mb-4">Viewing Preferences</h3>
              <Toggle
                checked={spoilerFreeMode}
                onChange={toggleSpoilerFreeMode}
                label="Spoiler-Free Mode"
                description="Hides plot summaries, twist warnings, and story connections for unreleased/unwatched titles."
              />
            </motion.div>

            {/* 4. Session & Logout */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl border border-white/10 p-6 shadow-xl flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold text-base text-white">Sign Out</h3>
                <p className="text-xs text-muted">End your session on this browser.</p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={handleSignOut}
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Sign Out
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
