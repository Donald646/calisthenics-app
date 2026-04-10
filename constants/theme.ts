/**
 * Calisthenics app design tokens.
 * Matches the V1 editorial/cream aesthetic from Paper designs.
 */

export const fonts = {
  display: 'HostGrotesk_700Bold',
  displayMedium: 'HostGrotesk_600SemiBold',
  displayRegular: 'HostGrotesk_500Medium',
  serif: 'InstrumentSerif_400Regular',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
  body: 'InterTight_400Regular',
  bodyMedium: 'InterTight_500Medium',
  bodySemiBold: 'InterTight_600SemiBold',
} as const;

export const colors = {
  // Backgrounds
  bg: '#F4EEDF',
  bgCard: '#ECE4D0',
  bgCardHover: '#E6DDCB',

  // Text
  text: '#1A1712',
  textSecondary: '#8B7F64',
  textMuted: '#B0A489',

  // Accent — terracotta coral
  accent: '#D9481F',
  accentSecondary: '#E8A48A',
  accentMuted: '#F2CFC0',

  // Borders & dividers
  border: '#D9CEB3',
  borderLight: '#E6DDCB',

  // Functional
  success: '#3D7A4A',
  warning: '#C4872B',
  error: '#C43B2B',

  // Dark surfaces (workout session, dark cards)
  dark: '#1A1712',
  darkMuted: '#2A2720',
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
  sm: 6,
  md: 12,
  lg: 20,
  full: 999,
} as const;

// Backward compat for template components still referencing old exports
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
    text: '#ECEDEE',
    background: colors.dark,
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};

export const Fonts = {
  sans: 'system-ui',
  serif: 'ui-serif',
  rounded: 'ui-rounded',
  mono: 'ui-monospace',
};
