import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, fonts } from '@/constants/theme';

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.dateLine}>THU · APR 09</Text>
          <Text style={styles.dateLine}>W3 · D2</Text>
        </View>
      </View>

      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Morning,{'\n'}Donald.</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>STREAK</Text>
          <Text style={styles.statValue}>12d</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>VOLUME</Text>
          <Text style={styles.statValue}>2.3k</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>PROTOCOL</Text>
          <Text style={styles.statValue}>38%</Text>
        </View>
      </View>

      {/* Today's workout card */}
      <Pressable
        style={styles.workoutCard}
        onPress={() => router.push('/workout/push_int_01')}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>TODAY · PUSH PROTOCOL</Text>
          <Text style={styles.cardCount}>03 / 08</Text>
        </View>
        <Text style={styles.cardTitle}>Planche{'\n'}Progression.</Text>
        <View style={styles.cardStats}>
          <View style={styles.cardStatItem}>
            <Text style={styles.cardStatLabel}>DURATION</Text>
            <Text style={styles.cardStatValue}>42 MIN</Text>
          </View>
          <View style={styles.cardStatItem}>
            <Text style={styles.cardStatLabel}>MOVES</Text>
            <Text style={styles.cardStatValue}>08</Text>
          </View>
          <View style={styles.cardStatItem}>
            <Text style={styles.cardStatLabel}>LEVEL</Text>
            <Text style={styles.cardStatValue}>INT</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.beginText}>Begin session</Text>
          <Text style={styles.arrowText}>→</Text>
        </View>
      </Pressable>

      {/* Recent sessions */}
      <View style={styles.recentHeader}>
        <Text style={styles.recentTitle}>Recent sessions</Text>
        <Text style={styles.seeAll}>SEE ALL →</Text>
      </View>

      <View style={styles.sessionRow}>
        <Text style={styles.sessionDay}>YSTDY</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.sessionName}>Pull Protocol 02</Text>
          <Text style={styles.sessionMeta}>06 MOVES · PR × 2</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.sessionTime}>38 MIN</Text>
          <Text style={styles.sessionMeta}>2,140 KG</Text>
        </View>
      </View>

      <View style={styles.sessionRow}>
        <Text style={styles.sessionDay}>MON</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.sessionName}>Legs Day Alpha</Text>
          <Text style={styles.sessionMeta}>09 MOVES · PR × 1</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.sessionTime}>52 MIN</Text>
          <Text style={styles.sessionMeta}>3,480 KG</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  dateLine: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.textSecondary,
  },
  greeting: {
    marginBottom: spacing.lg,
  },
  greetingText: {
    fontFamily: fonts.display,
    fontSize: 48,
    color: colors.text,
    lineHeight: 52,
    letterSpacing: -1.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  statItem: {
    gap: spacing.xs,
  },
  statLabel: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textSecondary,
  },
  statValue: {
    fontFamily: fonts.displayMedium,
    fontSize: 32,
    color: colors.text,
    letterSpacing: -1,
  },
  workoutCard: {
    backgroundColor: colors.dark,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardLabel: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.textMuted,
  },
  cardCount: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.textMuted,
  },
  cardTitle: {
    fontFamily: fonts.serifItalic,
    fontSize: 40,
    color: '#F4EEDF',
    lineHeight: 44,
    letterSpacing: -0.5,
    marginBottom: spacing.lg,
  },
  cardStats: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  cardStatItem: {
    gap: spacing.xs,
  },
  cardStatLabel: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.textMuted,
  },
  cardStatValue: {
    fontFamily: fonts.displayMedium,
    fontSize: 18,
    color: '#F4EEDF',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.darkMuted,
    paddingTop: spacing.md,
  },
  beginText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: '#F4EEDF',
  },
  arrowText: {
    fontSize: 20,
    color: '#F4EEDF',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  recentTitle: {
    fontFamily: fonts.serifItalic,
    fontSize: 18,
    color: colors.text,
  },
  seeAll: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  sessionDay: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.textMuted,
    width: 40,
    paddingTop: 2,
  },
  sessionName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.text,
  },
  sessionMeta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sessionTime: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.text,
  },
});

