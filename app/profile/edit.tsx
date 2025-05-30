import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, BORDER_RADIUS } from '@/app/core/constants/theme';
import Avatar from '@/app/components/common/Avatar';
import * as Haptics from 'expo-haptics';
import PhoneInput from 'react-native-phone-number-input';
import * as ImagePicker from 'expo-image-picker';
import { profileService, UserProfile } from '@/app/core/services/profileService';
import { supabase } from '@/app/core/services/supabaseClient';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/app/hooks/useAuth';

// Extend PhoneInput type with the methods we need
declare module 'react-native-phone-number-input' {
  interface PhoneInput {
    getNumber(): string;
    getFormattedValue(): string;
  }
}

// Country codes with flags for dropdown
const COUNTRY_CODES = [
  { label: '🇺🇸 +1', value: '+1', flag: '🇺🇸' },
  { label: '🇨🇦 +1', value: '+1', flag: '🇨🇦' },
  { label: '🇬🇧 +44', value: '+44', flag: '🇬🇧' },
  { label: '🇦🇺 +61', value: '+61', flag: '🇦🇺' },
  { label: '🇮🇳 +91', value: '+91', flag: '🇮🇳' },
  { label: '🇯🇵 +81', value: '+81', flag: '🇯🇵' },
  { label: '🇩🇪 +49', value: '+49', flag: '🇩🇪' },
  { label: '🇫🇷 +33', value: '+33', flag: '🇫🇷' },
  { label: '🇮🇹 +39', value: '+39', flag: '🇮🇹' },
  { label: '🇪🇸 +34', value: '+34', flag: '🇪🇸' },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const phoneInput = useRef<PhoneInput>(null);
  
  // User profile data
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state - initialize with empty values, will be populated in useEffect
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [bio, setBio] = useState('');
  
  // Focus state for styling inputs
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [bioFocused, setBioFocused] = useState(false);
  
  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Load user profile data
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const profile = await profileService.getUserProfile();
      setUserData(profile);
      
      // Update form state with profile data
      setName(profile.fullName);
      setEmail(profile.email);
      setBio(profile.bio || '');
      
      // TODO: Phone data isn't in the current profile model
      // You may need to update profileService to include phone information
      
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!userData) return;
    
    setIsSaving(true);
    try {
      // Validate inputs
      if (!name.trim()) {
        Alert.alert('Error', 'Name cannot be empty');
        setIsSaving(false);
        return;
      }
      
      if (!email.trim() || !email.includes('@')) {
        Alert.alert('Error', 'Please enter a valid email');
        setIsSaving(false);
        return;
      }
      
      // Update profile in Supabase
      await profileService.updateProfile({
        fullName: name,
        bio: bio
      });
      
      // Update local state
      setUserData({
        ...userData,
        fullName: name,
        bio: bio
      });
      
      Alert.alert(
        'Success',
        'Your profile has been updated successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    setIsSaving(true);
    try {
      // Validate inputs
      if (!currentPassword) {
        Alert.alert('Error', 'Current password is required');
        setIsSaving(false);
        return;
      }
      
      if (newPassword.length < 8) {
        Alert.alert('Error', 'New password must be at least 8 characters');
        setIsSaving(false);
        return;
      }
      
      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'New passwords do not match');
        setIsSaving(false);
        return;
      }
      
      // In a real app, call Supabase to change the password
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw error;
      }
      
      Alert.alert(
        'Success',
        'Your password has been updated successfully',
        [{ text: 'OK' }]
      );
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Upload Profile Photo',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => pickImage(true) },
        { text: 'Choose from Library', onPress: () => pickImage(false) }
      ]
    );
  };
  
  // Pick image from camera or library
  const pickImage = async (useCamera: boolean) => {
    try {
      // Request permissions first
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please grant camera permissions to take a photo');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please grant photo library permissions to select a photo');
          return;
        }
      }
      
      // Launch camera or image picker
      let result;
      if (useCamera) {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }
      
      if (!result.canceled && result.assets && result.assets[0]) {
        setIsSaving(true);
        
        try {
          const asset = result.assets[0];
          
          // Convert image to blob
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          
          // Upload to Supabase storage and update profile
          const filePath = `avatar-${userData?.id}-${Date.now()}`;
          const avatarUrl = await profileService.updateAvatar(filePath, blob);
          
          // Update local state
          if (userData) {
            setUserData({
              ...userData,
              avatarUrl
            });
          }
          
          Alert.alert('Success', 'Profile photo updated successfully');
        } catch (error) {
          console.error('Error uploading avatar:', error);
          Alert.alert('Error', 'Failed to upload profile photo. Please try again.');
        } finally {
          setIsSaving(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  // Add the missing handleAccountDeactivation function
  const handleAccountDeactivation = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    // First confirmation
    Alert.alert(
      'We\'ll Miss You',
      'Are you sure you want to deactivate your account? Your connections will miss hearing from you.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue with Deactivation', 
          onPress: () => {
            Alert.alert(
              'Account Deactivation',
              'This feature is currently under maintenance. Please try again later.',
              [{ text: 'OK' }]
            );
          },
          style: 'destructive' 
        }
      ]
    );
  };

  // Display loading indicator while fetching profile
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }
  
  // Display error message if profile fetch failed
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  // Display loading message if user data isn't available
  if (!userData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>No profile data available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleAvatarUpload}>
            {userData.avatarUrl ? (
              <Avatar size={90} source={{ uri: userData.avatarUrl }} name={userData.fullName} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.initialsText}>{userData.initials}</Text>
              </View>
            )}
            <View style={styles.editOverlay}>
              <Ionicons name="camera" size={20} color={COLORS.WHITE} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHelp}>Tap to change profile photo</Text>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={[
                styles.input, 
                nameFocused ? styles.inputActive : styles.inputInactive
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.GRAY}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[
                styles.input, 
                emailFocused ? styles.inputActive : styles.inputInactive
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.GRAY}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
            <PhoneInput
              ref={phoneInput}
              defaultValue={phone}
              defaultCode="US"
              layout="first"
              onChangeText={(text) => setPhone(text)}
              onChangeFormattedText={(text) => setFormattedPhone(text)}
              containerStyle={[
                styles.phoneContainer,
                phoneFocused && styles.inputActive
              ]}
              textContainerStyle={styles.phoneTextContainer}
              textInputStyle={styles.phoneTextInput}
              textInputProps={{
                placeholderTextColor: COLORS.TEXT_DISABLED,
                onFocus: () => setPhoneFocused(true),
                onBlur: () => setPhoneFocused(false),
              }}
            />
          </View>

          <TouchableOpacity 
            style={[styles.updateButton, isSaving && styles.disabledButton]} 
            onPress={handleUpdateProfile}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={COLORS.BLACK} />
            ) : (
              <Text style={styles.updateButtonText}>Update Profile</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Change Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={COLORS.GRAY}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color={COLORS.GRAY_LIGHT} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={COLORS.GRAY}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color={COLORS.GRAY_LIGHT} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={COLORS.GRAY}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color={COLORS.GRAY_LIGHT} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.updateButton, 
              isSaving && styles.disabledButton,
              (!currentPassword || !newPassword || !confirmPassword) && styles.disabledButton
            ]} 
            onPress={handleChangePassword}
            disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
          >
            {isSaving ? (
              <ActivityIndicator color={COLORS.BLACK} />
            ) : (
              <Text style={styles.updateButtonText}>Change Password</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Account Deactivation Option */}
        <TouchableOpacity 
          style={styles.deactivateButton}
          onPress={handleAccountDeactivation}
        >
          <Text style={styles.deactivateButtonText}>Deactivate Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.CARD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: SPACING.MEDIUM,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: SPACING.LARGE,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.CARD,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  initialsText: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.PRIMARY,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.BACKGROUND,
  },
  avatarHelp: {
    marginTop: SPACING.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZES.SMALL,
  },
  section: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.LARGE,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.MEDIUM,
  },
  inputContainer: {
    marginBottom: SPACING.MEDIUM,
  },
  inputLabel: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.TINY,
  },
  input: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.SMALL,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    color: COLORS.TEXT,
    fontSize: FONT_SIZES.MEDIUM,
    height: 50,
  },
  inputActive: {
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    opacity: 1,
  },
  inputInactive: {
    opacity: 0.6,
  },
  phoneContainer: {
    width: '100%',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.SMALL,
    height: 50,
  },
  phoneTextContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.SMALL,
    paddingVertical: 0,
  },
  phoneTextInput: {
    color: COLORS.TEXT,
    fontSize: FONT_SIZES.MEDIUM,
    height: 50,
  },
  phoneCodeText: {
    color: COLORS.TEXT,
    fontSize: FONT_SIZES.MEDIUM,
  },
  countryPickerButton: {
    width: 60,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.SMALL,
    height: 50,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    color: COLORS.TEXT,
    fontSize: FONT_SIZES.MEDIUM,
  },
  eyeIcon: {
    padding: SPACING.SMALL,
  },
  updateButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.SMALL,
    paddingVertical: SPACING.MEDIUM,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.SMALL,
  },
  updateButtonText: {
    color: COLORS.BLACK,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.MEDIUM,
  },
  disabledButton: {
    backgroundColor: COLORS.PRIMARY_DARK,
    opacity: 0.5,
  },
  deactivateButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: BORDER_RADIUS.SMALL,
    paddingVertical: SPACING.MEDIUM,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.XLARGE,
  },
  deactivateButtonText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: FONT_SIZES.MEDIUM,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.TEXT,
    fontSize: FONT_SIZES.MEDIUM,
    marginTop: SPACING.MEDIUM,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.TEXT,
    fontSize: FONT_SIZES.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.SMALL,
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.LARGE,
  },
  retryButtonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.MEDIUM,
  },
}); 