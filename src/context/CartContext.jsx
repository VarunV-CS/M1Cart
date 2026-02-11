import { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import eventBus, { CART_EVENTS } from '../utils/eventBus';
import { saveCart, loadCart, isAuthenticated, logout as apiLogout, getUser } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Track whether cart has been loaded from backend for logged-in user
  // This prevents anonymous cart from being saved to user account
  const [isBackendCartLoaded, setIsBackendCartLoaded] = useState(false);
  
  // Start with empty cart - cart only loads from backend when logged in
  const [cartItems, setCartItems] = useLocalStorage('cartItems', []);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCartSynced, setIsCartSynced] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const user = getUser();
    if (user) {
      setCurrentUser(user);
    }

    // Listen for auth changes to sync cart on login/logout
    const handleAuthChange = async (e) => {
      if (e.detail?.type === 'login' || e.detail?.type === 'register') {
        // User just logged in, set current user
        const userData = e.detail.user || getUser();
        setCurrentUser(userData);
        
        // CRITICAL: Clear anonymous cart from localStorage BEFORE loading from backend
        // This prevents anonymous cart items from being saved to user account
        window.localStorage.removeItem('cartItems');
        setCartItems([]);
        setIsBackendCartLoaded(false);
        
        // Load cart from backend only (don't use localStorage cart)
        // Local anonymous cart should not override user's saved cart
        const response = await loadCart();
        if (response.success && response.cart && response.cart.length > 0) {
          setCartItems(response.cart);
          setIsBackendCartLoaded(true);
        } else {
          // No saved cart, start fresh
          setCartItems([]);
          setIsBackendCartLoaded(true);
        }
      } else if (e.detail?.type === 'logout') {
        // User logged out - clear cart completely
        setCurrentUser(null);
        setCartItems([]);
        setIsBackendCartLoaded(false);
      }
    };

    window.addEventListener('m1cart-auth-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('m1cart-auth-change', handleAuthChange);
    };
  }, []);

  // Save cart to backend when cart changes and user is logged in
  // IMPORTANT: Only save if cart was loaded from backend, not anonymous cart
  const saveCartToBackend = useCallback(async (items) => {
    // Only save to backend if user is currently authenticated AND cart was loaded from backend
    // This ensures anonymous cart changes are NOT saved to any user
    if (isAuthenticated() && currentUser && isBackendCartLoaded) {
      try {
        setIsCartSynced(false);
        await saveCart(items);
        setIsCartSynced(true);
      } catch (error) {
        console.error('Failed to save cart to backend:', error);
        setIsCartSynced(false);
      }
    }
  }, [currentUser, isBackendCartLoaded]);

  // Load cart from backend when user logs in
  const loadCartFromBackend = useCallback(async () => {
    if (isAuthenticated()) {
      try {
        setIsLoading(true);
        const response = await loadCart();
        if (response.success && response.cart && response.cart.length > 0) {
          setCartItems(response.cart);
        }
        // Mark that cart was loaded from backend
        setIsBackendCartLoaded(true);
        setIsLoading(false);
        return response.cart || [];
      } catch (error) {
        console.error('Failed to load cart from backend:', error);
        setIsBackendCartLoaded(true); // Still mark as loaded even on error
        setIsLoading(false);
        return [];
      }
    }
    return [];
  }, [setCartItems]);

  // Initialize cart from backend if user is logged in on mount
  useEffect(() => {
    if (currentUser && isAuthenticated()) {
      loadCartFromBackend();
    }
  }, [currentUser, loadCartFromBackend]);

  const addToCart = (product) => {
    let addedItem = null;
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.pid === product.pid);
      let updatedItems;
      if (existingItem) {
        updatedItems = prevItems.map(item =>
          item.pid === product.pid
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        addedItem = { ...existingItem, quantity: existingItem.quantity + 1 };
      } else {
        addedItem = { ...product, quantity: 1 };
        updatedItems = [...prevItems, { ...product, quantity: 1 }];
      }
      
      // Save to backend after cart update (only if logged in)
      saveCartToBackend(updatedItems);
      
      return updatedItems;
    });

    // Publish event via EventBus (Pub-Sub pattern)
    if (addedItem) {
      eventBus.publish(CART_EVENTS.ADD, {
        product: addedItem,
        cartItems: cartItems
      });
    }
  };

  const removeFromCart = (productId) => {
    const removedItem = cartItems.find(item => item.pid === productId);
    
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.pid !== productId);
      
      // Save to backend after cart update (only if logged in)
      saveCartToBackend(updatedItems);
      
      return updatedItems;
    });

    // Publish event via EventBus (Pub-Sub pattern)
    if (removedItem) {
      eventBus.publish(CART_EVENTS.REMOVE, {
        product: removedItem
      });
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    let updatedItem = null;
    
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.pid === productId) {
          updatedItem = { ...item, quantity };
          return { ...item, quantity };
        }
        return item;
      });
      
      // Save to backend after cart update (only if logged in)
      saveCartToBackend(updatedItems);
      
      return updatedItems;
    });

    // Publish event via EventBus (Pub-Sub pattern)
    if (updatedItem) {
      eventBus.publish(CART_EVENTS.UPDATE, {
        product: updatedItem
      });
    }
  };

  const clearCart = (clearBackend = true) => {
    // Always clear locally
    setCartItems([]);
    
    // Only clear from backend if user is authenticated
    if (clearBackend && isAuthenticated() && currentUser) {
      saveCartToBackend([]);
    }
    
    // Publish event via EventBus (Pub-Sub pattern)
    eventBus.publish(CART_EVENTS.CLEAR, {
      previousCartSize: cartItems.length
    });
  };

  // Get cart total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Get cart items count
  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Handle logout - clear cart locally and don't save to backend
  const handleLogout = () => {
    // Clear cart locally - don't save anonymous cart to user
    setCartItems([]);
    // Reset backend cart loaded flag so new login will load cart properly
    setIsBackendCartLoaded(false);
    
    // Call API logout to clear tokens
    apiLogout();
    
    // Dispatch logout event to ensure all components know user logged out
    window.dispatchEvent(new CustomEvent('m1cart-auth-change', { 
      detail: { type: 'logout' } 
    }));
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    loadCartFromBackend,
    handleLogout,
    isLoading,
    isCartSynced,
    currentUser,
    setCurrentUser,
    isBackendCartLoaded
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

