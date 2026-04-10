import { StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingStep } from '@/components/onboarding-step';
import { useOnboarding } from '@/contexts/onboarding';
import { colors, fonts, spacing } from '@/constants/theme';

const SEX_OPTIONS = [
  { value: 'male' as const, label: 'Male' },
  { value: 'female' as const, label: 'Female' },
  { value: 'other' as const, label: 'Other' },
];

export default function BasicsScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  const canContinue = data.name.length > 0 && data.age.length > 0 && data.sex !== '';

  return (
    <OnboardingStep
      step={0}
      title="Let's start with the basics."
      subtitle="We'll use this to personalize your training."
      canContinue={canContinue}
      onContinue={() => router.push('/onboarding/goal')}>
      <View style={styles.fields}>
        <View style={styles.field}>
          <Text style={styles.label}>NAME</Text>
          <TextInput
            style={styles.input}
            value={data.name}
            onChangeText={(v) => update({ name: v })}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>AGE</Text>
            <TextInput
              style={styles.input}
              value={data.age}
              onChangeText={(v) => update({ age: v })}
              placeholder="25"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>HEIGHT (CM)</Text>
            <TextInput
              style={styles.input}
              value={data.heightCm}
              onChangeText={(v) => update({ heightCm: v })}
              placeholder="175"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>WEIGHT (KG)</Text>
            <TextInput
              style={styles.input}
              value={data.weightKg}
              onChangeText={(v) => update({ weightKg: v })}
              placeholder="70"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>SEX</Text>
          <View style={styles.chipRow}>
            {SEX_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.chip, data.sex === opt.value && styles.chipActive]}
                onPress={() => update({ sex: opt.value })}>
                <Text style={[styles.chipText, data.sex === opt.value && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
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
    fontFamily: fonts.bodyMedium,
    fontSize: 18,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
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
