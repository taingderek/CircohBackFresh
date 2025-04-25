import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch, 
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Stack, Link, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { userData, isPremium } = useUser();
  const [loading, setLoading] = useState(false);
  
  // Settings states
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const handleToggleNotifications = (value: boolean) => {
    setNotifications(value);
    // In a real app, you would save this to AsyncStorage or the backend
  };
  
  const handleToggleDarkMode = (value: boolean) => {
    setDarkMode(value);
    // In a real app, you would implement theme switching
  };
  
  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await signOut();
              // Clear any app-specific data from AsyncStorage
              await AsyncStorage.multiRemove([
                'appSettings',
                'lastActiveDate',
                // Add any other keys that should be cleared on sign out
              ]);
              router.replace('/' as any);
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Account', 
          style: 'destructive',
          onPress: () => {
            // Implement account deletion logic
            Alert.alert(
              'Account Deletion',
              'For this demo, account deletion functionality is not implemented. In a production app, this would securely delete all your data and account information.'
            );
          }
        }
      ]
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Settings',
        headerShown: true,
      }} />
      
      <ScrollView style={styles.scrollView}>
        {/* User Profile Section */}
        <TouchableOpacity 
          style={styles.profileSection}
          onPress={() => router.push('/profile/edit' as any)}
        >
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {userData?.name ? userData.name[0].toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userData?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
            </View>
          </View>
          <FontAwesome name="chevron-right" size={16} color="#ccc" />
        </TouchableOpacity>
        
        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/subscription' as any)}
          >
            <View style={styles.menuItemContent}>
              <FontAwesome name="star" size={20} color="#FFD700" style={styles.menuIcon} />
              <View>
                <Text style={styles.menuItemTitle}>
                  {isPremium ? 'Premium Subscription' : 'Upgrade to Premium'}
                </Text>
                <Text style={styles.menuItemDescription}>
                  {isPremium 
                    ? 'Manage your premium subscription'
                    : 'Unlock all features and unlimited contacts'}
                </Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#ccc" />
          </TouchableOpacity>
        </View>
        
        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesome name="bell" size={20} color="#555" />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#CCC', true: '#A7C7E7' }}
              thumbColor={notifications ? '#0066CC' : '#F5F5F5'}
            />
          </View>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesome name="moon-o" size={20} color="#555" />
              <Text style={styles.menuItemText}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: '#CCC', true: '#A7C7E7' }}
              thumbColor={darkMode ? '#0066CC' : '#F5F5F5'}
            />
          </View>
        </View>
        
        {/* About & Help Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About & Help</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/about' as any)}
          >
            <View style={styles.menuItemLeft}>
              <FontAwesome name="info-circle" size={20} color="#555" />
              <Text style={styles.menuItemText}>About us</Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#CCC" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/help' as any)}
          >
            <View style={styles.menuItemLeft}>
              <FontAwesome name="question-circle" size={20} color="#555" />
              <Text style={styles.menuItemText}>Help & Support</Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#CCC" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/privacy' as any)}
          >
            <View style={styles.menuItemLeft}>
              <FontAwesome name="shield" size={20} color="#555" />
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#CCC" />
          </TouchableOpacity>
        </View>
        
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profile' as any)}
          >
            <View style={styles.menuItemLeft}>
              <FontAwesome name="user" size={20} color="#555" />
              <Text style={styles.menuItemText}>My Profile</Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#CCC" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/contacts' as any)}
          >
            <View style={styles.menuItemLeft}>
              <FontAwesome name="address-book" size={20} color="#555" />
              <Text style={styles.menuItemText}>Manage Contacts</Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#CCC" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/reminders' as any)}
          >
            <View style={styles.menuItemLeft}>
              <FontAwesome name="bell" size={20} color="#555" />
              <Text style={styles.menuItemText}>Contact Reminders</Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#CCC" />
          </TouchableOpacity>
          
          {!isPremium && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/premium' as any)}
            >
              <View style={styles.menuItemLeft}>
                <FontAwesome name="star" size={20} color="#FFD700" />
                <Text style={styles.menuItemText}>Upgrade to Premium</Text>
              </View>
              <FontAwesome name="chevron-right" size={14} color="#CCC" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/security' as any)}
          >
            <View style={styles.menuItemLeft}>
              <FontAwesome name="lock" size={20} color="#555" />
              <Text style={styles.menuItemText}>Security</Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#CCC" />
          </TouchableOpacity>
        </View>
        
        {/* Sign Out Option */}
        <TouchableOpacity 
          style={[styles.menuItem, styles.signOutButton]}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        
        <View style={styles.version}>
          <Text style={styles.versionText}>App Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: '#555',
    backgroundColor: '#f8f8f8',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  menuItemTitle: {
    fontSize: 16,
    color: '#333',
  },
  menuItemDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  signOutButton: {
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  signOutText: {
    color: 'red',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  version: {
    alignItems: 'center',
    marginVertical: 20,
  },
  versionText: {
    color: '#999',
    fontSize: 14,
  },
}); 