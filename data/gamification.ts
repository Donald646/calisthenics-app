import type { ProgressionLevel, ExerciseLog, SessionLog, Exercise } from '@/types';
import type {
  Rank, RankId, XPEvent, Badge, BadgeId, WeeklyChallenge, GamificationState,
} from '@/types/gamification';
import { getExerciseById } from './exercises';

// ─── Ranks ──────────────────────────────────────────────────

export const RANKS: Rank[] = [
  { id: 'recruit',   name: 'Recruit',   xpThreshold: 0,      order: 0 },
  { id: 'initiate',  name: 'Initiate',  xpThreshold: 500,    order: 1 },
  { id: 'warrior',   name: 'Warrior',   xpThreshold: 2000,   order: 2 },
  { id: 'sentinel',  name: 'Sentinel',  xpThreshold: 5000,   order: 3 },
  { id: 'vanguard',  name: 'Vanguard',  xpThreshold: 12000,  order: 4 },
  { id: 'champion',  name: 'Champion',  xpThreshold: 25000,  order: 5 },
  { id: 'legend',    name: 'Legend',     xpThreshold: 50000,  order: 6 },
  { id: 'titan',     name: 'Titan',     xpThreshold: 100000, order: 7 },
];

export function getRankForXP(totalXP: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (totalXP >= RANKS[i].xpThreshold) return RANKS[i];
  }
  return RANKS[0];
}

export function getXPToNextRank(totalXP: number): {
  current: Rank; next: Rank | null; xpNeeded: number; progress: number;
} {
  const current = getRankForXP(totalXP);
  const nextIdx = current.order + 1;
  if (nextIdx >= RANKS.length) {
    return { current, next: null, xpNeeded: 0, progress: 1 };
  }
  const next = RANKS[nextIdx];
  const xpInRank = totalXP - current.xpThreshold;
  const rankSpan = next.xpThreshold - current.xpThreshold;
  return {
    current,
    next,
    xpNeeded: next.xpThreshold - totalXP,
    progress: rankSpan > 0 ? xpInRank / rankSpan : 0,
  };
}

// ─── XP Calculation ─────────────────────────────────────────

const LEVEL_MULTIPLIER: Record<ProgressionLevel, number> = {
  1: 1.0, 2: 1.5, 3: 2.0, 4: 2.5, 5: 3.0,
};

export function calculateSetXP(exerciseLevel: ProgressionLevel): number {
  return Math.round(10 * LEVEL_MULTIPLIER[exerciseLevel]);
}

const STREAK_BONUSES: [number, number][] = [
  [100, 500], [60, 250], [30, 100], [14, 50], [7, 25], [3, 10],
];

export function calculateSessionXP(
  exerciseLogs: ExerciseLog[],
  streak: number,
): { total: number; events: XPEvent[] } {
  const now = new Date().toISOString();
  const events: XPEvent[] = [];

  // XP per set
  let setXP = 0;
  for (const log of exerciseLogs) {
    const ex = getExerciseById(log.exerciseId);
    const level: ProgressionLevel = ex?.level ?? 1;
    const completedSets = log.sets.filter((s) => s.completed).length;
    const xp = calculateSetXP(level) * completedSets;
    setXP += xp;
  }
  if (setXP > 0) {
    events.push({ type: 'set_complete', xp: setXP, timestamp: now, detail: 'Sets completed' });
  }

  // Workout complete bonus
  events.push({ type: 'workout_complete', xp: 50, timestamp: now, detail: 'Workout bonus' });

  // Streak bonus
  for (const [days, bonus] of STREAK_BONUSES) {
    if (streak >= days) {
      events.push({
        type: 'streak_milestone',
        xp: bonus,
        timestamp: now,
        detail: `${days}-day streak`,
      });
      break; // only highest applicable bonus
    }
  }

  const total = events.reduce((sum, e) => sum + e.xp, 0);

  // Streak multiplier
  let multiplier = 1;
  if (streak >= 30) multiplier = 2;
  else if (streak >= 7) multiplier = 1.5;

  const finalTotal = Math.round(total * multiplier);
  if (multiplier > 1) {
    const bonus = finalTotal - total;
    events.push({
      type: 'streak_milestone',
      xp: bonus,
      timestamp: now,
      detail: `${multiplier}x streak multiplier`,
    });
  }

  return { total: finalTotal, events };
}

// ─── Badges ─────────────────────────────────────────────────

export const BADGE_DEFINITIONS: Omit<Badge, 'unlockedAt'>[] = [
  { id: 'first_session', name: 'First Step', description: 'Complete your first workout', criteria: '1 session completed' },
  { id: 'ten_sessions', name: 'Dedicated', description: 'Complete 10 workouts', criteria: '10 sessions completed' },
  { id: 'fifty_sessions', name: 'Machine', description: 'Complete 50 workouts', criteria: '50 sessions completed' },
  { id: 'week_streak', name: '7-Day Warrior', description: 'Train 7 days in a row', criteria: '7-day streak' },
  { id: 'month_streak', name: 'Unstoppable', description: 'Train 30 days in a row', criteria: '30-day streak' },
  { id: 'push_master', name: 'Push Master', description: 'Reach Level 4 in push exercises', criteria: 'Push level 4+' },
  { id: 'pull_master', name: 'Pull Master', description: 'Reach Level 4 in pull exercises', criteria: 'Pull level 4+' },
  { id: 'legs_master', name: 'Legs Master', description: 'Reach Level 4 in leg exercises', criteria: 'Legs level 4+' },
  { id: 'core_master', name: 'Core Master', description: 'Reach Level 4 in core exercises', criteria: 'Core level 4+' },
  { id: 'first_pull_up', name: 'Pull-Up Club', description: 'Complete a set of pull-ups', criteria: 'Use pull-up exercise in a session' },
  { id: 'handstand_hold', name: 'Upside Down', description: 'Hold a wall handstand for 30s', criteria: 'Wall handstand 30s hold' },
  { id: 'muscle_up', name: 'Muscle-Up', description: 'Complete a muscle-up', criteria: 'Use muscle-up exercise' },
  { id: 'pistol_squat', name: 'One-Legged', description: 'Complete a pistol squat', criteria: 'Use pistol squat exercise' },
];

