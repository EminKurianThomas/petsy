import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme, lightColors as colors } from '../theme/theme';

const MAP = {
  done: { color: colors.primary, label: 'Done' },
  upcoming: { color: colors.gold, label: 'Upcoming' },
  overdue: { color: colors.accent, label: 'Overdue' },
};

function PawIcon({ color, size = 11 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Circle cx="7" cy="6" r="2.3" />
      <Circle cx="12.2" cy="4.5" r="2.3" />
      <Circle cx="17.2" cy="6" r="2.3" />
      <Path d="M12 10c-4 0-7 3.2-7 6.4 0 2.2 1.8 3.6 4 3.1 1.4-.3 2-.1 3 .1 1 .2 1.6 0 3-.1 2.2-.3 4-1.9 4-3.6C19 12.9 16 10 12 10z" />
    </Svg>
  );
}

export default function Stamp({ status }) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const meta = MAP[status] || MAP.upcoming;
  return (
    <View style={[styles.stamp, { borderColor: meta.color, transform: [{ rotate: '-3deg' }] }]}>
      <PawIcon color={meta.color} />
      <Text style={[styles.label, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  stamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.4,
    borderStyle: 'dashed',
    borderRadius: 999,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
