import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, UserX, UserCheck, AlertCircle, Check, X, Loader2, Sparkles, ArrowLeft, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { checkProfileExists, checkUsernameAvailability } from '@/lib/authService';
import { validateUsername } from '@/lib/usernameValidator';
import { Button } from '@/components/ui/Button';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/types';

type CallbackScreenState = 'loading' | 'no_account' | 'account_exists' | 'onboarding' | 'error';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setSessionAndProfile, completeOnboarding } = useAuthStore();

  const [screenState, setScreenState] = useState<CallbackScreenState>('loading');
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [pendingSession, setPendingSession] = useState<Session | null>(null);
  const [existingProfile, setExistingProfile] = useState<Profile | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Username onboarding state
  const [username, setUsername] = useState('');
  const [formatError, setFormatError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [submittingOnboarding, setSubmittingOnboarding] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function evaluateCallback(user: User, session: Session | null) {
      if (!isMounted) return;

      const urlIntent = searchParams.get('intent');
      const storageIntent = typeof window !== 'undefined'
        ? window.sessionStorage.getItem('cineorder_auth_intent')
        : null;
      const intent: 'login' | 'signup' = (urlIntent === 'signup' || storageIntent === 'signup')
        ? 'signup'
        : 'login';

      setPendingUser(user);
      setPendingSession(session);

      try {
        const profile = await checkProfileExists(user.id);

        if (!isMounted) return;

        if (intent === 'login') {
          if (profile && profile.username) {
            // Case 1: Existing user logging in -> Complete login & go Home
            if (typeof window !== 'undefined' && window.sessionStorage) {
              window.sessionStorage.removeItem('cineorder_auth_intent');
            }
            setSessionAndProfile(user, session, profile);
            navigate('/', { replace: true });
          } else {
            // Case 2: New user attempting Login -> No CineOrder account found
            setScreenState('no_account');
          }
        } else {
          // intent === 'signup'
          if (profile && profile.username) {
            // Case 4: Existing user attempting Sign Up -> Account already exists
            setExistingProfile(profile);
            setScreenState('account_exists');
          } else {
            // Case 3: New user signing up -> Start Username Onboarding
            setScreenState('onboarding');
          }
        }
      } catch (err: any) {
        console.error('Profile evaluation error:', err);
        if (isMounted) {
          setErrorMsg(err?.message || 'Failed to verify account profile.');
          setScreenState('error');
        }
      }
    }

    async function handleAuthCallback() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data?.session?.user) {
          await evaluateCallback(data.session.user, data.session);
          return;
        }

        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (session?.user && isMounted) {
              authListener.subscription.unsubscribe();
              await evaluateCallback(session.user, session);
            }
          }
        );

        // Fallback timeout if no session arrives
        setTimeout(() => {
          if (isMounted && screenState === 'loading') {
            setErrorMsg('Authentication session timeout. Please sign in again.');
            setScreenState('error');
          }
        }, 5000);
      } catch (err: any) {
        console.error('OAuth callback processing error:', err);
        if (isMounted) {
          setErrorMsg(err?.message || 'Authentication callback failed.');
          setScreenState('error');
        }
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, searchParams, setSessionAndProfile, screenState]);

  // Real-time username format & availability check during onboarding
  useEffect(() => {
    if (screenState !== 'onboarding') return;

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
  }, [username, screenState]);

  // Handle Action: Back to Login (signs out temporary Supabase session)
  const handleBackToLogin = async () => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem('cineorder_auth_intent');
      }
      await supabase.auth.signOut();
    } catch {
      // Ignore offline sign out error
    }
    navigate('/login', { replace: true });
  };

  // Handle Action: Switch from 'no_account' to 'onboarding' (Case 5)
  const handleProceedToCreateAccount = () => {
    setSubmitError(null);
    setScreenState('onboarding');
  };

  // Handle Action: Sign in from 'account_exists' (Case 4)
  const handleSignInExisting = () => {
    if (pendingUser && existingProfile) {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem('cineorder_auth_intent');
      }
      setSessionAndProfile(pendingUser, pendingSession, existingProfile);
      navigate('/', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  // Handle Onboarding Username Submission
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
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

    if (!pendingUser) {
      setSubmitError('Session expired. Please try signing in again.');
      return;
    }

    setSubmittingOnboarding(true);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem('cineorder_auth_intent');
      }
      await completeOnboarding(username.trim(), pendingUser);
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Onboarding registration error:', err);
      setSubmitError(err?.message || 'Failed to create CineOrder profile.');
    } finally {
      setSubmittingOnboarding(false);
    }
  };

  const emailDisplay = pendingUser?.email || pendingUser?.user_metadata?.email || pendingUser?.user_metadata?.name || 'Google Account';

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <AnimatePresence mode="wait">
        {/* State 1: Loading */}
        {screenState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="text-center space-y-4"
          >
            <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <h2 className="text-lg font-bold text-white">Verifying Google Authentication</h2>
              <p className="text-sm text-muted mt-1">Connecting your CineOrder identity...</p>
            </div>
          </motion.div>
        )}

        {/* State 2: No Account Found (Login Flow with No Profile) */}
        {screenState === 'no_account' && (
          <motion.div
            key="no_account"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-md bg-card border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserX className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-white">No account found</h1>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                There is no CineOrder account associated with this Google account. Create a new account to continue.
              </p>
            </div>

            {/* Email Identifier Pill */}
            <div className="flex items-center gap-2.5 p-3 bg-white/5 rounded-xl border border-white/10 mb-6 text-xs text-muted">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-[10px]">
                {emailDisplay.charAt(0).toUpperCase()}
              </div>
              <span className="truncate">Google: <strong className="text-white">{emailDisplay}</strong></span>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleProceedToCreateAccount}
              >
                Create Account
              </Button>

              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={handleBackToLogin}
              >
                Back to Login
              </Button>
            </div>
          </motion.div>
        )}

        {/* State 3: Account Already Exists (Sign-up Flow with Existing Profile) */}
        {screenState === 'account_exists' && (
          <motion.div
            key="account_exists"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-md bg-card border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-primary/20 text-primary border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-white">Account already exists</h1>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                A CineOrder account already exists for this Google account. Sign in instead.
              </p>
            </div>

            {/* Profile Info */}
            <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 mb-6 space-y-1 text-xs">
              <div className="flex items-center justify-between text-muted">
                <span>CineOrder Handle:</span>
                <span className="font-semibold text-primary">@{existingProfile?.username}</span>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span>Google Account:</span>
                <span className="text-white truncate max-w-[200px]">{emailDisplay}</span>
              </div>
            </div>

            {/* Action */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              leftIcon={<LogIn className="w-4 h-4" />}
              onClick={handleSignInExisting}
            >
              Sign In
            </Button>
          </motion.div>
        )}

        {/* State 4: Username Onboarding (New User Sign-up or Converted Case 5) */}
        {screenState === 'onboarding' && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-md bg-card border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary/20 text-primary border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Film className="w-6 h-6" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted mb-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Create Your Profile</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Choose Your Username</h2>
              <p className="text-sm text-muted mt-1">
                Choose your unique CineOrder handle to track watch orders, save favorites, and share your profile.
              </p>
            </div>

            {/* Email Identifier Pill */}
            <div className="flex items-center gap-2 p-2.5 bg-white/5 rounded-xl border border-white/10 mb-5 text-xs text-muted">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {emailDisplay.charAt(0).toUpperCase()}
              </div>
              <span className="truncate">Signed in as <strong className="text-white">{emailDisplay}</strong></span>
            </div>

            {/* Form */}
            <form onSubmit={handleOnboardingSubmit} className="space-y-4">
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
                disabled={submittingOnboarding || !username.trim() || !!formatError || isAvailable === false || checkingAvailability}
              >
                {submittingOnboarding ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating profile...
                  </span>
                ) : (
                  'Create Username & Continue'
                )}
              </Button>
            </form>
          </motion.div>
        )}

        {/* State 5: Error */}
        {screenState === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-card border border-red-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-4"
          >
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Authentication Error</h2>
            <p className="text-sm text-muted">{errorMsg || 'Failed to complete authentication.'}</p>
            <Button
              variant="secondary"
              className="w-full mt-4"
              onClick={handleBackToLogin}
            >
              Return to Login
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
