import type { MuscleRole, ExerciseLog, ProgressionLevel } from './index';

// ─── Ranks ──────────────────────────────────────────────────

export type RankId =
  | 'recruit' | 'initiate' | 'warrior' | 'sentinel'
  | 'vanguard' | 'champion' | 'legend' | 'titan';

export interface Rank {
  id: RankId;
  name: string;
  xpThreshold: number;
  order: number;
}

// ─── XP ─────────────────────────────────────────────────────

export type XPEventType =
  | 'set_complete'
  | 'workout_complete'
  | 'personal_record'
  | 'streak_milestone'
  | 'challenge_complete';

export interface XPEvent {
  type: XPEventType;
  xp: number;
  timestamp: string;
  detail?: string;
}

// ─── Badges ─────────────────────────────────────────────────

export type BadgeId =
  | 'first_session' | 'ten_sessions' | 'fifty_sessions'
  | 'week_streak' | 'month_streak'
  | 'push_master' | 'pull_master' | 'legs_master' | 'core_master'
  | 'first_pull_up' | 'handstand_hold' | 'muscle_up' | 'pistol_squat';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  criteria: string;
  unlockedAt?: string;
}

// ─── Weekly Challenges ──────────────────────────────────────

export type ChallengeType =
  | 'total_sets' | 'total_workouts' | 'pattern_variety' | 'streak_days';

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  target: number;
  current: number;
  weekStart: string;
  completed: boolean;
  xpReward: number;
}

// ─── Aggregate State ────────────────────────────────────────

export interface GamificationState {
  totalXP: number;
  currentRank: RankId;
  xpHistory: XPEvent[];
  badges: Badge[];
  weeklyChallenges: WeeklyChallenge[];
  currentStreak: number;
  longestStreak: number;
  lastSessionDate?: string;
}

// ─── Session Summary (for complete screen) ──────────────────

export interface SessionSummary {
  workoutName: string;
  workoutFocus: string;
  totalTimeSeconds: number;
  setsCompleted: number;
  exerciseCount: number;
  musclesWorked: { name: string; role: MuscleRole; sets: number }[];
  xpEarned: number;
  xpBreakdown: XPEvent[];
  previousRank: RankId;
  newRank: RankId;
  rankChanged: boolean;
  newBadges: Badge[];
}
