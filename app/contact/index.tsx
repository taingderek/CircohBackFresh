import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { COLORS, SPACING } from '../core/constants/theme';
import HeaderWithAvatar from '../components/navigation/HeaderWithAvatar';
import Icon from '../components/common/Icon';

export default function ContactsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <HeaderWithAvatar 
        title="Contacts" 
        showBackButton={true}
        showAvatar={true}
        userName="John Doe"
        avatarUri="https://randomuser.me/api/portraits/men/32.jpg"
        rightActions={
          <TouchableOpacity style={styles.addButton}>
            <Icon name="add" size={24} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Contacts list will appear here</Text>
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
    padding: SPACING.MEDIUM,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    padding: SPACING.LARGE,
    marginTop: SPACING.LARGE,
  },
  placeholderText: {
    color: COLORS.TEXT_SECONDARY || COLORS.GRAY_LIGHT,
    textAlign: 'center',
  },
  addButton: {
    padding: SPACING.TINY,
  },
}); 