import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingStep } from '@/components/onboarding-step';
import { useOnboarding } from '@/contexts/onboarding';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { equipment as allEquipment } from '@/data/equipment';

export default function EquipmentScreen() {
  const router = useRouter();
  const { data, toggleEquipment } = useOnboarding();

  return (
    <OnboardingStep
      step={4}
      title="What equipment do you have?"
      subtitle="Select everything you have access to. We'll filter workouts accordingly."
      canContinue
      onContinue={() => router.push('/onboarding/experience')}>
      <View style={styles.grid}>
        {allEquipment.filter((e) => e.id !== 'none').map((eq) => {
          const selected = data.equipment.includes(eq.id);
          return (
            <Pressable
              key={eq.id}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => toggleEquipment(eq.id)}>
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{eq.name}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>No equipment? Just continue — bodyweight works great.</Text>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: radius.lg, backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.text },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  chipTextSelected: { color: '#FFFFFF' },
  hint: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: spacing.lg, textAlign: 'center' },
});
