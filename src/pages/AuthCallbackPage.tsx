import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { fetchProfile } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      try {
        // 1. Check if session was already established or parsed by Supabase client
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data?.session?.user) {
          if (isMounted) {
            await fetchProfile(data.session.user.id);
            navigate('/', { replace: true });
          }
          return;
        }

        // 2. Listen for onAuthStateChange if session exchange is in progress
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (session?.user && isMounted) {
              await fetchProfile(session.user.id);
              authListener.subscription.unsubscribe();
              navigate('/', { replace: true });
            }
          }
        );

        // Timeout fallback if no session received
        setTimeout(() => {
          if (isMounted) {
            navigate('/', { replace: true });
          }
        }, 4000);
      } catch (err: any) {
        console.error('OAuth callback processing error:', err);
        if (isMounted) {
          setErrorMsg(err?.message || 'Authentication callback failed.');
          setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, fetchProfile]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        {errorMsg ? (
          <>
            <div className="text-red-400 font-bold text-lg">Authentication Error</div>
            <p className="text-muted text-sm">{errorMsg}</p>
            <p className="text-muted text-xs">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted">Completing Google Sign-In...</p>
          </>
        )}
      </div>
    </div>
  );
}
