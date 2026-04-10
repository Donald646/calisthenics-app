import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { GlossyButton } from '@/components/glossy-button';
import { ExerciseRow } from '@/components/ui/exercise-row';
import { useAppState } from '@/contexts/app-state';
import { getExerciseById } from '@/data/exercises';

const LEVEL_LABELS = ['Beginner', 'Foundation', 'Intermediate', 'Advanced', 'Elite'];

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getWorkout } = useAppState();
  const workout = getWorkout(id);

  if (!workout) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={{ color: colors.textMuted, padding: 24 }}>Workout not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Nav */}
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Pressable><Text style={styles.heartText}>♡</Text></Pressable>
        </View>

        {/* Header */}
        <Text style={styles.tag}>
          {workout.focus.replace('_', ' ').toUpperCase()} · {LEVEL_LABELS[workout.level - 1]}
        </Text>
        <Text style={styles.title}>{workout.name}</Text>
        <Text style={styles.desc}>
          Build the strength and control needed for your next progression level.
        </Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { v: `${workout.estimatedMinutes}`, l: 'min' },
            { v: `${workout.exercises.length}`, l: 'exercises' },
            { v: `${Math.round(workout.estimatedMinutes * 7.5)}`, l: 'kcal' },
          ].map((s, i) => (
            <View key={i} style={styles.stat}>
              <Text style={styles.statVal}>{s.v}</Text>
              <Text style={styles.statLabel}>{s.l}</Text>
            </View>
          ))}
        </View>

        {/* Exercises */}
        <Text style={styles.movementsTitle}>
          Exercises<Text style={styles.movementsCount}> · {workout.exercises.length}</Text>
        </Text>

        {workout.exercises.map((we, i) => {
          const ex = getExerciseById(we.exerciseId);
          if (!ex) return null;
          const detail = we.holdSeconds
            ? `${we.sets} × ${we.holdSeconds}s hold · ${we.restSeconds}s rest${we.tempo ? ` · ${we.tempo}` : ''}`
            : `${we.sets} × ${we.reps} reps · ${we.restSeconds}s rest${we.tempo ? ` · ${we.tempo}` : ''}`;
          return <ExerciseRow key={we.exerciseId} index={i} name={ex.name} detail={detail} />;
        })}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
        <GlossyButton
          label="Begin session"
          icon="▶"
          onPress={() => router.push(`/session/${workout.id}`)}
        />
        <Text style={styles.bottomMeta}>
          Estimated {workout.estimatedMinutes} min · {Math.round(workout.estimatedMinutes * 7.5)} kcal
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg },

  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  backBtn: {
    width: 40, height: 40, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { fontSize: 22, color: colors.text, marginTop: -2 },
  heartText: { fontSize: 24, color: colors.text },

  tag: { fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 1.5, color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.sm },
  title: { fontFamily: fonts.display, fontSize: 38, color: colors.text, letterSpacing: -1.2, lineHeight: 42, marginBottom: spacing.md },
  desc: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.xl },

  statsRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.xl, gap: spacing.xl },
  stat: { gap: 2 },
  statVal: { fontFamily: fonts.display, fontSize: 24, color: colors.text, letterSpacing: -0.5 },
  statLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },

  movementsTitle: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.text, marginBottom: spacing.md },
  movementsCount: { fontFamily: fonts.body, color: colors.textMuted },

  bottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.lg, paddingTop: spacing.md,
    backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border,
    alignItems: 'center', gap: spacing.sm,
  },
  bottomMeta: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginBottom: spacing.xs },
});
