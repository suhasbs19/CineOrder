export type ReminderOption =
  | 'tomorrow'
  | 'weekend'
  | 'one_week_before'
  | 'one_day_before';

export interface DailyScheduleItem {
  id: string;
  dayNumber: number;
  dateString: string;
  contentId: string;
  title: string;
  type: 'movie' | 'series' | 'episode_chunk';
  detailText: string;
  durationMinutes: number;
  isCompleted: boolean;
}

export interface PersonalWatchPlan {
  id: string;
  userId: string;
  targetContentId: string;
  targetTitle: string;
  targetReleaseDate: string;
  hoursPerDay: number;
  daysPerWeek: number;
  preferredDays: string[];
  reminderFrequency: ReminderOption;
  schedule: DailyScheduleItem[];
  createdAt: string;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

export interface UserStatistics {
  moviesWatched: number;
  episodesWatched: number;
  hoursWatched: number;
  plansCompleted: number;
  mostWatchedFranchise: string;
  favoriteCharacter: string;
  favoriteGenre: string;
  overallCompletionPercentage: number;
}
