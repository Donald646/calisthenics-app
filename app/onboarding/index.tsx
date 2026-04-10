import { useRef, useState } from 'react';
import {
  Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Switch, Text, TextInput, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useOnboarding } from '@/contexts/onboarding';
import { useAppState } from '@/contexts/app-state';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { GlossyButton } from '@/components/glossy-button';
import { WheelPicker } from '@/components/ui/wheel-picker';
import { equipment as allEquipment } from '@/data/equipment';
import type { UserGoal, ExperienceLevel } from '@/types';

// ─── Helpers ────────────────────────────────────────────────

function kgToLbs(kg: number) { return Math.round(kg * 2.205); }
function lbsToKg(lbs: number) { return Math.round(lbs / 2.205); }
function cmToFtIn(cm: number) { const inches = Math.round(cm / 2.54); return { ft: Math.floor(inches / 12), inch: inches % 12 }; }

// ─── Option Card with haptics ───────────────────────────────

function OptionCard({ label, sublabel, selected, onPress }: {
  label: string; sublabel?: string; selected: boolean; onPress: () => void;
}) {
  return (
    <Pressable style={[styles.option, selected && styles.optionSel]} onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }}>
      <Text style={[styles.optionLabel, selected && styles.optionLabelSel]}>{label}</Text>
      {sublabel && <Text style={[styles.optionSub, selected && styles.optionSubSel]}>{sublabel}</Text>}
    </Pressable>
  );
}

// ─── Picker data ────────────────────────────────────────────

const AGES = Array.from({ length: 80 }, (_, i) => String(i + 13));
const HEIGHTS_CM = Array.from({ length: 80 }, (_, i) => String(i + 140));
const HEIGHTS_FT: string[] = [];
for (let ft = 4; ft <= 7; ft++) for (let inch = 0; inch < 12; inch++) HEIGHTS_FT.push(`${ft}'${inch}"`);
const WEIGHTS_KG = Array.from({ length: 120 }, (_, i) => String(i + 30));
const WEIGHTS_LBS = Array.from({ length: 260 }, (_, i) => String(i + 66));
const REPS = Array.from({ length: 101 }, (_, i) => String(i));

const GOALS: { value: UserGoal; label: string; sub: string }[] = [
  { value: 'general_fitness', label: 'General Fitness', sub: 'Balanced strength and conditioning' },
  { value: 'strength', label: 'Raw Strength', sub: 'Maximize pushing and pulling power' },
  { value: 'skills', label: 'Unlock Skills', sub: 'Muscle-ups, handstands, planches' },
  { value: 'muscle', label: 'Build Muscle', sub: 'Gain size with hypertrophy training' },
];

const EXPERIENCE: { value: ExperienceLevel; label: string; sub: string }[] = [
  { value: 'beginner', label: '0–2 per week', sub: 'Just getting started' },
  { value: 'intermediate', label: '3–5 per week', sub: 'Consistent training' },
  { value: 'advanced', label: '6+ per week', sub: 'Dedicated athlete' },
];

// ─── Step definitions ───────────────────────────────────────

type OD = ReturnType<typeof useOnboarding>['data'];

interface StepDef {
  title: string | ((d: OD) => string);
  subtitle?: string;
  canContinue: (d: OD) => boolean;
}

const STEPS: StepDef[] = [
  { title: 'Choose your gender', subtitle: 'This will be used to calibrate your custom plan.', canContinue: (d) => d.sex !== '' },
  { title: "What's your name?", subtitle: "We'll use this to personalize your experience.", canContinue: (d) => d.name.length > 0 },
  { title: 'How old are you?', subtitle: 'This will be used to calibrate your custom plan.', canContinue: () => true },
  { title: 'Height & weight', subtitle: 'This will be used to calibrate your custom plan.', canContinue: (d) => d.heightCm.length > 0 && d.weightKg.length > 0 },
  { title: 'What is your goal?', subtitle: 'This helps us generate a plan for your training.', canContinue: (d) => d.goal !== '' },
  { title: (d) => d.goal === 'muscle' ? 'What is your target weight?' : 'What is your ideal weight?', subtitle: 'This helps us track your progress.', canContinue: () => true },
  { title: 'What equipment do you have?', subtitle: 'Select everything you have access to.', canContinue: () => true },
  { title: 'How often do you train?', subtitle: 'This will be used to calibrate your custom plan.', canContinue: (d) => d.experience !== '' },
  { title: 'Quick fitness check', subtitle: 'Rough numbers are fine — this places you on the right level.', canContinue: (d) => d.canDip !== null },
];

