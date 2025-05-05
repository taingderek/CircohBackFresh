/**
 * Simple EventEmitter implementation for React Native
 * This replaces the Node.js 'events' module which is not available in React Native
 */

type EventCallback = (...args: any[]) => void;

export class EventEmitter {
  private events: Record<string, EventCallback[]> = {};

  /**
   * Add an event listener
   */
  public on(event: string, listener: EventCallback): this {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  /**
   * Add a one-time event listener
   */
  public once(event: string, listener: EventCallback): this {
    const onceWrapper = (...args: any[]) => {
      listener(...args);
      this.off(event, onceWrapper);
    };
    return this.on(event, onceWrapper);
  }

  /**
   * Remove an event listener
   */
  public off(event: string, listener: EventCallback): this {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
    return this;
  }

  /**
   * Remove all listeners for an event
   */
  public removeAllListeners(event?: string): this {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }

  /**
   * Emit an event
   */
  public emit(event: string, ...args: any[]): boolean {
    if (!this.events[event]) {
      return false;
    }
    
    this.events[event].forEach(listener => {
      listener(...args);
    });
    
    return true;
  }

  /**
   * Get all listeners for an event
   */
  public listeners(event: string): EventCallback[] {
    return this.events[event] || [];
  }
}

// Default export for expo-router compatibility
export default EventEmitter; 