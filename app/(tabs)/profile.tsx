import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '@/app/core/store/hooks';
import { signOut } from '@/app/core/store/slices/authSlice';
import { COLORS, SPACING, FONT_SIZES, EFFECTS } from '@/app/core/constants/theme';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();

  const handleSignOut = () => {
    dispatch(signOut());
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={COLORS.TEXT} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileInitials}>
            <Text style={styles.initialsText}>JD</Text>
          </View>
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.profileEmail}>john.doe@example.com</Text>
          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>25</Text>
              <Text style={styles.statLabel}>Contacts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Due</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
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
              <Text style={styles.scoreValue}>750</Text>
            </View>
            <View style={styles.scoreDetails}>
              <View style={styles.scoreDetailItem}>
                <Text style={styles.detailLabel}>Consistency</Text>
                <View style={styles.detailBar}>
                  <View style={[styles.detailFill, { width: '80%', backgroundColor: COLORS.SUCCESS }]} />
                </View>
              </View>
              <View style={styles.scoreDetailItem}>
                <Text style={styles.detailLabel}>Empathy</Text>
                <View style={styles.detailBar}>
                  <View style={[styles.detailFill, { width: '65%', backgroundColor: COLORS.PRIMARY }]} />
                </View>
              </View>
              <View style={styles.scoreDetailItem}>
                <Text style={styles.detailLabel}>Thoughtfulness</Text>
                <View style={styles.detailBar}>
                  <View style={[styles.detailFill, { width: '75%', backgroundColor: COLORS.SECONDARY }]} />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person-outline" size={24} color={COLORS.TEXT} />
            <Text style={styles.menuText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.TEXT} />
            <Text style={styles.menuText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="diamond-outline" size={24} color={COLORS.TEXT} />
            <Text style={styles.menuText}>Upgrade to Premium</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={24} color={COLORS.TEXT} />
            <Text style={styles.menuText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.ERROR} />
            <Text style={[styles.menuText, styles.logoutText]}>Log Out</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
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
    fontFamily: 'MontserratBold',
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
    borderRadius: 16,
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
    ...EFFECTS.GLOW_PRIMARY,
  },
  initialsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.BACKGROUND,
    fontFamily: 'MontserratBold',
  },
  profileName: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.TINY,
    fontFamily: 'MontserratBold',
  },
  profileEmail: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MEDIUM,
    fontFamily: 'MontserratRegular',
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
    fontFamily: 'MontserratBold',
  },
  statLabel: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'MontserratRegular',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: COLORS.BORDER,
  },
  scoreCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
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
    fontFamily: 'MontserratSemiBold',
  },
  scoreMoreInfo: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.PRIMARY,
    fontFamily: 'MontserratMedium',
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
    backgroundColor: COLORS.PRIMARY + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.PRIMARY,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    fontFamily: 'MontserratBold',
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
    fontFamily: 'MontserratRegular',
  },
  detailBar: {
    height: 6,
    backgroundColor: COLORS.GRAY_DARK,
    borderRadius: 3,
    overflow: 'hidden',
  },
  detailFill: {
    height: '100%',
    borderRadius: 3,
  },
  menuSection: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
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
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT,
    marginLeft: SPACING.MEDIUM,
    fontFamily: 'MontserratMedium',
  },
  logoutText: {
    color: COLORS.ERROR,
  },
}); 