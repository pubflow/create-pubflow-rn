import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useAuth } from '@pubflow/react-native';
import type { TwoFactorMethod } from '@pubflow/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import AppLogo from '@/components/ui/AppLogo';

type LoginStep = 'credentials' | 'otp';

export default function LoginScreen() {
  const auth = useAuth() as any;
  const { login, verifyTwoFactor, startTwoFactor, isAuthenticated } = auth;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [pendingMethods, setPendingMethods] = useState<TwoFactorMethod[]>([]);
  const [activeMethodId, setActiveMethodId] = useState('');
  const [activeMethodName, setActiveMethodName] = useState('email');
  const [step, setStep] = useState<LoginStep>('credentials');
  const [error, setError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const registrationEnabled = process.env.EXPO_PUBLIC_REGISTRATION === 'true';
  const businessName = process.env.EXPO_PUBLIC_BUSINESS_NAME || 'Pubflow';
  const mainColor = process.env.EXPO_PUBLIC_MAIN_COLOR || '#006aff';

  const selectedMethod = useMemo(
    () => pendingMethods.find((method) => method.id === activeMethodId),
    [activeMethodId, pendingMethods]
  );

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const goToApp = () => {
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 100);
  };

  const handleLogin = async () => {
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({
        email: email.trim().toLowerCase(),
        password,
      });

      if (result.requires2fa) {
        const methods = result.availableMethods || [];
        const firstMethod = methods[0];

        setPendingMethods(methods);
        setActiveMethodId(firstMethod?.id || '');
        setActiveMethodName(firstMethod?.method || 'email');
        setOtpCode('');
        setStep('otp');
        return;
      }

      if (result.success) {
        goToApp();
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (loginError) {
      console.error('Login error:', loginError);
      setError('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');

    if (!activeMethodId) {
      setError('No verification method is available');
      return;
    }

    if (otpCode.trim().length < 6) {
      setError('Enter the 6 digit code');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await verifyTwoFactor(activeMethodId, otpCode.trim());

      if (result.verified || result.session_activated) {
        goToApp();
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch (verifyError) {
      console.error('Two factor verification error:', verifyError);
      setError('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!activeMethodId) {
      setError('No verification method is available');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await startTwoFactor(activeMethodId, activeMethodName);
    } catch (resendError) {
      console.error('Two factor resend error:', resendError);
      setError('Could not resend the code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    setStep('credentials');
    setOtpCode('');
    setPendingMethods([]);
    setActiveMethodId('');
    setError('');
  };

  const handleClearStorage = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Success', 'Storage cleared successfully');
    } catch (storageError) {
      console.error('Error clearing storage:', storageError);
      Alert.alert('Error', 'Failed to clear storage');
    }
  };

  const toggleSecureTextEntry = () => {
    setSecureTextEntry((current) => !current);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoSection}>
            <AppLogo
              width={240}
              height={60}
              containerStyle={styles.logoContainer}
            />
            <Text style={styles.welcomeText}>Welcome to {businessName}</Text>
            <Text style={styles.subtitleText}>
              {step === 'otp' ? 'Enter your verification code' : 'Sign in to your account'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#ff4757" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {step === 'otp' ? (
              <>
                {pendingMethods.length > 1 ? (
                  <View style={styles.methodList}>
                    {pendingMethods.map((method) => (
                      <TouchableOpacity
                        key={method.id}
                        style={[
                          styles.methodButton,
                          method.id === activeMethodId && {
                            borderColor: mainColor,
                            backgroundColor: '#eef5ff',
                          },
                        ]}
                        onPress={() => {
                          setActiveMethodId(method.id);
                          setActiveMethodName(method.method);
                          setOtpCode('');
                          setError('');
                        }}
                        disabled={isSubmitting}
                      >
                        <Text
                          style={[
                            styles.methodButtonText,
                            method.id === activeMethodId && { color: mainColor },
                          ]}
                        >
                          {method.method.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Code sent by {selectedMethod?.method || activeMethodName}
                  </Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="keypad-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.otpInput]}
                      placeholder="000000"
                      placeholderTextColor="#999"
                      value={otpCode}
                      onChangeText={(value) => setOtpCode(value.replace(/\D/g, '').slice(0, 6))}
                      keyboardType="number-pad"
                      autoComplete="one-time-code"
                      maxLength={6}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.loginButton, { backgroundColor: mainColor, shadowColor: mainColor }, isSubmitting && styles.buttonLoading]}
                  onPress={handleVerifyOtp}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={styles.buttonText}>Verifying...</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Verify Code</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.accountActions}>
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={handleResendCode}
                    disabled={isSubmitting}
                  >
                    <Text style={[styles.linkText, { color: mainColor }]}>Resend Code</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={handleBackToLogin}
                    disabled={isSubmitting}
                  >
                    <Text style={[styles.linkText, { color: mainColor }]}>Back to Sign In</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="#999"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      editable={!isSubmitting}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Enter your password"
                      placeholderTextColor="#999"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={secureTextEntry}
                      autoComplete="password"
                      editable={!isSubmitting}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={toggleSecureTextEntry}
                      disabled={isSubmitting}
                    >
                      <Ionicons
                        name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.loginButton, { backgroundColor: mainColor, shadowColor: mainColor }, isSubmitting && styles.buttonLoading]}
                  onPress={handleLogin}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={styles.buttonText}>Signing in...</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
                  )}
                </TouchableOpacity>

                {registrationEnabled && (
                  <View style={styles.accountActions}>
                    <TouchableOpacity
                      style={styles.linkButton}
                      onPress={() => router.push('/account-recovery')}
                      disabled={isSubmitting}
                    >
                      <Text style={[styles.linkText, { color: mainColor }]}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>or</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                      style={styles.linkButton}
                      onPress={() => router.push('/create-account')}
                      disabled={isSubmitting}
                    >
                      <Text style={[styles.linkText, { color: mainColor }]}>Create New Account</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearStorage}
              disabled={isSubmitting}
            >
              <Text style={styles.clearButtonText}>Clear Storage</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 80,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '400',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    height: '100%',
    fontWeight: '400',
  },
  otpInput: {
    letterSpacing: 4,
    textAlign: 'center',
  },
  passwordInput: {
    paddingRight: 0,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  methodList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  methodButton: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  methodButtonText: {
    color: '#333333',
    fontSize: 13,
    fontWeight: '700',
  },
  loginButton: {
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonLoading: {
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  clearButton: {
    marginTop: 20,
    padding: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  accountActions: {
    marginTop: 24,
    marginBottom: 16,
  },
  linkButton: {
    padding: 12,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e9ecef',
  },
  dividerText: {
    color: '#666666',
    fontSize: 14,
    marginHorizontal: 16,
    fontWeight: '500',
  },
});
