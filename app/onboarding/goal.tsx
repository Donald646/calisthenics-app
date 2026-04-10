import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingStep } from '@/components/onboarding-step';
import { useOnboarding } from '@/contexts/onboarding';
import { colors, fonts, spacing } from '@/constants/theme';
import type { UserGoal } from '@/types';

const GOALS: { value: UserGoal; title: string; desc: string }[] = [
  {
    value: 'general_fitness',
    title: 'General Fitness',
    desc: 'Build a strong foundation with balanced programming',
  },
  {
    value: 'strength',
    title: 'Raw Strength',
    desc: 'Maximize pushing and pulling power through progressive overload',
  },
  {
    value: 'skills',
    title: 'Unlock Skills',
    desc: 'Work toward muscle-ups, handstands, planches, and levers',
  },
  {
    value: 'muscle',
    title: 'Build Muscle',
    desc: 'Hypertrophy-focused training with higher volume protocols',
  },
];

export default function GoalScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  return (
    <OnboardingStep
      step={1}
      title="What's your goal?"
      subtitle="This shapes your program structure and exercise selection."
      canContinue={data.goal !== ''}
      onContinue={() => router.push('/onboarding/equipment')}>
      <View style={styles.options}>
        {GOALS.map((g) => (
          <Pressable
            key={g.value}
            style={[styles.option, data.goal === g.value && styles.optionActive]}
            onPress={() => update({ goal: g.value })}>
            <Text style={[styles.optionTitle, data.goal === g.value && styles.optionTitleActive]}>
              {g.title}
            </Text>
            <Text style={[styles.optionDesc, data.goal === g.value && styles.optionDescActive]}>
              {g.desc}
            </Text>
          </Pressable>
        ))}
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: spacing.sm,
  },
  option: {
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  optionActive: {
    backgroundColor: colors.dark,
    borderColor: colors.dark,
  },
  optionTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 18,
    color: colors.text,
    marginBottom: 4,
  },
  optionTitleActive: {
    color: colors.bg,
  },
  optionDesc: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  optionDescActive: {
    color: colors.textMuted,
  },
});
