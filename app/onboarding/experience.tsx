import { useRouter } from 'expo-router';
import { OnboardingStep, OptionCard } from '@/components/onboarding-step';
import { useOnboarding } from '@/contexts/onboarding';
import type { ExperienceLevel } from '@/types';

const LEVELS: { value: ExperienceLevel; label: string; sub: string }[] = [
  { value: 'beginner', label: '0–2 per week', sub: 'Just getting started with calisthenics' },
  { value: 'intermediate', label: '3–5 per week', sub: 'Consistent training, building strength' },
  { value: 'advanced', label: '6+ per week', sub: 'Dedicated athlete, working on skills' },
];

export default function ExperienceScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  return (
    <OnboardingStep
      step={5}
      title="How many workouts do you do per week?"
      subtitle="This will be used to calibrate your custom plan."
      canContinue={data.experience !== ''}
      onContinue={() => router.push('/onboarding/assessment')}>
      {LEVELS.map((lvl) => (
        <OptionCard
          key={lvl.value}
          label={lvl.label}
          sublabel={lvl.sub}
          selected={data.experience === lvl.value}
          onPress={() => update({ experience: lvl.value })}
        />
      ))}
    </OnboardingStep>
  );
}
