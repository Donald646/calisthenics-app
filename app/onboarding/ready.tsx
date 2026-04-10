import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/contexts/onboarding';
import { useAppState } from '@/contexts/app-state';
import { colors, fonts, spacing } from '@/constants/theme';
import { GlossyButton } from '@/components/glossy-button';
import type { ProgressionLevel } from '@/types';

function deriveLevel(pushUps: number, pullUps: number, experience: string): ProgressionLevel {
  const avg = (pushUps + pullUps * 3) / 2; // pull-ups weighted heavier
  if (avg < 5 || experience === 'beginner') return 1;
  if (avg < 15) return 2;
  if (avg < 30) return 3;
  if (avg < 50 || experience === 'intermediate') return 4;
  return 5;
}

const GOAL_LABELS: Record<string, string> = {
  general_fitness: 'General Fitness',
  strength: 'Raw Strength',
  skills: 'Skill Unlock',
  muscle: 'Hypertrophy',
};

const LEVEL_LABELS: Record<number, string> = {
  1: 'Foundation',
  2: 'Developing',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Elite',
};

export default function ReadyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data } = useOnboarding();
  const { completeOnboarding } = useAppState();

  const pushUps = parseInt(data.maxPushUps, 10) || 0;
  const pullUps = parseInt(data.maxPullUps, 10) || 0;
  const level = deriveLevel(pushUps, pullUps, data.experience);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      {/* Progress — all done */}
      <View style={styles.progressRow}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={[styles.progressDot, styles.progressDone]} />
        ))}
      </View>

      <View style={styles.hero}>
        <Text style={styles.readyLabel}>YOUR PROTOCOL</Text>
        <Text style={styles.heroTitle}>
          {data.name ? `${data.name},` : 'Hey,'}
          {'\n'}you're ready.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>GOAL</Text>
          <Text style={styles.summaryValue}>{GOAL_LABELS[data.goal] || data.goal}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>STARTING LEVEL</Text>
          <Text style={styles.summaryValue}>{LEVEL_LABELS[level]}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>EQUIPMENT</Text>
          <Text style={styles.summaryValue}>
            {data.equipment.length === 0
              ? 'Bodyweight only'
              : `${data.equipment.length} items`}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>PROGRAM</Text>
          <Text style={styles.summaryValue}>4-week protocol</Text>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <GlossyButton
        label="Start training"
        icon="→"
        onPress={() => {
          completeOnboarding(data);
          router.replace('/(tabs)');
        }}
      />
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
    backgroundColor: colors.accent,
  },
  hero: {
    marginBottom: spacing.xl,
  },
  readyLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.text,
    letterSpacing: -1.5,
    lineHeight: 44,
  },
  summaryCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  summaryLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.text,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: '#fff',
  },
});
