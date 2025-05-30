import { useColorScheme } from 'react-native';
import { COLORS } from '@/app/core/constants/theme';

export interface Theme {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    accent2: string;
    accent3: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#32FFA5',
    background: '#FFFFFF',
    card: '#F5F5F5',
    text: '#121212',
    textSecondary: '#6B6B6B',
    border: '#DDDDDD',
    accent: '#BE93FD',
    accent2: '#FF93B9',
    accent3: '#32FFA5',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
  },
};

const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#32FFA5',
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#333333',
    accent: '#BE93FD',
    accent2: '#FF93B9',
    accent3: '#32FFA5',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
  },
};

export const useTheme = (): Theme => {
  const colorScheme = useColorScheme();
  return colorScheme === 'light' ? lightTheme : darkTheme;
}; 