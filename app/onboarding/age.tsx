import { StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingStep } from '@/components/onboarding-step';
import { useOnboarding } from '@/contexts/onboarding';
import { colors, fonts, spacing, radius } from '@/constants/theme';

export default function NameAgeScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  const canContinue = data.name.length > 0 && data.age.length > 0;

  return (
    <OnboardingStep
      step={1}
      title="What's your name and age?"
      subtitle="This will be used to personalize your experience."
      canContinue={canContinue}
      onContinue={() => router.push('/onboarding/measurements')}>
      <View style={styles.fields}>
        <TextInput
          style={styles.input}
          value={data.name}
          onChangeText={(v) => update({ name: v })}
          placeholder="Your name"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          value={data.age}
          onChangeText={(v) => update({ age: v.replace(/[^0-9]/g, '') })}
          placeholder="Age"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={3}
        />
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.sm },
  input: {
    fontFamily: fonts.displayMedium,
    fontSize: 20,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 20,
    paddingHorizontal: spacing.lg,
  },
});
