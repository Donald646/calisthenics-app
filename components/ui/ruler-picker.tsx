import { useRef, useEffect } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TICK_SPACING = 12;
const MAJOR_EVERY = 5; // every 5th tick is major

interface Props {
  min: number;
  max: number;
  value: number;
  step?: number; // default 1
  onValueChange: (value: number) => void;
}

export function RulerPicker({ min, max, value, step = 1, onValueChange }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const lastVal = useRef(value);
  const totalTicks = Math.floor((max - min) / step);
  const totalWidth = totalTicks * TICK_SPACING;
  const padding = SCREEN_WIDTH / 2 - 24; // center the ruler

  useEffect(() => {
    const offset = ((value - min) / step) * TICK_SPACING;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: offset, animated: false });
    }, 100);
  }, []);

  function handleScroll(x: number) {
    const raw = Math.round(x / TICK_SPACING) * step + min;
    const clamped = Math.max(min, Math.min(max, raw));
    if (clamped !== lastVal.current) {
      Haptics.selectionAsync();
      lastVal.current = clamped;
    }
    onValueChange(clamped);
  }

  return (
    <View style={styles.container}>
      {/* Center indicator line */}
      <View style={styles.indicator} pointerEvents="none" />

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: padding }}
        snapToInterval={TICK_SPACING}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => handleScroll(e.nativeEvent.contentOffset.x)}
        onScrollEndDrag={(e) => handleScroll(e.nativeEvent.contentOffset.x)}>
        <View style={styles.ruler}>
          {Array.from({ length: totalTicks + 1 }).map((_, i) => {
            const isMajor = i % MAJOR_EVERY === 0;
            return (
              <View
                key={i}
                style={[
                  styles.tick,
                  isMajor ? styles.tickMajor : styles.tickMinor,
                ]}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    left: '50%',
    marginLeft: -1,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.text,
    zIndex: 10,
  },
  ruler: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    gap: TICK_SPACING - 1,
  },
  tick: {
    width: 1,
    backgroundColor: colors.textMuted,
  },
  tickMajor: {
    height: 36,
    backgroundColor: colors.text,
  },
  tickMinor: {
    height: 20,
    backgroundColor: colors.border,
  },
});
