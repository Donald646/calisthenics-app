import { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/contexts/onboarding';
import { useAppState } from '@/contexts/app-state';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { GlossyButton } from '@/components/glossy-button';
import { equipment as allEquipment } from '@/data/equipment';
import type { UserGoal, ExperienceLevel } from '@/types';

const TOTAL_STEPS = 8;

// ─── Option card ────────────────────────────────────────────

function OptionCard({ label, sublabel, selected, onPress }: {
  label: string; sublabel?: string; selected: boolean; onPress: () => void;
}) {
  return (
    <Pressable style={[styles.option, selected && styles.optionSelected]} onPress={onPress}>
      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{label}</Text>
      {sublabel && <Text style={[styles.optionSub, selected && styles.optionSubSelected]}>{sublabel}</Text>}
    </Pressable>
  );
}

// ─── Step content components ────────────────────────────────

function GenderStep({ data, update }: StepProps) {
  return (
    <>
      {(['male', 'female', 'other'] as const).map((s) => (
        <OptionCard key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} selected={data.sex === s} onPress={() => update({ sex: s })} />
      ))}
    </>
  );
}

function NameStep({ data, update }: StepProps) {
  return (
    <TextInput
      style={styles.fieldInput}
      value={data.name}
      onChangeText={(v) => update({ name: v })}
      placeholder="Your name"
      placeholderTextColor={colors.textMuted}
      autoCapitalize="words"
      autoFocus
    />
  );
}

function BirthdayStep({ data, update }: StepProps) {
  return (
    <View style={styles.centerInput}>
      <TextInput
        style={styles.bigInput}
        value={data.age}
        onChangeText={(v) => update({ age: v.replace(/[^0-9]/g, '') })}
        placeholder="25"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        maxLength={3}
        textAlign="center"
        autoFocus
      />
      <Text style={styles.inputUnit}>years old</Text>
    </View>
  );
}

function MeasurementsStep({ data, update }: StepProps) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.fieldRow}>
        <TextInput
          style={styles.fieldInput}
          value={data.heightCm}
          onChangeText={(v) => update({ heightCm: v.replace(/[^0-9]/g, '') })}
          placeholder="Height"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={3}
        />
        <Text style={styles.fieldUnit}>cm</Text>
      </View>
      <View style={styles.fieldRow}>
        <TextInput
          style={styles.fieldInput}
          value={data.weightKg}
          onChangeText={(v) => update({ weightKg: v.replace(/[^0-9]/g, '') })}
          placeholder="Weight"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={3}
        />
        <Text style={styles.fieldUnit}>kg</Text>
      </View>
    </View>
  );
}

const GOALS: { value: UserGoal; label: string; sub: string }[] = [
  { value: 'general_fitness', label: 'General Fitness', sub: 'Balanced strength and conditioning' },
  { value: 'strength', label: 'Raw Strength', sub: 'Maximize pushing and pulling power' },
  { value: 'skills', label: 'Unlock Skills', sub: 'Muscle-ups, handstands, planches' },
  { value: 'muscle', label: 'Build Muscle', sub: 'Higher volume hypertrophy training' },
];

function GoalStep({ data, update }: StepProps) {
  return (
    <>
      {GOALS.map((g) => (
        <OptionCard key={g.value} label={g.label} sublabel={g.sub} selected={data.goal === g.value} onPress={() => update({ goal: g.value })} />
      ))}
    </>
  );
}

function EquipmentStep({ data, toggleEquipment }: StepProps) {
  return (
    <View style={styles.chipGrid}>
      {allEquipment.filter((e) => e.id !== 'none').map((eq) => {
        const sel = data.equipment.includes(eq.id);
        return (
          <Pressable key={eq.id} style={[styles.chip, sel && styles.chipSelected]} onPress={() => toggleEquipment(eq.id)}>
            <Text style={[styles.chipText, sel && styles.chipTextSelected]}>{eq.name}</Text>
          </Pressable>
        );
      })}
      <Text style={styles.chipHint}>No equipment? Just continue — bodyweight works great.</Text>
    </View>
  );
}

const EXPERIENCE: { value: ExperienceLevel; label: string; sub: string }[] = [
  { value: 'beginner', label: '0–2 per week', sub: 'Just getting started' },
  { value: 'intermediate', label: '3–5 per week', sub: 'Consistent training' },
  { value: 'advanced', label: '6+ per week', sub: 'Dedicated athlete' },
];

function ExperienceStep({ data, update }: StepProps) {
  return (
    <>
      {EXPERIENCE.map((e) => (
        <OptionCard key={e.value} label={e.label} sublabel={e.sub} selected={data.experience === e.value} onPress={() => update({ experience: e.value })} />
      ))}
    </>
  );
}

function AssessmentStep({ data, update }: StepProps) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.assessField}>
        <Text style={styles.assessLabel}>Max push-ups</Text>
        <View style={styles.fieldRow}>
          <TextInput
            style={styles.fieldInput}
            value={data.maxPushUps}
            onChangeText={(v) => update({ maxPushUps: v.replace(/[^0-9]/g, '') })}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={3}
          />
          <Text style={styles.fieldUnit}>reps</Text>
        </View>
      </View>
      <View style={styles.assessField}>
        <Text style={styles.assessLabel}>Max pull-ups</Text>
        <View style={styles.fieldRow}>
          <TextInput
            style={styles.fieldInput}
            value={data.maxPullUps}
            onChangeText={(v) => update({ maxPullUps: v.replace(/[^0-9]/g, '') })}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={3}
          />
          <Text style={styles.fieldUnit}>reps</Text>
        </View>
      </View>
      <View style={styles.assessField}>
        <Text style={styles.assessLabel}>Can you do a full dip?</Text>
        <View style={{ gap: spacing.sm }}>
          <OptionCard label="Yes" selected={data.canDip === true} onPress={() => update({ canDip: true })} />
          <OptionCard label="Not yet" selected={data.canDip === false} onPress={() => update({ canDip: false })} />
        </View>
      </View>
    </View>
  );
}

