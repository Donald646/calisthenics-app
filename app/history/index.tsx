import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { useAppState } from '@/contexts/app-state';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  return `${m} min`;
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, getWorkout } = useAppState();

  const sessions = [...state.sessionHistory]
    .filter((s) => s.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.title}>History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {sessions.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No sessions yet</Text>
            <Text style={styles.emptySub}>Complete a workout to see it here.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.count}>{sessions.length} sessions</Text>
            {sessions.map((session) => {
              const w = getWorkout(session.workoutId);
              const totalSets = session.exercises.reduce(
                (sum, e) => sum + e.sets.filter((s) => s.completed).length, 0
              );
              const duration = session.completedAt
                ? Math.round((new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 1000)
                : 0;

              return (
                <Pressable key={session.id} style={styles.sessionCard}
                  onPress={() => router.push(`/history/${session.id}`)}>
                  <View style={styles.sessionTop}>
                    <View style={styles.focusDot} />
                    <Text style={styles.sessionFocus}>
                      {(w?.focus || 'workout').replace('_', ' ').toUpperCase()}
                    </Text>
                    <View style={{ flex: 1 }} />
                    <Text style={styles.sessionDate}>{formatDate(session.startedAt)}</Text>
                  </View>
                  <Text style={styles.sessionName}>{w?.name || 'Workout'}</Text>
                  <View style={styles.sessionMeta}>
                    <Text style={styles.metaText}>{formatDuration(duration)}</Text>
                    <View style={styles.metaDot} />
                    <Text style={styles.metaText}>{session.exercises.length} exercises</Text>
                    <View style={styles.metaDot} />
                    <Text style={styles.metaText}>{totalSets} sets</Text>
                  </View>
                </Pressable>
              );
            })}
          </>
        )}
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
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.text },

  scroll: { paddingHorizontal: spacing.lg },
  count: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginBottom: spacing.md },

  sessionCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.sm, gap: spacing.xs,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  sessionTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  focusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.text },
  sessionFocus: { fontFamily: fonts.monoMedium, fontSize: 9, letterSpacing: 1, color: colors.textMuted },
  sessionDate: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  sessionName: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.text, letterSpacing: -0.3 },
  sessionMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textMuted },

  empty: { alignItems: 'center', paddingTop: spacing.xxl * 2, gap: spacing.sm },
  emptyEmoji: { fontSize: 32 },
  emptyTitle: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.text },
  emptySub: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
});
