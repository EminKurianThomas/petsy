import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme/theme';

export default function Fab({ onPress }) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round">
        <Path d="M12 5v14M5 12h14" />
      </Svg>
    </Pressable>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
