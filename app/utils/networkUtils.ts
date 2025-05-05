import { Platform } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from '../core/utils/EventEmitter';
import { v4 as uuidv4 } from 'uuid';

// Suppress network error messages in development
LogBox.ignoreLogs(['Network request failed']);

type ConnectionInfo = {
  isConnected: boolean;
  isWifi: boolean;
  isCellular: boolean;
  isInternetReachable: boolean;
  isSlowConnection: boolean;
  details: any;
};

// Connection quality thresholds and timeouts - adjusted per platform
const SLOW_RESPONSE_THRESHOLD_MS = Platform.OS === 'ios' ? 2000 : 3000;  // Consider connection slow above this threshold
const TIMEOUT_MS_NORMAL = Platform.OS === 'ios' ? 15000 : 30000;  // Normal operations
const TIMEOUT_MS_CRITICAL = Platform.OS === 'ios' ? 30000 : 45000;  // Critical operations like authentication
const TIMEOUT_MS_BACKGROUND = Platform.OS === 'ios' ? 60000 : 90000;  // Background operations

// Create event emitter for network events
export const networkEvents = new EventEmitter();

// Types for network utilities
export type ConnectionQuality = 'unknown' | 'poor' | 'good' | 'excellent';
export type RequestQueueItem = {
  id: string;
  request: () => Promise<any>;
  timestamp: number;
  priority: 'high' | 'normal' | 'low';
  retryCount: number;
  maxRetries: number;
  type: 'data' | 'auth' | 'media';  // Type of request for prioritization
};

// Status flags for network operations
export type NetworkStatus = {
  isNetworkAvailable: boolean;
  isSupabaseReachable: boolean;
  lastConnectionCheck: number;
  connectionQuality: ConnectionQuality;
  offlineQueueSize: number;
  isProcessingQueue: boolean;
};

// State for the network queue
let offlineQueue: RequestQueueItem[] = [];
let requestMap: Record<string, { resolve: Function, reject: Function, timestamp: number }> = {};
let isProcessingQueue = false;
let networkMonitorInitialized = false;
let lastConnectionState: boolean | null = null;
let lastConnectionQuality: ConnectionQuality = 'unknown';
let consecutiveTimeouts = 0;

// Network status object
export const networkStatus: NetworkStatus = {
  isNetworkAvailable: false,
  isSupabaseReachable: false,
  lastConnectionCheck: 0,
  connectionQuality: 'unknown',
  offlineQueueSize: 0,
  isProcessingQueue: false,
};

/**
 * Initialize network monitoring
 */
export const initNetworkMonitoring = (): void => {
  if (networkMonitorInitialized) return;
  
  console.log('🌐 Network monitor initialized');
  
  // Restore offline queue from storage
  loadOfflineQueue().catch(err => 
    console.error('Failed to load offline queue:', err)
  );
  
  // Listen for network state changes
  NetInfo.addEventListener(handleNetworkStateChange);
  
  // Check initial state
  NetInfo.fetch().then(state => {
    lastConnectionState = state.isConnected;
    networkStatus.isNetworkAvailable = !!state.isConnected;
    
    if (state.isConnected) {
      // Check connection quality
      checkConnectionQuality().then(result => {
        lastConnectionQuality = result.quality;
        networkStatus.connectionQuality = result.quality;
        networkStatus.lastConnectionCheck = Date.now();
      });
      
      // Process offline queue if we have network
      processOfflineQueue().catch(err => 
        console.error('Failed to process offline queue:', err)
      );
    }
  });
  
  // Set up periodic connection quality checks
  setInterval(async () => {
    try {
      // Only check quality if we're online
      if (networkStatus.isNetworkAvailable) {
        const result = await checkConnectionQuality();
        
        // Update network status
        networkStatus.connectionQuality = result.quality;
        networkStatus.lastConnectionCheck = Date.now();
        
        // Only emit event if quality changed
        if (result.quality !== lastConnectionQuality) {
          lastConnectionQuality = result.quality;
          networkEvents.emit('connectionQualityChange', { quality: result.quality });
        }
      }
    } catch (error) {
      console.warn('Error checking connection quality:', error);
    }
  }, 60000); // Check every minute
  
  networkMonitorInitialized = true;
};

