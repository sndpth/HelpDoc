import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { Stethoscope, Eye, EyeOff, Lock, User, Settings, Globe, X } from 'lucide-react-native';
import Animated, { FadeIn, ZoomIn, SlideInDown, useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import AnimatedPressable from '../components/AnimatedPressable';
import BottomSheet from '../components/BottomSheet';
import useStore from '../store/useStore';
import { theme } from '../constants/theme';
import ClinicalCanvas from '../components/ClinicalCanvas';

const LoginScreen = () => {
  const { login, register, apiUrl, setApiUrl } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [role, setRole] = useState('DOCTOR'); // 'DOCTOR' | 'NURSE'

  const [showPassword, setShowPassword] = useState(false);
  const [error, setRawError] = useState('');
  const [loading, setLoading] = useState(false);

  const shakeOffset = useSharedValue(0);

  const triggerShake = () => {
    shakeOffset.value = 0;
    shakeOffset.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const setError = (msg) => {
    setRawError(msg);
    if (msg) {
      triggerShake();
    }
  };

  const shakeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeOffset.value }],
    };
  });

  // Server settings state
  const [showSettings, setShowSettings] = useState(false);
  const [inputUrl, setInputUrl] = useState(apiUrl);

  const handleSubmit = async () => {
    if (isRegister) {
      if (!phone || !password || !name) {
        setError('Name, phone, and password are required.');
        return;
      }
      setError('');
      setLoading(true);
      const res = await register({ phone, password, name, specialty, role });
      setLoading(false);
      if (!res.success) {
        setError(res.error);
      }
    } else {
      if (!phone || !password) {
        setError('Phone number and password are required.');
        return;
      }
      setError('');
      setLoading(true);
      const res = await login(phone, password);
      setLoading(false);
      if (!res.success) {
        setError(res.error);
      }
    }
  };

  const handleSaveSettings = () => {
    let cleanUrl = inputUrl.trim();
    
    // Auto-convert Hugging Face space dashboard URL to direct API URL
    const hfSpaceMatch = cleanUrl.match(/https?:\/\/huggingface\.co\/spaces\/([^\/]+)\/([^\/\?#]+)/i);
    if (hfSpaceMatch) {
      const username = hfSpaceMatch[1];
      const spacename = hfSpaceMatch[2];
      cleanUrl = `https://${username}-${spacename}.hf.space`;
    } else if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'http://' + cleanUrl;
    }
    
    setApiUrl(cleanUrl);
    setShowSettings(false);
  };

  return (
    <ClinicalCanvas style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Absolute settings gear button */}
      <View style={styles.headerActions}>
        <AnimatedPressable 
          style={styles.settingsIconBtn} 
          onPress={() => {
            setInputUrl(apiUrl);
            setShowSettings(true);
          }}
          accessibilityLabel="Server connection settings"
          accessibilityRole="button"
        >
          <Settings size={20} color={theme.colors.textSecondary} />
        </AnimatedPressable>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Logo & Header */}
          <View style={styles.logoSection}>
            <Animated.View entering={ZoomIn.duration(500).delay(100)} style={styles.logoRing}>
              <View style={styles.logoInner}>
                <Stethoscope size={36} color={theme.colors.surface} />
              </View>
            </Animated.View>
            <Animated.Text entering={FadeIn.duration(400).delay(300)} style={styles.brandName}>HelpDoc</Animated.Text>
            <Animated.Text entering={FadeIn.duration(400).delay(450)} style={styles.tagline}>Clinical Intelligence & EMR Suite</Animated.Text>
          </View>

          {/* Form Card */}
          <Animated.View entering={SlideInDown.duration(600).springify().damping(15)} style={styles.formCard}>
            <Text style={styles.welcomeText}>{isRegister ? 'Create Account' : 'Welcome'}</Text>
            <Text style={styles.signInText}>
              {isRegister ? 'Register as a new clinical practitioner' : 'Sign in to your practitioner account'}
            </Text>

            {error ? (
              <Animated.View style={shakeStyle}>
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            ) : null}

            {/* Registration Fields */}
            {isRegister && (
              <>
                {/* Full Name Input */}
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconBox}>
                    <User size={18} color={theme.colors.primary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* Specialty Input */}
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconBox}>
                    <Stethoscope size={18} color={theme.colors.primary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Specialty (e.g. Pediatrics)"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={specialty}
                    onChangeText={setSpecialty}
                  />
                </View>

                {/* Role Toggle Selector */}
                <Text style={styles.roleLabel}>
                  Practitioner Role
                </Text>
                <View style={styles.roleToggleRow}>
                  <AnimatedPressable 
                    style={[
                      styles.roleButton, 
                      role === 'DOCTOR' ? styles.roleButtonActive : styles.roleButtonInactive
                    ]}
                    onPress={() => setRole('DOCTOR')}
                  >
                    <Text style={[
                      styles.roleButtonText, 
                      role === 'DOCTOR' ? styles.roleButtonTextActive : styles.roleButtonTextInactive
                    ]}>
                      Doctor
                    </Text>
                  </AnimatedPressable>
                  <AnimatedPressable 
                    style={[
                      styles.roleButton, 
                      role === 'NURSE' ? styles.roleButtonActive : styles.roleButtonInactive
                    ]}
                    onPress={() => setRole('NURSE')}
                  >
                    <Text style={[
                      styles.roleButtonText, 
                      role === 'NURSE' ? styles.roleButtonTextActive : styles.roleButtonTextInactive
                    ]}>
                      Nurse
                    </Text>
                  </AnimatedPressable>
                </View>
              </>
            )}

            {/* Phone Number Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBox}>
                <User size={18} color={theme.colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={theme.colors.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBox}>
                <Lock size={18} color={theme.colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeBtn} 
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Toggle password visibility"
                accessibilityRole="button"
              >
                {showPassword ? (
                  <EyeOff size={18} color={theme.colors.textSecondary} />
                ) : (
                  <Eye size={18} color={theme.colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <AnimatedPressable 
              style={[styles.loginBtn, loading && { backgroundColor: theme.colors.textSecondary }]} 
              onPress={handleSubmit} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.loginBtnText}>{isRegister ? 'Register' : 'Login'}</Text>
              )}
            </AnimatedPressable>

            {/* Screen Toggle Button */}
            <AnimatedPressable style={styles.forgotBtn} onPress={() => { setIsRegister(!isRegister); setError(''); }}>
              <Text style={styles.forgotBtnText}>
                {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
              </Text>
            </AnimatedPressable>
          </Animated.View>

          {/* Info Section */}
          <View style={styles.helperSection}>
            <Text style={styles.helperTitle}>Server Sync Active</Text>
            <Text style={styles.helperText}>
              Target: <Text style={styles.boldText}>{apiUrl || 'Not Configured'}</Text>
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Settings Modal */}
      <BottomSheet
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        title="Server Connection Settings"
        height="50%"
      >
        <View style={styles.modalBody}>
          <Text style={styles.fieldLabel}>Server Base URL</Text>
          <View style={styles.settingsInputWrapper}>
            <View style={styles.inputIconBox}>
              <Globe size={18} color={theme.colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g. http://192.168.1.15:3000"
              placeholderTextColor={theme.colors.textSecondary}
              value={inputUrl}
              onChangeText={setInputUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Text style={styles.infoNote}>
            Enter the IP address of the computer running your backend server (e.g. <Text style={{ fontWeight: '700' }}>http://192.168.1.X:3000</Text>).
          </Text>
          
          <View style={styles.modalBtnRow}>
            <AnimatedPressable 
              style={styles.modalCancelBtn} 
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </AnimatedPressable>
            <AnimatedPressable 
              style={styles.modalSaveBtn} 
              onPress={handleSaveSettings}
            >
              <Text style={styles.modalSaveBtnText}>Save Settings</Text>
            </AnimatedPressable>
          </View>
        </View>
      </BottomSheet>
    </ClinicalCanvas>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  headerActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 100,
  },
  settingsIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 60,
    paddingBottom: theme.spacing.xxl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  logoInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    ...theme.typography.h1,
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
    letterSpacing: 0.5,
  },
  tagline: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#004080',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 5,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontFamily: theme.typography.fontFamily,
  },
  roleToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: theme.spacing.md,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
  },
  roleButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  roleButtonInactive: {
    backgroundColor: theme.colors.surfaceDim,
    borderColor: theme.colors.border,
  },
  roleButtonText: {
    fontWeight: '700',
    fontSize: 13,
    fontFamily: theme.typography.fontFamily,
  },
  roleButtonTextActive: {
    color: '#FFF',
  },
  roleButtonTextInactive: {
    color: theme.colors.textSecondary,
  },
  welcomeText: {
    ...theme.typography.h1,
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  signInText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    height: 52,
  },
  settingsInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    height: 52,
  },
  inputIconBox: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: theme.typography.fontFamily,
  },
  eyeBtn: {
    padding: theme.spacing.xs,
  },
  loginBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  loginBtnText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: theme.typography.fontFamily,
  },
  forgotBtn: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  forgotBtnText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily,
  },
  helperSection: {
    backgroundColor: theme.colors.surfaceDim,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  helperTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontFamily: theme.typography.fontFamily,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
  },
  boldText: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xxl,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  infoNote: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: 2,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: theme.spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily,
  },
  modalSaveBtn: {
    flex: 1,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtnText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: theme.typography.fontFamily,
  },
});

export default LoginScreen;
