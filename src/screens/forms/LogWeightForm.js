import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radii, useTheme } from '../../theme/theme';
import { usePets } from '../../data/PetsContext';
import Field from '../../components/Field';
import { PrimaryButton, GhostButton } from '../../components/Buttons';
import { getWeightEvaluation } from '../../data/petCareData';
import GrowthChart from '../../components/GrowthChart';

export default function LogWeightForm({ onClose, petId }) {
  const { updatePet, pets } = usePets();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const pet = pets.find((p) => p.id === petId);
  const [weight, setWeight] = useState(pet ? String(pet.weight || '') : '');

  const numWeight = parseFloat(weight);
  const canSave = !isNaN(numWeight) && numWeight > 0;

  // Live evaluation based on typed weight
  const evaluation = useMemo(() => {
    if (!pet || !canSave) return null;
    return getWeightEvaluation(pet.species, pet.breed, numWeight, pet.weightUnit || 'kg');
  }, [pet, numWeight, canSave]);

  // Preview chart data with new point added
  const previewData = useMemo(() => {
    if (!pet) return [];
    const history = [...(pet.weightHistory || [])];
    if (canSave) history.push(numWeight);
    return history;
  }, [pet, numWeight, canSave]);

  function save() {
    if (!canSave || !pet) return;

    // Update pet with new weight, and automatically update food & exercise tips based on condition!
    const patch = {
      weight: numWeight,
    };

    if (evaluation) {
      patch.food = {
        title: evaluation.status === 'overweight' ? 'Portion Control Plan' : evaluation.status === 'underweight' ? 'High-Calorie Boost Plan' : pet.food?.title || 'Balanced Daily Diet',
        desc: evaluation.dietSuggestion,
      };
      patch.exercise = {
        title: evaluation.status === 'overweight' ? 'Low-Impact Joint Friendly Workout' : evaluation.status === 'underweight' ? 'Gentle Muscle Toning' : pet.exercise?.title || 'Daily Active Routine',
        desc: evaluation.exerciseSuggestion,
      };
    }

    updatePet(petId, patch);
    onClose();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <GhostButton title="Cancel" onPress={onClose} />
          <Text style={styles.title}>Log Weight & Health Check</Text>
          <View style={{ width: 56 }} />
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.hint}>
            {pet ? `${pet.name}'s breed is ${pet.breed} (${pet.species}).` : ''} Entering a new weight analyzes whether they are in their healthy weight range.
          </Text>

          <Field
            label={`Weight (${pet?.weightUnit || 'kg'})`}
            value={weight}
            onChangeText={setWeight}
            placeholder="e.g. 28.5"
            keyboardType="decimal-pad"
          />

          {/* Live Weight Analysis Card */}
          {evaluation && (
            <View style={styles.analysisCard}>
              <View style={styles.analysisHeader}>
                <Text style={styles.analysisTitle}>Condition Analysis</Text>
                <View style={[styles.statusBadge, { backgroundColor: evaluation.badgeColor }]}>
                  <Text style={styles.statusBadgeText}>{evaluation.statusLabel}</Text>
                </View>
              </View>

              <Text style={styles.summaryText}>{evaluation.summaryText}</Text>

              {/* Dynamic Suggestions */}
              <View style={styles.suggestionBlock}>
                <View style={styles.suggestionHead}>
                  <Text style={styles.suggestionIcon}>🥣</Text>
                  <Text style={styles.suggestionTitle}>Suggested Food Plan</Text>
                </View>
                <Text style={styles.suggestionDesc}>{evaluation.dietSuggestion}</Text>
              </View>

              <View style={styles.suggestionBlock}>
                <View style={styles.suggestionHead}>
                  <Text style={styles.suggestionIcon}>🏃</Text>
                  <Text style={styles.suggestionTitle}>Suggested Exercise</Text>
                </View>
                <Text style={styles.suggestionDesc}>{evaluation.exerciseSuggestion}</Text>
              </View>

              {/* Mini preview graph */}
              <View style={styles.chartPreview}>
                <Text style={styles.chartPreviewTitle}>Updated Weight Trend</Text>
                <GrowthChart
                  data={previewData}
                  color={pet?.color || colors.primary}
                  unit={pet?.weightUnit || 'kg'}
                  idealMin={evaluation.idealMin}
                  idealMax={evaluation.idealMax}
                />
              </View>
            </View>
          )}

          <PrimaryButton title="Save Weight & Apply Suggestions" onPress={save} disabled={!canSave} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  title: { fontWeight: '700', fontSize: 15, color: colors.primaryDeep },
  body: { padding: 20, paddingBottom: 60 },
  hint: { fontSize: 13, color: colors.inkSoft, marginBottom: 16, lineHeight: 18 },
  analysisCard: {
    backgroundColor: colors.bg,
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  summaryText: {
    fontSize: 12.5,
    color: colors.ink,
    lineHeight: 18,
    marginBottom: 14,
  },
  suggestionBlock: {
    backgroundColor: colors.paper,
    borderRadius: radii.sm,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  suggestionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  suggestionIcon: { fontSize: 15, marginRight: 6 },
  suggestionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
  suggestionDesc: {
    fontSize: 12,
    color: colors.inkSoft,
    lineHeight: 17,
  },
  chartPreview: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  chartPreviewTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkSoft,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
});
