import type {
  UserProfile, UserAssessment, ExperienceLevel,
  MovementPattern, ProgressionLevel, WorkoutFocus,
  Workout, WorkoutExercise, Program, ProgramDay, EquipmentId,
  UserGoal,
} from '@/types';
import { getExercisesByPattern } from './exercises';

// ─── Per-Pattern Level Derivation ───────────────────────────

function clampLevel(raw: number, experience: ExperienceLevel): ProgressionLevel {
  let level = Math.max(1, Math.min(5, Math.round(raw)));
  if (experience === 'beginner') level = Math.min(level, 2);
  if (experience === 'intermediate') level = Math.min(level, 4);
  return level as ProgressionLevel;
}

export function derivePerPatternLevels(
  assessment: UserAssessment,
  experience: ExperienceLevel,
): Record<MovementPattern, ProgressionLevel> {
  const { maxPushUps, maxPullUps, maxSquatHoldSeconds, lSitHoldSeconds, canDip } = assessment;

  // Push: based on push-up count
  const pushRaw = maxPushUps < 5 ? 1 : maxPushUps < 15 ? 2 : maxPushUps < 30 ? 3 : maxPushUps < 50 ? 4 : 5;

  // Pull: based on pull-up count
  const pullRaw = maxPullUps < 1 ? 1 : maxPullUps < 4 ? 2 : maxPullUps < 8 ? 3 : maxPullUps < 15 ? 4 : 5;

  // Squat: based on squat hold time
  const squatRaw = maxSquatHoldSeconds < 15 ? 1 : maxSquatHoldSeconds < 30 ? 2 : maxSquatHoldSeconds < 45 ? 3 : maxSquatHoldSeconds < 60 ? 4 : 5;

  // Core: composite of push + pull (core is trained in both)
  const coreRaw = Math.round((pushRaw + pullRaw) / 2);

  // Skill: L-sit hold + can dip
  const skillRaw = !canDip ? 1 : lSitHoldSeconds < 5 ? 1 : lSitHoldSeconds < 10 ? 2 : lSitHoldSeconds < 20 ? 3 : lSitHoldSeconds < 30 ? 4 : 5;

  return {
    push_horizontal: clampLevel(pushRaw, experience),
    push_vertical: clampLevel(Math.max(1, pushRaw - 1), experience), // vertical harder
    pull_horizontal: clampLevel(pullRaw, experience),
    pull_vertical: clampLevel(Math.max(1, pullRaw - 1), experience), // vertical harder
    squat: clampLevel(squatRaw, experience),
    hinge: clampLevel(Math.max(1, squatRaw - 1), experience), // hinge assessed indirectly
    core: clampLevel(coreRaw, experience),
    skill: clampLevel(skillRaw, experience),
  };
}

// ─── Schedule Templates ─────────────────────────────────────

interface DayTemplate {
  dayOfWeek: number;
  focus: WorkoutFocus;
  label: string;
}

const SCHEDULE_TEMPLATES: Record<UserGoal, { daysPerWeek: number; days: DayTemplate[] }> = {
  general_fitness: {
    daysPerWeek: 4,
    days: [
      { dayOfWeek: 0, focus: 'push', label: 'Push Day' },
      { dayOfWeek: 1, focus: 'pull', label: 'Pull Day' },
      { dayOfWeek: 3, focus: 'legs', label: 'Legs Day' },
      { dayOfWeek: 4, focus: 'full_body', label: 'Full Body' },
    ],
  },
  strength: {
    daysPerWeek: 5,
    days: [
      { dayOfWeek: 0, focus: 'push', label: 'Push A' },
      { dayOfWeek: 1, focus: 'pull', label: 'Pull A' },
      { dayOfWeek: 2, focus: 'legs', label: 'Legs' },
      { dayOfWeek: 4, focus: 'push', label: 'Push B' },
      { dayOfWeek: 5, focus: 'pull', label: 'Pull B' },
    ],
  },
  skills: {
    daysPerWeek: 5,
    days: [
      { dayOfWeek: 0, focus: 'skills', label: 'Skills A' },
      { dayOfWeek: 1, focus: 'push', label: 'Push Day' },
      { dayOfWeek: 2, focus: 'pull', label: 'Pull Day' },
      { dayOfWeek: 4, focus: 'skills', label: 'Skills B' },
      { dayOfWeek: 5, focus: 'legs', label: 'Legs Day' },
    ],
  },
  muscle: {
    daysPerWeek: 5,
    days: [
      { dayOfWeek: 0, focus: 'push', label: 'Push (Hyper)' },
      { dayOfWeek: 1, focus: 'pull', label: 'Pull (Hyper)' },
      { dayOfWeek: 2, focus: 'legs', label: 'Legs (Hyper)' },
      { dayOfWeek: 4, focus: 'push', label: 'Push (Volume)' },
      { dayOfWeek: 5, focus: 'pull', label: 'Pull (Volume)' },
    ],
  },
};

// ─── Focus → Movement Patterns ──────────────────────────────

const FOCUS_PATTERNS: Record<WorkoutFocus, MovementPattern[]> = {
  push:      ['push_horizontal', 'push_vertical', 'core'],
  pull:      ['pull_horizontal', 'pull_vertical', 'core'],
  legs:      ['squat', 'hinge', 'core'],
  full_body: ['push_horizontal', 'pull_vertical', 'squat', 'core'],
  core:      ['core', 'hinge'],
  skills:    ['skill', 'push_vertical', 'core'],
  mobility:  ['hinge', 'squat'],
};

