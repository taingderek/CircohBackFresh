import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES } from '@/app/core/constants/theme';

interface ImprovedLoadingScreenProps {
  loadingText?: string;
  timeoutDuration?: number;
}

export const ImprovedLoadingScreen: React.FC<ImprovedLoadingScreenProps> = ({ 
  loadingText = 'CircohBack loading',
  timeoutDuration = 10000, // 10 seconds default
}) => {
  const [dots, setDots] = useState('');
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  
  // Animate loading dots
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);
    
    // Show timeout message if loading takes too long
    const timeoutTimer = setTimeout(() => {
      setShowTimeoutMessage(true);
    }, timeoutDuration);
    
    return () => {
      clearInterval(dotsInterval);
      clearTimeout(timeoutTimer);
    };
  }, [timeoutDuration]);
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      <Text style={styles.loadingText}>{loadingText}{dots}</Text>
      
      {showTimeoutMessage && (
        <Text style={styles.timeoutText}>
          Taking longer than expected. Please check your connection.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    marginTop: SPACING.MEDIUM,
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT,
  },
  timeoutText: {
    marginTop: SPACING.LARGE,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.SECONDARY,
    textAlign: 'center',
    paddingHorizontal: SPACING.LARGE,
  },
});

export default ImprovedLoadingScreen; 