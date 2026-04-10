import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts, radius } from '@/constants/theme';

interface Props {
  label: string;
  icon?: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
}

export function GlossyButton({ label, icon, onPress, disabled, variant = 'primary' }: Props) {
  if (variant === 'outline') {
    return (
      <Pressable style={styles.outline} onPress={onPress} disabled={disabled}>
        <Text style={styles.outlineText}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [
      styles.wrapper,
      disabled && styles.wrapperDisabled,
      pressed && styles.wrapperPressed,
    ]}>
      <LinearGradient
        colors={disabled
          ? ['#D0D0D0', '#B8B8B8']
          : ['#4A4A4A', '#1A1A1A', '#000000']}
        locations={[0, 0.3, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}>
        {/* Top highlight — the glossy shine */}
        <View style={styles.highlight} />
        <View style={styles.content}>
          {icon && <Text style={[styles.icon, disabled && styles.textDisabled]}>{icon}</Text>}
          <Text style={[styles.label, disabled && styles.textDisabled]}>{label}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  wrapperDisabled: {
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  wrapperPressed: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    transform: [{ scale: 0.985 }],
  },
  gradient: {
    borderRadius: radius.full,
    paddingVertical: 22,
    paddingHorizontal: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  icon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  label: {
    fontFamily: fonts.displayMedium,
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  textDisabled: {
    color: '#888888',
  },
  outline: {
    borderRadius: radius.full,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  outlineText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: '#888888',
  },
});
