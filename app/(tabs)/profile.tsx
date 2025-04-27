import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
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

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Mock user data - in a real app, get this from your user state
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    initials: 'JD',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    stats: {
      contacts: 25,
      due: 15,
      completed: 8
    },
    score: {
      total: 750,
      consistency: 80,
      empathy: 65,
      thoughtfulness: 75
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Link href="/settings" asChild>
            <TouchableOpacity style={styles.settingsButton}>
              <Icon name="settings-outline" size={24} color={COLORS.TEXT} />
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.profileCard}>
          {user.avatar ? (
            <Avatar size={80} source={{ uri: user.avatar }} name={user.name} />
          ) : (
            <View style={styles.profileInitials}>
              <Text style={styles.initialsText}>{user.initials}</Text>
            </View>
          )}
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.stats.contacts}</Text>
              <Text style={styles.statLabel}>Contacts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.stats.due}</Text>
              <Text style={styles.statLabel}>Due</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.stats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreTitle}>CircohBack Score</Text>
            <TouchableOpacity>
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
              <Icon name="diamond-outline" size={24} color={COLORS.TEXT} />
              <Text style={styles.menuText}>Upgrade to Premium</Text>
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
          
          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
            <Icon name="log-out-outline" size={24} color={COLORS.ERROR} />
            <Text style={[styles.menuText, styles.logoutText]}>Log Out</Text>
            <Icon name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    fontSize: 28,
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
}); 