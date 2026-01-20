/**
 * EventBus - A simple Pub-Sub (Publisher-Subscriber) implementation
 * Subscribers listen for specific events
 */

const eventBus = {
  // Map to store event names and their subscribers
  events: new Map(),
  
  // Subscribe to an event
  subscribe(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
    
    // Return unsubscribe function for easy cleanup
    return () => {
      this.unsubscribe(event, callback);
    };
  },
  
  // Unsubscribe from an event
  unsubscribe(event, callback) {
    if (this.events.has(event)) {
      this.events.get(event).delete(callback);
      // Clean up empty event maps
      if (this.events.get(event).size === 0) {
        this.events.delete(event);
      }
    }
  },
  
  // Publish an event with data
  publish(event, data = {}) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
  },
  
  // Get list of all events (for debugging)
  getEvents() {
    return Array.from(this.events.keys());
  },
  
  // Get subscriber count for an event (for debugging)
  getSubscriberCount(event) {
    return this.events.has(event) ? this.events.get(event).size : 0;
  },
  
  clear() {
    this.events.clear();
  }
};

// Cart-specific event names
export const CART_EVENTS = {
  ADD: 'cart:add',
  REMOVE: 'cart:remove',
  UPDATE: 'cart:update',
  CLEAR: 'cart:clear'
};

// Theme-specific event names
export const THEME_EVENTS = {
  CHANGE: 'theme:change'
};

// Notification event names
export const NOTIFICATION_EVENTS = {
  ADD: 'notification:add',
  REMOVE: 'notification:remove',
  CLEAR: 'notification:clear'
};

export default eventBus;

