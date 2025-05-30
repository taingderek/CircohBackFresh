import React, { useEffect } from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  ViewStyle, 
  StyleProp, 
  View,
  ViewProps
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

interface AnimatedCardProps extends ViewProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  elevation?: 'none' | 'low' | 'medium' | 'high';
  glowColor?: string;
  glowOnPress?: boolean;
  animateOnMount?: boolean;
  animationType?: 'fade' | 'scale' | 'slide';
  delayMs?: number;
  children: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  onPress,
  style,
  elevation = 'medium',
  glowColor = '#32FFA5',
  glowOnPress = false,
  animateOnMount = false,
  animationType = 'fade',
  delayMs = 0,
  children,
  ...rest
}) => {
  // Animation values
  const scale = useSharedValue(animateOnMount ? 0.9 : 1);
  const translateY = useSharedValue(animateOnMount && animationType === 'slide' ? 20 : 0);
  const opacity = useSharedValue(animateOnMount ? 0 : 1);
  const glowOpacity = useSharedValue(0);
  
  useEffect(() => {
    if (animateOnMount) {
      setTimeout(() => {
        opacity.value = withTiming(1, { duration: 400 });
        scale.value = withSpring(1, { damping: 12, stiffness: 100 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      }, delayMs);
    }
  }, []);
  
  // Handle press animation
  const handlePressIn = () => {
    if (!onPress) return;
    
    scale.value = withSpring(0.98, { damping: 10, stiffness: 300 });
    if (glowOnPress) {
      glowOpacity.value = withTiming(0.3, { duration: 200 });
    }
  };
  
  const handlePressOut = () => {
    if (!onPress) return;
    
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    if (glowOnPress) {
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  };
  
  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => {
    const elevation = interpolate(
      scale.value,
      [0.97, 1],
      [2, 8],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
      opacity: opacity.value,
      elevation,
    };
  });
  
  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });
  
  // Determine shadow style based on elevation prop
  const getShadowStyle = () => {
    switch(elevation) {
      case 'none':
        return {};
      case 'low':
        return styles.shadowLow;
      case 'high':
        return styles.shadowHigh;
      case 'medium':
      default:
        return styles.shadowMedium;
    }
  };
  
  // Render card with or without touchable behavior
  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, getShadowStyle(), cardAnimatedStyle, style]}
        activeOpacity={0.95}
        {...rest}
      >
        {glowOnPress && (
          <Animated.View 
            style={[
              styles.glow, 
              { backgroundColor: glowColor }, 
              glowAnimatedStyle
            ]} 
          />
        )}
        {children}
      </AnimatedPressable>
    );
  }
  
  return (
    <AnimatedView
      style={[styles.card, getShadowStyle(), cardAnimatedStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  shadowLow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  shadowHigh: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  glow: {
    position: 'absolute',
    top: -30,
    left: -30,
    right: -30,
    bottom: -30,
    borderRadius: 24,
    opacity: 0,
  },
});

export default AnimatedCard; 