export function checkBadgeUnlocks(
  sessionHistory: SessionLog[],
  streak: number,
  existingBadges: Badge[],
): Badge[] {
  const now = new Date().toISOString();
  const unlocked = new Set(existingBadges.filter((b) => b.unlockedAt).map((b) => b.id));
  const newBadges: Badge[] = [];

  function tryUnlock(id: BadgeId, condition: boolean) {
    if (!unlocked.has(id) && condition) {
      const def = BADGE_DEFINITIONS.find((b) => b.id === id);
      if (def) newBadges.push({ ...def, unlockedAt: now });
    }
  }

  const totalSessions = sessionHistory.length;
  tryUnlock('first_session', totalSessions >= 1);
  tryUnlock('ten_sessions', totalSessions >= 10);
  tryUnlock('fifty_sessions', totalSessions >= 50);
  tryUnlock('week_streak', streak >= 7);
  tryUnlock('month_streak', streak >= 30);

  // Check if specific exercises were used in any session
  const allExerciseIds = new Set(sessionHistory.flatMap((s) => s.exercises.map((e) => e.exerciseId)));
  tryUnlock('first_pull_up', allExerciseIds.has('pullup'));
  tryUnlock('muscle_up', allExerciseIds.has('muscle_up'));
  tryUnlock('pistol_squat', allExerciseIds.has('pistol_squat'));
  tryUnlock('handstand_hold', allExerciseIds.has('wall_handstand'));

  return newBadges;
}

// ─── Weekly Challenges ──────────────────────────────────────

const CHALLENGE_POOL: Omit<WeeklyChallenge, 'id' | 'weekStart' | 'current' | 'completed'>[] = [
  { title: 'Set Crusher', description: 'Complete 50 total sets', type: 'total_sets', target: 50, xpReward: 100 },
  { title: 'Consistency', description: 'Train 4 days this week', type: 'total_workouts', target: 4, xpReward: 75 },
  { title: 'All-Rounder', description: 'Train 3 different focuses', type: 'pattern_variety', target: 3, xpReward: 80 },
  { title: 'Daily Grind', description: 'Train 5 days this week', type: 'total_workouts', target: 5, xpReward: 120 },
  { title: 'Volume King', description: 'Complete 80 total sets', type: 'total_sets', target: 80, xpReward: 150 },
  { title: 'Iron Will', description: 'Maintain a 5-day streak', type: 'streak_days', target: 5, xpReward: 100 },
];

export function generateWeeklyChallenges(weekStart: string): WeeklyChallenge[] {
  // Deterministic shuffle based on weekStart so same week = same challenges
  const seed = weekStart.split('-').reduce((a, b) => a + parseInt(b, 10), 0);
  const shuffled = [...CHALLENGE_POOL].sort((a, b) => {
    const ha = (seed * 31 + a.title.length) % 100;
    const hb = (seed * 31 + b.title.length) % 100;
    return ha - hb;
  });

  return shuffled.slice(0, 3).map((c, i) => ({
    ...c,
    id: `challenge_${weekStart}_${i}`,
    weekStart,
    current: 0,
    completed: false,
  }));
}

export function updateChallengeProgress(
  challenges: WeeklyChallenge[],
  sessionHistory: SessionLog[],
  streak: number,
  weekStart: string,
): WeeklyChallenge[] {
  // Filter sessions to this week
  const weekSessions = sessionHistory.filter((s) => s.startedAt >= weekStart);
  const totalSets = weekSessions.reduce(
    (sum, s) => sum + s.exercises.reduce((es, e) => es + e.sets.filter((st) => st.completed).length, 0),
    0,
  );
  const totalWorkouts = weekSessions.length;
  const focuses = new Set(weekSessions.map((s) => s.workoutId)); // approximation

  return challenges.map((c) => {
    let current = c.current;
    switch (c.type) {
      case 'total_sets': current = totalSets; break;
      case 'total_workouts': current = totalWorkouts; break;
      case 'pattern_variety': current = focuses.size; break;
      case 'streak_days': current = streak; break;
    }
    return { ...c, current, completed: current >= c.target };
  });
}

// ─── Default State ──────────────────────────────────────────

export function createDefaultGamificationState(): GamificationState {
  const weekStart = getWeekStart(new Date());
  return {
    totalXP: 0,
    currentRank: 'recruit',
    xpHistory: [],
    badges: BADGE_DEFINITIONS.map((b) => ({ ...b, unlockedAt: undefined })),
    weeklyChallenges: generateWeeklyChallenges(weekStart),
    currentStreak: 0,
    longestStreak: 0,
  };
}

export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - diff);
  return d.toISOString().split('T')[0];
}
