import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Film, Mail, Lock, User, Eye, EyeOff, ShieldAlert, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUpEmail, signUpUsernameOnly, signInWithGoogle, loading } = useAuthStore();

  const [accountTypeTab, setAccountTypeTab] = useState<'email' | 'username_only'>('email');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ackAccepted, setAckAccepted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (accountTypeTab === 'username_only' && !ackAccepted) {
      setError('You must acknowledge that this account cannot be recovered if you forget your password.');
      return;
    }

    try {
      if (accountTypeTab === 'email') {
        await signUpEmail(email, password, username);
      } else {
        await signUpUsernameOnly(username, password, ackAccepted);
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md bg-card p-8 rounded-2xl border border-white/10 shadow-xl"
        >
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Account Created!</h1>
          <p className="text-muted mb-6">
            {accountTypeTab === 'email' ? (
              <>
                Your Email Account has been created. Check your email <strong className="text-white">{email}</strong> to verify if needed, then sign in.
              </>
            ) : (
              <>
                Your Username-Only Account <strong className="text-white">@{username}</strong> is ready. Please remember your password carefully as it cannot be recovered.
              </>
            )}
          </p>
          <Button onClick={() => navigate('/login')} className="w-full">
            Go to Login
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Create Account — CineOrder</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Film className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">
                Cine<span className="text-primary">Order</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold">
              {accountTypeTab === 'email' ? 'Create Email Account' : 'Create Private Account'}
            </h1>
            <p className="text-muted mt-1">Start tracking your watch progress</p>
          </div>

          <div className="bg-card rounded-2xl border border-white/10 p-8 shadow-xl">
            {/* Account Type Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setAccountTypeTab('email');
                  setError('');
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
                  accountTypeTab === 'email'
                    ? 'bg-primary text-white shadow'
                    : 'text-muted hover:text-white'
                }`}
              >
                Email Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountTypeTab('username_only');
                  setError('');
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
                  accountTypeTab === 'username_only'
                    ? 'bg-primary text-white shadow'
                    : 'text-muted hover:text-white'
                }`}
              >
                Username-Only Account
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a unique username (e.g. cinelover)"
                icon={<User className="w-5 h-5" />}
                required
              />

              {accountTypeTab === 'email' && (
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  icon={<Mail className="w-5 h-5" />}
                  required
                />
              )}

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  icon={<Lock className="w-5 h-5" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                icon={<Lock className="w-5 h-5" />}
                required
              />

              {accountTypeTab === 'username_only' && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs space-y-3">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <ShieldAlert className="w-4 h-4" />
                    <span>No Email Recovery Available</span>
                  </div>
                  <p>
                    If you forget this password, CineOrder cannot recover this account or its data.
                  </p>
                  <label className="flex items-start gap-2 cursor-pointer pt-1 text-white font-medium">
                    <input
                      type="checkbox"
                      checked={ackAccepted}
                      onChange={(e) => setAckAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 bg-card text-primary focus:ring-primary"
                    />
                    <span>
                      I understand that this account cannot be recovered if I forget my password.
                    </span>
                  </label>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={loading}
                disabled={accountTypeTab === 'username_only' && !ackAccepted}
              >
                {accountTypeTab === 'email' ? 'Create Account' : 'Create Private Account'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted">or continue with</span>
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              size="lg"
              onClick={() => signInWithGoogle('signup')}
              leftIcon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              }
            >
              Google
            </Button>

            <p className="text-center text-sm text-muted mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
