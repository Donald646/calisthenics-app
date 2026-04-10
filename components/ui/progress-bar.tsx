import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/theme';

interface Props {
  /** 0..1 progress */
  progress: number;
}

export function ProgressBar({ progress }: Props) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(1, progress)) * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: 3,
    backgroundColor: colors.text,
    borderRadius: 2,
  },
});
