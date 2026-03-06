import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import withLogger from '../hocs/withLogger';
import { isAuthenticated, getUser } from '../services/api';
import { Spinner } from '../components/patterns';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { getCartItemsCount, handleLogout } = useCart();
  const cartCount = getCartItemsCount();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const logoSrc = isDark
    ? (isLogoHovered ? '/White_Name.png' : '/Sprite_Name_still.png')
    : (isLogoHovered ? '/logo_small_zoom.png' : '/logo_small_still.png');

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

  useEffect(() => {
    let rafId = null;

    const updateNavState = () => {
      const y = window.scrollY || window.pageYOffset;
      setIsScrolled(y > 24);

      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - doc.clientHeight;
      const progress = maxScroll > 0 ? Math.min((y / maxScroll) * 100, 100) : 0;
      setScrollProgress(progress);
    };

    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateNavState);
    };

    updateNavState();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

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
    <nav className={`navigation ${isScrolled ? 'is-scrolled' : ''}`}>
      <span className="nav-scroll-progress" style={{ width: `${scrollProgress}%` }} aria-hidden="true" />
      <div className="nav-shell">
        <Link
          to="/"
          className="nav-logo"
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
        >
          <img
            src={logoSrc}
            alt="M1Cart Logo"
            className="logo-nav"
          />
          <span className="nav-brand-text">M1 CART</span>
        </Link>

        <div className="nav-primary-links">
          {/* <Link 
            to="/categories" 
            className={location.pathname === '/categories' ? 'active' : ''}
          >
            Products
          </Link> */}
          <Link 
            to="/categories/Electronics" 
            className={location.pathname.startsWith('/categories/Electronics') ? 'active' : ''}
          >
            Electronics
          </Link>
          <Link 
            to="/categories/Fashion" 
            className={location.pathname.startsWith('/categories/Fashion') ? 'active' : ''}
          >
            Fashion
          </Link>
        </div>

        <form className="nav-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nav-search-input"
          />
          <button type="submit" className="nav-search-button">
            Search
          </button>
        </form>

        <div className="nav-actions">
          <Link 
            to="/cart" 
            className={`nav-cart-link ${location.pathname === '/cart' ? 'active' : ''}`}
            aria-label="Cart"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 6h14l-2 8H9L7 6zm0 0L6 3H3M10 19a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm8 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {isAuthLoading ? (
            <span className="nav-auth-loading">
              <Spinner size="small" text="" />
            </span>
          ) : isAuthenticated() ? (
            <>
              <Link 
                to={user?.role === 'admin' ? '/admin-dashboard' : user?.role === 'seller' ? '/seller-dashboard' : '/dashboard'} 
                className={`nav-dashboard-link ${location.pathname === '/dashboard' || location.pathname === '/admin-dashboard' || location.pathname === '/seller-dashboard' ? 'active' : ''}`}
              >
                Profile
              </Link>
              <button 
                className="nav-logout-button"
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
              className={`nav-login-button ${location.pathname === '/login' ? 'active' : ''}`}
            >
              Login
            </Link>
          )}
          <div className="nav-theme-toggle">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default withLogger(Navigation, 'Navigation');
