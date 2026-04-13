import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  UserProfile, UserAssessment, ExperienceLevel, MovementPattern,
  Workout, Program, SessionLog, ExerciseLog, SetLog, EquipmentId, MuscleRole,
} from '@/types';
import type { GamificationState, SessionSummary, XPEvent, Badge, PersonalRecord, NewPR } from '@/types/gamification';
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
  personalRecords: Record<string, PersonalRecord>;
  gamification: GamificationState;
  lastSessionSummary: SessionSummary | null;
}

const initialState: AppState = {
  profile: null,
  currentProgram: null,
  generatedWorkouts: [],
  sessionHistory: [],
  personalRecords: {},
  gamification: createDefaultGamificationState(),
  lastSessionSummary: null,
};

// ─── Context Value ──────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  hydrated: boolean;
  completeOnboarding: (data: OnboardingData) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  getWorkout: (id: string) => Workout | undefined;
  getTodaysWorkout: () => { workout: Workout; dayLabel: string } | null;
  startSession: (workoutId: string) => void;
  logSet: (exerciseId: string, set: SetLog) => void;
  completeSession: (workoutId: string, totalTimeSeconds: number) => SessionSummary;
  clearSessionSummary: () => void;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────

const STORAGE_KEY = '@calisthenics/app-state-v1';

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  // Track in-flight session exercise logs
  const [sessionLogs, setSessionLogs] = useState<ExerciseLog[]>([]);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Partial<AppState>;
          setState((prev) => ({ ...prev, ...parsed, lastSessionSummary: null }));
        } catch (e) {
          console.warn('Failed to parse stored state', e);
        }
      }
      setHydrated(true);
    });
  }, []);

  // Persist on change (debounced)
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      // Don't save the transient lastSessionSummary
      const { lastSessionSummary, ...toSave } = state;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch((e) => {
        console.warn('Failed to save state', e);
      });
    }, 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state, hydrated]);

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

    // PR detection
    const newPRs: NewPR[] = [];
    const updatedPRs = { ...state.personalRecords };
    for (const log of sessionLogs) {
      const ex = getExerciseById(log.exerciseId);
      if (!ex) continue;
      const existing = updatedPRs[log.exerciseId];
      // Best reps in this session
      const bestReps = Math.max(0, ...log.sets.filter((s) => s.completed && s.reps).map((s) => s.reps || 0));
      const bestHold = Math.max(0, ...log.sets.filter((s) => s.completed && s.holdSeconds).map((s) => s.holdSeconds || 0));

      if (bestReps > 0) {
        const prevBest = existing?.bestReps || 0;
        if (bestReps > prevBest) {
          newPRs.push({
            exerciseId: log.exerciseId, exerciseName: ex.name,
            type: 'reps', previous: prevBest, current: bestReps,
          });
          updatedPRs[log.exerciseId] = {
            exerciseId: log.exerciseId,
            bestReps,
            bestHoldSeconds: existing?.bestHoldSeconds,
            achievedAt: now,
          };
        }
      }
      if (bestHold > 0) {
        const prevBest = existing?.bestHoldSeconds || 0;
        if (bestHold > prevBest) {
          newPRs.push({
            exerciseId: log.exerciseId, exerciseName: ex.name,
            type: 'hold', previous: prevBest, current: bestHold,
          });
          updatedPRs[log.exerciseId] = {
            exerciseId: log.exerciseId,
            bestReps: existing?.bestReps,
            bestHoldSeconds: bestHold,
            achievedAt: now,
          };
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
      newPRs,
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
      personalRecords: updatedPRs,
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

  const updateProfile = useCallback((partial: Partial<UserProfile>) => {
    setState((prev) => prev.profile
      ? { ...prev, profile: { ...prev.profile, ...partial } }
      : prev
    );
  }, []);

  const resetAllData = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setState(initialState);
    setSessionLogs([]);
  }, []);

  return (
    <AppContext.Provider value={{
      state,
      hydrated,
      completeOnboarding,
      updateProfile,
      getWorkout,
      getTodaysWorkout,
      startSession,
      logSet,
      completeSession,
      clearSessionSummary,
      resetAllData,
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
