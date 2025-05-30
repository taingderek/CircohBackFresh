import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import RatingCard from '../../components/rating/RatingCard';
import SubmitRatingModal from '../../components/rating/SubmitRatingModal';
import EmptyState from '../../components/common/EmptyState';
import Dropdown from '../../components/common/Dropdown';
import AnimatedButton from '../../components/common/AnimatedButton';
import AnimatedCard from '../../components/common/AnimatedCard';
import { ListItemSkeleton } from '../../components/common/Skeleton';
import { useStaggeredAnimation, useGlowAnimation } from '../../hooks/useAnimations';
import { showToast } from '../../components/common/Toast';

// Mock data - replace with actual API calls
const MOCK_RATINGS = [
  {
    id: '1',
    overallRating: 4,
    thoughtfulnessRating: 3,
    responsivenessRating: 5,
    empathyRating: 4,
    comment: 'Very helpful and listened to my concerns. Would recommend!',
    isAnonymous: false,
    createdAt: new Date(2023, 5, 15).toISOString(),
    fromUser: {
      id: '101',
      name: 'Alex Johnson',
      avatar: null
    }
  },
  {
    id: '2',
    overallRating: 5,
    thoughtfulnessRating: 5,
    responsivenessRating: 4,
    empathyRating: 5,
    comment: 'Excellent communication and follow-through on all commitments.',
    isAnonymous: true,
    createdAt: new Date(2023, 6, 2).toISOString(),
    fromUser: null
  },
  {
    id: '3',
    overallRating: 3,
    thoughtfulnessRating: 3,
    responsivenessRating: 2,
    empathyRating: 4,
    comment: 'Good overall, but could improve on response time.',
    isAnonymous: false,
    createdAt: new Date(2023, 4, 28).toISOString(),
    fromUser: {
      id: '103',
      name: 'Sam Taylor',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    }
  }
];

// Types
type Rating = {
  id: string;
  overallRating: number;
  thoughtfulnessRating: number;
  responsivenessRating: number;
  empathyRating: number;
  comment: string;
  isAnonymous: boolean;
  createdAt: string;
  fromUser: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
};

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Rating>);

const RatingsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [submittedRating, setSubmittedRating] = useState<boolean>(false);
  
  // Animations
  const { startGlowAnimation, stopGlowAnimation, glowStyle } = useGlowAnimation(0, 0, 0.5, 2000);
  const { getAnimatedStyle, animateIn } = useStaggeredAnimation(
    Math.min(ratings.length, 10),
    50,
    false
  );
  
  // Sorting options
  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Highest Rating', value: 'highest' },
    { label: 'Lowest Rating', value: 'lowest' }
  ];
  
  const fetchRatings = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setRatings(MOCK_RATINGS);
      
      // Show success toast on refresh
      if (showRefreshing) {
        showToast('success', 'Ratings updated', 'Latest ratings have been loaded');
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      showToast('error', 'Failed to load ratings', 'Please try again later');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setTimeout(() => animateIn(), 100);
    }
  }, [animateIn]);
  
  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);
  
  // Handle new rating submission effect
  useEffect(() => {
    const checkForNewRatings = async () => {
      if (submittedRating) {
        setLoading(true);
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Add a mock new rating
          const newRating: Rating = {
            id: `${ratings.length + 1}`,
            overallRating: 5,
            thoughtfulnessRating: 4,
            responsivenessRating: 5,
            empathyRating: 4,
            comment: 'Great experience with this user!',
            isAnonymous: false,
            createdAt: new Date().toISOString(),
            fromUser: {
              id: '999',
              name: 'Current User',
              avatar: null
            }
          };
          
          setRatings([newRating, ...ratings]);
          setSubmittedRating(false);
          showToast('success', 'Rating submitted', 'Your feedback has been shared');
        } catch (error) {
          console.error('Error submitting rating:', error);
          showToast('error', 'Failed to submit rating', 'Please try again later');
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkForNewRatings();
  }, [submittedRating, ratings]);
  
  // Sort ratings based on selected option
  const sortedRatings = [...ratings].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'highest':
        return b.overallRating - a.overallRating;
      case 'lowest':
        return a.overallRating - b.overallRating;
      default:
        return 0;
    }
  });
  
  // Function to call when a rating is submitted through the modal
  const handleModalClose = () => {
    setShowModal(false);
    // In a real implementation, you would have some way to know if a rating was submitted
    // For now, we'll simulate this with a timeout
    setTimeout(() => setSubmittedRating(true), 500);
  };
  
  const handleRefresh = useCallback(() => {
    fetchRatings(true);
  }, [fetchRatings]);
  
  const renderEmptyState = () => (
    <Animated.View entering={FadeIn.delay(300).duration(500)}>
      <EmptyState
        icon="star"
        title="No Ratings Yet"
        description="Be the first to leave a rating and share your feedback."
        actionLabel="Submit Rating"
        onAction={() => setShowModal(true)}
      />
    </Animated.View>
  );
  
  const renderRatingItem = useCallback(({ item, index }: { item: Rating; index: number }) => (
    <Animated.View style={getAnimatedStyle(index)}>
      <RatingCard
        userId={item.fromUser?.id || 'anonymous'}
        userName={item.fromUser?.name || 'Anonymous User'}
        avatarUrl={item.fromUser?.avatar || undefined}
        overallRating={item.overallRating}
        thoughtfulnessRating={item.thoughtfulnessRating}
        responsivenessRating={item.responsivenessRating}
        empathyRating={item.empathyRating}
        comment={item.comment}
        date={new Date(item.createdAt)}
      />
    </Animated.View>
  ), [getAnimatedStyle]);
  
  const renderSkeletons = () => (
    <View style={styles.skeletonContainer}>
      {[...Array(3)].map((_, index) => (
        <ListItemSkeleton key={index} style={styles.skeletonItem} />
      ))}
    </View>
  );
  
  // Calculate average rating
  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, rating) => sum + rating.overallRating, 0) / ratings.length).toFixed(1)
    : '0.0';
  
  // Show glow effect when rating is great
  useEffect(() => {
    if (parseFloat(averageRating) >= 4.5) {
      startGlowAnimation();
    } else {
      stopGlowAnimation();
    }
  }, [averageRating, startGlowAnimation, stopGlowAnimation]);
    
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with stats */}
      <AnimatedCard 
        elevation="none" 
        style={styles.statsCard}
        animateOnMount
        animationType="slide"
      >
        <Animated.View style={[styles.glowBackground, { backgroundColor: theme.colors.accent }, glowStyle]} />
        <View style={styles.averageContainer}>
          <Animated.Text 
            entering={FadeIn.delay(300).duration(500)}
            style={[styles.averageValue, { color: theme.colors.text }]}
          >
            {averageRating}
          </Animated.Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Feather
                key={star}
                name="star"
                size={20}
                color={parseFloat(averageRating) >= star ? theme.colors.accent : theme.colors.border}
                style={styles.starIcon}
              />
            ))}
          </View>
          <Text style={[styles.ratingsCount, { color: theme.colors.textSecondary }]}>
            Based on {ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'}
          </Text>
        </View>
      </AnimatedCard>
      
      {/* Filter and sort options */}
      <Animated.View 
        entering={FadeIn.delay(200).duration(500)}
        style={styles.filterContainer}
      >
        <Dropdown
          label="Sort by"
          options={sortOptions}
          selectedValue={sortBy}
          onSelect={(value) => setSortBy(value as SortOption)}
        />
      </Animated.View>
      
      {/* Ratings list */}
      {loading ? (
        renderSkeletons()
      ) : (
        <AnimatedFlatList
          data={sortedRatings}
          keyExtractor={(item) => item.id}
          renderItem={renderRatingItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState()}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(300)}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
      
      {/* Add rating button */}
      <Animated.View 
        style={styles.buttonContainer}
        entering={SlideInDown.delay(500).springify()}
        exiting={SlideOutDown.springify()}
      >
        <AnimatedButton
          onPress={() => setShowModal(true)}
          text="Add Rating"
          icon="star"
          variant="primary"
          style={styles.submitButton}
          activeGlow
        />
      </Animated.View>
      
      {/* Rating submission modal */}
      <SubmitRatingModal
        visible={showModal}
        onClose={handleModalClose}
        userId="current-user-id"
        userName="Current User"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    marginBottom: 0,
    padding: 20,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    overflow: 'hidden',
  },
  glowBackground: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    bottom: -100,
    borderRadius: 100,
    opacity: 0,
  },
  averageContainer: {
    alignItems: 'center',
  },
  averageValue: {
    fontSize: 56,
    fontWeight: '700',
    fontFamily: 'Montserrat-Bold',
  },
  starsRow: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  starIcon: {
    marginHorizontal: 4,
  },
  ratingsCount: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Montserrat-Medium',
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  skeletonContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  skeletonItem: {
    marginBottom: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  submitButton: {
    minWidth: 160,
    ...Platform.select({
      ios: {
        shadowColor: '#32FFA5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});

export default RatingsScreen; 