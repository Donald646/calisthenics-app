import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { FilterChips } from '@/components/ui/filter-chips';
import { sampleWorkouts, getWorkoutsByFocus } from '@/data/workouts';

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

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [active, setActive] = useState('all');

  const workouts = getWorkoutsByFocus(active === 'all' ? undefined : active);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Library</Text>
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <FilterChips chips={FILTERS} activeKey={active} onSelect={setActive} />
        </View>

        <View style={styles.list}>
          {workouts.map((w) => (
            <Pressable key={w.id} style={styles.card} onPress={() => router.push(`/workout/${w.id}`)}>
              <View style={styles.cardTop}>
                <Text style={styles.cardFocus}>{w.focus.replace('_', ' ').toUpperCase()}</Text>
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
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.text, letterSpacing: -0.8 },
  list: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardFocus: { fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 1.2, color: colors.textMuted },
  cardLevel: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  cardName: { fontFamily: fonts.displayMedium, fontSize: 22, color: colors.text, letterSpacing: -0.5 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardStat: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textMuted },
});
