/**
 * Simple event emitter implementation for handling events within the app
 */
export class EventEmitter {
  private events: { [key: string]: Array<(data: any) => void> } = {};

  /**
   * Subscribe to an event
   * @param event Event name
   * @param callback Function to call when event is emitted
   * @returns Unsubscribe function
   */
  public on(event: string, callback: (data: any) => void): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  /**
   * Emit an event with data
   * @param event Event name
   * @param data Data to pass to event handlers
   */
  public emit(event: string, data: any): void {
    const callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Remove all event listeners
   * @param event Optional event name to clear specific event
   */
  public clear(event?: string): void {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

// Default export for expo-router compatibility
export default EventEmitter; 