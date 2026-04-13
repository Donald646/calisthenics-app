import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Body from 'react-native-body-highlighter';
import * as Haptics from 'expo-haptics';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { useAppState } from '@/contexts/app-state';
import { getExerciseById } from '@/data/exercises';
import type { MuscleGroupId } from '@/types';

// ─── Tier System ────────────────────────────────────────────

const TIER_COLORS = ['#4CAF50', '#2196F3', '#9C27B0', '#FF9800'];

function getTier(sets: number): { tier: 1 | 2 | 3 | 4; name: string; color: string } {
  if (sets >= 30) return { tier: 4, name: 'Legendary', color: '#FF9800' };
  if (sets >= 15) return { tier: 3, name: 'Epic', color: '#9C27B0' };
  if (sets >= 5) return { tier: 2, name: 'Rare', color: '#2196F3' };
  return { tier: 1, name: 'Common', color: '#4CAF50' };
}

// Map internal muscle IDs to react-native-body-highlighter slugs
const MUSCLE_TO_SLUG: Record<MuscleGroupId, { slug: string; side?: 'front' | 'back' | 'both'; name: string }> = {
  pectoralis:        { slug: 'chest',       side: 'front', name: 'Chest' },
  anterior_deltoid:  { slug: 'deltoids',    side: 'both',  name: 'Deltoids' },
  lateral_deltoid:   { slug: 'deltoids',    side: 'both',  name: 'Deltoids' },
  posterior_deltoid: { slug: 'deltoids',    side: 'both',  name: 'Deltoids' },
  trapezius:         { slug: 'trapezius',   side: 'back',  name: 'Trapezius' },
  latissimus:        { slug: 'upper-back',  side: 'back',  name: 'Lats' },
  rhomboids:         { slug: 'upper-back',  side: 'back',  name: 'Upper Back' },
  biceps:            { slug: 'biceps',      side: 'front', name: 'Biceps' },
  triceps:           { slug: 'triceps',     side: 'back',  name: 'Triceps' },
  forearms:          { slug: 'forearm',     side: 'both',  name: 'Forearms' },
  rectus_abdominis:  { slug: 'abs',         side: 'front', name: 'Abs' },
  obliques:          { slug: 'obliques',    side: 'front', name: 'Obliques' },
  erector_spinae:    { slug: 'lower-back',  side: 'back',  name: 'Lower Back' },
  glutes:            { slug: 'gluteal',     side: 'back',  name: 'Glutes' },
  quadriceps:        { slug: 'quadriceps',  side: 'front', name: 'Quadriceps' },
  hamstrings:        { slug: 'hamstring',   side: 'back',  name: 'Hamstrings' },
  calves:            { slug: 'calves',      side: 'back',  name: 'Calves' },
  hip_flexors:       { slug: 'quadriceps',  side: 'front', name: 'Hip Flexors' },
};

const TIER_LEGEND = [
  { name: 'Legendary', color: '#FF9800', min: '30+ sets' },
  { name: 'Epic', color: '#9C27B0', min: '15–29 sets' },
  { name: 'Rare', color: '#2196F3', min: '5–14 sets' },
  { name: 'Common', color: '#4CAF50', min: '1–4 sets' },
];

// ─── Main ───────────────────────────────────────────────────

