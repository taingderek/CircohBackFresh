import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Reminder, NewReminder, reminderService } from '../../services/ReminderService';
import { RootState } from '../index';

// Define types for the reminders state
interface RemindersState {
  dueReminders: Reminder[];
  upcomingReminders: Reminder[];
  selectedReminder: Reminder | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: RemindersState = {
  dueReminders: [],
  upcomingReminders: [],
  selectedReminder: null,
  isLoading: false,
  error: null,
};

// Async thunks for reminder actions
export const fetchDueReminders = createAsyncThunk(
  'reminders/fetchDueReminders',
  async (_, { rejectWithValue }) => {
    try {
      return await reminderService.getDueReminders();
    } catch (error) {
      return rejectWithValue('Failed to fetch due reminders.');
    }
  }
);

export const fetchUpcomingReminders = createAsyncThunk(
  'reminders/fetchUpcomingReminders',
  async (limit: number = 5, { rejectWithValue }) => {
    try {
      return await reminderService.getUpcomingReminders(limit);
    } catch (error) {
      return rejectWithValue('Failed to fetch upcoming reminders.');
    }
  }
);

export const fetchContactReminders = createAsyncThunk(
  'reminders/fetchContactReminders',
  async (contactId: string, { rejectWithValue }) => {
    try {
      return await reminderService.getRemindersForContact(contactId);
    } catch (error) {
      return rejectWithValue('Failed to fetch contact reminders.');
    }
  }
);

export const createReminder = createAsyncThunk(
  'reminders/createReminder',
  async (reminder: NewReminder, { rejectWithValue }) => {
    try {
      return await reminderService.createReminder(reminder);
    } catch (error) {
      return rejectWithValue('Failed to create reminder.');
    }
  }
);

export const updateReminder = createAsyncThunk(
  'reminders/updateReminder',
  async ({ id, updates }: { id: string; updates: Partial<Reminder> }, { rejectWithValue }) => {
    try {
      return await reminderService.updateReminder(id, updates);
    } catch (error) {
      return rejectWithValue('Failed to update reminder.');
    }
  }
);

export const deleteReminder = createAsyncThunk(
  'reminders/deleteReminder',
  async (id: string, { rejectWithValue }) => {
    try {
      await reminderService.deleteReminder(id);
      return id;
    } catch (error) {
      return rejectWithValue('Failed to delete reminder.');
    }
  }
);

export const completeReminder = createAsyncThunk(
  'reminders/completeReminder',
  async (id: string, { rejectWithValue }) => {
    try {
      return await reminderService.completeReminder(id);
    } catch (error) {
      return rejectWithValue('Failed to complete reminder.');
    }
  }
);

export const snoozeReminder = createAsyncThunk(
  'reminders/snoozeReminder',
  async ({ id, days }: { id: string; days: number }, { rejectWithValue }) => {
    try {
      return await reminderService.snoozeReminder(id, days);
    } catch (error) {
      return rejectWithValue('Failed to snooze reminder.');
    }
  }
);

export const setupContactReminder = createAsyncThunk(
  'reminders/setupContactReminder',
  async ({ contactId, frequency }: { contactId: string; frequency: number }, { rejectWithValue }) => {
    try {
      return await reminderService.setupReminderForContact(contactId, frequency);
    } catch (error) {
      return rejectWithValue('Failed to setup reminder for contact.');
    }
  }
);

// Reminders slice
const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    setSelectedReminder: (state, action: PayloadAction<Reminder | null>) => {
      state.selectedReminder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Due Reminders
      .addCase(fetchDueReminders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDueReminders.fulfilled, (state, action: PayloadAction<Reminder[]>) => {
        state.isLoading = false;
        state.dueReminders = action.payload;
      })
      .addCase(fetchDueReminders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Upcoming Reminders
      .addCase(fetchUpcomingReminders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingReminders.fulfilled, (state, action: PayloadAction<Reminder[]>) => {
        state.isLoading = false;
        state.upcomingReminders = action.payload;
      })
      .addCase(fetchUpcomingReminders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Reminder
      .addCase(createReminder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createReminder.fulfilled, (state, action: PayloadAction<Reminder>) => {
        state.isLoading = false;
        
        // Check if this is a due reminder
        const dueDate = new Date(action.payload.due_date);
        const now = new Date();
        
        if (dueDate <= now && !action.payload.completed && !action.payload.snoozed) {
          state.dueReminders.push(action.payload);
          state.dueReminders.sort((a, b) => 
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          );
        } else {
          state.upcomingReminders.push(action.payload);
          state.upcomingReminders.sort((a, b) => 
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          );
        }
      })
      .addCase(createReminder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update Reminder
      .addCase(updateReminder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReminder.fulfilled, (state, action: PayloadAction<Reminder>) => {
        state.isLoading = false;
        
        // Update in due reminders if it exists
        const dueIndex = state.dueReminders.findIndex(r => r.id === action.payload.id);
        if (dueIndex !== -1) {
          state.dueReminders[dueIndex] = action.payload;
        }
        
        // Update in upcoming reminders if it exists
        const upcomingIndex = state.upcomingReminders.findIndex(r => r.id === action.payload.id);
        if (upcomingIndex !== -1) {
          state.upcomingReminders[upcomingIndex] = action.payload;
        }
        
        // Update selected reminder if matching
        if (state.selectedReminder?.id === action.payload.id) {
          state.selectedReminder = action.payload;
        }
        
        // Move between lists if needed
        const dueDate = new Date(action.payload.due_date);
        const now = new Date();
        
        if (action.payload.completed || action.payload.snoozed || dueDate > now) {
          // Should not be in due reminders
          if (dueIndex !== -1) {
            state.dueReminders.splice(dueIndex, 1);
          }
          
          // Should be in upcoming reminders if not completed
          if (!action.payload.completed && upcomingIndex === -1) {
            state.upcomingReminders.push(action.payload);
            state.upcomingReminders.sort((a, b) => 
              new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
            );
          }
        } else {
          // Should be in due reminders
          if (dueIndex === -1) {
            state.dueReminders.push(action.payload);
            state.dueReminders.sort((a, b) => 
              new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
            );
          }
          
          // Should not be in upcoming reminders
          if (upcomingIndex !== -1) {
            state.upcomingReminders.splice(upcomingIndex, 1);
          }
        }
      })
      .addCase(updateReminder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete Reminder
      .addCase(deleteReminder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteReminder.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        
        // Remove from due reminders
        state.dueReminders = state.dueReminders.filter(r => r.id !== action.payload);
        
        // Remove from upcoming reminders
        state.upcomingReminders = state.upcomingReminders.filter(r => r.id !== action.payload);
        
        // Clear selected reminder if it's the deleted one
        if (state.selectedReminder?.id === action.payload) {
          state.selectedReminder = null;
        }
      })
      .addCase(deleteReminder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Complete Reminder
      .addCase(completeReminder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeReminder.fulfilled, (state, action: PayloadAction<Reminder>) => {
        state.isLoading = false;
        
        // Remove from due reminders
        state.dueReminders = state.dueReminders.filter(r => r.id !== action.payload.id);
        
        // Remove from upcoming reminders
        state.upcomingReminders = state.upcomingReminders.filter(r => r.id !== action.payload.id);
        
        // Update selected reminder if matching
        if (state.selectedReminder?.id === action.payload.id) {
          state.selectedReminder = action.payload;
        }
      })
      .addCase(completeReminder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Snooze Reminder
      .addCase(snoozeReminder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(snoozeReminder.fulfilled, (state, action: PayloadAction<Reminder>) => {
        state.isLoading = false;
        
        // Remove from due reminders
        state.dueReminders = state.dueReminders.filter(r => r.id !== action.payload.id);
        
        // Add to upcoming reminders
        const existingIndex = state.upcomingReminders.findIndex(r => r.id === action.payload.id);
        if (existingIndex !== -1) {
          state.upcomingReminders[existingIndex] = action.payload;
        } else {
          state.upcomingReminders.push(action.payload);
        }
        
        // Sort upcoming reminders by date
        state.upcomingReminders.sort((a, b) => 
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        );
        
        // Update selected reminder if matching
        if (state.selectedReminder?.id === action.payload.id) {
          state.selectedReminder = action.payload;
        }
      })
      .addCase(snoozeReminder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Setup Contact Reminder
      .addCase(setupContactReminder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setupContactReminder.fulfilled, (state, action: PayloadAction<Reminder>) => {
        state.isLoading = false;
        
        // Add to upcoming reminders
        state.upcomingReminders.push(action.payload);
        
        // Sort upcoming reminders by date
        state.upcomingReminders.sort((a, b) => 
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        );
      })
      .addCase(setupContactReminder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { 
  setSelectedReminder, 
  clearError 
} = remindersSlice.actions;

// Export selectors
export const selectDueReminders = (state: RootState) => state.reminders.dueReminders;
export const selectUpcomingReminders = (state: RootState) => state.reminders.upcomingReminders;
export const selectSelectedReminder = (state: RootState) => state.reminders.selectedReminder;
export const selectRemindersLoading = (state: RootState) => state.reminders.isLoading;
export const selectRemindersError = (state: RootState) => state.reminders.error;

// Export reducer
export default remindersSlice.reducer; 