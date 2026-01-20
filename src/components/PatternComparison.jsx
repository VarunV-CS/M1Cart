import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import useCartEvents from '../hooks/useCartEvents';
import eventBus, { CART_EVENTS } from '../utils/eventBus';
import { 
  Card, 
  Button, 
  Badge, 
  Container, 
  Stack,
  Heading2,
  Heading3,
  Paragraph,
  Caption,
  Text,
  Flex
} from './patterns';
import './PatternComparison.css';

/**
 * ObserverPatternDemo - Components "observe" state changes through Context
 */

const ObserverPatternDemo = () => {
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { success, info } = useNotification();
  
  const handleAddToCart = (product) => {
    addToCart(product);
    success(`Added ${product.name} to cart!`);
  };

  return (
    <Card variant="outlined" className="pattern-card">
      <Card.Header>
        <Heading3>Observer Pattern (Context)</Heading3>
      </Card.Header>
      <Card.Body>
        <Paragraph size="small" className="mb-4">
          Uses React Context + useState. Components subscribe to context and 
          automatically update when state changes.
        </Paragraph>
        
        <Stack spacing="medium">
          <div className="observer-state">
            <Caption>Cart State (from Context)</Caption>
            <div className="cart-items-display">
              {cartItems.length === 0 ? (
                <Text variant="muted">Cart is empty</Text>
              ) : (
                cartItems.map(item => (
                  <Flex key={item.id} justify="space-between" align="center" className="cart-item-row">
                    <Text>{item.name} x {item.quantity}</Text>
                    <Badge variant="primary">{item.price * item.quantity}</Badge>
                    <Button 
                      size="small" 
                      variant="secondary"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </Button>
                  </Flex>
                ))
              )}
            </div>
          </div>
          
          <div className="demo-products">
            <Caption>Demo Products</Caption>
            <Flex gap="small" className="flex-wrap">
              {[
                { id: 101, name: 'Laptop', price: 999 },
                { id: 102, name: 'Mouse', price: 29 },
                { id: 103, name: 'Keyboard', price: 79 }
              ].map(product => (
                <Button 
                  key={product.id}
                  size="small"
                  onClick={() => handleAddToCart(product)}
                >
                  Add {product.name} (${product.price})
                </Button>
              ))}
            </Flex>
          </div>
          
          {cartItems.length > 0 && (
            <Button variant="danger" onClick={() => {
              clearCart();
              info('Cart cleared');
            }}>
              Clear Cart
            </Button>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
};

/**
 * PubSubPatternDemo - Publishers emit events without knowing subscribers
 */

const PubSubPatternDemo = () => {
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { eventLogs, stats, clearLogs } = useCartEvents();
  const { info } = useNotification();
  
  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <Card variant="outlined" className="pattern-card">
      <Card.Header>
        <Heading3>Pub-Sub Pattern (EventBus)</Heading3>
      </Card.Header>
      <Card.Body>
        <Paragraph size="small" className="mb-4">
          Uses EventBus for loose-coupled communication. Components publish 
          and subscribe to events without direct dependencies.
        </Paragraph>
        
        <Stack spacing="medium">
          {/* Event Stats */}
          <div className="event-stats">
            <Caption>Event Statistics</Caption>
            <Flex gap="small" className="flex-wrap">
              <Badge variant="success">Added: {stats.added}</Badge>
              <Badge variant="danger">Removed: {stats.removed}</Badge>
              <Badge variant="info">Updated: {stats.updated}</Badge>
              <Badge variant="warning">Cleared: {stats.cleared}</Badge>
            </Flex>
          </div>
          
          {/* Demo Products */}
          <div className="demo-products">
            <Caption>Demo Products</Caption>
            <Flex gap="small" className="flex-wrap">
              {[
                { id: 201, name: 'Headphones', price: 149 },
                { id: 202, name: 'Monitor', price: 299 },
                { id: 203, name: 'USB Cable', price: 19 }
              ].map(product => (
                <Button 
                  key={product.id}
                  size="small"
                  variant="secondary"
                  onClick={() => handleAddToCart(product)}
                >
                  Add {product.name} (${product.price})
                </Button>
              ))}
            </Flex>
          </div>
          
          {/* Event Logs */}
          <div className="event-logs">
            <Flex justify="space-between" align="center">
              <Caption>Event Log (Live)</Caption>
              {eventLogs.length > 0 && (
                <Button size="small" variant="ghost" onClick={clearLogs}>
                  Clear Logs
                </Button>
              )}
            </Flex>
            <div className="log-container">
              {eventLogs.length === 0 ? (
                <Text variant="muted" size="small">No events yet. Add items to cart!</Text>
              ) : (
                eventLogs.map(log => (
                  <div key={log.id} className="log-entry">
                    <Badge 
                      variant={
                        log.event === CART_EVENTS.ADD ? 'success' :
                        log.event === CART_EVENTS.REMOVE ? 'danger' :
                        log.event === CART_EVENTS.UPDATE ? 'info' : 'warning'
                      }
                      size="small"
                    >
                      {log.event.split(':')[1].toUpperCase()}
                    </Badge>
                    <Text size="small">
                      {log.data?.product?.name || 'Cart'} 
                      {log.event === CART_EVENTS.UPDATE && ` x${log.data?.product?.quantity}`}
                    </Text>
                    <Text variant="muted" size="small">{log.timestamp}</Text>
                  </div>
                ))
              )}
            </div>
          </div>
        </Stack>
      </Card.Body>
    </Card>
  );
};

/**
 * PatternComparison - Main component comparing Observer vs Pub-Sub patterns
 */
const PatternComparison = () => {
  const [activeTab, setActiveTab] = useState('comparison');

  return (
    <Container size="large" className="py-6 pattern-comparison">
      <Heading2 className="mb-4">Pub-Sub vs Observer Pattern</Heading2>
      
      <Paragraph className="mb-6">
        This demo shows two different approaches for managing state and communication 
        in a React application. Both patterns solve the problem of keeping multiple 
        components in sync, but with different trade-offs.
      </Paragraph>
      
      {/* Tab Navigation */}
      <Flex gap="small" className="mb-6">
        <Button 
          variant={activeTab === 'comparison' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('comparison')}
        >
          Side by Side Comparison
        </Button>
        <Button 
          variant={activeTab === 'observer' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('observer')}
        >
          Observer Only
        </Button>
        <Button 
          variant={activeTab === 'pubsub' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('pubsub')}
        >
          Pub-Sub Only
        </Button>
      </Flex>
      
      {/* Comparison View */}
      {activeTab === 'comparison' && (
        <div className="comparison-grid">
          <div className="comparison-section">
            <Heading3 className="mb-4">Observer Pattern</Heading3>
            <ObserverPatternDemo />
          </div>
          <div className="comparison-section">
            <Heading3 className="mb-4">Pub-Sub Pattern</Heading3>
            <PubSubPatternDemo />
          </div>
        </div>
      )}
      
      {/* Individual Views */}
      {activeTab === 'observer' && (
        <ObserverPatternDemo />
      )}
      
      {activeTab === 'pubsub' && (
        <PubSubPatternDemo />
      )}
      
      {/* Code Examples */}
      <Card variant="outlined" className="mt-6">
        <Card.Header>
          <Heading3>Code Comparison</Heading3>
        </Card.Header>
        <Card.Body>
          <Stack spacing="large">
            <div>
              <Caption>Observer Pattern (Context)</Caption>
              <pre className="code-block">
{`// Provider manages state
const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  
  const addToCart = (product) => {
    setCartItems(prev => [...prev, product]);
  };
  
  return (
    <CartContext.Provider value={{ cartItems, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Consumer subscribes to changes
const CartDisplay = () => {
  const { cartItems } = useCart(); // Auto-updates on change
  return <div>{cartItems.length} items</div>;
};`}
              </pre>
            </div>
            
            <div>
              <Caption>Pub-Sub Pattern (EventBus)</Caption>
              <pre className="code-block">
{`// Publisher emits events
const addToCart = (product) => {
  setCartItems(prev => [...prev, product]);
  eventBus.publish('cart:add', { product });
};

// Subscriber listens for events
useEffect(() => {
  const unsub = eventBus.subscribe('cart:add', (data) => {
    console.log('Item added:', data.product.name);
    // Analytics, logging, etc.
  });
  return () => unsub();
}, []);`}
              </pre>
            </div>
          </Stack>
        </Card.Body>
      </Card>
      
      {/* Key Differences */}
      <Card variant="outlined" className="mt-6">
        <Card.Header>
          <Heading3>Key Differences</Heading3>
        </Card.Header>
        <Card.Body>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Aspect</th>
                <th>Observer (Context)</th>
                <th>Pub-Sub (EventBus)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Coupling</td>
                <td>Tight (must be in Provider tree)</td>
                <td>Loose (no dependency)</td>
              </tr>
              <tr>
                <td>Use Case</td>
                <td>State management</td>
                <td>Events, analytics, logging</td>
              </tr>
              <tr>
                <td>Update Mechanism</td>
                <td>React re-render</td>
                <td>Callback functions</td>
              </tr>
              <tr>
                <td>Performance</td>
                <td>Can cause unnecessary renders</td>
                <td>More selective subscriptions</td>
              </tr>
              <tr>
                <td>Learning Curve</td>
                <td>React built-in</td>
                <td>Requires understanding events</td>
              </tr>
            </tbody>
          </table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PatternComparison;

