import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Menu, X, Film, Shield, LogOut, Heart, Settings, ChevronDown, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Avatar } from '@/components/ui/Avatar';
import { Toggle } from '@/components/ui/Toggle';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuthStore();
  const { spoilerFreeMode, toggleSpoilerFreeMode } = useSettingsStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // Global search shortcuts: / and Ctrl+K / Cmd+K
  useEffect(() => {
    const handleGlobalShortcut = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isEditing =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);

      if (
        (e.key === '/' && !isEditing) ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault();
        if (location.pathname !== '/search') {
          navigate('/search');
        } else {
          const input = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
          if (input) {
            input.focus();
            input.select();
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcut);
    return () => window.removeEventListener('keydown', handleGlobalShortcut);
  }, [location.pathname, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled ? 'glass-dark shadow-lg shadow-black/20' : 'bg-gradient-to-b from-black/80 to-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Cine<span className="text-primary">Order</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/" label="Home" />
              <NavLink to="/search" label="Explore" />
              <NavLink to="/users" label="Users" />
              <NavLink to="/upcoming" label="Upcoming" />
              <NavLink to="/planner" label="Planner" />
              {user && <NavLink to="/profile" label="My List" />}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Avatar
                      src={profile?.avatar_url}
                      alt={profile?.display_name || 'User'}
                      size="sm"
                    />
                    <ChevronDown className={cn(
                      'w-4 h-4 transition-transform hidden sm:block',
                      userMenuOpen && 'rotate-180'
                    )} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-card rounded-xl border border-white/10 shadow-2xl overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-sm font-medium truncate">{profile?.display_name}</p>
                          <p className="text-xs text-muted truncate">{user.email}</p>
                        </div>

                        <div className="p-2">
                          <UserMenuItem
                            icon={<User className="w-4 h-4" />}
                            label="Profile"
                            onClick={() => navigate('/profile')}
                          />
                          <UserMenuItem
                            icon={<Users className="w-4 h-4" />}
                            label="Find Users"
                            onClick={() => navigate('/users')}
                          />
                          <UserMenuItem
                            icon={<Heart className="w-4 h-4" />}
                            label="Favorites"
                            onClick={() => navigate('/favorites')}
                          />
                          <UserMenuItem
                            icon={<Settings className="w-4 h-4" />}
                            label="Settings"
                            onClick={() => navigate('/settings')}
                          />
                          {profile?.is_admin && (
                            <UserMenuItem
                              icon={<Shield className="w-4 h-4" />}
                              label="Admin Panel"
                              onClick={() => navigate('/admin')}
                            />
                          )}
                        </div>

                        <div className="px-4 py-3 border-t border-white/10">
                          <Toggle
                            checked={spoilerFreeMode}
                            onChange={toggleSpoilerFreeMode}
                            label="Spoiler-Free Mode"
                          />
                        </div>

                        <div className="p-2 border-t border-white/10">
                          <UserMenuItem
                            icon={<LogOut className="w-4 h-4" />}
                            label="Sign Out"
                            onClick={handleSignOut}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-card border-l border-white/10 pt-20 px-6"
            >
              <div className="space-y-2">
                <MobileNavLink to="/" label="Home" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/search" label="Explore" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/users" label="Search Users" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/upcoming" label="Upcoming" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/planner" label="Watch Planner" onClick={() => setMobileMenuOpen(false)} />
                {user ? (
                  <>
                    <MobileNavLink to="/profile" label="Profile" onClick={() => setMobileMenuOpen(false)} />
                    <MobileNavLink to="/favorites" label="Favorites" onClick={() => setMobileMenuOpen(false)} />
                    <MobileNavLink to="/settings" label="Settings" onClick={() => setMobileMenuOpen(false)} />
                    {profile?.is_admin && (
                      <MobileNavLink to="/admin" label="Admin Panel" onClick={() => setMobileMenuOpen(false)} />
                    )}
                    <button
                      onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <MobileNavLink to="/login" label="Sign In" onClick={() => setMobileMenuOpen(false)} />
                )}
              </div>

              {user && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <Toggle
                    checked={spoilerFreeMode}
                    onChange={toggleSpoilerFreeMode}
                    label="Spoiler-Free Mode"
                    description="Hide post-credit scenes & spoilers"
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Sub-Components ─────────────────────────────────────────

function NavLink({ to, label }: { to: string; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        'text-sm font-medium transition-colors relative',
        isActive ? 'text-white' : 'text-muted-light hover:text-white'
      )}
    >
      {label}
      {isActive && (
        <motion.div
          layoutId="navIndicator"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
        />
      )}
    </Link>
  );
}

function MobileNavLink({ to, label, onClick }: { to: string; label: string; onClick: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'block px-4 py-3 rounded-lg transition-colors',
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-light hover:text-white hover:bg-white/5'
      )}
    >
      {label}
    </Link>
  );
}

function UserMenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-muted-light hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
