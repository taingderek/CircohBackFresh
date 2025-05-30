import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { differenceInDays, differenceInHours } from 'date-fns';

interface ContactStreakIndicatorProps {
  streakCount: number;
  status: 'active' | 'at_risk' | 'broken';
  gracePeriodEnds?: string;
  style?: any;
}

const ContactStreakIndicator: React.FC<ContactStreakIndicatorProps> = ({
  streakCount,
  status,
  gracePeriodEnds,
  style
}) => {
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  
  // Start animations when component mounts
  useEffect(() => {
    if (status === 'at_risk') {
      // Start pulse animation for at-risk streaks
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();
      
      // Blink for critical (less than 24h left)
      if (isUrgent()) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.5,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })
          ])
        ).start();
      }
    }
    
    return () => {
      // Clean up animations
      pulseAnim.stopAnimation();
      opacityAnim.stopAnimation();
    };
  }, [status, gracePeriodEnds]);
  
  // Determine if streak is about to break (less than 24h)
  const isUrgent = (): boolean => {
    if (!gracePeriodEnds) return false;
    
    const now = new Date();
    const gracePeriod = new Date(gracePeriodEnds);
    const hoursLeft = differenceInHours(gracePeriod, now);
    
    return hoursLeft < 24 && hoursLeft > 0;
  };
  
  // Get time left string
  const getTimeLeftString = (): string => {
    if (!gracePeriodEnds) return '';
    
    const now = new Date();
    const gracePeriod = new Date(gracePeriodEnds);
    
    if (now > gracePeriod) {
      return 'Streak broken';
    }
    
    const daysLeft = differenceInDays(gracePeriod, now);
    const hoursLeft = differenceInHours(gracePeriod, now) % 24;
    
    if (daysLeft > 0) {
      return `${daysLeft}d left`;
    } else {
      return `${hoursLeft}h left`;
    }
  };
  
  // Get container style based on status
  const getContainerStyle = () => {
    switch (status) {
      case 'active':
        return styles.activeContainer;
      case 'at_risk':
        return styles.atRiskContainer;
      case 'broken':
        return styles.brokenContainer;
      default:
        return styles.activeContainer;
    }
  };
  
  // Get number style based on status
  const getNumberStyle = () => {
    switch (status) {
      case 'active':
        return styles.activeNumber;
      case 'at_risk':
        return styles.atRiskNumber;
      case 'broken':
        return styles.brokenNumber;
      default:
        return styles.activeNumber;
    }
  };
  
  // Get icon based on status
  const getIcon = () => {
    switch (status) {
      case 'active':
        return <Ionicons name="flame" size={14} color={colors.accentMint} />;
      case 'at_risk':
        return <Ionicons name="warning" size={14} color={isUrgent() ? colors.accentPink : colors.warning} />;
      case 'broken':
        return <Ionicons name="close-circle" size={14} color={colors.error} />;
      default:
        return null;
    }
  };
  
  return (
    <Animated.View
      style={[
        styles.container,
        getContainerStyle(),
        style,
        { 
          transform: [{ scale: status === 'at_risk' ? pulseAnim : 1 }],
          opacity: status === 'at_risk' && isUrgent() ? opacityAnim : 1
        }
      ]}
    >
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      
      <Text style={[styles.number, getNumberStyle()]}>
        {streakCount}
      </Text>
      
      <Text style={styles.label}>days</Text>
      
      {status === 'at_risk' && gracePeriodEnds && (
        <Text style={[
          styles.timeLeft,
          isUrgent() && styles.urgent
        ]}>
          {getTimeLeftString()}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    minWidth: 70,
  },
  activeContainer: {
    backgroundColor: `${colors.accentMint}10`, // 10% opacity
  },
  atRiskContainer: {
    backgroundColor: `${colors.warning}10`,
  },
  brokenContainer: {
    backgroundColor: `${colors.error}10`,
  },
  iconContainer: {
    marginBottom: 4,
  },
  number: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  activeNumber: {
    color: colors.accentMint,
  },
  atRiskNumber: {
    color: colors.warning,
  },
  brokenNumber: {
    color: colors.error,
  },
  label: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  timeLeft: {
    fontSize: 10,
    color: colors.warning,
    marginTop: 4,
  },
  urgent: {
    color: colors.accentPink,
    fontWeight: 'bold',
  },
});

export default ContactStreakIndicator; 