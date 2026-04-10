import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { GlossyButton } from '@/components/glossy-button';
import type { ReactNode } from 'react';

const TOTAL_STEPS = 8;

interface Props {
  step: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  canContinue: boolean;
  onContinue: () => void;
  buttonLabel?: string;
  showBack?: boolean;
}

export function OnboardingStep({
  step, title, subtitle, children, canContinue, onContinue,
  buttonLabel = 'Continue', showBack = true,
}: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const progress = (step + 1) / TOTAL_STEPS;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      {/* Top bar: back + progress */}
      <View style={styles.topBar}>
        {showBack && step > 0 ? (
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* Content — centered in available space */}
      <View style={styles.content}>{children}</View>

      {/* Continue button */}
      <GlossyButton
        label={buttonLabel}
        onPress={onContinue}
        disabled={!canContinue}
      />
    </View>
  );
}

// ─── Reusable option card for single-select ─────────────────

interface OptionCardProps {
  label: string;
  sublabel?: string;
  selected: boolean;
  onPress: () => void;
}

export function OptionCard({ label, sublabel, selected, onPress }: OptionCardProps) {
  return (
    <Pressable
      style={[styles.optionCard, selected && styles.optionCardSelected]}
      onPress={onPress}>
      <View style={styles.optionContent}>
        <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{label}</Text>
        {sublabel && (
          <Text style={[styles.optionSublabel, selected && styles.optionSublabelSelected]}>{sublabel}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },

  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, color: colors.text },
  backPlaceholder: { width: 40 },
  progressTrack: { flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: colors.text, borderRadius: 2 },

  header: { marginBottom: spacing.xl },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.text, letterSpacing: -0.8, lineHeight: 36 },
  subtitle: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 22 },

  content: { flex: 1, justifyContent: 'center' },

  // Option cards — Cal AI style
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 20,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  optionCardSelected: {
    backgroundColor: colors.text,
  },
  optionContent: { gap: 2 },
  optionLabel: {
    fontFamily: fonts.displayMedium,
    fontSize: 18,
    color: colors.text,
  },
  optionLabelSelected: {
    color: '#FFFFFF',
  },
  optionSublabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  optionSublabelSelected: {
    color: 'rgba(255,255,255,0.6)',
  },
});
