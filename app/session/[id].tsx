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
import { getWorkoutById } from '@/data/workouts';
import { getExerciseById } from '@/data/exercises';

type Phase = 'exercise' | 'rest' | 'done';

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
      setExIdx((e) => e + 1); setSetIdx(0);
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
      {/* Top bar */}
      <View style={styles.top}>
        <Pressable style={styles.endBtn} onPress={() => router.back()}>
          <Text style={styles.endText}>✕</Text>
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>{workout.name}</Text>
        <Text style={styles.topCount}>{exIdx + 1}/{total}</Text>
      </View>

      <View style={{ marginBottom: spacing.lg }}>
        <ProgressBar progress={progress} />
      </View>

      {/* Main */}
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

            {(phase === 'rest' || isHold) ? (
              <TimerRing
                progress={ringProg}
                value={display}
                unit="sec"
                color={phase === 'rest' ? colors.textMuted : colors.text}
              />
            ) : (
              <View style={styles.repWrap}>
                <Text style={styles.bigNum}>{we.reps}</Text>
                <Text style={styles.bigUnit}>reps</Text>
              </View>
            )}

            <View style={{ marginTop: spacing.lg }}>
              <SetDots total={we.sets} current={setIdx} />
            </View>
          </>
        )}
      </View>

      {/* Actions */}
      {phase === 'done' ? (
        <GlossyButton label="Done" onPress={() => router.back()} />
      ) : phase === 'rest' ? (
        <GlossyButton label="Skip rest" variant="outline" onPress={() => { setRunning(false); setPhase('exercise'); setTimer(0); }} />
      ) : isHold ? (
        <GlossyButton
          label={running ? 'Pause' : 'Start hold'}
          icon={running ? '⏸' : '▶'}
          onPress={() => { setRunning((r) => !r); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
        />
      ) : (
        <GlossyButton
          label="Set complete"
          icon="✓"
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); advance(); }}
        />
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

  main: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  phaseTag: { fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 2, color: colors.textMuted, marginBottom: spacing.xs },
  exName: { fontFamily: fonts.display, fontSize: 26, color: colors.text, textAlign: 'center', letterSpacing: -0.5, marginBottom: spacing.lg, paddingHorizontal: spacing.md },

  repWrap: { alignItems: 'center', paddingVertical: spacing.xl },
  bigNum: { fontFamily: fonts.display, fontSize: 96, color: colors.text, letterSpacing: -4, lineHeight: 100 },
  bigUnit: { fontFamily: fonts.body, fontSize: 16, color: colors.textMuted, marginTop: -4 },

  doneTitle: { fontFamily: fonts.display, fontSize: 44, color: colors.text, textAlign: 'center', letterSpacing: -1.5, lineHeight: 48 },
  doneSub: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted, marginTop: spacing.sm },

  upNext: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingTop: spacing.md, marginTop: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  upLabel: { fontFamily: fonts.monoMedium, fontSize: 9, letterSpacing: 1.5, color: colors.textMuted },
  upName: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textSecondary, flex: 1 },
});
