import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES } from '../core/constants/theme';
import HeaderWithAvatar from '../components/navigation/HeaderWithAvatar';
import Icon from '../components/common/Icon';

export default function HomeScreen() {
  const [userName, setUserName] = useState('John Doe');
  const [avatarUri, setAvatarUri] = useState('https://randomuser.me/api/portraits/men/32.jpg');

  const handleAvatarPress = () => {
    // Custom avatar press handler
    console.log('Avatar pressed');
    // Example: navigation.navigate('profile');
  };

  // Example of notification icon in right actions
  const renderRightActions = () => (
    <TouchableOpacity style={styles.iconButton}>
      <Icon name="notifications-outline" size={24} color={COLORS.TEXT} />
      {/* Notification badge */}
      <View style={styles.notificationBadge}>
        <Text style={styles.badgeText}>3</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Hide the default header */}
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Custom header with avatar */}
      <HeaderWithAvatar 
        title="CircohBack" 
        showAvatar={true}
        userName={userName}
        avatarUri={avatarUri}
        rightActions={renderRightActions()}
        onAvatarPress={handleAvatarPress}
      />
      
      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Welcome back, {userName.split(' ')[0]}</Text>
          <Text style={styles.sectionSubtitle}>Keep your connections strong!</Text>
          
          {/* Sample card content */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Daily Connections</Text>
              <Icon name="people" size={20} color={COLORS.PRIMARY} />
            </View>
            <Text style={styles.cardText}>
              You have 3 people to connect with today.
            </Text>
            <TouchableOpacity style={styles.cardButton}>
              <Text style={styles.cardButtonText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Upcoming Reminders</Text>
              <Icon name="calendar" size={20} color={COLORS.SECONDARY} />
            </View>
            <Text style={styles.cardText}>
              2 connection reminders scheduled for this week.
            </Text>
            <TouchableOpacity style={styles.cardButton}>
              <Text style={styles.cardButtonText}>Manage Reminders</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: SPACING.MEDIUM,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.XL,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.TINY,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.LARGE,
  },
  card: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  cardTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
  },
  cardText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MEDIUM,
  },
  cardButton: {
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
    paddingVertical: SPACING.TINY,
    paddingHorizontal: 0,
  },
  cardButtonText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.PRIMARY,
  },
  iconButton: {
    padding: SPACING.TINY,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: COLORS.ACCENT,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontFamily: FONT_FAMILIES.BOLD,
  },
}); 