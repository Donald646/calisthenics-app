import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingStep, OptionCard } from '@/components/onboarding-step';
import { useOnboarding } from '@/contexts/onboarding';
import { colors, fonts, spacing, radius } from '@/constants/theme';

export default function AssessmentScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  const canContinue = data.maxPushUps.length > 0 && data.maxPullUps.length > 0 && data.canDip !== null;

  return (
    <OnboardingStep
      step={6}
      title="Quick fitness check"
      subtitle="Don't overthink it — rough numbers are fine. This places you on the right level."
      canContinue={canContinue}
      onContinue={() => router.push('/onboarding/ready')}>
      <View style={styles.fields}>
        <View style={styles.field}>
          <Text style={styles.label}>Max push-ups without stopping</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={data.maxPushUps}
              onChangeText={(v) => update({ maxPushUps: v.replace(/[^0-9]/g, '') })}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={3}
            />
            <Text style={styles.unit}>reps</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Max pull-ups without stopping</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={data.maxPullUps}
              onChangeText={(v) => update({ maxPullUps: v.replace(/[^0-9]/g, '') })}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={3}
            />
            <Text style={styles.unit}>reps</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Can you do a full dip?</Text>
          <View style={styles.optionRow}>
            <OptionCard label="Yes" selected={data.canDip === true} onPress={() => update({ canDip: true })} />
            <OptionCard label="Not yet" selected={data.canDip === false} onPress={() => update({ canDip: false })} />
          </View>
        </View>
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.lg },
  field: { gap: spacing.sm },
  label: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textSecondary },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: 14,
  },
  input: { flex: 1, fontFamily: fonts.display, fontSize: 28, color: colors.text, letterSpacing: -1 },
  unit: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted },
  optionRow: { gap: spacing.sm },
});
