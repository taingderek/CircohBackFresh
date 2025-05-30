import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  shimmerColors?: string[];
  shimmerDuration?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  shimmerColors = ['#1E1E1E', '#2E2E2E', '#1E1E1E'],
  shimmerDuration = 1500,
}) => {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: shimmerDuration, easing: Easing.inOut(Easing.ease) }),
      -1, // Infinite repetitions
      true // Reverse animation
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerValue.value,
      [0, 1],
      [-350, 350],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: shimmerColors[0],
          overflow: 'hidden',
        } as ViewStyle,
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, shimmerStyle]}>
        <View
          style={[
            styles.shimmerHighlight,
            {
              backgroundColor: `linear-gradient(90deg, ${shimmerColors.join(', ')})`,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

// Component for rendering profile card skeletons
export const ProfileSkeleton: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => {
  return (
    <View style={[styles.profileContainer, style]}>
      <Skeleton width={60} height={60} borderRadius={30} style={styles.avatar} />
      <View style={styles.profileContent}>
        <Skeleton width="70%" height={18} style={styles.nameSkeleton} />
        <Skeleton width="50%" height={14} style={styles.secondarySkeleton} />
        <Skeleton width="80%" height={14} style={styles.secondarySkeleton} />
      </View>
    </View>
  );
};

// Component for rendering card skeletons
export const CardSkeleton: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => {
  return (
    <View style={[styles.card, style]}>
      <Skeleton width="60%" height={20} style={styles.titleSkeleton} />
      <Skeleton width="100%" height={16} style={styles.textSkeleton} />
      <Skeleton width="90%" height={16} style={styles.textSkeleton} />
      <Skeleton width="40%" height={16} style={styles.textSkeleton} />
      <View style={styles.cardFooter}>
        <Skeleton width={80} height={36} borderRadius={18} />
        <Skeleton width={36} height={36} borderRadius={18} />
      </View>
    </View>
  );
};

// Component for rendering list item skeletons
export const ListItemSkeleton: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => {
  return (
    <View style={[styles.listItem, style]}>
      <Skeleton width={44} height={44} borderRadius={22} />
      <View style={styles.listItemContent}>
        <Skeleton width="60%" height={16} style={styles.nameSkeleton} />
        <Skeleton width="40%" height={12} style={styles.secondarySkeleton} />
      </View>
      <Skeleton width={24} height={24} borderRadius={12} style={styles.actionSkeleton} />
    </View>
  );
};

const styles = StyleSheet.create({
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerHighlight: {
    width: '200%',
    height: '100%',
  },
  profileContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
  },
  avatar: {
    marginRight: 16,
  },
  profileContent: {
    flex: 1,
    justifyContent: 'center',
  },
  nameSkeleton: {
    marginBottom: 8,
  },
  secondarySkeleton: {
    marginBottom: 6,
  },
  card: {
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  titleSkeleton: {
    marginBottom: 16,
  },
  textSkeleton: {
    marginBottom: 8,
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 8,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionSkeleton: {
    marginLeft: 8,
  },
});

export default Skeleton; 