import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  color?: {
    filled: string;
    unfilled: string;
  };
}

const StarRating = ({
  rating,
  maxRating = 5,
  size = 16,
  color = { filled: '#FF93B9', unfilled: '#707070' }
}: StarRatingProps) => {
  const renderStars = () => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5

    for (let i = 1; i <= maxRating; i++) {
      if (i <= roundedRating) {
        // Full star
        stars.push(
          <FontAwesome 
            key={`star-${i}`} 
            name="star" 
            size={size} 
            color={color.filled} 
            style={styles.star} 
          />
        );
      } else if (i - 0.5 === roundedRating) {
        // Half star
        stars.push(
          <FontAwesome 
            key={`star-${i}`} 
            name="star-half-o" 
            size={size} 
            color={color.filled} 
            style={styles.star} 
          />
        );
      } else {
        // Empty star
        stars.push(
          <FontAwesome 
            key={`star-${i}`} 
            name="star-o" 
            size={size} 
            color={color.unfilled} 
            style={styles.star} 
          />
        );
      }
    }

    return stars;
  };

  return <View style={styles.container}>{renderStars()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
});

export default StarRating; 