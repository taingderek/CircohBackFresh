import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import TravelService from '../../services/TravelService';
import { TravelPlan, TravelPlanCreateData, TravelPlanUpdateData, TravelContactLink } from '../../types/contact';
import { RootState } from '../index';

// Define types for the travel plans state
interface TravelState {
  travelPlans: TravelPlan[];
  selectedTravelPlan: TravelPlan | null;
  travelContactLinks: TravelContactLink[];
  nearbyContacts: Array<{ contact_id: string; distanceKm: number }>;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: TravelState = {
  travelPlans: [],
  selectedTravelPlan: null,
  travelContactLinks: [],
  nearbyContacts: [],
  isLoading: false,
  error: null
};

// Async thunks
export const fetchTravelPlans = createAsyncThunk(
  'travel/fetchTravelPlans',
  async (_, { rejectWithValue }) => {
    try {
      const travelPlans = await TravelService.getTravelPlans();
      return travelPlans;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch travel plans');
    }
  }
);

export const fetchTravelPlanById = createAsyncThunk(
  'travel/fetchTravelPlanById',
  async (id: string, { rejectWithValue }) => {
    try {
      const travelPlan = await TravelService.getTravelPlan(id);
      if (!travelPlan) {
        throw new Error('Travel plan not found');
      }
      return travelPlan;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch travel plan');
    }
  }
);

export const createTravelPlan = createAsyncThunk(
  'travel/createTravelPlan',
  async (travelPlanData: TravelPlanCreateData, { rejectWithValue }) => {
    try {
      const travelPlan = await TravelService.createTravelPlan(travelPlanData);
      return travelPlan;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create travel plan');
    }
  }
);

export const updateTravelPlan = createAsyncThunk(
  'travel/updateTravelPlan',
  async ({ id, data }: { id: string; data: TravelPlanUpdateData }, { rejectWithValue }) => {
    try {
      const updatedTravelPlan = await TravelService.updateTravelPlan(id, data);
      return updatedTravelPlan;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update travel plan');
    }
  }
);

export const deleteTravelPlan = createAsyncThunk(
  'travel/deleteTravelPlan',
  async (id: string, { rejectWithValue }) => {
    try {
      await TravelService.deleteTravelPlan(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete travel plan');
    }
  }
);

export const fetchTravelContactLinks = createAsyncThunk(
  'travel/fetchTravelContactLinks',
  async (travelPlanId: string, { rejectWithValue }) => {
    try {
      const links = await TravelService.getTravelContactLinks(travelPlanId);
      return { travelPlanId, links };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch travel contact links');
    }
  }
);

export const findNearbyContacts = createAsyncThunk(
  'travel/findNearbyContacts',
  async ({ travelPlanId, radiusKm = 50 }: { travelPlanId: string; radiusKm?: number }, { rejectWithValue }) => {
    try {
      const nearbyContacts = await TravelService.findContactsNearDestination(travelPlanId, radiusKm);
      return nearbyContacts.map(item => ({
        contact_id: item.contact.id,
        distanceKm: item.distanceKm
      }));
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to find nearby contacts');
    }
  }
);

// Travel slice
const travelSlice = createSlice({
  name: 'travel',
  initialState,
  reducers: {
    setSelectedTravelPlan: (state, action: PayloadAction<TravelPlan | null>) => {
      state.selectedTravelPlan = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch travel plans
      .addCase(fetchTravelPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTravelPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.travelPlans = action.payload;
      })
      .addCase(fetchTravelPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch travel plan by ID
      .addCase(fetchTravelPlanById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTravelPlanById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTravelPlan = action.payload;
      })
      .addCase(fetchTravelPlanById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create travel plan
      .addCase(createTravelPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTravelPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.travelPlans.push(action.payload);
        state.selectedTravelPlan = action.payload;
      })
      .addCase(createTravelPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update travel plan
      .addCase(updateTravelPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTravelPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.travelPlans = state.travelPlans.map(plan => 
          plan.id === action.payload.id ? action.payload : plan
        );
        state.selectedTravelPlan = action.payload;
      })
      .addCase(updateTravelPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete travel plan
      .addCase(deleteTravelPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTravelPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.travelPlans = state.travelPlans.filter(plan => plan.id !== action.payload);
        if (state.selectedTravelPlan && state.selectedTravelPlan.id === action.payload) {
          state.selectedTravelPlan = null;
        }
      })
      .addCase(deleteTravelPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch travel contact links
      .addCase(fetchTravelContactLinks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTravelContactLinks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.travelContactLinks = action.payload.links;
      })
      .addCase(fetchTravelContactLinks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Find nearby contacts
      .addCase(findNearbyContacts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(findNearbyContacts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nearbyContacts = action.payload;
      })
      .addCase(findNearbyContacts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

// Export actions
export const { setSelectedTravelPlan, clearError } = travelSlice.actions;

// Export selectors
export const selectTravelState = (state: RootState) => state.travel;
export const selectTravelPlans = (state: RootState) => state.travel.travelPlans;
export const selectSelectedTravelPlan = (state: RootState) => state.travel.selectedTravelPlan;
export const selectTravelContactLinks = (state: RootState) => state.travel.travelContactLinks;
export const selectNearbyContacts = (state: RootState) => state.travel.nearbyContacts;
export const selectTravelLoading = (state: RootState) => state.travel.isLoading;
export const selectTravelError = (state: RootState) => state.travel.error;

export default travelSlice.reducer; 