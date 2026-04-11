import { Pressable, ScrollView, SectionList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { FilterChips } from '@/components/ui/filter-chips';
import { sampleWorkouts, getWorkoutsByFocus } from '@/data/workouts';
import { exercises as allExercises } from '@/data/exercises';
import type { Workout, Exercise } from '@/types';

const LEVEL_LABELS: Record<number, string> = {
  1: 'Beginner', 2: 'Foundation', 3: 'Intermediate', 4: 'Advanced', 5: 'Elite',
};

const WORKOUT_FILTERS = [
  { key: 'all', label: 'All' }, { key: 'push', label: 'Push' }, { key: 'pull', label: 'Pull' },
  { key: 'legs', label: 'Legs' }, { key: 'core', label: 'Core' }, { key: 'skills', label: 'Skills' },
];

const EXERCISE_FILTERS = [
  { key: 'all', label: 'All' }, { key: 'push', label: 'Push' }, { key: 'pull', label: 'Pull' },
  { key: 'squat', label: 'Legs' }, { key: 'core', label: 'Core' }, { key: 'skill', label: 'Skills' },
];

// ─── Segment Control ────────────────────────────────────────

function SegmentControl({ active, onChange }: { active: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.segmentRow}>
      {['Routines', 'Exercises'].map((s) => (
        <Pressable key={s} style={[styles.segment, active === s && styles.segmentActive]}
          onPress={() => { onChange(s); Haptics.selectionAsync(); }}>
          <Text style={[styles.segmentText, active === s && styles.segmentTextActive]}>{s}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─── Workout Card ───────────────────────────────────────────

function WorkoutCard({ workout, onPress, hero }: { workout: Workout; onPress: () => void; hero?: boolean }) {
  return (
    <Pressable style={[styles.wCard, hero && styles.wCardHero]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}>
      <View style={[styles.wCardTop, hero && styles.wCardTopHero]}>
        <Text style={styles.wCardFocus}>{workout.focus.replace('_', ' ').toUpperCase()}</Text>
        <Text style={[styles.wCardName, hero && styles.wCardNameHero]} numberOfLines={2}>{workout.name}</Text>
      </View>
      <View style={styles.wCardBottom}>
        <Text style={styles.wCardMeta}>{workout.estimatedMinutes} min · {workout.exercises.length} exercises</Text>
        <View style={styles.levelPill}>
          <Text style={styles.levelPillText}>{LEVEL_LABELS[workout.level]}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Exercise Row ───────────────────────────────────────────

function ExerciseItem({ exercise, onPress }: { exercise: Exercise; onPress: () => void }) {
  return (
    <Pressable style={styles.exRow} onPress={onPress}>
      <View style={styles.exLevelDot}>
        <Text style={styles.exLevelText}>{exercise.level}</Text>
      </View>
      <View style={styles.exInfo}>
        <Text style={styles.exName}>{exercise.name}</Text>
        <Text style={styles.exMeta}>{exercise.mode === 'hold' ? 'Hold' : 'Reps'} · {LEVEL_LABELS[exercise.level]}</Text>
      </View>
      <Text style={styles.exChevron}>›</Text>
    </Pressable>
  );
}

// ─── Routines View ──────────────────────────────────────────

function RoutinesView({ router }: { router: ReturnType<typeof useRouter> }) {
  const [filter, setFilter] = useState('all');
  const filtered = getWorkoutsByFocus(filter === 'all' ? undefined : filter);
  const featured = [...sampleWorkouts].sort((a, b) => b.level - a.level)[0];
  const push = sampleWorkouts.filter((w) => w.focus === 'push');
  const pull = sampleWorkouts.filter((w) => w.focus === 'pull');
  const legs = sampleWorkouts.filter((w) => w.focus === 'legs');
  const other = sampleWorkouts.filter((w) => !['push', 'pull', 'legs'].includes(w.focus));
  const isFiltered = filter !== 'all';

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ marginBottom: spacing.lg }}>
        <FilterChips chips={WORKOUT_FILTERS} activeKey={filter}
          onSelect={(k) => { setFilter(k); Haptics.selectionAsync(); }} />
      </View>

      {isFiltered ? (
        <View style={styles.filteredList}>
          {filtered.map((w) => (
            <WorkoutCard key={w.id} workout={w} onPress={() => router.push(`/workout/${w.id}`)} />
          ))}
        </View>
      ) : (
        <>
          <View style={styles.heroWrap}>
            <WorkoutCard workout={featured} hero onPress={() => router.push(`/workout/${featured.id}`)} />
          </View>
          {[{ title: 'Push', data: push }, { title: 'Pull', data: pull },
            { title: 'Legs', data: legs }, { title: 'Core & Skills', data: other }]
            .filter((s) => s.data.length > 0)
            .map((section) => (
            <View key={section.title} style={styles.hSection}>
              <Text style={styles.hSectionTitle}>{section.title}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hScroll}>
                {section.data.map((w) => (
                  <WorkoutCard key={w.id} workout={w} onPress={() => router.push(`/workout/${w.id}`)} />
                ))}
              </ScrollView>
            </View>
          ))}
        </>
      )}
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

// ─── Exercises View — A-Z with sections ─────────────────────

function ExercisesView({ router }: { router: ReturnType<typeof useRouter> }) {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? allExercises
    : allExercises.filter((e) => e.pattern.startsWith(filter));

  // Group by first letter
  const grouped = filtered
    .sort((a, b) => a.name.localeCompare(b.name))
    .reduce<Record<string, Exercise[]>>((acc, ex) => {
      const letter = ex.name[0].toUpperCase();
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(ex);
      return acc;
    }, {});

  const sections = Object.entries(grouped).map(([letter, data]) => ({
    title: letter,
    data,
  }));

  return (
    <View style={{ flex: 1 }}>
      <View style={{ marginBottom: spacing.md }}>
        <FilterChips chips={EXERCISE_FILTERS} activeKey={filter}
          onSelect={(k) => { setFilter(k); Haptics.selectionAsync(); }} />
      </View>
      <Text style={styles.exCount}>{filtered.length} exercises</Text>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExerciseItem exercise={item} onPress={() => router.push(`/exercise/${item.id}`)} />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.letterHeader}>
            <Text style={styles.letterText}>{section.title}</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 80 }}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

// ─── Main ───────────────────────────────────────────────────

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tab, setTab] = useState('Routines');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
      </View>

      <SegmentControl active={tab} onChange={setTab} />

      {tab === 'Routines' ? (
        <RoutinesView router={router} />
      ) : (
        <ExercisesView router={router} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.text, letterSpacing: -0.8 },

  // Segment control
  segmentRow: {
    flexDirection: 'row', marginHorizontal: spacing.lg, marginBottom: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: 4,
  },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.md },
  segmentActive: { backgroundColor: colors.bg, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  segmentText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textMuted },
  segmentTextActive: { color: colors.text },

  // Workout cards
  wCard: {
    width: 200, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  wCardHero: { width: '100%' as any },
  wCardTop: { backgroundColor: colors.text, padding: spacing.md, paddingBottom: spacing.lg, minHeight: 100, justifyContent: 'flex-end' },
  wCardTopHero: { minHeight: 140 },
  wCardFocus: { fontFamily: fonts.monoMedium, fontSize: 9, letterSpacing: 1.5, color: 'rgba(255,255,255,0.4)', marginBottom: spacing.xs },
  wCardName: { fontFamily: fonts.display, fontSize: 20, color: '#FFFFFF', letterSpacing: -0.5, lineHeight: 24 },
  wCardNameHero: { fontSize: 28, lineHeight: 32 },
  wCardBottom: { padding: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wCardMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  levelPill: { backgroundColor: colors.surface, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: colors.border },
  levelPillText: { fontFamily: fonts.monoMedium, fontSize: 9, letterSpacing: 0.5, color: colors.textMuted },

  // Horizontal sections
  hSection: { marginBottom: spacing.xl },
  hSectionTitle: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.text, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  hScroll: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  heroWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  filteredList: { paddingHorizontal: spacing.lg, gap: spacing.sm },

  // Exercise list
  exCount: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  letterHeader: { paddingVertical: spacing.sm, marginTop: spacing.sm },
  letterText: { fontFamily: fonts.display, fontSize: 20, color: colors.text },
  exRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md,
  },
  exLevelDot: {
    width: 32, height: 32, borderRadius: radius.sm,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  exLevelText: { fontFamily: fonts.monoMedium, fontSize: 12, color: colors.textMuted },
  exInfo: { flex: 1, gap: 2 },
  exName: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  exMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  exChevron: { fontSize: 20, color: colors.textMuted },
});
