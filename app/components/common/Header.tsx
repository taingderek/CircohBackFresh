import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type HeaderProps = {
  title: string;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
};

const Header: React.FC<HeaderProps> = ({ 
  title, 
  onBackPress, 
  rightComponent 
}) => {
  return (
    <View style={styles.container}>
      {onBackPress ? (
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBackPress}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholderView} />
      )}
      
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      
      {rightComponent ? (
        rightComponent
      ) : (
        <View style={styles.placeholderView} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  placeholderView: {
    width: 40,
  },
});

export default Header; 