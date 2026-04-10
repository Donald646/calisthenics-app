import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { GlossyButton } from '@/components/glossy-button';
import { WeekStrip } from '@/components/ui/week-strip';
import { useAppState } from '@/contexts/app-state';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getRelativeDay(dateStr: string): string {
  const diff = Math.round((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, getTodaysWorkout, getWorkout } = useAppState();

  if (!state.profile) return <Redirect href="/onboarding" />;

  const profile = state.profile;
  const gam = state.gamification;
  const todayData = getTodaysWorkout();
  const todayDOW = (new Date().getDay() + 6) % 7;
  const hasSessions = state.sessionHistory.length > 0;

  const recent = [...state.sessionHistory]
    .filter((s) => s.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 3);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* Header — clean, just name + streak */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.name}>{profile.name}</Text>
        </View>
        {gam.currentStreak > 0 && (
          <View style={styles.streakPill}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>{gam.currentStreak}</Text>
          </View>
        )}
      </View>

      {/* Week strip */}
      <View style={{ marginBottom: spacing.xl }}>
        <WeekStrip todayIndex={todayDOW} />
      </View>

      {/* Today's workout — the main focus */}
      {todayData ? (
        <View style={styles.workoutCard}>
          <Text style={styles.cardLabel}>{todayData.dayLabel}</Text>
          <Text style={styles.cardTitle}>{todayData.workout.name}</Text>

          <View style={styles.cardMeta}>
            <Text style={styles.metaItem}>{todayData.workout.estimatedMinutes} min</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaItem}>{todayData.workout.exercises.length} exercises</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaItem}>{Math.round(todayData.workout.estimatedMinutes * 7.5)} kcal</Text>
          </View>

          <GlossyButton
            label="Start workout"
            icon="→"
            onPress={() => router.push(`/workout/${todayData.workout.id}`)}
          />
        </View>
      ) : (
        <View style={styles.restCard}>
          <Text style={styles.restEmoji}>😌</Text>
          <Text style={styles.restTitle}>Rest Day</Text>
          <Text style={styles.restSub}>Recovery is part of the protocol.{'\n'}Come back stronger tomorrow.</Text>
        </View>
      )}

      {/* Challenges — only show if they exist */}
      {gam.weeklyChallenges.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Challenges</Text>
            <Text style={styles.sectionMeta}>This week</Text>
          </View>
          {gam.weeklyChallenges.map((c) => (
            <View key={c.id} style={[styles.challengeRow, c.completed && styles.challengeRowDone]}>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeName}>{c.title}</Text>
                <Text style={styles.challengeDesc}>{c.current}/{c.target} · {c.description}</Text>
              </View>
              <Text style={styles.challengeXP}>+{c.xpReward}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent sessions */}
      {recent.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <Pressable><Text style={styles.seeAll}>See all</Text></Pressable>
          </View>
          {recent.map((s, i) => {
            const w = getWorkout(s.workoutId);
            return (
              <View key={i} style={styles.recentRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentName}>{w?.name || 'Workout'}</Text>
                  <Text style={styles.recentMeta}>
                    {s.exercises.length} exercises · {s.exercises.reduce((sum, e) => sum + e.sets.filter((st) => st.completed).length, 0)} sets
                  </Text>
                </View>
                <Text style={styles.recentDay}>{getRelativeDay(s.startedAt)}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Empty state — first time */}
      {!hasSessions && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>💪</Text>
          <Text style={styles.emptyTitle}>Your journey starts today</Text>
          <Text style={styles.emptySub}>Complete your first workout to start tracking progress.</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 80 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingTop: spacing.md, marginBottom: spacing.lg,
  },
  greeting: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary, marginBottom: 2 },
  name: { fontFamily: fonts.display, fontSize: 32, color: colors.text, letterSpacing: -0.8 },
  streakPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.surface, borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  streakEmoji: { fontSize: 14 },
  streakText: { fontFamily: fonts.display, fontSize: 16, color: colors.text },

  // Workout card
  workoutCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.xl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  cardLabel: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textMuted, marginBottom: spacing.xs },
  cardTitle: { fontFamily: fonts.display, fontSize: 28, color: colors.text, letterSpacing: -0.8, marginBottom: spacing.md },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.lg },
  metaItem: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textMuted },

  // Rest day
  restCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl,
    alignItems: 'center', marginBottom: spacing.xl, gap: spacing.sm,
  },
  restEmoji: { fontSize: 32 },
  restTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.text },
  restSub: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },

  // Sections
  section: { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.md },
  sectionTitle: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.text },
  sectionMeta: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  seeAll: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textMuted },

  // Challenges
  challengeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  challengeRowDone: { opacity: 0.5 },
  challengeInfo: { flex: 1, gap: 2 },
  challengeName: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  challengeDesc: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  challengeXP: { fontFamily: fonts.monoMedium, fontSize: 12, color: colors.textMuted },

  // Recent
  recentRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  recentName: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  recentMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  recentDay: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },

  // Empty state
  emptyCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl,
    alignItems: 'center', marginTop: spacing.md, gap: spacing.sm,
  },
  emptyEmoji: { fontSize: 32 },
  emptyTitle: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.text },
  emptySub: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
