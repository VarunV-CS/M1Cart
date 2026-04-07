import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import withLogger from '../hocs/withLogger';
import { getUser, isAuthenticated } from '../services/auth/storage';
import { fetchSearchSuggestions } from '../services/products/api';
import { addRecentSearch, getRecentSearches } from '../services/search/recentSearches';
import { Spinner } from '../components/patterns';
import '../styles/components/Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { getCartItemsCount, handleLogout } = useCart();
  const cartCount = getCartItemsCount();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches());
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const searchContainerRef = useRef(null);
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

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      setIsSuggestionsLoading(false);
      setActiveSuggestionIndex(-1);
      return undefined;
    }

    let isCurrent = true;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setIsSuggestionsLoading(true);
        const nextSuggestions = await fetchSearchSuggestions(trimmedQuery, { signal: controller.signal });

        if (!isCurrent) {
          return;
        }

        setSuggestions(nextSuggestions);
        setIsSuggestionsOpen(true);
        setActiveSuggestionIndex(nextSuggestions.length ? 0 : -1);
      } catch {
        if (!isCurrent) {
          return;
        }

        setSuggestions([]);
        setIsSuggestionsOpen(false);
        setActiveSuggestionIndex(-1);
      } finally {
        if (isCurrent) {
          setIsSuggestionsLoading(false);
        }
      }
    }, 220);

    return () => {
      isCurrent = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchQuery]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!searchContainerRef.current?.contains(event.target)) {
        setIsSuggestionsOpen(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const submitSearch = useCallback((value) => {
    const nextQuery = value.trim();
    if (!nextQuery) {
      return;
    }

    navigate(`/search?q=${encodeURIComponent(nextQuery)}`);
    setRecentSearches(addRecentSearch(nextQuery));
    setSearchQuery('');
    setSuggestions([]);
    setIsSuggestionsOpen(false);
    setIsSuggestionsLoading(false);
    setActiveSuggestionIndex(-1);
  }, [navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    submitSearch(searchQuery);
  };

  const handleSuggestionSelect = (suggestion) => {
    submitSearch(suggestion.text);
  };

  const handleSearchKeyDown = (event) => {
    if (!isSuggestionsOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveSuggestionIndex((prev) => (prev + 1) % suggestions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSuggestionIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      return;
    }

    if (event.key === 'Enter' && activeSuggestionIndex >= 0) {
      event.preventDefault();
      handleSuggestionSelect(suggestions[activeSuggestionIndex]);
      return;
    }

    if (event.key === 'Escape') {
      setIsSuggestionsOpen(false);
      setActiveSuggestionIndex(-1);
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

        <div className="nav-search-wrapper" ref={searchContainerRef}>
          <form className="nav-search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length < 2) {
                  const recents = recentSearches.map((text) => ({
                    text,
                    type: 'recent',
                    subtitle: 'Recent search',
                  }));

                  if (recents.length > 0) {
                    setSuggestions(recents);
                    setIsSuggestionsOpen(true);
                    setActiveSuggestionIndex(0);
                    return;
                  }
                }

                if (suggestions.length > 0) setIsSuggestionsOpen(true);
              }}
              onKeyDown={handleSearchKeyDown}
              className="nav-search-input"
              aria-label="Search products"
              aria-autocomplete="list"
              aria-expanded={isSuggestionsOpen}
              aria-controls="nav-search-suggestions"
              aria-activedescendant={activeSuggestionIndex >= 0 ? `nav-search-suggestion-${activeSuggestionIndex}` : undefined}
            />
            <button type="submit" className="nav-search-button">
              Search
            </button>
          </form>

          {isSuggestionsOpen && (
            <div className="nav-search-suggestions" id="nav-search-suggestions" role="listbox">
              {isSuggestionsLoading ? (
                <div className="nav-search-status">Finding suggestions...</div>
              ) : suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.text}`}
                    id={`nav-search-suggestion-${index}`}
                    type="button"
                    className={`nav-search-suggestion-item ${index === activeSuggestionIndex ? 'active' : ''}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    onMouseEnter={() => setActiveSuggestionIndex(index)}
                    role="option"
                    aria-selected={index === activeSuggestionIndex}
                  >
                    <span className="nav-search-suggestion-text">{suggestion.text}</span>
                    <span className="nav-search-suggestion-meta">
                      <span className={`nav-search-tag nav-search-tag-${suggestion.type}`}>{suggestion.type}</span>
                      {suggestion.subtitle}
                    </span>
                  </button>
                ))
              ) : (
                <div className="nav-search-status">No suggestions yet. Press Enter to search.</div>
              )}
            </div>
          )}
        </div>

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

const NavigationWithLogger = withLogger(Navigation, 'Navigation');

export default NavigationWithLogger;
