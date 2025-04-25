import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, EFFECTS } from '@/app/core/constants/theme';
import { Contact } from '@/app/core/services/ContactService';
import { formatDistanceToNow } from 'date-fns';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;
const ROTATION_ANGLE = 12;

interface ContactCardProps {
  contact: Contact;
  onSwiped: (direction: 'left' | 'right' | 'up' | 'down', contact: Contact) => void;
  isFirst: boolean;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onSwiped, isFirst }) => {
  const position = useRef(new Animated.ValueXY()).current;
  const rotation = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: [`-${ROTATION_ANGLE}deg`, '0deg', `${ROTATION_ANGLE}deg`],
    extrapolate: 'clamp',
  });

  const cardOpacity = position.x.interpolate({
    inputRange: [-width / 1.5, 0, width / 1.5],
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });

  // Indicator opacities based on swipe direction
  const leftIndicatorOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const rightIndicatorOpacity = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const upIndicatorOpacity = position.y.interpolate({
    inputRange: [-height / 6, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const downIndicatorOpacity = position.y.interpolate({
    inputRange: [0, height / 6],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isFirst,
      onMoveShouldSetPanResponder: () => isFirst,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        // Define thresholds for each swipe direction
        if (gesture.dx > SWIPE_THRESHOLD) {
          // Right swipe - message
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // Left swipe - snooze
          swipeLeft();
        } else if (gesture.dy < -SWIPE_THRESHOLD) {
          // Up swipe - mark contacted
          swipeUp();
        } else if (gesture.dy > SWIPE_THRESHOLD) {
          // Down swipe - adjust frequency
          swipeDown();
        } else {
          // Reset position if no swipe detected
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const swipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -width, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onSwiped('left', contact);
      position.setValue({ x: 0, y: 0 });
    });
  };

  const swipeRight = () => {
    Animated.timing(position, {
      toValue: { x: width, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onSwiped('right', contact);
      position.setValue({ x: 0, y: 0 });
    });
  };

  const swipeUp = () => {
    Animated.timing(position, {
      toValue: { x: 0, y: -height },
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onSwiped('up', contact);
      position.setValue({ x: 0, y: 0 });
    });
  };

  const swipeDown = () => {
    Animated.timing(position, {
      toValue: { x: 0, y: height },
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onSwiped('down', contact);
      position.setValue({ x: 0, y: 0 });
    });
  };

  // Format last contacted date
  const lastContactedText = contact.last_contacted 
    ? `Last contacted: ${formatDistanceToNow(new Date(contact.last_contacted), { addSuffix: true })}` 
    : 'Never contacted';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate: rotation },
          ],
          opacity: cardOpacity,
          zIndex: isFirst ? 1 : 0,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Swipe Indicators */}
      <Animated.View style={[styles.indicator, styles.leftIndicator, { opacity: leftIndicatorOpacity }]}>
        <Ionicons name="time-outline" size={40} color={COLORS.ACCENT} />
        <Text style={styles.indicatorText}>Snooze</Text>
      </Animated.View>

      <Animated.View style={[styles.indicator, styles.rightIndicator, { opacity: rightIndicatorOpacity }]}>
        <Ionicons name="chatbubble-outline" size={40} color={COLORS.PRIMARY} />
        <Text style={styles.indicatorText}>Message</Text>
      </Animated.View>

      <Animated.View style={[styles.indicator, styles.upIndicator, { opacity: upIndicatorOpacity }]}>
        <Ionicons name="checkmark-circle-outline" size={40} color={COLORS.SUCCESS} />
        <Text style={styles.indicatorText}>Contacted</Text>
      </Animated.View>

      <Animated.View style={[styles.indicator, styles.downIndicator, { opacity: downIndicatorOpacity }]}>
        <Ionicons name="calendar-outline" size={40} color={COLORS.WARNING} />
        <Text style={styles.indicatorText}>Adjust</Text>
      </Animated.View>

      {/* Card Content */}
      <View style={styles.cardHeader}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{contact.category}</Text>
        </View>
      </View>

      <View style={styles.lastContactedContainer}>
        <Text style={styles.lastContactedLabel}>Last contacted:</Text>
        <Text style={styles.lastContactedDate}>{lastContactedText}</Text>
      </View>

      {contact.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{contact.notes}</Text>
        </View>
      )}

      <View style={styles.swipeGuide}>
        <View style={styles.swipeInstruction}>
          <Ionicons name="arrow-up" size={20} color={COLORS.SUCCESS} />
          <Text style={styles.swipeText}>Mark contacted</Text>
        </View>
        <View style={styles.swipeInstruction}>
          <Ionicons name="arrow-forward" size={20} color={COLORS.PRIMARY} />
          <Text style={styles.swipeText}>Message</Text>
        </View>
        <View style={styles.swipeInstruction}>
          <Ionicons name="arrow-down" size={20} color={COLORS.WARNING} />
          <Text style={styles.swipeText}>Adjust frequency</Text>
        </View>
        <View style={styles.swipeInstruction}>
          <Ionicons name="arrow-back" size={20} color={COLORS.ACCENT} />
          <Text style={styles.swipeText}>Snooze</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: width - SPACING.LARGE * 2,
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: SPACING.LARGE,
    ...EFFECTS.SHADOW_MEDIUM,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  contactName: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    fontFamily: 'MontserratBold',
  },
  categoryBadge: {
    backgroundColor: COLORS.PRIMARY + '20',
    paddingHorizontal: SPACING.SMALL,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.PRIMARY,
    textTransform: 'capitalize',
    fontFamily: 'MontserratMedium',
  },
  lastContactedContainer: {
    marginBottom: SPACING.MEDIUM,
  },
  lastContactedLabel: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
    fontFamily: 'MontserratRegular',
  },
  lastContactedDate: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT,
    fontFamily: 'MontserratSemiBold',
  },
  notesContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  notesLabel: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
    fontFamily: 'MontserratMedium',
  },
  notesText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT,
    lineHeight: 20,
    fontFamily: 'MontserratRegular',
  },
  swipeGuide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.MEDIUM,
  },
  swipeInstruction: {
    alignItems: 'center',
  },
  swipeText: {
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
    fontFamily: 'MontserratRegular',
  },
  indicator: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  leftIndicator: {
    left: 30,
    top: '45%',
  },
  rightIndicator: {
    right: 30,
    top: '45%',
  },
  upIndicator: {
    top: 30,
    alignSelf: 'center',
  },
  downIndicator: {
    bottom: 30,
    alignSelf: 'center',
  },
  indicatorText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.SMALL,
    fontWeight: 'bold',
    marginTop: 8,
    fontFamily: 'MontserratBold',
  },
});

export default ContactCard; 