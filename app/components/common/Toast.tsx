import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  Easing 
} from 'react-native-reanimated';

export const showToast = (type: 'success' | 'error' | 'info' | 'warning', text1: string, text2?: string) => {
  Toast.show({
    type,
    text1,
    text2,
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 50,
  });
};

const { width } = Dimensions.get('window');

const AnimatedIcon = ({ 
  name, 
  color, 
  size = 22, 
  animate = true 
}: { 
  name: string; 
  color: string; 
  size?: number; 
  animate?: boolean;
}) => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10 });
    if (animate) {
      rotation.value = withTiming(2 * Math.PI, { 
        duration: 800, 
        easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
      });
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}rad` }
      ]
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Feather name={name as any} size={size} color={color} />
    </Animated.View>
  );
};

export const toastConfig: ToastConfig = {
  success: ({ text1, text2, props, ...rest }) => {
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);

    useEffect(() => {
      translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 300 });
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
      };
    });

    return (
      <Animated.View style={[styles.toastContainer, styles.successToast, animatedStyle]}>
        <View style={styles.iconContainer}>
          <AnimatedIcon name="check-circle" color="#32FFA5" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>{text1}</Text>
          {text2 && <Text style={styles.messageText}>{text2}</Text>}
        </View>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => Toast.hide()}
        >
          <Feather name="x" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    );
  },

  error: ({ text1, text2, props, ...rest }) => {
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);

    useEffect(() => {
      translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 300 });
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
      };
    });

    return (
      <Animated.View style={[styles.toastContainer, styles.errorToast, animatedStyle]}>
        <View style={styles.iconContainer}>
          <AnimatedIcon name="alert-circle" color="#FF6B6B" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>{text1}</Text>
          {text2 && <Text style={styles.messageText}>{text2}</Text>}
        </View>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => Toast.hide()}
        >
          <Feather name="x" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    );
  },

  info: ({ text1, text2, props, ...rest }) => {
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);

    useEffect(() => {
      translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 300 });
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
      };
    });

    return (
      <Animated.View style={[styles.toastContainer, styles.infoToast, animatedStyle]}>
        <View style={styles.iconContainer}>
          <AnimatedIcon name="info" color="#54C8FF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>{text1}</Text>
          {text2 && <Text style={styles.messageText}>{text2}</Text>}
        </View>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => Toast.hide()}
        >
          <Feather name="x" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    );
  },

  warning: ({ text1, text2, props, ...rest }) => {
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);

    useEffect(() => {
      translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 300 });
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
      };
    });

    return (
      <Animated.View style={[styles.toastContainer, styles.warningToast, animatedStyle]}>
        <View style={styles.iconContainer}>
          <AnimatedIcon name="alert-triangle" color="#FFB154" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>{text1}</Text>
          {text2 && <Text style={styles.messageText}>{text2}</Text>}
        </View>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => Toast.hide()}
        >
          <Feather name="x" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    );
  },
};

const styles = StyleSheet.create({
  toastContainer: {
    width: width - 32,
    minHeight: 60,
    maxWidth: 520,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginHorizontal: 16,
  },
  successToast: {
    backgroundColor: '#1E1E1E',
    borderLeftWidth: 4,
    borderLeftColor: '#32FFA5',
  },
  errorToast: {
    backgroundColor: '#1E1E1E',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  infoToast: {
    backgroundColor: '#1E1E1E',
    borderLeftWidth: 4,
    borderLeftColor: '#54C8FF',
  },
  warningToast: {
    backgroundColor: '#1E1E1E',
    borderLeftWidth: 4,
    borderLeftColor: '#FFB154',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  closeButton: {
    padding: 4,
  },
});

export default Toast; 