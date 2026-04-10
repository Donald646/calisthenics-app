import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing, radius } from '@/constants/theme';

interface Props {
  index: number;
  name: string;
  detail: string;
  onPress?: () => void;
}

export function ExerciseRow({ index, name, detail, onPress }: Props) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={styles.numCircle}>
        <Text style={styles.num}>{String(index + 1).padStart(2, '0')}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  numCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
  info: { flex: 1, gap: 2 },
  name: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.text,
  },
  detail: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  chevron: {
    fontSize: 22,
    color: colors.textMuted,
  },
});
