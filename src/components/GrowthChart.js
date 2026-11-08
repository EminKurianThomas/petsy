import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Line, Rect } from 'react-native-svg';
import { useTheme, radii, lightColors as colors } from '../theme/theme';

export default function GrowthChart({
  data = [],
  color = colors.primary,
  unit = 'kg',
  idealMin,
  idealMax,
  evaluation,
}) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const w = 320;
  const h = 110;
  const padX = 14;
  const padY = 16;

  if (!data || data.length < 1) {
    return (
      <View style={{ height: h, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.inkSoft, fontSize: 12 }}>Log weight a couple of times to see a trend.</Text>
      </View>
    );
  }

  // Calculate scales
  const allVals = [...data];
  if (idealMin) allVals.push(idealMin);
  if (idealMax) allVals.push(idealMax);

  const min = Math.min(...allVals) * 0.95;
  const max = Math.max(...allVals) * 1.05;
  const range = max - min || 1;

  const stepX = data.length > 1 ? (w - padX * 2) / (data.length - 1) : 0;

  const pts = data.map((v, i) => [
    padX + (data.length > 1 ? i * stepX : (w - padX * 2) / 2),
    h - padY - ((v - min) / range) * (h - padY * 2),
  ]);

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length - 1][0]},${h - padY} L${pts[0][0]},${h - padY} Z`;

  // Ideal range band coordinates
  const idealYTop = idealMax ? h - padY - ((idealMax - min) / range) * (h - padY * 2) : 0;
  const idealYBottom = idealMin ? h - padY - ((idealMin - min) / range) * (h - padY * 2) : 0;
  const idealBandHeight = Math.max(0, idealYBottom - idealYTop);

  return (
    <View style={styles.container}>
      {/* Evaluation Status Header */}
      {evaluation && (
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: evaluation.badgeColor }]}>
            <Text style={styles.badgeText}>{evaluation.statusLabel}</Text>
          </View>
          <Text style={styles.targetHint}>
            Target: {evaluation.idealMin}–{evaluation.idealMax} {unit}
          </Text>
        </View>
      )}

      {/* SVG Chart */}
      <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
        <Defs>
          <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>

        {/* Shaded ideal range band */}
        {idealMin && idealMax && (
          <Rect
            x={padX}
            y={idealYTop}
            width={w - padX * 2}
            height={idealBandHeight}
            fill="#1F5C4A"
            fillOpacity={0.08}
            rx={4}
          />
        )}

        {/* Target Guide Lines */}
        {idealMin && (
          <Line
            x1={padX}
            y1={idealYBottom}
            x2={w - padX}
            y2={idealYBottom}
            stroke="#1F5C4A"
            strokeWidth={1}
            strokeDasharray="4, 4"
            strokeOpacity={0.35}
          />
        )}
        {idealMax && (
          <Line
            x1={padX}
            y1={idealYTop}
            x2={w - padX}
            y2={idealYTop}
            stroke="#1F5C4A"
            strokeWidth={1}
            strokeDasharray="4, 4"
            strokeOpacity={0.35}
          />
        )}

        {/* Shaded Area & Line */}
        {data.length > 1 && <Path d={areaPath} fill="url(#fade)" />}
        {data.length > 1 && (
          <Path d={linePath} fill="none" stroke={color} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round" />
        )}

        {/* Plotted Data Points */}
        {pts.map((p, i) => {
          const isLatest = i === pts.length - 1;
          return (
            <Circle
              key={i}
              cx={p[0]}
              cy={p[1]}
              r={isLatest ? 5 : 3.5}
              fill={isLatest ? colors.accent : color}
              stroke="#fff"
              strokeWidth={2}
            />
          );
        })}
      </Svg>

      {/* Axis Footer */}
      <View style={styles.foot}>
        <Text style={styles.footText}>First: {data[0]} {unit}</Text>
        <Text style={[styles.footText, { fontWeight: '700', color: colors.ink }]}>
          Current: {data[data.length - 1]} {unit}
        </Text>
      </View>
    </View>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: { width: '100%' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  targetHint: {
    fontSize: 11,
    color: colors.inkSoft,
    fontWeight: '600',
  },
  foot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  footText: {
    fontSize: 11,
    color: colors.inkSoft,
  },
});
