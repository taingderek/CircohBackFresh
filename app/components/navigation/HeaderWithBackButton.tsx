import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES } from '@/app/core/constants/theme';
import Icon from '@/app/components/common/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderWithBackButtonProps {
  title: string;
  onBackPress: () => void;
  rightActions?: React.ReactNode;
}

const HeaderWithBackButton = ({ 
  title, 
  onBackPress,
  rightActions 
}: HeaderWithBackButtonProps) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View 
      style={[
        styles.container,
        { paddingTop: insets.top + SPACING.SMALL }
      ]}
    >
      <TouchableOpacity 
        style={styles.backButton}
        onPress={onBackPress}
      >
        <Icon name="chevron-back-outline" size={24} color={COLORS.TEXT} />
      </TouchableOpacity>
      
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      
      <View style={styles.rightActionsContainer}>
        {rightActions}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MEDIUM,
    paddingBottom: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    padding: SPACING.SMALL,
    marginRight: SPACING.SMALL,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  rightActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44, // Ensure proper spacing even if no right actions
  },
});

export default HeaderWithBackButton; 