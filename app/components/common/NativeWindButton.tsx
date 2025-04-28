import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { styled } from 'nativewind';

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);
const StyledView = styled(View);

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
  className?: string;
  textClassName?: string;
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
  // Get base styles based on variant
  const getBaseStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary active:bg-primary/90';
      case 'secondary':
        return 'bg-secondary active:bg-secondary/90';
      case 'outline':
        return 'bg-transparent border border-primary';
      case 'danger':
        return 'bg-error active:bg-error/90';
      default:
        return 'bg-primary active:bg-primary/90';
    }
  };

  // Get text styles based on variant
  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
        return 'text-background-dark';
      case 'secondary':
        return 'text-background-dark';
      case 'outline':
        return 'text-primary';
      case 'danger':
        return 'text-background-dark';
      default:
        return 'text-background-dark';
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-1.5 rounded-md';
      case 'medium':
        return 'px-4 py-2.5 rounded-lg';
      case 'large':
        return 'px-6 py-3 rounded-xl';
      default:
        return 'px-4 py-2.5 rounded-lg';
    }
  };

  // Get font size based on button size
  const getTextSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'medium':
        return 'text-sm';
      case 'large':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  // Handle press
  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const buttonClasses = `
    items-center justify-center
    ${getBaseStyles()} 
    ${getSizeStyles()}
    ${disabled ? 'opacity-50' : 'opacity-100'}
    ${fullWidth ? 'w-full' : 'w-auto'}
    ${className}
  `;

  const textClasses = `
    font-medium
    ${getTextStyles()}
    ${getTextSizeStyles()}
    ${textClassName}
  `;

  return (
    <StyledTouchableOpacity 
      className={buttonClasses}
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
        <StyledView className="flex-row items-center justify-center">
          {leftIcon && <StyledView className="mr-2">{leftIcon}</StyledView>}
          <StyledText className={textClasses}>{title}</StyledText>
          {rightIcon && <StyledView className="ml-2">{rightIcon}</StyledView>}
        </StyledView>
      )}
    </StyledTouchableOpacity>
  );
};

export default NativeWindButton; 