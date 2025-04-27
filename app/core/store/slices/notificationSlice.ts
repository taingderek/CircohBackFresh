import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '@/app/components/notifications/NotificationPanel';

interface NotificationState {
  notifications: Notification[];
  hasUnreadNotifications: boolean;
}

// Initial mock data for notifications
const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'Reminder',
    message: 'Call Sarah tonight for her birthday',
    type: 'reminder',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
    link: '/contacts/sarah-id'
  },
  {
    id: '2',
    title: 'New Message',
    message: 'John sent you a new message',
    type: 'message',
    read: false,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
    link: '/messages/john-id'
  },
  {
    id: '3',
    title: 'Contact Update',
    message: 'Contact information updated for Mike',
    type: 'contact',
    read: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
    link: '/contacts/mike-id'
  },
  {
    id: '4',
    title: 'Subscription Update',
    message: 'Your premium plan renews in 3 days',
    type: 'system',
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), // 3 days ago
    link: '/subscription'
  }
];

const initialState: NotificationState = {
  notifications: initialNotifications,
  hasUnreadNotifications: initialNotifications.some(notification => !notification.read),
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
      state.hasUnreadNotifications = state.notifications.some(n => !n.read);
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.hasUnreadNotifications = false;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'createdAt'>>) => {
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      state.notifications.unshift(newNotification);
      state.hasUnreadNotifications = true;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
      state.hasUnreadNotifications = state.notifications.some(n => !n.read);
    }
  }
});

export const { 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  addNotification, 
  removeNotification 
} = notificationSlice.actions;

export default notificationSlice.reducer; 