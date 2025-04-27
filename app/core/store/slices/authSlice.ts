import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../../services/supabaseClient';
import { userService } from '../../services/userService';
import { AuthState, UserProfile } from '../../types/user';
import { RootState } from '../index';

// Define the initial state
const initialState: AuthState = {
  user: null,
  session: null,
  profile: null,
  isLoading: false,
  error: null,
};

// Get the current session
export const getSession = createAsyncThunk(
  'auth/getSession',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        return rejectWithValue(error.message);
      }
      
      // If user is logged in, get their profile
      if (data.session) {
        const profile = await userService.getCurrentUserProfile();
        return { 
          session: data.session,
          user: data.session.user,
          profile
        };
      }
      
      return { session: null, user: null, profile: null };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Sign up
export const signUp = createAsyncThunk(
  'auth/signUp',
  async (credentials: { email: string, password: string, metadata?: Record<string, any> }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: credentials.metadata
        }
      });
      
      if (error) {
        return rejectWithValue(error.message);
      }
      
      // After successful signup, get the user profile
      if (data.user) {
        const profile = await userService.getCurrentUserProfile();
        return { 
          session: data.session,
          user: data.user,
          profile
        };
      }
      
      return { session: data.session, user: data.user, profile: null };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Sign in
export const signIn = createAsyncThunk(
  'auth/signIn',
  async (credentials: { email: string, password: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) {
        return rejectWithValue(error.message);
      }
      
      // After successful signin, get the user profile
      const profile = await userService.getCurrentUserProfile();
      
      return { 
        session: data.session,
        user: data.user,
        profile
      };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Sign out
export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return rejectWithValue(error.message);
      }
      
      return null;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Reset password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'myapp://reset-password-callback',
      });
      
      if (error) {
        return rejectWithValue(error.message);
      }
      
      return true;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Sign in with Google
export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      
      if (error) {
        return rejectWithValue(error.message);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Sign in with Apple
export const signInWithApple = createAsyncThunk(
  'auth/signInWithApple',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
      });
      
      if (error) {
        return rejectWithValue(error.message);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Update user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: any, { rejectWithValue }) => {
    try {
      const profile = await userService.updateProfile(profileData);
      
      if (!profile) {
        return rejectWithValue('Failed to update profile');
      }
      
      return { profile };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get session
    builder.addCase(getSession.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getSession.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.profile = action.payload.profile;
    });
    builder.addCase(getSession.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Sign up
    builder.addCase(signUp.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signUp.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.profile = action.payload.profile;
    });
    builder.addCase(signUp.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Sign in
    builder.addCase(signIn.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signIn.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.profile = action.payload.profile;
    });
    builder.addCase(signIn.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Sign out
    builder.addCase(signOut.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signOut.fulfilled, (state) => {
      state.isLoading = false;
      state.user = null;
      state.session = null;
      state.profile = null;
    });
    builder.addCase(signOut.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Reset password
    builder.addCase(resetPassword.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(resetPassword.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Update profile
    builder.addCase(updateProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.profile = action.payload.profile;
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

// Export actions
export const { clearError } = authSlice.actions;

// Export selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectSession = (state: RootState) => state.auth.session;
export const selectProfile = (state: RootState) => state.auth.profile;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.session;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectError = (state: RootState) => state.auth.error;
export const selectIsPremium = (state: RootState) => !!state.auth.profile?.subscription.isPremium;

// Export reducer
export default authSlice.reducer; 