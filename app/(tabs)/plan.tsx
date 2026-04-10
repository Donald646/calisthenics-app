import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { FilterChips } from '@/components/ui/filter-chips';
import { sampleWorkouts, getWorkoutsByFocus } from '@/data/workouts';
import type { Workout } from '@/types';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'push', label: 'Push' },
  { key: 'pull', label: 'Pull' },
  { key: 'legs', label: 'Legs' },
  { key: 'core', label: 'Core' },
  { key: 'skills', label: 'Skills' },
  { key: 'full_body', label: 'Full Body' },
];

const LEVEL_LABELS: Record<number, string> = {
  1: 'Beginner', 2: 'Foundation', 3: 'Intermediate', 4: 'Advanced', 5: 'Elite',
};

const FOCUS_GRADIENTS: Record<string, [string, string]> = {
  push: ['#1A1A1A', '#333333'],
  pull: ['#1A1A1A', '#2A2A2A'],
  legs: ['#222222', '#333333'],
  core: ['#1A1A1A', '#2D2D2D'],
  skills: ['#111111', '#222222'],
  full_body: ['#1A1A1A', '#303030'],
  mobility: ['#222222', '#2A2A2A'],
};

// ─── Workout Card (compact for horizontal scroll) ───────────

function WorkoutCard({ workout, onPress, size = 'normal' }: {
  workout: Workout; onPress: () => void; size?: 'normal' | 'hero';
}) {
  const isHero = size === 'hero';
  return (
    <Pressable
      style={[styles.card, isHero && styles.cardHero]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}>
      {/* Dark gradient header area */}
      <View style={[styles.cardTop, isHero && styles.cardTopHero]}>
        <Text style={styles.cardFocus}>
          {workout.focus.replace('_', ' ').toUpperCase()}
        </Text>
        <Text style={[styles.cardName, isHero && styles.cardNameHero]} numberOfLines={2}>
          {workout.name}
        </Text>
      </View>
      {/* Meta footer */}
      <View style={styles.cardBottom}>
        <View style={styles.cardMetaRow}>
          <Text style={styles.cardMeta}>{workout.estimatedMinutes} min</Text>
          <View style={styles.dot} />
          <Text style={styles.cardMeta}>{workout.exercises.length} exercises</Text>
        </View>
        <View style={styles.levelPill}>
          <Text style={styles.levelText}>{LEVEL_LABELS[workout.level]}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Section (horizontal scroll row) ────────────────────────

function WorkoutSection({ title, workouts, router }: {
  title: string; workouts: Workout[]; router: ReturnType<typeof useRouter>;
}) {
  if (workouts.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionScroll}>
        {workouts.map((w) => (
          <WorkoutCard key={w.id} workout={w}
            onPress={() => router.push(`/workout/${w.id}`)} />
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Main ───────────────────────────────────────────────────

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [active, setActive] = useState('all');

  const isFiltered = active !== 'all';
  const filteredWorkouts = getWorkoutsByFocus(isFiltered ? active : undefined);

  // Group by focus for browse mode
  const pushWorkouts = sampleWorkouts.filter((w) => w.focus === 'push');
  const pullWorkouts = sampleWorkouts.filter((w) => w.focus === 'pull');
  const legsWorkouts = sampleWorkouts.filter((w) => w.focus === 'legs');
  const otherWorkouts = sampleWorkouts.filter((w) => !['push', 'pull', 'legs'].includes(w.focus));

  // Featured workout (highest level push)
  const featured = [...sampleWorkouts].sort((a, b) => b.level - a.level)[0];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Library</Text>
          <Text style={styles.subtitle}>{sampleWorkouts.length} routines</Text>
        </View>

        {/* Filters */}
        <View style={{ marginBottom: spacing.lg }}>
          <FilterChips chips={FILTERS} activeKey={active}
            onSelect={(k) => { setActive(k); Haptics.selectionAsync(); }} />
        </View>

        {isFiltered ? (
          /* Filtered view — grid */
          <View style={styles.filteredGrid}>
            {filteredWorkouts.map((w) => (
              <WorkoutCard key={w.id} workout={w}
                onPress={() => router.push(`/workout/${w.id}`)} />
            ))}
          </View>
        ) : (
          /* Browse view — featured + horizontal sections */
          <>
            {/* Featured hero card */}
            <View style={styles.heroWrap}>
              <Text style={styles.sectionTitle}>Featured</Text>
              <WorkoutCard workout={featured} size="hero"
                onPress={() => router.push(`/workout/${featured.id}`)} />
            </View>

            {/* Horizontal sections by focus */}
            <WorkoutSection title="Push" workouts={pushWorkouts} router={router} />
            <WorkoutSection title="Pull" workouts={pullWorkouts} router={router} />
            <WorkoutSection title="Legs" workouts={legsWorkouts} router={router} />
            <WorkoutSection title="Core & Skills" workouts={otherWorkouts} router={router} />
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md,
    flexDirection: 'row', alignItems: 'baseline', gap: spacing.md,
  },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.text, letterSpacing: -0.8 },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },

  // Cards
  card: {
    width: 200, borderRadius: radius.lg, overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  cardHero: { width: '100%' as any },
  cardTop: {
    backgroundColor: colors.text, padding: spacing.md, paddingBottom: spacing.lg,
    minHeight: 100, justifyContent: 'flex-end',
  },
  cardTopHero: { minHeight: 140 },
  cardFocus: {
    fontFamily: fonts.monoMedium, fontSize: 9, letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.4)', marginBottom: spacing.xs,
  },
  cardName: { fontFamily: fonts.display, fontSize: 20, color: '#FFFFFF', letterSpacing: -0.5, lineHeight: 24 },
  cardNameHero: { fontSize: 28, lineHeight: 32 },
  cardBottom: {
    padding: spacing.md, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textMuted },
  levelPill: {
    backgroundColor: colors.surface, borderRadius: radius.full,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: colors.border,
  },
  levelText: { fontFamily: fonts.monoMedium, fontSize: 9, letterSpacing: 0.5, color: colors.textMuted },

  // Sections
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontFamily: fonts.displayMedium, fontSize: 18, color: colors.text,
    paddingHorizontal: spacing.lg, marginBottom: spacing.sm,
  },
  sectionScroll: { paddingHorizontal: spacing.lg, gap: spacing.sm },

  // Hero
  heroWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },

  // Filtered grid
  filteredGrid: { paddingHorizontal: spacing.lg, gap: spacing.sm },
});
