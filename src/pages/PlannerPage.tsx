import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Download,
  FileText,
  Trash2,
  Film,
  Tv,
  BarChart3,
} from 'lucide-react';
import { usePlannerStore } from '@/store/plannerStore';
import { useWatchStore } from '@/store/watchStore';
import { allContent } from '@/data/franchises';
import { exportPlanCSV, exportPlanText } from '@/lib/plannerEngine';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn, formatRuntime } from '@/lib/utils';
import type { Content } from '@/types';

import { TargetCombobox } from '@/components/planner/TargetCombobox';

export default function PlannerPage() {
  const { watchHistory } = useWatchStore();
  const {
    activePlan,
    savedPlans,
    createWatchPlan,
    toggleScheduleItem,
    deletePlan,
    setActivePlan,
    getUserStatistics,
  } = usePlannerStore();

  const watchedIds = useMemo(() => {
    return Object.keys(watchHistory).filter((k) => watchHistory[k]);
  }, [watchHistory]);

  const stats = getUserStatistics(watchedIds.length);

  // Simplified Form State (Only 2 User Inputs)
  const [selectedTargetId, setSelectedTargetId] = useState<string>('mcu-doomsday');
  const [hoursPerDay, setHoursPerDay] = useState<number>(2);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const selectedTargetContent: Content = useMemo(() => {
    return (allContent.find((c) => c.id === selectedTargetId) || allContent[0]) as Content;
  }, [selectedTargetId]);

  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      createWatchPlan(
        selectedTargetId,
        selectedTargetContent.title,
        selectedTargetContent.release_date || '2026-05-01',
        hoursPerDay,
        7,
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        'one_week_before',
        watchedIds
      );
      setIsGenerating(false);
    }, 300);
  };

  const handleDownloadCSV = () => {
    if (!activePlan) return;
    const csvContent = exportPlanCSV(activePlan);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activePlan.targetTitle.replace(/\s+/g, '_')}_WatchPlan.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadText = () => {
    if (!activePlan) return;
    const textContent = exportPlanText(activePlan);
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activePlan.targetTitle.replace(/\s+/g, '_')}_Checklist.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Plan Metrics
  const planCompletedCount = activePlan?.schedule.filter((i) => i.isCompleted).length || 0;
  const planTotalCount = activePlan?.schedule.length || 0;
  const planProgressPct = planTotalCount > 0 ? Math.round((planCompletedCount / planTotalCount) * 100) : 0;
  const totalRuntimeMinutes = activePlan?.schedule.reduce((sum, i) => sum + (i.durationMinutes || 0), 0) || 0;

  // Group schedule items by dayNumber for day-by-day display
  const groupedDays = useMemo(() => {
    if (!activePlan) return [];
    const map = new Map<number, typeof activePlan.schedule>();
    activePlan.schedule.forEach((item) => {
      const list = map.get(item.dayNumber) || [];
      list.push(item);
      map.set(item.dayNumber, list);
    });

    const entries = Array.from(map.entries()).sort(([a], [b]) => a - b);
    const totalDays = entries.length;

    return entries.map(([dayNum, items]) => ({
      dayNumber: dayNum,
      isFinalDay: dayNum === totalDays,
      dateString: items[0]?.dateString || '',
      items,
      isDayCompleted: items.every((i) => i.isCompleted),
    }));
  }, [activePlan]);

  const isBehindSchedule = activePlan && activePlan.schedule.length > 0 && !activePlan.completed && planProgressPct < 30;

  return (
    <>
      <Helmet>
        <title>Personal Watch Planner — CineOrder</title>
        <meta
          name="description"
          content="Generate custom daily watch plans for upcoming movies and TV series, track watch progress, achievements, and statistics."
        />
      </Helmet>

      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-7 h-7 text-primary" />
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Personal Watch <span className="text-gradient">Planner</span>
                </h1>
              </div>
              <p className="text-sm text-muted">
                Automatic day-by-day schedules, completion tracking, and watch progress.
              </p>
            </div>
          </div>

          {/* Behind Schedule Warning Banner */}
          {isBehindSchedule && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">Behind Schedule Warning</h4>
                  <p className="text-xs text-amber-200/90">
                    You are behind schedule for <span className="font-semibold text-white">{activePlan.targetTitle}</span>! Catch up to stay on track before release day.
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}>
                Catch Up Now
              </Button>
            </div>
          )}

          {/* Main Grid: Simplified Generator Form + Active Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Simplified Generator Form & Saved Watch Plans */}
            <div className="space-y-6 self-start">
              {/* Simplified Generator Form Panel */}
              <div className="glass-dark rounded-2xl border border-white/10 p-6 space-y-6 relative z-10">
                <div className="space-y-1 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-white">Create New Watch Plan</h3>
                  </div>
                  <p className="text-xs text-muted">
                    Select your target title and daily hours available.
                  </p>
                </div>

                <form onSubmit={handleGeneratePlan} className="space-y-5 text-xs">
                  {/* Input 1: Target Movie or TV Show (Searchable Combobox) */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-white">Target Movie / TV Show:</label>
                    <TargetCombobox value={selectedTargetId} onChange={setSelectedTargetId} />
                  </div>

                  {/* Input 2: Hours Available Per Day Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between font-semibold text-white">
                      <span>Hours Available Per Day:</span>
                      <span className="text-primary font-bold">{hoursPerDay} {hoursPerDay === 1 ? 'hour' : 'hours'}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      step="0.5"
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
                      className="w-full accent-primary bg-surface h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-muted">
                      <span>1 hr/day</span>
                      <span>3 hrs/day</span>
                      <span>6 hrs/day</span>
                    </div>
                  </div>

                  {/* Single Primary CTA */}
                  <Button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full py-3.5 text-sm font-bold gap-2 shadow-lg shadow-primary/25 rounded-xl bg-primary hover:bg-primary/90"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGenerating ? 'Generating Schedule...' : '✨ Generate Watch Plan'}
                  </Button>
                </form>
              </div>

              {/* Saved Watch Plans List */}
              {savedPlans.length > 0 && (
                <div className="glass-dark rounded-2xl border border-white/10 p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Your Watch Plans</p>
                    <span className="text-[10px] text-muted font-mono">{savedPlans.length} Saved</span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {savedPlans.map((plan) => {
                      const completedCount = plan.schedule.filter((i) => i.isCompleted).length;
                      const totalCount = plan.schedule.length;
                      const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;
                      const isSelected = activePlan?.id === plan.id;

                      return (
                        <div
                          key={plan.id}
                          onClick={() => setActivePlan(plan.id)}
                          className={cn(
                            'p-3 rounded-xl border text-xs flex items-center justify-between gap-3 cursor-pointer transition-all',
                            isSelected
                              ? 'bg-primary/20 border-primary/40 text-white font-bold shadow-md shadow-primary/10'
                              : 'bg-surface/50 border-white/5 text-muted hover:text-white hover:bg-white/5'
                          )}
                        >
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <p className="truncate font-semibold text-white">{plan.targetTitle}</p>
                            <div className="flex items-center gap-2 text-[11px] text-muted">
                              {totalCount > 0 ? (
                                <>
                                  <span>{totalCount} Days Schedule</span>
                                  <span>•</span>
                                  <span className={pct === 100 ? 'text-green-400 font-bold' : 'text-primary font-semibold'}>
                                    {pct}% Complete
                                  </span>
                                </>
                              ) : (
                                <span className="text-emerald-400 font-semibold">Direct Watch • Ready</span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePlan(plan.id);
                            }}
                            className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-white/10 transition-colors flex-shrink-0"
                            title="Delete Plan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Active Plan Automatic Day-by-Day Schedule */}
            <div className="lg:col-span-2 space-y-6">
              {!activePlan ? (
                <div className="glass-dark rounded-2xl border border-white/10 p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-surface border border-white/10 flex items-center justify-center mx-auto text-primary">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">No Active Watch Plan</h3>
                  <p className="text-muted text-sm max-w-md mx-auto">
                    Select a target title and hours per day to automatically generate your day-by-day watch schedule!
                  </p>
                </div>
              ) : (
                <div className="glass-dark rounded-2xl border border-white/10 p-6 space-y-6">
                  {/* Active Plan Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={activePlan.schedule.length > 0 ? 'primary' : 'success'}>
                          {activePlan.schedule.length > 0 ? 'Active Plan' : 'Direct Watch'}
                        </Badge>
                        <h2 className="text-2xl font-black text-white">{activePlan.targetTitle}</h2>
                      </div>
                      <p className="text-xs text-muted">
                        Target Release Date: <span className="text-white font-medium">{activePlan.targetReleaseDate}</span> ({activePlan.hoursPerDay} hrs/day)
                      </p>
                    </div>

                    {/* Export Actions (only when schedule has items) */}
                    {activePlan.schedule.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleDownloadCSV}
                          leftIcon={<Download className="w-3.5 h-3.5" />}
                          className="text-xs"
                        >
                          Export CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadText}
                          leftIcon={<FileText className="w-3.5 h-3.5" />}
                          className="text-xs"
                        >
                          Checklist
                        </Button>
                      </div>
                    )}
                  </div>

                  {activePlan.schedule.length === 0 ? (
                    /* Zero Prerequisites Direct Entry Card */
                    <div className="p-8 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-4 my-2">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                        <CheckCircle className="w-7 h-7" />
                      </div>
                      <div className="space-y-1.5 max-w-lg mx-auto">
                        <h3 className="text-xl font-black text-white">No Prior Movies Required</h3>
                        <p className="text-sm font-semibold text-emerald-300">
                          You're ready to watch <span className="text-white font-bold">{activePlan.targetTitle}</span> directly!
                        </p>
                        <p className="text-xs text-muted leading-relaxed">
                          This title has no mandatory or recommended prerequisite movies in the CineOrder story graph. You can enjoy it immediately with 0 hours of prior preparation needed.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-muted-light">
                          🎬 Self-Contained Story
                        </span>
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                          ⚡ 0 Hours Prep Needed
                        </span>
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-muted-light">
                          🌟 Direct Entry Point
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Automatically Displayed Plan Metrics Badges */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                          <span className="text-[10px] text-muted font-bold uppercase">Estimated Days Required</span>
                          <span className="text-xl font-black text-white mt-1">{groupedDays.length} Days</span>
                        </div>

                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                          <span className="text-[10px] text-muted font-bold uppercase">Total Runtime</span>
                          <span className="text-xl font-black text-amber-400 mt-1">{formatRuntime(totalRuntimeMinutes)}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                          <span className="text-[10px] text-muted font-bold uppercase">Plan Progress</span>
                          <span className="text-xl font-black text-emerald-400 mt-1">{planProgressPct}%</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-muted">Overall Watch Schedule Progress</span>
                          <span className="text-primary font-bold">
                            {planCompletedCount} of {planTotalCount} Completed ({planProgressPct}%)
                          </span>
                        </div>
                        <ProgressBar value={planProgressPct} size="md" />
                      </div>

                      {/* Day-by-Day Watch Schedule */}
                      <div className="space-y-4 pt-3">
                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Day-by-Day Watch Schedule</h4>

                        <div className="space-y-3">
                          {groupedDays.map(({ dayNumber, isFinalDay, dateString, items, isDayCompleted }) => (
                            <div
                              key={dayNumber}
                              className={cn(
                                'p-4 rounded-2xl border transition-all duration-200 space-y-2',
                                isDayCompleted
                                  ? 'bg-green-500/10 border-green-500/30'
                                  : isFinalDay
                                  ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/10'
                                  : 'bg-surface/50 border-white/5 hover:border-white/20'
                              )}
                            >
                              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <div className="flex items-center gap-2">
                                  <span className={cn('text-sm font-black', isFinalDay ? 'text-primary' : 'text-white')}>
                                    {isFinalDay ? `Final Day (Day ${dayNumber})` : `Day ${dayNumber}`}
                                  </span>
                                  <span className="text-xs text-muted font-mono">({dateString})</span>
                                </div>

                                {isDayCompleted && (
                                  <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-500/20 px-2 py-0.5 rounded-md border border-green-500/30">
                                    <CheckCircle className="w-3.5 h-3.5" /> Day Completed
                                  </span>
                                )}
                              </div>

                              {/* Day Bullets */}
                              <div className="space-y-2 pt-1">
                                {items.map((item) => (
                                  <div
                                    key={item.id}
                                    onClick={() => toggleScheduleItem(item.id)}
                                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <span className="text-primary font-bold text-sm">•</span>
                                      <p className={cn('text-xs font-semibold truncate text-white', item.isCompleted && 'line-through text-muted')}>
                                        {item.detailText}
                                      </p>
                                    </div>

                                    <Button
                                      variant={item.isCompleted ? 'secondary' : 'outline'}
                                      size="sm"
                                      className={cn(
                                        'text-[11px] py-0.5 px-2.5 flex-shrink-0 h-7',
                                        item.isCompleted && 'bg-green-500/20 text-green-400 border border-green-500/30'
                                      )}
                                    >
                                      {item.isCompleted ? 'Done' : 'Mark Done'}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Smart Dashboard & Statistics Section */}
          <div className="pt-6">
            <div className="glass-dark rounded-2xl border border-white/10 p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-white">Account Statistics</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <StatRow label="Movies Watched" value={stats.moviesWatched} icon={<Film className="w-4 h-4 text-primary" />} />
                <StatRow label="TV Episodes Watched" value={stats.episodesWatched} icon={<Tv className="w-4 h-4 text-blue-400" />} />
                <StatRow label="Total Hours Watched" value={`${stats.hoursWatched} hrs`} icon={<Clock className="w-4 h-4 text-amber-400" />} />
                <StatRow label="Preparation Plans Completed" value={stats.plansCompleted} icon={<CheckCircle className="w-4 h-4 text-green-400" />} />
                <StatRow label="Most Watched Franchise" value={stats.mostWatchedFranchise} />
                <StatRow label="Favorite Character" value={stats.favoriteCharacter} />
                <StatRow label="Favorite Genre" value={stats.favoriteGenre} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatRow({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-surface/40 border border-white/5">
      <span className="text-muted flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}
