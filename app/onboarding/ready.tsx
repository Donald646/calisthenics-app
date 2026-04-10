import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/contexts/onboarding';
import { useAppState } from '@/contexts/app-state';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { GlossyButton } from '@/components/glossy-button';
import { ProgressBar } from '@/components/ui/progress-bar';

const GOAL_LABELS: Record<string, string> = {
  general_fitness: 'General Fitness',
  strength: 'Raw Strength',
  skills: 'Skill Unlock',
  muscle: 'Build Muscle',
};

export default function ReadyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data } = useOnboarding();
  const { completeOnboarding } = useAppState();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      {/* Full progress */}
      <View style={styles.topBar}>
        <View style={{ width: 40 }} />
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          {data.name || 'Hey'},{'\n'}you're ready.
        </Text>
        <Text style={styles.heroSub}>Your personalized plan is ready to go.</Text>
      </View>

      <View style={styles.summaryCard}>
        {[
          { label: 'Goal', value: GOAL_LABELS[data.goal] || data.goal },
          { label: 'Equipment', value: data.equipment.length === 0 ? 'Bodyweight only' : `${data.equipment.length} items` },
          { label: 'Experience', value: data.experience || 'Beginner' },
          { label: 'Program', value: '4-week protocol' },
        ].map((row, i) => (
          <View key={i}>
            {i > 0 && <View style={styles.divider} />}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{row.label}</Text>
              <Text style={styles.summaryValue}>{row.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ flex: 1 }} />

      <GlossyButton
        label="Start training"
        icon="→"
        onPress={() => {
          completeOnboarding(data);
          router.replace('/(tabs)');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },

  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl },
  progressTrack: { flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: colors.text, borderRadius: 2 },

  hero: { marginBottom: spacing.xl },
  heroTitle: { fontFamily: fonts.display, fontSize: 36, color: colors.text, letterSpacing: -1, lineHeight: 40 },
  heroSub: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary, marginTop: spacing.sm },

  summaryCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  summaryLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
  summaryValue: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border },
});
