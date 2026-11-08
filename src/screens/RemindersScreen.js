import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categoryMeta, useTheme, radii } from '../theme/theme';
import { usePets } from '../data/PetsContext';
import { Card, Eyebrow, EmptyState } from '../components/Basics';
import { ChipSelect } from '../components/Buttons';
import ReminderItem from '../components/ReminderItem';
import AddReminderForm from './forms/AddReminderForm';
import Fab from '../components/Fab';

export default function RemindersScreen() {
  const { pets, activePetId, reminders, cycleReminderStatus, deleteReminder } = usePets();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const [filter, setFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('status'); // 'status' | 'date'

  const pet = pets.find((p) => p.id === activePetId) || pets[0];

  const list = useMemo(() => {
    let items = reminders.filter((r) => r.petId === (pet && pet.id));
    
    if (filter !== 'all') {
      items = items.filter((r) => r.cat === filter);
    }

    items.sort((a, b) => {
      if (sortOrder === 'status') {
        const order = { 'overdue': 0, 'upcoming': 1, 'done': 2 };
        return order[a.status] - order[b.status];
      }
      return 0; // Simulated date sort, real implementation would parse date string
    });
    
    return items;
  }, [reminders, pet, filter, sortOrder]);

  const filterOptions = [
    { label: 'All', value: 'all' }, 
    ...Object.keys(categoryMeta).map((k) => ({ label: categoryMeta[k].label, value: k }))
  ];
  
  const sortOptions = [
    { label: 'By Status', value: 'status' },
    { label: 'By Date', value: 'date' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Eyebrow style={{ color: colors.primary }}>Care schedule</Eyebrow>
          <Text style={styles.h1}>Reminders</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        <ChipSelect options={filterOptions} value={filter} onChange={setFilter} />
        <View style={{ height: 4 }} />
        <ChipSelect options={sortOptions} value={sortOrder} onChange={setSortOrder} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.hint}>Tap a reminder to cycle its status. Long-press to remove.</Text>
        <Card style={{ paddingHorizontal: 12, paddingVertical: 4 }}>
          {list.length ? (
            list.map((r) => (
              <ReminderItem
                key={r.id}
                item={r}
                onPress={() => cycleReminderStatus(r.id)}
                onLongPress={() =>
                  Alert.alert('Remove reminder', `Delete "${r.title}"?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteReminder(r.id) },
                  ])
                }
              />
            ))
          ) : (
            <EmptyState message="Nothing here yet." />
          )}
        </Card>
      </ScrollView>

      {pet ? <Fab onPress={() => setAddOpen(true)} /> : null}

      <Modal visible={addOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAddOpen(false)}>
        <AddReminderForm onClose={() => setAddOpen(false)} defaultPetId={pet && pet.id} />
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 14 },
  h1: { fontSize: 24, fontWeight: '800', color: colors.primaryDeep, marginTop: 2, letterSpacing: -0.5 },
  body: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 100 },
  hint: { fontSize: 11.5, color: colors.inkSoft, marginBottom: 10 },
});
