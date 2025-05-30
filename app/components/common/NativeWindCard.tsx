import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

// Use regular components instead of styled components
const StyledView = View;
const StyledText = Text;
const StyledTouchableOpacity = TouchableOpacity;

interface CardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'bordered';
  className?: string; // Kept for compatibility
  titleClassName?: string; // Kept for compatibility
  subtitleClassName?: string; // Kept for compatibility
  contentClassName?: string; // Kept for compatibility
  footerClassName?: string; // Kept for compatibility
}

const NativeWindCard: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  footer,
  onPress,
  variant = 'default',
  className = '',
  titleClassName = '',
  subtitleClassName = '',
  contentClassName = '',
  footerClassName = '',
}) => {
  // Get variant styles
  const getVariantStyle = (): ViewStyle => {
    // Base style
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: '#252525', // background-card
    };
    
    // Add variant-specific styles
    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        };
      case 'bordered':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: '#333333', // border
        };
      default:
        return baseStyle;
    }
  };

  const CardComponent = onPress ? StyledTouchableOpacity : StyledView;

  return (
    <CardComponent 
      style={getVariantStyle()}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {/* Card Header (if title or subtitle exists) */}
      {(title || subtitle) && (
        <StyledView style={styles.header}>
          {title && (
            <StyledText style={styles.title}>
              {title}
            </StyledText>
          )}
          {subtitle && (
            <StyledText style={styles.subtitle}>
              {subtitle}
            </StyledText>
          )}
        </StyledView>
      )}
      
      {/* Card Content */}
      <StyledView style={styles.content}>
        {children}
      </StyledView>
      
      {/* Card Footer */}
      {footer && (
        <StyledView style={styles.footer}>
          {footer}
        </StyledView>
      )}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333', // border
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF', // text
  },
  subtitle: {
    fontSize: 14,
    color: '#B0B0B0', // text-secondary
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  footer: {
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333333', // border
  },
});

export default NativeWindCard; 