import { useNavigate } from 'react-router-dom';
import { ArrowRight, Flame, Clock } from 'lucide-react';
import { usePlannerStore } from '@/store/plannerStore';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function ContinuePreparationWidget() {
  const navigate = useNavigate();
  const { activePlan, streakDays } = usePlannerStore();

  if (!activePlan) return null;

  const completedCount = activePlan.schedule.filter((i) => i.isCompleted).length;
  const totalCount = activePlan.schedule.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const nextItem = activePlan.schedule.find((i) => !i.isCompleted);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="glass-dark rounded-2xl border border-primary/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
              Active Watch Plan
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{streakDays} Day Streak!</span>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white">
            Resume Preparation for <span className="text-gradient">{activePlan.targetTitle}</span>
          </h3>

          {nextItem && (
            <p className="text-xs text-muted-light flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Up Next: <span className="font-semibold text-white">{nextItem.detailText}</span> ({nextItem.dateString})
            </p>
          )}

          <div className="max-w-md space-y-1 pt-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted">Schedule Progress</span>
              <span className="text-primary font-bold">{progressPct}% Complete</span>
            </div>
            <ProgressBar value={progressPct} size="sm" />
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
          <Button
            onClick={() => navigate('/planner')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="py-3 px-6 font-bold shadow-lg shadow-primary/25"
          >
            Resume Watch Plan
          </Button>
        </div>
      </div>
    </section>
  );
}
