import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { getWorkoutById } from '@/data/workouts';
import { getExerciseById } from '@/data/exercises';

const FOCUS_LABELS: Record<string, string> = {
  push: 'PUSH',
  pull: 'PULL',
  legs: 'LEGS',
  full_body: 'FULL BODY',
  core: 'CORE',
  skills: 'SKILLS',
  mobility: 'MOBILITY',
};

const LEVEL_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Developing',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Elite',
};

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const workout = getWorkoutById(id);
  if (!workout) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Workout not found</Text>
      </View>
    );
  }

  const totalSets = workout.exercises.reduce((sum, e) => sum + e.sets, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Nav bar */}
        <View style={styles.navBar}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>← BACK</Text>
          </Pressable>
          <Text style={styles.navLabel}>
            W3 · D2 · {FOCUS_LABELS[workout.focus] || workout.focus}
          </Text>
          <Text style={styles.heartIcon}>♡</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.protocolLabel}>PROTOCOL 03</Text>
          <Text style={styles.title}>{workout.name}.</Text>
          <Text style={styles.description}>
            Static strength protocol. Build the scapular strength needed for your next progression.
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>TIME</Text>
            <Text style={styles.statValue}>{workout.estimatedMinutes} MIN</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>MOVES</Text>
            <Text style={styles.statValue}>
              {String(workout.exercises.length).padStart(2, '0')}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>BURN</Text>
            <Text style={styles.statValue}>{Math.round(workout.estimatedMinutes * 7.5)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>LVL</Text>
            <Text style={styles.statValue}>
              {LEVEL_LABELS[workout.level]?.substring(0, 3).toUpperCase() || workout.level}
            </Text>
          </View>
        </View>

        {/* Movements header */}
        <View style={styles.movementsHeader}>
          <Text style={styles.movementsTitle}>Movements</Text>
          <Text style={styles.movementsCount}>
            01 — {String(workout.exercises.length).padStart(2, '0')}
          </Text>
        </View>

        {/* Exercise list */}
        {workout.exercises.map((we, index) => {
          const exercise = getExerciseById(we.exerciseId);
          if (!exercise) return null;

          const detail = we.holdSeconds
            ? `${we.sets} × ${we.holdSeconds}S HOLD`
            : `${we.sets} × ${we.reps} REPS`;

          return (
            <View key={we.exerciseId} style={styles.exerciseRow}>
              <Text style={styles.exerciseIndex}>
                {String(index + 1).padStart(2, '0')}
              </Text>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {detail} · {we.restSeconds}S REST
                  {we.tempo ? ` · TEMPO ${we.tempo}` : ''}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          );
        })}

        {/* Spacer for bottom button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.bottomMeta}>
          <Text style={styles.bottomLabel}>READY WHEN YOU ARE</Text>
          <Text style={styles.bottomTitle}>Begin session</Text>
        </View>
        <Pressable
          style={styles.playButton}
          onPress={() => router.push(`/session/${workout.id}`)}>
          <Text style={styles.playIcon}>▶</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    padding: spacing.lg,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textSecondary,
    padding: spacing.lg,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backText: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.text,
  },
  navLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  heartIcon: {
    fontSize: 22,
    color: colors.text,
  },
  header: {
    marginBottom: spacing.xl,
  },
  protocolLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 42,
    color: colors.text,
    letterSpacing: -1.5,
    lineHeight: 46,
    marginBottom: spacing.md,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  statItem: {
    flex: 1,
    gap: spacing.xs,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: colors.border,
  },
  statLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.textSecondary,
  },
  statValue: {
    fontFamily: fonts.displayMedium,
    fontSize: 18,
    color: colors.text,
  },
  movementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  movementsTitle: {
    fontFamily: fonts.displayRegular,
    fontSize: 18,
    color: colors.text,
  },
  movementsCount: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textSecondary,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  exerciseIndex: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.accent,
    width: 24,
  },
  exerciseInfo: {
    flex: 1,
    gap: 3,
  },
  exerciseName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.text,
  },
  exerciseMeta: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.textSecondary,
  },
  chevron: {
    fontFamily: fonts.body,
    fontSize: 22,
    color: colors.textMuted,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.dark,
    paddingHorizontal: spacing.lg,
    paddingTop: 20,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  bottomMeta: {
    gap: 4,
  },
  bottomLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.textMuted,
  },
  bottomTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 18,
    color: colors.bg,
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 18,
    color: colors.dark,
    marginLeft: 3,
  },
});
