import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Share,
  Platform,
  Image
} from 'react-native';
import { colors } from '../../constants/colors';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { StreakMilestone } from '../../features/streaks/types';
import Confetti from 'react-native-confetti';

interface StreakMilestoneModalProps {
  milestone: StreakMilestone;
  isVisible: boolean;
  onClose: () => void;
  onClaim: (milestoneId: string) => void;
}

const StreakMilestoneModal: React.FC<StreakMilestoneModalProps> = ({
  milestone,
  isVisible,
  onClose,
  onClaim
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<Confetti | null>(null);
  
  // Animated rotation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // Start animations when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      // Reset animations
      scaleAnim.setValue(0.5);
      rotateAnim.setValue(0);
      
      // Start animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        })
      ]).start();
      
      // Start confetti
      setTimeout(() => {
        if (confettiRef.current) {
          confettiRef.current.startConfetti();
        }
      }, 300);
    }
  }, [isVisible, scaleAnim, rotateAnim]);
  
  // Handle share button press
  const handleShare = async () => {
    try {
      const message = getMilestoneShareMessage();
      
      await Share.share({
        message,
        title: 'My CircohBack Achievement',
      });
    } catch (error) {
      console.error('Error sharing milestone:', error);
    }
  };
  
  // Get milestone description
  const getMilestoneDescription = () => {
    if (!milestone) return '';
    
    if (milestone.milestoneType.includes('relationship')) {
      return `You've maintained a relationship streak for ${milestone.streakDays} consecutive days! Your consistent effort is building stronger connections.`;
    } else {
      return `You've used CircohBack for ${milestone.streakDays} consecutive days! Your dedication to building relationships is impressive.`;
    }
  };
  
  // Get milestone share message
  const getMilestoneShareMessage = () => {
    if (!milestone) return '';
    
    if (milestone.milestoneType.includes('relationship')) {
      return `I just hit a ${milestone.streakDays}-day relationship streak in CircohBack! Consistently nurturing relationships pays off.`;
    } else {
      return `I've maintained my CircohBack streak for ${milestone.streakDays} days! Building better relationships one day at a time.`;
    }
  };
  
  // Get reward text
  const getRewardText = () => {
    if (!milestone || !milestone.rewardType) return 'No reward';
    
    switch (milestone.rewardType) {
      case 'points':
        return `${milestone.rewardAmount} points`;
      case 'streak_freeze':
        return 'Streak Freeze';
      case 'streak_saver':
        return 'Streak Saver';
      case 'premium_feature':
        return 'Premium Feature Unlock';
      default:
        return milestone.rewardType;
    }
  };
  
  // Get icon for reward type
  const getRewardIcon = () => {
    if (!milestone || !milestone.rewardType) return 'star';
    
    switch (milestone.rewardType) {
      case 'points':
        return 'diamond';
      case 'streak_freeze':
        return 'snowflake-o';
      case 'streak_saver':
        return 'shield';
      case 'premium_feature':
        return 'unlock';
      default:
        return 'gift';
    }
  };
  
  if (!milestone) return null;
  
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Confetti
          ref={confettiRef}
          count={50}
          size={1.5}
          duration={2000}
        />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          {/* Close button */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          {/* Achievement icon */}
          <Animated.View 
            style={[
              styles.badgeContainer, 
              { transform: [{ rotate: spin }] }
            ]}
          >
            <View style={styles.badgeInner}>
              <Text style={styles.badgeNumber}>{milestone.streakDays}</Text>
              <Text style={styles.badgeDays}>DAYS</Text>
            </View>
          </Animated.View>
          
          {/* Achievement title */}
          <Text style={styles.title}>
            {milestone.streakDays}-Day Streak Achievement!
          </Text>
          
          {/* Description */}
          <Text style={styles.description}>
            {getMilestoneDescription()}
          </Text>
          
          {/* Reward */}
          <View style={styles.rewardContainer}>
            <Text style={styles.rewardTitle}>Your Reward:</Text>
            <View style={styles.rewardContent}>
              <FontAwesome 
                name={getRewardIcon()} 
                size={24} 
                color={colors.accentMint} 
                style={styles.rewardIcon}
              />
              <Text style={styles.rewardText}>{getRewardText()}</Text>
            </View>
          </View>
          
          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.claimButton}
              onPress={() => onClaim(milestone.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.claimButtonText}>Claim Reward</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-outline" size={18} color={colors.accentLavender} />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 340,
    backgroundColor: colors.secondaryDark,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.accentMint,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  badgeContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.accentMint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.accentMint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.accentMint,
  },
  badgeDays: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginTop: -4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  rewardContainer: {
    width: '100%',
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  rewardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardIcon: {
    marginRight: 12,
  },
  rewardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accentMint,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  claimButton: {
    width: '100%',
    backgroundColor: colors.accentMint,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  shareButtonText: {
    fontSize: 14,
    color: colors.accentLavender,
    marginLeft: 6,
  },
});

export default StreakMilestoneModal; 