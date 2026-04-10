import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { colors, fonts, spacing } from '@/constants/theme';

interface RadarAxis {
  label: string;
  value: number; // 0–100
}

interface Props {
  axes: RadarAxis[];
  size?: number;
}

const RINGS = 4; // concentric rings

export function RadarChart({ axes, size = 260 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 36; // leave room for labels
  const angleStep = (2 * Math.PI) / axes.length;
  // Start from top (-90deg)
  const startAngle = -Math.PI / 2;

  function polarToXY(angle: number, r: number) {
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  }

  // Grid rings
  const rings = Array.from({ length: RINGS }, (_, i) => ((i + 1) / RINGS) * maxR);

  // Data polygon points
  const dataPoints = axes.map((axis, i) => {
    const angle = startAngle + i * angleStep;
    const r = (axis.value / 100) * maxR;
    return polarToXY(angle, r);
  });
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Axis endpoints (for lines + labels)
  const axisEnds = axes.map((_, i) => {
    const angle = startAngle + i * angleStep;
    return {
      line: polarToXY(angle, maxR),
      label: polarToXY(angle, maxR + 20),
      angle,
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Concentric rings */}
        {rings.map((r, i) => (
          <Circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            stroke={colors.border}
            strokeWidth={1}
            fill="none"
          />
        ))}

        {/* Axis lines */}
        {axisEnds.map((a, i) => (
          <Line
            key={i}
            x1={cx}
            y1={cy}
            x2={a.line.x}
            y2={a.line.y}
            stroke={colors.border}
            strokeWidth={1}
          />
        ))}

        {/* Data polygon fill */}
        <Polygon
          points={polygonPoints}
          fill="rgba(0,0,0,0.08)"
          stroke={colors.text}
          strokeWidth={2}
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={colors.text}
          />
        ))}

        {/* Axis labels */}
        {axes.map((axis, i) => {
          const lp = axisEnds[i].label;
          const angle = axisEnds[i].angle;
          // Determine text anchor based on position
          let anchor: 'start' | 'middle' | 'end' = 'middle';
          if (Math.cos(angle) > 0.3) anchor = 'start';
          else if (Math.cos(angle) < -0.3) anchor = 'end';

          return (
            <SvgText
              key={i}
              x={lp.x}
              y={lp.y}
              textAnchor={anchor}
              alignmentBaseline="middle"
              fontSize={11}
              fontWeight="600"
              fill={colors.textSecondary}>
              {axis.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
