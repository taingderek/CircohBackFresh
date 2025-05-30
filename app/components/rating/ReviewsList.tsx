import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../constants/colors';
import { Review } from '../../types/review';
import ReviewCard from './ReviewCard';

type ReviewsListProps = {
  reviews: Review[];
  isLoading?: boolean;
  title?: string;
  showAverage?: boolean;
  onReviewPress?: (reviewId: string) => void;
  emptyStateMessage?: string;
};

export const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  isLoading = false,
  title,
  showAverage = true,
  onReviewPress,
  emptyStateMessage = 'No reviews yet'
}) => {
  // Calculate average rating if we have reviews and showAverage is true
  const averageRating = showAverage && reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accentMint} />
      </View>
    );
  }

  const renderHeader = () => {
    if (!title && !showAverage) return null;
    
    return (
      <View style={styles.header}>
        {title && <Text style={styles.title}>{title}</Text>}
        {showAverage && (
          <View style={styles.ratingContainer}>
            <Text style={styles.averageRating}>{averageRating}</Text>
            <Text style={styles.reviewCount}>
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>{emptyStateMessage}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReviewCard 
            review={item} 
            onPress={() => onReviewPress && onReviewPress(item.id)} 
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
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
    backgroundColor: colors.primaryDark,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondaryDark,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageRating: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accentMint,
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
}); 