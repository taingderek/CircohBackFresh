/**
 * API Client Service
 * 
 * Provides a centralized client for API requests with:
 * - Environment-specific configuration
 * - Timeout handling
 * - Retry logic
 * - Offline detection
 * - Authentication token management
 * - Request/response interceptors
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config, { IS_DEV } from '../config/environment';
import monitoring from './monitoring';
import networkMonitor, { NetworkEvents } from './networkMonitor';

// Types
type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type ApiEnvironment = 'development' | 'staging' | 'production';

interface ApiClientOptions {
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  headers?: Record<string, string>;
  enableLogging?: boolean;
  offlineSupport?: boolean;
}

interface RequestOptions {
  method?: ApiMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retry?: boolean;
  maxRetries?: number;
  cacheResponse?: boolean;
  requiresAuth?: boolean;
  offlineSupport?: boolean;
}

interface ApiResponse<T = any> {
  data: T | null;
  status: number;
  headers: Headers;
  error?: string;
  cached?: boolean;
  offlineQueued?: boolean;
  offlineQueueId?: string;
}

// Environment configuration
const API_CONFIG = config.api;
const ENV = config.environment;

// Default client configuration based on environment
const defaultOptions: ApiClientOptions = {
  baseUrl: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  maxRetries: API_CONFIG.maxRetries,
  retryDelay: 1000,
  enableLogging: ENV !== 'development',
  offlineSupport: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Platform': Platform.OS,
    'X-Client-Version': config.version,
    'X-Environment': ENV
  }
};

/**
 * Create a timeout promise that rejects after specified milliseconds
 */
