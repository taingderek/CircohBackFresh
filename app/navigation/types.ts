import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RatingStackParamList = {
  Reviews: undefined;
  ReviewDetail: { reviewId: string };
};

export type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Contacts: undefined;
  Rating: undefined;
  // Add other main routes here
};

export type RootTabParamList = {
  Home: undefined;
  Contacts: undefined;
  Rating: undefined;
  Settings: undefined;
  // Add other tab routes here
};

// Helper types for stack screen props
export type RatingStackScreenProps<T extends keyof RatingStackParamList> = 
  NativeStackScreenProps<RatingStackParamList, T>;

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>; 