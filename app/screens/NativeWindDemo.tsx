import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

// Standard React Native component demo instead of NativeWind
const NativeWindDemo = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Component Demo</Text>
        <Text style={styles.headerSubtitle}>
          A showcase of styled components using React Native StyleSheet
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Section: Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cards</Text>
          
          <View style={styles.cardContainer}>
            {/* Default Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Default Card</Text>
                <Text style={styles.cardSubtitle}>This is a simple card with default styling</Text>
              </View>
              <Text style={styles.cardContent}>
                This is the content of the card. You can put any components here.
              </Text>
            </View>
            
            {/* Elevated Card */}
            <View style={styles.cardElevated}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Elevated Card</Text>
                <Text style={styles.cardSubtitle}>This card has a shadow effect</Text>
              </View>
              <Text style={styles.cardContent}>
                This card has an elevated appearance with a shadow and includes a footer with actions.
              </Text>
              <View style={styles.cardFooter}>
                <TouchableOpacity 
                  style={styles.buttonPrimary}
                  onPress={() => console.log('Card action pressed')}
                >
                  <Text style={styles.buttonText}>Action</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Bordered Card */}
            <View style={styles.cardBordered}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Bordered Card</Text>
                <Text style={styles.cardSubtitle}>This card has a visible border</Text>
              </View>
              <Text style={styles.cardContent}>
                This card has a visible border around it for better definition.
              </Text>
            </View>
            
            {/* Clickable Card */}
            <TouchableOpacity 
              style={styles.cardElevated}
              onPress={() => console.log('Card pressed')}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Clickable Card</Text>
                <Text style={styles.cardSubtitle}>This entire card is clickable</Text>
              </View>
              <View style={styles.clickableCardContent}>
                <Text style={styles.cardContent}>Tap anywhere on this card</Text>
                <Feather name="chevron-right" size={20} color="#B0B0B0" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Section: Button Variants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Button Variants</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.buttonPrimary}
              onPress={() => console.log('Primary button pressed')}
            >
              <Text style={styles.buttonText}>Primary Button</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.buttonSecondary}
              onPress={() => console.log('Secondary button pressed')}
            >
              <Text style={styles.buttonTextDark}>Secondary Button</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.buttonOutline}
              onPress={() => console.log('Outline button pressed')}
            >
              <Text style={styles.buttonTextLight}>Outline Button</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.buttonDanger}
              onPress={() => console.log('Danger button pressed')}
            >
              <Text style={styles.buttonText}>Danger Button</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  cardContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardElevated: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardBordered: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#32FFA5',
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  cardContent: {
    color: '#FFFFFF',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  clickableCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    gap: 16,
  },
  buttonPrimary: {
    backgroundColor: '#32FFA5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  buttonSecondary: {
    backgroundColor: '#BE93FD',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  buttonDanger: {
    backgroundColor: '#FF93B9',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#121212',
    fontWeight: '500',
  },
  buttonTextDark: {
    color: '#121212',
    fontWeight: '500',
  },
  buttonTextLight: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default NativeWindDemo; 