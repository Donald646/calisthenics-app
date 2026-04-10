import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Body from 'react-native-body-highlighter';
import * as Haptics from 'expo-haptics';
import { colors, fonts, spacing, radius } from '@/constants/theme';

// Today's worked muscles — mapped to react-native-body-highlighter slugs
// intensity 1 = primary, intensity 2 = secondary
const FRONT_DATA = [
  { slug: 'chest' as const, intensity: 1 },
  { slug: 'deltoids' as const, intensity: 1, side: 'left' as const },
  { slug: 'deltoids' as const, intensity: 1, side: 'right' as const },
  { slug: 'abs' as const, intensity: 1 },
  { slug: 'obliques' as const, intensity: 2 },
  { slug: 'biceps' as const, intensity: 2 },
  { slug: 'quadriceps' as const, intensity: 1 },
  { slug: 'forearm' as const, intensity: 2 },
];

const BACK_DATA = [
  { slug: 'trapezius' as const, intensity: 2 },
  { slug: 'upper-back' as const, intensity: 2 },
  { slug: 'lower-back' as const, intensity: 2 },
  { slug: 'triceps' as const, intensity: 2 },
  { slug: 'gluteal' as const, intensity: 2 },
  { slug: 'hamstring' as const, intensity: 2 },
  { slug: 'calves' as const, intensity: 2 },
];

const MUSCLE_LIST = [
  { name: 'Chest', role: 'primary' as const, sets: 7, source: 'Pseudo Planche · Scapular Push-Up' },
  { name: 'Abs', role: 'primary' as const, sets: 9, source: 'Hollow Body · Plank · Tuck Planche' },
  { name: 'Deltoids', role: 'primary' as const, sets: 8, source: 'Pike Push-Up · Pseudo Planche' },
  { name: 'Quadriceps', role: 'primary' as const, sets: 4, source: 'Pike Push-Up' },
  { name: 'Triceps', role: 'secondary' as const, sets: 8, source: 'Diamond Push-Up · Dips' },
  { name: 'Trapezius', role: 'secondary' as const, sets: 4, source: 'Pseudo Planche Lean' },
  { name: 'Biceps', role: 'secondary' as const, sets: 5, source: 'Tuck Planche Hold' },
  { name: 'Obliques', role: 'secondary' as const, sets: 5, source: 'Planche Lean · Pike Push-Up' },
];

export default function BodyScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);
  const primaryCount = MUSCLE_LIST.filter((m) => m.role === 'primary').length;
  const secondaryCount = MUSCLE_LIST.filter((m) => m.role === 'secondary').length;

  const handlePress = (part: { slug?: string }) => {
    if (!part.slug) return;
    setSelected(part.slug === selected ? null : part.slug);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const selectedInfo = selected
    ? MUSCLE_LIST.find((m) => m.name.toLowerCase().replace(' ', '-') === selected || m.name.toLowerCase() === selected)
    : null;

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
          <Text style={styles.summaryLabel}>muscles</Text>
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

      {/* Body figures */}
      <View style={styles.bodyCard}>
        <View style={styles.bodyRow}>
          <View style={styles.bodyFigure}>
            <Body
              data={FRONT_DATA}
              gender="male"
              side="front"
              scale={0.85}
              colors={['#000000', '#999999']}
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
              colors={['#000000', '#999999']}
              border="none"
              onBodyPartPress={handlePress}
            />
            <Text style={styles.bodyLabel}>Back</Text>
          </View>
        </View>
      </View>

      {/* Selected muscle detail */}
      {selected && (
        <View style={styles.selectedCard}>
          <Text style={styles.selectedName}>{selected.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</Text>
          {selectedInfo ? (
            <View style={styles.selectedDetail}>
              <Text style={styles.selectedRole}>{selectedInfo.role.toUpperCase()}</Text>
              <Text style={styles.selectedSets}>{selectedInfo.sets} sets today</Text>
              <Text style={styles.selectedSource}>{selectedInfo.source}</Text>
            </View>
          ) : (
            <Text style={styles.selectedRest}>Not trained today</Text>
          )}
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#000000' }]} />
          <Text style={styles.legendText}>Primary</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#999999' }]} />
          <Text style={styles.legendText}>Secondary</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#E8E8E8' }]} />
          <Text style={styles.legendText}>Rest</Text>
        </View>
      </View>

      {/* Breakdown */}
      <Text style={styles.sectionTitle}>Muscle breakdown</Text>
      {MUSCLE_LIST.map((m, i) => (
        <View key={i} style={styles.muscleRow}>
          <View style={styles.muscleLeft}>
            <View style={[styles.roleDot, { backgroundColor: m.role === 'primary' ? '#000' : '#999' }]} />
            <View style={styles.muscleInfo}>
              <Text style={styles.muscleName}>{m.name}</Text>
              <Text style={styles.muscleSource}>{m.source}</Text>
            </View>
          </View>
          <Text style={[styles.muscleSets, { color: m.role === 'primary' ? colors.text : colors.textMuted }]}>
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

  bodyCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  bodyRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  bodyFigure: { alignItems: 'center', gap: spacing.sm },
  bodyLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },

  legend: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, marginBottom: spacing.xl },
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

  selectedCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  selectedName: { fontFamily: fonts.display, fontSize: 20, color: colors.text, marginBottom: 4 },
  selectedDetail: { gap: 4 },
  selectedRole: { fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 1.2, color: colors.textMuted },
  selectedSets: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  selectedSource: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  selectedRest: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
});
