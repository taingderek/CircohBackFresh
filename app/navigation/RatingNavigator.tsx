import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RatingStackParamList } from './types';
import { ReviewsScreen } from '../screens/rating/ReviewsScreen';
import { colors } from '../constants/colors';

const Stack = createNativeStackNavigator<RatingStackParamList>();

export const RatingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primaryDark,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: colors.primaryDark,
        },
      }}
    >
      <Stack.Screen 
        name="Reviews" 
        component={ReviewsScreen} 
        options={{
          title: 'Reviews',
          headerLargeTitle: true,
        }}
      />
    </Stack.Navigator>
  );
};