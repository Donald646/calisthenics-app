import type { Workout } from '@/types';

export const sampleWorkouts: Workout[] = [
  {
    id: 'push_int_01',
    name: 'Planche Progression',
    focus: 'push',
    level: 3,
    equipment: ['parallettes'],
    estimatedMinutes: 42,
    exercises: [
      {
        exerciseId: 'pseudo_planche_pushup',
        sets: 4,
        reps: 8,
        restSeconds: 90,
        tempo: '3-1-1',
      },
      {
        exerciseId: 'tuck_planche',
        sets: 5,
        holdSeconds: 15,
        restSeconds: 120,
      },
      {
        exerciseId: 'scapular_pushup',
        sets: 3,
        reps: 12,
        restSeconds: 60,
      },
      {
        exerciseId: 'pike_pushup',
        sets: 4,
        reps: 8,
        restSeconds: 90,
        tempo: '3-1-1',
      },
      {
        exerciseId: 'diamond_pushup',
        sets: 3,
        reps: 12,
        restSeconds: 60,
      },
      {
        exerciseId: 'parallel_bar_dip',
        sets: 4,
        reps: 10,
        restSeconds: 90,
      },
      {
        exerciseId: 'hollow_body_hold',
        sets: 3,
        holdSeconds: 30,
        restSeconds: 60,
      },
      {
        exerciseId: 'plank',
        sets: 2,
        holdSeconds: 45,
        restSeconds: 60,
      },
    ],
  },
  {
    id: 'pull_int_01',
    name: 'Pull Protocol 02',
    focus: 'pull',
    level: 3,
    equipment: ['pull_up_bar'],
    estimatedMinutes: 38,
    exercises: [
      {
        exerciseId: 'pullup',
        sets: 5,
        reps: 6,
        restSeconds: 120,
        tempo: '2-1-1',
      },
      {
        exerciseId: 'chest_to_bar_pullup',
        sets: 3,
        reps: 4,
        restSeconds: 120,
      },
      {
        exerciseId: 'body_row',
        sets: 4,
        reps: 10,
        restSeconds: 90,
      },
      {
        exerciseId: 'scapular_pull',
        sets: 3,
        reps: 12,
        restSeconds: 60,
      },
      {
        exerciseId: 'hanging_leg_raise',
        sets: 3,
        reps: 10,
        restSeconds: 60,
      },
      {
        exerciseId: 'dead_hang',
        sets: 3,
        holdSeconds: 30,
        restSeconds: 60,
      },
    ],
  },
  {
    id: 'legs_int_01',
    name: 'Legs Day Alpha',
    focus: 'legs',
    level: 3,
    equipment: ['none'],
    estimatedMinutes: 52,
    exercises: [
      {
        exerciseId: 'split_squat',
        sets: 4,
        reps: 8,
        restSeconds: 90,
      },
      {
        exerciseId: 'bodyweight_squat',
        sets: 3,
        reps: 20,
        restSeconds: 60,
      },
      {
        exerciseId: 'nordic_curl_negative',
        sets: 4,
        reps: 5,
        restSeconds: 120,
      },
      {
        exerciseId: 'single_leg_bridge',
        sets: 3,
        reps: 12,
        restSeconds: 60,
      },
      {
        exerciseId: 'shrimp_squat',
        sets: 3,
        reps: 5,
        restSeconds: 120,
      },
      {
        exerciseId: 'calf_raise',
        sets: 3,
        reps: 15,
        restSeconds: 60,
      },
      {
        exerciseId: 'glute_bridge',
        sets: 3,
        reps: 15,
        restSeconds: 60,
      },
      {
        exerciseId: 'back_extension',
        sets: 3,
        holdSeconds: 20,
        restSeconds: 60,
      },
      {
        exerciseId: 'dead_bug',
        sets: 3,
        reps: 12,
        restSeconds: 45,
      },
    ],
  },
];

export function getWorkoutById(id: string): Workout | undefined {
  return sampleWorkouts.find((w) => w.id === id);
}
