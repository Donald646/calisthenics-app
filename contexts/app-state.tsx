import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  UserProfile, UserAssessment, ExperienceLevel, MovementPattern,
  Workout, Program, SessionLog, ExerciseLog, SetLog, EquipmentId, MuscleRole,
} from '@/types';
import type { GamificationState, SessionSummary, XPEvent, Badge } from '@/types/gamification';
import type { OnboardingData } from './onboarding';
import { derivePerPatternLevels, generateProgram } from '@/data/program-generator';
import {
  createDefaultGamificationState, getRankForXP, calculateSessionXP,
  checkBadgeUnlocks, updateChallengeProgress, getWeekStart,
} from '@/data/gamification';
import { getExerciseById } from '@/data/exercises';
import { getWorkoutById as getStaticWorkout } from '@/data/workouts';

// ─── State Shape ────────────────────────────────────────────

interface AppState {
  profile: UserProfile | null;
  currentProgram: Program | null;
  generatedWorkouts: Workout[];
  sessionHistory: SessionLog[];
  gamification: GamificationState;
  lastSessionSummary: SessionSummary | null;
}

const initialState: AppState = {
  profile: null,
  currentProgram: null,
  generatedWorkouts: [],
  sessionHistory: [],
  gamification: createDefaultGamificationState(),
  lastSessionSummary: null,
};

