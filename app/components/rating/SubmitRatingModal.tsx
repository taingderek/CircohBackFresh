import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  Switch,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, BORDER_RADIUS, EFFECTS } from '@/app/core/constants/theme';
import { submitRating } from '@/app/features/quality-rating/service';
import { RatingInput } from '@/app/features/quality-rating/types';
import RatingStars from './RatingStars';
import { useTheme } from '../../hooks/useTheme';
import Button from '../common/Button';

interface SubmitRatingModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

const SubmitRatingModal: React.FC<SubmitRatingModalProps> = ({
  visible,
  onClose,
  userId,
  userName,
}) => {
  const theme = useTheme();
  
  // Rating state
  const [ratings, setRatings] = useState({
    overall: 0,
    thoughtfulness: 0,
    responsiveness: 0,
    empathy: 0,
  });
  
  // Other form fields
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailedRating, setShowDetailedRating] = useState(false);
  
  // Reset form state
  const resetForm = () => {
    setRatings({
      overall: 0,
      thoughtfulness: 0,
      responsiveness: 0,
      empathy: 0,
    });
    setComment('');
    setIsAnonymous(true);
    setShowDetailedRating(false);
  };
  
  // Handle rating change
  const handleRatingChange = (category: string, value: number) => {
    setRatings(prev => ({
      ...prev,
      [category]: value,
    }));
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (ratings.overall === 0) {
      Alert.alert('Rating Required', 'Please provide at least an overall rating.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const ratingData: RatingInput = {
        ratedUserId: userId,
        ratings: {
          overall: ratings.overall,
          ...(showDetailedRating ? {
            thoughtfulness: ratings.thoughtfulness,
            responsiveness: ratings.responsiveness,
            empathy: ratings.empathy,
          } : {}),
        },
        comment: comment.trim() || undefined,
        isAnonymous,
      };
      
      await submitRating(ratingData);
      
      Alert.alert(
        'Rating Submitted',
        'Thank you for your feedback!',
        [{ text: 'OK', onPress: handleClose }]
      );
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to submit rating. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  // Calculates if the submit button should be enabled
  const isSubmitEnabled = () => {
    if (ratings.overall === 0) return false;
    
    if (showDetailedRating) {
      return ratings.thoughtfulness > 0 && 
             ratings.responsiveness > 0 && 
             ratings.empathy > 0;
    }
    
    return true;
  };
  
  const renderStarRating = (
    rating: number, 
    setRating: (rating: number) => void, 
    size: number = 30
  ) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Feather
              name="star"
              size={size}
              color={rating >= star ? theme.colors.accent : theme.colors.border}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Rate {userName}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            {/* Info Message */}
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle" size={24} color={COLORS.INFO} style={styles.infoIcon} />
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Your feedback helps build better connections. Be honest but supportive.
              </Text>
            </View>
            
            {/* Overall Rating */}
            <View style={styles.ratingSection}>
              <Text style={[styles.ratingTitle, { color: theme.colors.text }]}>Overall Rating</Text>
              <Text style={[styles.ratingDescription, { color: theme.colors.textSecondary }]}>
                How would you rate your experience connecting with {userName}?
              </Text>
              {renderStarRating(ratings.overall, (value) => handleRatingChange('overall', value))}
            </View>
            
            {/* Detailed Rating Toggle */}
            <View style={styles.toggleContainer}>
              <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>Include detailed ratings</Text>
              <Switch
                value={showDetailedRating}
                onValueChange={setShowDetailedRating}
                trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                thumbColor={showDetailedRating ? theme.colors.accent : theme.colors.background}
              />
            </View>
            
            {/* Detailed Ratings */}
            {showDetailedRating && (
              <View style={styles.detailedRatings}>
                {/* Thoughtfulness */}
                <View style={styles.categoryRating}>
                  <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>Thoughtfulness</Text>
                  <Text style={[styles.categoryDescription, { color: theme.colors.textSecondary }]}>
                    Does {userName} remember important details and make you feel valued?
                  </Text>
                  {renderStarRating(ratings.thoughtfulness, (value) => handleRatingChange('thoughtfulness', value), 24)}
                </View>
                
                {/* Responsiveness */}
                <View style={styles.categoryRating}>
                  <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>Responsiveness</Text>
                  <Text style={[styles.categoryDescription, { color: theme.colors.textSecondary }]}>
                    How well does {userName} respond to messages and communication?
                  </Text>
                  {renderStarRating(ratings.responsiveness, (value) => handleRatingChange('responsiveness', value), 24)}
                </View>
                
                {/* Empathy */}
                <View style={styles.categoryRating}>
                  <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>Empathy</Text>
                  <Text style={[styles.categoryDescription, { color: theme.colors.textSecondary }]}>
                    Does {userName} understand your perspective and show compassion?
                  </Text>
                  {renderStarRating(ratings.empathy, (value) => handleRatingChange('empathy', value), 24)}
                </View>
              </View>
            )}
            
            {/* Comment */}
            <View style={styles.commentSection}>
              <Text style={[styles.commentTitle, { color: theme.colors.text }]}>Additional Comments (Optional)</Text>
              <TextInput
                style={[
                  styles.commentInput, 
                  { 
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }
                ]}
                value={comment}
                onChangeText={setComment}
                placeholder="Share more details about your experience..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                maxLength={500}
              />
              <Text style={[styles.charCount, { color: theme.colors.textSecondary }]}>{comment.length}/500</Text>
            </View>
            
            {/* Anonymity Toggle */}
            <View style={styles.toggleContainer}>
              <View>
                <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>Submit anonymously</Text>
                <Text style={[styles.toggleDescription, { color: theme.colors.textSecondary }]}>
                  {isAnonymous 
                    ? "Your name won't be visible to the recipient."
                    : "Your name will be visible to the recipient."}
                </Text>
              </View>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                thumbColor={theme.colors.background}
              />
            </View>
          </ScrollView>
          
          <View style={styles.footer}>
            <Button
              title="Submit Rating"
              onPress={handleSubmit}
              disabled={!isSubmitEnabled() || isLoading}
              loading={isLoading}
              variant="primary"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.LARGE,
    ...EFFECTS.SHADOW_MEDIUM,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  title: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
  },
  content: {
    padding: SPACING.MEDIUM,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.INFO + '10',
    padding: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.SMALL,
    marginBottom: SPACING.MEDIUM,
  },
  infoIcon: {
    marginRight: SPACING.SMALL,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT,
    lineHeight: 20,
  },
  ratingSection: {
    marginBottom: SPACING.LARGE,
  },
  ratingTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.TINY,
  },
  ratingDescription: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MEDIUM,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  starButton: {
    padding: 5,
    marginRight: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.SMALL,
    marginBottom: SPACING.MEDIUM,
  },
  toggleLabel: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT,
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
  },
  detailedRatings: {
    marginTop: SPACING.SMALL,
    marginBottom: SPACING.MEDIUM,
  },
  categoryRating: {
    marginBottom: SPACING.MEDIUM,
    padding: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.SMALL,
  },
  categoryTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SMALL,
  },
  commentSection: {
    marginBottom: SPACING.MEDIUM,
  },
  commentTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT,
    marginBottom: SPACING.SMALL,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.SMALL,
    padding: SPACING.MEDIUM,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    padding: SPACING.MEDIUM,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    alignItems: 'center',
  },
  keyboardAvoid: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default SubmitRatingModal; 