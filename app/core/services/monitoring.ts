/**
 * Monitoring Service
 * 
 * Centralized service for monitoring app performance, reporting errors,
 * and collecting analytics. This abstraction allows us to swap providers
 * or use multiple providers without changing application code.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorUtils } from 'react-native';

// Get environment variables
const ENV = Constants.expoConfig?.extra?.env || 'development';
const IS_DEV = ENV === 'development';
const ENABLE_CRASH_REPORTING = process.env.ENABLE_CRASH_REPORTING === 'true';
const ENABLE_ANALYTICS = process.env.ENABLE_ANALYTICS === 'true';
const ENABLE_REMOTE_LOGGING = process.env.ENABLE_REMOTE_LOGGING === 'true';

// Types for error tracking
interface ErrorDetails {
  fatal?: boolean;
  type?: string;
  promiseId?: string;
  [key: string]: any;
}

// Types for analytics
type EventName = string;
interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

// User identification
interface UserInfo {
  id?: string;
  email?: string;
  username?: string;
  subscription?: string;
  [key: string]: any;
}

/**
 * Console logger with environment-based filtering
 */
class Logger {
  private prefix: string;
  
  constructor(prefix: string = 'CircohBack') {
    this.prefix = prefix;
  }
  
  /**
   * Format message with prefix and timestamp
   */
  protected format(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${this.prefix}] [${level}] ${message}`;
  }
  
  /**
   * Debug level logging (development only)
   */
  debug(message: string, ...args: any[]): void {
    if (IS_DEV) {
      console.debug(this.format('DEBUG', message), ...args);
    }
  }
  
  /**
   * Info level logging
   */
  info(message: string, ...args: any[]): void {
    console.info(this.format('INFO', message), ...args);
  }
  
  /**
   * Warning level logging
   */
  warn(message: string, ...args: any[]): void {
    console.warn(this.format('WARN', message), ...args);
  }
  
  /**
   * Error level logging
   */
  error(message: string, error?: Error | unknown, ...args: any[]): void {
    console.error(
      this.format('ERROR', message),
      error instanceof Error ? { message: error.message, stack: error.stack } : error,
      ...args
    );
  }
}

/**
 * Remote logging implementation (when enabled)
 */
class RemoteLogger extends Logger {
  private queue: string[] = [];
  private isSending = false;
  private maxQueueSize = 100;
  private sendInterval = 10000; // 10 seconds
  
  constructor() {
    super('CircohBack');
    
    // Set up periodic sending
    if (ENABLE_REMOTE_LOGGING) {
      setInterval(() => this.sendLogs(), this.sendInterval);
      this.loadQueue();
    }
  }
  
  /**
   * Load persisted log queue
   */
  private async loadQueue(): Promise<void> {
    try {
      const savedQueue = await AsyncStorage.getItem('@logs_queue');
      if (savedQueue) {
        this.queue = JSON.parse(savedQueue);
      }
    } catch (error) {
      super.error('Failed to load log queue', error);
    }
  }
  
  /**
   * Save log queue to persistent storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem('@logs_queue', JSON.stringify(this.queue));
    } catch (error) {
      super.error('Failed to save log queue', error);
    }
  }
  
  /**
   * Send logs to remote server
   */
  private async sendLogs(): Promise<void> {
    if (!ENABLE_REMOTE_LOGGING || this.isSending || this.queue.length === 0) {
      return;
    }
    
    this.isSending = true;
    
    try {
      // Simplified example - in production, use an actual logging service API
      const batchLogs = this.queue.splice(0, 20); // Process in batches of 20
      
      // Use AbortController for timeout instead of timeout property
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      // Replace with actual API call
      const response = await fetch('https://api.circohback.com/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs: batchLogs,
          device: {
            platform: Platform.OS,
            version: Platform.Version,
            appVersion: Application.nativeApplicationVersion,
            buildVersion: Application.nativeBuildVersion,
            deviceId: await getDeviceId()
          }
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to send logs: ${response.status}`);
      }
      
      // If successful, we've already removed the sent logs from the queue
      this.saveQueue();
    } catch (error) {
      // Failed to send, put the logs back in the queue
      super.error('Failed to send logs', error);
    } finally {
      this.isSending = false;
    }
  }
  
  /**
   * Add log to queue
   */
  private queueLog(level: string, message: string, ...args: any[]): void {
    if (!ENABLE_REMOTE_LOGGING) {
      return;
    }
    
    // Format the log entry
    const formattedMessage = this.format(level, message);
    
    // Add to queue, limiting size
    this.queue.push(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message: formattedMessage,
      details: args.length > 0 ? JSON.stringify(args) : undefined
    }));
    
    // Keep queue size under control
    if (this.queue.length > this.maxQueueSize) {
      this.queue = this.queue.slice(-this.maxQueueSize);
    }
    
    // Save queue periodically
    this.saveQueue();
  }
  
  /**
   * Override base logger methods to queue logs for remote sending
   */
  override debug(message: string, ...args: any[]): void {
    super.debug(message, ...args);
    if (ENABLE_REMOTE_LOGGING && IS_DEV) {
      this.queueLog('DEBUG', message, ...args);
    }
  }
  
  override info(message: string, ...args: any[]): void {
    super.info(message, ...args);
    if (ENABLE_REMOTE_LOGGING) {
      this.queueLog('INFO', message, ...args);
    }
  }
  
  override warn(message: string, ...args: any[]): void {
    super.warn(message, ...args);
    if (ENABLE_REMOTE_LOGGING) {
      this.queueLog('WARN', message, ...args);
    }
  }
  
  override error(message: string, error?: Error | unknown, ...args: any[]): void {
    super.error(message, error, ...args);
    if (ENABLE_REMOTE_LOGGING) {
      this.queueLog('ERROR', message, error, ...args);
    }
  }
}

