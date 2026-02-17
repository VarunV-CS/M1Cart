import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState, useEffect, useCallback } from 'react';
import { useWindowSize } from '../hooks/useWindowSize';
import ThemeToggle from './ThemeToggle';
import withLogger from '../hocs/withLogger';
import { isAuthenticated, getUser } from '../services/api';
import { Spinner } from '../components/patterns';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartItemsCount, handleLogout } = useCart();
  const windowSize = useWindowSize();
  const isMobile = windowSize.width < 768;
  const cartCount = getCartItemsCount();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Check auth state - use callback to avoid dependency issues
  const checkAuth = useCallback(() => {
    if (isAuthenticated()) {
      const userData = getUser();
      setUser(userData);
    } else {
      setUser(null);
    }
    setIsAuthLoading(false);
  }, []);

  useEffect(() => {
    // Check auth state on mount
    checkAuth();

    // Listen for custom auth change events (from same tab - login/logout)
    const handleAuthChange = (e) => {
      if (e.detail?.type === 'login' || e.detail?.type === 'register') {
        const userData = e.detail.user || getUser();
        setUser(userData);
        setIsAuthLoading(false);
      } else if (e.detail?.type === 'logout') {
        setUser(null);
        setIsAuthLoading(false);
      }
    };
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user' || e.key === 'isAuthenticated') {
        checkAuth();
      }
    };

    window.addEventListener('m1cart-auth-change', handleAuthChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('m1cart-auth-change', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuth]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Render navigation immediately - show spinner only for auth-dependent links
  // Navigation shell always renders, auth links show loading state
  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="logo">
          M1Cart
        </Link>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>
        <div className="nav-links">
          <Link
            to="/"
            className={location.pathname === '/' ? 'active' : ''}
          >
            Home
          </Link>
          <Link 
            to="/categories" 
            className={location.pathname === '/categories' ? 'active' : ''}
          >
            Categories
          </Link>
          <Link 
            to="/cart" 
            className={`cart-link ${location.pathname === '/cart' ? 'active' : ''}`}
          >
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          {isAuthLoading ? (
            // Show loading state while checking auth
            <span className="auth-loading">
              <Spinner size="small" text="" />
            </span>
          ) : isAuthenticated() ? (
            <>
              <Link 
                to={user?.role === 'admin' ? '/admin-dashboard' : user?.role === 'seller' ? '/seller-dashboard' : '/dashboard'} 
                className={`dashboard-link ${location.pathname === '/dashboard' || location.pathname === '/admin-dashboard' || location.pathname === '/seller-dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <button 
                className="logout-button"
                onClick={() => {
                  handleLogout();
                  navigate('/login');
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className={`login-button ${location.pathname === '/login' ? 'active' : ''}`}
            >
              Login / Signup
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default withLogger(Navigation, 'Navigation');
