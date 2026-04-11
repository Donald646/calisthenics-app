import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Body from 'react-native-body-highlighter';
import * as Haptics from 'expo-haptics';
import { colors, fonts, spacing, radius } from '@/constants/theme';

// ─── Tier System ────────────────────────────────────────────
// Tiers based on total sets trained — like a loot rarity system
// intensity 1 = Common (green), 2 = Rare (blue), 3 = Epic (purple), 4 = Legendary (gold)

const TIER_COLORS = ['#4CAF50', '#2196F3', '#9C27B0', '#FF9800'];

interface MuscleTier {
  name: string;
  tier: 1 | 2 | 3 | 4;
  tierName: string;
  color: string;
  sets: number;
  source: string;
}

function getTier(sets: number): { tier: 1 | 2 | 3 | 4; name: string; color: string } {
  if (sets >= 12) return { tier: 4, name: 'Legendary', color: '#FF9800' };
  if (sets >= 8) return { tier: 3, name: 'Epic', color: '#9C27B0' };
  if (sets >= 4) return { tier: 2, name: 'Rare', color: '#2196F3' };
  return { tier: 1, name: 'Common', color: '#4CAF50' };
}

// Simulated muscle data — sets accumulated over time
const MUSCLE_DATA: { slug: string; name: string; sets: number; source: string; side?: 'front' | 'back' | 'both' }[] = [
  { slug: 'chest', name: 'Chest', sets: 14, source: 'Pseudo Planche · Push-Up · Dips', side: 'front' },
  { slug: 'abs', name: 'Abs', sets: 12, source: 'Hollow Body · Plank · Leg Raise', side: 'front' },
  { slug: 'deltoids', name: 'Deltoids', sets: 10, source: 'Pike Push-Up · Pseudo Planche', side: 'both' },
  { slug: 'quadriceps', name: 'Quadriceps', sets: 8, source: 'Squats · Split Squat', side: 'front' },
  { slug: 'triceps', name: 'Triceps', sets: 9, source: 'Diamond Push-Up · Dips', side: 'back' },
  { slug: 'biceps', name: 'Biceps', sets: 6, source: 'Pull-Up · Tuck Planche', side: 'front' },
  { slug: 'trapezius', name: 'Trapezius', sets: 5, source: 'Pseudo Planche Lean', side: 'back' },
  { slug: 'upper-back', name: 'Upper Back', sets: 7, source: 'Pull-Up · Rows', side: 'back' },
  { slug: 'obliques', name: 'Obliques', sets: 4, source: 'Planche Lean', side: 'front' },
  { slug: 'forearm', name: 'Forearms', sets: 3, source: 'Dead Hang · Pull-Up', side: 'front' },
  { slug: 'hamstring', name: 'Hamstrings', sets: 5, source: 'Nordic Curl · RDL', side: 'back' },
  { slug: 'gluteal', name: 'Glutes', sets: 6, source: 'Glute Bridge · Squat', side: 'back' },
  { slug: 'calves', name: 'Calves', sets: 3, source: 'Calf Raise', side: 'back' },
  { slug: 'lower-back', name: 'Lower Back', sets: 4, source: 'Superman Hold', side: 'back' },
];

// Build body highlighter data with tier-based intensities
const FRONT_DATA = MUSCLE_DATA
  .filter((m) => m.side === 'front' || m.side === 'both')
  .map((m) => {
    const t = getTier(m.sets);
    return m.slug === 'deltoids'
      ? [
          { slug: m.slug as 'deltoids', intensity: t.tier, side: 'left' as const },
          { slug: m.slug as 'deltoids', intensity: t.tier, side: 'right' as const },
        ]
      : [{ slug: m.slug as any, intensity: t.tier }];
  })
  .flat();

const BACK_DATA = MUSCLE_DATA
  .filter((m) => m.side === 'back' || m.side === 'both')
  .map((m) => {
    const t = getTier(m.sets);
    return m.slug === 'deltoids'
      ? [
          { slug: m.slug as 'deltoids', intensity: t.tier, side: 'left' as const },
          { slug: m.slug as 'deltoids', intensity: t.tier, side: 'right' as const },
        ]
      : [{ slug: m.slug as any, intensity: t.tier }];
  })
  .flat();

// Build sorted muscle list with tiers
const MUSCLES_WITH_TIERS: MuscleTier[] = MUSCLE_DATA
  .map((m) => {
    const t = getTier(m.sets);
    return { name: m.name, tier: t.tier, tierName: t.name, color: t.color, sets: m.sets, source: m.source };
  })
  .sort((a, b) => b.sets - a.sets);

const TIER_LEGEND = [
  { name: 'Legendary', color: '#FF9800', min: '12+ sets' },
  { name: 'Epic', color: '#9C27B0', min: '8–11 sets' },
  { name: 'Rare', color: '#2196F3', min: '4–7 sets' },
  { name: 'Common', color: '#4CAF50', min: '1–3 sets' },
];

export default function BodyScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);

  const handlePress = (part: { slug?: string }) => {
    if (!part.slug) return;
    setSelected(part.slug === selected ? null : part.slug);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const selectedMuscle = selected
    ? MUSCLE_DATA.find((m) => m.slug === selected)
    : null;
  const selectedTier = selectedMuscle ? getTier(selectedMuscle.sets) : null;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      <Text style={styles.title}>Body</Text>

      {/* Body figures */}
      <View style={styles.bodyCard}>
        <View style={styles.bodyRow}>
          <View style={styles.bodyFigure}>
            <Body
              data={FRONT_DATA}
              gender="male"
              side="front"
              scale={0.85}
              colors={TIER_COLORS}
              border="none"
              onBodyPartPress={handlePress}
            />
            <Text style={styles.bodyLabel}>Front</Text>
          </View>
          <View style={styles.bodyFigure}>
            <Body
              data={BACK_DATA}
              gender="male"
              side="back"
              scale={0.85}
              colors={TIER_COLORS}
              border="none"
              onBodyPartPress={handlePress}
            />
            <Text style={styles.bodyLabel}>Back</Text>
          </View>
        </View>
      </View>

      {/* Selected muscle detail */}
      {selectedMuscle && selectedTier && (
        <View style={[styles.selectedCard, { borderLeftColor: selectedTier.color }]}>
          <View style={styles.selectedTop}>
            <Text style={styles.selectedName}>{selectedMuscle.name}</Text>
            <View style={[styles.tierBadge, { backgroundColor: selectedTier.color }]}>
              <Text style={styles.tierBadgeText}>{selectedTier.name}</Text>
            </View>
          </View>
          <Text style={styles.selectedSets}>{selectedMuscle.sets} total sets</Text>
          <Text style={styles.selectedSource}>{selectedMuscle.source}</Text>
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

      {/* Muscle breakdown — clean list */}
      <Text style={styles.sectionTitle}>Muscle breakdown</Text>
      {MUSCLES_WITH_TIERS.map((m) => {
        // Progress toward next tier
        const thresholds = [0, 4, 8, 12, 20];
        const currentThreshold = thresholds[m.tier - 1];
        const nextThreshold = thresholds[m.tier] || 20;
        const tierProgress = (m.sets - currentThreshold) / (nextThreshold - currentThreshold);

        return (
          <View key={m.name} style={styles.muscleRow}>
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

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.text, letterSpacing: -0.8, paddingTop: spacing.md, marginBottom: spacing.lg },

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
