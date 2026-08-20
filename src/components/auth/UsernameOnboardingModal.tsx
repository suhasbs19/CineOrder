import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Check, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { validateUsername } from '@/lib/usernameValidator';
import { checkUsernameAvailability } from '@/lib/authService';
import { Button } from '@/components/ui/Button';

export function UsernameOnboardingModal() {
  const { user, profile, initialized, completeOnboarding, loading } = useAuthStore();
  const [username, setUsername] = useState('');
  const [formatError, setFormatError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Show only if authenticated and profile has no username
  const shouldShow = initialized && !!user && (!profile || !profile.username);

  // Debounced format & availability check
  useEffect(() => {
    if (!username.trim()) {
      setFormatError(null);
      setIsAvailable(null);
      setCheckingAvailability(false);
      return;
    }

    const val = validateUsername(username);
    if (!val.valid) {
      setFormatError(val.error || 'Invalid username');
      setIsAvailable(null);
      setCheckingAvailability(false);
      return;
    }

    setFormatError(null);
    setCheckingAvailability(true);

    const timer = setTimeout(async () => {
      try {
        const available = await checkUsernameAvailability(username);
        setIsAvailable(available);
      } catch {
        setIsAvailable(null);
      } finally {
        setCheckingAvailability(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const val = validateUsername(username);
    if (!val.valid) {
      setSubmitError(val.error || 'Please enter a valid username');
      return;
    }

    if (isAvailable === false) {
      setSubmitError('This username is already taken. Please choose another one.');
      return;
    }

    try {
      await completeOnboarding(username.trim());
    } catch (err: any) {
      console.error('Onboarding failed:', err);
      setSubmitError(err?.message || 'Failed to create username. Please try again.');
    }
  };

  if (!shouldShow) return null;

  const emailDisplay = user?.email || user?.user_metadata?.email || user?.user_metadata?.name || 'Google User';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-card border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary/20 text-primary border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Film className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>One Final Step</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Create Your Username</h2>
            <p className="text-sm text-muted mt-1">
              Choose your unique CineOrder handle to personalize your watch history, favorites, and profile.
            </p>
          </div>

          {/* User Email Indicator */}
          <div className="flex items-center gap-2 p-2.5 bg-white/5 rounded-xl border border-white/10 mb-5 text-xs text-muted">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {emailDisplay.charAt(0).toUpperCase()}
            </div>
            <span className="truncate">Signed in as <strong className="text-white">{emailDisplay}</strong></span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username-input" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-bold text-sm select-none">
                  @
                </span>
                <input
                  id="username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                  placeholder="movielover99"
                  maxLength={24}
                  autoFocus
                  className={`w-full bg-white/5 border rounded-xl py-3 pl-8 pr-10 text-sm text-white placeholder-white/30 focus:outline-none transition-colors ${
                    formatError
                      ? 'border-red-500/50 focus:border-red-500'
                      : isAvailable === true
                      ? 'border-green-500/50 focus:border-green-500'
                      : 'border-white/10 focus:border-primary'
                  }`}
                />

                {/* Status Indicator */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {checkingAvailability && (
                    <Loader2 className="w-4 h-4 text-muted animate-spin" />
                  )}
                  {!checkingAvailability && isAvailable === true && (
                    <Check className="w-4 h-4 text-green-400" />
                  )}
                  {!checkingAvailability && (formatError || isAvailable === false) && (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>

              {/* Status or Error Message */}
              {formatError && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {formatError}
                </p>
              )}
              {!formatError && isAvailable === false && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  Username is already taken. Try another.
                </p>
              )}
              {!formatError && isAvailable === true && (
                <p className="text-xs text-green-400 mt-1.5 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 flex-shrink-0" />
                  @{username} is available!
                </p>
              )}

              <p className="text-[11px] text-muted/70 mt-1">
                3–24 characters: letters, numbers, underscores, and hyphens.
              </p>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={loading || !username.trim() || !!formatError || isAvailable === false || checkingAvailability}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up profile...
                </span>
              ) : (
                'Create Username & Continue'
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
