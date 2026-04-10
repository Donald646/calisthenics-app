import { useRef, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, fonts, spacing, radius } from '@/constants/theme';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface Props {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  suffix?: string;
}

export function WheelPicker({ items, selectedIndex, onSelect, suffix }: Props) {
  const listRef = useRef<FlatList>(null);
  const lastIndex = useRef(selectedIndex);

  useEffect(() => {
    // Scroll to initial position
    setTimeout(() => {
      listRef.current?.scrollToOffset({
        offset: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }, 100);
  }, []);

  return (
    <View style={styles.container}>
      {/* Selection highlight */}
      <View style={styles.highlight} pointerEvents="none" />
      {/* Fade masks */}
      <View style={styles.fadeTop} pointerEvents="none" />
      <View style={styles.fadeBottom} pointerEvents="none" />

      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(item, i) => `${item}-${i}`}
        renderItem={({ item, index }) => {
          const label = suffix ? `${item} ${suffix}` : item;
          return (
            <View style={styles.item}>
              <Text style={[
                styles.itemText,
                index === selectedIndex && styles.itemTextSelected,
              ]}>
                {label}
              </Text>
            </View>
          );
        }}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
        }}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          const clamped = Math.max(0, Math.min(items.length - 1, idx));
          if (clamped !== lastIndex.current) {
            Haptics.selectionAsync();
            lastIndex.current = clamped;
          }
          onSelect(clamped);
        }}
        onScrollEndDrag={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          const clamped = Math.max(0, Math.min(items.length - 1, idx));
          if (clamped !== lastIndex.current) {
            Haptics.selectionAsync();
            lastIndex.current = clamped;
          }
          onSelect(clamped);
        }}
        style={{ height: PICKER_HEIGHT }}
      />
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
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    zIndex: 0,
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 1.5,
    zIndex: 2,
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 1.5,
    zIndex: 2,
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
