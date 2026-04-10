import { Stack } from 'expo-router';
import { OnboardingProvider } from '@/contexts/onboarding';
import { colors } from '@/constants/theme';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'none',
        }}
      />
    </OnboardingProvider>
  );
}
