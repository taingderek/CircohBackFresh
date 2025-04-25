import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Memory, NewMemory, memoryService } from '../../services/MemoryService';
import { RootState } from '../index';

// Define types for the memories state
interface MemoriesState {
  memories: Memory[];
  contactMemories: Record<string, Memory[]>;
  selectedMemory: Memory | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: MemoriesState = {
  memories: [],
  contactMemories: {},
  selectedMemory: null,
  isLoading: false,
  error: null,
};

// Async thunks for memory actions
export const fetchMemoriesForContact = createAsyncThunk(
  'memories/fetchMemoriesForContact',
  async (contactId: string, { rejectWithValue }) => {
    try {
      return { 
        contactId, 
        memories: await memoryService.getMemoriesForContact(contactId) 
      };
    } catch (error) {
      return rejectWithValue('Failed to fetch memories for contact.');
    }
  }
);

export const fetchMemoryById = createAsyncThunk(
  'memories/fetchMemoryById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await memoryService.getMemoryById(id);
    } catch (error) {
      return rejectWithValue('Failed to fetch memory details.');
    }
  }
);

export const createMemory = createAsyncThunk(
  'memories/createMemory',
  async (memory: NewMemory, { rejectWithValue }) => {
    try {
      return await memoryService.createMemory(memory);
    } catch (error) {
      return rejectWithValue('Failed to create memory.');
    }
  }
);

export const updateMemory = createAsyncThunk(
  'memories/updateMemory',
  async ({ id, updates }: { id: string; updates: Partial<Memory> }, { rejectWithValue }) => {
    try {
      return await memoryService.updateMemory(id, updates);
    } catch (error) {
      return rejectWithValue('Failed to update memory.');
    }
  }
);

export const deleteMemory = createAsyncThunk(
  'memories/deleteMemory',
  async ({ id, contactId }: { id: string; contactId: string }, { rejectWithValue }) => {
    try {
      await memoryService.deleteMemory(id);
      return { id, contactId };
    } catch (error) {
      return rejectWithValue('Failed to delete memory.');
    }
  }
);

export const togglePinMemory = createAsyncThunk(
  'memories/togglePinMemory',
  async ({ id, currentStatus }: { id: string; currentStatus: boolean }, { rejectWithValue }) => {
    try {
      return await memoryService.togglePinStatus(id, currentStatus);
    } catch (error) {
      return rejectWithValue('Failed to toggle pin status.');
    }
  }
);

export const fetchPinnedMemories = createAsyncThunk(
  'memories/fetchPinnedMemories',
  async (contactId: string, { rejectWithValue }) => {
    try {
      return { 
        contactId, 
        memories: await memoryService.getPinnedMemories(contactId) 
      };
    } catch (error) {
      return rejectWithValue('Failed to fetch pinned memories.');
    }
  }
);

export const searchMemories = createAsyncThunk(
  'memories/searchMemories',
  async (query: string, { rejectWithValue }) => {
    try {
      return await memoryService.searchMemories(query);
    } catch (error) {
      return rejectWithValue('Failed to search memories.');
    }
  }
);

