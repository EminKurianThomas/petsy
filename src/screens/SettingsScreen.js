import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radii, useTheme } from '../theme/theme';
import { usePets } from '../data/PetsContext';
import { SectionHead } from '../components/Basics';

export default function SettingsScreen() {
  const { currentUser, logout } = usePets();
  const { colors, isDark, themePreference, changeTheme } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.h1}>Settings</Text>
        </View>

        <SectionHead title="Appearance" />
        <View style={styles.card}>
          <Pressable 
            style={[styles.row, themePreference === 'system' && styles.rowActive]} 
            onPress={() => changeTheme('system')}
          >
            <Text style={styles.rowText}>⚙️ System Default</Text>
            {themePreference === 'system' && <Text style={styles.check}>✓</Text>}
          </Pressable>
          <View style={styles.divider} />
          <Pressable 
            style={[styles.row, themePreference === 'light' && styles.rowActive]} 
            onPress={() => changeTheme('light')}
          >
            <Text style={styles.rowText}>☀️ Light Mode</Text>
            {themePreference === 'light' && <Text style={styles.check}>✓</Text>}
          </Pressable>
          <View style={styles.divider} />
          <Pressable 
            style={[styles.row, themePreference === 'dark' && styles.rowActive]} 
            onPress={() => changeTheme('dark')}
          >
            <Text style={styles.rowText}>🌙 Dark Mode</Text>
            {themePreference === 'dark' && <Text style={styles.check}>✓</Text>}
          </Pressable>
        </View>

        <SectionHead title="Account" />
        <View style={styles.card}>
          <Pressable style={styles.row} onPress={() => Alert.alert('Coming Soon', 'Changing name is not available in the mobile demo yet.')}>
            <Text style={styles.rowText}>Change Display Name</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.row} onPress={() => Alert.alert('Coming Soon', 'Changing password is not available in the mobile demo yet.')}>
            <Text style={styles.rowText}>Change Password</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.logoutBtn}
          onPress={() =>
            Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive', onPress: logout },
            ])
          }
        >
          <Text style={styles.logoutText}>Sign Out of Petsy</Text>
        </Pressable>
        
        <Text style={styles.versionText}>Petsy v2.0.0 (Premium)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 100 },
  header: { paddingBottom: 14 },
  h1: { fontSize: 24, fontWeight: '800', color: colors.primaryDeep, marginTop: 2, letterSpacing: -0.5 },
  card: {
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowActive: {
    backgroundColor: colors.primaryTint,
  },
  rowText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginLeft: 16,
  },
  check: {
    color: colors.primaryDeep,
    fontSize: 16,
    fontWeight: '800',
  },
  chevron: {
    color: colors.inkSoft,
    fontSize: 20,
    lineHeight: 20,
  },
  logoutBtn: {
    marginTop: 10,
    backgroundColor: colors.dangerTint,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 14,
  },
  versionText: {
    textAlign: 'center',
    color: colors.inkMuted,
    fontSize: 12,
    marginTop: 24,
    fontWeight: '500',
  },
});
