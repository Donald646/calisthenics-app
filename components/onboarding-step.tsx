import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import type { ReactNode } from 'react';

const TOTAL_STEPS = 6;

interface Props {
  step: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  canContinue: boolean;
  onContinue: () => void;
  buttonLabel?: string;
}

export function OnboardingStep({
  step, title, subtitle, children, canContinue, onContinue, buttonLabel = 'Continue',
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.progressRow}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View key={i} style={[
            styles.bar,
            i < step ? styles.barDone : i === step ? styles.barActive : styles.barPending,
          ]} />
        ))}
      </View>

      <View style={styles.header}>
        <Text style={styles.stepNum}>{String(step + 1).padStart(2, '0')}/{String(TOTAL_STEPS).padStart(2, '0')}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.content}>{children}</View>

      <Pressable
        style={[styles.button, !canContinue && styles.buttonDisabled]}
        onPress={onContinue}
        disabled={!canContinue}>
        <Text style={[styles.buttonText, !canContinue && styles.buttonTextDisabled]}>{buttonLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: spacing.xl },
  bar: { flex: 1, height: 3, borderRadius: 2 },
  barDone: { backgroundColor: colors.text },
  barActive: { backgroundColor: colors.text },
  barPending: { backgroundColor: colors.border },
  header: { marginBottom: spacing.xl },
  stepNum: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.5, color: colors.textMuted, marginBottom: spacing.sm },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.text, letterSpacing: -0.8, lineHeight: 36 },
  subtitle: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 22 },
  content: { flex: 1 },
  button: { backgroundColor: colors.buttonBg, borderRadius: radius.full, paddingVertical: 20, alignItems: 'center' },
  buttonDisabled: { backgroundColor: colors.buttonDisabledBg },
  buttonText: { fontFamily: fonts.displayMedium, fontSize: 17, color: colors.buttonText },
  buttonTextDisabled: { color: colors.buttonDisabledText },
});