const createTimeoutPromise = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`));
    }, ms);
  });
};

/**
 * API Client class
 */
class ApiClient {
  private options: ApiClientOptions;
  private authToken: string | null = null;
  private monitoringService = ENV !== 'development' ? monitoring : null;

  constructor(options: Partial<ApiClientOptions> = {}) {
    this.options = { ...defaultOptions, ...options };
    this.loadAuthToken();
    
    // Set up network reconnection handler for offline queue
    networkMonitor.on(NetworkEvents.ONLINE, this.handleOnlineEvent);
  }
  
  /**
   * Handle device coming back online
   */
  private handleOnlineEvent = (): void => {
    if (IS_DEV) {
      console.log('🌐 Device back online - processing offline queue');
    }
    
    // Network monitor will automatically process the queue
  };

  /**
   * Load auth token from storage
   */
  private async loadAuthToken(): Promise<void> {
    try {
      this.authToken = await AsyncStorage.getItem('@auth_token');
    } catch (error) {
      console.error('Failed to load auth token:', error);
    }
  }

  /**
   * Set a new auth token
   */
  public setAuthToken(token: string | null): void {
    this.authToken = token;
    if (token) {
      AsyncStorage.setItem('@auth_token', token).catch(err => 
        console.error('Failed to save auth token:', err)
      );
    } else {
      AsyncStorage.removeItem('@auth_token').catch(err => 
        console.error('Failed to remove auth token:', err)
      );
    }
  }

  /**
   * Clear auth token (for logout)
   */
  public clearAuthToken(): void {
    this.setAuthToken(null);
  }

  /**
   * Build request headers including auth token if available
   */
  private buildHeaders(options: RequestOptions): Headers {
    const headers = new Headers(this.options.headers);
    
    // Add any request-specific headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }
    
    // Add auth token if it exists and request requires auth
    if (this.authToken && (options.requiresAuth !== false)) {
      headers.set('Authorization', `Bearer ${this.authToken}`);
    }
    
    return headers;
  }

  /**
   * Build the full URL for a request
   */
  private buildUrl(endpoint: string): string {
    // If the endpoint already starts with http, assume it's a full URL
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    
    // Make sure we don't have double slashes
    const baseUrl = this.options.baseUrl.endsWith('/') 
      ? this.options.baseUrl.slice(0, -1) 
      : this.options.baseUrl;
      
    const formattedEndpoint = endpoint.startsWith('/') 
      ? endpoint 
      : `/${endpoint}`;
      
    return `${baseUrl}${formattedEndpoint}`;
  }

  /**
   * Queue request for offline processing
   */
  private queueOfflineRequest(
    url: string, 
    options: RequestOptions
  ): string {
    const headersObject: Record<string, string> = {};
    const headers = this.buildHeaders(options);
    
    // Convert Headers object to plain object
    headers.forEach((value: string, key: string) => {
      headersObject[key] = value;
    });
    
    return networkMonitor.queueRequest({
      url,
      method: options.method || 'GET',
      body: options.body,
      headers: headersObject
    });
  }

  /**
   * Execute request with retry logic and better error handling
   */
  private async executeRequest<T>(
    url: string,
    options: RequestOptions,
    attempt = 1
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(2, 15);
    
    try {
      // Check if device is online
      const isOnline = networkMonitor.isOnline();
      
      // Handle offline case
      if (!isOnline) {
        const supportOffline = options.offlineSupport !== false && this.options.offlineSupport !== false;
        
        // Only POST, PUT, PATCH, DELETE can be queued
        const canBeQueued = options.method !== 'GET' && supportOffline;
        
        if (canBeQueued) {
          // Queue request for later
          const queueId = this.queueOfflineRequest(url, options);
          
          if (this.options.enableLogging && this.monitoringService) {
            this.monitoringService.logger.info(`API Request queued for offline: ${options.method || 'GET'} ${url}`);
          }
          
          return {
            data: null,
            status: 0,
            headers: new Headers(),
            error: 'Device is offline. Request queued for later.',
            offlineQueued: true,
            offlineQueueId: queueId
          };
        } else {
          throw new Error('No internet connection available');
        }
      }
      
      // Log request if logging is enabled
      if (this.options.enableLogging && this.monitoringService) {
        this.monitoringService.logger.info(`API Request: ${options.method || 'GET'} ${url}`);
      }

      // Create fetch request
      const fetchOptions: RequestInit = {
        method: options.method || 'GET',
        headers: this.buildHeaders(options),
        ...(options.body && { body: JSON.stringify(options.body) })
      };

      // Set timeout
      const timeout = options.timeout || this.options.timeout;
      
      // Execute with timeout
      const fetchPromise = fetch(url, fetchOptions);
      const response = await Promise.race([
        fetchPromise,
        createTimeoutPromise(timeout)
      ]);

      // Parse response
      let data: T | null = null;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/')) {
        const text = await response.text();
        data = text as unknown as T;
      }

      const elapsedTimeMs = Date.now() - startTime;
      
      // Log response if logging is enabled
      if (this.options.enableLogging && this.monitoringService) {
        this.monitoringService.logger.info(`API Response: ${options.method || 'GET'} ${url} - ${response.status} (${elapsedTimeMs}ms)`);
        
        // Track as performance metric in production
        if (ENV === 'production') {
          this.monitoringService.performance.recordMetric(
            'api_call',
            `${options.method || 'GET'}_${url.split('/').pop() || 'root'}`, 
            elapsedTimeMs
          );
        }
      }

      // Check if response is ok (status in 200-299 range)
      if (!response.ok) {
        const errorMessage = data && typeof data === 'object' && 'message' in data
          ? (data as any).message
          : `Request failed with status ${response.status}`;
        
        // Track error if in non-development environment
        if (this.options.enableLogging && this.monitoringService) {
          const apiError = new Error(errorMessage);
          this.monitoringService.error.captureError(apiError, {
            url,
            status: response.status,
            method: options.method || 'GET',
            type: 'api_error'
          });
        }
        
        // Special handling for auth errors
        if (response.status === 401) {
          // The token might be expired
          // You could trigger token refresh logic here
          if (ENV !== 'development') {
            // Only notify in non-development environments
            const authError = new Error('Authentication failed - token may be expired');
            this.monitoringService?.error.captureError(authError, { 
              url,
              type: 'auth_error'
            });
          }
        }
        
        // Retry on server errors (5xx) if retries are enabled
        const shouldRetry = options.retry !== false && 
          response.status >= 500 && 
          attempt <= (options.maxRetries || this.options.maxRetries);
        
        if (shouldRetry) {
          // Exponential backoff
          const delay = this.options.retryDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return this.executeRequest<T>(url, options, attempt + 1);
        }
        
        return { 
          data,
          status: response.status, 
          headers: response.headers,
          error: errorMessage
        };
      }

      return { 
        data, 
        status: response.status, 
        headers: response.headers 
      };
    } catch (error: any) {
      const elapsedTimeMs = Date.now() - startTime;
      
      // Log error if logging is enabled
      if (this.options.enableLogging && this.monitoringService) {
        this.monitoringService.logger.error(`API Error: ${options.method || 'GET'} ${url} - ${error?.message || 'Unknown error'} (${elapsedTimeMs}ms)`);
      }
      
      const isTimeout = error instanceof Error && error.message.includes('timed out');
      const isNetworkError = error instanceof Error && (
        error.message.includes('Network request failed') ||
        error.message.includes('No internet connection')
      );
      
      // Handle offline case
      if (isNetworkError && options.method !== 'GET' && options.offlineSupport !== false) {
        // Queue non-GET requests for later when offline
        const queueId = this.queueOfflineRequest(url, options);
        
        return {
          data: null,
          status: 0,
          headers: new Headers(),
          error: 'Network error. Request queued for later.',
          offlineQueued: true,
          offlineQueueId: queueId
        };
      }
      
      // Track error with more details in non-development environments
      if (this.options.enableLogging && this.monitoringService) {
        const errorType = isTimeout ? 'timeout_error' : isNetworkError ? 'network_error' : 'api_error';
        this.monitoringService.error.captureError(error, {
          url,
          method: options.method || 'GET',
          attempt,
          isTimeout,
          isNetworkError,
          type: errorType
        });
      }
      
      // Retry on network errors or timeouts if retries are enabled
      const shouldRetry = options.retry !== false && 
        (isTimeout || isNetworkError) && 
        attempt <= (options.maxRetries || this.options.maxRetries);
      
      if (shouldRetry) {
        // Exponential backoff
        const delay = this.options.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.executeRequest<T>(url, options, attempt + 1);
      }
      
      return { 
        data: null, 
        status: isNetworkError ? 0 : 408, // 0 for network error, 408 for timeout
        headers: new Headers(),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * GET request
   */
  public async get<T>(
    endpoint: string, 
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.executeRequest<T>(url, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  public async post<T>(
    endpoint: string, 
    body?: any, 
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.executeRequest<T>(url, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  public async put<T>(
    endpoint: string, 
    body?: any, 
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.executeRequest<T>(url, { ...options, method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  public async patch<T>(
    endpoint: string, 
    body?: any, 
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.executeRequest<T>(url, { ...options, method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  public async delete<T>(
    endpoint: string, 
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.executeRequest<T>(url, { ...options, method: 'DELETE' });
  }
  
  /**
   * Get current offline queue
   */
  public getOfflineQueue() {
    return networkMonitor.getOfflineQueue();
  }
  
  /**
   * Clear offline queue
   */
  public clearOfflineQueue() {
    return networkMonitor.clearOfflineQueue();
  }
  
  /**
   * Clean up event listeners and resources
   */
  public cleanup() {
    // Remove network event listener
    networkMonitor.removeAllListeners(NetworkEvents.ONLINE);
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or custom instances
export default ApiClient; 