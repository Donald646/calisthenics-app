import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingStep } from '@/components/onboarding-step';
import { useOnboarding } from '@/contexts/onboarding';
import { colors, fonts, spacing } from '@/constants/theme';

export default function AssessmentScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  const canContinue =
    data.maxPushUps.length > 0 &&
    data.maxPullUps.length > 0 &&
    data.canDip !== null;

  return (
    <OnboardingStep
      step={3}
      title="Quick assessment."
      subtitle="Don't overthink it — rough numbers are fine. This places you on the right progression level."
      canContinue={canContinue}
      onContinue={() => router.push('/onboarding/experience')}>
      <View style={styles.fields}>
        <View style={styles.field}>
          <Text style={styles.label}>MAX PUSH-UPS WITHOUT STOPPING</Text>
          <TextInput
            style={styles.input}
            value={data.maxPushUps}
            onChangeText={(v) => update({ maxPushUps: v })}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>MAX PULL-UPS WITHOUT STOPPING</Text>
          <TextInput
            style={styles.input}
            value={data.maxPullUps}
            onChangeText={(v) => update({ maxPullUps: v })}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>MAX SQUAT HOLD (SECONDS)</Text>
          <TextInput
            style={styles.input}
            value={data.maxSquatHoldSeconds}
            onChangeText={(v) => update({ maxSquatHoldSeconds: v })}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>CAN YOU DO A FULL DIP?</Text>
          <View style={styles.chipRow}>
            <Pressable
              style={[styles.chip, data.canDip === true && styles.chipActive]}
              onPress={() => update({ canDip: true })}>
              <Text style={[styles.chipText, data.canDip === true && styles.chipTextActive]}>
                Yes
              </Text>
            </Pressable>
            <Pressable
              style={[styles.chip, data.canDip === false && styles.chipActive]}
              onPress={() => update({ canDip: false })}>
              <Text style={[styles.chipText, data.canDip === false && styles.chipTextActive]}>
                Not yet
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>L-SIT HOLD (SECONDS) — OPTIONAL</Text>
          <TextInput
            style={styles.input}
            value={data.lSitHoldSeconds}
            onChangeText={(v) => update({ lSitHoldSeconds: v })}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
          />
        </View>
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textSecondary,
  },
  input: {
    fontFamily: fonts.displayMedium,
    fontSize: 24,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 999,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.dark,
    borderColor: colors.dark,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.bg,
  },
});
