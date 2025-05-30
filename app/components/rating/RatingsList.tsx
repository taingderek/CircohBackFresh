import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import RatingCard from './RatingCard';
import { Rating } from '../../types/rating';

interface RatingsListProps {
  ratings: Rating[];
  isLoading: boolean;
  onEndReached?: () => void;
}

const RatingsList = ({ ratings, isLoading, onEndReached }: RatingsListProps) => {
  const { t } = useTranslation();

  if (isLoading && ratings.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#32FFA5" />
      </View>
    );
  }

  if (ratings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('ratings.noRatingsYet')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={ratings}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <RatingCard
          userId={item.userId}
          userName={item.userName}
          userProfileImage={item.userProfileImage}
          overallRating={item.overallRating}
          thoughtfulnessRating={item.thoughtfulnessRating}
          responsivenessRating={item.responsivenessRating}
          empathyRating={item.empathyRating}
          comment={item.comment}
          createdAt={item.createdAt}
          isAnonymous={item.isAnonymous}
        />
      )}
      contentContainerStyle={styles.container}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isLoading ? (
          <ActivityIndicator
            style={styles.footer}
            size="small"
            color="#32FFA5"
          />
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  separator: {
    height: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 16,
  },
});

export default RatingsList; 