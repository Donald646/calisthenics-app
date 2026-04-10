// ─── Equipment ───────────────────────────────────────────────

export type EquipmentId =
  | 'none'
  | 'pull_up_bar'
  | 'parallel_bars'
  | 'rings'
  | 'resistance_band'
  | 'parallettes'
  | 'ab_wheel'
  | 'dip_station';

export interface Equipment {
  id: EquipmentId;
  name: string;
  icon: string; // SF Symbol name
}

// ─── Muscles ─────────────────────────────────────────────────

export type MuscleGroupId =
  | 'pectoralis'
  | 'anterior_deltoid'
  | 'lateral_deltoid'
  | 'posterior_deltoid'
  | 'trapezius'
  | 'latissimus'
  | 'rhomboids'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'rectus_abdominis'
  | 'obliques'
  | 'erector_spinae'
  | 'glutes'
  | 'quadriceps'
  | 'hamstrings'
  | 'calves'
  | 'hip_flexors';

export type MuscleView = 'anterior' | 'posterior';

export interface MuscleGroup {
  id: MuscleGroupId;
  name: string;
  view: MuscleView;
}

export type MuscleRole = 'primary' | 'secondary' | 'stabilizer';

export interface ExerciseMuscle {
  muscleId: MuscleGroupId;
  role: MuscleRole;
}

// ─── Movement patterns ──────────────────────────────────────

export type MovementPattern =
  | 'push_horizontal'
  | 'push_vertical'
  | 'pull_horizontal'
  | 'pull_vertical'
  | 'squat'
  | 'hinge'
  | 'core'
  | 'skill';

// ─── Progressions & Exercises ───────────────────────────────

export type ProgressionLevel = 1 | 2 | 3 | 4 | 5;

export type ExerciseMode = 'reps' | 'hold' | 'reps_each_side';

export interface Exercise {
  id: string;
  name: string;
  pattern: MovementPattern;
  level: ProgressionLevel;
  mode: ExerciseMode;
  equipment: EquipmentId[];
  muscles: ExerciseMuscle[];
  cues: string[]; // coaching cues
  videoUrl?: string;
}

// ─── Workouts ───────────────────────────────────────────────

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps?: number;        // for mode === 'reps'
  holdSeconds?: number; // for mode === 'hold'
  restSeconds: number;
  tempo?: string;       // e.g. "3-1-1"
}

export type WorkoutFocus = 'push' | 'pull' | 'legs' | 'full_body' | 'core' | 'skills' | 'mobility';

export interface Workout {
  id: string;
  name: string;
  focus: WorkoutFocus;
  level: ProgressionLevel;
  equipment: EquipmentId[];
  estimatedMinutes: number;
  exercises: WorkoutExercise[];
}

// ─── Programs ───────────────────────────────────────────────

export interface ProgramDay {
  dayOfWeek: number; // 0=Mon, 6=Sun
  workoutId: string | null; // null = rest day
  label: string; // e.g. "Push Day", "Rest"
}

export interface Program {
  id: string;
  name: string;
  description: string;
  level: ProgressionLevel;
  durationWeeks: number;
  daysPerWeek: number;
  schedule: ProgramDay[];
}

// ─── User ───────────────────────────────────────────────────

export type UserGoal = 'general_fitness' | 'strength' | 'skills' | 'muscle';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserAssessment {
  maxPushUps: number;
  maxPullUps: number;
  maxSquatHoldSeconds: number;
  canDip: boolean;
  lSitHoldSeconds: number;
}

export interface UserProfile {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  sex: 'male' | 'female' | 'other';
  goal: UserGoal;
  experience: ExperienceLevel;
  equipment: EquipmentId[];
  assessment: UserAssessment;
  derivedLevels: Record<MovementPattern, ProgressionLevel>;
}

// ─── Session tracking ───────────────────────────────────────

export interface SetLog {
  setNumber: number;
  reps?: number;
  holdSeconds?: number;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
}

export interface SessionLog {
  id: string;
  workoutId: string;
  startedAt: string; // ISO date
  completedAt?: string;
  exercises: ExerciseLog[];
}
