import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { GlossyButton } from '@/components/glossy-button';
import { StatBox } from '@/components/ui/stat-box';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useAppState } from '@/contexts/app-state';
import { getXPToNextRank, RANKS } from '@/data/gamification';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function SessionCompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, clearSessionSummary } = useAppState();
  const summary = state.lastSessionSummary;

  if (!summary) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.fallback}>No session data</Text>
        <GlossyButton label="Go back" onPress={() => router.replace('/(tabs)')} />
      </View>
    );
  }

  const rankInfo = getXPToNextRank(state.gamification.totalXP);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.completeLabel}>SESSION COMPLETE</Text>
        <Text style={styles.title}>{summary.workoutName}</Text>
        <Text style={styles.focusLabel}>{summary.workoutFocus.replace('_', ' ').toUpperCase()}</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatBox value={formatTime(summary.totalTimeSeconds)} label="Duration" />
        <StatBox value={String(summary.setsCompleted)} label="Sets" />
        <StatBox value={String(summary.exerciseCount)} label="Exercises" />
      </View>

      {/* XP Earned — hero number */}
      <View style={styles.xpCard}>
        <Text style={styles.xpLabel}>XP EARNED</Text>
        <Text style={styles.xpNumber}>+{summary.xpEarned}</Text>

        {/* XP breakdown */}
        <View style={styles.xpBreakdown}>
          {summary.xpBreakdown.map((ev, i) => (
            <View key={i} style={styles.xpRow}>
              <Text style={styles.xpRowDetail}>{ev.detail}</Text>
              <Text style={styles.xpRowValue}>+{ev.xp}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Rank progress */}
      <View style={styles.rankSection}>
        <View style={styles.rankHeader}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankBadgeText}>{rankInfo.current.name}</Text>
          </View>
          {rankInfo.next && (
            <Text style={styles.rankNext}>{rankInfo.xpNeeded} XP to {rankInfo.next.name}</Text>
          )}
        </View>
        <ProgressBar progress={rankInfo.progress} />
      </View>

      {/* Rank up callout */}
      {summary.rankChanged && (
        <View style={styles.rankUpCard}>
          <Text style={styles.rankUpTag}>RANK UP</Text>
          <Text style={styles.rankUpTitle}>
            {RANKS.find((r) => r.id === summary.previousRank)?.name} → {RANKS.find((r) => r.id === summary.newRank)?.name}
          </Text>
        </View>
      )}

      {/* New badges */}
      {summary.newBadges.length > 0 && (
        <View style={styles.badgeSection}>
          <Text style={styles.sectionLabel}>NEW BADGES</Text>
          {summary.newBadges.map((badge) => (
            <View key={badge.id} style={styles.badgeCard}>
              <Text style={styles.badgeName}>{badge.name}</Text>
              <Text style={styles.badgeDesc}>{badge.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Muscles worked */}
      {summary.musclesWorked.length > 0 && (
        <View style={styles.muscleSection}>
          <Text style={styles.sectionLabel}>MUSCLES WORKED</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.musclePills}>
            {summary.musclesWorked.map((m, i) => (
              <View key={i} style={[styles.musclePill, m.role === 'primary' ? styles.musclePrimary : styles.muscleSecondary]}>
                <Text style={[styles.musclePillText, m.role === 'primary' && styles.musclePillTextPrimary]}>
                  {m.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Done button */}
      <View style={styles.buttonWrap}>
        <GlossyButton
          label="Done"
          onPress={() => {
            clearSessionSummary();
            router.replace('/(tabs)');
          }}
        />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  fallback: { fontFamily: fonts.body, fontSize: 16, color: colors.textMuted, padding: spacing.lg },

  header: { alignItems: 'center', paddingTop: spacing.xxl, marginBottom: spacing.xl },
  completeLabel: { fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 2, color: colors.textMuted, marginBottom: spacing.sm },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.text, letterSpacing: -1, textAlign: 'center' },
  focusLabel: { fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 1.5, color: colors.textMuted, marginTop: spacing.xs },

  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },

  xpCard: {
    backgroundColor: colors.text, borderRadius: radius.xl, padding: spacing.lg,
    alignItems: 'center', marginBottom: spacing.lg,
  },
  xpLabel: { fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.5)', marginBottom: spacing.xs },
  xpNumber: { fontFamily: fonts.display, fontSize: 64, color: '#FFFFFF', letterSpacing: -3, lineHeight: 70 },
  xpBreakdown: { marginTop: spacing.md, width: '100%', gap: spacing.xs },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  xpRowDetail: { fontFamily: fonts.body, fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  xpRowValue: { fontFamily: fonts.monoMedium, fontSize: 13, color: '#FFFFFF' },

  rankSection: { marginBottom: spacing.lg, gap: spacing.sm },
  rankHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rankBadge: { backgroundColor: colors.text, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 6 },
  rankBadgeText: { fontFamily: fonts.monoMedium, fontSize: 11, color: '#FFFFFF', letterSpacing: 1 },
  rankNext: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },

  rankUpCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    alignItems: 'center', marginBottom: spacing.lg, borderWidth: 2, borderColor: colors.text,
  },
  rankUpTag: { fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 2, color: colors.textMuted, marginBottom: spacing.xs },
  rankUpTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.text },

  badgeSection: { marginBottom: spacing.lg },
  sectionLabel: { fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 1.5, color: colors.textMuted, marginBottom: spacing.sm },
  badgeCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    marginBottom: spacing.xs, gap: 2,
  },
  badgeName: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.text },
  badgeDesc: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },

  muscleSection: { marginBottom: spacing.xl },
  musclePills: { gap: spacing.sm },
  musclePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  musclePrimary: { backgroundColor: colors.text, borderColor: colors.text },
  muscleSecondary: { backgroundColor: colors.bg },
  musclePillText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary },
  musclePillTextPrimary: { color: '#FFFFFF' },

  buttonWrap: { marginTop: spacing.sm },
});
