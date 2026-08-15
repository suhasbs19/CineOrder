import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { PageTransition } from '@/components/layout/PageTransition';
import { useAuthStore } from '@/store/authStore';

// ─── Lazy-loaded Pages ──────────────────────────────────────
const HomePage = lazy(() => import('@/pages/HomePage'));
const FranchisePage = lazy(() => import('@/pages/FranchisePage'));
const MovieDetailPage = lazy(() => import('@/pages/MovieDetailPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const UpcomingPage = lazy(() => import('@/pages/UpcomingPage'));
const AssistantPage = lazy(() => import('@/pages/AssistantPage'));
const PlannerPage = lazy(() => import('@/pages/PlannerPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const PublicProfilePage = lazy(() => import('@/pages/PublicProfilePage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const DevDiagnosticsPage = lazy(() => import('@/pages/DevDiagnosticsPage'));
const CkgProposalReviewPage = lazy(() => import('@/pages/CkgProposalReviewPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// ─── Page Loading Fallback ──────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { initialize, initialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <ScrollToTop />
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
              <Route path="/franchise/:slug" element={<PageTransition><FranchisePage /></PageTransition>} />
              <Route path="/movie/:id" element={<PageTransition><MovieDetailPage /></PageTransition>} />
              <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />
              <Route path="/upcoming" element={<PageTransition><UpcomingPage /></PageTransition>} />
              <Route path="/assistant" element={<PageTransition><AssistantPage /></PageTransition>} />
              <Route path="/planner" element={<PageTransition><PlannerPage /></PageTransition>} />
              <Route path="/dashboard" element={<PageTransition><PlannerPage /></PageTransition>} />
              <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
              <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
              <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
              <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
              <Route path="/@:username" element={<PageTransition><PublicProfilePage /></PageTransition>} />
              <Route path="/u/:username" element={<PageTransition><PublicProfilePage /></PageTransition>} />
              <Route path="/admin" element={<PageTransition><AdminPage /></PageTransition>} />
              <Route path="/dev-diagnostics" element={<PageTransition><DevDiagnosticsPage /></PageTransition>} />
              <Route path="/developer/ckg-review" element={<PageTransition><CkgProposalReviewPage /></PageTransition>} />
              <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
