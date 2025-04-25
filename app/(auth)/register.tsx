import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppDispatch, useAppSelector } from '@/app/core/store/hooks';
import { signUp, selectIsLoading, selectError } from '@/app/core/store/slices/authSlice';
import { COLORS, SPACING, FONT_SIZES, EFFECTS } from '@/app/core/constants/theme';
import { navigateToAuth } from '@/app/core/utils/navigationUtils';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  // Validate form
  const validateForm = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Handle registration
  const handleRegister = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (!email || !password || !name) {
      return; // Add validation feedback later
    }

    if (!validateForm()) {
      return;
    }
    
    dispatch(signUp({ email, password }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setShowPassword(!showPassword);
  };

  // Sign In navigation
  const goToLogin = () => {
    navigateToAuth.login(router);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.TEXT} />
          </Pressable>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join CircohBack to stay connected with the people who matter most</Text>
          </View>

          <View style={styles.formContainer}>
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={COLORS.ERROR} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="next"
              />
              <Pressable onPress={togglePasswordVisibility} style={styles.passwordToggle}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.TEXT_SECONDARY}
                />
              </Pressable>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
              />
            </View>

            {passwordError ? (
              <View style={styles.passwordErrorContainer}>
                <Text style={styles.passwordErrorText}>{passwordError}</Text>
              </View>
            ) : null}

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password must:</Text>
              <View style={styles.requirementRow}>
                <Ionicons 
                  name={password.length >= 8 ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={password.length >= 8 ? COLORS.SUCCESS : COLORS.TEXT_SECONDARY} 
                />
                <Text style={styles.requirementText}>Be at least 8 characters</Text>
              </View>
              <View style={styles.requirementRow}>
                <Ionicons 
                  name={/[A-Z]/.test(password) ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={/[A-Z]/.test(password) ? COLORS.SUCCESS : COLORS.TEXT_SECONDARY} 
                />
                <Text style={styles.requirementText}>Include at least one uppercase letter</Text>
              </View>
              <View style={styles.requirementRow}>
                <Ionicons 
                  name={/[0-9]/.test(password) ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={/[0-9]/.test(password) ? COLORS.SUCCESS : COLORS.TEXT_SECONDARY} 
                />
                <Text style={styles.requirementText}>Include at least one number</Text>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.button, styles.registerButton]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.BACKGROUND} />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Terms and Conditions */}
            <Text style={styles.termsText}>
              By signing up, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account?</Text>
              <TouchableOpacity onPress={goToLogin}>
                <Text style={styles.signInLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: SPACING.LARGE,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.CARD,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  headerContainer: {
    marginBottom: SPACING.LARGE,
  },
  title: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.SMALL,
    fontFamily: 'MontserratBold',
  },
  subtitle: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'MontserratRegular',
  },
  formContainer: {
    width: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ERROR + '18', // Hex opacity
    borderRadius: 8,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  errorText: {
    color: COLORS.ERROR,
    marginLeft: SPACING.SMALL,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: 'MontserratRegular',
    flex: 1,
  },
  passwordErrorContainer: {
    marginBottom: SPACING.MEDIUM,
  },
  passwordErrorText: {
    color: COLORS.ERROR,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: 'MontserratRegular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    borderRadius: 8,
    paddingHorizontal: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
    height: 56,
  },
  inputIcon: {
    marginRight: SPACING.MEDIUM,
  },
  input: {
    flex: 1,
    color: COLORS.TEXT,
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: 'MontserratRegular',
  },
  passwordToggle: {
    padding: SPACING.SMALL,
  },
  requirementsContainer: {
    marginBottom: SPACING.LARGE,
  },
  requirementsTitle: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SMALL,
    fontFamily: 'MontserratMedium',
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.TINY,
  },
  requirementText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: SPACING.SMALL,
    fontFamily: 'MontserratRegular',
  },
  button: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  registerButton: {
    backgroundColor: COLORS.PRIMARY,
    ...EFFECTS.GLOW_PRIMARY,
  },
  buttonText: {
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: 'bold',
    fontFamily: 'MontserratBold',
  },
  termsText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.LARGE,
    fontFamily: 'MontserratRegular',
  },
  termsLink: {
    color: COLORS.PRIMARY,
    fontFamily: 'MontserratMedium',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: 'MontserratRegular',
  },
  signInLink: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.SMALL,
    fontWeight: 'bold',
    marginLeft: SPACING.SMALL,
    fontFamily: 'MontserratBold',
  },
}); 