/**
 * Error tracking implementation
 */
class ErrorTracker {
  private enabled: boolean;
  private logger: Logger;
  private userInfo: UserInfo | null = null;
  
  constructor(logger: Logger) {
    this.enabled = ENABLE_CRASH_REPORTING;
    this.logger = logger;
    
    if (this.enabled) {
      // Set up global error handler for unhandled JS errors
      const originalErrorHandler = ErrorUtils.getGlobalHandler();
      
      ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
        this.captureError(error, { fatal: isFatal || false });
        // Call original handler
        originalErrorHandler(error, isFatal);
      });
      
      // Set up promise rejection handler
      const unhandledRejectionHandler = (id: string, rejection: any) => {
        this.captureError(rejection, { 
          type: 'unhandled_promise_rejection',
          promiseId: id
        });
      };
      
      // @ts-ignore: Valid in React Native but may not be in TypeScript defs
      if (global.HermesInternal) {
        // Hermes-specific error handling
        // @ts-ignore
        global.HermesInternal?.enablePromiseRejectionTracker?.(unhandledRejectionHandler);
      } else {
        // Regular React Native
        const tracking = require('promise/setimmediate/rejection-tracking');
        tracking.enable({
          allRejections: true,
          onUnhandled: unhandledRejectionHandler,
        });
      }
    }
  }
  
  /**
   * Set user information for error reports
   */
  setUser(user: UserInfo | null): void {
    // Store user info, but sanitize and limit what's stored
    if (user) {
      this.userInfo = {
        id: user.id,
        email: maskEmail(user.email),
        subscription: user.subscription,
      };
    } else {
      this.userInfo = null;
    }
  }
  
  /**
   * Capture and report an error
   */
  captureError(error: Error | unknown, details: Partial<ErrorDetails> = {}): void {
    if (!this.enabled) {
      return;
    }
    
    // Extract error information
    const errorObject = error instanceof Error ? error : new Error(String(error));
    
    // Log locally first
    this.logger.error('Error captured', errorObject, details);
    
    // Send to error tracking service
    this.reportError(errorObject, details);
  }
  
  /**
   * Send error to error tracking service
   */
  private async reportError(error: Error, details: Partial<ErrorDetails>): Promise<void> {
    try {
      // In production, integrate with actual error tracking service like Sentry
      // This is a simplified example
      const errorReport = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        app: {
          version: Application.nativeApplicationVersion,
          build: Application.nativeBuildVersion,
          env: ENV
        },
        device: {
          platform: Platform.OS,
          version: Platform.Version,
          deviceId: await getDeviceId()
        },
        user: this.userInfo,
        details
      };
      
      // Simple logging for development
      if (IS_DEV) {
        this.logger.debug('Error report created', errorReport);
        return;
      }
      
      // Send to error tracking service
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://api.circohback.com/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to report error: ${response.status}`);
      }
    } catch (reportError) {
      // Don't recursively report errors in the error reporter
      this.logger.error('Failed to report error', reportError);
    }
  }
}

