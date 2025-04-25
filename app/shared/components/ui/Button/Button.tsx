import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  DimensionValue,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../../core/constants/theme';

// Button variants
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

// Button sizes
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  onPress,
  ...props
}) => {
  // Determine button background color based on variant
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return COLORS.PRIMARY;
      case 'secondary':
        return COLORS.SECONDARY;
      case 'danger':
        return COLORS.ERROR;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return COLORS.PRIMARY;
    }
  };

  // Determine button text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return COLORS.WHITE;
      case 'outline':
      case 'ghost':
        return COLORS.TEXT;
      default:
        return COLORS.WHITE;
    }
  };

  // Determine button border style based on variant
  const getBorderStyle = () => {
    switch (variant) {
      case 'outline':
        return {
          borderWidth: 1,
          borderColor: COLORS.BORDER,
        };
      default:
        return {};
    }
  };

  // Determine button padding based on size
  const getPadding = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: SPACING.TINY,
          paddingHorizontal: SPACING.SMALL,
        };
      case 'medium':
        return {
          paddingVertical: SPACING.SMALL,
          paddingHorizontal: SPACING.MEDIUM,
        };
      case 'large':
        return {
          paddingVertical: SPACING.MEDIUM,
          paddingHorizontal: SPACING.LARGE,
        };
      default:
        return {
          paddingVertical: SPACING.SMALL,
          paddingHorizontal: SPACING.MEDIUM,
        };
    }
  };

  // Determine text font size based on button size
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  // Create a type-safe style object
  const dynamicStyles: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    opacity: isDisabled ? 0.6 : 1,
    ...getPadding(),
    ...getBorderStyle(),
  };
  
  // Add width property conditionally with correct type
  if (fullWidth) {
    dynamicStyles.width = '100%' as DimensionValue;
  }

  // Combined style for button
  const buttonStyles = [
    styles.button,
    dynamicStyles,
    style,
  ];

  // Combined style for text
  const buttonTextStyles = [
    styles.text,
    {
      color: getTextColor(),
      fontSize: getTextSize(),
    },
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled || isLoading}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.contentContainer}>
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' || variant === 'ghost' ? COLORS.PRIMARY : COLORS.WHITE}
          />
        ) : (
          <>
            {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
            <Text style={buttonTextStyles}>{children}</Text>
            {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: SPACING.SMALL,
  },
  rightIcon: {
    marginLeft: SPACING.SMALL,
  },
});

export default Button; 