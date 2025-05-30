import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing
} from 'react-native';
import { colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface StreakCounterProps {
  count: number;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const StreakCounter: React.FC<StreakCounterProps> = ({
  count,
  onPress,
  size = 'medium',
  showLabel = true
}) => {
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Set up animations
  useEffect(() => {
    // Pulse animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();
    
    // Rotate animation (when count changes)
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.elastic(1.2),
      useNativeDriver: true
    }).start();
    
    // Reset rotation for next animation
    return () => {
      rotateAnim.setValue(0);
    };
  }, [count, pulseAnim, rotateAnim]);
  
  // Interpolate rotation value for spin effect
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // Get size based on prop
  const getSize = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: 60, height: 60 },
          circle: { width: 50, height: 50, borderRadius: 25 },
          innerCircle: { width: 44, height: 44, borderRadius: 22 },
          text: { fontSize: 18 },
          icon: 18
        };
      case 'large':
        return {
          container: { width: 110, height: 110 },
          circle: { width: 100, height: 100, borderRadius: 50 },
          innerCircle: { width: 88, height: 88, borderRadius: 44 },
          text: { fontSize: 36 },
          icon: 30
        };
      default: // medium
        return {
          container: { width: 80, height: 80 },
          circle: { width: 70, height: 70, borderRadius: 35 },
          innerCircle: { width: 62, height: 62, borderRadius: 31 },
          text: { fontSize: 24 },
          icon: 22
        };
    }
  };
  
  const sizeStyles = getSize();
  
  return (
    <TouchableOpacity 
      style={[styles.container, sizeStyles.container]} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <Animated.View 
        style={[
          styles.circle,
          sizeStyles.circle,
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <View style={[styles.innerCircle, sizeStyles.innerCircle]}>
          <Animated.Text 
            style={[
              styles.streakCount, 
              sizeStyles.text,
              { transform: [{ rotate: spin }] }
            ]}
          >
            {count}
          </Animated.Text>
          
          <Animated.View 
            style={[
              styles.iconContainer, 
              { transform: [{ rotate: spin }] }
            ]}
          >
            <Ionicons 
              name="flame" 
              size={sizeStyles.icon} 
              color={colors.accentMint} 
            />
          </Animated.View>
        </View>
      </Animated.View>
      
      {showLabel && (
        <Text style={styles.label}>
          {count === 1 ? 'day' : 'days'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    backgroundColor: colors.accentMint,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accentMint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  innerCircle: {
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  streakCount: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  iconContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  }
});

export default StreakCounter; 