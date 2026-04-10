import { useRef, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const lastIndex = useRef(selectedIndex);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }, 100);
  }, []);

  function handleScrollEnd(y: number) {
    const idx = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    if (clamped !== lastIndex.current) {
      Haptics.selectionAsync();
      lastIndex.current = clamped;
    }
    onSelect(clamped);
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
        onMomentumScrollEnd={(e) => handleScrollEnd(e.nativeEvent.contentOffset.y)}
        onScrollEndDrag={(e) => handleScrollEnd(e.nativeEvent.contentOffset.y)}>
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
  container: {
    position: 'relative',
    height: PICKER_HEIGHT,
  },
  highlight: {
    position: 'absolute',
    top: PADDING,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    zIndex: 0,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.textMuted,
  },
  itemTextSelected: {
    fontFamily: fonts.displayMedium,
    fontSize: 20,
    color: colors.text,
  },
});