/**
 * Handle network state changes
 */
const handleNetworkStateChange = (state: NetInfoState): void => {
  const isConnected = state.isConnected || false;
  
  // Update network status
  networkStatus.isNetworkAvailable = isConnected;
  
  // Connection state changed
  if (lastConnectionState !== isConnected) {
    // Emit event
    networkEvents.emit('connectionChange', { 
      isConnected, 
      type: state.type,
      details: state.details 
    });
    
    // Connection recovered - process offline queue
    if (isConnected && !lastConnectionState) {
      console.log('🌐 Device back online - processing offline queue');
      
      // Reset consecutive timeouts when connection is restored
      consecutiveTimeouts = 0;
      
      // Check connection quality
      checkConnectionQuality().then(result => {
        lastConnectionQuality = result.quality;
        networkStatus.connectionQuality = result.quality;
        networkStatus.lastConnectionCheck = Date.now();
        
        // Process queue after quality check
        processOfflineQueue().catch(err => 
          console.error('Failed to process offline queue:', err)
        );
      });
    }
    
    lastConnectionState = isConnected;
  }
};

/**
 * Process the offline request queue
 */
const processOfflineQueue = async (): Promise<void> => {
  if (isProcessingQueue || offlineQueue.length === 0) return;
  
  // Get current network state
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) return;
  
  isProcessingQueue = true;
  networkStatus.isProcessingQueue = true;
  
  try {
    // First, prioritize auth requests - they are most critical
    const authRequests = offlineQueue.filter(item => item.type === 'auth');
    const dataRequests = offlineQueue.filter(item => item.type === 'data');
    const mediaRequests = offlineQueue.filter(item => item.type === 'media');
    
    // Process auth requests first, then data, then media
    const priorityGroups = [
      // Auth requests by priority
      authRequests.filter(item => item.priority === 'high'),
      authRequests.filter(item => item.priority === 'normal'),
      authRequests.filter(item => item.priority === 'low'),
      
      // Data requests by priority
      dataRequests.filter(item => item.priority === 'high'),
      dataRequests.filter(item => item.priority === 'normal'),
      dataRequests.filter(item => item.priority === 'low'),
      
      // Media requests by priority
      mediaRequests.filter(item => item.priority === 'high'),
      mediaRequests.filter(item => item.priority === 'normal'),
      mediaRequests.filter(item => item.priority === 'low'),
    ];
    
    // Process items in priority order
    const results: Array<{ id: string; success: boolean; error?: any }> = [];
    
    for (const group of priorityGroups) {
      for (const item of group) {
        try {
          // Execute the request
          const result = await item.request();
          
          // Remove from queue on success
          offlineQueue = offlineQueue.filter(i => i.id !== item.id);
          
          // Resolve the promise if it's still in the map
          if (requestMap[item.id]) {
            requestMap[item.id].resolve(result);
            delete requestMap[item.id];
          }
          
          results.push({ id: item.id, success: true });
        } catch (error) {
          // Increment retry count
          const queueItem = offlineQueue.find(i => i.id === item.id);
          if (queueItem) {
            queueItem.retryCount += 1;
            
            // Remove if max retries reached
            if (queueItem.retryCount >= queueItem.maxRetries) {
              offlineQueue = offlineQueue.filter(i => i.id !== item.id);
              
              // Reject the promise if it's still in the map
              if (requestMap[item.id]) {
                requestMap[item.id].reject(error);
                delete requestMap[item.id];
              }
              
              results.push({ id: item.id, success: false, error });
            }
          }
        }
      }
    }
    
    // Update queue size
    networkStatus.offlineQueueSize = offlineQueue.length;
    
    // Save updated queue
    await saveOfflineQueue();
    
    // Emit event with results
    networkEvents.emit('queueProcessed', { results });
  } catch (error) {
    console.error('Error processing offline queue:', error);
  } finally {
    isProcessingQueue = false;
    networkStatus.isProcessingQueue = false;
  }
};

