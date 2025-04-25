import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Contact, NewContact, contactService } from '../../services/ContactService';
import { RootState } from '../index';

// Define types for the contacts state
interface ContactsState {
  contacts: Contact[];
  selectedContact: Contact | null;
  filteredContacts: Contact[];
  searchTerm: string;
  selectedCategory: 'all' | Contact['category'];
  isLoading: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  syncResult: { imported: number; total: number } | null;
  error: string | null;
}

// Initial state
const initialState: ContactsState = {
  contacts: [],
  selectedContact: null,
  filteredContacts: [],
  searchTerm: '',
  selectedCategory: 'all',
  isLoading: false,
  syncStatus: 'idle',
  syncResult: null,
  error: null,
};

// Async thunks for contact actions
export const fetchContacts = createAsyncThunk(
  'contacts/fetchContacts',
  async (_, { rejectWithValue }) => {
    try {
      return await contactService.getContacts();
    } catch (error) {
      return rejectWithValue('Failed to fetch contacts.');
    }
  }
);

export const fetchContactById = createAsyncThunk(
  'contacts/fetchContactById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await contactService.getContactById(id);
    } catch (error) {
      return rejectWithValue('Failed to fetch contact details.');
    }
  }
);

export const createContact = createAsyncThunk(
  'contacts/createContact',
  async (contact: NewContact, { rejectWithValue }) => {
    try {
      return await contactService.createContact(contact);
    } catch (error) {
      return rejectWithValue('Failed to create contact.');
    }
  }
);

export const updateContact = createAsyncThunk(
  'contacts/updateContact',
  async ({ id, updates }: { id: string; updates: Partial<Contact> }, { rejectWithValue }) => {
    try {
      return await contactService.updateContact(id, updates);
    } catch (error) {
      return rejectWithValue('Failed to update contact.');
    }
  }
);

export const deleteContact = createAsyncThunk(
  'contacts/deleteContact',
  async (id: string, { rejectWithValue }) => {
    try {
      await contactService.deleteContact(id);
      return id;
    } catch (error) {
      return rejectWithValue('Failed to delete contact.');
    }
  }
);

export const markContactedThunk = createAsyncThunk(
  'contacts/markContacted',
  async (id: string, { rejectWithValue }) => {
    try {
      return await contactService.markContacted(id);
    } catch (error) {
      return rejectWithValue('Failed to mark contact as contacted.');
    }
  }
);

export const syncContacts = createAsyncThunk(
  'contacts/syncContacts',
  async (_, { rejectWithValue }) => {
    try {
      const result = await contactService.syncDeviceContacts();
      return result;
    } catch (error) {
      return rejectWithValue('Failed to sync contacts.');
    }
  }
);

// Contacts slice
const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    setSelectedContact: (state, action: PayloadAction<Contact | null>) => {
      state.selectedContact = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.filteredContacts = filterContacts(
        state.contacts, 
        state.searchTerm, 
        state.selectedCategory
      );
    },
    setCategoryFilter: (state, action: PayloadAction<'all' | Contact['category']>) => {
      state.selectedCategory = action.payload;
      state.filteredContacts = filterContacts(
        state.contacts, 
        state.searchTerm, 
        state.selectedCategory
      );
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Contacts
      .addCase(fetchContacts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action: PayloadAction<Contact[]>) => {
        state.isLoading = false;
        state.contacts = action.payload;
        state.filteredContacts = filterContacts(
          action.payload, 
          state.searchTerm, 
          state.selectedCategory
        );
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Contact By ID
      .addCase(fetchContactById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContactById.fulfilled, (state, action: PayloadAction<Contact | null>) => {
        state.isLoading = false;
        state.selectedContact = action.payload;
      })
      .addCase(fetchContactById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Contact
      .addCase(createContact.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createContact.fulfilled, (state, action: PayloadAction<Contact>) => {
        state.isLoading = false;
        state.contacts.push(action.payload);
        state.filteredContacts = filterContacts(
          state.contacts, 
          state.searchTerm, 
          state.selectedCategory
        );
      })
      .addCase(createContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update Contact
      .addCase(updateContact.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateContact.fulfilled, (state, action: PayloadAction<Contact>) => {
        state.isLoading = false;
        const index = state.contacts.findIndex(contact => contact.id === action.payload.id);
        if (index !== -1) {
          state.contacts[index] = action.payload;
        }
        
        if (state.selectedContact?.id === action.payload.id) {
          state.selectedContact = action.payload;
        }
        
        state.filteredContacts = filterContacts(
          state.contacts, 
          state.searchTerm, 
          state.selectedCategory
        );
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete Contact
      .addCase(deleteContact.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteContact.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.contacts = state.contacts.filter(contact => contact.id !== action.payload);
        
        if (state.selectedContact?.id === action.payload) {
          state.selectedContact = null;
        }
        
        state.filteredContacts = filterContacts(
          state.contacts, 
          state.searchTerm, 
          state.selectedCategory
        );
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Mark Contacted
      .addCase(markContactedThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markContactedThunk.fulfilled, (state, action: PayloadAction<Contact>) => {
        state.isLoading = false;
        const index = state.contacts.findIndex(contact => contact.id === action.payload.id);
        if (index !== -1) {
          state.contacts[index] = action.payload;
        }
        
        if (state.selectedContact?.id === action.payload.id) {
          state.selectedContact = action.payload;
        }
        
        state.filteredContacts = filterContacts(
          state.contacts, 
          state.searchTerm, 
          state.selectedCategory
        );
      })
      .addCase(markContactedThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Sync Contacts
      .addCase(syncContacts.pending, (state) => {
        state.syncStatus = 'syncing';
        state.error = null;
      })
      .addCase(syncContacts.fulfilled, (state, action) => {
        state.syncStatus = 'success';
        state.syncResult = action.payload;
      })
      .addCase(syncContacts.rejected, (state, action) => {
        state.syncStatus = 'error';
        state.error = action.payload as string;
      });
  },
});

// Helper function to filter contacts
const filterContacts = (
  contacts: Contact[], 
  searchTerm: string, 
  category: 'all' | Contact['category']
): Contact[] => {
  return contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || contact.category === category;
    return matchesSearch && matchesCategory;
  });
};

// Export actions
export const { 
  setSelectedContact, 
  setSearchTerm, 
  setCategoryFilter, 
  clearError 
} = contactsSlice.actions;

// Export selectors
export const selectAllContacts = (state: RootState) => state.contacts.contacts;
export const selectFilteredContacts = (state: RootState) => state.contacts.filteredContacts;
export const selectSelectedContact = (state: RootState) => state.contacts.selectedContact;
export const selectContactsLoading = (state: RootState) => state.contacts.isLoading;
export const selectSyncStatus = (state: RootState) => state.contacts.syncStatus;
export const selectSyncResult = (state: RootState) => state.contacts.syncResult;
export const selectContactsError = (state: RootState) => state.contacts.error;
export const selectSearchTerm = (state: RootState) => state.contacts.searchTerm;
export const selectCategoryFilter = (state: RootState) => state.contacts.selectedCategory;

// Export reducer
export default contactsSlice.reducer; 