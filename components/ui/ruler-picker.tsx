import { useRef, useEffect, useCallback } from 'react';
import { Dimensions, ScrollView, StyleSheet, View, type NativeScrollEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TICK_SPACING = 12;
const MAJOR_EVERY = 5;

interface Props {
  min: number;
  max: number;
  value: number;
  step?: number;
  onValueChange: (value: number) => void;
}

export function RulerPicker({ min, max, value, step = 1, onValueChange }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const lastTickVal = useRef(value);
  const currentVal = useRef(value);
  const totalTicks = Math.floor((max - min) / step);
  const padding = SCREEN_WIDTH / 2 - 24;

  useEffect(() => {
    const offset = ((value - min) / step) * TICK_SPACING;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: offset, animated: false });
    }, 100);
  }, []);

  // Haptic on every value tick during scroll
  const handleScroll = useCallback((e: { nativeEvent: NativeScrollEvent }) => {
    const raw = Math.round(e.nativeEvent.contentOffset.x / TICK_SPACING) * step + min;
    const clamped = Math.max(min, Math.min(max, raw));
    if (clamped !== lastTickVal.current) {
      // Stronger haptic on major ticks (every 5)
      if (clamped % (step * MAJOR_EVERY) === 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      lastTickVal.current = clamped;
    }
    currentVal.current = clamped;
    onValueChange(clamped);
  }, [min, max, step, onValueChange]);

  function handleScrollEnd() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onValueChange(currentVal.current);
  }

  return (
    <View style={styles.container}>
      <View style={styles.indicator} pointerEvents="none" />

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: padding }}
        snapToInterval={TICK_SPACING}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}>
        <View style={styles.ruler}>
          {Array.from({ length: totalTicks + 1 }).map((_, i) => {
            const isMajor = i % MAJOR_EVERY === 0;
            return (
              <View key={i} style={[styles.tick, isMajor ? styles.tickMajor : styles.tickMinor]} />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 60, position: 'relative' },
  indicator: {
    position: 'absolute', left: '50%', marginLeft: -1,
    top: 0, bottom: 0, width: 2,
    backgroundColor: colors.text, zIndex: 10,
  },
  ruler: { flexDirection: 'row', alignItems: 'flex-end', height: 60, gap: TICK_SPACING - 1 },
  tick: { width: 1 },
  tickMajor: { height: 36, backgroundColor: colors.text },
  tickMinor: { height: 20, backgroundColor: colors.border },
});
