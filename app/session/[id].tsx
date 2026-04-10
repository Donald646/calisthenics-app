import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { getWorkoutById } from '@/data/workouts';
import { getExerciseById } from '@/data/exercises';

type Phase = 'exercise' | 'rest' | 'done';

const RING = 240;
const STROKE = 6;
const R = (RING - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

function Ring({ progress, color }: { progress: number; color: string }) {
  return (
    <Svg width={RING} height={RING} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={RING / 2} cy={RING / 2} r={R} stroke={colors.border} strokeWidth={STROKE} fill="none" />
      <Circle
        cx={RING / 2} cy={RING / 2} r={R}
        stroke={color} strokeWidth={STROKE} fill="none"
        strokeDasharray={CIRC}
        strokeDashoffset={CIRC * (1 - Math.max(0, Math.min(1, progress)))}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function ActiveSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const workout = getWorkoutById(id);

  const [exIdx, setExIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('exercise');
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  const we = workout?.exercises[exIdx];
  const ex = we ? getExerciseById(we.exerciseId) : undefined;
  const isHold = ex?.mode === 'hold';
  const target = phase === 'rest' ? (we?.restSeconds || 60) : (we?.holdSeconds || 0);
  const total = workout?.exercises.length || 0;

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else if (ref.current) clearInterval(ref.current);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  useEffect(() => {
    if (phase === 'exercise' && isHold && timer >= target && target > 0) {
      setRunning(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      advance();
    }
  }, [timer]);

  useEffect(() => {
    if (phase === 'rest' && timer >= target) {
      setRunning(false);
      setPhase('exercise');
      setTimer(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [timer]);

  function advance() {
    if (!we || !workout) return;
    if (setIdx + 1 < we.sets) {
      setSetIdx((s) => s + 1);
      setPhase('rest'); setTimer(0); setRunning(true);
    } else if (exIdx + 1 < total) {
      setExIdx((e) => e + 1);
      setSetIdx(0);
      setPhase('rest'); setTimer(0); setRunning(true);
    } else {
      setPhase('done'); setRunning(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  if (!workout || !ex || !we) {
    return <View style={[styles.c, { paddingTop: insets.top }]}><Text>Not found</Text></View>;
  }

  const totalSets = workout.exercises.reduce((s, e) => s + e.sets, 0);
  const doneSets = workout.exercises.slice(0, exIdx).reduce((s, e) => s + e.sets, 0) + setIdx;
  const progress = totalSets > 0 ? doneSets / totalSets : 0;
  const ringProg = target > 0 ? 1 - timer / target : 0;
  const display = Math.max(0, target - timer);
  const next = exIdx + 1 < total ? getExerciseById(workout.exercises[exIdx + 1].exerciseId) : null;

  return (
    <View style={[styles.c, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      {/* Top */}
      <View style={styles.top}>
        <Pressable style={styles.endBtn} onPress={() => router.back()}>
          <Text style={styles.endText}>✕</Text>
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>{workout.name}</Text>
        <Text style={styles.topCount}>{exIdx + 1}/{total}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Main content */}
      <View style={styles.main}>
        {phase === 'done' ? (
          <>
            <Text style={styles.doneTitle}>Session{'\n'}complete.</Text>
            <Text style={styles.doneSub}>{totalSets} sets across {total} exercises</Text>
          </>
        ) : (
          <>
            <Text style={styles.phaseTag}>
              {phase === 'rest' ? 'REST' : isHold ? 'HOLD' : `SET ${setIdx + 1} OF ${we.sets}`}
            </Text>
            <Text style={styles.exName}>{phase === 'rest' ? 'Rest' : ex.name}</Text>

            {/* Ring or reps */}
            {(phase === 'rest' || isHold) ? (
              <View style={styles.ringWrap}>
                <Ring progress={ringProg} color={phase === 'rest' ? colors.textMuted : colors.text} />
                <View style={styles.ringInner}>
                  <Text style={styles.bigNum}>{display}</Text>
                  <Text style={styles.bigUnit}>{phase === 'rest' ? 'sec' : 'sec'}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.repWrap}>
                <Text style={styles.bigNum}>{we.reps}</Text>
                <Text style={styles.bigUnit}>reps</Text>
              </View>
            )}

            {/* Set dots */}
            <View style={styles.dots}>
              {Array.from({ length: we.sets }).map((_, i) => (
                <View key={i} style={[
                  styles.dot,
                  i < setIdx ? styles.dotDone : i === setIdx ? styles.dotCurrent : styles.dotPending
                ]} />
              ))}
            </View>
          </>
        )}
      </View>

      {/* Actions */}
      {phase === 'done' ? (
        <Pressable style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>Done</Text>
        </Pressable>
      ) : phase === 'rest' ? (
        <Pressable style={styles.btnOutline} onPress={() => { setRunning(false); setPhase('exercise'); setTimer(0); }}>
          <Text style={styles.btnOutlineText}>Skip rest</Text>
        </Pressable>
      ) : isHold ? (
        <Pressable style={styles.btn} onPress={() => { setRunning((r) => !r); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
          <Text style={styles.btnText}>{running ? 'Pause' : 'Start hold'}</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.btn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); advance(); }}>
          <Text style={styles.btnText}>Set complete ✓</Text>
        </Pressable>
      )}

      {/* Up next */}
      {next && phase !== 'done' && (
        <View style={styles.upNext}>
          <Text style={styles.upLabel}>UP NEXT</Text>
          <Text style={styles.upName}>{next.name}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },

  top: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.sm },
  endBtn: {
    width: 36, height: 36, borderRadius: 999,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  endText: { fontSize: 16, color: colors.textSecondary },
  topTitle: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  topCount: { fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted },

  progressTrack: { height: 3, backgroundColor: colors.border, borderRadius: 2, marginBottom: spacing.md, overflow: 'hidden' },
  progressFill: { height: 3, backgroundColor: colors.text, borderRadius: 2 },

  main: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  phaseTag: { fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 2, color: colors.textMuted, marginBottom: spacing.xs },
  exName: { fontFamily: fonts.display, fontSize: 26, color: colors.text, textAlign: 'center', letterSpacing: -0.5, marginBottom: spacing.lg },

  ringWrap: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
  ringInner: { position: 'absolute', alignItems: 'center' },
  repWrap: { alignItems: 'center', paddingVertical: spacing.xl },
  bigNum: { fontFamily: fonts.display, fontSize: 96, color: colors.text, letterSpacing: -4, lineHeight: 100 },
  bigUnit: { fontFamily: fonts.body, fontSize: 16, color: colors.textMuted, marginTop: -4 },

  dots: { flexDirection: 'row', gap: 10, marginTop: spacing.lg, justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotDone: { backgroundColor: colors.text },
  dotCurrent: { backgroundColor: colors.bg, borderWidth: 2, borderColor: colors.text },
  dotPending: { backgroundColor: colors.border },

  doneTitle: { fontFamily: fonts.display, fontSize: 44, color: colors.text, textAlign: 'center', letterSpacing: -1.5, lineHeight: 48 },
  doneSub: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted, marginTop: spacing.sm },

  btn: {
    backgroundColor: colors.buttonBg, borderRadius: radius.full,
    paddingVertical: 20, alignItems: 'center', marginBottom: spacing.sm,
  },
  btnText: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.buttonText },
  btnOutline: {
    borderRadius: radius.full, paddingVertical: 18,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  btnOutlineText: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.textSecondary },

  upNext: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  upLabel: { fontFamily: fonts.monoMedium, fontSize: 9, letterSpacing: 1.5, color: colors.textMuted },
  upName: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textSecondary, flex: 1 },
});