/**
 * Save offline queue to persistent storage
 */
const saveOfflineQueue = async (): Promise<void> => {
  if (offlineQueue.length === 0) {
    // Clear storage if queue is empty
    await AsyncStorage.removeItem('circohback-offline-queue');
    return;
  }
  
  // Convert queue to a format that can be stored
  // (we can't store functions, so we'll need a way to reconstruct them)
  const storableQueue = offlineQueue.map(item => ({
    id: item.id,
    timestamp: item.timestamp,
    priority: item.priority,
    retryCount: item.retryCount,
    maxRetries: item.maxRetries,
    type: item.type,
    // Note: we can't save the actual request function
    // You'll need a system to recreate these based on ID or other metadata
  }));
  
  try {
    await AsyncStorage.setItem('circohback-offline-queue', JSON.stringify(storableQueue));
  } catch (error) {
    console.error('Error saving offline queue:', error);
  }
};

/**
 * Load offline queue from persistent storage
 * Note: This only loads the metadata, not the actual request functions
 */
const loadOfflineQueue = async (): Promise<void> => {
  try {
    const queueData = await AsyncStorage.getItem('circohback-offline-queue');
    if (!queueData) return;
    
    // Parse the queue data
    const storableQueue = JSON.parse(queueData);
    
    // We can't restore the actual request functions here
    // This is a placeholder for now - in a real app, you would need
    // a system to recreate the request functions based on saved metadata
    console.log(`Found ${storableQueue.length} items in offline queue`);
    
    // Update queue size in network status
    networkStatus.offlineQueueSize = storableQueue.length;
    
    // Clear the stored queue as we can't actually use it without the request functions
    await AsyncStorage.removeItem('circohback-offline-queue');
  } catch (error) {
    console.error('Error parsing offline queue:', error);
    await AsyncStorage.removeItem('circohback-offline-queue');
  }
};

/**
 * Add a request to the offline queue
 */
export const addToOfflineQueue = async (
  request: () => Promise<any>,
  options: {
    id?: string;
    priority?: 'high' | 'normal' | 'low';
    maxRetries?: number;
    type?: 'data' | 'auth' | 'media';
  } = {}
): Promise<string> => {
  const { 
    id = uuidv4(),
    priority = 'normal', 
    maxRetries = 3,
    type = 'data'
  } = options;
  
  // Check if already in queue
  const existing = offlineQueue.find(item => item.id === id);
  if (existing) return id;
  
  // Add to queue
  offlineQueue.push({
    id,
    request,
    timestamp: Date.now(),
    priority,
    retryCount: 0,
    maxRetries,
    type,
  });
  
  // Update queue size
  networkStatus.offlineQueueSize = offlineQueue.length;
  
  // Save queue
  await saveOfflineQueue();
  
  // Emit event
  networkEvents.emit('requestQueued', { id, priority, type });
  
  return id;
};

