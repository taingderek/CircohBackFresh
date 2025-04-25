import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resetPassword, error } = useAuth();

  const handleResetPassword = async () => {
    if (!email) {
      return;
    }

    setIsSubmitting(true);
    const success = await resetPassword(email);
    setIsSubmitting(false);

    if (success) {
      Alert.alert(
        "Email Sent",
        "If an account exists with this email, you will receive password reset instructions.",
        [
          { 
            text: "Back to Login", 
            onPress: () => router.push('/(auth)/login' as any) 
          }
        ]
      );
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>CircohBack</Text>
          <Text style={styles.tagline}>Circling back to what matters</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.heading}>Reset Password</Text>
          <Text style={styles.instructions}>
            Enter your email address and we'll send you instructions to reset your password.
          </Text>
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8E8E93"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Sending...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/(auth)/login' as any)}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 42,
    fontFamily: 'MontserratBold',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#BBBBBB',
    fontFamily: 'MontserratRegular',
  },
  formContainer: {
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
  },
  heading: {
    fontSize: 24,
    fontFamily: 'MontserratSemiBold',
    color: '#fff',
    marginBottom: 12,
  },
  instructions: {
    fontSize: 14,
    fontFamily: 'MontserratRegular',
    color: '#BBBBBB',
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    height: 56,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'MontserratRegular',
  },
  button: {
    height: 56,
    backgroundColor: '#3A86FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#3A86FF80',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'MontserratBold',
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  backButtonText: {
    color: '#3A86FF',
    fontSize: 14,
    fontFamily: 'MontserratMedium',
  },
  errorText: {
    color: '#FF453A',
    marginBottom: 16,
    fontFamily: 'MontserratMedium',
    fontSize: 14,
  },
}); 