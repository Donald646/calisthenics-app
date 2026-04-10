import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/theme';

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const TODAY_IDX = 3;

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.name}>Donald</Text>
        </View>
        <View style={styles.streakPill}>
          <View style={styles.streakDot} />
          <Text style={styles.streakText}>12 day streak</Text>
        </View>
      </View>

      {/* Week strip */}
      <View style={styles.weekRow}>
        {WEEK_DAYS.map((day, i) => {
          const isToday = i === TODAY_IDX;
          const isDone = i < TODAY_IDX;
          return (
            <View key={i} style={[styles.weekDay, isToday && styles.weekDayActive]}>
              <Text style={[styles.weekLabel, isToday && styles.weekLabelActive]}>{day}</Text>
              {isDone && <View style={styles.checkDot} />}
              {isToday && <View style={styles.todayDot} />}
            </View>
          );
        })}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { value: '2.3k', label: 'Volume' },
          { value: '38%', label: 'Protocol' },
          { value: '8', label: 'Sessions' },
        ].map((s, i) => (
          <View key={i} style={styles.statItem}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Today's workout */}
      <Text style={styles.sectionTitle}>Today's session</Text>

      <View style={styles.workoutCard}>
        <View style={styles.cardRow}>
          <Text style={styles.cardTag}>PUSH · INTERMEDIATE</Text>
          <Text style={styles.cardCounter}>03/08</Text>
        </View>

        <Text style={styles.cardTitle}>Planche{'\n'}Progression</Text>

        <View style={styles.cardMetaRow}>
          {[
            { v: '42', l: 'min' },
            { v: '8', l: 'moves' },
            { v: '320', l: 'kcal' },
          ].map((m, i) => (
            <View key={i} style={styles.cardMeta}>
              <Text style={styles.cardMetaVal}>{m.v}</Text>
              <Text style={styles.cardMetaLabel}>{m.l}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={styles.startButton}
          onPress={() => router.push('/workout/push_int_01')}>
          <Text style={styles.startButtonText}>Start workout</Text>
          <Text style={styles.startButtonArrow}>→</Text>
        </Pressable>
      </View>

      {/* Recent */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Recent</Text>
        <Pressable>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>

      {[
        { name: 'Pull Protocol 02', meta: '38 min · 6 moves', day: 'Yesterday', pr: true },
        { name: 'Legs Day Alpha', meta: '52 min · 9 moves', day: 'Monday', pr: false },
        { name: 'Rest · Mobility', meta: '18 min', day: 'Sunday', pr: false },
      ].map((s, i) => (
        <View key={i} style={styles.recentRow}>
          <View style={styles.recentLeft}>
            <Text style={styles.recentName}>{s.name}</Text>
            <Text style={styles.recentMeta}>{s.meta}</Text>
          </View>
          <View style={styles.recentRight}>
            <Text style={styles.recentDay}>{s.day}</Text>
            {s.pr && (
              <View style={styles.prBadge}>
                <Text style={styles.prText}>PR</Text>
              </View>
            )}
          </View>
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 80 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: spacing.md,
    marginBottom: spacing.xl,
  },
  greeting: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.text,
    letterSpacing: -0.8,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  streakDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text,
  },
  streakText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.text,
  },

  // Week
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  weekDay: {
    width: 40,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.md,
  },
  weekDayActive: {
    backgroundColor: colors.text,
  },
  weekLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  weekLabelActive: {
    color: colors.bg,
  },
  checkDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.bg,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 18,
    paddingHorizontal: spacing.md,
    gap: 2,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },

  // Section
  sectionTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: spacing.lg,
  },
  seeAll: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textMuted,
  },

  // Workout card
  workoutCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardTag: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.textMuted,
  },
  cardCounter: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.text,
    letterSpacing: -1.2,
    lineHeight: 40,
    marginBottom: spacing.lg,
  },
  cardMetaRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  cardMeta: { gap: 1 },
  cardMetaVal: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.text,
    letterSpacing: -0.5,
  },
  cardMetaLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  startButton: {
    backgroundColor: colors.buttonBg,
    borderRadius: radius.full,
    paddingVertical: 18,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  startButtonText: {
    fontFamily: fonts.displayMedium,
    fontSize: 17,
    color: colors.buttonText,
  },
  startButtonArrow: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.buttonText,
  },

  // Recent
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentLeft: { flex: 1, gap: 2 },
  recentName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.text,
  },
  recentMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  recentRight: { alignItems: 'flex-end', gap: 4 },
  recentDay: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  prBadge: {
    backgroundColor: colors.text,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  prText: {
    fontFamily: fonts.monoMedium,
    fontSize: 9,
    color: colors.bg,
    letterSpacing: 0.5,
  },
});