/**
 * Analytics implementation
 */
class Analytics {
  private enabled: boolean;
  private logger: Logger;
  private userInfo: UserInfo | null = null;
  private sessionId: string;
  private lastScreenName: string | null = null;
  
  constructor(logger: Logger) {
    this.enabled = ENABLE_ANALYTICS;
    this.logger = logger;
    this.sessionId = generateUUID();
    
    if (this.enabled) {
      // Initialize analytics session
      this.trackEvent('session_start', {
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Set user information for analytics
   */
  setUser(user: UserInfo | null): void {
    if (user) {
      this.userInfo = {
        id: user.id,
        email: maskEmail(user.email),
        subscription: user.subscription,
      };
      
      // Track user identification if changed
      this.trackEvent('user_identified', {
        userId: user.id,
        subscription: user.subscription
      });
    } else {
      this.userInfo = null;
    }
  }
  
  /**
   * Track a screen view
   */
  trackScreen(screenName: string, properties: EventProperties = {}): void {
    if (!this.enabled) {
      return;
    }
    
    // Don't record duplicate consecutive screens
    if (this.lastScreenName === screenName) {
      return;
    }
    
    this.lastScreenName = screenName;
    
    this.trackEvent('screen_view', {
      screenName,
      ...properties
    });
    
    this.logger.debug(`Screen viewed: ${screenName}`, properties);
  }
  
  /**
   * Track an event
   */
  trackEvent(eventName: EventName, properties: EventProperties = {}): void {
    if (!this.enabled) {
      return;
    }
    
    // Add standard properties
    const eventData = {
      eventName,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      ...properties
    };
    
    // Log locally
    this.logger.debug(`Event tracked: ${eventName}`, eventData);
    
    // Send to analytics service
    this.sendEvent(eventData);
  }
  
  /**
   * Send event to analytics service
   */
  private async sendEvent(eventData: any): Promise<void> {
    try {
      // For development, just log locally
      if (IS_DEV) {
        return;
      }
      
      // Prepare event data with user and device info
      const fullEventData = {
        ...eventData,
        user: this.userInfo,
        app: {
          version: Application.nativeApplicationVersion,
          build: Application.nativeBuildVersion,
          env: ENV
        },
        device: {
          platform: Platform.OS,
          version: Platform.Version,
          deviceId: await getDeviceId()
        }
      };
      
      // Send to analytics service
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch('https://api.circohback.com/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullEventData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
    } catch (error) {
      this.logger.error('Failed to send analytics event', error);
    }
  }
}

/**
 * Performance monitoring implementation
 */
class PerformanceMonitor {
  private enabled: boolean;
  private logger: Logger;
  private traces: Map<string, { startTime: number, metrics: Record<string, number> }> = new Map();
  
  constructor(logger: Logger) {
    this.enabled = ENABLE_ANALYTICS; // Reuse analytics flag
    this.logger = logger;
  }
  
  /**
   * Start a performance trace
   */
  startTrace(traceName: string): void {
    if (!this.enabled) {
      return;
    }
    
    if (this.traces.has(traceName)) {
      this.logger.warn(`Performance trace "${traceName}" already exists and will be overwritten`);
    }
    
    this.traces.set(traceName, {
      startTime: Date.now(), // Use Date.now() instead of performance.now()
      metrics: {}
    });
  }
  
  /**
   * Stop a performance trace and record its duration
   */
  stopTrace(traceName: string, sendImmediately: boolean = false): void {
    if (!this.enabled) {
      return;
    }
    
    const trace = this.traces.get(traceName);
    
    if (!trace) {
      this.logger.warn(`Performance trace "${traceName}" doesn't exist`);
      return;
    }
    
    const duration = Date.now() - trace.startTime; // Use Date.now() instead of performance.now()
    trace.metrics['duration_ms'] = Math.round(duration);
    
    this.logger.debug(`Performance trace "${traceName}" completed`, {
      duration,
      metrics: trace.metrics
    });
    
    if (sendImmediately) {
      this.sendPerformanceData(traceName, trace.metrics);
    }
    
    this.traces.delete(traceName);
  }
  
  /**
   * Record a metric for an active trace
   */
  recordMetric(traceName: string, metricName: string, value: number): void {
    if (!this.enabled) {
      return;
    }
    
    const trace = this.traces.get(traceName);
    
    if (!trace) {
      this.logger.warn(`Cannot record metric for non-existent trace "${traceName}"`);
      return;
    }
    
    trace.metrics[metricName] = value;
  }
  
  /**
   * Send performance data to monitoring service
   */
  private async sendPerformanceData(traceName: string, metrics: Record<string, number>): Promise<void> {
    try {
      // For development, just log locally
      if (IS_DEV) {
        return;
      }
      
      const performanceData = {
        traceName,
        timestamp: new Date().toISOString(),
        metrics,
        app: {
          version: Application.nativeApplicationVersion,
          build: Application.nativeBuildVersion,
          env: ENV
        },
        device: {
          platform: Platform.OS,
          version: Platform.Version,
          deviceId: await getDeviceId()
        }
      };
      
      // Send to performance monitoring service
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch('https://api.circohback.com/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(performanceData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
    } catch (error) {
      this.logger.error('Failed to send performance data', error);
    }
  }
}

/**
 * Helper: Generate a unique device identifier
 */
async function getDeviceId(): Promise<string> {
  try {
    // Try to get stored device ID
    const storedId = await AsyncStorage.getItem('@device_id');
    if (storedId) {
      return storedId;
    }
    
    // Generate a new ID if none exists
    const deviceId = generateUUID();
    await AsyncStorage.setItem('@device_id', deviceId);
    return deviceId;
  } catch (error) {
    // Fallback to a temporary ID if storage fails
    return generateUUID();
  }
}

/**
 * Helper: Generate a UUID
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Helper: Mask email for privacy
 */
function maskEmail(email?: string): string | undefined {
  if (!email) return undefined;
  
  const parts = email.split('@');
  if (parts.length !== 2) return undefined;
  
  const name = parts[0];
  const domain = parts[1];
  
  // Keep the first character and last character, mask the rest
  let maskedName = name.length <= 2 
    ? name 
    : `${name.charAt(0)}${'*'.repeat(name.length - 2)}${name.charAt(name.length - 1)}`;
  
  return `${maskedName}@${domain}`;
}

// Initialize services
const logger = new RemoteLogger();
const errorTracker = new ErrorTracker(logger);
const analytics = new Analytics(logger);
const performance = new PerformanceMonitor(logger);

// Export combined monitoring service
export const monitoring = {
  logger,
  error: errorTracker,
  analytics,
  performance,
  
  // Helper to set user context across all services
  setUser(user: UserInfo | null): void {
    errorTracker.setUser(user);
    analytics.setUser(user);
  }
};

// Default export for convenience
export default monitoring; 