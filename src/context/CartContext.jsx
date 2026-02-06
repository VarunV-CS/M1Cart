import { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import eventBus, { CART_EVENTS } from '../utils/eventBus';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useLocalStorage('cartItems', []);

  const addToCart = (product) => {
    let addedItem = null;
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.pid === product.pid);
      if (existingItem) {
        const updated = prevItems.map(item =>
          item.pid === product.pid
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        addedItem = { ...existingItem, quantity: existingItem.quantity + 1 };
        return updated;
      }
      addedItem = { ...product, quantity: 1 };
      return [...prevItems, { ...product, quantity: 1 }];
    });

    // Publish event via EventBus (Pub-Sub pattern)
    if (addedItem) {
      eventBus.publish(CART_EVENTS.ADD, {
        product: addedItem,
        cartItems: cartItems // This will have previous value, but acceptable for demo
      });
    }
  };

  const removeFromCart = (productId) => {
    const removedItem = cartItems.find(item => item.pid === productId);
    
    setCartItems(prevItems => prevItems.filter(item => item.pid !== productId));

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
    
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.pid === productId) {
          updatedItem = { ...item, quantity };
          return { ...item, quantity };
        }
        return item;
      })
    );

    // Publish event via EventBus (Pub-Sub pattern)
    if (updatedItem) {
      eventBus.publish(CART_EVENTS.UPDATE, {
        product: updatedItem
      });
    }
  };

  const clearCart = () => {
    setCartItems([]);
    
    // Publish event via EventBus (Pub-Sub pattern)
    eventBus.publish(CART_EVENTS.CLEAR, {
      previousCartSize: cartItems.length
    });
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
