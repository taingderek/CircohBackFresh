// Temporarily use regular React Native components instead of NativeWind
import { Text, View, TouchableOpacity, ScrollView, TextInput, Image, FlatList } from 'react-native';

// Regular components (not styled)
export const StyledView = View;
export const StyledText = Text;
export const StyledTouchableOpacity = TouchableOpacity;
export const StyledScrollView = ScrollView;
export const StyledTextInput = TextInput;
export const StyledImage = Image;
export const StyledFlatList = FlatList;

// Helper for combining Tailwind classes (now just returns empty strings for compatibility)
export const tw = (classNames: string) => '';

// Helper for conditional Tailwind classes
export const twMerge = (...classes: (string | boolean | undefined)[]) => {
  return '';
};

// Helper for dynamic styles based on conditions
export const twConditional = (baseStyle: string, conditionalStyle: string, condition: boolean) => {
  return '';
}; 