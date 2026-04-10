import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { GlossyButton } from '@/components/glossy-button';
import { WeekStrip } from '@/components/ui/week-strip';

// Mini ring for protocol progress
function MiniRing({ progress, size = 48 }: { progress: number; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <SvgCircle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
      <SvgCircle
        cx={size / 2} cy={size / 2} r={r}
        stroke={colors.text} strokeWidth={stroke} fill="none"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.name}>Donald</Text>
        </View>
        <View style={styles.streakPill}>
          <View style={styles.streakDot} />
          <Text style={styles.streakText}>12 day streak</Text>
        </View>
      </View>

      {/* Week strip */}
      <View style={{ marginBottom: spacing.lg }}>
        <WeekStrip todayIndex={3} />
      </View>

      {/* Stats — richer with mini ring */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>2.3k</Text>
          <Text style={styles.statLabel}>Volume (kg)</Text>
          <View style={styles.statTrend}>
            <Text style={styles.trendUp}>↑ 12%</Text>
          </View>
        </View>
        <View style={styles.statCardRing}>
          <View style={styles.ringWrap}>
            <MiniRing progress={0.38} />
            <Text style={styles.ringPercent}>38%</Text>
          </View>
          <Text style={styles.statLabel}>Protocol</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>Sessions</Text>
          <View style={styles.statTrend}>
            <Text style={styles.trendUp}>↑ 2</Text>
          </View>
        </View>
      </View>

      {/* Today's workout */}
      <Text style={styles.sectionTitle}>Today's session</Text>

      <View style={styles.workoutCard}>
        <View style={styles.cardRow}>
          <View style={styles.focusPill}>
            <Text style={styles.focusPillText}>PUSH</Text>
          </View>
          <Text style={styles.cardCounter}>03/08</Text>
        </View>

        <Text style={styles.cardTitle}>Planche{'\n'}Progression</Text>

        <View style={styles.cardMetaRow}>
          {[
            { v: '42', l: 'min' },
            { v: '8', l: 'moves' },
            { v: '320', l: 'kcal' },
          ].map((m, i) => (
            <View key={i} style={styles.cardMeta}>
              <Text style={styles.cardMetaVal}>{m.v}</Text>
              <Text style={styles.cardMetaLabel}>{m.l}</Text>
            </View>
          ))}
        </View>

        <GlossyButton
          label="Start workout"
          icon="→"
          onPress={() => router.push('/workout/push_int_01')}
        />
      </View>

      {/* Recent — card style */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Recent</Text>
        <Pressable><Text style={styles.seeAll}>See all</Text></Pressable>
      </View>

      {[
        { name: 'Pull Protocol 02', meta: '38 min · 6 moves', day: 'Yesterday', focus: 'PULL', pr: true },
        { name: 'Legs Day Alpha', meta: '52 min · 9 moves', day: 'Monday', focus: 'LEGS', pr: false },
        { name: 'Rest · Mobility', meta: '18 min', day: 'Sunday', focus: 'REST', pr: false },
      ].map((s, i) => (
        <Pressable key={i} style={styles.recentCard}>
          <View style={styles.recentTop}>
            <View style={styles.recentFocusDot} />
            <Text style={styles.recentFocus}>{s.focus}</Text>
            {s.pr && <View style={styles.prBadge}><Text style={styles.prText}>PR</Text></View>}
            <View style={{ flex: 1 }} />
            <Text style={styles.recentDay}>{s.day}</Text>
          </View>
          <Text style={styles.recentName}>{s.name}</Text>
          <Text style={styles.recentMeta}>{s.meta}</Text>
        </Pressable>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 80 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingTop: spacing.md, marginBottom: spacing.xl,
  },
  greeting: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary, marginBottom: 2 },
  name: { fontFamily: fonts.display, fontSize: 32, color: colors.text, letterSpacing: -0.8 },
  streakPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.full,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  streakDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.text },
  streakText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text },

  // Stats
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statCardRing: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  ringWrap: { alignItems: 'center', justifyContent: 'center' },
  ringPercent: {
    position: 'absolute', fontFamily: fonts.display, fontSize: 14, color: colors.text,
  },
  statValue: { fontFamily: fonts.display, fontSize: 22, color: colors.text, letterSpacing: -0.5 },
  statLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  statTrend: { marginTop: 2 },
  trendUp: { fontFamily: fonts.monoMedium, fontSize: 10, color: colors.success || '#34C759' },

  // Section
  sectionTitle: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.text, marginBottom: spacing.md },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: spacing.lg },
  seeAll: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textMuted },

  // Workout card
  workoutCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  focusPill: {
    backgroundColor: colors.text, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5,
  },
  focusPillText: { fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 1.5, color: colors.bg },
  cardCounter: { fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted },
  cardTitle: { fontFamily: fonts.display, fontSize: 36, color: colors.text, letterSpacing: -1.2, lineHeight: 40, marginBottom: spacing.lg },
  cardMetaRow: { flexDirection: 'row', gap: spacing.xl, marginBottom: spacing.lg },
  cardMeta: { gap: 1 },
  cardMetaVal: { fontFamily: fonts.display, fontSize: 20, color: colors.text, letterSpacing: -0.5 },
  cardMetaLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },

  // Recent — card style
  recentCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm, gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  recentTop: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2,
  },
  recentFocusDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: colors.text,
  },
  recentFocus: { fontFamily: fonts.monoMedium, fontSize: 9, letterSpacing: 1, color: colors.textMuted },
  prBadge: { backgroundColor: colors.text, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 4 },
  prText: { fontFamily: fonts.monoMedium, fontSize: 8, color: colors.bg, letterSpacing: 0.5 },
  recentDay: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  recentName: { fontFamily: fonts.displayMedium, fontSize: 17, color: colors.text, letterSpacing: -0.3 },
  recentMeta: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
});