/**
 * Fetch with timeout and retry logic
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = TIMEOUT_MS_NORMAL
): Promise<Response> => {
  return new Promise((resolve, reject) => {
    // Set up timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      
      // Track consecutive timeouts for connection quality assessment
      consecutiveTimeouts++;
      
      // If we have multiple consecutive timeouts, degrade our connection quality estimate
      if (consecutiveTimeouts >= 3) {
        lastConnectionQuality = 'poor';
        networkStatus.connectionQuality = 'poor';
        networkEvents.emit('connectionQualityChange', { quality: 'poor' });
      }
    }, timeoutMs);
    
    fetch(url, {
      ...options,
      signal: controller.signal,
    })
      .then(response => {
        clearTimeout(timeoutId);
        // Reset consecutive timeouts on successful fetch
        consecutiveTimeouts = 0;
        resolve(response);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};

/**
 * Fetch with retry logic and exponential backoff
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  backoffFactor: number = 2,
  initialDelayMs: number = 1000,
  timeoutMs: number = TIMEOUT_MS_NORMAL
): Promise<Response> => {
  let retryCount = 0;
  let lastError: Error | null = null;
  
  while (retryCount <= maxRetries) {
    try {
      // Add retry count header for debugging
      const headers = new Headers(options.headers || {});
      headers.append('X-Retry-Count', retryCount.toString());
      
      // Check network state before attempt
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('Network is offline');
      }
      
      const response = await fetchWithTimeout(url, {
        ...options,
        headers,
      }, timeoutMs);
      
      return response;
    } catch (error: any) {
      retryCount++;
      lastError = error;
      
      // Don't retry if we've hit the max
      if (retryCount > maxRetries) break;
      
      // Don't retry certain errors
      if (error.name === 'AbortError' && !error.message.includes('timeout')) {
        // User aborted, don't retry
        throw error;
      }
      
      // Calculate backoff delay with exponential increase and a bit of randomness
      const delay = initialDelayMs * Math.pow(backoffFactor, retryCount - 1) * (0.75 + Math.random() * 0.5);
      
      console.log(`Request failed (attempt ${retryCount}/${maxRetries + 1}): ${error.message}`);
      console.log(`Retrying in ${Math.round(delay)}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All retries failed
  throw lastError || new Error('Maximum retries reached');
};

/**
 * Check connection quality by measuring response time
 */
export const checkConnectionQuality = async (): Promise<{
  quality: ConnectionQuality;
  responseTimeMs: number;
  isConnected: boolean;
}> => {
  try {
    // First check if we're connected at all
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      return {
        quality: 'unknown',
        responseTimeMs: 0,
        isConnected: false,
      };
    }
    
    // Measure response time to a small resource
    const startTime = Date.now();
    
    try {
      // Use a small, reliable endpoint
      await fetchWithTimeout(
        'https://www.google.com/generate_204',
        { method: 'HEAD' },
        5000 // 5 second timeout for this test
      );
      
      const responseTime = Date.now() - startTime;
      
      // Determine quality based on response time
      let quality: ConnectionQuality;
      if (responseTime < 300) {
        quality = 'excellent';
      } else if (responseTime < SLOW_RESPONSE_THRESHOLD_MS) {
        quality = 'good';
      } else {
        quality = 'poor';
      }
      
      // Update network status
      networkStatus.isNetworkAvailable = true;
      networkStatus.connectionQuality = quality;
      networkStatus.lastConnectionCheck = Date.now();
      
      return {
        quality,
        responseTimeMs: responseTime,
        isConnected: true,
      };
    } catch (error) {
      // Connection test failed
      const responseTime = Date.now() - startTime;
      
      // Update network status
      networkStatus.isNetworkAvailable = true;
      networkStatus.connectionQuality = 'poor';
      networkStatus.lastConnectionCheck = Date.now();
      
      return {
        quality: 'poor',
        responseTimeMs: responseTime,
        isConnected: true,
      };
    }
  } catch (error) {
    // NetInfo fetch failed
    networkStatus.isNetworkAvailable = false;
    
    return {
      quality: 'unknown',
      responseTimeMs: 0,
      isConnected: false,
    };
  }
};

/**
 * Execute a function with offline queue fallback and auto-retry
 */
