import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, fonts, spacing } from '@/constants/theme';
import { getWorkoutById } from '@/data/workouts';
import { getExerciseById } from '@/data/exercises';

type SessionPhase = 'exercise' | 'rest' | 'done';

export default function ActiveSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const workout = getWorkoutById(id);
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [phase, setPhase] = useState<SessionPhase>('exercise');
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentWe = workout?.exercises[exerciseIdx];
  const currentExercise = currentWe ? getExerciseById(currentWe.exerciseId) : undefined;
  const isHold = currentExercise?.mode === 'hold';
  const targetTime = currentWe?.holdSeconds || 0;
  const totalExercises = workout?.exercises.length || 0;

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Check if hold timer completed
  useEffect(() => {
    if (phase === 'exercise' && isHold && timer >= targetTime && targetTime > 0) {
      setIsRunning(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      advanceSet();
    }
  }, [timer, phase, isHold, targetTime]);

  // Check if rest timer completed
  useEffect(() => {
    if (phase === 'rest' && currentWe && timer >= currentWe.restSeconds) {
      setIsRunning(false);
      setPhase('exercise');
      setTimer(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [timer, phase, currentWe]);

  function advanceSet() {
    if (!currentWe || !workout) return;

    if (setIdx + 1 < currentWe.sets) {
      // More sets — go to rest
      setSetIdx((s) => s + 1);
      setPhase('rest');
      setTimer(0);
      setIsRunning(true);
    } else if (exerciseIdx + 1 < totalExercises) {
      // Next exercise
      setExerciseIdx((e) => e + 1);
      setSetIdx(0);
      setPhase('rest');
      setTimer(0);
      setIsRunning(true);
    } else {
      // Workout complete
      setPhase('done');
      setIsRunning(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  function handleMainAction() {
    if (phase === 'done') {
      router.back();
      return;
    }

    if (phase === 'exercise') {
      if (isHold) {
        // Start/pause hold timer
        setIsRunning((r) => !r);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        // Rep-based — mark set complete
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        advanceSet();
      }
    } else if (phase === 'rest') {
      // Skip rest
      setIsRunning(false);
      setPhase('exercise');
      setTimer(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  if (!workout || !currentExercise || !currentWe) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Workout not found</Text>
      </View>
    );
  }

  // Progress segments
  const totalSegments = workout.exercises.reduce((s, e) => s + e.sets, 0);
  const completedSegments =
    workout.exercises.slice(0, exerciseIdx).reduce((s, e) => s + e.sets, 0) + setIdx;

  const displayTime = phase === 'rest'
    ? Math.max(0, currentWe.restSeconds - timer)
    : isHold
      ? Math.max(0, targetTime - timer)
      : timer;

  const nextExercise =
    exerciseIdx + 1 < totalExercises
      ? getExerciseById(workout.exercises[exerciseIdx + 1].exerciseId)
      : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.endText}>✕ END</Text>
        </Pressable>
        <Text style={styles.progressText}>
          {String(exerciseIdx + 1).padStart(2, '0')} / {String(totalExercises).padStart(2, '0')} · SET {setIdx + 1} / {currentWe.sets}
        </Text>
        <Text style={styles.logText}>LOG ✎</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        {Array.from({ length: totalSegments }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressSegment,
              i < completedSegments
                ? styles.segmentDone
                : i === completedSegments
                  ? styles.segmentActive
                  : styles.segmentPending,
            ]}
          />
        ))}
      </View>

      {/* Main content */}
      <View style={styles.mainContent}>
        {phase === 'done' ? (
          <>
            <Text style={styles.phaseLabel}>COMPLETE</Text>
            <Text style={styles.doneTitle}>Session{'\n'}finished.</Text>
          </>
        ) : phase === 'rest' ? (
          <>
            <Text style={styles.phaseLabel}>REST</Text>
            <Text style={styles.exerciseTitle}>Breathe</Text>
            <Text style={styles.bigNumber}>{displayTime}</Text>
            <Text style={styles.unitLabel}>seconds</Text>
          </>
        ) : (
          <>
            <Text style={styles.phaseLabel}>{isHold ? 'HOLD' : 'REPS'}</Text>
            <Text style={styles.exerciseTitle}>{currentExercise.name}</Text>
            {isHold ? (
              <>
                <Text style={styles.bigNumber}>{displayTime}</Text>
                <Text style={styles.unitLabel}>seconds</Text>
              </>
            ) : (
              <>
                <Text style={styles.bigNumber}>{currentWe.reps}</Text>
                <Text style={styles.unitLabel}>reps</Text>
              </>
            )}
          </>
        )}
      </View>

      {/* Set info */}
      {phase !== 'done' && (
        <Text style={styles.setInfo}>
          SET {String(setIdx + 1).padStart(2, '0')} / {String(currentWe.sets).padStart(2, '0')} · REST {currentWe.restSeconds}S
          {currentWe.tempo ? ` · TEMPO ${currentWe.tempo}` : ''}
        </Text>
      )}

      {/* Bottom controls */}
      <View style={styles.controls}>
        {phase !== 'done' && (
          <Pressable
            style={styles.navButton}
            onPress={() => {
              if (exerciseIdx > 0 || setIdx > 0) {
                if (setIdx > 0) {
                  setSetIdx((s) => s - 1);
                } else {
                  setExerciseIdx((e) => e - 1);
                  setSetIdx(workout.exercises[exerciseIdx - 1].sets - 1);
                }
                setPhase('exercise');
                setTimer(0);
                setIsRunning(false);
              }
            }}>
            <Text style={styles.navIcon}>◁</Text>
          </Pressable>
        )}

        <Pressable style={styles.mainButton} onPress={handleMainAction}>
          <Text style={styles.mainButtonText}>
            {phase === 'done'
              ? 'Finish'
              : phase === 'rest'
                ? 'Skip rest'
                : isHold
                  ? isRunning
                    ? '⏸ Pause'
                    : '▶ Start'
                  : '✓ Done'}
          </Text>
        </Pressable>

        {phase !== 'done' && (
          <Pressable style={styles.navButton} onPress={handleMainAction}>
            <Text style={styles.navIcon}>▷</Text>
          </Pressable>
        )}
      </View>

      {/* Up next */}
      {nextExercise && phase !== 'done' && (
        <View style={styles.upNext}>
          <Text style={styles.upNextLabel}>UP NEXT</Text>
          <Text style={styles.upNextName}>{nextExercise.name}</Text>
          <Text style={styles.upNextCount}>
            {String(exerciseIdx + 2).padStart(2, '0')} / {String(totalExercises).padStart(2, '0')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textSecondary,
    padding: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  endText: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.text,
  },
  progressText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.textSecondary,
  },
  logText: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.text,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: spacing.xl,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  segmentDone: {
    backgroundColor: colors.text,
  },
  segmentActive: {
    backgroundColor: colors.accent,
  },
  segmentPending: {
    backgroundColor: colors.border,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  exerciseTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 26,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  bigNumber: {
    fontFamily: fonts.display,
    fontSize: 120,
    color: colors.text,
    letterSpacing: -6,
    lineHeight: 130,
  },
  unitLabel: {
    fontFamily: fonts.serifItalic,
    fontSize: 20,
    color: colors.textSecondary,
    marginTop: -8,
  },
  doneTitle: {
    fontFamily: fonts.display,
    fontSize: 48,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -2,
    lineHeight: 52,
  },
  setInfo: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  navButton: {
    width: 52,
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 18,
    color: colors.text,
  },
  mainButton: {
    flex: 1,
    backgroundColor: colors.dark,
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
  },
  mainButtonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.bg,
  },
  upNext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  upNextLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  upNextName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  upNextCount: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textSecondary,
  },
});
