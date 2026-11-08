import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radii, categoryMeta, useTheme } from '../../theme/theme';
import { usePets } from '../../data/PetsContext';
import Field from '../../components/Field';
import { PrimaryButton, GhostButton, ChipSelect } from '../../components/Buttons';

export default function AddReminderForm({ onClose, defaultPetId }) {
  const { pets, addReminder } = usePets();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const [petId, setPetId] = useState(defaultPetId || (pets[0] && pets[0].id));
  const [cat, setCat] = useState('vaccine');
  const [title, setTitle] = useState('');
  const [duePreset, setDuePreset] = useState('Today'); // 'Today' | 'Tomorrow' | 'Next Week' | 'Custom'
  const [customDue, setCustomDue] = useState('');
  const [recurring, setRecurring] = useState('None'); // 'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'

  const canSave = title.trim().length > 0 && petId;
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      let finalDue = duePreset;
      if (duePreset === 'Custom') finalDue = customDue.trim() || 'No date set';
      let metaText = finalDue;
      if (recurring !== 'None') metaText += ` (Recurs ${recurring})`;
      await addReminder({ petId, cat, title: title.trim(), meta: metaText, status: 'upcoming' });
      onClose();
    } catch (e) {
      console.warn('Failed to save reminder', e);
      setSaving(false);
    }
  }

  const dueOptions = [
    { label: 'Today', value: 'Today' },
    { label: 'Tomorrow', value: 'Tomorrow' },
    { label: 'Next Week', value: 'Next Week' },
    { label: 'Custom', value: 'Custom' },
  ];

  const recurringOptions = [
    { label: 'None', value: 'None' },
    { label: 'Daily', value: 'Daily' },
    { label: 'Weekly', value: 'Weekly' },
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Yearly', value: 'Yearly' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <GhostButton title="Cancel" onPress={onClose} />
          <Text style={styles.title}>New reminder</Text>
          <View style={{ width: 56 }} />
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.label}>Pet</Text>
          <ChipSelect options={pets.map((p) => ({ label: p.name, value: p.id }))} value={petId} onChange={setPetId} />
          <View style={{ height: 14 }} />

          <Text style={styles.label}>Category</Text>
          <ChipSelect
            options={Object.keys(categoryMeta).map((k) => ({ label: categoryMeta[k].label, value: k }))}
            value={cat}
            onChange={setCat}
          />
          <View style={{ height: 14 }} />

          <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Rabies booster" />
          
          <Text style={styles.label}>Due Date</Text>
          <ChipSelect options={dueOptions} value={duePreset} onChange={setDuePreset} />
          {duePreset === 'Custom' && (
             <View style={{ marginTop: 10 }}>
               <Field label="" value={customDue} onChangeText={setCustomDue} placeholder="e.g. Aug 29 · 4:00 PM" />
             </View>
          )}
          <View style={{ height: 14 }} />

          <Text style={styles.label}>Repeat</Text>
          <ChipSelect options={recurringOptions} value={recurring} onChange={setRecurring} />
          <View style={{ height: 24 }} />

          <PrimaryButton title={saving ? 'Saving…' : 'Save reminder'} onPress={save} disabled={!canSave || saving} />
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
