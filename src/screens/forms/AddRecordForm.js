import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { recordTypes, useTheme } from '../../theme/theme';
import { usePets } from '../../data/PetsContext';
import Field from '../../components/Field';
import { PrimaryButton, GhostButton, ChipSelect } from '../../components/Buttons';

export default function AddRecordForm({ onClose, petId, defaultType }) {
  const { addRecord } = usePets();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const [type, setType] = useState(defaultType || 'vaccinations');
  const [title, setTitle] = useState('');
  const [meta, setMeta] = useState('');
  const [doctor, setDoctor] = useState('');

  const canSave = title.trim().length > 0;
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await addRecord({ petId, type, title: title.trim(), meta: meta.trim() || 'No further detail added', doctor: doctor.trim() || undefined });
      onClose();
    } catch (e) {
      console.warn('Failed to save record', e);
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <GhostButton title="Cancel" onPress={onClose} />
          <Text style={styles.title}>New record</Text>
          <View style={{ width: 56 }} />
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.label}>Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 14 }}>
            <ChipSelect options={recordTypes.map((t) => ({ label: t.label, value: t.key }))} value={type} onChange={setType} />
          </ScrollView>

          <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Rabies vaccine" />
          <Field label="Details / Notes" value={meta} onChangeText={setMeta} placeholder="e.g. Valid until next year" />
          <Field label="Doctor / Clinic (Optional)" value={doctor} onChangeText={setDoctor} placeholder="e.g. Dr. Sen at City Vet" />

          <PrimaryButton title={saving ? 'Saving…' : 'Save record'} onPress={save} disabled={!canSave || saving} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  title: { fontWeight: '700', fontSize: 15, color: colors.primaryDeep },
  body: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 12, fontWeight: '700', color: colors.inkSoft, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
});
