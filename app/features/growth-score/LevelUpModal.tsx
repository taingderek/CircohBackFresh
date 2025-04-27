import React, { useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Share
} from 'react-native';
import { COLORS, FONT_FAMILIES, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../core/constants/theme';
import { Level } from './types';
import Confetti from 'react-native-confetti';
import { useRef } from 'react';

interface LevelUpModalProps {
  visible: boolean;
  onClose: () => void;
  previousLevel: Level;
  newLevel: Level;
  newTitle: string;
  color: string;
}

const LevelUpModal = ({ 
  visible, 
  onClose, 
  previousLevel, 
  newLevel,
  newTitle,
  color
}: LevelUpModalProps) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<Confetti>(null);

  useEffect(() => {
    if (visible) {
      // Start animations when modal becomes visible
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.elastic(1.2),
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        })
      ]).start();

      // Start confetti
      if (confettiRef.current) {
        setTimeout(() => {
          confettiRef.current?.startConfetti();
        }, 300);
      }
    } else {
      // Reset animations when modal is hidden
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just reached level ${newLevel} (${newTitle}) in CircohBack! Join me to improve your relationship management skills.`,
        title: 'I Leveled Up in CircohBack!'
      });
    } catch (error) {
      console.error('Error sharing level up achievement:', error);
    }
  };

  // Get feature unlocks based on level
  const getUnlockedFeatures = () => {
    switch(newLevel) {
      case 2:
        return "Custom reminders";
      case 3:
        return "Advanced contact filtering";
      case 5:
        return "Detailed score analytics";
      case 7:
        return "Premium message templates";
      case 10:
        return "Relationship insights";
      default:
        return newLevel % 2 === 0
          ? "Bonus score multipliers"
          : "New achievement badges";
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Confetti ref={confettiRef} />
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
              borderColor: color
            }
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.congratsText}>Congratulations!</Text>
          </View>

          <View style={styles.levelInfo}>
            <View style={[styles.levelBadge, { backgroundColor: color }]}>
              <Text style={styles.levelNumber}>{newLevel}</Text>
            </View>
            <Text style={styles.levelUpText}>You've leveled up!</Text>
            <Text style={styles.levelTitle}>{newTitle}</Text>
          </View>

          <View style={styles.unlockInfo}>
            <Text style={styles.unlockTitle}>You've Unlocked:</Text>
            <View style={[styles.unlockBadge, { backgroundColor: `${color}30` }]}>
              <Text style={[styles.unlockText, { color }]}>
                {getUnlockedFeatures()}
              </Text>
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={[styles.shareButton, { backgroundColor: color }]} 
              onPress={handleShare}
            >
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Continue</Text>
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
    width: '80%',
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.LARGE,
    padding: SPACING.LARGE,
    alignItems: 'center',
    borderWidth: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  header: {
    marginBottom: SPACING.MEDIUM,
  },
  congratsText: {
    fontSize: FONT_SIZES.XL,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  levelInfo: {
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  levelBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  levelNumber: {
    fontSize: FONT_SIZES.XXL,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.TEXT,
  },
  levelUpText: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.TINY,
  },
  levelTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
  },
  unlockInfo: {
    width: '100%',
    marginBottom: SPACING.LARGE,
    alignItems: 'center',
  },
  unlockTitle: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SMALL,
  },
  unlockBadge: {
    paddingVertical: SPACING.SMALL,
    paddingHorizontal: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    marginBottom: SPACING.SMALL,
  },
  unlockText: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.MEDIUM,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareButton: {
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.LARGE,
    borderRadius: BORDER_RADIUS.MEDIUM,
    flex: 1,
    marginRight: SPACING.SMALL,
    alignItems: 'center',
  },
  shareButtonText: {
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: FONT_SIZES.MEDIUM,
  },
  closeButton: {
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.LARGE,
    borderRadius: BORDER_RADIUS.MEDIUM,
    flex: 1,
    marginLeft: SPACING.SMALL,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: FONT_SIZES.MEDIUM,
  },
});

export default LevelUpModal; 