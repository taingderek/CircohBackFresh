import { configureStore, combineReducers, Action, ThunkAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER as REGISTER_PERSIST,
} from 'redux-persist';

// Import slices
import authReducer from './slices/authSlice';
import contactsReducer from './slices/contactsSlice';
import remindersReducer from './slices/remindersSlice';
import memoriesReducer from './slices/memoriesSlice';
import messagingReducer from './slices/messagingSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import scoreReducer from './slices/scoreSlice';
import travelReducer from './slices/travelSlice';
import notificationReducer from './slices/notificationSlice';
import growthScoreReducer from '../../features/growth-score/growthScoreSlice';
// These will be implemented later:
// import messagingReducer from './slices/messagingSlice';
// import subscriptionReducer from './slices/subscriptionSlice';

// Configure persistence for each reducer
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['user', 'session'],
};

const contactsPersistConfig = {
  key: 'contacts',
  storage: AsyncStorage,
  whitelist: ['contacts', 'selectedCategory'],
};

const remindersPersistConfig = {
  key: 'reminders',
  storage: AsyncStorage,
  whitelist: ['dueReminders', 'upcomingReminders'],
};

const memoriesPersistConfig = {
  key: 'memories',
  storage: AsyncStorage,
  whitelist: ['memories', 'contactMemories'],
};

const travelPersistConfig = {
  key: 'travel',
  storage: AsyncStorage,
  whitelist: ['travelPlans'],
};

const notificationPersistConfig = {
  key: 'notifications',
  storage: AsyncStorage,
  whitelist: ['notifications'],
};

const growthScorePersistConfig = {
  key: 'growthScore',
  storage: AsyncStorage,
  whitelist: ['activities', 'streaks', 'achievements'],
};

// Combine all reducers
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  contacts: persistReducer(contactsPersistConfig, contactsReducer),
  reminders: persistReducer(remindersPersistConfig, remindersReducer),
  memories: persistReducer(memoriesPersistConfig, memoriesReducer),
  messaging: messagingReducer,
  subscription: subscriptionReducer,
  score: scoreReducer,
  travel: persistReducer(travelPersistConfig, travelReducer),
  notifications: persistReducer(notificationPersistConfig, notificationReducer),
  growthScore: persistReducer(growthScorePersistConfig, growthScoreReducer),
  // These will be added as we implement them:
  // messaging: messagingReducer,
  // subscription: subscriptionReducer,
});

// Configure the Redux store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions to avoid serialization errors
        ignoredActions: [
          'auth/login/fulfilled', 
          'auth/register/fulfilled', 
          FLUSH, 
          REHYDRATE, 
          PAUSE, 
          PERSIST, 
          PURGE, 
          REGISTER_PERSIST
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp', 'register'],
        // Ignore these paths in the state
        ignoredPaths: [
          'auth.user.created_at', 
          'auth.user.updated_at',
          'growthScore.levelProgress',
          'growthScore.activities',
          'growthScore.lastUpdateTime'
        ],
      },
    }),
});

// Set up listeners for RTK Query
setupListeners(store.dispatch);

// Create the persisted store
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default store; 