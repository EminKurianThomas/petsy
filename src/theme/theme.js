import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const lightColors = {
  bg: '#F0F4F1',
  bg2: '#E8EFE9',
  paper: '#FFFFFF',
  paper2: '#F7FAF8',
  ink: '#111E1A',
  inkSoft: '#546B62',
  inkMuted: '#8FA89E',
  primary: '#1B5E47',
  primaryDeep: '#0F3D2E',
  primaryLight: '#2D7A5E',
  primaryTint: '#D6EDE3',
  primaryGlow: 'rgba(27,94,71,0.15)',
  accent: '#FF6B35',
  accentDeep: '#D44F1D',
  accentTint: '#FFE8DF',
  gold: '#E8961A',
  goldTint: '#FEF0D6',
  purple: '#7C5CBF',
  purpleTint: '#EDE8F9',
  teal: '#0E9BB5',
  tealTint: '#D6F2F8',
  line: '#D8E4DC',
  lineSubtle: '#EBF1EC',
  danger: '#DC2626',
  dangerTint: '#FEE2E2',
  success: '#16A34A',
  successTint: '#DCFCE7',
  warning: '#D97706',
  warningTint: '#FEF3C7',
  white: '#FFFFFF',
};

export const darkColors = {
  bg: '#0D1714',
  bg2: '#111C18',
  paper: '#172219',
  paper2: '#1D2B22',
  ink: '#E8F2EE',
  inkSoft: '#8BAF9E',
  inkMuted: '#567364',
  primary: '#34C98A',
  primaryDeep: '#27A371',
  primaryLight: '#4DDEA0',
  primaryTint: 'rgba(52,201,138,0.12)',
  primaryGlow: 'rgba(52,201,138,0.2)',
  accent: '#FF7D4F',
  accentDeep: '#FF6030',
  accentTint: 'rgba(255,125,79,0.12)',
  gold: '#F5A623',
  goldTint: 'rgba(245,166,35,0.12)',
  purple: '#A78BFA',
  purpleTint: 'rgba(167,139,250,0.12)',
  teal: '#22D3EE',
  tealTint: 'rgba(34,211,238,0.12)',
  line: '#243028',
  lineSubtle: '#1A2520',
  danger: '#F87171',
  dangerTint: 'rgba(248,113,113,0.12)',
  success: '#4ADE80',
  successTint: 'rgba(74,222,128,0.12)',
  warning: '#FBBF24',
  warningTint: 'rgba(251,191,36,0.12)',
  white: '#FFFFFF',
};

// Fallback for files that haven't been refactored yet, or where hooks can't be used
export const colors = lightColors;

export const radii = {
  xl: 28,
  lg: 20,
  md: 14,
  sm: 10,
  xs: 7,
  pill: 999,
};

export const petPalette = ['#1B5E47', '#FF6B35', '#3B6EA5', '#9B5CBF', '#C9772B', '#2E8B57', '#D44F7A', '#1A8FAA'];
export const petEmojis = ['🐶', '🐱', '🐰', '🐹', '🦜', '🐠', '🐍', '🦎', '🐢', '🐾', '🦮', '🐈', '🐇', '🦙', '🐴', '🦆'];

export const categoryMeta = {
  vaccine: { icon: '💉', label: 'Vaccine', bgKey: 'primaryTint', fgKey: 'primaryDeep' },
  med: { icon: '💊', label: 'Medication', bgKey: 'goldTint', fgKey: 'gold' },
  groom: { icon: '✂️', label: 'Grooming', bgKey: 'accentTint', fgKey: 'accentDeep' },
  vet: { icon: '🩺', label: 'Vet Visit', bgKey: 'primaryTint', fgKey: 'primaryDeep' },
  deworm: { icon: '🪱', label: 'Deworming', bgKey: 'goldTint', fgKey: 'gold' },
  dental: { icon: '🦷', label: 'Dental', bgKey: 'tealTint', fgKey: 'teal' },
  flea: { icon: '🦟', label: 'Flea/Tick', bgKey: 'purpleTint', fgKey: 'purple' },
};

export const recordTypes = [
  { key: 'vaccinations', label: '💉 Vaccines' },
  { key: 'prescriptions', label: '💊 Meds' },
  { key: 'treatments', label: '🩺 Treatments' },
  { key: 'allergies', label: '⚠️ Allergies' },
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('petsy-theme').then((val) => {
      if (val) setThemePreference(val);
      setReady(true);
    });
  }, []);

  const changeTheme = async (newTheme) => {
    setThemePreference(newTheme);
    await AsyncStorage.setItem('petsy-theme', newTheme);
  };

  const isDark = themePreference === 'dark' || (themePreference === 'system' && systemColorScheme === 'dark');
  const activeColors = isDark ? darkColors : lightColors;

  if (!ready) return null;

  return (
    <ThemeContext.Provider value={{ colors: activeColors, isDark, themePreference, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return { colors: lightColors, isDark: false, themePreference: 'light', changeTheme: () => {} };
  }
  return context;
}