// ─── Context Value ──────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  completeOnboarding: (data: OnboardingData) => void;
  getWorkout: (id: string) => Workout | undefined;
  getTodaysWorkout: () => { workout: Workout; dayLabel: string } | null;
  startSession: (workoutId: string) => void;
  logSet: (exerciseId: string, set: SetLog) => void;
  completeSession: (workoutId: string, totalTimeSeconds: number) => SessionSummary;
  clearSessionSummary: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  // Track in-flight session exercise logs
  const [sessionLogs, setSessionLogs] = useState<ExerciseLog[]>([]);

  const completeOnboarding = useCallback((data: OnboardingData) => {
    const assessment: UserAssessment = {
      maxPushUps: parseInt(data.maxPushUps, 10) || 0,
      maxPullUps: parseInt(data.maxPullUps, 10) || 0,
      maxSquatHoldSeconds: parseInt(data.maxSquatHoldSeconds, 10) || 0,
      canDip: data.canDip ?? false,
      lSitHoldSeconds: parseInt(data.lSitHoldSeconds, 10) || 0,
    };

    const experience = (data.experience || 'beginner') as ExperienceLevel;
    const derivedLevels = derivePerPatternLevels(assessment, experience);

    const profile: UserProfile = {
      name: data.name || 'Athlete',
      age: parseInt(data.age, 10) || 25,
      heightCm: parseInt(data.heightCm, 10) || 175,
      weightKg: parseInt(data.weightKg, 10) || 70,
      sex: (data.sex || 'other') as 'male' | 'female' | 'other',
      goal: data.goal as UserProfile['goal'] || 'general_fitness',
      experience,
      equipment: data.equipment.length > 0 ? data.equipment : ['none' as EquipmentId],
      assessment,
      derivedLevels,
    };

    const { program, workouts } = generateProgram(profile);

    setState((prev) => ({
      ...prev,
      profile,
      currentProgram: program,
      generatedWorkouts: workouts,
      gamification: createDefaultGamificationState(),
    }));
  }, []);

  const getWorkout = useCallback((id: string): Workout | undefined => {
    return getStaticWorkout(id) || state.generatedWorkouts.find((w) => w.id === id);
  }, [state.generatedWorkouts]);

  const getTodaysWorkout = useCallback((): { workout: Workout; dayLabel: string } | null => {
    if (!state.currentProgram) return null;
    const dayOfWeek = (new Date().getDay() + 6) % 7; // Monday = 0
    const scheduleDay = state.currentProgram.schedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (!scheduleDay?.workoutId) return null;
    const workout = getWorkout(scheduleDay.workoutId);
    if (!workout) return null;
    return { workout, dayLabel: scheduleDay.label };
  }, [state.currentProgram, getWorkout]);

  const startSession = useCallback((_workoutId: string) => {
    setSessionLogs([]);
  }, []);

  const logSet = useCallback((exerciseId: string, set: SetLog) => {
    setSessionLogs((prev) => {
      const existing = prev.find((l) => l.exerciseId === exerciseId);
      if (existing) {
        return prev.map((l) =>
          l.exerciseId === exerciseId
            ? { ...l, sets: [...l.sets, set] }
            : l
        );
      }
      return [...prev, { exerciseId, sets: [set] }];
    });
  }, []);

  const completeSession = useCallback((workoutId: string, totalTimeSeconds: number): SessionSummary => {
    const workout = getWorkout(workoutId);
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    // Build session log
    const sessionLog: SessionLog = {
      id: `session_${Date.now()}`,
      workoutId,
      startedAt: new Date(Date.now() - totalTimeSeconds * 1000).toISOString(),
      completedAt: now,
      exercises: sessionLogs,
    };

    // Calculate streak
    let newStreak = state.gamification.currentStreak;
    const lastDate = state.gamification.lastSessionDate;
    if (!lastDate) {
      newStreak = 1;
    } else if (lastDate === today) {
      // Same day, no change
    } else {
      const lastD = new Date(lastDate);
      const todayD = new Date(today);
      const diff = Math.round((todayD.getTime() - lastD.getTime()) / (1000 * 60 * 60 * 24));
      newStreak = diff === 1 ? newStreak + 1 : 1;
    }
    const longestStreak = Math.max(state.gamification.longestStreak, newStreak);

    // Calculate XP
    const { total: xpEarned, events: xpBreakdown } = calculateSessionXP(sessionLogs, newStreak);
    const previousXP = state.gamification.totalXP;
    const newTotalXP = previousXP + xpEarned;
    const previousRank = getRankForXP(previousXP);
    const newRank = getRankForXP(newTotalXP);

    // Check badges
    const newHistory = [...state.sessionHistory, sessionLog];
    const newBadges = checkBadgeUnlocks(
      newHistory,
      newStreak,
      state.gamification.badges,
    );

    // Build muscles worked
    const muscleMap = new Map<string, { name: string; role: MuscleRole; sets: number }>();
    for (const log of sessionLogs) {
      const ex = getExerciseById(log.exerciseId);
      if (!ex) continue;
      const completedSets = log.sets.filter((s) => s.completed).length;
      for (const m of ex.muscles) {
        const existing = muscleMap.get(m.muscleId);
        if (existing) {
          existing.sets += completedSets;
          if (m.role === 'primary' && existing.role !== 'primary') existing.role = 'primary';
        } else {
          muscleMap.set(m.muscleId, {
            name: m.muscleId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            role: m.role,
            sets: completedSets,
          });
        }
      }
    }

    const summary: SessionSummary = {
      workoutName: workout?.name || 'Workout',
      workoutFocus: workout?.focus || 'full_body',
      totalTimeSeconds,
      setsCompleted: sessionLogs.reduce((s, l) => s + l.sets.filter((st) => st.completed).length, 0),
      exerciseCount: sessionLogs.length,
      musclesWorked: Array.from(muscleMap.values()).sort((a, b) => b.sets - a.sets),
      xpEarned,
      xpBreakdown,
      previousRank: previousRank.id,
      newRank: newRank.id,
      rankChanged: previousRank.id !== newRank.id,
      newBadges,
    };

    // Update challenges
    const weekStart = getWeekStart(new Date());
    const updatedChallenges = updateChallengeProgress(
      state.gamification.weeklyChallenges,
      newHistory,
      newStreak,
      weekStart,
    );

    // Update badges list
    const updatedBadges = state.gamification.badges.map((b) => {
      const newB = newBadges.find((nb) => nb.id === b.id);
      return newB || b;
    });

    setState((prev) => ({
      ...prev,
      sessionHistory: newHistory,
      lastSessionSummary: summary,
      gamification: {
        ...prev.gamification,
        totalXP: newTotalXP,
        currentRank: newRank.id,
        xpHistory: [...prev.gamification.xpHistory, ...xpBreakdown],
        badges: updatedBadges,
        weeklyChallenges: updatedChallenges,
        currentStreak: newStreak,
        longestStreak,
        lastSessionDate: today,
      },
    }));

    setSessionLogs([]);
    return summary;
  }, [state, sessionLogs, getWorkout]);

  const clearSessionSummary = useCallback(() => {
    setState((prev) => ({ ...prev, lastSessionSummary: null }));
  }, []);

  return (
    <AppContext.Provider value={{
      state,
      completeOnboarding,
      getWorkout,
      getTodaysWorkout,
      startSession,
      logSet,
      completeSession,
      clearSessionSummary,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
