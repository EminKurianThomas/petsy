import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radii, useTheme } from '../theme/theme';
import { usePets } from '../data/PetsContext';
import { SectionHead, EmptyState } from '../components/Basics';
import GrowthChart from '../components/GrowthChart';
import PetSwitcher from '../components/PetSwitcher';
import AddPetForm from './forms/AddPetForm';
import LogWeightForm from './forms/LogWeightForm';
import { getWeightEvaluation } from '../data/petCareData';

export default function ProfileScreen() {
  const { pets, activePetId, setActivePetId, deletePet, currentUser, logout } = usePets();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const [addPetOpen, setAddPetOpen] = useState(false);
  const [logWeightOpen, setLogWeightOpen] = useState(false);
  const [dangerZoneOpen, setDangerZoneOpen] = useState(false);

  const pet = pets.find((p) => p.id === activePetId) || pets[0];

  const evaluation = useMemo(() => {
    if (!pet) return null;
    return getWeightEvaluation(pet.species, pet.breed, pet.weight, pet.weightUnit || 'kg');
  }, [pet]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* User Account Bar */}
        {currentUser && (
          <View style={styles.userBar}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {(currentUser.name || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{currentUser.name || 'Pet Parent'}</Text>
              <Text style={styles.userEmail}>{currentUser.email}</Text>
            </View>
          </View>
        )}

        <PetSwitcher pets={pets} activePetId={pet && pet.id} onSelect={setActivePetId} onAdd={() => setAddPetOpen(true)} />

        {pet ? (
          <>
            <View style={styles.hero}>
              <View style={[styles.avatarLg, { backgroundColor: pet.color }]}>
                <Text style={styles.avatarLgText}>{pet.emoji || pet.name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.name}>{pet.name}</Text>
              <Text style={styles.sub}>{pet.breed} · {pet.species}</Text>
            </View>

            <View style={styles.grid}>
              <InfoCell label="Age" value={pet.age} colors={colors} styles={styles} />
              <InfoCell label="Gender" value={pet.gender} colors={colors} styles={styles} />
              <InfoCell
                label="Weight & Condition"
                value={`${pet.weight} ${pet.weightUnit || 'kg'}`}
                badge={evaluation ? evaluation.statusLabel.split('(')[0].trim() : null}
                badgeColor={evaluation?.badgeColor}
                colors={colors}
                styles={styles}
              />
              <InfoCell label="Species" value={pet.species} colors={colors} styles={styles} />
            </View>

            {/* Expanded Info */}
            {(pet.microchip || pet.insurance || pet.emergencyVet) && (
               <>
                 <SectionHead title="Additional Information" />
                 <View style={styles.expandedInfoCard}>
                   {pet.microchip && <Text style={styles.expandedInfoText}><Text style={styles.expandedInfoLabel}>Microchip: </Text>{pet.microchip}</Text>}
                   {pet.insurance && <Text style={styles.expandedInfoText}><Text style={styles.expandedInfoLabel}>Insurance: </Text>{pet.insurance}</Text>}
                   {pet.emergencyVet && <Text style={styles.expandedInfoText}><Text style={styles.expandedInfoLabel}>Emergency Vet: </Text>{pet.emergencyVet}</Text>}
                 </View>
               </>
            )}

            {/* Growth Tracking & Smart Analysis */}
            <SectionHead title="Growth tracking & Ideal Weight" action="Log weight" onAction={() => setLogWeightOpen(true)} />
            <Pressable onPress={() => setLogWeightOpen(true)}>
              <View style={styles.card}>
                <GrowthChart
                  data={pet.weightHistory}
                  color={pet.color}
                  unit={pet.weightUnit || 'kg'}
                  idealMin={evaluation?.idealMin}
                  idealMax={evaluation?.idealMax}
                  evaluation={evaluation}
                />
              </View>
            </Pressable>

            {/* Condition-Based Health Plan */}
            {evaluation && (
              <View style={styles.conditionSummaryBox}>
                <Text style={styles.conditionSummaryHead}>⚖️ Condition Assessment</Text>
                <Text style={styles.conditionSummaryText}>{evaluation.summaryText}</Text>
              </View>
            )}

            <SectionHead title="Tailored Diet & Activity Plans" />
            <View style={[styles.guideCard, { backgroundColor: colors.goldTint }]}>
              <View style={styles.guideIcon}><Text style={{ fontSize: 16 }}>🥣</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guideTitle}>{pet.food?.title || 'Daily Nutrition Plan'}</Text>
                <Text style={styles.guideDesc}>{pet.food?.desc || evaluation?.dietSuggestion}</Text>
              </View>
            </View>
            <View style={[styles.guideCard, { backgroundColor: colors.accentTint }]}>
              <View style={styles.guideIcon}><Text style={{ fontSize: 16 }}>🏃</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guideTitle}>{pet.exercise?.title || 'Daily Activity Plan'}</Text>
                <Text style={styles.guideDesc}>{pet.exercise?.desc || evaluation?.exerciseSuggestion}</Text>
              </View>
            </View>

            {/* Danger Zone */}
            <Pressable style={styles.dangerZoneHeader} onPress={() => setDangerZoneOpen(!dangerZoneOpen)}>
              <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
              <Text style={styles.dangerZoneIcon}>{dangerZoneOpen ? '▲' : '▼'}</Text>
            </Pressable>
            
            {dangerZoneOpen && (
              <View style={styles.dangerZoneContent}>
                <Text style={styles.dangerZoneDesc}>Once you delete a pet, there is no going back. Please be certain.</Text>
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() =>
                    Alert.alert('Remove pet', `Delete ${pet.name}'s profile and all related records?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => deletePet(pet.id) },
                    ])
                  }
                >
                  <Text style={styles.deleteText}>Delete {pet.name}'s Profile</Text>
                </Pressable>
              </View>
            )}
          </>
        ) : (
          <EmptyState message="Add a pet to see their profile here." />
        )}
      </ScrollView>

      <Modal visible={addPetOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAddPetOpen(false)}>
        <AddPetForm onClose={() => setAddPetOpen(false)} />
      </Modal>
      <Modal visible={logWeightOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setLogWeightOpen(false)}>
        {pet ? <LogWeightForm onClose={() => setLogWeightOpen(false)} petId={pet.id} /> : null}
      </Modal>
    </SafeAreaView>
  );
}

function InfoCell({ label, value, badge, badgeColor, colors, styles }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={styles.cellValue}>{value}</Text>
      {badge && (
        <View style={[styles.cellBadge, { backgroundColor: badgeColor || colors.primary }]}>
          <Text style={styles.cellBadgeText}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 60 },
  userBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.paper,
    padding: 12,
    borderRadius: radii.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  userAvatarText: {
    color: colors.primaryDeep,
    fontWeight: '700',
    fontSize: 16,
  },
  userName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.ink,
  },
  userEmail: {
    fontSize: 11.5,
    color: colors.inkSoft,
  },
  hero: { alignItems: 'center', paddingTop: 8, paddingBottom: 4 },
  avatarLg: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarLgText: { color: '#fff', fontWeight: '700', fontSize: 36 },
  name: { fontSize: 22, fontWeight: '800', color: colors.primaryDeep },
  sub: { fontSize: 13, color: colors.inkSoft, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 18 },
  cell: { width: '47.5%', backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: radii.sm, padding: 12 },
  cellLabel: { fontSize: 10, color: colors.inkSoft, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cellValue: { fontWeight: '700', fontSize: 14.5, color: colors.ink, marginTop: 4 },
  cellBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  cellBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  card: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: radii.md, padding: 16 },
  conditionSummaryBox: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    padding: 12,
    marginTop: 10,
  },
  conditionSummaryHead: { fontSize: 12, fontWeight: '800', color: colors.primaryDeep, marginBottom: 4 },
  conditionSummaryText: { fontSize: 12, color: colors.inkSoft, lineHeight: 17 },
  guideCard: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 14, borderRadius: radii.md, marginTop: 12 },
  guideIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  guideTitle: { fontWeight: '700', fontSize: 13.5, color: colors.ink },
  guideDesc: { fontSize: 12, color: colors.inkSoft, marginTop: 3, lineHeight: 17 },
  expandedInfoCard: { backgroundColor: colors.paper, padding: 14, borderRadius: radii.md, borderWidth: 1, borderColor: colors.line, marginTop: 8, marginBottom: 16 },
  expandedInfoText: { fontSize: 13, color: colors.ink, marginBottom: 6 },
  expandedInfoLabel: { fontWeight: '700', color: colors.inkSoft },
  dangerZoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.line },
  dangerZoneTitle: { color: colors.danger, fontWeight: '800', fontSize: 15 },
  dangerZoneIcon: { color: colors.danger, fontSize: 12 },
  dangerZoneContent: { backgroundColor: colors.dangerTint, padding: 16, borderRadius: radii.md, marginTop: 8 },
  dangerZoneDesc: { color: colors.danger, fontSize: 12, marginBottom: 12, fontWeight: '500' },
  deleteBtn: { backgroundColor: colors.danger, paddingVertical: 12, borderRadius: radii.sm, alignItems: 'center' },
  deleteText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
