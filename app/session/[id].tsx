import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { GlossyButton } from '@/components/glossy-button';
import { TimerRing } from '@/components/ui/timer-ring';
import { SetDots } from '@/components/ui/set-dots';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useAppState } from '@/contexts/app-state';
import { getExerciseById } from '@/data/exercises';

type Phase = 'exercise' | 'rest' | 'done';

export default function ActiveSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getWorkout, logSet, completeSession } = useAppState();
  const workout = getWorkout(id);
  const sessionStartRef = useRef(Date.now());

  const [exIdx, setExIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('exercise');
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [actualReps, setActualReps] = useState(0); // editable rep count
  const [completedSetCount, setCompletedSetCount] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  const we = workout?.exercises[exIdx];
  const ex = we ? getExerciseById(we.exerciseId) : undefined;
  const isHold = ex?.mode === 'hold';
  const target = phase === 'rest' ? (we?.restSeconds || 60) : (we?.holdSeconds || 0);
  const total = workout?.exercises.length || 0;
  const totalSets = workout?.exercises.reduce((s: number, e) => s + e.sets, 0) || 0;

  // Set initial reps when exercise changes
  useEffect(() => {
    if (we && !isHold) setActualReps(we.reps || 0);
  }, [exIdx]);

  // Timer
  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else if (ref.current) clearInterval(ref.current);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  // Auto-complete hold
  useEffect(() => {
    if (phase === 'exercise' && isHold && timer >= target && target > 0) {
      setRunning(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      advance();
    }
  }, [timer]);

  // Rest complete — vibrate
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
    logSet(we.exerciseId, {
      setNumber: setIdx + 1,
      reps: isHold ? undefined : actualReps,
      holdSeconds: isHold ? timer : undefined,
      completed: true,
    });
    setCompletedSetCount((c) => c + 1);

    if (setIdx + 1 < we.sets) {
      setSetIdx((s) => s + 1);
      setPhase('rest'); setTimer(0); setRunning(true);
    } else if (exIdx + 1 < total) {
      setExIdx((e) => e + 1); setSetIdx(0);
      setPhase('rest'); setTimer(0); setRunning(true);
    } else {
      const elapsed = Math.round((Date.now() - sessionStartRef.current) / 1000);
      completeSession(workout.id, elapsed);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/session/complete');
    }
  }

  function skipExercise() {
    if (!workout) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (exIdx + 1 < total) {
      setExIdx((e) => e + 1); setSetIdx(0);
      setPhase('exercise'); setTimer(0); setRunning(false);
    } else {
      const elapsed = Math.round((Date.now() - sessionStartRef.current) / 1000);
      completeSession(workout.id, elapsed);
      router.replace('/session/complete');
    }
  }

  function adjustReps(delta: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActualReps((r) => Math.max(0, r + delta));
  }

  if (!workout || !ex || !we) {
    return <View style={[styles.c, { paddingTop: insets.top }]}><Text>Not found</Text></View>;
  }

  const progress = totalSets > 0 ? completedSetCount / totalSets : 0;
  const ringProg = target > 0 ? 1 - timer / target : 0;
  const display = Math.max(0, target - timer);
  const nextEx = exIdx + 1 < total ? getExerciseById(workout.exercises[exIdx + 1].exerciseId) : null;

  return (
    <View style={[styles.c, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      {/* Top bar */}
      <View style={styles.top}>
        <Pressable style={styles.endBtn} onPress={() => router.back()}>
          <Text style={styles.endText}>✕</Text>
        </Pressable>
        <View style={styles.topCenter}>
          <Text style={styles.topTitle} numberOfLines={1}>{workout.name}</Text>
          <Text style={styles.topSets}>{completedSetCount}/{totalSets} sets</Text>
        </View>
        <Pressable style={styles.skipBtn} onPress={skipExercise}>
          <Text style={styles.skipText}>Skip ›</Text>
        </Pressable>
      </View>

      <ProgressBar progress={progress} />

      {/* Main */}
      <View style={styles.main}>
        <Text style={styles.phaseTag}>
          {phase === 'rest' ? 'REST' : isHold ? 'HOLD' : `SET ${setIdx + 1} OF ${we.sets}`}
        </Text>
        <Text style={styles.exName}>{phase === 'rest' ? 'Rest' : ex.name}</Text>

        {/* Timer ring or rep counter */}
        {(phase === 'rest' || isHold) ? (
          <TimerRing
            progress={ringProg}
            value={display}
            unit="sec"
            color={phase === 'rest' ? colors.textMuted : colors.text}
          />
        ) : (
          /* Editable rep counter */
          <View style={styles.repCounter}>
            <Pressable style={styles.repBtn} onPress={() => adjustReps(-1)}>
              <Text style={styles.repBtnText}>−</Text>
            </Pressable>
            <View style={styles.repCenter}>
              <Text style={styles.repNumber}>{actualReps}</Text>
              <Text style={styles.repUnit}>reps</Text>
            </View>
            <Pressable style={styles.repBtn} onPress={() => adjustReps(1)}>
              <Text style={styles.repBtnText}>+</Text>
            </Pressable>
          </View>
        )}

        {/* Set dots */}
        <View style={{ marginTop: spacing.lg }}>
          <SetDots total={we.sets} current={setIdx} />
        </View>
      </View>

      {/* Actions */}
      {phase === 'rest' ? (
        <GlossyButton label="Skip rest" variant="outline"
          onPress={() => { setRunning(false); setPhase('exercise'); setTimer(0); }} />
      ) : isHold ? (
        <GlossyButton label={running ? 'Pause' : 'Start hold'} icon={running ? '⏸' : '▶'}
          onPress={() => { setRunning((r) => !r); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }} />
      ) : (
        <GlossyButton label="Set complete" icon="✓"
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); advance(); }} />
      )}

      {/* Up next */}
      {nextEx && (
        <View style={styles.upNext}>
          <Text style={styles.upLabel}>UP NEXT</Text>
          <Text style={styles.upName}>{nextEx.name}</Text>
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
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
  topSets: { fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted },
  skipBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  skipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textMuted },

  main: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  phaseTag: { fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 2, color: colors.textMuted, marginBottom: spacing.xs },
  exName: { fontFamily: fonts.display, fontSize: 26, color: colors.text, textAlign: 'center', letterSpacing: -0.5, marginBottom: spacing.lg, paddingHorizontal: spacing.md },

  // Editable rep counter
  repCounter: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  repBtn: {
    width: 56, height: 56, borderRadius: 999,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  repBtnText: { fontFamily: fonts.display, fontSize: 24, color: colors.text },
  repCenter: { alignItems: 'center' },
  repNumber: { fontFamily: fonts.display, fontSize: 80, color: colors.text, letterSpacing: -4, lineHeight: 88 },
  repUnit: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, marginTop: -4 },

  upNext: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingTop: spacing.md, marginTop: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  upLabel: { fontFamily: fonts.monoMedium, fontSize: 9, letterSpacing: 1.5, color: colors.textMuted },
  upName: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textSecondary, flex: 1 },
});
