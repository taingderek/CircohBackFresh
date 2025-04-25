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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppDispatch, useAppSelector } from '@/app/core/store/hooks';
import { resetPassword, selectIsLoading, selectError } from '@/app/core/store/slices/authSlice';
import { COLORS, SPACING, FONT_SIZES, EFFECTS } from '@/app/core/constants/theme';
import { navigateToAuth } from '@/app/core/utils/navigationUtils';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  // Handle reset password request
  const handleResetPassword = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (!email) {
      return; // Add validation feedback later
    }
    
    await dispatch(resetPassword(email));
    if (!error) {
      setIsSubmitted(true);
    }
  };

  // Go back to login screen
  const handleBackToLogin = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
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
            onPress={handleBackToLogin}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.TEXT} />
          </Pressable>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              {isSubmitted 
                ? "We've sent you an email with instructions to reset your password." 
                : "Enter your email address and we'll send you instructions to reset your password."}
            </Text>
          </View>

          {!isSubmitted ? (
            <View style={styles.formContainer}>
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color={COLORS.ERROR} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

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
                  returnKeyType="done"
                />
              </View>

              {/* Reset Button */}
              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.BACKGROUND} />
                ) : (
                  <Text style={styles.buttonText}>Send Reset Instructions</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.successContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="checkmark-circle" size={80} color={COLORS.SUCCESS} />
              </View>
              <Text style={styles.successText}>
                Please check your email for instructions on how to reset your password.
              </Text>
              <TouchableOpacity
                style={[styles.button, styles.backToLoginButton]}
                onPress={handleBackToLogin}
              >
                <Text style={styles.buttonText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
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
  button: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: SPACING.MEDIUM,
  },
  resetButton: {
    backgroundColor: COLORS.PRIMARY,
    ...EFFECTS.GLOW_PRIMARY,
  },
  buttonText: {
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: 'bold',
    fontFamily: 'MontserratBold',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.LARGE,
    ...EFFECTS.GLOW_PRIMARY,
  },
  successText: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT,
    textAlign: 'center',
    marginBottom: SPACING.LARGE,
    fontFamily: 'MontserratRegular',
  },
  backToLoginButton: {
    backgroundColor: COLORS.PRIMARY,
    width: '100%',
    ...EFFECTS.GLOW_PRIMARY,
  },
}); 