import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme, radii } from '../theme/theme';

export default function Field({ label, value, onChangeText, placeholder, keyboardType, style }) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  return (
    <View style={[{ marginBottom: 14 }, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkSoft}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', color: colors.inkSoft, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.paper,
  },
});
