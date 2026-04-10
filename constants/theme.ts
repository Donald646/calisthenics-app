/**
 * Calisthenics app — clean monochrome luxury.
 * White + black. Premium buttons. DM Sans typography.
 */

export const fonts = {
  display: 'DMSans_700Bold',
  displayMedium: 'DMSans_600SemiBold',
  displayRegular: 'DMSans_500Medium',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemiBold: 'DMSans_600SemiBold',
} as const;

export const colors = {
  bg: '#FFFFFF',
  surface: '#F7F7F7',
  surfaceHigh: '#EFEFEF',

  text: '#000000',
  textSecondary: '#666666',
  textMuted: '#999999',

  accent: '#000000',
  accentSoft: '#333333',

  border: '#EBEBEB',
  borderLight: '#F0F0F0',

  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',

  // Semantic
  buttonBg: '#000000',
  buttonText: '#FFFFFF',
  buttonDisabledBg: '#F0F0F0',
  buttonDisabledText: '#BBBBBB',

  // Legacy compat
  bgCard: '#F7F7F7',
  dark: '#000000',
  darkMuted: '#1A1A1A',
  accentBg: '#F7F7F7',
  accentDim: '#999999',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

// Backward compat
export const Colors = {
  light: {
    text: colors.text,
    background: colors.bg,
    tint: colors.accent,
    icon: colors.textSecondary,
    tabIconDefault: colors.textMuted,
    tabIconSelected: colors.accent,
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: '#FFFFFF',
    icon: '#888888',
    tabIconDefault: '#666666',
    tabIconSelected: '#FFFFFF',
  },
};

export const Fonts = {
  sans: 'system-ui',
  serif: 'ui-serif',
  rounded: 'ui-rounded',
  mono: 'ui-monospace',
};
