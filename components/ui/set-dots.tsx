import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/theme';

interface Props {
  total: number;
  current: number;
}

export function SetDots({ total, current }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i < current ? styles.done : i === current ? styles.current : styles.pending,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  done: { backgroundColor: colors.text },
  current: { backgroundColor: colors.bg, borderWidth: 2, borderColor: colors.text },
  pending: { backgroundColor: colors.border },
});
