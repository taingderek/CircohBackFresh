import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface CardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'bordered';
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
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
  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return 'bg-background-card';
      case 'elevated':
        return 'bg-background-card shadow-elevated';
      case 'bordered':
        return 'bg-background-card border border-border';
      default:
        return 'bg-background-card';
    }
  };

  const cardClasses = `
    rounded-lg overflow-hidden
    ${getVariantStyles()}
    ${className}
  `;

  const CardComponent = onPress ? StyledTouchableOpacity : StyledView;

  return (
    <CardComponent 
      className={cardClasses}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {/* Card Header (if title or subtitle exists) */}
      {(title || subtitle) && (
        <StyledView className="p-4 border-b border-border">
          {title && (
            <StyledText className={`text-base font-medium text-text ${titleClassName}`}>
              {title}
            </StyledText>
          )}
          {subtitle && (
            <StyledText className={`text-sm text-text-secondary mt-1 ${subtitleClassName}`}>
              {subtitle}
            </StyledText>
          )}
        </StyledView>
      )}
      
      {/* Card Content */}
      <StyledView className={`p-4 ${contentClassName}`}>
        {children}
      </StyledView>
      
      {/* Card Footer */}
      {footer && (
        <StyledView className={`p-4 pt-2 border-t border-border ${footerClassName}`}>
          {footer}
        </StyledView>
      )}
    </CardComponent>
  );
};

export default NativeWindCard; 