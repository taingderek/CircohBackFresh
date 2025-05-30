import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  disabled?: boolean;
  onRatingChange?: (rating: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 24,
  disabled = false,
  onRatingChange,
}) => {
  const theme = useTheme();

  const handlePress = (selectedRating: number) => {
    if (disabled || !onRatingChange) return;
    
    // If user taps the same star they already selected, clear the rating
    if (selectedRating === rating) {
      onRatingChange(0);
    } else {
      onRatingChange(selectedRating);
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
        <TouchableOpacity
          key={`star-${star}`}
          onPress={() => handlePress(star)}
          disabled={disabled}
          style={styles.starButton}
          activeOpacity={disabled ? 1 : 0.7}
        >
          <Feather
            name={star <= rating ? 'star' : 'star'}
            size={size}
            color={star <= rating ? theme.colors.accent : theme.colors.border}
            style={{ opacity: star <= rating ? 1 : 0.7 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: 4,
  },
});

export default RatingStars; 