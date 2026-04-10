import { useRef, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, type NativeScrollEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius } from '@/constants/theme';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);

interface Props {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  suffix?: string;
}

export function WheelPicker({ items, selectedIndex, onSelect, suffix }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const lastTickIndex = useRef(selectedIndex);
  const currentIndex = useRef(selectedIndex);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
    }, 100);
  }, []);

  // Fire haptic on every item boundary during scroll
  const handleScroll = useCallback((e: { nativeEvent: NativeScrollEvent }) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    if (clamped !== lastTickIndex.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lastTickIndex.current = clamped;
    }
    currentIndex.current = clamped;
  }, [items.length]);

  function handleScrollEnd() {
    onSelect(currentIndex.current);
    // Final selection — slightly stronger haptic
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  return (
    <View style={styles.container}>
      <View style={styles.highlight} pointerEvents="none" />

      <ScrollView
        ref={scrollRef}
        style={{ height: PICKER_HEIGHT }}
        contentContainerStyle={{ paddingVertical: PADDING }}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}>
        {items.map((item, index) => {
          const label = suffix ? `${item} ${suffix}` : item;
          return (
            <View key={`${item}-${index}`} style={styles.item}>
              <Text style={[
                styles.itemText,
                index === selectedIndex && styles.itemTextSelected,
              ]}>
                {label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', height: PICKER_HEIGHT },
  highlight: {
    position: 'absolute', top: PADDING, left: 0, right: 0,
    height: ITEM_HEIGHT, backgroundColor: colors.surface,
    borderRadius: radius.sm, zIndex: 0,
  },
  item: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  itemText: { fontFamily: fonts.body, fontSize: 18, color: colors.textMuted },
  itemTextSelected: { fontFamily: fonts.displayMedium, fontSize: 20, color: colors.text },
});
