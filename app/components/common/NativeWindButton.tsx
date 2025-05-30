import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Use regular components instead of styled components
const StyledTouchableOpacity = TouchableOpacity;
const StyledText = Text;
const StyledView = View;

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string; // Kept for compatibility
  textClassName?: string; // Kept for compatibility
}

const NativeWindButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  textClassName = '',
}) => {
  // Get button styles based on variant and size
  const getButtonStyle = (): ViewStyle => {
    const styles: ViewStyle[] = [];
    
    // Base style
    styles.push({
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
    });
    
    // Variant style
    switch (variant) {
      case 'primary':
        styles.push({ backgroundColor: '#32FFA5' });
        break;
      case 'secondary':
        styles.push({ backgroundColor: '#BE93FD' });
        break;
      case 'outline':
        styles.push({ 
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: '#32FFA5'
        });
        break;
      case 'danger':
        styles.push({ backgroundColor: '#FF6B6B' });
        break;
    }
    
    // Size style
    switch (size) {
      case 'small':
        styles.push({
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 4,
        });
        break;
      case 'medium':
        styles.push({
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 8,
        });
        break;
      case 'large':
        styles.push({
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
        });
        break;
    }
    
    // Conditional styles
    if (disabled) {
      styles.push({ opacity: 0.5 });
    }
    
    if (fullWidth) {
      styles.push({ width: '100%' });
    }
    
    // Merge all styles into one object
    return Object.assign({}, ...styles);
  };

  // Get text styles based on variant and size
  const getTextStyle = (): TextStyle => {
    const styles: TextStyle[] = [];
    
    // Base style
    styles.push({ fontWeight: '500' });
    
    // Variant style
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        styles.push({ color: '#121212' });
        break;
      case 'outline':
        styles.push({ color: '#32FFA5' });
        break;
    }
    
    // Size style
    switch (size) {
      case 'small':
        styles.push({ fontSize: 12 });
        break;
      case 'medium':
        styles.push({ fontSize: 14 });
        break;
      case 'large':
        styles.push({ fontSize: 16 });
        break;
    }
    
    // Merge all styles into one object
    return Object.assign({}, ...styles);
  };

  // Handle press
  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  return (
    <StyledTouchableOpacity 
      style={getButtonStyle()}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? '#32FFA5' : '#121212'} 
        />
      ) : (
        <StyledView style={styles.contentContainer}>
          {leftIcon && <StyledView style={styles.iconLeft}>{leftIcon}</StyledView>}
          <StyledText style={getTextStyle()}>{title}</StyledText>
          {rightIcon && <StyledView style={styles.iconRight}>{rightIcon}</StyledView>}
        </StyledView>
      )}
    </StyledTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default NativeWindButton; 