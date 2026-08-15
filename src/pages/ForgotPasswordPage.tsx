import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Film, Mail, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuthStore();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password — CineOrder</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Film className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">
              {sent ? 'Check Your Email' : 'Email Password Recovery'}
            </h1>
            <p className="text-muted mt-1">
              {sent
                ? `If an Email Account exists for ${email}, a password reset link has been sent.`
                : 'Enter your registered email address to receive a password reset link.'}
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-white/10 p-8 shadow-xl">
            {!sent ? (
              <>
                <div className="mb-6 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    Password recovery is only available for <strong>Email Accounts</strong>. Username-Only (Private) accounts do not have email recovery.
                  </span>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    icon={<Mail className="w-5 h-5" />}
                    required
                  />
                  <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                    Send Reset Link
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-muted mb-4 text-sm">
                  Check your inbox and click the link to reset your password.
                </p>
              </div>
            )}

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted hover:text-white transition-colors mt-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
