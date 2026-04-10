import { useRouter } from 'expo-router';
import { OnboardingStep, OptionCard } from '@/components/onboarding-step';
import { useOnboarding } from '@/contexts/onboarding';

export default function GenderScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  return (
    <OnboardingStep
      step={0}
      title="Choose your gender"
      subtitle="This will be used to calibrate your custom plan."
      canContinue={data.sex !== ''}
      onContinue={() => router.push('/onboarding/age')}
      showBack={false}>
      <OptionCard label="Male" selected={data.sex === 'male'} onPress={() => update({ sex: 'male' })} />
      <OptionCard label="Female" selected={data.sex === 'female'} onPress={() => update({ sex: 'female' })} />
      <OptionCard label="Other" selected={data.sex === 'other'} onPress={() => update({ sex: 'other' })} />
    </OnboardingStep>
  );
}
