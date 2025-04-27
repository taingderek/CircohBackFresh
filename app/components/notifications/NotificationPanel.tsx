import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal,
  Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, BORDER_RADIUS, EFFECTS } from '@/app/core/constants/theme';
import Icon from '@/app/components/common/Icon';

// Types for notification data
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'message' | 'system' | 'contact';
  read: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationPanelProps {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onNotificationPress: (notification: Notification) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  visible,
  onClose,
  notifications,
  onMarkAllAsRead,
  onNotificationPress
}) => {
  const router = useRouter();

  // Helper function to get icon for notification type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder':
        return 'time-outline';
      case 'message':
        return 'chatbubble-outline';
      case 'contact':
        return 'person-outline';
      case 'system':
      default:
        return 'information-circle-outline';
    }
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Render each notification item
  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification
      ]}
      onPress={() => onNotificationPress(item)}
    >
      <View style={styles.notificationIconContainer}>
        <Icon 
          name={getNotificationIcon(item.type)} 
          size={20} 
          color={COLORS.PRIMARY} 
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{formatDate(item.createdAt)}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.panelContainer}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.panel}>
              <View style={styles.header}>
                <Text style={styles.title}>Notifications</Text>
                <TouchableOpacity onPress={onMarkAllAsRead}>
                  <Text style={styles.markAllRead}>Mark all as read</Text>
                </TouchableOpacity>
              </View>
              
              {notifications.length > 0 ? (
                <FlatList
                  data={notifications}
                  renderItem={renderNotificationItem}
                  keyExtractor={(item) => item.id}
                  style={styles.notificationsList}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="notifications-off-outline" size={50} color={COLORS.TEXT_SECONDARY} />
                  <Text style={styles.emptyStateText}>No notifications yet</Text>
                </View>
              )}
              
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panelContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  panel: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.LARGE,
    padding: SPACING.MEDIUM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  title: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.TEXT,
  },
  markAllRead: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.PRIMARY,
  },
  notificationsList: {
    maxHeight: 350,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: SPACING.SMALL,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: `${COLORS.PRIMARY}10`, // 10% opacity of primary color
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.PRIMARY}20`, // 20% opacity of primary color
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.SMALL,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.PRIMARY,
    position: 'absolute',
    top: SPACING.SMALL,
    right: SPACING.SMALL,
  },
  emptyState: {
    padding: SPACING.XLARGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: SPACING.MEDIUM,
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONT_FAMILIES.MEDIUM,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: SPACING.MEDIUM,
    padding: SPACING.SMALL,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.MEDIUM,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: FONT_SIZES.MEDIUM,
  },
});

export default NotificationPanel; 