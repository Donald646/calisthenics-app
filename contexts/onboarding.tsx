import { createContext, useContext, useState, type ReactNode } from 'react';
import type { EquipmentId, UserGoal, ExperienceLevel } from '@/types';

export interface OnboardingData {
  // Step 1: Basics
  name: string;
  age: string;
  heightCm: string;
  weightKg: string;
  sex: 'male' | 'female' | 'other' | '';

  // Step 2: Goal
  goal: UserGoal | '';

  // Step 3: Equipment
  equipment: EquipmentId[];

  // Step 4: Assessment
  maxPushUps: string;
  maxPullUps: string;
  maxSquatHoldSeconds: string;
  canDip: boolean | null;
  lSitHoldSeconds: string;

  // Step 5: Experience
  experience: ExperienceLevel | '';
}

const defaultData: OnboardingData = {
  name: '',
  age: '',
  heightCm: '',
  weightKg: '',
  sex: '',
  goal: '',
  equipment: [],
  maxPushUps: '',
  maxPullUps: '',
  maxSquatHoldSeconds: '',
  canDip: null,
  lSitHoldSeconds: '',
  experience: '',
};

interface OnboardingContextValue {
  data: OnboardingData;
  update: (partial: Partial<OnboardingData>) => void;
  toggleEquipment: (id: EquipmentId) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultData);

  const update = (partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const toggleEquipment = (id: EquipmentId) => {
    setData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(id)
        ? prev.equipment.filter((e) => e !== id)
        : [...prev.equipment, id],
    }));
  };

  return (
    <OnboardingContext.Provider value={{ data, update, toggleEquipment }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
