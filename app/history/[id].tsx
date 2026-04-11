import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { useAppState } from '@/contexts/app-state';
import { getExerciseById } from '@/data/exercises';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, getWorkout } = useAppState();

  const session = state.sessionHistory.find((s) => s.id === id);
  if (!session) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={{ color: colors.textMuted, padding: 24 }}>Session not found</Text>
      </View>
    );
  }

  const workout = getWorkout(session.workoutId);
  const duration = session.completedAt
    ? Math.round((new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 1000)
    : 0;
  const totalSets = session.exercises.reduce((s, e) => s + e.sets.filter((st) => st.completed).length, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Session Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.name}>{workout?.name || 'Workout'}</Text>
        <Text style={styles.date}>
          {new Date(session.startedAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{Math.floor(duration / 60)}</Text>
            <Text style={styles.statLabel}>min</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{totalSets}</Text>
            <Text style={styles.statLabel}>sets</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{session.exercises.length}</Text>
            <Text style={styles.statLabel}>exercises</Text>
          </View>
        </View>

        {/* Exercise breakdown */}
        <Text style={styles.sectionTitle}>Exercises</Text>
        {session.exercises.map((exLog, i) => {
          const ex = getExerciseById(exLog.exerciseId);
          return (
            <View key={i} style={styles.exCard}>
              <View style={styles.exHeader}>
                <Text style={styles.exIdx}>{String(i + 1).padStart(2, '0')}</Text>
                <Text style={styles.exName}>{ex?.name || exLog.exerciseId}</Text>
              </View>
              <View style={styles.setList}>
                {exLog.sets.map((set, j) => (
                  <View key={j} style={styles.setRow}>
                    <Text style={styles.setNum}>Set {set.setNumber}</Text>
                    <Text style={styles.setVal}>
                      {set.reps ? `${set.reps} reps` : set.holdSeconds ? `${set.holdSeconds}s hold` : '—'}
                    </Text>
                    <View style={[styles.checkDot, set.completed && styles.checkDotDone]} />
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, color: colors.text },
  headerTitle: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.text },

  scroll: { paddingHorizontal: spacing.lg },
  name: { fontFamily: fonts.display, fontSize: 28, color: colors.text, letterSpacing: -0.8, marginBottom: spacing.xs },
  date: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, marginBottom: spacing.lg },

  statsRow: {
    flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl,
  },
  stat: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingVertical: 16, paddingHorizontal: spacing.md, gap: 2, alignItems: 'center',
  },
  statVal: { fontFamily: fonts.display, fontSize: 24, color: colors.text },
  statLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },

  sectionTitle: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.text, marginBottom: spacing.md },

  exCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.sm,
  },
  exHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  exIdx: { fontFamily: fonts.monoMedium, fontSize: 11, color: colors.textMuted },
  exName: { fontFamily: fonts.displayMedium, fontSize: 15, color: colors.text },

  setList: { gap: spacing.xs },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 4 },
  setNum: { fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted, width: 40 },
  setVal: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text, flex: 1 },
  checkDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  checkDotDone: { backgroundColor: colors.text },
});
