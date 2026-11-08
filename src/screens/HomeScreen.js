import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { radii, useTheme } from '../theme/theme';
import { usePets } from '../data/PetsContext';
import PetSwitcher from '../components/PetSwitcher';
import { Card, SectionHead, Eyebrow, EmptyState } from '../components/Basics';
import ReminderItem from '../components/ReminderItem';
import MinimalLogo from '../components/MinimalLogo';
import AddPetForm from './forms/AddPetForm';
import LogWeightForm from './forms/LogWeightForm';
import {
  VACCINATIONS_DATA,
  FOOD_RECIPES_DATA,
  SAFE_AND_TOXIC_FOODS,
  EXERCISE_PLANS,
  getWeightEvaluation,
} from '../data/petCareData';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen({ navigation }) {
  const { pets, activePetId, setActivePetId, reminders, currentUser, records } = usePets();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const [addPetOpen, setAddPetOpen] = useState(false);
  const [logWeightOpen, setLogWeightOpen] = useState(false);
  const [vaccineModalOpen, setVaccineModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const greeting = getGreeting();

  const pet = pets.find((p) => p.id === activePetId) || pets[0];
  const isCat = pet ? (pet.species || '').toLowerCase().includes('cat') : false;
  const speciesKey = isCat ? 'Cat' : 'Dog';

  // Species-specific data
  const vaccines = VACCINATIONS_DATA[speciesKey] || VACCINATIONS_DATA.Dog;
  const recipes = FOOD_RECIPES_DATA[speciesKey] || FOOD_RECIPES_DATA.Dog;
  const foodSafety = SAFE_AND_TOXIC_FOODS[speciesKey] || SAFE_AND_TOXIC_FOODS.Dog;
  const exercisePlan = EXERCISE_PLANS[speciesKey] || EXERCISE_PLANS.Dog;

  // Weight evaluation
  const weightEval = useMemo(() => {
    if (!pet) return null;
    return getWeightEvaluation(pet.species, pet.breed, pet.weight, pet.weightUnit || 'kg');
  }, [pet]);

  const todays = reminders.filter((r) => r.petId === (pet && pet.id)).slice(0, 3);
  
  // Calculate overdue reminders
  const overdueCount = reminders.filter(r => r.petId === (pet && pet.id) && r.status === 'overdue').length;
  // Calculate recent activity
  const recentRecords = records.filter(r => r.petId === (pet && pet.id)).slice(0, 2);

  // If no pets, prompt user to add their first pet
  useEffect(() => {
    if (pets.length === 0) {
      const timer = setTimeout(() => setAddPetOpen(true), 400);
      return () => clearTimeout(timer);
    }
  }, [pets.length]);

  if (!pet) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.welcomeContainer}>
          <MinimalLogo size={76} color={colors.primary} />
          <Text style={styles.welcomeTitle}>
            Welcome, {currentUser?.name || 'Pet Parent'}!
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Let's add your first furry companion to get customized vaccinations, healthy food recipes, exercises, and weight tracking!
          </Text>

          <Pressable
            style={({ pressed }) => [styles.addFirstBtn, pressed && { opacity: 0.85 }]}
            onPress={() => setAddPetOpen(true)}
          >
            <Text style={styles.addFirstBtnText}>+ Add Your First Pet</Text>
          </Pressable>
        </View>

        <Modal
          visible={addPetOpen}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setAddPetOpen(false)}
        >
          <AddPetForm onClose={() => setAddPetOpen(false)} />
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Header with Minimal Logo */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <MinimalLogo size={36} color={colors.primary} />
            <View>
              <Eyebrow style={{ color: colors.primary }}>
                {greeting}{currentUser?.name ? `, ${currentUser.name}` : ''}
              </Eyebrow>
              <Text style={styles.h1}>Petsy</Text>
            </View>
          </View>
          <Pressable style={styles.bell} onPress={() => navigation.navigate('Reminders')}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.primaryDeep} strokeWidth={2} strokeLinecap="round">
              <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </Svg>
            {overdueCount > 0 && <View style={styles.badge} />}
          </Pressable>
        </View>

        {/* Pet Switcher */}
        <PetSwitcher pets={pets} activePetId={pet.id} onSelect={setActivePetId} onAdd={() => setAddPetOpen(true)} />

        {/* Quick Actions Strip */}
        <View style={styles.quickActionsRow}>
          <Pressable style={styles.quickActionBtn} onPress={() => setLogWeightOpen(true)}>
             <Text style={styles.quickActionIcon}>⚖️</Text>
             <Text style={styles.quickActionText}>Weight</Text>
          </Pressable>
          <Pressable style={styles.quickActionBtn} onPress={() => navigation.navigate('Reminders')}>
             <Text style={styles.quickActionIcon}>📅</Text>
             <Text style={styles.quickActionText}>Remind</Text>
          </Pressable>
          <Pressable style={styles.quickActionBtn} onPress={() => navigation.navigate('Records')}>
             <Text style={styles.quickActionIcon}>📁</Text>
             <Text style={styles.quickActionText}>Record</Text>
          </Pressable>
        </View>

        {/* Smart Weight & Health Condition Card */}
        {weightEval && (
          <Pressable onPress={() => setLogWeightOpen(true)} style={styles.healthBanner}>
            <View style={styles.healthBannerHead}>
              <View>
                <Text style={styles.healthBannerTitle}>Weight Condition</Text>
                <Text style={styles.healthBannerWeight}>
                  {pet.weight} {pet.weightUnit || 'kg'} · {pet.breed || pet.species}
                </Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: weightEval.badgeColor }]}>
                <Text style={styles.statusPillText}>{weightEval.statusLabel}</Text>
              </View>
            </View>
            <Text style={styles.healthBannerSummary}>{weightEval.summaryText}</Text>
          </Pressable>
        )}

        {/* Quick Stats */}
        <View style={styles.statRow}>
          <View style={[styles.statCard, { backgroundColor: colors.primaryDeep }]}>
            <Eyebrow style={{ color: 'rgba(255,255,255,0.65)' }}>Next Vet</Eyebrow>
            <Text style={styles.statValue}>{pet.nextVet || '—'}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: overdueCount > 0 ? colors.danger : colors.success }]}>
            <Eyebrow style={{ color: 'rgba(255,255,255,0.85)' }}>Overdue Tasks</Eyebrow>
            <Text style={styles.statValue}>{overdueCount}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.accent }]}>
            <Eyebrow style={{ color: 'rgba(255,255,255,0.65)' }}>Recent Records</Eyebrow>
            <Text style={styles.statValue}>{recentRecords.length}</Text>
          </View>
        </View>

        {/* Today's Care Reminders */}
        <SectionHead title="Today's Care Tasks" action="See All" onAction={() => navigation.navigate('Reminders')} />
        <Card style={{ paddingHorizontal: 12, paddingVertical: 4 }}>
          {todays.length ? (
            todays.map((r) => <ReminderItem key={r.id} item={r} onPress={() => navigation.navigate('Reminders')} />)
          ) : (
            <EmptyState message="All caught up for today! Add a care reminder anytime." />
          )}
        </Card>

        {/* Healthy Food & Illustrated Recipes */}
        <SectionHead title={`Nutritious ${speciesKey} Recipes`} action="See All" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recipesScroll}
        >
          {recipes.map((r) => (
            <Pressable
              key={r.id}
              style={({ pressed }) => [styles.recipeCard, pressed && { opacity: 0.9 }]}
              onPress={() => setSelectedRecipe(r)}
            >
              <Image source={{ uri: r.image }} style={styles.recipeImg} resizeMode="cover" />
              <View style={styles.recipeTag}>
                <Text style={styles.recipeTagText}>{r.tag}</Text>
              </View>
              <View style={styles.recipeCardBody}>
                <Text style={styles.recipeTitle} numberOfLines={2}>{r.title}</Text>
                <View style={styles.recipeMeta}>
                  <Text style={styles.recipeMetaText}>⏱️ {r.prepTime}</Text>
                  <Text style={styles.recipeMetaText}>⚡ {r.calories}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>

      {/* Modals remain structurally similar but will use dynamic styles */}
      {/* Add Pet Modal */}
      <Modal visible={addPetOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAddPetOpen(false)}>
        <AddPetForm onClose={() => setAddPetOpen(false)} />
      </Modal>

      {/* Log Weight Modal */}
      <Modal visible={logWeightOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setLogWeightOpen(false)}>
        {pet ? <LogWeightForm onClose={() => setLogWeightOpen(false)} petId={pet.id} /> : null}
      </Modal>

      {/* Recipe Detail Modal */}
      <Modal visible={!!selectedRecipe} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedRecipe(null)}>
        {selectedRecipe && (
          <SafeAreaView style={styles.modalSafe}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setSelectedRecipe(null)}>
                <Text style={styles.modalCloseText}>Done</Text>
              </Pressable>
              <Text style={styles.modalTitle}>Recipe Details</Text>
              <View style={{ width: 44 }} />
            </View>
            <ScrollView contentContainerStyle={styles.modalBody}>
              <Image source={{ uri: selectedRecipe.image }} style={styles.recipeDetailImg} resizeMode="cover" />
              <Text style={styles.recipeDetailTitle}>{selectedRecipe.title}</Text>
              <Text style={styles.recipeDetailTag}>{selectedRecipe.tag} · Prep time: {selectedRecipe.prepTime}</Text>

              <View style={styles.benefitBox}>
                <Text style={styles.benefitBoxTitle}>🌟 Health Benefits</Text>
                <Text style={styles.benefitBoxText}>{selectedRecipe.benefits}</Text>
              </View>

              <Text style={styles.recipeSectionTitle}>Ingredients</Text>
              {selectedRecipe.ingredients.map((ing, i) => (
                <Text key={i} style={styles.ingredientItem}>✓ {ing}</Text>
              ))}

              <Text style={[styles.recipeSectionTitle, { marginTop: 18 }]}>Preparation Instructions</Text>
              <Text style={styles.instructionText}>{selectedRecipe.instructions}</Text>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingBottom: 60, paddingTop: 6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14 },
  h1: { fontSize: 24, fontWeight: '800', color: colors.primaryDeep, letterSpacing: -0.5 },
  bell: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 8, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  quickActionsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  quickActionBtn: { flex: 1, backgroundColor: colors.paper, paddingVertical: 12, borderRadius: radii.md, alignItems: 'center', borderWidth: 1, borderColor: colors.line },
  quickActionIcon: { fontSize: 20, marginBottom: 4 },
  quickActionText: { fontSize: 12, fontWeight: '700', color: colors.inkSoft },
  healthBanner: {
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: colors.primaryTint,
  },
  healthBannerHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  healthBannerTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  healthBannerWeight: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  statusPillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  healthBannerSummary: {
    fontSize: 12.5,
    color: colors.ink,
    lineHeight: 18,
  },
  statRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: radii.md, padding: 12 },
  statValue: { color: '#fff', fontWeight: '700', fontSize: 18, marginTop: 4 },
  recipesScroll: { paddingVertical: 4, gap: 14, marginBottom: 20 },
  recipeCard: {
    width: 220,
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
  },
  recipeImg: { width: '100%', height: 120 },
  recipeTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(21,38,33,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  recipeTagText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  recipeCardBody: { padding: 12 },
  recipeTitle: { fontSize: 13.5, fontWeight: '700', color: colors.ink, marginBottom: 6 },
  recipeMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  recipeMetaText: { fontSize: 11, color: colors.inkSoft },
  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primaryDeep,
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  addFirstBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 15,
    borderRadius: radii.sm,
  },
  addFirstBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalSafe: { flex: 1, backgroundColor: colors.paper },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  modalCloseText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: colors.primaryDeep },
  modalBody: { padding: 20, paddingBottom: 60 },
  recipeDetailImg: { width: '100%', height: 200, borderRadius: radii.md, marginBottom: 14 },
  recipeDetailTitle: { fontSize: 20, fontWeight: '800', color: colors.primaryDeep, marginBottom: 4 },
  recipeDetailTag: { fontSize: 12, color: colors.accent, fontWeight: '700', marginBottom: 14 },
  benefitBox: {
    backgroundColor: colors.primaryTint,
    borderRadius: radii.sm,
    padding: 12,
    marginBottom: 16,
  },
  benefitBoxTitle: { fontSize: 12, fontWeight: '800', color: colors.primaryDeep, marginBottom: 3 },
  benefitBoxText: { fontSize: 12, color: colors.primaryDeep, lineHeight: 17 },
  recipeSectionTitle: { fontSize: 15, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  ingredientItem: { fontSize: 13, color: colors.ink, marginBottom: 4, lineHeight: 18 },
  instructionText: { fontSize: 13, color: colors.inkSoft, lineHeight: 19 },
});
