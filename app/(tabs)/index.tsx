import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { GlossyButton } from '@/components/glossy-button';
import { WeekStrip } from '@/components/ui/week-strip';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useAppState } from '@/contexts/app-state';
import { getXPToNextRank } from '@/data/gamification';

function MiniRing({ progress, size = 48 }: { progress: number; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <SvgCircle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
      <SvgCircle cx={size / 2} cy={size / 2} r={r} stroke={colors.text} strokeWidth={stroke} fill="none"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)} strokeLinecap="round" />
    </Svg>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getRelativeDay(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, getTodaysWorkout, getWorkout } = useAppState();

  // Not onboarded → redirect
  if (!state.profile) {
    return <Redirect href="/onboarding" />;
  }

  const profile = state.profile;
  const gam = state.gamification;
  const rankInfo = getXPToNextRank(gam.totalXP);
  const todayData = getTodaysWorkout();
  const todayDOW = (new Date().getDay() + 6) % 7;

  // Week completion from session history
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - todayDOW);
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const thisWeekSessions = state.sessionHistory.filter((s) => s.startedAt >= weekStartStr);

  // Stats
  const totalSetsThisWeek = thisWeekSessions.reduce(
    (sum, s) => sum + s.exercises.reduce((es, e) => es + e.sets.filter((st) => st.completed).length, 0), 0
  );
  const programProgress = state.currentProgram
    ? Math.min(1, thisWeekSessions.length / state.currentProgram.daysPerWeek)
    : 0;

  // Recent sessions (last 3)
  const recent = [...state.sessionHistory]
    .filter((s) => s.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 3);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.name}>{profile.name}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.rankPill}>
            <Text style={styles.rankPillText}>{rankInfo.current.name}</Text>
          </View>
          <View style={styles.streakPill}>
            <View style={styles.streakDot} />
            <Text style={styles.streakText}>{gam.currentStreak} day streak</Text>
          </View>
        </View>
      </View>

      {/* Week strip */}
      <View style={{ marginBottom: spacing.lg }}>
        <WeekStrip todayIndex={todayDOW} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalSetsThisWeek}</Text>
          <Text style={styles.statLabel}>Sets this week</Text>
        </View>
        <View style={styles.statCardRing}>
          <View style={styles.ringWrap}>
            <MiniRing progress={programProgress} />
            <Text style={styles.ringPercent}>{Math.round(programProgress * 100)}%</Text>
          </View>
          <Text style={styles.statLabel}>Protocol</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{state.sessionHistory.length}</Text>
          <Text style={styles.statLabel}>Total sessions</Text>
        </View>
      </View>

      {/* XP progress to next rank */}
      <View style={styles.xpBar}>
        <View style={styles.xpBarHeader}>
          <Text style={styles.xpBarLabel}>{gam.totalXP} XP</Text>
          {rankInfo.next && <Text style={styles.xpBarNext}>{rankInfo.next.name}</Text>}
        </View>
        <ProgressBar progress={rankInfo.progress} />
      </View>

      {/* Today's workout */}
      <Text style={styles.sectionTitle}>Today's session</Text>

      {todayData ? (
        <View style={styles.workoutCard}>
          <View style={styles.cardRow}>
            <View style={styles.focusPill}>
              <Text style={styles.focusPillText}>{todayData.workout.focus.replace('_', ' ').toUpperCase()}</Text>
            </View>
            <Text style={styles.cardCounter}>{todayData.dayLabel}</Text>
          </View>

          <Text style={styles.cardTitle}>{todayData.workout.name}</Text>

          <View style={styles.cardMetaRow}>
            {[
              { v: String(todayData.workout.estimatedMinutes), l: 'min' },
              { v: String(todayData.workout.exercises.length), l: 'moves' },
              { v: String(Math.round(todayData.workout.estimatedMinutes * 7.5)), l: 'kcal' },
            ].map((m, i) => (
              <View key={i} style={styles.cardMeta}>
                <Text style={styles.cardMetaVal}>{m.v}</Text>
                <Text style={styles.cardMetaLabel}>{m.l}</Text>
              </View>
            ))}
          </View>

          <GlossyButton
            label="Start workout"
            icon="→"
            onPress={() => router.push(`/workout/${todayData.workout.id}`)}
          />
        </View>
      ) : (
        <View style={styles.restCard}>
          <Text style={styles.restTitle}>Rest Day</Text>
          <Text style={styles.restSub}>Recovery is part of the protocol. Come back stronger tomorrow.</Text>
        </View>
      )}

      {/* Weekly challenges */}
      {gam.weeklyChallenges.length > 0 && (
        <>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Challenges</Text>
            <Text style={styles.challengeWeek}>This week</Text>
          </View>
          {gam.weeklyChallenges.map((c) => (
            <View key={c.id} style={[styles.challengeCard, c.completed && styles.challengeCardDone]}>
              <View style={styles.challengeTop}>
                <Text style={styles.challengeTitle}>{c.title}</Text>
                <View style={styles.challengeXP}>
                  <Text style={styles.challengeXPText}>+{c.xpReward} XP</Text>
                </View>
              </View>
              <Text style={styles.challengeDesc}>{c.description}</Text>
              <View style={styles.challengeProgress}>
                <ProgressBar progress={c.target > 0 ? c.current / c.target : 0} />
                <Text style={styles.challengeCount}>{c.current}/{c.target}</Text>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Recent */}
      {recent.length > 0 && (
        <>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <Pressable><Text style={styles.seeAll}>See all</Text></Pressable>
          </View>
          {recent.map((s, i) => {
            const w = getWorkout(s.workoutId);
            const sets = s.exercises.reduce((sum, e) => sum + e.sets.filter((st) => st.completed).length, 0);
            return (
              <View key={i} style={styles.recentCard}>
                <View style={styles.recentTop}>
                  <View style={styles.recentFocusDot} />
                  <Text style={styles.recentFocus}>{(w?.focus || 'workout').replace('_', ' ').toUpperCase()}</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={styles.recentDay}>{getRelativeDay(s.startedAt)}</Text>
                </View>
                <Text style={styles.recentName}>{w?.name || 'Workout'}</Text>
                <Text style={styles.recentMeta}>{sets} sets · {s.exercises.length} exercises</Text>
              </View>
            );
          })}
        </>
      )}

      {/* Empty state for no sessions yet */}
      {state.sessionHistory.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Ready to start?</Text>
          <Text style={styles.emptySub}>Complete your first workout to see your progress here.</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 80 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: spacing.md, marginBottom: spacing.xl },
  greeting: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary, marginBottom: 2 },
  name: { fontFamily: fonts.display, fontSize: 32, color: colors.text, letterSpacing: -0.8 },
  headerRight: { alignItems: 'flex-end', gap: spacing.xs },
  rankPill: { backgroundColor: colors.text, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5 },
  rankPillText: { fontFamily: fonts.monoMedium, fontSize: 9, color: '#FFFFFF', letterSpacing: 1 },
  streakPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  streakDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.text },
  streakText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.text },

  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statCardRing: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  ringWrap: { alignItems: 'center', justifyContent: 'center' },
  ringPercent: { position: 'absolute', fontFamily: fonts.display, fontSize: 13, color: colors.text },
  statValue: { fontFamily: fonts.display, fontSize: 22, color: colors.text, letterSpacing: -0.5 },
  statLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },

  xpBar: { marginBottom: spacing.xl, gap: spacing.xs },
  xpBarHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  xpBarLabel: { fontFamily: fonts.monoMedium, fontSize: 11, color: colors.text, letterSpacing: 0.5 },
  xpBarNext: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },

  sectionTitle: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.text, marginBottom: spacing.md },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: spacing.lg },
  seeAll: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textMuted },

  workoutCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  focusPill: { backgroundColor: colors.text, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5 },
  focusPillText: { fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 1.5, color: '#FFFFFF' },
  cardCounter: { fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted },
  cardTitle: { fontFamily: fonts.display, fontSize: 32, color: colors.text, letterSpacing: -1, lineHeight: 36, marginBottom: spacing.lg },
  cardMetaRow: { flexDirection: 'row', gap: spacing.xl, marginBottom: spacing.lg },
  cardMeta: { gap: 1 },
  cardMetaVal: { fontFamily: fonts.display, fontSize: 20, color: colors.text, letterSpacing: -0.5 },
  cardMetaLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },

  restCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl,
    alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm,
  },
  restTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.text },
  restSub: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },

  challengeWeek: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  challengeCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.sm, gap: spacing.sm,
  },
  challengeCardDone: { borderWidth: 1, borderColor: colors.text },
  challengeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  challengeTitle: { fontFamily: fonts.displayMedium, fontSize: 15, color: colors.text },
  challengeXP: { backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 3 },
  challengeXPText: { fontFamily: fonts.monoMedium, fontSize: 10, color: colors.textMuted },
  challengeDesc: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  challengeProgress: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  challengeCount: { fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted, minWidth: 30, textAlign: 'right' },

  recentCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  recentTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  recentFocusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.text },
  recentFocus: { fontFamily: fonts.monoMedium, fontSize: 9, letterSpacing: 1, color: colors.textMuted },
  recentDay: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  recentName: { fontFamily: fonts.displayMedium, fontSize: 17, color: colors.text, letterSpacing: -0.3 },
  recentMeta: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },

  emptyCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl,
    alignItems: 'center', marginTop: spacing.lg, gap: spacing.sm,
  },
  emptyTitle: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.text },
  emptySub: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
});
