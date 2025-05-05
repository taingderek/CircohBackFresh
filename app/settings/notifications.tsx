import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/app/core/constants/theme';

export default function NotificationsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Notification settings state
  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    reminderNotifications: true,
    birthdayReminders: true,
    weeklyDigest: true,
    missedConnections: true,
    appUpdates: false,
    marketingEmails: false,
  });

  // Toggle a specific notification setting
  const toggleSetting = (setting: keyof typeof settings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [setting]: !prevSettings[setting]
    }));
  };

  // Save notification settings
  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // In a real app, call your API to save the notification settings
      // await updateNotificationSettings(settings);
      
      // Mock successful save
      setTimeout(() => {
        Alert.alert('Success', 'Notification settings updated successfully');
        setIsLoading(false);
      }, 800);
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Notification Toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Channels</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive alerts on your device
              </Text>
            </View>
            <Switch
              value={settings.pushEnabled}
              onValueChange={() => toggleSetting('pushEnabled')}
              trackColor={{ false: COLORS.GRAY_DARK, true: COLORS.PRIMARY_DARK }}
              thumbColor={settings.pushEnabled ? COLORS.PRIMARY : COLORS.GRAY_LIGHT}
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Email Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive updates to your email
              </Text>
            </View>
            <Switch
              value={settings.emailEnabled}
              onValueChange={() => toggleSetting('emailEnabled')}
              trackColor={{ false: COLORS.GRAY_DARK, true: COLORS.PRIMARY_DARK }}
              thumbColor={settings.emailEnabled ? COLORS.PRIMARY : COLORS.GRAY_LIGHT}
            />
          </View>
        </View>

        {/* Reminder Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Contact Reminders</Text>
              <Text style={styles.settingDescription}>
                Reminders to keep in touch with your contacts
              </Text>
            </View>
            <Switch
              value={settings.reminderNotifications}
              onValueChange={() => toggleSetting('reminderNotifications')}
              trackColor={{ false: COLORS.GRAY_DARK, true: COLORS.PRIMARY_DARK }}
              thumbColor={settings.reminderNotifications ? COLORS.PRIMARY : COLORS.GRAY_LIGHT}
              disabled={!settings.pushEnabled && !settings.emailEnabled}
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Birthday Reminders</Text>
              <Text style={styles.settingDescription}>
                Notifications for upcoming birthdays
              </Text>
            </View>
            <Switch
              value={settings.birthdayReminders}
              onValueChange={() => toggleSetting('birthdayReminders')}
              trackColor={{ false: COLORS.GRAY_DARK, true: COLORS.PRIMARY_DARK }}
              thumbColor={settings.birthdayReminders ? COLORS.PRIMARY : COLORS.GRAY_LIGHT}
              disabled={!settings.pushEnabled && !settings.emailEnabled}
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Missed Connections</Text>
              <Text style={styles.settingDescription}>
                Alerts for contacts you haven't engaged with in a while
              </Text>
            </View>
            <Switch
              value={settings.missedConnections}
              onValueChange={() => toggleSetting('missedConnections')}
              trackColor={{ false: COLORS.GRAY_DARK, true: COLORS.PRIMARY_DARK }}
              thumbColor={settings.missedConnections ? COLORS.PRIMARY : COLORS.GRAY_LIGHT}
              disabled={!settings.pushEnabled && !settings.emailEnabled}
            />
          </View>
        </View>

        {/* Summary Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary & Updates</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Weekly Digest</Text>
              <Text style={styles.settingDescription}>
                Weekly summary of your relationship activities
              </Text>
            </View>
            <Switch
              value={settings.weeklyDigest}
              onValueChange={() => toggleSetting('weeklyDigest')}
              trackColor={{ false: COLORS.GRAY_DARK, true: COLORS.PRIMARY_DARK }}
              thumbColor={settings.weeklyDigest ? COLORS.PRIMARY : COLORS.GRAY_LIGHT}
              disabled={!settings.emailEnabled}
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>App Updates</Text>
              <Text style={styles.settingDescription}>
                New features and improvements
              </Text>
            </View>
            <Switch
              value={settings.appUpdates}
              onValueChange={() => toggleSetting('appUpdates')}
              trackColor={{ false: COLORS.GRAY_DARK, true: COLORS.PRIMARY_DARK }}
              thumbColor={settings.appUpdates ? COLORS.PRIMARY : COLORS.GRAY_LIGHT}
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Marketing Emails</Text>
              <Text style={styles.settingDescription}>
                Special offers and promotional content
              </Text>
            </View>
            <Switch
              value={settings.marketingEmails}
              onValueChange={() => toggleSetting('marketingEmails')}
              trackColor={{ false: COLORS.GRAY_DARK, true: COLORS.PRIMARY_DARK }}
              thumbColor={settings.marketingEmails ? COLORS.PRIMARY : COLORS.GRAY_LIGHT}
              disabled={!settings.emailEnabled}
            />
          </View>
        </View>

        {/* Notification Times - Premium Feature */}
        <View style={styles.section}>
          <View style={styles.premiumBadgeContainer}>
            <Text style={styles.sectionTitle}>Custom Notification Times</Text>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>PREMIUM</Text>
            </View>
          </View>
          
          <View style={styles.premiumFeature}>
            <Text style={styles.premiumFeatureText}>
              Upgrade to Premium to set custom notification times for different days of the week.
            </Text>
            
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={() => router.push('/subscription')}
            >
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveSettings}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>

        {/* How Notifications Work */}
        <TouchableOpacity 
          style={styles.helpLink}
          onPress={() => Alert.alert(
            'How Notifications Work',
            'CircohBack sends timely reminders to help you maintain meaningful connections with your contacts. You can customize which notifications you receive and how you receive them.'
          )}
        >
          <Ionicons name="information-circle-outline" size={20} color={COLORS.PRIMARY} />
          <Text style={styles.helpLinkText}>Learn how notifications work</Text>
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SMALL,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: SPACING.MEDIUM,
  },
  settingTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: '500',
    color: COLORS.TEXT,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: SPACING.SMALL,
  },
  premiumBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  premiumBadge: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.SMALL,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.SMALL,
    marginLeft: SPACING.SMALL,
  },
  premiumBadgeText: {
    color: COLORS.BLACK,
    fontSize: FONT_SIZES.XS,
    fontWeight: 'bold',
  },
  premiumFeature: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.SMALL,
    padding: SPACING.MEDIUM,
    alignItems: 'center',
  },
  premiumFeatureText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  upgradeButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.SMALL,
  },
  upgradeButtonText: {
    color: COLORS.BLACK,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.SMALL,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
    padding: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.SMALL,
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  saveButtonText: {
    color: COLORS.BLACK,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.MEDIUM,
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.XLARGE,
  },
  helpLinkText: {
    color: COLORS.PRIMARY,
    marginLeft: SPACING.TINY,
    fontSize: FONT_SIZES.SMALL,
  },
}); 