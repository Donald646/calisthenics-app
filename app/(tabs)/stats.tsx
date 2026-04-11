import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { RadarChart } from '@/components/ui/radar-chart';
import { useAppState } from '@/contexts/app-state';
import { getXPToNextRank } from '@/data/gamification';
import { ProgressBar } from '@/components/ui/progress-bar';

// Each skill axis gets a unique color
const SKILL_AXES = [
  { label: 'Push', value: 72, color: '#FF6B6B' },
  { label: 'Pull', value: 58, color: '#4ECDC4' },
  { label: 'Legs', value: 65, color: '#45B7D1' },
  { label: 'Core', value: 80, color: '#96CEB4' },
  { label: 'Skills', value: 40, color: '#DDA0DD' },
  { label: 'Mobility', value: 55, color: '#F7DC6F' },
];

const PERSONAL_RECORDS = [
  { exercise: 'Push-Ups', value: '32 reps', date: 'Apr 7', color: '#FF6B6B' },
  { exercise: 'Pull-Ups', value: '12 reps', date: 'Apr 5', color: '#4ECDC4' },
  { exercise: 'L-Sit Hold', value: '18 sec', date: 'Apr 3', color: '#DDA0DD' },
  { exercise: 'Pistol Squat', value: '5 each', date: 'Mar 30', color: '#45B7D1' },
];

// Mini XP ring
function XPRing({ progress, size = 64 }: { progress: number; size?: number }) {
  const s = 5;
  const r = (size - s) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <SvgCircle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={s} fill="none" />
      <SvgCircle cx={size / 2} cy={size / 2} r={r} stroke={colors.text} strokeWidth={s} fill="none"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - Math.min(1, progress))} strokeLinecap="round" />
    </Svg>
  );
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useAppState();
  const gam = state.gamification;
  const rankInfo = getXPToNextRank(gam.totalXP);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      <Text style={styles.title}>Stats</Text>

      {/* Rank + XP card */}
      <View style={styles.rankCard}>
        <View style={styles.rankLeft}>
          <View style={styles.xpRingWrap}>
            <XPRing progress={rankInfo.progress} />
            <Text style={styles.xpRingText}>{Math.round(rankInfo.progress * 100)}%</Text>
          </View>
        </View>
        <View style={styles.rankRight}>
          <Text style={styles.rankName}>{rankInfo.current.name}</Text>
          <Text style={styles.rankXP}>{gam.totalXP} XP</Text>
          {rankInfo.next && (
            <Text style={styles.rankNext}>{rankInfo.xpNeeded} XP to {rankInfo.next.name}</Text>
          )}
        </View>
      </View>

      {/* Quick stats */}
      <View style={styles.quickStats}>
        <View style={styles.quickStat}>
          <Text style={styles.quickValue}>{gam.currentStreak}</Text>
          <Text style={styles.quickLabel}>Streak</Text>
        </View>
        <View style={[styles.quickStatDivider]} />
        <View style={styles.quickStat}>
          <Text style={styles.quickValue}>{state.sessionHistory.length}</Text>
          <Text style={styles.quickLabel}>Sessions</Text>
        </View>
        <View style={[styles.quickStatDivider]} />
        <View style={styles.quickStat}>
          <Text style={styles.quickValue}>{gam.badges.filter((b) => b.unlockedAt).length}</Text>
          <Text style={styles.quickLabel}>Badges</Text>
        </View>
      </View>

      {/* Radar chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Strength profile</Text>
        <View style={styles.radarCard}>
          <RadarChart axes={SKILL_AXES} size={260} />
        </View>
      </View>

      {/* Colored breakdown bars */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Breakdown</Text>
        {SKILL_AXES.map((axis) => (
          <View key={axis.label} style={styles.barRow}>
            <View style={[styles.barDot, { backgroundColor: axis.color }]} />
            <Text style={styles.barLabel}>{axis.label}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${axis.value}%`, backgroundColor: axis.color }]} />
            </View>
            <Text style={[styles.barValue, { color: axis.color }]}>{axis.value}</Text>
          </View>
        ))}
      </View>

      {/* Personal records */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal records</Text>
        {PERSONAL_RECORDS.map((pr, i) => (
          <View key={i} style={styles.prRow}>
            <View style={[styles.prAccent, { backgroundColor: pr.color }]} />
            <View style={styles.prInfo}>
              <Text style={styles.prExercise}>{pr.exercise}</Text>
              <Text style={styles.prDate}>{pr.date}</Text>
            </View>
            <Text style={styles.prValue}>{pr.value}</Text>
          </View>
        ))}
      </View>

      {/* Badges unlocked */}
      {gam.badges.some((b) => b.unlockedAt) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <View style={styles.badgeGrid}>
            {gam.badges.filter((b) => b.unlockedAt).map((b) => (
              <View key={b.id} style={styles.badgeItem}>
                <View style={styles.badgeCircle}>
                  <Text style={styles.badgeEmoji}>⭐</Text>
                </View>
                <Text style={styles.badgeName}>{b.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.text, letterSpacing: -0.8, paddingTop: spacing.md, marginBottom: spacing.lg },

  // Rank card
  rankCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  rankLeft: {},
  xpRingWrap: { alignItems: 'center', justifyContent: 'center' },
  xpRingText: { position: 'absolute', fontFamily: fonts.display, fontSize: 14, color: colors.text },
  rankRight: { flex: 1, gap: 2 },
  rankName: { fontFamily: fonts.display, fontSize: 24, color: colors.text, letterSpacing: -0.5 },
  rankXP: { fontFamily: fonts.monoMedium, fontSize: 13, color: colors.textSecondary },
  rankNext: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },

  // Quick stats
  quickStats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingVertical: spacing.md, marginBottom: spacing.xl,
  },
  quickStat: { flex: 1, alignItems: 'center', gap: 2 },
  quickValue: { fontFamily: fonts.display, fontSize: 22, color: colors.text },
  quickLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  quickStatDivider: { width: 1, height: 28, backgroundColor: colors.border },

  section: { marginBottom: spacing.xl },
  sectionTitle: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.text, marginBottom: spacing.md },

  // Radar
  radarCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },

  // Colored bars
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 14 },
  barDot: { width: 8, height: 8, borderRadius: 4 },
  barLabel: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text, width: 56 },
  barTrack: { flex: 1, height: 6, backgroundColor: colors.surface, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  barValue: { fontFamily: fonts.display, fontSize: 15, width: 30, textAlign: 'right' },

  // PRs
  prRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  prAccent: { width: 3, height: 32, borderRadius: 2 },
  prInfo: { flex: 1, gap: 1 },
  prExercise: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  prDate: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  prValue: { fontFamily: fonts.displayMedium, fontSize: 15, color: colors.text },

  // Badges
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  badgeItem: { alignItems: 'center', gap: spacing.xs, width: 72 },
  badgeCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.border,
  },
  badgeEmoji: { fontSize: 20 },
  badgeName: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, textAlign: 'center' },
});
