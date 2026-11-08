import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme, categoryMeta } from '../theme/theme';
import Stamp from './Stamp';

export default function ReminderItem({ item, onPress, onLongPress }) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const meta = categoryMeta[item.cat] || categoryMeta.vet;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
    >
      <View style={[styles.icon, { backgroundColor: meta.bg }]}>
        <Text style={{ fontSize: 17 }}>{meta.icon}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>{item.meta}</Text>
      </View>
      <Stamp status={item.status} />
    </Pressable>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  title: { fontWeight: '700', fontSize: 14, color: colors.ink },
  meta: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
});
