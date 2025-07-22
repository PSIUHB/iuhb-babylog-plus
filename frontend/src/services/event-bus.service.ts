import { ref } from 'vue';

/**
 * Simple event bus for application-wide events
 */
class EventBusService {
  private listeners: Record<string, Array<(...args: any[]) => void>> = {};

  /**
   * Register a listener for a specific event
   * @param event Event name
   * @param callback Function to call when event is emitted
   * @returns Function to remove the listener
   */
  on(event: string, callback: (...args: any[]) => void): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return a function to remove this listener
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Remove a listener for a specific event
   * @param event Event name
   * @param callback Function to remove
   */
  off(event: string, callback: (...args: any[]) => void): void {
    if (!this.listeners[event]) return;
    
    const index = this.listeners[event].indexOf(callback);
    if (index !== -1) {
      this.listeners[event].splice(index, 1);
    }
  }

  /**
   * Emit an event with optional arguments
   * @param event Event name
   * @param args Arguments to pass to listeners
   */
  emit(event: string, ...args: any[]): void {
    if (!this.listeners[event]) return;
    
    this.listeners[event].forEach(callback => {
      callback(...args);
    });
  }
}

// Create a singleton instance
const eventBus = new EventBusService();

export default eventBus;