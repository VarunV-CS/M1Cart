import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchCategories, fetchSearchSuggestions } from '../services/products/api';
import { addRecentSearch, getRecentSearches } from '../services/search/recentSearches';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import Footer from '../components/Footer';
import { Spinner } from '../components/patterns';
import '../styles/pages/Categories.css';

// Page size options for user selection
const PAGE_SIZE_OPTIONS = [6, 12, 24, 48];

const Categories = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(() => {
    // Read category from URL path parameter on initial render
    return category || 'All';
  });
  const searchInputRef = useRef(null);

  // Sync selectedCategory with URL parameter when it changes
  useEffect(() => {
    setSelectedCategory(category || 'All');
  }, [category]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches());
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('name-asc');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Exponential backoff for retries
  const getRetryDelay = (count) => Math.min(1000 * Math.pow(2, count), 8000);

  // Build filter object
  const buildFilters = useCallback(() => {
    const filters = {};
    
    if (selectedCategory && selectedCategory !== 'All') {
      filters.category = selectedCategory;
    }
    if (searchQuery) {
      filters.search = searchQuery;
    }
    if (priceRange.min) {
      filters.minPrice = parseFloat(priceRange.min);
    }
    if (priceRange.max) {
      filters.maxPrice = parseFloat(priceRange.max);
    }
    if (sortBy) {
      filters.sortBy = sortBy;
    }
    
    return filters;
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

  const loadData = useCallback(async (pageNum, limitNum) => {
    try {
      setLoading(true);
      setError(null);
      
      // Load categories first
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
      
      // Build filters
      const filters = buildFilters();
      
      // Fetch products with pagination and filters
      const productsData = await fetchProducts(pageNum, limitNum, filters);
      
      // Handle the response format
      if (productsData.products) {
        setProducts(productsData.products);
        setTotal(productsData.pagination?.total || productsData.products.length);
        setTotalPages(productsData.pagination?.totalPages || 1);
      } else {
        // Fallback for non-paginated response
        setProducts(productsData);
        setTotal(productsData.length);
        setTotalPages(1);
      }
      
      setError(null);
      setRetryCount(0);
    } catch (err) {
      setError(err.message);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [buildFilters]);

  // Load data on mount and when page/limit/filters change
  useEffect(() => {
    loadData(page, limit);
  }, [page, limit, loadData]);

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

  // Auto-retry with exponential backoff
  useEffect(() => {
    if (error && retryCount > 0 && retryCount <= 4) {
      const timer = setTimeout(() => {
        console.log(`Retrying fetch (attempt ${retryCount}/${4})...`);
        loadData(page, limit);
      }, getRetryDelay(retryCount - 1));

      return () => clearTimeout(timer);
    }
  }, [error, retryCount, loadData, page, limit]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!searchInputRef.current?.contains(event.target)) {
        setIsSuggestionsOpen(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    if (retryCount === 0) {
      loadData(page, limit);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Scroll to top of products
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing page size
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePriceChange = (type, value) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const applySearchValue = (value) => {
    setRecentSearches(addRecentSearch(value));
    setSearchQuery(value);
    setSuggestions([]);
    setIsSuggestionsOpen(false);
    setIsSuggestionsLoading(false);
    setActiveSuggestionIndex(-1);
    setPage(1);
  };

  const handleSearchInputKeyDown = (event) => {
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
      applySearchValue(suggestions[activeSuggestionIndex].text);
      return;
    }

    if (event.key === 'Escape') {
      setIsSuggestionsOpen(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSuggestions([]);
    setIsSuggestionsOpen(false);
    setIsSuggestionsLoading(false);
    setActiveSuggestionIndex(-1);
    setPriceRange({ min: '', max: '' });
    setSortBy('name-asc');
    setSelectedCategory('All');
    setPage(1);
    navigate('/categories');
  };

  if (loading && products.length === 0) {
    return (
      <div className="loading-container">
        <Spinner size="large" text="Loading products..." />
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>Unable to Load Products</h2>
          <p className="error-message">{error}</p>
          <p className="error-hint">
            {retryCount > 0 
              ? `Retrying... (attempt ${retryCount}/4)`
              : 'Please check your connection and try again.'}
          </p>
          <button onClick={handleRetry} className="retry-button">
            {retryCount > 0 ? 'Retry Again' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="container">
        <h1>Shop by Category</h1>
        
        {/* Category Filters */}
        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-button ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
                navigate(cat === 'All' ? '/categories' : `/categories/${cat}`);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        
        {/* Additional Filters */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="search-products">Search Products:</label>
              <div className="filter-search-wrapper" ref={searchInputRef}>
                <input
                  id="search-products"
                  type="text"
                  placeholder="Search by name or category..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
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
                  onKeyDown={handleSearchInputKeyDown}
                  className="filter-input"
                  aria-label="Search products in filters"
                  aria-autocomplete="list"
                  aria-expanded={isSuggestionsOpen}
                  aria-controls="filter-search-suggestions"
                  aria-activedescendant={activeSuggestionIndex >= 0 ? `filter-search-suggestion-${activeSuggestionIndex}` : undefined}
                />
                {isSuggestionsOpen && (
                  <div className="filter-search-suggestions" id="filter-search-suggestions" role="listbox">
                    {isSuggestionsLoading ? (
                      <div className="filter-search-status">Finding suggestions...</div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion.type}-${suggestion.text}`}
                          id={`filter-search-suggestion-${index}`}
                          type="button"
                          className={`filter-search-suggestion-item ${index === activeSuggestionIndex ? 'active' : ''}`}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => applySearchValue(suggestion.text)}
                          onMouseEnter={() => setActiveSuggestionIndex(index)}
                          role="option"
                          aria-selected={index === activeSuggestionIndex}
                        >
                          <span className="filter-search-suggestion-text">{suggestion.text}</span>
                          <span className="filter-search-suggestion-meta">
                            <span className={`filter-search-tag filter-search-tag-${suggestion.type}`}>{suggestion.type}</span>
                            {suggestion.subtitle}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="filter-search-status">No suggestions yet.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="filter-group">
              <label htmlFor="price-min">Min Price:</label>
              <input
                id="price-min"
                type="number"
                placeholder="0"
                value={priceRange.min}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="filter-input"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="price-max">Max Price:</label>
              <input
                id="price-max"
                type="number"
                placeholder="No limit"
                value={priceRange.max}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="filter-input"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="sort-by">Sort by:</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
            </div>
          </div>
          
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
        
        {/* Results Info and Page Size Selector */}
        <div className="results-header">
          <div className="results-count">
            {total} product{total !== 1 ? 's' : ''} found
            {total > 0 && <span className="total-count"> (showing {products.length} of {total})</span>}
          </div>
          
          <div className="page-size-selector">
            <label htmlFor="page-size">Show:</label>
            <select
              id="page-size"
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="filter-select"
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.pid} product={product} />
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="no-products">
            <p>No products found matching your criteria.</p>
          </div>
        )}
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>      
      <Footer />
    </div>
  );
};

export default Categories;
