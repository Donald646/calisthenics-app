import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { getExerciseById, getExercisesByPattern } from '@/data/exercises';
import { muscleGroups } from '@/data/muscles';
import type { Exercise, MuscleRole } from '@/types';

const LEVEL_NAMES = ['', 'Beginner', 'Foundation', 'Intermediate', 'Advanced', 'Elite'];
const MODE_LABELS = { reps: 'Reps', hold: 'Hold', reps_each_side: 'Each Side' };
const PATTERN_LABELS: Record<string, string> = {
  push_horizontal: 'Push (Horizontal)', push_vertical: 'Push (Vertical)',
  pull_horizontal: 'Pull (Horizontal)', pull_vertical: 'Pull (Vertical)',
  squat: 'Squat', hinge: 'Hinge', core: 'Core', skill: 'Skill',
};

function RoleBadge({ role }: { role: MuscleRole }) {
  const bg = role === 'primary' ? colors.text : role === 'secondary' ? colors.surfaceHigh : colors.surface;
  const fg = role === 'primary' ? '#FFFFFF' : colors.textSecondary;
  return (
    <View style={[styles.roleBadge, { backgroundColor: bg }]}>
      <Text style={[styles.roleBadgeText, { color: fg }]}>{role}</Text>
    </View>
  );
}

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const exercise = getExerciseById(id);

  if (!exercise) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={{ color: colors.textMuted, padding: 24 }}>Exercise not found</Text>
      </View>
    );
  }

  // Progression — what's before and after
  const samePattern = getExercisesByPattern(exercise.pattern)
    .sort((a, b) => a.level - b.level);
  const currentIdx = samePattern.findIndex((e) => e.id === exercise.id);
  const prev = currentIdx > 0 ? samePattern[currentIdx - 1] : null;
  const next = currentIdx < samePattern.length - 1 ? samePattern[currentIdx + 1] : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Handle bar */}
      <View style={styles.handleBar} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>LVL {exercise.level}</Text>
          </View>
          <Text style={styles.pattern}>{PATTERN_LABELS[exercise.pattern] || exercise.pattern}</Text>
        </View>

        <Text style={styles.name}>{exercise.name}</Text>

        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{MODE_LABELS[exercise.mode]}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{LEVEL_NAMES[exercise.level]}</Text>
          </View>
          {exercise.equipment.filter((e) => e !== 'none').map((eq) => (
            <View key={eq} style={styles.tag}>
              <Text style={styles.tagText}>{eq.replace(/_/g, ' ')}</Text>
            </View>
          ))}
          {exercise.equipment.includes('none') && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>Bodyweight</Text>
            </View>
          )}
        </View>

        {/* Muscles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Muscles worked</Text>
          {exercise.muscles.map((m) => {
            const muscle = muscleGroups.find((mg) => mg.id === m.muscleId);
            return (
              <View key={m.muscleId} style={styles.muscleRow}>
                <Text style={styles.muscleName}>{muscle?.name || m.muscleId}</Text>
                <RoleBadge role={m.role} />
              </View>
            );
          })}
        </View>

        {/* Coaching cues */}
        {exercise.cues.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Form cues</Text>
            {exercise.cues.map((cue, i) => (
              <View key={i} style={styles.cueRow}>
                <View style={styles.cueNum}>
                  <Text style={styles.cueNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.cueText}>{cue}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Progression path */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progression path</Text>
          <View style={styles.progressionPath}>
            {prev && (
              <Pressable style={styles.progressionCard} onPress={() => router.replace(`/exercise/${prev.id}`)}>
                <Text style={styles.progLabel}>PREVIOUS</Text>
                <Text style={styles.progName}>{prev.name}</Text>
                <Text style={styles.progLevel}>Level {prev.level} · {LEVEL_NAMES[prev.level]}</Text>
              </Pressable>
            )}
            <View style={[styles.progressionCard, styles.progressionCardCurrent]}>
              <Text style={styles.progLabelCurrent}>CURRENT</Text>
              <Text style={styles.progNameCurrent}>{exercise.name}</Text>
              <Text style={styles.progLevelCurrent}>Level {exercise.level} · {LEVEL_NAMES[exercise.level]}</Text>
            </View>
            {next && (
              <Pressable style={styles.progressionCard} onPress={() => router.replace(`/exercise/${next.id}`)}>
                <Text style={styles.progLabel}>NEXT</Text>
                <Text style={styles.progName}>{next.name}</Text>
                <Text style={styles.progLevel}>Level {next.level} · {LEVEL_NAMES[next.level]}</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Close button */}
      <Pressable style={[styles.closeBtn, { bottom: insets.bottom + 16 }]} onPress={() => router.back()}>
        <Text style={styles.closeBtnText}>Close</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  handleBar: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 80 },

  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  levelBadge: { backgroundColor: colors.text, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  levelText: { fontFamily: fonts.monoMedium, fontSize: 10, color: '#FFFFFF', letterSpacing: 1 },
  pattern: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },

  name: { fontFamily: fonts.display, fontSize: 30, color: colors.text, letterSpacing: -0.8, lineHeight: 34, marginBottom: spacing.md },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.xl },
  tag: { backgroundColor: colors.surface, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textSecondary, textTransform: 'capitalize' },

  section: { marginBottom: spacing.xl },
  sectionTitle: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.text, marginBottom: spacing.md },

  muscleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  muscleName: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  roleBadge: { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  roleBadgeText: { fontFamily: fonts.monoMedium, fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase' },

  cueRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  cueNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  cueNumText: { fontFamily: fonts.monoMedium, fontSize: 11, color: colors.textMuted },
  cueText: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.text, lineHeight: 22 },

  progressionPath: { gap: spacing.sm },
  progressionCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: 2,
  },
  progressionCardCurrent: { backgroundColor: colors.text },
  progLabel: { fontFamily: fonts.monoMedium, fontSize: 9, letterSpacing: 1.5, color: colors.textMuted },
  progLabelCurrent: { fontFamily: fonts.monoMedium, fontSize: 9, letterSpacing: 1.5, color: 'rgba(255,255,255,0.4)' },
  progName: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.text },
  progNameCurrent: { fontFamily: fonts.displayMedium, fontSize: 16, color: '#FFFFFF' },
  progLevel: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  progLevelCurrent: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(255,255,255,0.5)' },

  closeBtn: {
    position: 'absolute', left: spacing.lg, right: spacing.lg,
    backgroundColor: colors.surface, borderRadius: radius.full,
    paddingVertical: 16, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  closeBtnText: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.text },
});
