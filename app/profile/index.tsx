import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { useAppState } from '@/contexts/app-state';
import { getXPToNextRank } from '@/data/gamification';

function XPRing({ progress, size = 88 }: { progress: number; size?: number }) {
  const s = 6;
  const r = (size - s) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <SvgCircle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={s} fill="none" />
      <SvgCircle cx={size / 2} cy={size / 2} r={r} stroke={colors.text} strokeWidth={s} fill="none"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - Math.min(1, progress))} strokeLinecap="round" />
    </Svg>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, updateProfile, resetAllData } = useAppState();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(state.profile?.name || '');

  if (!state.profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={{ color: colors.textMuted, padding: 24 }}>No profile yet</Text>
      </View>
    );
  }

  const profile = state.profile;
  const gam = state.gamification;
  const rankInfo = getXPToNextRank(gam.totalXP);
  const unlockedBadges = gam.badges.filter((b) => b.unlockedAt).length;

  function handleSaveName() {
    updateProfile({ name: nameInput });
    setEditingName(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleReset() {
    Alert.alert(
      'Reset everything?',
      'This will delete your profile, program, and all workout history. Cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            router.replace('/onboarding');
          },
        },
      ],
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero card — rank + XP */}
        <View style={styles.heroCard}>
          <View style={styles.ringWrap}>
            <XPRing progress={rankInfo.progress} />
            <Text style={styles.ringPct}>{Math.round(rankInfo.progress * 100)}%</Text>
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{profile.name}</Text>
            <Text style={styles.heroRank}>{rankInfo.current.name}</Text>
            <Text style={styles.heroXP}>{gam.totalXP.toLocaleString()} XP</Text>
            {rankInfo.next && (
              <Text style={styles.heroNext}>
                {rankInfo.xpNeeded.toLocaleString()} XP to {rankInfo.next.name}
              </Text>
            )}
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{gam.currentStreak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{state.sessionHistory.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{unlockedBadges}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{Object.keys(state.personalRecords).length}</Text>
            <Text style={styles.statLabel}>PRs</Text>
          </View>
        </View>

        {/* Profile details */}
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.listCard}>
          <Pressable style={styles.listRow} onPress={() => setEditingName(true)}>
            <Text style={styles.listLabel}>Name</Text>
            {editingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  style={styles.nameInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  autoFocus
                  onBlur={handleSaveName}
                  onSubmitEditing={handleSaveName}
                />
              </View>
            ) : (
              <Text style={styles.listValue}>{profile.name}</Text>
            )}
          </Pressable>
          <View style={styles.listDivider} />
          <View style={styles.listRow}>
            <Text style={styles.listLabel}>Age</Text>
            <Text style={styles.listValue}>{profile.age}</Text>
          </View>
          <View style={styles.listDivider} />
          <View style={styles.listRow}>
            <Text style={styles.listLabel}>Height</Text>
            <Text style={styles.listValue}>{profile.heightCm} cm</Text>
          </View>
          <View style={styles.listDivider} />
          <View style={styles.listRow}>
            <Text style={styles.listLabel}>Weight</Text>
            <Text style={styles.listValue}>{profile.weightKg} kg</Text>
          </View>
          <View style={styles.listDivider} />
          <View style={styles.listRow}>
            <Text style={styles.listLabel}>Goal</Text>
            <Text style={styles.listValue}>{profile.goal.replace('_', ' ')}</Text>
          </View>
          <View style={styles.listDivider} />
          <View style={styles.listRow}>
            <Text style={styles.listLabel}>Experience</Text>
            <Text style={styles.listValue}>{profile.experience}</Text>
          </View>
        </View>

        {/* Danger zone */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.listCard}>
          <Pressable style={styles.listRow} onPress={handleReset}>
            <Text style={[styles.listLabel, { color: colors.error }]}>Reset all data</Text>
            <Text style={styles.listValue}>›</Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, color: colors.text },
  headerTitle: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.text },

  scroll: { paddingHorizontal: spacing.lg },

  // Hero
  heroCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  ringWrap: { alignItems: 'center', justifyContent: 'center' },
  ringPct: { position: 'absolute', fontFamily: fonts.display, fontSize: 16, color: colors.text },
  heroInfo: { flex: 1, gap: 2 },
  heroName: { fontFamily: fonts.display, fontSize: 24, color: colors.text, letterSpacing: -0.5 },
  heroRank: { fontFamily: fonts.monoMedium, fontSize: 12, letterSpacing: 1, color: colors.textMuted },
  heroXP: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.text, marginTop: 4 },
  heroNext: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },

  // Stats grid
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl,
  },
  statCell: {
    flex: 1, minWidth: '22%' as any,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingVertical: 14, paddingHorizontal: spacing.sm, alignItems: 'center', gap: 2,
  },
  statVal: { fontFamily: fonts.display, fontSize: 20, color: colors.text },
  statLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },

  // List cards
  sectionTitle: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.sm },
  listCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    marginBottom: spacing.lg, overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: spacing.md,
  },
  listDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
  listLabel: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary },
  listValue: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text, textTransform: 'capitalize' },
  nameEditRow: { flex: 1, alignItems: 'flex-end' },
  nameInput: {
    fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text,
    minWidth: 120, textAlign: 'right',
  },
});
