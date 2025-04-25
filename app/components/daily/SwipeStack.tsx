import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ContactCard from './ContactCard';
import PremiumFeatureGate from '../subscription/PremiumFeatureGate';

// Get the window dimensions
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Swipe threshold - how far user needs to swipe to trigger an action
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

// Swipe directions
const DIRECTIONS = {
  RIGHT: 'right', // Message
  LEFT: 'left', // Snooze
  UP: 'up', // Contacted
  DOWN: 'down', // Adjust frequency
};

type Contact = {
  id: string;
  name: string;
  category: string;
  lastContacted?: string;
  notes?: string;
  avatar_url?: string;
  reminder_frequency: number;
};

type SwipeStackProps = {
  contacts: Contact[];
  isPremium: boolean;
  onSwipeRight: (contactId: string) => void; // Message
  onSwipeLeft: (contactId: string) => void; // Snooze
  onSwipeUp: (contactId: string) => void; // Contacted
  onSwipeDown: (contactId: string) => void; // Adjust frequency
  onStackEnd: () => void;
  dailyLimit?: number; // Limit for free users
};

export default function SwipeStack({
  contacts,
  isPremium,
  onSwipeRight,
  onSwipeLeft,
  onSwipeUp,
  onSwipeDown,
  onStackEnd,
  dailyLimit = 5,
}: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  
  // Create animated values for position and rotation
  const position = useRef(new Animated.ValueXY()).current;
  const rotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });
  
  // Helper function to reset the card position
  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start();
  };
  
  // Helper function to swipe card out
  const swipeCard = (direction: string) => {
    // Determine the animation based on direction
    let xPosition = 0;
    let yPosition = 0;
    
    if (direction === DIRECTIONS.RIGHT) xPosition = SCREEN_WIDTH * 1.5;
    else if (direction === DIRECTIONS.LEFT) xPosition = -SCREEN_WIDTH * 1.5;
    else if (direction === DIRECTIONS.UP) yPosition = -SCREEN_HEIGHT * 1.5;
    else if (direction === DIRECTIONS.DOWN) yPosition = SCREEN_HEIGHT * 1.5;
    
    Animated.timing(position, {
      toValue: { x: xPosition, y: yPosition },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      // Execute the appropriate callback based on direction
      const contactId = contacts[currentIndex].id;
      
      if (direction === DIRECTIONS.RIGHT) onSwipeRight(contactId);
      else if (direction === DIRECTIONS.LEFT) onSwipeLeft(contactId);
      else if (direction === DIRECTIONS.UP) onSwipeUp(contactId);
      else if (direction === DIRECTIONS.DOWN) onSwipeDown(contactId);
      
      // Move to the next card or end the stack
      const nextIndex = currentIndex + 1;
      
      // Check if free user has reached their daily limit
      if (!isPremium && nextIndex >= dailyLimit) {
        setLimitReached(true);
      }
      
      if (nextIndex < contacts.length) {
        setCurrentIndex(nextIndex);
        position.setValue({ x: 0, y: 0 });
      } else {
        onStackEnd();
      }
    });
  };
  
  // Handle button press for manual action
  const handleAction = (action: 'message' | 'snooze' | 'contacted' | 'adjust', contactId: string) => {
    if (action === 'message') swipeCard(DIRECTIONS.RIGHT);
    else if (action === 'snooze') swipeCard(DIRECTIONS.LEFT);
    else if (action === 'contacted') swipeCard(DIRECTIONS.UP);
    else if (action === 'adjust') swipeCard(DIRECTIONS.DOWN);
  };
  
  // Configure the PanResponder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        // Determine the swipe direction based on distance and velocity
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeCard(DIRECTIONS.RIGHT);
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeCard(DIRECTIONS.LEFT);
        } else if (gesture.dy < -SWIPE_THRESHOLD) {
          swipeCard(DIRECTIONS.UP);
        } else if (gesture.dy > SWIPE_THRESHOLD) {
          swipeCard(DIRECTIONS.DOWN);
        } else {
          resetPosition();
        }
      },
    })
  ).current;
  
  // Prepare animated card styles
  const cardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate: rotation },
    ],
  };
  
  // Calculate opacity for directional indicators
  const rightActionOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  const leftActionOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  const upActionOpacity = position.y.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  const downActionOpacity = position.y.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  // If no contacts are provided
  if (contacts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="checkmark-done-outline" size={64} color="#32FFA5" />
        <Text style={styles.emptyTitle}>No contacts due today!</Text>
        <Text style={styles.emptyMessage}>
          All caught up for now. Check back later or add more contacts to your list.
        </Text>
      </View>
    );
  }
  
  // Premium gate for when free users have reached their daily limit
  if (limitReached && !isPremium) {
    return (
      <PremiumFeatureGate feature="unlimited_contacts">
        <View style={styles.limitContainer}>
          <Ionicons name="lock-closed" size={64} color="#32FFA5" />
          <Text style={styles.limitTitle}>Daily Limit Reached</Text>
          <Text style={styles.limitMessage}>
            You've reached your daily limit of {dailyLimit} contacts.
            Upgrade to Premium for unlimited daily contacts.
          </Text>
        </View>
      </PremiumFeatureGate>
    );
  }
  
  // Render the current card and only peek at the next card
  return (
    <View style={styles.container}>
      {/* Action Indicators */}
      <View style={styles.overlayContainer}>
        <Animated.View 
          style={[
            styles.actionIndicator,
            styles.leftAction,
            { opacity: leftActionOpacity }
          ]}
        >
          <Ionicons name="time-outline" size={40} color="#FFFFFF" />
          <Text style={styles.actionText}>Snooze</Text>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.actionIndicator,
            styles.rightAction,
            { opacity: rightActionOpacity }
          ]}
        >
          <Ionicons name="chatbubble-outline" size={40} color="#FFFFFF" />
          <Text style={styles.actionText}>Message</Text>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.actionIndicator,
            styles.upAction,
            { opacity: upActionOpacity }
          ]}
        >
          <Ionicons name="checkmark-circle-outline" size={40} color="#FFFFFF" />
          <Text style={styles.actionText}>Contacted</Text>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.actionIndicator,
            styles.downAction,
            { opacity: downActionOpacity }
          ]}
        >
          <Ionicons name="options-outline" size={40} color="#FFFFFF" />
          <Text style={styles.actionText}>Adjust</Text>
        </Animated.View>
      </View>
      
      {/* Render next card (if available) */}
      {currentIndex + 1 < contacts.length && (
        <View style={styles.nextCardContainer}>
          <ContactCard 
            contact={contacts[currentIndex + 1]} 
            onAction={handleAction}
          />
        </View>
      )}
      
      {/* Current card */}
      <Animated.View 
        style={[styles.cardContainer, cardStyle]} 
        {...panResponder.panHandlers}
      >
        <ContactCard 
          contact={contacts[currentIndex]} 
          onAction={handleAction}
        />
      </Animated.View>
      
      {/* Card counter */}
      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {currentIndex + 1}/{!isPremium ? Math.min(contacts.length, dailyLimit) : contacts.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH - 32,
    zIndex: 1,
  },
  nextCardContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH - 32,
    top: 10,
    transform: [{ scale: 0.95 }],
    opacity: 0.5,
  },
  overlayContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 2,
    pointerEvents: 'none',
  },
  actionIndicator: {
    position: 'absolute',
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightAction: {
    backgroundColor: 'rgba(50, 255, 165, 0.8)',
    right: 32,
    top: '45%',
    transform: [{ translateY: -30 }],
  },
  leftAction: {
    backgroundColor: 'rgba(190, 147, 253, 0.8)',
    left: 32,
    top: '45%',
    transform: [{ translateY: -30 }],
  },
  upAction: {
    backgroundColor: 'rgba(147, 253, 253, 0.8)',
    top: 100,
    alignSelf: 'center',
  },
  downAction: {
    backgroundColor: 'rgba(255, 147, 185, 0.8)',
    bottom: 100,
    alignSelf: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 4,
  },
  counter: {
    position: 'absolute',
    bottom: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  counterText: {
    color: '#B0B0B0',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    color: '#B0B0B0',
    fontSize: 16,
    textAlign: 'center',
  },
  limitContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  limitTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  limitMessage: {
    color: '#B0B0B0',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
}); 