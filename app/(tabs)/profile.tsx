import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Linking, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { signOut } from '@/app/core/store/slices/authSlice';
import { COLORS, SPACING, FONT_SIZES, EFFECTS, FONT_FAMILIES, BORDER_RADIUS } from '@/app/core/constants/theme';
import Icon from '@/app/components/common/Icon';
import Avatar from '@/app/components/common/Avatar';
import { AppDispatch } from '@/app/core/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profileService, UserProfile } from '@/app/core/services/profileService';
import Constants from 'expo-constants';

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development' || Constants.expoConfig?.extra?.env === 'development';

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [scoreInfoModalVisible, setScoreInfoModalVisible] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await profileService.getUserProfile();
      setUser(profile);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              // Dispatch Redux signOut
              await dispatch(signOut()).unwrap();
              
              // Clear AsyncStorage
              await AsyncStorage.clear();
              
              // Force navigating to the auth screen
              router.replace('/(auth)');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'An error occurred while signing out. Please try again.');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Handle app store reviews
  const handleReviews = () => {
    // Deep links to app store reviews
    const appStoreId = 'XXXXXXXXXX'; // Replace with actual App Store ID
    const playStoreId = 'com.circohback.app'; // Your app's package name
    
    if (Platform.OS === 'ios') {
      // iOS: Open App Store review page
      Linking.openURL(`https://apps.apple.com/app/id${appStoreId}?action=write-review`);
    } else if (Platform.OS === 'android') {
      // Android: Open Play Store review page
      Linking.openURL(`https://play.google.com/store/apps/details?id=${playStoreId}&showAllReviews=true`);
    } else {
      // Fallback for other platforms
      router.push("/(stack)/reviews");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>No profile data available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={fetchUserProfile}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Link href="/settings" asChild>
            <TouchableOpacity style={styles.settingsButton}>
              <Icon name="settings-outline" size={24} color={COLORS.TEXT} />
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.profileCard}>
          {user.avatarUrl ? (
            <Avatar size={80} source={{ uri: user.avatarUrl }} name={user.fullName} />
          ) : (
            <View style={styles.profileInitials}>
              <Text style={styles.initialsText}>{user.initials}</Text>
            </View>
          )}
          <Text style={styles.profileName}>{user.fullName}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <View style={styles.profileStats}>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => router.push('/contacts')}
            >
              <Text style={styles.statNumber}>{user.contacts}</Text>
              <Text style={styles.statLabel}>Contacts</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => router.push('/reminders')}
            >
              <Text style={styles.statNumber}>{user.dueReminders}</Text>
              <Text style={styles.statLabel}>Due</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => router.push('/completed')}
            >
              <Text style={styles.statNumber}>{user.completedReminders}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreTitle}>CircohBack Score</Text>
            <TouchableOpacity onPress={() => setScoreInfoModalVisible(true)}>
              <Text style={styles.scoreMoreInfo}>How it works</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.scoreDisplay}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{user.score.total}</Text>
            </View>
            <View style={styles.scoreDetails}>
              <View style={styles.scoreDetailItem}>
                <Text style={styles.detailLabel}>Consistency</Text>
                <View style={styles.detailBar}>
                  <View style={[styles.detailFill, { width: `${user.score.consistency}%`, backgroundColor: COLORS.SUCCESS }]} />
                </View>
              </View>
              <View style={styles.scoreDetailItem}>
                <Text style={styles.detailLabel}>Empathy</Text>
                <View style={styles.detailBar}>
                  <View style={[styles.detailFill, { width: `${user.score.empathy}%`, backgroundColor: COLORS.PRIMARY }]} />
                </View>
              </View>
              <View style={styles.scoreDetailItem}>
                <Text style={styles.detailLabel}>Thoughtfulness</Text>
                <View style={styles.detailBar}>
                  <View style={[styles.detailFill, { width: `${user.score.thoughtfulness}%`, backgroundColor: COLORS.SECONDARY }]} />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.profileOption}
            onPress={() => router.push('/growth-dashboard')}
          >
            <View style={styles.profileOptionIcon}>
              <Icon name="analytics-outline" size={24} color={COLORS.PRIMARY} />
            </View>
            <View style={styles.profileOptionContent}>
              <Text style={styles.profileOptionTitle}>Growth Dashboard</Text>
              <Text style={styles.profileOptionDescription}>View your relationship growth metrics and analytics</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>

          <Link href="/profile/edit" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Icon name="person-outline" size={24} color={COLORS.TEXT} />
              <Text style={styles.menuText}>Edit Profile</Text>
              <Icon name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          </Link>
          
          <Link href="/settings/notifications" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Icon name="notifications-outline" size={24} color={COLORS.TEXT} />
              <Text style={styles.menuText}>Notifications</Text>
              <Icon name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          </Link>
          
          <Link href="/subscription" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Icon name={user.isPremium ? "diamond" : "diamond-outline"} size={24} color={user.isPremium ? COLORS.PRIMARY : COLORS.TEXT} />
              <Text style={[styles.menuText, user.isPremium && { color: COLORS.PRIMARY }]}>
                {user.isPremium ? "Premium Account" : "Upgrade to Premium"}
              </Text>
              <Icon name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          </Link>
          
          <Link href="/settings/privacy" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Icon name="shield-outline" size={24} color={COLORS.TEXT} />
              <Text style={styles.menuText}>Privacy Policy</Text>
              <Icon name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          </Link>
          
          <Link href="/settings/terms" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Icon name="document-text-outline" size={24} color={COLORS.TEXT} />
              <Text style={styles.menuText}>Terms of Service</Text>
              <Icon name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          </Link>
          
          <Link href="/settings/help" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Icon name="help-circle-outline" size={24} color={COLORS.TEXT} />
              <Text style={styles.menuText}>Help & Support</Text>
              <Icon name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          </Link>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleReviews}
          >
            <Icon name="star-outline" size={24} color={COLORS.TEXT} />
            <Text style={styles.menuText}>Rate on App Store</Text>
            <Icon name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
            <Icon name="log-out-outline" size={24} color={COLORS.ERROR} />
            <Text style={[styles.menuText, styles.logoutText]}>Log Out</Text>
            <Icon name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>

          {/* Development mode only: Test Data Generator */}
          {isDev && (
            <Link href="/admin/test-data" asChild>
              <TouchableOpacity style={[styles.menuItem, styles.devMenuItem]}>
                <Icon name="construct-outline" size={24} color={COLORS.SECONDARY} />
                <Text style={[styles.menuText, styles.devMenuText]}>Test Data Generator</Text>
                <Icon name="chevron-forward" size={20} color={COLORS.SECONDARY} />
              </TouchableOpacity>
            </Link>
          )}
        </View>
      </ScrollView>

      {/* Score Info Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={scoreInfoModalVisible}
        onRequestClose={() => setScoreInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How CircohBack Score Works</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setScoreInfoModalVisible(false)}
              >
                <Icon name="close" size={24} color={COLORS.TEXT} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSectionTitle}>What is the CircohBack Score?</Text>
              <Text style={styles.modalText}>
                Your CircohBack Score measures how effectively you maintain your relationships. 
                It's a cumulative score that grows over time as you actively manage your connections.
              </Text>
              
              <Text style={styles.modalSectionTitle}>How to Earn Points</Text>
              <View style={styles.scoreInfoItem}>
                <Icon name="checkmark-circle" size={20} color={COLORS.SUCCESS} style={styles.scoreInfoIcon} />
                <Text style={styles.scoreInfoText}>
                  <Text style={styles.scoreInfoHighlight}>Consistency:</Text> Complete reminders on time to increase your consistency score.
                </Text>
              </View>
              
              <View style={styles.scoreInfoItem}>
                <Icon name="heart" size={20} color={COLORS.PRIMARY} style={styles.scoreInfoIcon} />
                <Text style={styles.scoreInfoText}>
                  <Text style={styles.scoreInfoHighlight}>Empathy:</Text> Send personalized messages and check in during important moments.
                </Text>
              </View>
              
              <View style={styles.scoreInfoItem}>
                <Icon name="bulb" size={20} color={COLORS.SECONDARY} style={styles.scoreInfoIcon} />
                <Text style={styles.scoreInfoText}>
                  <Text style={styles.scoreInfoHighlight}>Thoughtfulness:</Text> Remember important dates and details about your contacts.
                </Text>
              </View>
              
              <Text style={styles.modalSectionTitle}>Leaderboard & Ranking</Text>
              <Text style={styles.modalText}>
                Coming soon! You'll be able to compare your score with other CircohBack users on our global leaderboard. Your score is uncapped, so keep building those relationships!
              </Text>
              
              <Text style={styles.modalSectionTitle}>Leveling Up</Text>
              <Text style={styles.modalText}>
                As you earn points, you'll progress through different relationship mastery levels. Each level unlocks new profile badges and achievements to showcase your relationship-building skills.
              </Text>
              
              <TouchableOpacity 
                style={styles.learnMoreButton}
                onPress={() => {
                  setScoreInfoModalVisible(false);
                  router.push('/growth-dashboard');
                }}
              >
                <Text style={styles.learnMoreButtonText}>View Growth Dashboard</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    padding: SPACING.LARGE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  title: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILIES.BOLD,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.CARD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.LARGE,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
  },
  profileInitials: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  initialsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.BACKGROUND,
    fontFamily: FONT_FAMILIES.BOLD,
  },
  profileName: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.TINY,
    fontFamily: FONT_FAMILIES.BOLD,
  },
  profileEmail: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MEDIUM,
    fontFamily: FONT_FAMILIES.REGULAR,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.SMALL,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILIES.BOLD,
  },
  statLabel: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONT_FAMILIES.REGULAR,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: COLORS.BORDER,
  },
  scoreCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.LARGE,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  scoreTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
  },
  scoreMoreInfo: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.PRIMARY,
    fontFamily: FONT_FAMILIES.MEDIUM,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.PRIMARY}20`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.PRIMARY,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILIES.BOLD,
  },
  scoreDetails: {
    flex: 1,
    marginLeft: SPACING.LARGE,
  },
  scoreDetailItem: {
    marginBottom: SPACING.SMALL,
  },
  detailLabel: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
    fontFamily: FONT_FAMILIES.MEDIUM,
  },
  detailBar: {
    height: 8,
    backgroundColor: COLORS.GRAY_DARK,
    borderRadius: 4,
    overflow: 'hidden',
  },
  detailFill: {
    height: '100%',
    borderRadius: 4,
  },
  menuSection: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.LARGE,
    overflow: 'hidden',
    marginBottom: SPACING.LARGE,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  menuText: {
    flex: 1,
    marginLeft: SPACING.MEDIUM,
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILIES.REGULAR,
  },
  logoutText: {
    color: COLORS.ERROR,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  profileOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.PRIMARY}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileOptionContent: {
    flex: 1,
    marginLeft: SPACING.MEDIUM,
  },
  profileOptionTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILIES.BOLD,
  },
  profileOptionDescription: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONT_FAMILIES.REGULAR,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.LARGE,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  modalTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.TEXT,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: SPACING.MEDIUM,
    maxHeight: 500,
  },
  modalSectionTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.PRIMARY,
    marginTop: SPACING.MEDIUM,
    marginBottom: SPACING.SMALL,
  },
  modalText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT,
    marginBottom: SPACING.MEDIUM,
    lineHeight: 22,
  },
  scoreInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.MEDIUM,
  },
  scoreInfoIcon: {
    marginRight: SPACING.SMALL,
    marginTop: 2,
  },
  scoreInfoText: {
    flex: 1,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT,
    lineHeight: 22,
  },
  scoreInfoHighlight: {
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.TEXT,
  },
  learnMoreButton: {
    backgroundColor: COLORS.PRIMARY,
    padding: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.SMALL,
    alignItems: 'center',
    marginTop: SPACING.MEDIUM,
    marginBottom: SPACING.LARGE,
  },
  learnMoreButtonText: {
    color: COLORS.BACKGROUND,
    fontFamily: FONT_FAMILIES.BOLD,
    fontSize: FONT_SIZES.MEDIUM,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LARGE,
  },
  errorText: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.SMALL,
    paddingHorizontal: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    marginTop: SPACING.MEDIUM,
  },
  retryButtonText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
  },
  devMenuItem: {
    backgroundColor: 'rgba(190, 147, 253, 0.15)', // Light variant of accent lavender
    borderColor: COLORS.SECONDARY,
    borderWidth: 1,
    marginVertical: 8,
  },
  devMenuText: {
    color: COLORS.SECONDARY,
    fontWeight: '600',
  },
}); 