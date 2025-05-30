import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './MainNavigator';

// Import screens
import MainNavigator from './MainNavigator';
import ReviewsScreen from '../screens/rating/ReviewsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Main Stack Navigator
 * 
 * This configures the main stack navigation for the app,
 * including both the tab navigation and standalone screens.
 */
const MainStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main Tab Navigation */}
      <Stack.Screen name="Main" component={MainNavigator} />
      
      {/* Standalone Screens */}
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
    </Stack.Navigator>
  );
};

export default MainStack; 