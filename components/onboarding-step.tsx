import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '@/constants/theme';
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
  step,
  title,
  subtitle,
  children,
  canContinue,
  onContinue,
  buttonLabel = 'Continue',
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      {/* Progress bar */}
      <View style={styles.progressRow}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i < step
                ? styles.progressDone
                : i === step
                  ? styles.progressActive
                  : styles.progressPending,
            ]}
          />
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.stepLabel}>
          {String(step + 1).padStart(2, '0')} / {String(TOTAL_STEPS).padStart(2, '0')}
        </Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* Content */}
      <View style={styles.content}>{children}</View>

      {/* Continue button */}
      <Pressable
        style={[styles.button, !canContinue && styles.buttonDisabled]}
        onPress={onContinue}
        disabled={!canContinue}>
        <Text style={[styles.buttonText, !canContinue && styles.buttonTextDisabled]}>
          {buttonLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.xl,
  },
  progressDot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  progressDone: {
    backgroundColor: colors.text,
  },
  progressActive: {
    backgroundColor: colors.accent,
  },
  progressPending: {
    backgroundColor: colors.border,
  },
  header: {
    marginBottom: spacing.xl,
  },
  stepLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.text,
    letterSpacing: -1,
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  button: {
    backgroundColor: colors.dark,
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.bgCard,
  },
  buttonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.bg,
  },
  buttonTextDisabled: {
    color: colors.textMuted,
  },
});
