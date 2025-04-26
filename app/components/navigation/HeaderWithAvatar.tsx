import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, SPACING, FONT_FAMILIES } from '../../core/constants/theme';
import Icon from '../common/Icon';
import Avatar from '../common/Avatar';

interface HeaderWithAvatarProps {
  title: string;
  avatarUri?: string;
  userName?: string;
  showAvatar?: boolean;
  showBackButton?: boolean;
  rightActions?: React.ReactNode;
  onAvatarPress?: () => void;
}

const HeaderWithAvatar: React.FC<HeaderWithAvatarProps> = ({
  title,
  avatarUri,
  userName = '',
  showAvatar = true,
  showBackButton = false,
  rightActions,
  onAvatarPress,
}) => {
  const handleAvatarPress = () => {
    if (onAvatarPress) {
      onAvatarPress();
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          {showBackButton && (
            <Link href="../" asChild>
              <TouchableOpacity style={styles.backButton}>
                <Icon name="chevron-left" size={24} color={COLORS.TEXT} />
              </TouchableOpacity>
            </Link>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>
        
        <View style={styles.rightContainer}>
          {rightActions}
          {showAvatar && (
            onAvatarPress ? (
              <TouchableOpacity onPress={handleAvatarPress}>
                <Avatar 
                  size={36}
                  name={userName}
                  source={avatarUri ? { uri: avatarUri } : null}
                />
              </TouchableOpacity>
            ) : (
              <Link href="/profile" asChild>
                <TouchableOpacity>
                  <Avatar 
                    size={36}
                    name={userName}
                    source={avatarUri ? { uri: avatarUri } : null}
                  />
                </TouchableOpacity>
              </Link>
            )
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.BACKGROUND,
  },
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SMALL,
  },
  backButton: {
    marginRight: SPACING.SMALL,
  },
  title: {
    fontSize: FONT_SIZES.LARGE,
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontWeight: '500',
  },
});

export default HeaderWithAvatar; 