export const executeWithOfflineSupport = async <T>(
  fn: () => Promise<T>,
  options: {
    id?: string;
    priority?: 'high' | 'normal' | 'low';
    maxRetries?: number;
    type?: 'data' | 'auth' | 'media';
    timeout?: number;
  } = {}
): Promise<T> => {
  const { 
    id = uuidv4(),
    priority = 'normal', 
    maxRetries = 3,
    type = 'data',
    timeout = TIMEOUT_MS_NORMAL
  } = options;
  
  // Enhanced function with timeout
  const enhancedFn = async (): Promise<T> => {
    return new Promise((resolve, reject) => {
      // Create a timeout
      const timeoutId = setTimeout(() => {
        reject(new Error('Request timed out'));
      }, timeout);
      
      // Execute the function
      fn().then(result => {
        clearTimeout(timeoutId);
        resolve(result);
      }).catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });
  };
  
  try {
    // Check if we're online
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      // Queue for later and return a promise that will resolve when processed
      return new Promise((resolve, reject) => {
        // Add to request map
        requestMap[id] = { resolve, reject, timestamp: Date.now() };
        
        // Add to queue
        addToOfflineQueue(enhancedFn, { id, priority, maxRetries, type })
          .catch(err => reject(err));
      });
    }
    
    // Execute normally if online
    return await enhancedFn();
  } catch (error: any) {
    // If it's a network error, queue for later
    if (
      error.message.includes('Network request failed') ||
      error.message.includes('timeout') ||
      error.message.includes('connection') ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED'
    ) {
      return new Promise((resolve, reject) => {
        // Add to request map
        requestMap[id] = { resolve, reject, timestamp: Date.now() };
        
        // Add to queue
        addToOfflineQueue(enhancedFn, { id, priority, maxRetries, type })
          .catch(err => reject(err));
      });
    }
    
    // Otherwise, rethrow
    throw error;
  }
};

/**
 * Handles network errors with appropriate user feedback
 */
export const handleNetworkError = (error: any): string => {
  // Extract error message
  let errorMessage = typeof error === 'string' 
    ? error 
    : error?.message || 'Unknown network error';
  
  // Convert common error messages to user-friendly versions
  if (errorMessage.includes('Network request failed')) {
    return 'Connection error. Please check your internet connection.';
  }
  
  if (errorMessage.includes('nobridge')) {
    return 'Unable to reach the server. Please check your connection or try again later.';
  }
  
  if (errorMessage.includes('timeout')) {
    return 'Request timed out. Please try again when you have a stronger connection.';
  }
  
  if (errorMessage.includes('JSON')) {
    return 'Error processing data. Please try again later.';
  }
  
  if (errorMessage.includes('auth')) {
    return 'Authentication error. Please sign in again.';
  }
  
  // Return default error message for other cases
  return errorMessage;
};

/**
 * Check if device is online and can reach our API
 */
export const isOnlineAndReachable = async (): Promise<boolean> => {
  try {
    const netInfo = await NetInfo.fetch();
    
    // Not connected at all
    if (!netInfo.isConnected) {
      return false;
    }
    
    // Try to reach our API
    if (netInfo.isInternetReachable === false) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Error checking online status:', error);
    return false;
  }
};

/**
 * Get timeout based on connection quality and operation importance
 */
export const getAdaptiveTimeout = (
  operationType: 'normal' | 'critical' | 'background' = 'normal'
): number => {
  // Base timeout depends on operation type
  let baseTimeout;
  switch (operationType) {
    case 'critical':
      baseTimeout = TIMEOUT_MS_CRITICAL;
      break;
    case 'background':
      baseTimeout = TIMEOUT_MS_BACKGROUND;
      break;
    case 'normal':
    default:
      baseTimeout = TIMEOUT_MS_NORMAL;
      break;
  }
  
  // Adjust based on connection quality
  switch (networkStatus.connectionQuality) {
    case 'excellent':
      return baseTimeout;
    case 'good':
      return Math.round(baseTimeout * 1.2); // 20% longer
    case 'poor':
      return Math.round(baseTimeout * 1.5); // 50% longer
    case 'unknown':
    default:
      return baseTimeout;
  }
};

// Export default for Expo Router compatibility
export default {
  initNetworkMonitoring,
  fetchWithTimeout,
  fetchWithRetry,
  checkConnectionQuality,
  executeWithOfflineSupport,
  networkEvents,
  networkStatus,
  getAdaptiveTimeout,
}; 