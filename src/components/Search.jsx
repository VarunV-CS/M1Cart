import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../services/api';
import ProductCard from './ProductCard';
import Pagination from './Pagination';
import './Search.css';

// Page size options for user selection
const PAGE_SIZE_OPTIONS = [6, 12, 24, 48];

const Search = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const query = searchParams.get('q') || '';
  
  // Data state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('name-asc');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Build filter object
  const buildFilters = () => {
    const filters = {};
    
    // Always include the search query
    if (query) {
      filters.search = query;
    }
    if (selectedCategory && selectedCategory !== 'All') {
      filters.category = selectedCategory;
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
  };

  // Load data function
  const loadData = useCallback(async (pageNum, limitNum) => {
    try {
      setLoading(true);
      setError(null);
      
      // Load categories
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
    } catch (err) {
      setError(err.message);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory, priceRange, sortBy]);

  // Load data on mount and when page/limit/filters change
  useEffect(() => {
    loadData(page, limit);
  }, [page, limit, loadData]);

  // Reload when filters change (except page)
  useEffect(() => {
    loadData(1, limit);
    setPage(1);
  }, [query, selectedCategory, priceRange.min, priceRange.max, sortBy]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePriceChange = (type, value) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setPriceRange({ min: '', max: '' });
    setSortBy('name-asc');
    setPage(1);
  };

  if (loading && products.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="search-page">
      <div className="container">
        <h1>Search Results</h1>
        {query && (
          <p className="search-query">Searching for: "{query}"</p>
        )}
        
        {/* Filters Section */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="category-filter">Category:</label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
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
    </div>
  );
};

export default Search;
