import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';
import { COLORS, SPACING } from '../core/constants/theme';
import HeaderWithAvatar from '../components/navigation/HeaderWithAvatar';
import Icon from '../components/common/Icon';

/**
 * Example 1: Basic usage with avatar and notification icon
 */
export function BasicHeaderExample() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <HeaderWithAvatar 
        title="CircohBack" 
        userName="John Doe"
        avatarUri="https://randomuser.me/api/portraits/men/32.jpg"
        rightActions={
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="notifications-outline" size={24} color={COLORS.TEXT} />
          </TouchableOpacity>
        }
      />
      
      <View style={styles.content}>
        <Text style={styles.text}>Main content goes here</Text>
      </View>
    </View>
  );
}

/**
 * Example 2: With back button and custom action buttons
 */
export function DetailHeaderExample() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <HeaderWithAvatar 
        title="Contact Details" 
        showBackButton={true}
        showAvatar={false}
        rightActions={
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="create-outline" size={24} color={COLORS.TEXT} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="ellipsis-vertical" size={24} color={COLORS.TEXT} />
            </TouchableOpacity>
          </View>
        }
      />
      
      <View style={styles.content}>
        <Text style={styles.text}>Contact details content goes here</Text>
      </View>
    </View>
  );
}

/**
 * Example 3: With action button in right actions
 */
export function ActionHeaderExample() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <HeaderWithAvatar 
        title="New Contact" 
        showBackButton={true}
        showAvatar={true}
        userName="Jane Smith"
        rightActions={
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Save</Text>
          </TouchableOpacity>
        }
      />
      
      <View style={styles.content}>
        <Text style={styles.text}>New contact form goes here</Text>
      </View>
    </View>
  );
}

// Shared styles for all examples
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
  },
  text: {
    color: COLORS.TEXT,
    fontSize: 16,
  },
  iconButton: {
    padding: SPACING.SMALL,
  },
  actionContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.TINY,
    borderRadius: 16,
  },
  actionButtonText: {
    color: COLORS.BACKGROUND,
    fontWeight: '600',
  },
});

// Default export for expo-router
export default BasicHeaderExample; 