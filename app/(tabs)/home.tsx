import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, BORDER_RADIUS } from '@/app/core/constants/theme';
import HeaderWithAvatar from '@/app/components/navigation/HeaderWithAvatar';
import Icon from '@/app/components/common/Icon';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/app/core/store';
import { 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '@/app/core/store/slices/notificationSlice';
import NotificationPanel, { Notification } from '@/app/components/notifications/NotificationPanel';
import { GrowthScoreDisplay } from '@/app/features/growth-score';
import { useGrowthScore } from '@/app/features/growth-score';
import LevelUpModal from '@/app/features/growth-score/LevelUpModal';

export default function HomeScreen() {
  const [userName, setUserName] = useState('John Doe');
  const [avatarUri, setAvatarUri] = useState('https://randomuser.me/api/portraits/men/32.jpg');
  const [isNotificationPanelVisible, setIsNotificationPanelVisible] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [previousLevel, setPreviousLevel] = useState(1);
  
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  // Get growth score data
  const { 
    totalScore, 
    levelProgress, 
    currentLevel,
    levelTitle 
  } = useGrowthScore();
  
  // Get notifications from Redux store
  const { notifications, hasUnreadNotifications } = useSelector(
    (state: RootState) => state.notifications
  );

  // Check for level up
  useEffect(() => {
    // Check if this is not initial render and if level has increased
    if (previousLevel !== 0 && currentLevel > previousLevel) {
      setShowLevelUpModal(true);
    }
    
    // Update previous level
    setPreviousLevel(currentLevel);
  }, [currentLevel, previousLevel]);

  const handleAvatarPress = () => {
    // Navigate to the profile screen
    router.push('/profile');
  };

  // Function to handle notification press
  const handleNotificationPress = (notification: Notification) => {
    // Mark the notification as read
    dispatch(markNotificationAsRead(notification.id));
    
    // Close the notification panel
    setIsNotificationPanelVisible(false);
    
    // Navigate to the link if provided
    if (notification.link) {
      router.push(notification.link);
    }
  };

  // Navigate to score details screen
  const handleScorePress = () => {
    router.push('/growth-score');
  };

  // Example of notification icon in right actions
  const renderRightActions = () => (
    <TouchableOpacity 
      style={styles.iconButton}
      onPress={() => setIsNotificationPanelVisible(true)}
    >
      <Icon name="notifications-outline" size={24} color={COLORS.TEXT} />
      {/* Notification badge - only show if there are unread notifications */}
      {hasUnreadNotifications && (
        <View style={styles.notificationBadge}>
          <Text style={styles.badgeText}>
            {notifications.filter(n => !n.read).length}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Hide the default header */}
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Custom header with avatar */}
      <HeaderWithAvatar 
        title="CircohBack" 
        showAvatar={true}
        userName={userName}
        avatarUri={avatarUri}
        rightActions={renderRightActions()}
        onAvatarPress={handleAvatarPress}
      />
      
      {/* Notification Panel */}
      <NotificationPanel
        visible={isNotificationPanelVisible}
        onClose={() => setIsNotificationPanelVisible(false)}
        notifications={notifications}
        onMarkAllAsRead={() => dispatch(markAllNotificationsAsRead())}
        onNotificationPress={handleNotificationPress}
      />
      
      {/* Level Up Modal */}
      <LevelUpModal
        visible={showLevelUpModal}
        onClose={() => setShowLevelUpModal(false)}
        previousLevel={previousLevel as any}
        newLevel={currentLevel}
        newTitle={levelTitle}
        color={levelProgress.color}
      />
      
      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Welcome back, {userName.split(' ')[0]}</Text>
          <Text style={styles.sectionSubtitle}>Keep your connections strong!</Text>
          
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Growth Score</Text>
            <View style={styles.scoreContainer}>
              <GrowthScoreDisplay size="large" onPress={handleScorePress} />
              <View style={styles.scoreTextContainer}>
                <Text style={styles.scoreSubtitle}>
                  Level {currentLevel}: {levelTitle}
                </Text>
                <Text style={styles.scoreText}>
                  {Math.round(levelProgress.progressPercentage)}% to Level {currentLevel + 1}
                </Text>
                <TouchableOpacity 
                  style={styles.viewDetailsButton}
                  onPress={handleScorePress}
                >
                  <Text style={styles.viewDetailsText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Sample card content */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Daily Connections</Text>
              <Icon name="people" size={20} color={COLORS.PRIMARY} />
            </View>
            <Text style={styles.cardText}>
              You have 3 people to connect with today.
            </Text>
            <Link href="/daily" asChild>
              <TouchableOpacity style={styles.cardButton}>
                <Text style={styles.cardButtonText}>View All</Text>
              </TouchableOpacity>
            </Link>
          </View>
          
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Upcoming Reminders</Text>
              <Icon name="calendar" size={20} color={COLORS.SECONDARY} />
            </View>
            <Text style={styles.cardText}>
              2 connection reminders scheduled for this week.
            </Text>
            <TouchableOpacity 
              style={styles.cardButton}
              onPress={() => console.log('Manage Reminders pressed')}
            >
              <Text style={styles.cardButtonText}>Manage Reminders</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: SPACING.MEDIUM,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.XL,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.TINY,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.LARGE,
  },
  scoreCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
  },
  scoreTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.MEDIUM,
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreTextContainer: {
    flex: 1,
    marginLeft: SPACING.LARGE,
  },
  scoreSubtitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.SMALL,
  },
  scoreText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MEDIUM,
  },
  viewDetailsButton: {
    paddingVertical: SPACING.SMALL,
    paddingHorizontal: SPACING.MEDIUM,
    backgroundColor: COLORS.PRIMARY + '20',
    borderRadius: BORDER_RADIUS.MEDIUM,
    alignSelf: 'flex-start',
  },
  viewDetailsText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.PRIMARY,
  },
  score: {
    fontSize: 48,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.PRIMARY,
    marginVertical: SPACING.SMALL,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.GRAY_DARK,
    borderRadius: 4,
    marginVertical: SPACING.MEDIUM,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
  },
  iconButton: {
    padding: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.ROUND,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.ERROR,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontFamily: FONT_FAMILIES.BOLD,
  },
  card: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  cardTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
  },
  cardText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MEDIUM,
  },
  cardButton: {
    backgroundColor: COLORS.PRIMARY + '20',
    padding: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.MEDIUM,
    alignItems: 'center',
  },
  cardButtonText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
  },
}); 