// ─── Volume Prescriptions ───────────────────────────────────

interface VolumePrescription {
  sets: number;
  reps: number;
  holdSeconds: number;
  restSeconds: number;
  tempo?: string;
}

function getVolume(goal: UserGoal, isPrimary: boolean): VolumePrescription {
  switch (goal) {
    case 'strength':
      return { sets: isPrimary ? 5 : 3, reps: 5, holdSeconds: 15, restSeconds: isPrimary ? 150 : 90 };
    case 'muscle':
      return { sets: isPrimary ? 4 : 3, reps: 10, holdSeconds: 20, restSeconds: 75, tempo: '3-1-1' };
    case 'skills':
      return { sets: isPrimary ? 5 : 3, reps: 6, holdSeconds: 12, restSeconds: isPrimary ? 120 : 90 };
    default: // general_fitness
      return { sets: isPrimary ? 3 : 3, reps: 10, holdSeconds: 20, restSeconds: 60 };
  }
}

// ─── Workout Generator ──────────────────────────────────────

function findExercisesForPattern(
  pattern: MovementPattern,
  targetLevel: ProgressionLevel,
  userEquipment: EquipmentId[],
) {
  const equipmentSet = new Set(['none', ...userEquipment]);

  // Try exact level first, then adjacent
  for (const tryLevel of [targetLevel, targetLevel - 1, targetLevel + 1, targetLevel - 2, targetLevel + 2]) {
    if (tryLevel < 1 || tryLevel > 5) continue;
    const exercises = getExercisesByPattern(pattern, tryLevel as ProgressionLevel);
    const filtered = exercises.filter((e) =>
      e.equipment.some((eq) => equipmentSet.has(eq))
    );
    if (filtered.length > 0) return filtered;
  }

  // Last resort: any level
  const all = getExercisesByPattern(pattern);
  return all.filter((e) => e.equipment.some((eq) => equipmentSet.has(eq)));
}

function generateWorkoutForDay(
  focus: WorkoutFocus,
  label: string,
  levels: Record<MovementPattern, ProgressionLevel>,
  equipment: EquipmentId[],
  goal: UserGoal,
): Workout {
  const patterns = FOCUS_PATTERNS[focus] || FOCUS_PATTERNS.full_body;
  const exercises: WorkoutExercise[] = [];
  let totalSeconds = 0;

  patterns.forEach((pattern, idx) => {
    const isPrimary = idx < 2; // first 2 patterns are primary
    const available = findExercisesForPattern(pattern, levels[pattern], equipment);
    if (available.length === 0) return;

    // Pick 1-2 exercises per pattern
    const pick = isPrimary && available.length >= 2 ? 2 : 1;
    const selected = available.slice(0, pick);

    for (const ex of selected) {
      const vol = getVolume(goal, isPrimary);
      const we: WorkoutExercise = {
        exerciseId: ex.id,
        sets: vol.sets,
        restSeconds: vol.restSeconds,
        ...(ex.mode === 'hold' ? { holdSeconds: vol.holdSeconds } : { reps: vol.reps }),
        ...(vol.tempo && ex.mode === 'reps' ? { tempo: vol.tempo } : {}),
      };
      exercises.push(we);

      // Estimate time
      const workTime = ex.mode === 'hold' ? vol.holdSeconds : vol.reps * 3;
      totalSeconds += vol.sets * (workTime + vol.restSeconds);
    }
  });

  return {
    id: `gen_${focus}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: label,
    focus,
    level: levels[patterns[0]] || 3,
    equipment,
    estimatedMinutes: Math.round(totalSeconds / 60),
    exercises,
  };
}

// ─── Program Generator ──────────────────────────────────────

export function generateProgram(profile: UserProfile): {
  program: Program;
  workouts: Workout[];
} {
  const template = SCHEDULE_TEMPLATES[profile.goal] || SCHEDULE_TEMPLATES.general_fitness;
  const workouts: Workout[] = [];

  // Generate a workout for each training day
  const schedule: ProgramDay[] = [];

  for (let day = 0; day < 7; day++) {
    const templateDay = template.days.find((d) => d.dayOfWeek === day);
    if (templateDay) {
      const workout = generateWorkoutForDay(
        templateDay.focus,
        templateDay.label,
        profile.derivedLevels,
        profile.equipment,
        profile.goal,
      );
      workouts.push(workout);
      schedule.push({
        dayOfWeek: day,
        workoutId: workout.id,
        label: templateDay.label,
      });
    } else {
      schedule.push({
        dayOfWeek: day,
        workoutId: null,
        label: 'Rest',
      });
    }
  }

  const program: Program = {
    id: `program_${Date.now()}`,
    name: `${profile.goal.replace('_', ' ')} protocol`.replace(/\b\w/g, (c) => c.toUpperCase()),
    description: `4-week ${template.daysPerWeek}-day program tailored to your assessment.`,
    level: profile.derivedLevels.push_horizontal,
    durationWeeks: 4,
    daysPerWeek: template.daysPerWeek,
    schedule,
  };

  return { program, workouts };
}