// Memories slice
const memoriesSlice = createSlice({
  name: 'memories',
  initialState,
  reducers: {
    setSelectedMemory: (state, action: PayloadAction<Memory | null>) => {
      state.selectedMemory = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMemories: (state) => {
      state.memories = [];
      state.contactMemories = {};
      state.selectedMemory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Memories for Contact
      .addCase(fetchMemoriesForContact.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMemoriesForContact.fulfilled, (state, action) => {
        state.isLoading = false;
        const { contactId, memories } = action.payload;
        state.contactMemories[contactId] = memories;
      })
      .addCase(fetchMemoriesForContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Memory By ID
      .addCase(fetchMemoryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMemoryById.fulfilled, (state, action: PayloadAction<Memory | null>) => {
        state.isLoading = false;
        state.selectedMemory = action.payload;
      })
      .addCase(fetchMemoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Memory
      .addCase(createMemory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMemory.fulfilled, (state, action: PayloadAction<Memory>) => {
        state.isLoading = false;
        
        // Add to general memories
        state.memories.unshift(action.payload);
        
        // Add to contact memories
        const contactId = action.payload.contact_id;
        if (state.contactMemories[contactId]) {
          state.contactMemories[contactId].unshift(action.payload);
        } else {
          state.contactMemories[contactId] = [action.payload];
        }
      })
      .addCase(createMemory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update Memory
      .addCase(updateMemory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMemory.fulfilled, (state, action: PayloadAction<Memory>) => {
        state.isLoading = false;
        const updatedMemory = action.payload;
        
        // Update in general memories
        const index = state.memories.findIndex(memory => memory.id === updatedMemory.id);
        if (index !== -1) {
          state.memories[index] = updatedMemory;
        }
        
        // Update in contact memories
        const contactId = updatedMemory.contact_id;
        if (state.contactMemories[contactId]) {
          const contactIndex = state.contactMemories[contactId].findIndex(
            memory => memory.id === updatedMemory.id
          );
          if (contactIndex !== -1) {
            state.contactMemories[contactId][contactIndex] = updatedMemory;
          }
        }
        
        // Update selected memory if it's the one being edited
        if (state.selectedMemory?.id === updatedMemory.id) {
          state.selectedMemory = updatedMemory;
        }
      })
      .addCase(updateMemory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete Memory
      .addCase(deleteMemory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMemory.fulfilled, (state, action) => {
        state.isLoading = false;
        const { id, contactId } = action.payload;
        
        // Remove from general memories
        state.memories = state.memories.filter(memory => memory.id !== id);
        
        // Remove from contact memories
        if (state.contactMemories[contactId]) {
          state.contactMemories[contactId] = state.contactMemories[contactId].filter(
            memory => memory.id !== id
          );
        }
        
        // Clear selected memory if it's the deleted one
        if (state.selectedMemory?.id === id) {
          state.selectedMemory = null;
        }
      })
      .addCase(deleteMemory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Toggle Pin Memory
      .addCase(togglePinMemory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(togglePinMemory.fulfilled, (state, action: PayloadAction<Memory>) => {
        state.isLoading = false;
        const updatedMemory = action.payload;
        
        // Update in general memories
        const index = state.memories.findIndex(memory => memory.id === updatedMemory.id);
        if (index !== -1) {
          state.memories[index] = updatedMemory;
        }
        
        // Update in contact memories
        const contactId = updatedMemory.contact_id;
        if (state.contactMemories[contactId]) {
          const contactIndex = state.contactMemories[contactId].findIndex(
            memory => memory.id === updatedMemory.id
          );
          if (contactIndex !== -1) {
            state.contactMemories[contactId][contactIndex] = updatedMemory;
          }
        }
        
        // Update selected memory if it's the one being toggled
        if (state.selectedMemory?.id === updatedMemory.id) {
          state.selectedMemory = updatedMemory;
        }
      })
      .addCase(togglePinMemory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Pinned Memories
      .addCase(fetchPinnedMemories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPinnedMemories.fulfilled, (state, action) => {
        state.isLoading = false;
        // We don't need to update state since we'll fetch these only when needed
      })
      .addCase(fetchPinnedMemories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Search Memories
      .addCase(searchMemories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchMemories.fulfilled, (state, action: PayloadAction<Memory[]>) => {
        state.isLoading = false;
        state.memories = action.payload;
      })
      .addCase(searchMemories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { 
  setSelectedMemory, 
  clearError, 
  clearMemories 
} = memoriesSlice.actions;

// Export selectors
export const selectAllMemories = (state: RootState) => state.memories.memories;
export const selectContactMemories = (contactId: string) => 
  (state: RootState) => state.memories.contactMemories[contactId] || [];
export const selectSelectedMemory = (state: RootState) => state.memories.selectedMemory;
export const selectMemoriesLoading = (state: RootState) => state.memories.isLoading;
export const selectMemoriesError = (state: RootState) => state.memories.error;

// Export reducer
export default memoriesSlice.reducer; 