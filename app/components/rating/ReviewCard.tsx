import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Review } from '../../types/review';
import { colors } from '../../constants/colors';
import { FontAwesome } from '@expo/vector-icons';

type ReviewCardProps = {
  review: Review;
  onPress: (reviewId: string) => void;
};

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onPress }) => {
  // Get initials from username
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Generate stars based on rating
  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FontAwesome
            key={star}
            name={star <= rating ? 'star' : 'star-o'}
            size={16}
            color={star <= rating ? colors.accentMint : colors.textSecondary}
            style={styles.star}
          />
        ))}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(review.id)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {review.avatarUrl ? (
            <Image source={{ uri: review.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.initialsContainer}>
              <Text style={styles.initials}>{getInitials(review.userName)}</Text>
            </View>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{review.userName}</Text>
          <Text style={styles.date}>{formatDate(review.date)}</Text>
        </View>
        {renderStars(review.rating)}
      </View>
      <View style={styles.content}>
        <Text style={styles.comment}>{review.comment}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondaryDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  initialsContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentLavender,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    marginLeft: 2,
  },
  content: {
    marginTop: 4,
  },
  comment: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ReviewCard; 