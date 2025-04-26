import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, SPACING, FONT_FAMILIES } from '../../core/constants/theme';

interface AvatarProps {
  size?: number;
  name?: string;
  source?: { uri: string } | null;
}

const Avatar: React.FC<AvatarProps> = ({ size = 40, name = "", source }) => {
  const getInitials = (name: string) => {
    if (!name) return '?';
    
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0]?.toUpperCase() || '?';
  };

  const initials = getInitials(name);
  
  const sizeStyles = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (source?.uri) {
    return (
      <Image
        source={source}
        style={[styles.image, sizeStyles]}
        contentFit="cover"
      />
    );
  }

  return (
    <View style={[styles.container, sizeStyles]}>
      <Text 
        style={[
          styles.initials,
          { fontSize: size * 0.4 }
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    backgroundColor: COLORS.GRAY_DARK,
  },
  initials: {
    color: COLORS.BACKGROUND,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    fontWeight: '600',
  },
});

export default Avatar; 