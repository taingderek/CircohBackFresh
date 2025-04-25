import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MessageTone, MessageGenerationParams, MessageResult, AIService } from '../../services/AIService';

// Types
export interface Message {
  id: string;
  contactId: string;
  content: string;
  tone: MessageTone;
  generated: boolean; 
  timestamp: string;
  sent: boolean;
}

interface MessagingState {
  messages: Record<string, Message>;
  messagesByContact: Record<string, string[]>;
  quotaRemaining: number | null;
  quotaTotal: number | null;
  generateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentGeneratedMessage: string | null;
}

// Async thunks
export const generateMessage = createAsyncThunk(
  'messaging/generateMessage',
  async (params: MessageGenerationParams, { rejectWithValue }) => {
    try {
      const result = await AIService.generateMessage(params);
      
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      
      return result;
    } catch (error) {
      return rejectWithValue('Failed to generate message. Please try again.');
    }
  }
);

export const fetchQuota = createAsyncThunk(
  'messaging/fetchQuota',
  async (_, { rejectWithValue }) => {
    try {
      const quota = await AIService.getUserQuota();
      return {
        remaining: quota.weeklyQuota - quota.usedThisWeek,
        total: quota.weeklyQuota
      };
    } catch (error) {
      return rejectWithValue('Failed to fetch message quota');
    }
  }
);

export const saveMessage = createAsyncThunk(
  'messaging/saveMessage',
  async (message: Omit<Message, 'id' | 'timestamp'>) => {
    const id = Date.now().toString();
    const timestamp = new Date().toISOString();
    
    // Here you could add code to save the message to Supabase
    // For now, we'll just return the message with ID and timestamp
    
    return {
      ...message,
      id,
      timestamp
    };
  }
);

// Initial state
const initialState: MessagingState = {
  messages: {},
  messagesByContact: {},
  quotaRemaining: null,
  quotaTotal: null,
  generateStatus: 'idle',
  error: null,
  currentGeneratedMessage: null
};

// Slice
const messagingSlice = createSlice({
  name: 'messaging',
  initialState,
  reducers: {
    clearGeneratedMessage: (state) => {
      state.currentGeneratedMessage = null;
      state.generateStatus = 'idle';
    },
    markMessageAsSent: (state, action: PayloadAction<string>) => {
      const messageId = action.payload;
      if (state.messages[messageId]) {
        state.messages[messageId].sent = true;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Generate message
      .addCase(generateMessage.pending, (state) => {
        state.generateStatus = 'loading';
        state.error = null;
      })
      .addCase(generateMessage.fulfilled, (state, action) => {
        state.generateStatus = 'succeeded';
        state.currentGeneratedMessage = action.payload.message;
        state.quotaRemaining = action.payload.quotaRemaining;
      })
      .addCase(generateMessage.rejected, (state, action) => {
        state.generateStatus = 'failed';
        state.error = action.payload as string;
      })
      
      // Fetch quota
      .addCase(fetchQuota.fulfilled, (state, action) => {
        state.quotaRemaining = action.payload.remaining;
        state.quotaTotal = action.payload.total;
      })
      
      // Save message
      .addCase(saveMessage.fulfilled, (state, action) => {
        const message = action.payload;
        
        // Add to messages lookup
        state.messages[message.id] = message;
        
        // Add to messagesByContact lookup
        if (!state.messagesByContact[message.contactId]) {
          state.messagesByContact[message.contactId] = [];
        }
        state.messagesByContact[message.contactId].push(message.id);
      });
  }
});

export const { clearGeneratedMessage, markMessageAsSent } = messagingSlice.actions;

export default messagingSlice.reducer; 