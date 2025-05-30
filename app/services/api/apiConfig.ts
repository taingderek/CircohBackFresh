import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Constants from 'expo-constants';

// Get API URL from app config (environment variables)
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://api.circohback.com';

// Create and configure axios instance for app-wide use
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add interceptor to handle request configuration
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // You can add auth token here or other request processing
    // const token = await SecureStore.getItemAsync('userToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add interceptor to handle network errors gracefully
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Format network errors for better debugging
    if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      console.log('Network connection error:', error.message);
      return Promise.reject({
        isNetworkError: true,
        message: 'Unable to connect to the server. Please check your internet connection.',
        originalError: error,
      });
    }
    
    // Handle timeout errors
    if (error.code === 'ETIMEDOUT' || (error.message && error.message.includes('timeout'))) {
      console.log('Request timeout:', error.message);
      return Promise.reject({
        isTimeoutError: true,
        message: 'Request took too long to complete. Please try again.',
        originalError: error,
      });
    }
    
    // Handle API errors with consistent format
    if (error.response) {
      const statusCode = error.response.status;
      const responseData = error.response.data as any;
      const errorMessage = responseData?.message || 'An error occurred';
      
      // Log API errors
      console.log(`API Error ${statusCode}:`, errorMessage);
      
      // Return structured error object
      return Promise.reject({
        statusCode,
        message: errorMessage,
        data: error.response.data,
        originalError: error,
      });
    }
    
    // For all other errors
    return Promise.reject(error);
  }
);

// Default export for easier imports
export default apiClient; 