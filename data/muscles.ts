import type { MuscleGroup } from '@/types';

export const muscleGroups: MuscleGroup[] = [
  // Anterior
  { id: 'pectoralis', name: 'Pectoralis Major', view: 'anterior' },
  { id: 'anterior_deltoid', name: 'Anterior Deltoids', view: 'anterior' },
  { id: 'biceps', name: 'Biceps Brachii', view: 'anterior' },
  { id: 'rectus_abdominis', name: 'Rectus Abdominis', view: 'anterior' },
  { id: 'obliques', name: 'Obliques', view: 'anterior' },
  { id: 'quadriceps', name: 'Quadriceps', view: 'anterior' },
  { id: 'hip_flexors', name: 'Hip Flexors', view: 'anterior' },
  { id: 'forearms', name: 'Forearms', view: 'anterior' },

  // Posterior
  { id: 'trapezius', name: 'Trapezius', view: 'posterior' },
  { id: 'latissimus', name: 'Latissimus Dorsi', view: 'posterior' },
  { id: 'rhomboids', name: 'Rhomboids', view: 'posterior' },
  { id: 'posterior_deltoid', name: 'Posterior Deltoids', view: 'posterior' },
  { id: 'lateral_deltoid', name: 'Lateral Deltoids', view: 'posterior' },
  { id: 'triceps', name: 'Triceps Brachii', view: 'posterior' },
  { id: 'erector_spinae', name: 'Erector Spinae', view: 'posterior' },
  { id: 'glutes', name: 'Glutes', view: 'posterior' },
  { id: 'hamstrings', name: 'Hamstrings', view: 'posterior' },
  { id: 'calves', name: 'Calves', view: 'posterior' },
];