// ─── Step config ────────────────────────────────────────────

interface StepConfig {
  title: string;
  subtitle?: string;
  canContinue: (data: OnboardingData) => boolean;
  Component: (props: StepProps) => React.JSX.Element;
}

type OnboardingData = ReturnType<typeof useOnboarding>['data'];
type StepProps = {
  data: OnboardingData;
  update: ReturnType<typeof useOnboarding>['update'];
  toggleEquipment: ReturnType<typeof useOnboarding>['toggleEquipment'];
};

const STEPS: StepConfig[] = [
  {
    title: 'Choose your gender',
    subtitle: 'This will be used to calibrate your custom plan.',
    canContinue: (d) => d.sex !== '',
    Component: GenderStep,
  },
  {
    title: "What's your name?",
    subtitle: "We'll use this to personalize your experience.",
    canContinue: (d) => d.name.length > 0,
    Component: NameStep,
  },
  {
    title: 'How old are you?',
    subtitle: 'This will be used to calibrate your custom plan.',
    canContinue: (d) => d.age.length > 0 && parseInt(d.age, 10) > 0,
    Component: BirthdayStep,
  },
  {
    title: 'Height & weight',
    subtitle: 'This will be used to calibrate your custom plan.',
    canContinue: (d) => d.heightCm.length > 0 && d.weightKg.length > 0,
    Component: MeasurementsStep,
  },
  {
    title: 'What is your goal?',
    subtitle: 'This helps us generate a plan for your training.',
    canContinue: (d) => d.goal !== '',
    Component: GoalStep,
  },
  {
    title: 'What equipment do you have?',
    subtitle: 'Select everything you have access to.',
    canContinue: () => true,
    Component: EquipmentStep,
  },
  {
    title: 'How often do you train?',
    subtitle: 'This will be used to calibrate your custom plan.',
    canContinue: (d) => d.experience !== '',
    Component: ExperienceStep,
  },
  {
    title: 'Quick fitness check',
    subtitle: "Rough numbers are fine — this places you on the right level.",
    canContinue: (d) => d.maxPushUps.length > 0 && d.maxPullUps.length > 0 && d.canDip !== null,
    Component: AssessmentStep,
  },
];

// ─── Main Screen ────────────────────────────────────────────

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, update, toggleEquipment } = useOnboarding();
  const { completeOnboarding } = useAppState();
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const canContinue = current.canContinue(data);
  const progress = (step + 1) / TOTAL_STEPS;

  function handleContinue() {
    if (isLastStep) {
      completeOnboarding(data);
      router.replace('/(tabs)');
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  const StepContent = current.Component;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      {/* Fixed top: back + progress */}
      <View style={styles.topBar}>
        {step > 0 ? (
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      {/* Scrollable content area — this is what changes */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{current.title}</Text>
        {current.subtitle && <Text style={styles.subtitle}>{current.subtitle}</Text>}

        <View style={styles.stepContent}>
          <StepContent data={data} update={update} toggleEquipment={toggleEquipment} />
        </View>
      </ScrollView>

      {/* Fixed bottom: continue button */}
      <GlossyButton
        label={isLastStep ? 'Start training' : 'Continue'}
        icon={isLastStep ? '→' : undefined}
        onPress={handleContinue}
        disabled={!canContinue}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },

  // Fixed top
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, color: colors.text },
  backPlaceholder: { width: 40 },
  progressTrack: { flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: colors.text, borderRadius: 2 },

  // Scrollable area
  scrollArea: { flex: 1 },
  scrollContent: { paddingBottom: spacing.lg },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.text, letterSpacing: -0.8, lineHeight: 36, marginBottom: spacing.xs },
  subtitle: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.xl },
  stepContent: { paddingTop: spacing.md },

  // Option cards
  option: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: 20, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  optionSelected: { backgroundColor: colors.text },
  optionLabel: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.text },
  optionLabelSelected: { color: '#FFFFFF' },
  optionSub: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  optionSubSelected: { color: 'rgba(255,255,255,0.6)' },

  // Input fields
  fieldGroup: { gap: spacing.lg },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: 16,
  },
  fieldInput: {
    flex: 1, fontFamily: fonts.displayMedium, fontSize: 20, color: colors.text,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingVertical: 20, paddingHorizontal: spacing.lg,
  },
  fieldUnit: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted },

  centerInput: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.xxl },
  bigInput: {
    fontFamily: fonts.display, fontSize: 64, color: colors.text, letterSpacing: -2,
    minWidth: 120, textAlign: 'center',
    borderBottomWidth: 2, borderBottomColor: colors.border, paddingVertical: spacing.sm,
  },
  inputUnit: { fontFamily: fonts.body, fontSize: 16, color: colors.textMuted },

  // Equipment chips
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: radius.lg, backgroundColor: colors.surface },
  chipSelected: { backgroundColor: colors.text },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  chipTextSelected: { color: '#FFFFFF' },
  chipHint: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: spacing.md, width: '100%', textAlign: 'center' },

  // Assessment
  assessField: { gap: spacing.sm },
  assessLabel: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textSecondary },
});
