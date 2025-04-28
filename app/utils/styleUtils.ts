import { styled } from 'nativewind';
import { Text, View, TouchableOpacity, ScrollView, TextInput, Image, FlatList } from 'react-native';

// Styled components with NativeWind
export const StyledView = styled(View);
export const StyledText = styled(Text);
export const StyledTouchableOpacity = styled(TouchableOpacity);
export const StyledScrollView = styled(ScrollView);
export const StyledTextInput = styled(TextInput);
export const StyledImage = styled(Image);
export const StyledFlatList = styled(FlatList);

// Helper for combining Tailwind classes
export const tw = (classNames: string) => classNames;

// Helper for conditional Tailwind classes
export const twMerge = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Helper for dynamic styles based on conditions
export const twConditional = (baseStyle: string, conditionalStyle: string, condition: boolean) => {
  return condition ? `${baseStyle} ${conditionalStyle}` : baseStyle;
}; 