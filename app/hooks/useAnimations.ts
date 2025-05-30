import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  SharedValue,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

/**
 * Common spring animation settings
 */
export const AnimationPresets = {
  gentle: { damping: 15, stiffness: 100 },
  responsive: { damping: 20, stiffness: 300 },
  bouncy: { damping: 10, stiffness: 150 },
  snappy: { damping: 15, stiffness: 400 },
};

/**
 * Common timing animation settings
 */
export const TimingPresets = {
  fast: { duration: 200, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
  normal: { duration: 350, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
  slow: { duration: 500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
  elastic: { duration: 400, easing: Easing.elastic(1) },
};

/**
 * Hook for fade-in animation
 */
export const useFadeAnimation = (initialVisible = false, timing = TimingPresets.normal) => {
  const opacity = useSharedValue(initialVisible ? 1 : 0);

  const fadeIn = (callback?: () => void) => {
    'worklet';
    opacity.value = withTiming(1, timing, callback);
  };

  const fadeOut = (callback?: () => void) => {
    'worklet';
    opacity.value = withTiming(0, timing, callback);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return { opacity, fadeIn, fadeOut, animatedStyle };
};

/**
 * Hook for scale animation
 */
export const useScaleAnimation = (
  initialScale = 1, 
  spring = AnimationPresets.responsive
) => {
  const scale = useSharedValue(initialScale);

  const scaleUp = (toValue = 1, callback?: () => void) => {
    'worklet';
    scale.value = withSpring(toValue, spring, callback);
  };

  const scaleDown = (toValue = 0.9, callback?: () => void) => {
    'worklet';
    scale.value = withSpring(toValue, spring, callback);
  };

  const pulse = (intensity = 1.1) => {
    'worklet';
    scale.value = withSequence(
      withSpring(intensity, spring),
      withSpring(1, spring)
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { scale, scaleUp, scaleDown, pulse, animatedStyle };
};

/**
 * Hook for slide animation
 */
export const useSlideAnimation = (
  initialPosition = 100, 
  direction: 'up' | 'down' | 'left' | 'right' = 'up'
) => {
  const position = useSharedValue(initialPosition);

  const getSlideStyle = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return { translateY: position.value };
      case 'left':
      case 'right':
        return { translateX: position.value };
    }
  };

  const slideIn = (toValue = 0, spring = AnimationPresets.gentle, callback?: () => void) => {
    'worklet';
    position.value = withSpring(toValue, spring, callback);
  };

  const slideOut = (spring = AnimationPresets.gentle, callback?: () => void) => {
    'worklet';
    const finalPosition = getDefaultFinalPosition();
    position.value = withSpring(finalPosition, spring, callback);
  };

  const getDefaultFinalPosition = () => {
    switch (direction) {
      case 'up':
        return initialPosition > 0 ? initialPosition : 100;
      case 'down':
        return initialPosition < 0 ? initialPosition : -100;
      case 'left':
        return initialPosition > 0 ? initialPosition : 100;
      case 'right':
        return initialPosition < 0 ? initialPosition : -100;
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [getSlideStyle()],
  }));

  return { position, slideIn, slideOut, animatedStyle };
};

/**
 * Hook for creating staggered animations for lists
 */
export const useStaggeredAnimation = (
  itemCount: number,
  staggerDelay = 50,
  initialVisible = false
) => {
  const itemAnimations = Array(itemCount)
    .fill(0)
    .map(() => {
      const opacity = useSharedValue(initialVisible ? 1 : 0);
      const translateY = useSharedValue(initialVisible ? 0 : 15);
      
      return { opacity, translateY };
    });

  const animateIn = (callback?: () => void) => {
    'worklet';
    itemAnimations.forEach(({ opacity, translateY }, index) => {
      const delay = index * staggerDelay;
      
      opacity.value = withDelay(
        delay,
        withTiming(1, { duration: 350, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
      );
      
      translateY.value = withDelay(
        delay,
        withSpring(0, AnimationPresets.gentle)
      );
      
      if (callback && index === itemCount - 1) {
        setTimeout(callback, delay + 350);
      }
    });
  };

  const animateOut = (callback?: () => void) => {
    'worklet';
    itemAnimations.forEach(({ opacity, translateY }, index) => {
      const reverseIndex = itemCount - 1 - index;
      const delay = reverseIndex * staggerDelay;
      
      opacity.value = withDelay(
        delay,
        withTiming(0, { duration: 200, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
      );
      
      translateY.value = withDelay(
        delay,
        withSpring(15, AnimationPresets.gentle)
      );
      
      if (callback && index === 0) {
        setTimeout(callback, delay + 200);
      }
    });
  };

  const getAnimatedStyle = (index: number) => {
    if (index >= itemCount) return {};
    
    const { opacity, translateY } = itemAnimations[index];
    
    return useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    }));
  };

  return { animateIn, animateOut, getAnimatedStyle };
};

/**
 * Hook for shimmer/loading effect
 */
export const useShimmerAnimation = (duration = 1500) => {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1, // Infinite repetitions
      true // Reverse animation
    );
  }, [duration]);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerValue.value,
      [0, 1],
      [-300, 300],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX }],
    };
  });

  return { shimmerValue, shimmerStyle };
};

/**
 * Hook for glow/pulse effect
 */
export const useGlowAnimation = (
  initialValue = 0, 
  minOpacity = 0, 
  maxOpacity = 0.5,
  duration = 1500
) => {
  const glowOpacity = useSharedValue(initialValue);

  const startGlowAnimation = (repeat = true) => {
    'worklet';
    glowOpacity.value = repeat
      ? withRepeat(
          withTiming(maxOpacity, {
            duration,
            easing: Easing.inOut(Easing.ease),
          }),
          -1,
          true
        )
      : withTiming(maxOpacity, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
        });
  };

  const stopGlowAnimation = () => {
    'worklet';
    glowOpacity.value = withTiming(minOpacity, {
      duration: duration / 2,
      easing: Easing.inOut(Easing.ease),
    });
  };

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return { glowOpacity, startGlowAnimation, stopGlowAnimation, glowStyle };
};

/**
 * Hook for rotation animation
 */
export const useRotationAnimation = (initialRotation = 0, duration = 300) => {
  const rotation = useSharedValue(initialRotation);

  const rotate = (toValue: number, callback?: () => void) => {
    'worklet';
    rotation.value = withTiming(toValue, { duration }, callback);
  };

  const rotateContinuous = (duration = 2000) => {
    'worklet';
    rotation.value = withRepeat(
      withTiming(360, { duration }),
      -1, // Infinite repetitions
      false // Don't reverse animation
    );
  };

  const stopRotation = () => {
    'worklet';
    rotation.value = withTiming(0, { duration: duration / 2 });
  };

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return { rotation, rotate, rotateContinuous, stopRotation, rotationStyle };
};

/**
 * Hook for progress animation (e.g., for progress bars)
 */
export const useProgressAnimation = (initialProgress = 0, duration = 500) => {
  const progress = useSharedValue(initialProgress);

  const animateProgress = (toValue: number, callback?: () => void) => {
    'worklet';
    progress.value = withTiming(toValue, { duration }, callback);
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return { progress, animateProgress, progressStyle };
}; 