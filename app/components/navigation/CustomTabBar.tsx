import React, { useCallback, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '@/app/core/constants/theme';
import { TabParamList } from '@/app/navigation/MainNavigator';
import { ParamListBase } from '@react-navigation/native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Adjusted Tab Icons and Names for CircohBack
const TAB_CONFIG: Record<keyof TabParamList, {
  label: string;
  activeIcon: IconName;
  inactiveIcon: IconName;
  accessibilityLabel: string;
}> = {
  home: {
    label: 'Home',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
    accessibilityLabel: 'Home tab',
  },
  contacts: {
    label: 'Contacts',
    activeIcon: 'people',
    inactiveIcon: 'people-outline',
    accessibilityLabel: 'Contacts tab',
  },
  'daily-swipe': {
    label: 'Daily Swipe',
    activeIcon: 'layers',
    inactiveIcon: 'layers-outline',
    accessibilityLabel: 'Daily Swipe tab',
  },
  messages: {
    label: 'Messages',
    activeIcon: 'chatbubbles',
    inactiveIcon: 'chatbubble-outline', 
    accessibilityLabel: 'Messages tab',
  },
  profile: {
    label: 'Profile',
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
    accessibilityLabel: 'Profile tab',
  },
};

// Tab key type
type TabKey = keyof typeof TAB_CONFIG;

/**
 * Custom Tab Bar component for CircohBack
 * Implements a bottom tab navigation with a prominent center button
 */
const CustomTabBar = React.memo(({ 
  state, 
  descriptors, 
  navigation 
}: BottomTabBarProps) => {
  // Get safe area insets for proper padding
  const insets = useSafeAreaInsets();
  
  // Render a single tab item
  const renderTabItem = useCallback((route: any, index: number) => {
    const key = route.name as TabKey;
    const { options } = descriptors[route.key];
    const isFocused = state.index === index;
    
    // Check if the tab configuration exists
    if (!TAB_CONFIG[key]) {
      console.warn(`Tab configuration missing for ${key}`);
      return null;
    }
    
    // Tab press handler
    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      // Provide haptic feedback on press
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      if (!isFocused && !event.defaultPrevented) {
        // Type safe navigation
        navigation.navigate(key);
      }
    };
    
    // For long press - optional feature
    const onLongPress = () => {
      navigation.emit({
        type: 'tabLongPress',
        target: route.key,
      });
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    };
    
    // Shared animation value for scale
    const scale = useSharedValue(1);
    
    // Animate tab on press
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });
    
    // Handle press in and press out animations
    const handlePressIn = () => {
      scale.value = withTiming(0.95, {
        duration: 100,
        easing: Easing.inOut(Easing.quad),
      });
    };
    
    const handlePressOut = () => {
      scale.value = withTiming(1, {
        duration: 100,
        easing: Easing.inOut(Easing.quad),
      });
    };
    
    // Center tab (Daily Swipe)
    if (key === 'daily-swipe') {
      return (
        <Animated.View 
          key={route.key} 
          style={[styles.centerTabContainer, animatedStyle]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel={TAB_CONFIG[key].accessibilityLabel}
            accessibilityState={{ selected: isFocused }}
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.centerTabButton}
          >
            <LinearGradient
              colors={isFocused ? 
                [COLORS.PRIMARY, COLORS.PRIMARY_LIGHT] : 
                [COLORS.PRIMARY, COLORS.PRIMARY]
              }
              style={styles.centerTabGradient}
            >
              <Ionicons
                name="layers"
                size={28}
                color={COLORS.BACKGROUND}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      );
    }
    
    // Regular tabs
    return (
      <Animated.View 
        key={route.key} 
        style={[styles.tabItemContainer, animatedStyle]}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={TAB_CONFIG[key].accessibilityLabel}
          accessibilityState={{ selected: isFocused }}
          onPress={onPress}
          onLongPress={onLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.tabButton}
        >
          <Ionicons
            name={isFocused ? TAB_CONFIG[key].activeIcon : TAB_CONFIG[key].inactiveIcon}
            size={24}
            color={isFocused ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
          />
          <Text style={[
            styles.tabLabel,
            { color: isFocused ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY }
          ]}>
            {TAB_CONFIG[key].label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [descriptors, navigation, state.index]);

  // Compute tab bar container style with safe area insets
  const containerStyle = useMemo<StyleProp<ViewStyle>>(() => ({
    ...styles.container,
    paddingBottom: Math.max(insets.bottom, 4),
  }), [insets.bottom]);

  return (
    <View style={containerStyle}>
      {state.routes.map(renderTabItem)}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: COLORS.CARD, // Secondary color from specs (#1E1E1E)
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER, // Border color (#3A3A3A)
    paddingHorizontal: 8,
  },
  tabItemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerTabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButton: {
    padding: SPACING.TINY, // 4px
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44, // Accessibility minimum touch target size
    minHeight: 44, // Accessibility minimum touch target size
  },
  centerTabButton: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44, // Accessibility minimum touch target size
    minHeight: 44, // Accessibility minimum touch target size
  },
  centerTabGradient: {
    width: 56, // Diameter: 56px
    height: 56, // Diameter: 56px
    borderRadius: 28, // Half of diameter for circle
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow styling for center button
    ...Platform.select({
      ios: {
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
    position: 'absolute',
    bottom: 8, // Position center tab appropriately to extend above tab bar
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'MontserratMedium',
  },
});

export default CustomTabBar; 