const TOTAL_STEPS = STEPS.length;

// ─── Main ───────────────────────────────────────────────────

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, update, toggleEquipment } = useOnboarding();
  const { completeOnboarding } = useAppState();
  const [step, setStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const current = STEPS[step];
  const isLast = step === TOTAL_STEPS - 1;
  const canContinue = current.canContinue(data);
  const titleText = typeof current.title === 'function' ? current.title(data) : current.title;

  function animateTransition(dir: 'forward' | 'back', cb: () => void) {
    slideAnim.setValue(dir === 'forward' ? 80 : -80);
    cb();
    Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }).start();
  }

  function next() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) {
      completeOnboarding(data);
      router.replace('/(tabs)');
    } else {
      animateTransition('forward', () => setStep((s) => s + 1));
    }
  }

  function back() {
    if (step > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      animateTransition('back', () => setStep((s) => s - 1));
    }
  }

  // Picker indices
  const metric = data.useMetric;
  const heights = metric ? HEIGHTS_CM : HEIGHTS_FT;
  const weights = metric ? WEIGHTS_KG : WEIGHTS_LBS;
  const hSuffix = metric ? 'cm' : '';
  const wSuffix = metric ? 'kg' : 'lbs';

  const heightVal = metric ? (data.heightCm || '175') : (() => {
    const cm = parseInt(data.heightCm || '175', 10);
    const { ft, inch } = cmToFtIn(cm);
    return `${ft}'${inch}"`;
  })();
  const weightVal = metric ? (data.weightKg || '70') : String(kgToLbs(parseInt(data.weightKg || '70', 10)));
  const targetVal = metric ? (data.targetWeightKg || data.weightKg || '70') : String(kgToLbs(parseInt(data.targetWeightKg || data.weightKg || '70', 10)));

  const heightIdx = Math.max(0, heights.indexOf(heightVal));
  const weightIdx = Math.max(0, weights.indexOf(weightVal));
  const targetIdx = Math.max(0, weights.indexOf(targetVal));
  const ageIdx = Math.max(0, AGES.indexOf(data.age || '25'));
  const pushIdx = Math.max(0, REPS.indexOf(data.maxPushUps || '10'));
  const pullIdx = Math.max(0, REPS.indexOf(data.maxPullUps || '0'));

  function handleHeightSelect(i: number) {
    if (metric) {
      update({ heightCm: HEIGHTS_CM[i] });
    } else {
      // Convert ft'in" back to cm
      const match = HEIGHTS_FT[i]?.match(/(\d+)'(\d+)"/);
      if (match) {
        const cm = String(Math.round((parseInt(match[1]) * 12 + parseInt(match[2])) * 2.54));
        update({ heightCm: cm });
      }
    }
  }

  function handleWeightSelect(i: number) {
    if (metric) {
      update({ weightKg: WEIGHTS_KG[i] });
    } else {
      update({ weightKg: String(lbsToKg(parseInt(WEIGHTS_LBS[i], 10))) });
    }
  }

  function handleTargetSelect(i: number) {
    if (metric) {
      update({ targetWeightKg: WEIGHTS_KG[i] });
    } else {
      update({ targetWeightKg: String(lbsToKg(parseInt(WEIGHTS_LBS[i], 10))) });
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      {/* Fixed: back + progress */}
      <View style={styles.topBar}>
        {step > 0 ? (
          <Pressable onPress={back} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
        ) : <View style={{ width: 40 }} />}
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` }]} />
        </View>
      </View>

      {/* Animated content */}
      <Animated.View style={[styles.scroll, { transform: [{ translateX: slideAnim }] }]}>
        <ScrollView
          contentContainerStyle={styles.scrollInner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <Text style={styles.title}>{titleText}</Text>
          {current.subtitle && <Text style={styles.subtitle}>{current.subtitle}</Text>}

          <View style={styles.body}>
            {/* 0: Gender */}
            {step === 0 && (
              <View style={styles.optionGroup}>
                {(['male', 'female', 'other'] as const).map((s) => (
                  <OptionCard key={s} label={s.charAt(0).toUpperCase() + s.slice(1)}
                    selected={data.sex === s} onPress={() => update({ sex: s })} />
                ))}
              </View>
            )}

            {/* 1: Name */}
            {step === 1 && (
              <TextInput style={styles.nameInput} value={data.name}
                onChangeText={(v) => update({ name: v })}
                placeholder="Your name" placeholderTextColor={colors.textMuted}
                autoCapitalize="words" autoFocus />
            )}

            {/* 2: Age */}
            {step === 2 && (
              <WheelPicker items={AGES} selectedIndex={ageIdx}
                onSelect={(i) => update({ age: AGES[i] })} suffix="years" />
            )}

            {/* 3: Height & Weight with unit toggle */}
            {step === 3 && (
              <View style={styles.measureGroup}>
                <View style={styles.unitToggle}>
                  <Text style={[styles.unitLabel, !metric && styles.unitLabelActive]}>Imperial</Text>
                  <Switch
                    value={metric}
                    onValueChange={(v) => { update({ useMetric: v }); Haptics.selectionAsync(); }}
                    trackColor={{ false: colors.border, true: colors.text }}
                    thumbColor="#FFFFFF"
                  />
                  <Text style={[styles.unitLabel, metric && styles.unitLabelActive]}>Metric</Text>
                </View>
                <View style={styles.dualPicker}>
                  <View style={styles.pickerCol}>
                    <Text style={styles.pickerLabel}>Height</Text>
                    <WheelPicker items={heights} selectedIndex={heightIdx}
                      onSelect={handleHeightSelect} suffix={hSuffix} />
                  </View>
                  <View style={styles.pickerCol}>
                    <Text style={styles.pickerLabel}>Weight</Text>
                    <WheelPicker items={weights} selectedIndex={weightIdx}
                      onSelect={handleWeightSelect} suffix={wSuffix} />
                  </View>
                </View>
              </View>
            )}

            {/* 4: Goal */}
            {step === 4 && (
              <View style={styles.optionGroup}>
                {GOALS.map((g) => (
                  <OptionCard key={g.value} label={g.label} sublabel={g.sub}
                    selected={data.goal === g.value} onPress={() => update({ goal: g.value })} />
                ))}
              </View>
            )}

            {/* 5: Target weight */}
            {step === 5 && (
              <View style={styles.targetGroup}>
                <Text style={styles.targetLabel}>
                  {data.goal === 'muscle' ? 'Gain muscle' : data.goal === 'strength' ? 'Get stronger' : 'Target'}
                </Text>
                <Text style={styles.targetValue}>
                  {metric ? `${data.targetWeightKg || data.weightKg || '70'} kg` : `${kgToLbs(parseInt(data.targetWeightKg || data.weightKg || '70', 10))} lbs`}
                </Text>
                <WheelPicker items={weights} selectedIndex={targetIdx}
                  onSelect={handleTargetSelect} suffix={wSuffix} />
              </View>
            )}

            {/* 6: Equipment */}
            {step === 6 && (
              <View style={styles.chipGrid}>
                {allEquipment.filter((e) => e.id !== 'none').map((eq) => {
                  const sel = data.equipment.includes(eq.id);
                  return (
                    <Pressable key={eq.id} style={[styles.chip, sel && styles.chipSel]}
                      onPress={() => { toggleEquipment(eq.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                      <Text style={[styles.chipText, sel && styles.chipTextSel]}>{eq.name}</Text>
                    </Pressable>
                  );
                })}
                <Text style={styles.chipHint}>No equipment? Just continue — bodyweight works great.</Text>
              </View>
            )}

            {/* 7: Experience */}
            {step === 7 && (
              <View style={styles.optionGroup}>
                {EXPERIENCE.map((e) => (
                  <OptionCard key={e.value} label={e.label} sublabel={e.sub}
                    selected={data.experience === e.value} onPress={() => update({ experience: e.value })} />
                ))}
              </View>
            )}

            {/* 8: Assessment */}
            {step === 8 && (
              <View style={styles.assessGroup}>
                <View style={styles.dualPicker}>
                  <View style={styles.pickerCol}>
                    <Text style={styles.pickerLabel}>Push-ups</Text>
                    <WheelPicker items={REPS} selectedIndex={pushIdx}
                      onSelect={(i) => update({ maxPushUps: REPS[i] })} suffix="reps" />
                  </View>
                  <View style={styles.pickerCol}>
                    <Text style={styles.pickerLabel}>Pull-ups</Text>
                    <WheelPicker items={REPS} selectedIndex={pullIdx}
                      onSelect={(i) => update({ maxPullUps: REPS[i] })} suffix="reps" />
                  </View>
                </View>
                <Text style={styles.dipLabel}>Can you do a full dip?</Text>
                <View style={styles.dipRow}>
                  <OptionCard label="Yes" selected={data.canDip === true} onPress={() => update({ canDip: true })} />
                  <OptionCard label="Not yet" selected={data.canDip === false} onPress={() => update({ canDip: false })} />
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Fixed: Continue */}
      <View style={styles.buttonWrap}>
        <GlossyButton disabled={!canContinue} onPress={next}
          label={isLast ? 'Start training' : 'Continue'}
          icon={isLast ? '→' : undefined} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },

  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, color: colors.text },
  track: { flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, backgroundColor: colors.text, borderRadius: 2 },

  scroll: { flex: 1 },
  scrollInner: { paddingBottom: spacing.lg },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.text, letterSpacing: -0.8, lineHeight: 36, marginBottom: spacing.xs },
  subtitle: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.md },
  body: { paddingTop: spacing.xl },

  buttonWrap: { paddingTop: spacing.md, paddingBottom: spacing.lg },

  // Options
  optionGroup: { gap: spacing.sm },
  option: { backgroundColor: colors.surface, borderRadius: radius.xl, paddingVertical: 22, paddingHorizontal: spacing.lg },
  optionSel: { backgroundColor: colors.text },
  optionLabel: { fontFamily: fonts.displayMedium, fontSize: 17, color: colors.text },
  optionLabelSel: { color: '#FFFFFF' },
  optionSub: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  optionSubSel: { color: 'rgba(255,255,255,0.6)' },

  // Name
  nameInput: {
    fontFamily: fonts.displayMedium, fontSize: 24, color: colors.text,
    backgroundColor: colors.surface, borderRadius: radius.xl,
    paddingVertical: 22, paddingHorizontal: spacing.lg,
  },

  // Measurements
  measureGroup: { gap: spacing.lg },
  unitToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  unitLabel: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.textMuted },
  unitLabelActive: { color: colors.text },

  // Pickers
  dualPicker: { flexDirection: 'row', gap: spacing.lg },
  pickerCol: { flex: 1, alignItems: 'center', gap: spacing.sm },
  pickerLabel: { fontFamily: fonts.display, fontSize: 16, color: colors.text },

  // Target weight
  targetGroup: { alignItems: 'center', gap: spacing.sm },
  targetLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  targetValue: { fontFamily: fonts.display, fontSize: 42, color: colors.text, letterSpacing: -1.5 },

  // Equipment
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: radius.full, backgroundColor: colors.surface },
  chipSel: { backgroundColor: colors.text },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  chipTextSel: { color: '#FFFFFF' },
  chipHint: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: spacing.md, width: '100%', textAlign: 'center' },

  // Assessment
  assessGroup: { gap: spacing.lg },
  dipLabel: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.textSecondary },
  dipRow: { gap: spacing.sm },
});
