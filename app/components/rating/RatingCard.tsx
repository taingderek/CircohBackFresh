import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from '@rneui/themed';
import { formatDistanceToNow } from 'date-fns';
import StarRating from './StarRating';

interface RatingCardProps {
  userId: string;
  userName: string;
  avatarUrl?: string;
  overallRating: number;
  thoughtfulnessRating?: number;
  responsivenessRating?: number;
  empathyRating?: number;
  comment?: string;
  date: Date;
  onPress?: () => void;
}

const RatingCard: React.FC<RatingCardProps> = ({
  userId,
  userName,
  avatarUrl,
  overallRating,
  thoughtfulnessRating,
  responsivenessRating,
  empathyRating,
  comment,
  date,
  onPress,
}) => {
  // Format time since the rating was posted
  const timeAgo = formatDistanceToNow(date, { addSuffix: true });
  
  // Generate initials for the avatar if no image is provided
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const hasDetailedRatings = thoughtfulnessRating || responsivenessRating || empathyRating;

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <Avatar
          rounded
          size="medium"
          source={avatarUrl ? { uri: avatarUrl } : undefined}
          title={!avatarUrl ? getInitials(userName) : undefined}
          containerStyle={styles.avatar}
          overlayContainerStyle={!avatarUrl ? styles.avatarInitials : undefined}
          titleStyle={styles.avatarTitle}
        />
        <View style={styles.headerText}>
          <Text style={styles.userName}>{userName}</Text>
          <View style={styles.ratingRow}>
            <StarRating rating={overallRating} />
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
        </View>
      </View>

      {hasDetailedRatings && (
        <View style={styles.detailedRatings}>
          {thoughtfulnessRating && (
            <View style={styles.ratingCategory}>
              <Text style={styles.categoryLabel}>Thoughtfulness</Text>
              <StarRating rating={thoughtfulnessRating} size={14} />
            </View>
          )}
          
          {responsivenessRating && (
            <View style={styles.ratingCategory}>
              <Text style={styles.categoryLabel}>Responsiveness</Text>
              <StarRating rating={responsivenessRating} size={14} />
            </View>
          )}
          
          {empathyRating && (
            <View style={styles.ratingCategory}>
              <Text style={styles.categoryLabel}>Empathy</Text>
              <StarRating rating={empathyRating} size={14} />
            </View>
          )}
        </View>
      )}

      {comment && (
        <View style={styles.commentContainer}>
          <Text style={styles.comment}>{comment}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    marginRight: 12,
  },
  avatarInitials: {
    backgroundColor: '#BE93FD',
  },
  avatarTitle: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeAgo: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  detailedRatings: {
    marginVertical: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  ratingCategory: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  commentContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  comment: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
});

export default RatingCard; 