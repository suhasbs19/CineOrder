import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  LayoutDashboard, Film, Users, Settings, Plus, Search, Edit, Trash2,
  Eye, TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { franchises } from '@/data/franchises';
import { SafeImage } from '@/components/ui/SafeImage';
import { cn } from '@/lib/utils';

type AdminTab = 'dashboard' | 'franchises' | 'users' | 'settings';

export default function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const sidebarItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'franchises', label: 'Franchises', icon: <Film className="w-5 h-5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const stats = [
    { label: 'Total Franchises', value: franchises.length, icon: <Film className="w-5 h-5" />, color: 'text-blue-400' },
    { label: 'Total Users', value: 1284, icon: <Users className="w-5 h-5" />, color: 'text-green-400' },
    { label: 'Page Views', value: '45.2K', icon: <Eye className="w-5 h-5" />, color: 'text-purple-400' },
    { label: 'Trending', value: 'Marvel', icon: <TrendingUp className="w-5 h-5" />, color: 'text-primary' },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Panel — CineOrder</title>
      </Helmet>

      <div className="min-h-screen pt-16 flex">
        {/* Sidebar */}
        <div className="hidden md:flex w-64 flex-col bg-card border-r border-white/5 pt-8 px-4 flex-shrink-0">
          <h2 className="text-lg font-bold mb-6 px-3">Admin Panel</h2>
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  activeTab === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-light hover:text-white hover:bg-white/5'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 md:p-8 overflow-auto">
          {/* Mobile Tab Selector */}
          <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap',
                  activeTab === item.id
                    ? 'bg-primary text-white'
                    : 'bg-surface text-muted-light'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-card rounded-xl border border-white/5 p-5">
                    <div className={cn('mb-2', stat.color)}>{stat.icon}</div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-card rounded-xl border border-white/5 p-6">
                <h2 className="font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {['New user registered: john@example.com', 'Franchise updated: Marvel Cinematic Universe', 'New franchise added: The Matrix'].map((activity, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-muted-light">
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      {activity}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Franchises */}
          {activeTab === 'franchises' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold">Manage Franchises</h1>
                <Button leftIcon={<Plus className="w-4 h-4" />}>
                  Add Franchise
                </Button>
              </div>

              <div className="mb-4">
                <Input
                  placeholder="Search franchises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="w-5 h-5" />}
                />
              </div>

              <div className="bg-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="px-4 py-3 font-medium text-muted">Name</th>
                        <th className="px-4 py-3 font-medium text-muted">Movies</th>
                        <th className="px-4 py-3 font-medium text-muted">Series</th>
                        <th className="px-4 py-3 font-medium text-muted">Status</th>
                        <th className="px-4 py-3 font-medium text-muted">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {franchises
                        .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((f) => (
                          <tr key={f.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <SafeImage src={f.poster_url} alt={f.name} fallbackSrc="/placeholder-poster.svg" className="w-8 h-12 rounded object-cover" />
                                <span className="font-medium">{f.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted">{f.total_movies}</td>
                            <td className="px-4 py-3 text-muted">{f.total_series}</td>
                            <td className="px-4 py-3">
                              <Badge variant={f.status === 'active' ? 'success' : 'default'}>
                                {f.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button className="p-1.5 rounded hover:bg-white/10 text-muted hover:text-white transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 rounded hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
              <div className="bg-card rounded-xl border border-white/5 p-8 text-center">
                <Users className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-muted">User management will be available with Supabase integration.</p>
              </div>
            </motion.div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
              <div className="bg-card rounded-xl border border-white/5 p-8 text-center">
                <Settings className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-muted">Admin settings will be available with full backend integration.</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
