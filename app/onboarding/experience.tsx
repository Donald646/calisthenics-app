import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingStep } from '@/components/onboarding-step';
import { useOnboarding } from '@/contexts/onboarding';
import { colors, fonts, spacing } from '@/constants/theme';
import type { ExperienceLevel } from '@/types';

const LEVELS: { value: ExperienceLevel; title: string; desc: string }[] = [
  {
    value: 'beginner',
    title: 'Beginner',
    desc: 'New to calisthenics or just getting started with bodyweight training',
  },
  {
    value: 'intermediate',
    title: 'Intermediate',
    desc: 'Can do 10+ push-ups, a few pull-ups, and have trained consistently',
  },
  {
    value: 'advanced',
    title: 'Advanced',
    desc: 'Working on skills like muscle-ups, handstands, or levers',
  },
];

export default function ExperienceScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  return (
    <OnboardingStep
      step={4}
      title="How experienced are you?"
      subtitle="We'll cross-reference this with your assessment numbers."
      canContinue={data.experience !== ''}
      onContinue={() => router.push('/onboarding/ready')}>
      <View style={styles.options}>
        {LEVELS.map((lvl) => (
          <Pressable
            key={lvl.value}
            style={[styles.option, data.experience === lvl.value && styles.optionActive]}
            onPress={() => update({ experience: lvl.value })}>
            <Text
              style={[
                styles.optionTitle,
                data.experience === lvl.value && styles.optionTitleActive,
              ]}>
              {lvl.title}
            </Text>
            <Text
              style={[
                styles.optionDesc,
                data.experience === lvl.value && styles.optionDescActive,
              ]}>
              {lvl.desc}
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
