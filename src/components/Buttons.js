import React from 'react';
import { Text, Pressable, View, ScrollView, StyleSheet } from 'react-native';
import { useTheme, radii } from '../theme/theme';

export function PrimaryButton({ title, onPress, disabled }) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primary,
        disabled && { opacity: 0.4 },
        pressed && !disabled && { opacity: 0.85 },
      ]}
    >
      <Text style={styles.primaryText}>{title}</Text>
    </Pressable>
  );
}

export function GhostButton({ title, onPress, color }) {
  const { colors, isDark } = useTheme();
  const resolvedColor = color ?? colors.inkSoft;
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ghost, pressed && { opacity: 0.6 }]}>
      <Text style={[styles.ghostText, { color: resolvedColor }]}>{title}</Text>
    </Pressable>
  );
}

export function ChipSelect({ options, value, onChange }) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  ghost: { paddingVertical: 14, alignItems: 'center' },
  ghostText: { fontWeight: '700', fontSize: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12.5, fontWeight: '700', color: colors.inkSoft },
  chipTextActive: { color: '#fff' },
});
