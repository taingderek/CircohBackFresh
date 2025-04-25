import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ScoreService, CircohBackScore, Rating } from '../../services/ScoreService';

// Types
interface ScoreState {
  score: number;
  breakdown: {
    consistency: number;
    empathy: number;
    thoughtfulness: number;
  };
  ratings: Rating[];
  isLoading: boolean;
  error: string | null;
}

// Async thunks
export const fetchScore = createAsyncThunk(
  'score/fetchScore',
  async (_, { rejectWithValue }) => {
    try {
      const score = await ScoreService.getScore();
      
      if (!score) {
        return rejectWithValue('Failed to fetch CircohBack score');
      }
      
      return score;
    } catch (error) {
      return rejectWithValue('Failed to fetch CircohBack score');
    }
  }
);

export const updateScore = createAsyncThunk(
  'score/updateScore',
  async (_, { rejectWithValue }) => {
    try {
      const score = await ScoreService.updateScore();
      
      if (!score) {
        return rejectWithValue('Failed to update CircohBack score');
      }
      
      return score;
    } catch (error) {
      return rejectWithValue('Failed to update CircohBack score');
    }
  }
);

export const fetchRatings = createAsyncThunk(
  'score/fetchRatings',
  async (_, { rejectWithValue }) => {
    try {
      const ratings = await ScoreService.getReceivedRatings();
      return ratings;
    } catch (error) {
      return rejectWithValue('Failed to fetch ratings');
    }
  }
);

export const submitRating = createAsyncThunk(
  'score/submitRating',
  async (params: {
    ratedUserId: string;
    stars: number;
    comment?: string;
    anonymous?: boolean;
  }, { rejectWithValue }) => {
    try {
      const success = await ScoreService.submitRating(
        params.ratedUserId,
        params.stars,
        params.comment,
        params.anonymous
      );
      
      if (!success) {
        return rejectWithValue('Failed to submit rating');
      }
      
      return true;
    } catch (error) {
      return rejectWithValue('Failed to submit rating');
    }
  }
);

// Initial state
const initialState: ScoreState = {
  score: 500, // Default starting score
  breakdown: {
    consistency: 0,
    empathy: 0,
    thoughtfulness: 0
  },
  ratings: [],
  isLoading: false,
  error: null
};

// Slice
const scoreSlice = createSlice({
  name: 'score',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch score
      .addCase(fetchScore.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchScore.fulfilled, (state, action) => {
        state.isLoading = false;
        state.score = action.payload.score;
        state.breakdown = action.payload.breakdown;
      })
      .addCase(fetchScore.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update score
      .addCase(updateScore.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateScore.fulfilled, (state, action) => {
        state.isLoading = false;
        state.score = action.payload.score;
        state.breakdown = action.payload.breakdown;
      })
      .addCase(updateScore.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch ratings
      .addCase(fetchRatings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRatings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ratings = action.payload;
      })
      .addCase(fetchRatings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Submit rating - no state change needed, just loading/error states
      .addCase(submitRating.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitRating.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(submitRating.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export default scoreSlice.reducer; 