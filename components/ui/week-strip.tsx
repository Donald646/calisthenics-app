import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '@/constants/theme';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface Props {
  todayIndex: number;
}

export function WeekStrip({ todayIndex }: Props) {
  return (
    <View style={styles.row}>
      {DAYS.map((day, i) => {
        const isToday = i === todayIndex;
        const isDone = i < todayIndex;
        return (
          <View key={i} style={[styles.day, isToday && styles.dayActive]}>
            <Text style={[styles.label, isToday && styles.labelActive]}>{day}</Text>
            {isDone && <View style={styles.doneDot} />}
            {isToday && <View style={styles.todayDot} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  day: {
    width: 40,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.md,
  },
  dayActive: { backgroundColor: colors.text },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textMuted },
  labelActive: { color: colors.bg },
  doneDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.textMuted },
  todayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.bg },
});
