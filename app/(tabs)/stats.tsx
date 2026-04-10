import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { RadarChart } from '@/components/ui/radar-chart';
import { StatBox } from '@/components/ui/stat-box';

const SKILL_AXES = [
  { label: 'Push', value: 72 },
  { label: 'Pull', value: 58 },
  { label: 'Legs', value: 65 },
  { label: 'Core', value: 80 },
  { label: 'Skills', value: 40 },
  { label: 'Mobility', value: 55 },
];

const PERSONAL_RECORDS = [
  { exercise: 'Push-Ups', value: '32 reps', date: 'Apr 7' },
  { exercise: 'Pull-Ups', value: '12 reps', date: 'Apr 5' },
  { exercise: 'L-Sit Hold', value: '18 sec', date: 'Apr 3' },
  { exercise: 'Pistol Squat', value: '5 each', date: 'Mar 30' },
];

export default function StatsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      <Text style={styles.title}>Stats</Text>

      {/* Overview stats */}
      <View style={styles.statsRow}>
        <StatBox value="12" label="Day streak" />
        <StatBox value="32" label="Total sessions" />
        <StatBox value="48h" label="Time trained" />
      </View>

      {/* Radar chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Strength profile</Text>
        <View style={styles.radarCard}>
          <RadarChart axes={SKILL_AXES} size={280} />
        </View>
      </View>

      {/* Breakdown bars */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Breakdown</Text>
        {SKILL_AXES.map((axis) => (
          <View key={axis.label} style={styles.barRow}>
            <Text style={styles.barLabel}>{axis.label}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${axis.value}%` }]} />
            </View>
            <Text style={styles.barValue}>{axis.value}</Text>
          </View>
        ))}
      </View>

      {/* Personal records */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal records</Text>
        {PERSONAL_RECORDS.map((pr, i) => (
          <View key={i} style={styles.prRow}>
            <View style={styles.prLeft}>
              <Text style={styles.prExercise}>{pr.exercise}</Text>
              <Text style={styles.prDate}>{pr.date}</Text>
            </View>
            <View style={styles.prBadge}>
              <Text style={styles.prValue}>{pr.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.text, letterSpacing: -0.8, paddingTop: spacing.md, marginBottom: spacing.lg },

  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },

  section: { marginBottom: spacing.xl },
  sectionTitle: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.text, marginBottom: spacing.md },

  radarCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },

  barRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    marginBottom: spacing.md,
  },
  barLabel: {
    fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text, width: 60,
  },
  barTrack: {
    flex: 1, height: 8, backgroundColor: colors.surface, borderRadius: 4, overflow: 'hidden',
  },
  barFill: {
    height: 8, backgroundColor: colors.text, borderRadius: 4,
  },
  barValue: {
    fontFamily: fonts.monoMedium, fontSize: 13, color: colors.textMuted, width: 28, textAlign: 'right',
  },

  prRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  prLeft: { gap: 2 },
  prExercise: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.text },
  prDate: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  prBadge: {
    backgroundColor: colors.text, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 6,
  },
  prValue: { fontFamily: fonts.monoMedium, fontSize: 13, color: colors.bg },
});
