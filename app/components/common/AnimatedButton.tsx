import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withDelay 
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface AnimatedButtonProps {
  onPress: () => void;
  text: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
  activeGlow?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  text,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  activeGlow = false,
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(activeGlow ? 0.5 : 0);
  
  // Handle press animation
  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 400 });
    if (variant === 'primary') {
      glowOpacity.value = withSpring(0.8, { damping: 10 });
    }
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    if (variant === 'primary' && !activeGlow) {
      glowOpacity.value = withSpring(0, { damping: 10 });
    } else if (activeGlow) {
      glowOpacity.value = withSequence(
        withSpring(0.8, { damping: 10 }),
        withDelay(100, withSpring(0.5, { damping: 15 }))
      );
    }
  };
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });
  
  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });
  
  // Get button styles based on variant and size
  const getButtonStyles = () => {
    const buttonStyles: StyleProp<ViewStyle>[] = [styles.button];
    
    // Size
    switch (size) {
      case 'small':
        buttonStyles.push(styles.buttonSmall);
        break;
      case 'large':
        buttonStyles.push(styles.buttonLarge);
        break;
      default:
        buttonStyles.push(styles.buttonMedium);
    }
    
    // Variant
    switch (variant) {
      case 'primary':
        buttonStyles.push(styles.buttonPrimary);
        break;
      case 'secondary':
        buttonStyles.push(styles.buttonSecondary);
        break;
      case 'tertiary':
        buttonStyles.push(styles.buttonTertiary);
        break;
      case 'outline':
        buttonStyles.push(styles.buttonOutline);
        break;
      case 'ghost':
        buttonStyles.push(styles.buttonGhost);
        break;
    }
    
    // Disabled
    if (disabled) {
      buttonStyles.push(styles.buttonDisabled);
    }
    
    // Full width
    if (fullWidth) {
      buttonStyles.push(styles.buttonFullWidth);
    }
    
    return buttonStyles;
  };
  
  // Get text styles based on variant and size
  const getTextStyles = () => {
    const textStyles: StyleProp<TextStyle>[] = [styles.text];
    
    // Size
    switch (size) {
      case 'small':
        textStyles.push(styles.textSmall);
        break;
      case 'large':
        textStyles.push(styles.textLarge);
        break;
      default:
        textStyles.push(styles.textMedium);
    }
    
    // Variant
    switch (variant) {
      case 'primary':
        textStyles.push(styles.textPrimary);
        break;
      case 'secondary':
        textStyles.push(styles.textSecondary);
        break;
      case 'tertiary':
        textStyles.push(styles.textTertiary);
        break;
      case 'outline':
        textStyles.push(styles.textOutline);
        break;
      case 'ghost':
        textStyles.push(styles.textGhost);
        break;
    }
    
    // Disabled
    if (disabled) {
      textStyles.push(styles.textDisabled);
    }
    
    return textStyles;
  };
  
  // Get icon color based on variant
  const getIconColor = () => {
    if (disabled) return '#707070';
    
    switch (variant) {
      case 'primary':
        return '#121212';
      case 'secondary':
      case 'tertiary':
        return '#FFFFFF';
      case 'outline':
        return '#32FFA5';
      case 'ghost':
        return '#32FFA5';
      default:
        return '#FFFFFF';
    }
  };
  
  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[getButtonStyles(), animatedStyle, style]}
      activeOpacity={0.8}
    >
      {variant === 'primary' && (
        <Animated.View style={[styles.glow, glowStyle]} />
      )}
      
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#121212' : '#32FFA5'} 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Feather 
              name={icon as any} 
              size={size === 'small' ? 14 : size === 'large' ? 20 : 16} 
              color={getIconColor()}
              style={styles.iconLeft} 
            />
          )}
          
          <Text style={[getTextStyles(), textStyle]}>
            {text}
          </Text>
          
          {icon && iconPosition === 'right' && (
            <Feather 
              name={icon as any} 
              size={size === 'small' ? 14 : size === 'large' ? 20 : 16} 
              color={getIconColor()}
              style={styles.iconRight} 
            />
          )}
        </>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 80,
  },
  buttonMedium: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 120,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minWidth: 150,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonPrimary: {
    backgroundColor: '#32FFA5',
  },
  buttonSecondary: {
    backgroundColor: '#BE93FD',
  },
  buttonTertiary: {
    backgroundColor: '#FF93B9',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#32FFA5',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    backgroundColor: '#2A2A2A',
    borderColor: '#3A3A3A',
  },
  text: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
  textPrimary: {
    color: '#121212',
  },
  textSecondary: {
    color: '#FFFFFF',
  },
  textTertiary: {
    color: '#FFFFFF',
  },
  textOutline: {
    color: '#32FFA5',
  },
  textGhost: {
    color: '#32FFA5',
  },
  textDisabled: {
    color: '#707070',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  glow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: '#32FFA5',
    borderRadius: 30,
    opacity: 0,
  },
});

export default AnimatedButton; 