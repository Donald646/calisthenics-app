import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import { colors, fonts, spacing } from '@/constants/theme';
import type { MuscleGroupId, MuscleRole } from '@/types';

type MuscleIntensity = 'primary' | 'secondary' | 'none';

interface Props {
  /** Map of muscle group IDs to their activation level */
  activeMuscles: Partial<Record<MuscleGroupId, MuscleRole>>;
  size?: number;
}

function getColor(intensity: MuscleIntensity) {
  switch (intensity) {
    case 'primary': return 'rgba(0,0,0,0.85)';
    case 'secondary': return 'rgba(0,0,0,0.35)';
    default: return 'rgba(0,0,0,0.06)';
  }
}

function getIntensity(
  muscleId: MuscleGroupId,
  activeMuscles: Partial<Record<MuscleGroupId, MuscleRole>>
): MuscleIntensity {
  const role = activeMuscles[muscleId];
  if (role === 'primary') return 'primary';
  if (role === 'secondary' || role === 'stabilizer') return 'secondary';
  return 'none';
}

// ── Anterior (front) figure ──────────────────────────────────────
function AnteriorBody({ activeMuscles, w, h }: { activeMuscles: Props['activeMuscles']; w: number; h: number }) {
  const vb = '0 0 160 360';
  return (
    <Svg width={w} height={h} viewBox={vb}>
      {/* Body outline */}
      <Path d="M80 18 C92 18 100 28 100 40 C100 50 96 58 94 62 C108 66 118 72 122 84 C126 96 126 110 128 124 C130 138 134 152 134 162 C134 170 130 176 124 178 C120 184 118 192 118 202 L120 238 C120 252 124 270 126 286 C128 298 128 310 126 320 C124 328 120 332 114 332 C110 332 108 328 106 322 C104 308 100 290 98 274 C96 260 94 250 92 244 C88 248 84 250 80 250 C76 250 72 248 68 244 C66 250 64 260 62 274 C60 290 56 308 54 322 C52 328 50 332 46 332 C40 332 36 328 34 320 C32 310 32 298 34 286 C36 270 40 252 40 238 L42 202 C42 192 40 184 36 178 C30 176 26 170 26 162 C26 152 30 138 32 124 C34 110 34 96 38 84 C42 72 52 66 66 62 C64 58 60 50 60 40 C60 28 68 18 80 18 Z"
        fill="rgba(0,0,0,0.04)" stroke="rgba(0,0,0,0.15)" strokeWidth={1.2} />
      {/* Head */}
      <SvgCircle cx={80} cy={34} r={0.5} fill="rgba(0,0,0,0.3)" />
      <SvgCircle cx={76} cy={34} r={0.5} fill="rgba(0,0,0,0.3)" />

      {/* Pectorals */}
      <Path d="M66 76 C72 72 76 72 80 72 C84 72 88 72 94 76 C100 80 104 88 106 98 C106 106 102 112 96 114 C88 116 84 112 80 108 C76 112 72 116 64 114 C58 112 54 106 54 98 C56 88 60 80 66 76 Z"
        fill={getColor(getIntensity('pectoralis', activeMuscles))} />

      {/* Anterior deltoids */}
      <Path d="M48 80 C44 84 40 92 38 102 C36 110 38 116 44 118 C50 120 54 116 56 108 C58 98 54 86 48 80 Z"
        fill={getColor(getIntensity('anterior_deltoid', activeMuscles))} />
      <Path d="M112 80 C116 84 120 92 122 102 C124 110 122 116 116 118 C110 120 106 116 104 108 C102 98 106 86 112 80 Z"
        fill={getColor(getIntensity('anterior_deltoid', activeMuscles))} />

      {/* Biceps */}
      <Path d="M38 118 C34 128 32 140 32 150 C34 156 38 158 42 156 C46 152 48 142 46 130 C44 124 42 120 38 118 Z"
        fill={getColor(getIntensity('biceps', activeMuscles))} />
      <Path d="M122 118 C126 128 128 140 128 150 C126 156 122 158 118 156 C114 152 112 142 114 130 C116 124 118 120 122 118 Z"
        fill={getColor(getIntensity('biceps', activeMuscles))} />

      {/* Abs */}
      <Path d="M68 118 C72 116 76 116 80 116 C84 116 88 116 92 118 C94 128 94 140 92 154 C90 170 86 180 80 184 C74 180 70 170 68 154 C66 140 66 128 68 118 Z"
        fill={getColor(getIntensity('rectus_abdominis', activeMuscles))} />
      <Path d="M80 120 L80 182" stroke="rgba(0,0,0,0.1)" strokeWidth={0.6} />
      <Path d="M70 132 L90 132 M70 146 L90 146 M70 160 L90 160" stroke="rgba(0,0,0,0.08)" strokeWidth={0.6} />

      {/* Obliques */}
      <Path d="M60 130 C58 142 56 156 58 168 C62 166 66 160 66 150 C66 140 64 134 60 130 Z"
        fill={getColor(getIntensity('obliques', activeMuscles))} />
      <Path d="M100 130 C102 142 104 156 102 168 C98 166 94 160 94 150 C94 140 96 134 100 130 Z"
        fill={getColor(getIntensity('obliques', activeMuscles))} />

      {/* Forearms */}
      <Path d="M32 158 C28 172 28 186 30 196 C34 198 38 194 40 182 C40 172 38 162 32 158 Z"
        fill={getColor(getIntensity('forearms', activeMuscles))} stroke="rgba(0,0,0,0.1)" strokeWidth={0.6} />
      <Path d="M128 158 C132 172 132 186 130 196 C126 198 122 194 120 182 C120 172 122 162 128 158 Z"
        fill={getColor(getIntensity('forearms', activeMuscles))} stroke="rgba(0,0,0,0.1)" strokeWidth={0.6} />

      {/* Quads */}
      <Path d="M46 208 C44 224 44 244 46 262 C48 278 52 294 58 302 C64 296 66 282 66 266 C66 248 64 228 62 212 C58 206 50 206 46 208 Z"
        fill={getColor(getIntensity('quadriceps', activeMuscles))} />
      <Path d="M114 208 C116 224 116 244 114 262 C112 278 108 294 102 302 C96 296 94 282 94 266 C94 248 96 228 98 212 C102 206 110 206 114 208 Z"
        fill={getColor(getIntensity('quadriceps', activeMuscles))} />
    </Svg>
  );
}

