import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts } from '@/constants/theme';

const SIZE = 240;
const STROKE = 6;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

interface Props {
  /** 0..1 progress value */
  progress: number;
  /** Display number inside the ring */
  value: number;
  /** Label below the number (e.g. "sec") */
  unit: string;
  /** Ring color */
  color?: string;
}

export function TimerRing({ progress, value, unit, color = colors.text }: Props) {
  const offset = CIRC * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <View style={styles.wrapper}>
      <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          stroke={colors.border} strokeWidth={STROKE} fill="none"
        />
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          stroke={color} strokeWidth={STROKE} fill="none"
          strokeDasharray={CIRC} strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.inner}>
        <Text style={styles.num}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    position: 'absolute',
    alignItems: 'center',
  },
  num: {
    fontFamily: fonts.display,
    fontSize: 72,
    color: colors.text,
    letterSpacing: -4,
    lineHeight: 80,
  },
  unit: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
    marginTop: -4,
  },
});
