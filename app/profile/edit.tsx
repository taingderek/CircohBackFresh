import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, BORDER_RADIUS } from '@/app/core/constants/theme';
import Avatar from '@/app/components/common/Avatar';

export default function EditProfileScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock user data - replace with actual data from your state management system
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    initials: 'JD',
    phone: '+1 (555) 123-4567'
  });

  // Form state
  const [name, setName] = useState(userData.name);
  const [email, setEmail] = useState(userData.email);
  const [phone, setPhone] = useState(userData.phone);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle profile update
  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      // Validate inputs
      if (!name.trim()) {
        Alert.alert('Error', 'Name cannot be empty');
        return;
      }
      
      if (!email.trim() || !email.includes('@')) {
        Alert.alert('Error', 'Please enter a valid email');
        return;
      }
      
      // In a real app, call your API to update the profile
      // await updateUserProfile({ name, email, phone });
      
      // Mock successful update
      setTimeout(() => {
        setUserData({ 
          ...userData, 
          name, 
          email, 
          phone 
        });
        
        Alert.alert(
          'Success',
          'Your profile has been updated successfully',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    setIsLoading(true);
    try {
      // Validate inputs
      if (!currentPassword) {
        Alert.alert('Error', 'Current password is required');
        setIsLoading(false);
        return;
      }
      
      if (newPassword.length < 8) {
        Alert.alert('Error', 'New password must be at least 8 characters');
        setIsLoading(false);
        return;
      }
      
      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'New passwords do not match');
        setIsLoading(false);
        return;
      }
      
      // In a real app, call your API to change the password
      // await changeUserPassword({ currentPassword, newPassword });
      
      // Mock successful update
      setTimeout(() => {
        Alert.alert(
          'Success',
          'Your password has been updated successfully',
          [{ text: 'OK' }]
        );
        
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = () => {
    Alert.alert(
      'Upload Profile Photo',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => console.log('Camera') },
        { text: 'Choose from Library', onPress: () => console.log('Library') }
      ]
    );
  };

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
            {userData.avatar ? (
              <Avatar size={100} source={{ uri: userData.avatar }} name={userData.name} />
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
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.GRAY}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.GRAY}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor={COLORS.GRAY}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity 
            style={[styles.updateButton, isLoading && styles.disabledButton]} 
            onPress={handleUpdateProfile}
            disabled={isLoading}
          >
            {isLoading ? (
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
              isLoading && styles.disabledButton,
              (!currentPassword || !newPassword || !confirmPassword) && styles.disabledButton
            ]} 
            onPress={handleChangePassword}
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.BLACK} />
            ) : (
              <Text style={styles.updateButtonText}>Change Password</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Delete Account Option */}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              'Delete Account',
              'Are you sure you want to delete your account? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Delete', 
                  onPress: () => {
                    // Handle account deletion
                    Alert.alert('Account Deletion', 'Your account deletion request has been submitted.');
                  }, 
                  style: 'destructive' 
                }
              ]
            );
          }}
        >
          <Text style={styles.deleteButtonText}>Delete Account</Text>
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
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.ERROR,
    borderRadius: BORDER_RADIUS.SMALL,
    paddingVertical: SPACING.MEDIUM,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.XLARGE,
  },
  deleteButtonText: {
    color: COLORS.ERROR,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.MEDIUM,
  },
}); 