import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingStep } from '@/components/onboarding-step';
import { useOnboarding } from '@/contexts/onboarding';
import { colors, fonts, spacing } from '@/constants/theme';
import { equipment as allEquipment } from '@/data/equipment';

export default function EquipmentScreen() {
  const router = useRouter();
  const { data, toggleEquipment } = useOnboarding();

  // Always allow continue — 'none' is valid (bodyweight only)
  return (
    <OnboardingStep
      step={2}
      title="What equipment do you have?"
      subtitle="Select everything you have access to. We'll filter workouts accordingly."
      canContinue
      onContinue={() => router.push('/onboarding/assessment')}>
      <View style={styles.grid}>
        {allEquipment.map((eq) => {
          const selected = eq.id === 'none'
            ? data.equipment.length === 0
            : data.equipment.includes(eq.id);

          return (
            <Pressable
              key={eq.id}
              style={[styles.item, selected && styles.itemActive]}
              onPress={() => {
                if (eq.id === 'none') return; // bodyweight is implicit
                toggleEquipment(eq.id);
              }}>
              <Text style={[styles.itemName, selected && styles.itemNameActive]}>
                {eq.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  itemActive: {
    backgroundColor: colors.dark,
    borderColor: colors.dark,
  },
  itemName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text,
  },
  itemNameActive: {
    color: colors.bg,
  },
});
