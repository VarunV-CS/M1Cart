import { useState, useEffect, useCallback } from 'react';
import eventBus, { CART_EVENTS } from '../utils/eventBus';

/**
 * useCartEvents - A beginner-friendly hook for subscribing to cart events
 */

export const useCartEvents = () => {
  const [eventLogs, setEventLogs] = useState([]);
  const [stats, setStats] = useState({
    added: 0,
    removed: 0,
    updated: 0,
    cleared: 0
  });

  // Add event to log
  const addToLog = useCallback((event, data) => {
    const logEntry = {
      id: Date.now() + Math.random(),
      event,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setEventLogs(prev => [logEntry, ...prev].slice(0, 50));
    
    setStats(prev => ({
      ...prev,
      [event.split(':')[1]]: prev[event.split(':')[1]] + 1
    }));
  }, []);

  // Subscribe to cart events on mount
  useEffect(() => {
    const unsubscribers = [];

    // Subscribe to add event
    unsubscribers.push(
      eventBus.subscribe(CART_EVENTS.ADD, (data) => {
        addToLog(CART_EVENTS.ADD, data);
      })
    );

    // Subscribe to remove event
    unsubscribers.push(
      eventBus.subscribe(CART_EVENTS.REMOVE, (data) => {
        addToLog(CART_EVENTS.REMOVE, data);
      })
    );

    // Subscribe to update event
    unsubscribers.push(
      eventBus.subscribe(CART_EVENTS.UPDATE, (data) => {
        addToLog(CART_EVENTS.UPDATE, data);
      })
    );

    // Subscribe to clear event
    unsubscribers.push(
      eventBus.subscribe(CART_EVENTS.CLEAR, () => {
        addToLog(CART_EVENTS.CLEAR, null);
      })
    );

    // Cleanup on unmount
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [addToLog]);

  // Clear event logs
  const clearLogs = useCallback(() => {
    setEventLogs([]);
    setStats({ added: 0, removed: 0, updated: 0, cleared: 0 });
  }, []);

  // Manually trigger a custom event (for testing)
  const triggerEvent = useCallback((eventName, data) => {
    eventBus.publish(eventName, data);
  }, []);

  return {
    eventLogs,
    stats,
    clearLogs,
    triggerEvent,
    CART_EVENTS
  };
};

export default useCartEvents;

