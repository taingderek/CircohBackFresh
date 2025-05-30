import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface Reminder {
  id: string;
  title: string;
  contactId: string;
  contactName: string;
  date: string;
  recurrence?: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RemindersState {
  items: Reminder[];
  lastUpdated: string | null;
}

// Initial state
const initialState: RemindersState = {
  items: [],
  lastUpdated: null,
};

// Create slice
const reminderSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    // Add a new reminder
    addReminder: (state, action: PayloadAction<Reminder>) => {
      state.items.push(action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    
    // Update existing reminder
    updateReminder: (state, action: PayloadAction<Reminder>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...action.payload,
          updatedAt: new Date().toISOString()
        };
      }
      state.lastUpdated = new Date().toISOString();
    },
    
    // Toggle reminder active state
    toggleReminderActive: (state, action: PayloadAction<string>) => {
      const index = state.items.findIndex(item => item.id === action.payload);
      if (index !== -1) {
        state.items[index].active = !state.items[index].active;
        state.items[index].updatedAt = new Date().toISOString();
      }
      state.lastUpdated = new Date().toISOString();
    },
    
    // Delete reminder
    deleteReminder: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    
    // Add multiple reminders (e.g., from API)
    addReminders: (state, action: PayloadAction<Reminder[]>) => {
      // Check for duplicates and only add new ones
      const newReminders = action.payload.filter(
        reminder => !state.items.some(item => item.id === reminder.id)
      );
      state.items = [...state.items, ...newReminders];
      state.lastUpdated = new Date().toISOString();
    },
    
    // Reset reminders (keep for testing)
    resetReminders: (state) => {
      state.items = [];
      state.lastUpdated = new Date().toISOString();
    },
  },
});

// Persistence configuration
const persistConfig = {
  key: 'reminders',
  storage: AsyncStorage,
  whitelist: ['items'],
};

// Export actions and persisted reducer
export const { 
  addReminder, 
  updateReminder, 
  toggleReminderActive, 
  deleteReminder,
  addReminders,
  resetReminders
} = reminderSlice.actions;

export default persistReducer(persistConfig, reminderSlice.reducer); 