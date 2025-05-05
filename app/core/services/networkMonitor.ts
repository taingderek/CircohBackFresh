/**
 * Network Monitor Service
 * 
 * Provides network connectivity monitoring and offline queue management.
 * Handles automatic retry of failed requests when connectivity is restored.
 */

import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { EventEmitter } from '../utils/EventEmitter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config, { IS_DEV } from '../config/environment';

// Types for offline queue
interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body?: any;
  headers: Record<string, string>;
  addedAt: number;
  attempts: number;
}

// Events emitted by the network monitor
export enum NetworkEvents {
  ONLINE = 'online',
  OFFLINE = 'offline',
  CONNECTIVITY_CHANGED = 'connectivity_changed',
  REQUEST_QUEUED = 'request_queued',
  QUEUE_PROCESSED = 'queue_processed'
}

class NetworkMonitor extends EventEmitter {
  private isConnected: boolean = true;
  private isInternetReachable: boolean = true;
  private netInfoSubscription: NetInfoSubscription | null = null;
  private offlineQueue: QueuedRequest[] = [];
  private isProcessingQueue: boolean = false;
  private readonly MAX_QUEUE_SIZE = 100;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly QUEUE_STORAGE_KEY = '@network_offline_queue';
  
  constructor() {
    super();
    this.initNetworkListener();
    this.loadOfflineQueue();
  }
  
  /**
   * Initialize network state listener
   */
  private initNetworkListener(): void {
    // Get initial state
    NetInfo.fetch().then(this.handleNetworkStateChange);
    
    // Subscribe to network changes
    this.netInfoSubscription = NetInfo.addEventListener(this.handleNetworkStateChange);
    
    if (IS_DEV) {
      console.log('🌐 Network monitor initialized');
    }
  }
  
  /**
   * Handle network state changes
   */
  private handleNetworkStateChange = (state: NetInfoState): void => {
    const wasConnected = this.isConnected;
    const wasReachable = this.isInternetReachable;
    
    this.isConnected = !!state.isConnected;
    this.isInternetReachable = !!state.isInternetReachable;
    
    // Emit events based on connectivity changes
    if (wasConnected !== this.isConnected || wasReachable !== this.isInternetReachable) {
      this.emit(NetworkEvents.CONNECTIVITY_CHANGED, {
        isConnected: this.isConnected,
        isInternetReachable: this.isInternetReachable,
        type: state.type,
        details: state.details
      });
      
      if (this.isConnected && this.isInternetReachable) {
        this.emit(NetworkEvents.ONLINE);
        this.processOfflineQueue();
      } else if (!this.isConnected || !this.isInternetReachable) {
        this.emit(NetworkEvents.OFFLINE);
      }
    }
  };
  
  /**
   * Check if the device is online
   */
  public isOnline(): boolean {
    return this.isConnected && this.isInternetReachable;
  }
  
  /**
   * Add a request to the offline queue
   */
  public queueRequest(request: Omit<QueuedRequest, 'id' | 'addedAt' | 'attempts'>): string {
    const id = Math.random().toString(36).substring(2, 15);
    
    const queuedRequest: QueuedRequest = {
      ...request,
      id,
      addedAt: Date.now(),
      attempts: 0
    };
    
    // Add to queue, maintaining max size
    this.offlineQueue.push(queuedRequest);
    
    // Trim queue if it exceeds max size
    if (this.offlineQueue.length > this.MAX_QUEUE_SIZE) {
      this.offlineQueue = this.offlineQueue.slice(-this.MAX_QUEUE_SIZE);
    }
    
    // Save queue
    this.saveOfflineQueue();
    
    // Emit event
    this.emit(NetworkEvents.REQUEST_QUEUED, { 
      queueSize: this.offlineQueue.length, 
      requestId: id 
    });
    
    return id;
  }
  
  /**
   * Process the offline queue when connectivity is restored
   */
  private async processOfflineQueue(): Promise<void> {
    if (!this.isOnline() || this.isProcessingQueue || this.offlineQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    try {
      const queue = [...this.offlineQueue];
      const processed: string[] = [];
      const failed: string[] = [];
      
      for (const request of queue) {
        try {
          // Skip if too many attempts
          if (request.attempts >= this.MAX_RETRY_ATTEMPTS) {
            failed.push(request.id);
            continue;
          }
          
          // Update attempt count
          request.attempts++;
          
          // Execute the request
          const response = await fetch(request.url, {
            method: request.method,
            headers: request.headers,
            body: request.body ? JSON.stringify(request.body) : undefined
          });
          
          if (response.ok) {
            processed.push(request.id);
          } else {
            // Keep in queue for retry if server error
            if (response.status >= 500) {
              // Update retry count but keep in queue
            } else {
              // Client error, remove from queue
              failed.push(request.id);
            }
          }
        } catch (error) {
          // Network error, keep in queue for retry
          console.warn(`Failed to process queued request ${request.id}:`, error);
        }
      }
      
      // Remove processed and failed requests
      this.offlineQueue = this.offlineQueue.filter(
        req => !processed.includes(req.id) && !failed.includes(req.id)
      );
      
      // Save updated queue
      await this.saveOfflineQueue();
      
      // Emit event
      this.emit(NetworkEvents.QUEUE_PROCESSED, {
        processed: processed.length,
        failed: failed.length,
        remaining: this.offlineQueue.length
      });
    } finally {
      this.isProcessingQueue = false;
    }
  }
  
  /**
   * Save the offline queue to persistent storage
   */
  private async saveOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.QUEUE_STORAGE_KEY,
        JSON.stringify(this.offlineQueue)
      );
    } catch (error) {
      console.warn('Failed to save offline queue:', error);
    }
  }
  
  /**
   * Load the offline queue from persistent storage
   */
  private async loadOfflineQueue(): Promise<void> {
    try {
      const json = await AsyncStorage.getItem(this.QUEUE_STORAGE_KEY);
      
      if (json) {
        this.offlineQueue = JSON.parse(json);
        
        // Process queue if we're online
        if (this.isOnline() && this.offlineQueue.length > 0) {
          this.processOfflineQueue();
        }
      }
    } catch (error) {
      console.warn('Failed to load offline queue:', error);
      this.offlineQueue = [];
    }
  }
  
  /**
   * Clear the offline queue
   */
  public async clearOfflineQueue(): Promise<void> {
    this.offlineQueue = [];
    await this.saveOfflineQueue();
  }
  
  /**
   * Get the current offline queue
   */
  public getOfflineQueue(): QueuedRequest[] {
    return [...this.offlineQueue];
  }
  
  /**
   * Clean up resources when no longer needed
   */
  public cleanup(): void {
    if (this.netInfoSubscription) {
      this.netInfoSubscription();
      this.netInfoSubscription = null;
    }
    
    this.removeAllListeners();
  }
}

// Create singleton instance
export const networkMonitor = new NetworkMonitor();

// Default export
export default networkMonitor; 