import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingStep } from '@/components/onboarding-step';
import { useOnboarding } from '@/contexts/onboarding';
import { colors, fonts, spacing, radius } from '@/constants/theme';

export default function MeasurementsScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  const canContinue = data.heightCm.length > 0 && data.weightKg.length > 0;

  return (
    <OnboardingStep
      step={2}
      title="Height & weight"
      subtitle="This will be used to calibrate your custom plan."
      canContinue={canContinue}
      onContinue={() => router.push('/onboarding/goal')}>
      <View style={styles.fields}>
        <View style={styles.field}>
          <Text style={styles.label}>Height</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={data.heightCm}
              onChangeText={(v) => update({ heightCm: v.replace(/[^0-9]/g, '') })}
              placeholder="175"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={3}
            />
            <Text style={styles.unit}>cm</Text>
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Weight</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={data.weightKg}
              onChangeText={(v) => update({ weightKg: v.replace(/[^0-9]/g, '') })}
              placeholder="70"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={3}
            />
            <Text style={styles.unit}>kg</Text>
          </View>
        </View>
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.xl },
  field: { gap: spacing.sm },
  label: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textSecondary },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: 16,
  },
  input: {
    flex: 1, fontFamily: fonts.display, fontSize: 32, color: colors.text, letterSpacing: -1,
  },
  unit: { fontFamily: fonts.body, fontSize: 16, color: colors.textMuted },
});
