import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RatingStackParamList } from '../../navigation/types';
import { ReviewsList } from '../../components/rating/ReviewsList';
import { colors } from '../../constants/colors';
import { Review } from '@/app/types/review';
import { reviewService } from '@/app/core/services';
import ReviewCard from '../../components/rating/ReviewCard';

type Props = NativeStackScreenProps<RatingStackParamList, 'Reviews'>;

export const ReviewsScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const data = await reviewService.getReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleRefresh = () => {
    fetchReviews(true);
  };

  const handleReviewPress = (reviewId: string) => {
    // Navigate to review detail screen or implement other action
    console.log(`Review pressed: ${reviewId}`);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentMint} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReviewCard 
              review={item} 
              onPress={() => handleReviewPress(item.id)} 
            />
          )}
          ListHeaderComponent={() => (
            <View style={styles.header}>
              <Text style={styles.title}>User Reviews</Text>
              {reviews.length > 0 && (
                <View style={styles.ratingContainer}>
                  <Text style={styles.averageRating}>
                    {(reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)}
                  </Text>
                  <Text style={styles.reviewCount}>
                    {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                  </Text>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No reviews yet. Be the first to share your experience!
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.accentMint]}
              tintColor={colors.accentMint}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.accentMint,
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    padding: 16,
  },
  title: {
    color: colors.accentMint,
    fontSize: 20,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  averageRating: {
    color: colors.accentMint,
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewCount: {
    color: colors.accentMint,
    fontSize: 16,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    color: colors.accentMint,
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
}); 