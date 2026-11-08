import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme, radii } from '../theme/theme';

export function Card({ children, style }) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionHead({ title, action, onAction }) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        onAction ? (
          <Pressable onPress={onAction} hitSlop={8}>
            <Text style={styles.sectionAction}>{action}</Text>
          </Pressable>
        ) : (
          <Text style={styles.sectionAction}>{action}</Text>
        )
      ) : null}
    </View>
  );
}

export function EmptyState({ message }) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  return (
    <View style={{ paddingVertical: 22, alignItems: 'center' }}>
      <Text style={{ color: colors.inkSoft, fontSize: 13 }}>{message}</Text>
    </View>
  );
}

export function Eyebrow({ children, style }) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  return <Text style={[styles.eyebrow, style]}>{children}</Text>;
}

const getStyles = (colors, isDark) => StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: 16,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: undefined, fontWeight: '700', fontSize: 17, color: colors.primaryDeep },
  sectionAction: { fontSize: 12, fontWeight: '700', color: colors.primary },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.inkSoft,
    fontWeight: '600',
  },
});