// ── Posterior (back) figure ───────────────────────────────────────
function PosteriorBody({ activeMuscles, w, h }: { activeMuscles: Props['activeMuscles']; w: number; h: number }) {
  const vb = '0 0 160 360';
  return (
    <Svg width={w} height={h} viewBox={vb}>
      {/* Body outline */}
      <Path d="M80 18 C92 18 100 28 100 40 C100 50 96 58 94 62 C108 66 118 72 122 84 C126 96 126 110 128 124 C130 138 134 152 134 162 C134 170 130 176 124 178 C120 184 118 192 118 202 L120 238 C120 252 124 270 126 286 C128 298 128 310 126 320 C124 328 120 332 114 332 C110 332 108 328 106 322 C104 308 100 290 98 274 C96 260 94 250 92 244 C88 248 84 250 80 250 C76 250 72 248 68 244 C66 250 64 260 62 274 C60 290 56 308 54 322 C52 328 50 332 46 332 C40 332 36 328 34 320 C32 310 32 298 34 286 C36 270 40 252 40 238 L42 202 C42 192 40 184 36 178 C30 176 26 170 26 162 C26 152 30 138 32 124 C34 110 34 96 38 84 C42 72 52 66 66 62 C64 58 60 50 60 40 C60 28 68 18 80 18 Z"
        fill="rgba(0,0,0,0.04)" stroke="rgba(0,0,0,0.15)" strokeWidth={1.2} />

      {/* Trapezius */}
      <Path d="M68 62 C72 66 76 68 80 68 C84 68 88 66 92 62 C100 68 108 76 112 86 C108 90 100 92 92 90 C88 88 84 86 80 86 C76 86 72 88 68 90 C60 92 52 90 48 86 C52 76 60 68 68 62 Z"
        fill={getColor(getIntensity('trapezius', activeMuscles))} />

      {/* Rear delts */}
      <Path d="M46 88 C42 92 38 100 36 110 C34 118 36 124 42 126 C48 128 52 124 54 116 C56 106 52 94 46 88 Z"
        fill={getColor(getIntensity('posterior_deltoid', activeMuscles))} />
      <Path d="M114 88 C118 92 122 100 124 110 C126 118 124 124 118 126 C112 128 108 124 106 116 C104 106 108 94 114 88 Z"
        fill={getColor(getIntensity('posterior_deltoid', activeMuscles))} />

      {/* Lats */}
      <Path d="M54 94 C50 108 48 124 50 140 C52 154 58 162 66 162 C70 158 72 148 72 134 C72 120 70 108 66 98 C62 94 58 94 54 94 Z"
        fill={getColor(getIntensity('latissimus', activeMuscles))} />
      <Path d="M106 94 C110 108 112 124 110 140 C108 154 102 162 94 162 C90 158 88 148 88 134 C88 120 90 108 94 98 C98 94 102 94 106 94 Z"
        fill={getColor(getIntensity('latissimus', activeMuscles))} />

      {/* Spine line */}
      <Path d="M80 90 L80 180" stroke="rgba(0,0,0,0.08)" strokeWidth={0.5} />

      {/* Triceps */}
      <Path d="M34 120 C30 132 28 144 30 154 C34 156 38 152 40 140 C40 130 38 122 34 120 Z"
        fill={getColor(getIntensity('triceps', activeMuscles))} />
      <Path d="M126 120 C130 132 132 144 130 154 C126 156 122 152 120 140 C120 130 122 122 126 120 Z"
        fill={getColor(getIntensity('triceps', activeMuscles))} />

      {/* Erector spinae / rhomboids */}
      <Path d="M72 96 C74 110 74 130 74 146 C76 150 78 150 80 150 C82 150 84 150 86 146 C86 130 86 110 88 96 C84 94 80 94 80 94 C80 94 76 94 72 96 Z"
        fill={getColor(getIntensity('erector_spinae', activeMuscles))} />

      {/* Glutes */}
      <Path d="M54 186 C50 196 48 208 50 218 C54 224 62 226 70 224 C76 220 78 212 78 202 C78 192 74 186 68 184 C62 182 58 184 54 186 Z"
        fill={getColor(getIntensity('glutes', activeMuscles))} />
      <Path d="M106 186 C110 196 112 208 110 218 C106 224 98 226 90 224 C84 220 82 212 82 202 C82 192 86 186 92 184 C98 182 102 184 106 186 Z"
        fill={getColor(getIntensity('glutes', activeMuscles))} />

      {/* Hamstrings */}
      <Path d="M48 226 C46 242 46 260 48 276 C50 286 54 294 58 298 C62 294 64 284 64 270 C64 254 62 238 60 226 C56 222 52 222 48 226 Z"
        fill={getColor(getIntensity('hamstrings', activeMuscles))} />
      <Path d="M112 226 C114 242 114 260 112 276 C110 286 106 294 102 298 C98 294 96 284 96 270 C96 254 98 238 100 226 C104 222 108 222 112 226 Z"
        fill={getColor(getIntensity('hamstrings', activeMuscles))} />

      {/* Calves */}
      <Path d="M50 300 C48 308 48 316 50 322 C52 326 56 326 58 322 C60 316 60 308 58 300 C56 298 52 298 50 300 Z"
        fill={getColor(getIntensity('calves', activeMuscles))} />
      <Path d="M110 300 C112 308 112 316 110 322 C108 326 104 326 102 322 C100 316 100 308 102 300 C104 298 108 298 110 300 Z"
        fill={getColor(getIntensity('calves', activeMuscles))} />
    </Svg>
  );
}

// ── Main component ───────────────────────────────────────────────
export function BodyMap({ activeMuscles, size = 160 }: Props) {
  const figH = size * 2.2;
  return (
    <View style={styles.container}>
      <View style={styles.figures}>
        <View style={styles.figure}>
          <AnteriorBody activeMuscles={activeMuscles} w={size} h={figH} />
          <Text style={styles.label}>Front</Text>
        </View>
        <View style={styles.figure}>
          <PosteriorBody activeMuscles={activeMuscles} w={size} h={figH} />
          <Text style={styles.label}>Back</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  figures: { flexDirection: 'row', gap: spacing.sm },
  figure: { alignItems: 'center', gap: spacing.sm },
  label: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
});
