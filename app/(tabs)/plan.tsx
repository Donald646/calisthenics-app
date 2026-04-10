import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { sampleWorkouts, getWorkoutsByFocus } from '@/data/workouts';
import type { WorkoutFocus } from '@/types';

type FilterOption = 'all' | WorkoutFocus;

const FILTERS: { key: FilterOption; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'push', label: 'Push' },
  { key: 'pull', label: 'Pull' },
  { key: 'legs', label: 'Legs' },
  { key: 'core', label: 'Core' },
  { key: 'skills', label: 'Skills' },
  { key: 'full_body', label: 'Full Body' },
];

const LEVEL_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Foundation',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Elite',
};

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

  const workouts = getWorkoutsByFocus(activeFilter === 'all' ? undefined : activeFilter);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Library</Text>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              style={[styles.chip, activeFilter === f.key && styles.chipActive]}
              onPress={() => setActiveFilter(f.key)}>
              <Text style={[styles.chipText, activeFilter === f.key && styles.chipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Workout list */}
        <View style={styles.list}>
          {workouts.map((w) => (
            <Pressable
              key={w.id}
              style={styles.card}
              onPress={() => router.push(`/workout/${w.id}`)}>
              <View style={styles.cardTop}>
                <Text style={styles.cardFocus}>
                  {w.focus.replace('_', ' ').toUpperCase()}
                </Text>
                <Text style={styles.cardLevel}>{LEVEL_LABELS[w.level]}</Text>
              </View>
              <Text style={styles.cardName}>{w.name}</Text>
              <View style={styles.cardBottom}>
                <Text style={styles.cardStat}>{w.estimatedMinutes} min</Text>
                <View style={styles.dot} />
                <Text style={styles.cardStat}>{w.exercises.length} exercises</Text>
                <View style={styles.dot} />
                <Text style={styles.cardStat}>
                  {w.equipment.includes('none') ? 'Bodyweight' : w.equipment.length + ' equip'}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.text,
    letterSpacing: -0.8,
  },

  filters: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  chipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.bg,
  },

  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFocus: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.textMuted,
  },
  cardLevel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  cardName: {
    fontFamily: fonts.displayMedium,
    fontSize: 22,
    color: colors.text,
    letterSpacing: -0.5,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardStat: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
  },
});
