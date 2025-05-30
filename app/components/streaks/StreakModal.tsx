import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Image,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format, formatDistanceToNow } from 'date-fns';
import { StreakStatus, RelationshipStreak, StreakEventType } from '../../features/streaks/types';
import ContactStreakIndicator from '../daily/ContactStreakIndicator';
import { updateRelationshipStreak } from '../../features/streaks/service';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import RatingCard from '../../components/rating/RatingCard';
import SubmitRatingModal from '../../components/rating/SubmitRatingModal';
import EmptyState from '../../components/common/EmptyState';
import Dropdown from '../../components/common/Dropdown';

interface ContactEvent {
  type: 'message' | 'call' | 'meeting' | 'other';
  created_at: string;
  date?: string;
}

// Extended type with UI-specific properties
interface ExtendedRelationshipStreak extends RelationshipStreak {
  recentEvents?: ContactEvent[];
  totalContacts?: number;
}

interface StreakModalProps {
  visible: boolean;
  contactId: string | null;
  contactName: string;
  onClose: () => void;
}

const StreakModal: React.FC<StreakModalProps> = ({ 
  visible, 
  contactId, 
  contactName, 
  onClose 
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [streak, setStreak] = useState<ExtendedRelationshipStreak | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    if (visible && contactId) {
      loadStreakData();
    }
  }, [visible, contactId]);
  
  const loadStreakData = async () => {
    try {
      setLoading(true);
      
      if (!user?.id || !contactId) {
        return;
      }

      const streakData = await updateRelationshipStreak(
        user.id,
        contactId,
        StreakEventType.CONTACT_OTHER
      );
      
      if (streakData) {
        // Add mock data for UI demonstration - in production, this would come from the API
        const enhancedStreakData: ExtendedRelationshipStreak = {
          ...streakData,
          totalContacts: 32,
          recentEvents: [
            { date: new Date(Date.now() - 86400000 * 5).toISOString(), type: 'message', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
            { date: new Date(Date.now() - 86400000 * 12).toISOString(), type: 'call', created_at: new Date(Date.now() - 86400000 * 12).toISOString() },
            { date: new Date(Date.now() - 86400000 * 20).toISOString(), type: 'meeting', created_at: new Date(Date.now() - 86400000 * 20).toISOString() },
          ]
        };
        
        setStreak(enhancedStreakData);
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  const formatTimeAgo = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  };
  
  const getStreakTips = () => {
    if (!streak) return [];
    
    const tips = [
      "Regular check-ins help maintain your relationship",
      "Quality conversations matter more than frequency",
      "Set reminders for important dates"
    ];
    
    if (streak.streakStatus === StreakStatus.AT_RISK) {
      tips.unshift("This relationship needs attention soon");
    } else if (streak.streakStatus === StreakStatus.BROKEN) {
      tips.unshift("Reach out to rebuild this connection");
    }
    
    return tips;
  };
  
  const renderStreak = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#32FFA5" />
          <Text style={styles.loadingText}>Loading streak data...</Text>
        </View>
      );
    }
    
    if (!streak) {
      return (
        <View style={styles.emptyState}>
          <FontAwesome5 name="user-friends" size={50} color="#707070" />
          <Text style={styles.emptyText}>No streak data available</Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={loadStreakData}
          >
            <Text style={styles.actionButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Streak with {contactName}</Text>
          <ContactStreakIndicator 
            streakCount={streak.currentStreak}
            status={convertToContactStreakStatus(streak.streakStatus)}
            gracePeriodEnds={streak.gracePeriodEnds || undefined}
            style={styles.indicatorLarge}
          />
        </View>
        
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Last Contact</Text>
            <Text style={styles.statValue}>{formatDate(streak.lastContactDate)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Longest Streak</Text>
            <Text style={styles.statValue}>{streak.longestStreak} days</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Contacts</Text>
            <Text style={styles.statValue}>{streak.totalContacts || 0}</Text>
          </View>
        </View>
        
        <LinearGradient
          colors={['#121212', '#1E1E1E']}
          style={styles.tipsContainer}
        >
          <Text style={styles.tipsTitle}>Streak Tips</Text>
          {getStreakTips().map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Ionicons name="bulb-outline" size={20} color="#32FFA5" />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </LinearGradient>
        
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Contact History</Text>
          {streak.recentEvents && streak.recentEvents.length > 0 ? (
            streak.recentEvents.map((event, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyIconContainer}>
                  <Ionicons 
                    name={event.type === 'message' ? 'chatbubble' : 'call'} 
                    size={18} 
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyTitle}>
                    {event.type === 'message' ? 'Message' : 'Call'}
                  </Text>
                  <Text style={styles.historyDate}>
                    {formatTimeAgo(event.date)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyHistoryText}>No recent contact history</Text>
          )}
        </View>
      </ScrollView>
    );
  };
  
  // Convert StreakStatus enum to ContactStreakIndicator status string
  const convertToContactStreakStatus = (status: StreakStatus): 'active' | 'at_risk' | 'broken' => {
    switch (status) {
      case StreakStatus.ACTIVE:
        return 'active';
      case StreakStatus.AT_RISK:
        return 'at_risk';
      case StreakStatus.BROKEN:
        return 'broken';
      default:
        return 'active';
    }
  };
  
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          {renderStreak()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    paddingTop: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 5,
  },
  contentContainer: {
    padding: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  indicatorLarge: {
    transform: [{ scale: 1.2 }],
    marginVertical: 10,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#353535',
  },
  statLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tipsContainer: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 10,
    flex: 1,
  },
  historySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#353535',
  },
  historyIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#353535',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  historyDate: {
    fontSize: 13,
    color: '#B0B0B0',
    marginTop: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#B0B0B0',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#B0B0B0',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#32FFA5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyHistoryText: {
    color: '#707070',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 15,
  },
});

export default StreakModal; 