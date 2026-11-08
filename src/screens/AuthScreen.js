import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radii, useTheme } from '../theme/theme';
import { usePets } from '../data/PetsContext';
import MinimalLogo from '../components/MinimalLogo';

export default function AuthScreen() {
  const { login, register } = usePets();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Simple validation helpers
  const isValidEmail = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length > 5) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    return score; // 0, 1, 2, 3
  };
  
  const strength = getPasswordStrength();
  const getStrengthColor = () => {
    if (strength === 0) return colors.line;
    if (strength === 1) return colors.danger;
    if (strength === 2) return colors.warning;
    return colors.success;
  };

  async function handleSubmit() {
    setError('');
    
    if (!isValidEmail) {
      setError('Please enter a valid email address');
      return;
    }

    if (tab === 'register') {
      if (!name.trim()) {
        setError('Please enter your name');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    } else {
      if (!password.trim()) {
        setError('Password is required');
        return;
      }
    }

    setLoading(true);
    try {
      if (tab === 'login') {
        const res = await login(email.trim(), password);
        if (!res.success) setError(res.error || 'Login failed');
      } else {
        const res = await register(name.trim(), email.trim(), password);
        if (!res.success) setError(res.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }


  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Header with Minimalist Mark */}
          <View style={styles.brand}>
            <MinimalLogo size={68} color={colors.primary} />
            <Text style={styles.brandName}>Petsy</Text>
            <Text style={styles.brandTag}>Premium Pet Care</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Tabs */}
            <View style={styles.tabs}>
              <Pressable
                onPress={() => { setTab('login'); setError(''); }}
                style={[styles.tab, tab === 'login' && styles.tabActive]}
              >
                <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>
                  Sign In
                </Text>
              </Pressable>
              <Pressable
                onPress={() => { setTab('register'); setError(''); }}
                style={[styles.tab, tab === 'register' && styles.tabActive]}
              >
                <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>
                  Create Account
                </Text>
              </Pressable>
            </View>

            {/* Error banner */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            {/* Name Field (Register only) */}
            {tab === 'register' && (
              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Alex Johnson"
                  placeholderTextColor={colors.inkSoft}
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>
            )}

            {/* Email Field */}
            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.inkSoft}
                style={[styles.input, email && !isValidEmail && styles.inputError]}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Field */}
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={tab === 'register' ? 'Min. 6 characters' : 'Your password'}
                placeholderTextColor={colors.inkSoft}
                secureTextEntry
                style={styles.input}
                autoCapitalize="none"
              />
              {tab === 'register' && password.length > 0 && (
                <View style={styles.strengthMeter}>
                  <View style={[styles.strengthBar, strength > 0 && { backgroundColor: getStrengthColor() }]} />
                  <View style={[styles.strengthBar, strength > 1 && { backgroundColor: getStrengthColor() }]} />
                  <View style={[styles.strengthBar, strength > 2 && { backgroundColor: getStrengthColor() }]} />
                </View>
              )}
            </View>

            {/* Confirm Password Field (Register only) */}
            {tab === 'register' && (
              <View style={styles.field}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repeat your password"
                  placeholderTextColor={colors.inkSoft}
                  secureTextEntry
                  style={styles.input}
                  autoCapitalize="none"
                />
              </View>
            )}

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && { opacity: 0.85 },
                loading && { opacity: 0.6 },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </Pressable>


          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 36,
    paddingBottom: 40,
    alignItems: 'center',
  },
  brand: { alignItems: 'center', marginBottom: 28 },
  brandName: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.primaryDeep,
    letterSpacing: -0.5,
    marginTop: 10,
  },
  brandTag: {
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    width: '100%',
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: radii.sm,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radii.sm - 2,
  },
  tabActive: {
    backgroundColor: colors.paper,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.inkSoft,
  },
  tabTextActive: {
    color: colors.primaryDeep,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: colors.dangerTint,
    padding: 10,
    borderRadius: radii.sm,
    marginBottom: 14,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12.5,
    fontWeight: '600',
  },
  field: { marginBottom: 14 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkSoft,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14.5,
    color: colors.ink,
    backgroundColor: colors.paper,
  },
  inputError: {
    borderColor: colors.danger,
  },
  strengthMeter: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

});
