import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { isAuthenticated, getUser } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart } = useCart();
  const { isDark } = useTheme();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Get user data
    const userData = getUser();
    
    // Check if user is a seller - redirect to seller dashboard
    if (userData?.role === 'seller') {
      navigate('/seller-dashboard');
      return;
    }
    
    // Check if user is an admin - redirect to admin dashboard
    if (userData?.role === 'admin') {
      navigate('/admin-dashboard');
      return;
    }
    
    setUser(userData);
    setIsLoading(false);

    // If just logged in, sync cart from backend
    if (location.state?.justLoggedIn && cartItems.length === 0) {
      // The cart context will handle loading cart from backend
    }
  }, [navigate, location.state, cartItems.length]);

  if (isLoading) {
    return (
      <div className={`dashboard-container ${isDark ? 'dark' : ''}`}>
        <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
      </div>
    );
  }

  const getCartTotal = () => {
    const total = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    // Round to 2 decimal places to avoid floating-point precision issues
    return Math.round(total * 100) / 100;
  };

  return (
    <div className={`dashboard-container ${isDark ? 'dark' : ''}`}>
      <div className="dashboard-header">
        <h1>Welcome, {user?.name || user?.email || 'User'}!</h1>
        <p className="dashboard-email">{user?.email}</p>
      </div>

      <div className="dashboard-content">
        <div className="cart-section">
          <h2>Your Cart ({cartItems.length} items)</h2>
          
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
              <button 
                className="browse-products-btn"
                onClick={() => navigate('/categories')}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={item.pid} className="cart-item-card">
                    <div className="cart-item-image">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    <div className="cart-item-details">
                      <h3>{item.name}</h3>
                      <p className="cart-item-category">{item.category}</p>
                      <div className="cart-item-info">
                        <span className="cart-item-price">${item.price}</span>
                        <span className="cart-item-quantity">Qty: {item.quantity}</span>
                        <span className="cart-item-total">Total: ${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-summary">
                <div className="cart-total">
                  <span>Total Amount:</span>
                  <span className="total-price">${getCartTotal()}</span>
                </div>
                <button 
                  className="checkout-btn"
                  onClick={() => navigate('/cart')}
                >
                  View Full Cart
                </button>
              </div>
            </>
          )}
        </div>

        <div className="user-info-section">
          <h2>Account Information</h2>
          <div className="info-card">
            <div className="info-item">
              <label>Name:</label>
              <span>{user?.name || 'Not set'}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>
            <div className="info-item">
              <label>Role:</label>
              <span className="role-badge">{user?.role || 'buyer'}</span>
            </div>
          </div>
          
          <div className="account-actions">
            <button 
              className="orders-btn"
              onClick={() => navigate('/orders')}
            >
              Your Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

