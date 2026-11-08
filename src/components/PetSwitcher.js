import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useTheme, radii } from '../theme/theme';

export default function PetSwitcher({ pets, activePetId, onSelect, onAdd }) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {pets.map((p) => {
        const active = p.id === activePetId;
        return (
          <Pressable
            key={p.id}
            onPress={() => onSelect(p.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <View style={[styles.avatar, { backgroundColor: p.color }]}>
              <Text style={styles.avatarText}>{p.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={[styles.name, active && styles.nameActive]}>{p.name}</Text>
          </Pressable>
        );
      })}
      <Pressable onPress={onAdd} style={styles.addChip}>
        <Text style={styles.addText}>+ Add pet</Text>
      </Pressable>
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  row: { gap: 10, paddingVertical: 4, paddingBottom: 20 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    paddingRight: 14,
    paddingLeft: 7,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  chipActive: { borderColor: 'transparent', backgroundColor: colors.primaryDeep },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  name: { fontWeight: '700', fontSize: 13.5, color: colors.ink },
  nameActive: { color: '#fff' },
  addChip: {
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.line,
  },
  addText: { color: colors.inkSoft, fontWeight: '700', fontSize: 13 },
});
