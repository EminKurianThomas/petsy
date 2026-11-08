import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal, Alert, Pressable, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radii, recordTypes, useTheme } from '../theme/theme';
import { usePets } from '../data/PetsContext';
import { Card, Eyebrow, EmptyState } from '../components/Basics';
import Fab from '../components/Fab';
import AddRecordForm from './forms/AddRecordForm';

export default function RecordsScreen() {
  const { pets, activePetId, records, deleteRecord } = usePets();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const [tab, setTab] = useState('vaccinations');
  const [addOpen, setAddOpen] = useState(false);

  const pet = pets.find((p) => p.id === activePetId) || pets[0];

  const entries = useMemo(
    () => records.filter((r) => r.petId === (pet && pet.id) && r.type === tab),
    [records, pet, tab]
  );

  const exportRecords = () => {
    if (!pet) return;
    const petRecords = records.filter(r => r.petId === pet.id);
    let text = `Health Records for ${pet.name}\n\n`;
    recordTypes.forEach(t => {
      const typeRecords = petRecords.filter(r => r.type === t.key);
      if (typeRecords.length > 0) {
        text += `--- ${t.label.replace(/[^a-zA-Z ]/g, '').trim()} ---\n`;
        typeRecords.forEach(r => {
          text += `• ${r.title}\n  ${r.meta}\n`;
        });
        text += '\n';
      }
    });
    Clipboard.setString(text);
    Alert.alert('Copied!', 'Records copied to clipboard.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Eyebrow style={{ color: colors.primary }}>Digital health file</Eyebrow>
            <Text style={styles.h1}>Records</Text>
          </View>
          {pet && (
             <Pressable onPress={exportRecords} style={styles.exportBtn}>
               <Text style={styles.exportBtnText}>Copy All</Text>
             </Pressable>
          )}
        </View>

        {pet ? (
          <>
            <View style={styles.passport}>
              <Eyebrow style={{ color: 'rgba(255,255,255,0.7)' }}>Pet passport</Eyebrow>
              <Text style={styles.passportName}>{pet.name} · {pet.breed}</Text>
              <Text style={styles.passportSub}>{pet.species} · {pet.gender} · {pet.age}</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
              <View style={styles.tabs}>
                {recordTypes.map((t) => (
                  <Pressable key={t.key} onPress={() => setTab(t.key)} style={[styles.tab, tab === t.key && styles.tabActive]}>
                    <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Card style={{ paddingHorizontal: 14, paddingVertical: 4 }}>
              {entries.length ? (
                entries.map((e) => (
                  <Pressable
                    key={e.id}
                    style={styles.entry}
                    onLongPress={() =>
                      Alert.alert('Remove record', `Delete "${e.title}"?`, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deleteRecord(e.id) },
                      ])
                    }
                  >
                    <View style={styles.dot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.entryTitle}>{e.title}</Text>
                      <Text style={styles.entryMeta}>{e.meta}</Text>
                      {e.doctor && (
                         <Text style={styles.entryDoctor}>👨‍⚕️ {e.doctor}</Text>
                      )}
                    </View>
                  </Pressable>
                ))
              ) : (
                <EmptyState message="No entries logged yet." />
              )}
            </Card>
          </>
        ) : (
          <EmptyState message="Add a pet on the Home tab to start a health file." />
        )}
      </ScrollView>

      {pet ? <Fab onPress={() => setAddOpen(true)} /> : null}

      <Modal visible={addOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAddOpen(false)}>
        <AddRecordForm onClose={() => setAddOpen(false)} petId={pet && pet.id} defaultType={tab} />
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 100 },
  header: { paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  h1: { fontSize: 24, fontWeight: '800', color: colors.primaryDeep, marginTop: 2, letterSpacing: -0.5 },
  exportBtn: { backgroundColor: colors.primaryTint, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.pill },
  exportBtnText: { color: colors.primaryDeep, fontWeight: '700', fontSize: 11 },
  passport: {
    borderRadius: radii.lg,
    padding: 22,
    marginTop: 14,
    backgroundColor: colors.primaryDeep,
    shadowColor: colors.primaryDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  passportName: { color: '#fff', fontWeight: '800', fontSize: 20, marginTop: 4, fontFamily: undefined, letterSpacing: -0.5 },
  passportSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 6, fontWeight: '600' },
  tabsScroll: { paddingVertical: 16 },
  tabs: { flexDirection: 'row', gap: 6, backgroundColor: colors.primaryTint, padding: 4, borderRadius: 12 },
  tab: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 9 },
  tabActive: { backgroundColor: colors.paper, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  tabText: { fontSize: 12, fontWeight: '700', color: colors.primaryDeep },
  tabTextActive: { color: colors.primaryDeep },
  entry: { flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primary, marginTop: 5 },
  entryTitle: { fontWeight: '700', fontSize: 14, color: colors.ink },
  entryMeta: { fontSize: 12, color: colors.inkSoft, marginTop: 3, lineHeight: 17 },
  entryDoctor: { fontSize: 11, color: colors.inkMuted, marginTop: 6, fontWeight: '600' },
});
