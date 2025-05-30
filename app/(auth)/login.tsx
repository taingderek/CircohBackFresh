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
  Image,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppDispatch, useAppSelector } from '@/app/core/store/hooks';
import { selectIsLoading, selectError } from '@/app/core/store/slices/authSlice';
import { useSupabaseAuth } from '@/app/core/hooks/useSupabaseAuth';
import { COLORS, SPACING, FONT_SIZES, EFFECTS } from '@/app/core/constants/theme';
import { navigateToAuth } from '@/app/core/utils/navigationUtils';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, isLoading, error } = useSupabaseAuth();

  // For demo purposes - use this account
  const useTestAccount = () => {
    setEmail('demo@circohback.com');
    setPassword('Password123!');
  };

  // Handle login
  const handleLogin = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (!email || !password) {
      return; // Add validation feedback later
    }
    
    setIsSubmitting(true);
    const success = await signIn(email, password);
    setIsSubmitting(false);

    if (success) {
      // If login successful, navigate to the main app
      router.replace('/(tabs)/' as any);
    }
  };

  // Toggle remember me
  const toggleRememberMe = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setRememberMe(!rememberMe);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setShowPassword(!showPassword);
  };

  return (
    <ImageBackground
      source={require('../../assets/images/icon.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar style="light" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>CB</Text>
              </View>
              <Text style={styles.appName}>CircohBack</Text>
              <Text style={styles.tagline}>Never lose touch with those who matter</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.title}>Welcome Back</Text>
              
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
                  returnKeyType="done"
                />
                <Pressable onPress={togglePasswordVisibility} style={styles.passwordToggle}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.TEXT_SECONDARY}
                  />
                </Pressable>
              </View>

              <View style={styles.optionsRow}>
                <Pressable
                  style={styles.rememberMeContainer}
                  onPress={toggleRememberMe}
                  hitSlop={10}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && (
                      <Ionicons name="checkmark" size={16} color={COLORS.BACKGROUND} />
                    )}
                  </View>
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </Pressable>

                <TouchableOpacity onPress={() => navigateToAuth.forgotPassword(router)}>
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.button, styles.loginButton, isSubmitting && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.BACKGROUND} />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Test Account Button */}
              <TouchableOpacity
                style={[styles.button, styles.testAccountButton]}
                onPress={useTestAccount}
              >
                <Text style={styles.testAccountButtonText}>Use Test Account</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              {/* Social Login Buttons */}
              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity style={[styles.button, styles.socialButton]}>
                  <Ionicons name="logo-google" size={18} color={COLORS.TEXT} />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.button, styles.socialButton]}>
                  <Ionicons name="logo-apple" size={18} color={COLORS.TEXT} />
                  <Text style={styles.socialButtonText}>Apple</Text>
                </TouchableOpacity>
              </View>

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigateToAuth.register(router)}>
                  <Text style={styles.signUpLink}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: SPACING.LARGE,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: SPACING.XLARGE,
    marginBottom: SPACING.XLARGE,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
    ...EFFECTS.GLOW_PRIMARY,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.BACKGROUND,
    fontFamily: 'MontserratBold',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: SPACING.MEDIUM,
  },
  appName: {
    fontSize: FONT_SIZES.XXL,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    fontFamily: 'MontserratBold',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.TINY,
    fontFamily: 'MontserratRegular',
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.LARGE,
    fontFamily: 'MontserratSemiBold',
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
  passwordToggle: {
    padding: SPACING.SMALL,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.TEXT_SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.SMALL,
  },
  checkboxChecked: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  rememberMeText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: 'MontserratRegular',
  },
  forgotPasswordText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: 'MontserratMedium',
  },
  button: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: SPACING.MEDIUM,
  },
  loginButton: {
    backgroundColor: COLORS.PRIMARY,
    marginBottom: SPACING.LARGE,
    ...EFFECTS.GLOW_PRIMARY,
  },
  buttonDisabled: {
    backgroundColor: COLORS.PRIMARY + '80',
  },
  buttonText: {
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: 'MontserratSemiBold',
    fontWeight: '600',
  },
  testAccountButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY + '80',
    marginTop: SPACING.SMALL,
  },
  testAccountButtonText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: 'MontserratMedium',
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.BORDER,
  },
  dividerText: {
    color: COLORS.TEXT_SECONDARY,
    marginHorizontal: SPACING.MEDIUM,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: 'MontserratRegular',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.LARGE,
  },
  socialButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    width: '48%',
  },
  socialButtonText: {
    color: COLORS.TEXT,
    marginLeft: SPACING.SMALL,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: 'MontserratMedium',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: 'MontserratRegular',
  },
  signUpLink: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.SMALL,
    fontWeight: 'bold',
    marginLeft: SPACING.SMALL,
    fontFamily: 'MontserratBold',
  },
}); 