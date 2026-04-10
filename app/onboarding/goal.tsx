import { useRouter } from 'expo-router';
import { OnboardingStep, OptionCard } from '@/components/onboarding-step';
import { useOnboarding } from '@/contexts/onboarding';
import type { UserGoal } from '@/types';

const GOALS: { value: UserGoal; label: string; sub: string }[] = [
  { value: 'general_fitness', label: 'General Fitness', sub: 'Balanced strength and conditioning' },
  { value: 'strength', label: 'Raw Strength', sub: 'Maximize pushing and pulling power' },
  { value: 'skills', label: 'Unlock Skills', sub: 'Muscle-ups, handstands, planches' },
  { value: 'muscle', label: 'Build Muscle', sub: 'Higher volume hypertrophy training' },
];

export default function GoalScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  return (
    <OnboardingStep
      step={3}
      title="What is your goal?"
      subtitle="This helps us generate a plan for your training."
      canContinue={data.goal !== ''}
      onContinue={() => router.push('/onboarding/equipment')}>
      {GOALS.map((g) => (
        <OptionCard
          key={g.value}
          label={g.label}
          sublabel={g.sub}
          selected={data.goal === g.value}
          onPress={() => update({ goal: g.value })}
        />
      ))}
    </OnboardingStep>
  );
}
