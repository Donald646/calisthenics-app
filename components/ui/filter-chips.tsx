import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, fonts, spacing, radius } from '@/constants/theme';

interface Chip {
  key: string;
  label: string;
}

interface Props {
  chips: Chip[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export function FilterChips({ chips, activeKey, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      {chips.map((c) => (
        <Pressable
          key={c.key}
          style={[styles.chip, activeKey === c.key && styles.chipActive]}
          onPress={() => onSelect(c.key)}>
          <Text style={[styles.text, activeKey === c.key && styles.textActive]}>
            {c.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  chipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  text: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  textActive: {
    color: colors.bg,
  },
});
