import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { BodyMap } from '@/components/ui/body-map';
import type { MuscleGroupId, MuscleRole } from '@/types';

// Simulated data — which muscles were worked today
const TODAY_MUSCLES: Partial<Record<MuscleGroupId, MuscleRole>> = {
  pectoralis: 'primary',
  anterior_deltoid: 'primary',
  triceps: 'secondary',
  rectus_abdominis: 'primary',
  obliques: 'secondary',
  quadriceps: 'primary',
  trapezius: 'secondary',
  biceps: 'secondary',
};

// Breakdown for the list
const MUSCLE_BREAKDOWN: { id: MuscleGroupId; name: string; role: MuscleRole; sets: number; source: string }[] = [
  { id: 'pectoralis', name: 'Pectoralis Major', role: 'primary', sets: 7, source: 'Pseudo Planche Push-Up · Scapular Push-Up' },
  { id: 'rectus_abdominis', name: 'Rectus Abdominis', role: 'primary', sets: 9, source: 'Hollow Body Hold · Plank · Tuck Planche' },
  { id: 'anterior_deltoid', name: 'Anterior Deltoids', role: 'primary', sets: 8, source: 'Pike Push-Up · Pseudo Planche Push-Up' },
  { id: 'quadriceps', name: 'Quadriceps', role: 'primary', sets: 4, source: 'Pike Push-Up' },
  { id: 'trapezius', name: 'Trapezius', role: 'secondary', sets: 4, source: 'Pseudo Planche Lean' },
  { id: 'triceps', name: 'Triceps', role: 'secondary', sets: 8, source: 'Diamond Push-Up · Dips' },
  { id: 'biceps', name: 'Biceps', role: 'secondary', sets: 5, source: 'Tuck Planche Hold' },
  { id: 'obliques', name: 'Obliques', role: 'secondary', sets: 5, source: 'Planche Lean · Pike Push-Up' },
];

export default function BodyScreen() {
  const insets = useSafeAreaInsets();
  const primaryCount = MUSCLE_BREAKDOWN.filter((m) => m.role === 'primary').length;
  const secondaryCount = MUSCLE_BREAKDOWN.filter((m) => m.role === 'secondary').length;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      <Text style={styles.title}>Body</Text>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{primaryCount + secondaryCount}</Text>
          <Text style={styles.summaryLabel}>muscles worked</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{primaryCount}</Text>
          <Text style={styles.summaryLabel}>primary</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{secondaryCount}</Text>
          <Text style={styles.summaryLabel}>secondary</Text>
        </View>
      </View>

      {/* Body map */}
      <View style={styles.mapCard}>
        <BodyMap activeMuscles={TODAY_MUSCLES} size={150} />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(0,0,0,0.85)' }]} />
          <Text style={styles.legendText}>Primary</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />
          <Text style={styles.legendText}>Secondary</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(0,0,0,0.06)', borderWidth: 1, borderColor: colors.border }]} />
          <Text style={styles.legendText}>Rest</Text>
        </View>
      </View>

      {/* Muscle breakdown */}
      <Text style={styles.sectionTitle}>Muscle breakdown</Text>

      {MUSCLE_BREAKDOWN.map((m) => (
        <View key={m.id} style={styles.muscleRow}>
          <View style={styles.muscleLeft}>
            <View style={[
              styles.roleDot,
              { backgroundColor: m.role === 'primary' ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.35)' },
            ]} />
            <View style={styles.muscleInfo}>
              <Text style={styles.muscleName}>{m.name}</Text>
              <Text style={styles.muscleSource}>{m.source}</Text>
            </View>
          </View>
          <Text style={[
            styles.muscleSets,
            { color: m.role === 'primary' ? colors.text : colors.textMuted },
          ]}>
            {m.sets} sets
          </Text>
        </View>
      ))}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.text, letterSpacing: -0.8, paddingTop: spacing.md, marginBottom: spacing.lg },

  summaryRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  summaryItem: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingVertical: 14, paddingHorizontal: spacing.md, gap: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  summaryValue: { fontFamily: fonts.display, fontSize: 22, color: colors.text, letterSpacing: -0.5 },
  summaryLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },

  mapCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg,
    alignItems: 'center', marginBottom: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },

  legend: {
    flexDirection: 'row', justifyContent: 'center', gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },

  sectionTitle: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.text, marginBottom: spacing.md },

  muscleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  muscleLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, flex: 1 },
  roleDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  muscleInfo: { flex: 1, gap: 2 },
  muscleName: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  muscleSource: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  muscleSets: { fontFamily: fonts.monoMedium, fontSize: 13 },
});