export default function BodyScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useAppState();
  const [selected, setSelected] = useState<string | null>(null);

  // Derive muscle stats from session history
  const muscleStats = useMemo(() => {
    // Aggregate sets per muscle across all sessions
    const setsByMuscle = new Map<MuscleGroupId, { sets: number; exercises: Set<string> }>();

    for (const session of state.sessionHistory) {
      for (const exLog of session.exercises) {
        const ex = getExerciseById(exLog.exerciseId);
        if (!ex) continue;
        const completedSets = exLog.sets.filter((s) => s.completed).length;
        if (completedSets === 0) continue;

        for (const m of ex.muscles) {
          // Primary counts full, secondary/stabilizer half
          const weight = m.role === 'primary' ? 1 : 0.5;
          const existing = setsByMuscle.get(m.muscleId);
          if (existing) {
            existing.sets += completedSets * weight;
            existing.exercises.add(ex.name);
          } else {
            setsByMuscle.set(m.muscleId, {
              sets: completedSets * weight,
              exercises: new Set([ex.name]),
            });
          }
        }
      }
    }

    // Group by body-highlighter slug (some internal muscles map to same slug)
    const slugMap = new Map<string, { name: string; sets: number; side: 'front' | 'back' | 'both'; exercises: Set<string>; muscleIds: Set<MuscleGroupId> }>();
    for (const [muscleId, data] of setsByMuscle.entries()) {
      const mapping = MUSCLE_TO_SLUG[muscleId];
      if (!mapping) continue;
      const existing = slugMap.get(mapping.slug);
      if (existing) {
        existing.sets += data.sets;
        data.exercises.forEach((e) => existing.exercises.add(e));
        existing.muscleIds.add(muscleId);
      } else {
        slugMap.set(mapping.slug, {
          name: mapping.name,
          sets: data.sets,
          side: mapping.side || 'front',
          exercises: new Set(data.exercises),
          muscleIds: new Set([muscleId]),
        });
      }
    }

    const muscles = Array.from(slugMap.entries()).map(([slug, data]) => {
      const sets = Math.round(data.sets);
      const tier = getTier(sets);
      return {
        slug,
        name: data.name,
        sets,
        side: data.side,
        exercises: Array.from(data.exercises),
        tier: tier.tier,
        tierName: tier.name,
        color: tier.color,
      };
    });

    return muscles.sort((a, b) => b.sets - a.sets);
  }, [state.sessionHistory]);

  // Build body highlighter data
  const frontData = useMemo(() =>
    muscleStats
      .filter((m) => m.side === 'front' || m.side === 'both')
      .map((m) => {
        if (m.slug === 'deltoids') {
          return [
            { slug: m.slug as 'deltoids', intensity: m.tier, side: 'left' as const },
            { slug: m.slug as 'deltoids', intensity: m.tier, side: 'right' as const },
          ];
        }
        return [{ slug: m.slug as any, intensity: m.tier }];
      })
      .flat(),
    [muscleStats]
  );

  const backData = useMemo(() =>
    muscleStats
      .filter((m) => m.side === 'back' || m.side === 'both')
      .map((m) => {
        if (m.slug === 'deltoids') {
          return [
            { slug: m.slug as 'deltoids', intensity: m.tier, side: 'left' as const },
            { slug: m.slug as 'deltoids', intensity: m.tier, side: 'right' as const },
          ];
        }
        return [{ slug: m.slug as any, intensity: m.tier }];
      })
      .flat(),
    [muscleStats]
  );

  const handlePress = (part: { slug?: string }) => {
    if (!part.slug) return;
    setSelected(part.slug === selected ? null : part.slug);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const selectedMuscle = selected ? muscleStats.find((m) => m.slug === selected) : null;
  const hasData = muscleStats.length > 0;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      <Text style={styles.title}>Body</Text>

      {!hasData ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💪</Text>
          <Text style={styles.emptyTitle}>Train your first workout</Text>
          <Text style={styles.emptySub}>
            Complete a session to see which muscles you've trained.{'\n'}
            Muscles level up from Common → Legendary as you train them more.
          </Text>
        </View>
      ) : (
        <>
          {/* Body figures */}
          <View style={styles.bodyCard}>
            <View style={styles.bodyRow}>
              <View style={styles.bodyFigure}>
                <Body data={frontData} gender="male" side="front" scale={0.85}
                  colors={TIER_COLORS} border="none" onBodyPartPress={handlePress} />
                <Text style={styles.bodyLabel}>Front</Text>
              </View>
              <View style={styles.bodyFigure}>
                <Body data={backData} gender="male" side="back" scale={0.85}
                  colors={TIER_COLORS} border="none" onBodyPartPress={handlePress} />
                <Text style={styles.bodyLabel}>Back</Text>
              </View>
            </View>
          </View>

          {/* Selected muscle detail */}
          {selectedMuscle && (
            <View style={[styles.selectedCard, { borderLeftColor: selectedMuscle.color }]}>
              <View style={styles.selectedTop}>
                <Text style={styles.selectedName}>{selectedMuscle.name}</Text>
                <View style={[styles.tierBadge, { backgroundColor: selectedMuscle.color }]}>
                  <Text style={styles.tierBadgeText}>{selectedMuscle.tierName}</Text>
                </View>
              </View>
              <Text style={styles.selectedSets}>{selectedMuscle.sets} total sets</Text>
              {selectedMuscle.exercises.length > 0 && (
                <Text style={styles.selectedSource}>{selectedMuscle.exercises.join(' · ')}</Text>
              )}
            </View>
          )}

          {/* Tier legend */}
          <View style={styles.legend}>
            {TIER_LEGEND.map((t) => (
              <View key={t.name} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: t.color }]} />
                <Text style={styles.legendName}>{t.name}</Text>
                <Text style={styles.legendMin}>{t.min}</Text>
              </View>
            ))}
          </View>

          {/* Muscle breakdown list */}
          <Text style={styles.sectionTitle}>Muscle breakdown</Text>
          {muscleStats.map((m) => {
            const thresholds = [0, 5, 15, 30, 50];
            const currentThreshold = thresholds[m.tier - 1];
            const nextThreshold = thresholds[m.tier] || 50;
            const tierProgress = (m.sets - currentThreshold) / (nextThreshold - currentThreshold);

            return (
              <View key={m.slug} style={styles.muscleRow}>
                <View style={styles.muscleMain}>
                  <Text style={styles.muscleName}>{m.name}</Text>
                  <Text style={[styles.muscleTier, { color: m.color }]}>{m.tierName}</Text>
                </View>
                <View style={styles.muscleBarWrap}>
                  <View style={styles.muscleBarTrack}>
                    <View style={[styles.muscleBarFill, { width: `${Math.min(1, tierProgress) * 100}%`, backgroundColor: m.color }]} />
                  </View>
                </View>
                <Text style={[styles.muscleSets, { color: m.color }]}>{m.sets}</Text>
              </View>
            );
          })}
        </>
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.text, letterSpacing: -0.8, paddingTop: spacing.md, marginBottom: spacing.lg },

  // Empty state
  emptyState: {
    alignItems: 'center', gap: spacing.sm, paddingTop: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.text },
  emptySub: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },

  bodyCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  bodyRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  bodyFigure: { alignItems: 'center', gap: spacing.sm },
  bodyLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },

  selectedCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.md, borderLeftWidth: 4, gap: spacing.xs,
  },
  selectedTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectedName: { fontFamily: fonts.display, fontSize: 20, color: colors.text },
  tierBadge: { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  tierBadgeText: { fontFamily: fonts.monoMedium, fontSize: 10, color: '#FFFFFF', letterSpacing: 0.5 },
  selectedSets: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  selectedSource: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },

  legend: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: spacing.xl, paddingHorizontal: spacing.xs,
  },
  legendItem: { alignItems: 'center', gap: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendName: { fontFamily: fonts.monoMedium, fontSize: 9, letterSpacing: 0.5, color: colors.text },
  legendMin: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted },

  sectionTitle: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.text, marginBottom: spacing.md },

  muscleRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  muscleMain: { flex: 1, gap: 1 },
  muscleName: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  muscleTier: { fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 0.5 },
  muscleBarWrap: { width: 60 },
  muscleBarTrack: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  muscleBarFill: { height: 4, borderRadius: 2 },
  muscleSets: { fontFamily: fonts.display, fontSize: 18, width: 30, textAlign: 'right' },
});
