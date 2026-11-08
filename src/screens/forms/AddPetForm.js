import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radii, petEmojis, useTheme } from '../../theme/theme';
import { usePets } from '../../data/PetsContext';
import Field from '../../components/Field';
import { PrimaryButton, GhostButton, ChipSelect } from '../../components/Buttons';

export default function AddPetForm({ onClose }) {
  const { addPet } = usePets();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Dog');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [emoji, setEmoji] = useState(petEmojis[0]);
  const [microchip, setMicrochip] = useState('');
  const [insurance, setInsurance] = useState('');
  const [emergencyVet, setEmergencyVet] = useState('');

  const canSave = name.trim().length > 0;
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await addPet({
        name: name.trim(),
        species,
        breed: breed.trim() || '—',
        gender,
        age: age.trim() || '—',
        weight: Number(weight) || 0,
        weightUnit: 'kg',
        emoji,
        microchip: microchip.trim() || undefined,
        insurance: insurance.trim() || undefined,
        emergencyVet: emergencyVet.trim() || undefined,
      });
      onClose();
    } catch (e) {
      console.warn('Failed to save pet', e);
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <GhostButton title="Cancel" onPress={onClose} />
          <Text style={styles.title}>Add a pet</Text>
          <View style={{ width: 56 }} />
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.label}>Avatar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 14 }}>
             {petEmojis.map(e => (
               <Pressable 
                 key={e} 
                 onPress={() => setEmoji(e)} 
                 style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}
               >
                 <Text style={styles.emojiText}>{e}</Text>
               </Pressable>
             ))}
          </ScrollView>

          <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Milo" />

          <Text style={styles.label}>Species</Text>
          <ChipSelect
            options={[{ label: 'Dog', value: 'Dog' }, { label: 'Cat', value: 'Cat' }, { label: 'Other', value: 'Other' }]}
            value={species}
            onChange={setSpecies}
          />
          <View style={{ height: 14 }} />

          <Field label="Breed" value={breed} onChangeText={setBreed} placeholder="e.g. Golden Retriever" />

          <Text style={styles.label}>Gender</Text>
          <ChipSelect
            options={[{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }]}
            value={gender}
            onChange={setGender}
          />
          <View style={{ height: 14 }} />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Field label="Age" value={age} onChangeText={setAge} placeholder="e.g. 1 yr 2 mo" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Weight (kg)" value={weight} onChangeText={setWeight} placeholder="e.g. 12.5" keyboardType="decimal-pad" />
            </View>
          </View>

          <Text style={styles.sectionDivider}>Optional Info</Text>
          
          <Field label="Microchip Number" value={microchip} onChangeText={setMicrochip} placeholder="e.g. 981020000000000" />
          <Field label="Insurance Policy" value={insurance} onChangeText={setInsurance} placeholder="e.g. HealthyPaws #12345" />
          <Field label="Emergency Vet Contact" value={emergencyVet} onChangeText={setEmergencyVet} placeholder="e.g. City Vet 555-0100" />

          <View style={{ height: 10 }} />
          <PrimaryButton title={saving ? 'Saving…' : 'Save pet'} onPress={save} disabled={!canSave || saving} />
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
  sectionDivider: { fontSize: 14, fontWeight: '800', color: colors.primaryDeep, marginTop: 10, marginBottom: 14 },
  emojiBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  emojiBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  emojiText: { fontSize: 24 },
});
