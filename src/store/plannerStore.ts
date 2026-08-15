import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generatePersonalSchedule } from '@/lib/plannerEngine';
import type {
  PersonalWatchPlan,
  Achievement,
  UserStatistics,
  ReminderOption,
} from '@/types/planner';

interface PlannerState {
  activePlan: PersonalWatchPlan | null;
  savedPlans: PersonalWatchPlan[];
  streakDays: number;
  achievements: Achievement[];

  createWatchPlan: (
    targetContentId: string,
    targetTitle: string,
    targetReleaseDate: string,
    hoursPerDay: number,
    daysPerWeek: number,
    preferredDays: string[],
    reminderFrequency: ReminderOption,
    watchedIds: string[]
  ) => PersonalWatchPlan;

  toggleScheduleItem: (itemId: string) => void;
  deletePlan: (planId: string) => void;
  setActivePlan: (planId: string) => void;

  getUserStatistics: (watchedCount: number) => UserStatistics;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-mcu',
    title: 'Finished MCU',
    description: 'Watch all mandatory Marvel Cinematic Universe titles.',
    icon: '🏆',
    unlocked: false,
    progress: 45,
  },
  {
    id: 'ach-sw',
    title: 'Finished Star Wars',
    description: 'Complete the Skywalker Saga and Mandoverse titles.',
    icon: '🌌',
    unlocked: false,
    progress: 60,
  },
  {
    id: 'ach-100m',
    title: '100 Movies Watched',
    description: 'Reach 100 total completed movies & series in CineOrder.',
    icon: '🎬',
    unlocked: false,
    progress: 30,
  },
  {
    id: 'ach-plan-complete',
    title: 'Completed Preparation Plan',
    description: 'Finish 100% of a custom Personal Watch Plan before release day.',
    icon: '⚡',
    unlocked: false,
    progress: 0,
  },
  {
    id: 'ach-marathon',
    title: 'Weekend Marathon',
    description: 'Watch 4 or more preparation titles during a single weekend.',
    icon: '🍿',
    unlocked: true,
    unlockedAt: '2026-07-28',
    progress: 100,
  },
];

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      activePlan: null,
      savedPlans: [],
      streakDays: 4,
      achievements: INITIAL_ACHIEVEMENTS,

      createWatchPlan: (
        targetContentId,
        targetTitle,
        targetReleaseDate,
        hoursPerDay,
        daysPerWeek,
        preferredDays,
        reminderFrequency,
        watchedIds
      ) => {
        const schedule = generatePersonalSchedule(
          targetContentId,
          hoursPerDay,
          daysPerWeek,
          preferredDays,
          watchedIds
        );

        const newPlan: PersonalWatchPlan = {
          id: `plan-${Date.now()}`,
          userId: 'current-user',
          targetContentId,
          targetTitle,
          targetReleaseDate,
          hoursPerDay,
          daysPerWeek,
          preferredDays,
          reminderFrequency,
          schedule,
          createdAt: new Date().toISOString(),
          completed: false,
        };

        set((state) => ({
          activePlan: newPlan,
          savedPlans: [newPlan, ...state.savedPlans.filter((p) => p.targetContentId !== targetContentId)],
        }));

        return newPlan;
      },

      toggleScheduleItem: (itemId) => {
        set((state) => {
          if (!state.activePlan) return state;

          const updatedSchedule = state.activePlan.schedule.map((item) =>
            item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
          );

          const isAllCompleted = updatedSchedule.every((i) => i.isCompleted);

          const updatedActivePlan = {
            ...state.activePlan,
            schedule: updatedSchedule,
            completed: isAllCompleted,
          };

          let updatedAchievements = state.achievements;
          if (isAllCompleted) {
            updatedAchievements = state.achievements.map((a) =>
              a.id === 'ach-plan-complete'
                ? { ...a, unlocked: true, unlockedAt: new Date().toISOString(), progress: 100 }
                : a
            );
          }

          return {
            activePlan: updatedActivePlan,
            savedPlans: state.savedPlans.map((p) =>
              p.id === updatedActivePlan.id ? updatedActivePlan : p
            ),
            achievements: updatedAchievements,
          };
        });
      },

      deletePlan: (planId) => {
        set((state) => ({
          activePlan: state.activePlan?.id === planId ? null : state.activePlan,
          savedPlans: state.savedPlans.filter((p) => p.id !== planId),
        }));
      },

      setActivePlan: (planId) => {
        set((state) => {
          const plan = state.savedPlans.find((p) => p.id === planId) || null;
          return { activePlan: plan };
        });
      },

      getUserStatistics: (watchedCount: number) => {
        const plansCompleted = get().savedPlans.filter((p) => p.completed).length;
        const totalHours = Math.round((watchedCount * 125) / 60);

        return {
          moviesWatched: Math.round(watchedCount * 0.7),
          episodesWatched: Math.round(watchedCount * 2.5),
          hoursWatched: totalHours,
          plansCompleted,
          mostWatchedFranchise: 'Marvel Cinematic Universe',
          favoriteCharacter: 'Spider-Man',
          favoriteGenre: 'Sci-Fi / Superhero',
          overallCompletionPercentage: Math.min(100, Math.round((watchedCount / 184) * 100)),
        };
      },
    }),
    {
      name: 'cineorder-planner-storage',
    }
  )
);
