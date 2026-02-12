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

  // Load data function
  const loadData = useCallback(async (pageNum, limitNum) => {
    try {
      setLoading(true);
      setError(null);
      
      // Load categories
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
      
      // Fetch products with pagination
      const productsData = await fetchProducts(pageNum, limitNum);
      
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
  }, []);

  // Load data on mount and when page/limit changes
  useEffect(() => {
    loadData(page, limit);
  }, [page, limit, loadData]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [location.search]);

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

  // Filter and sort products (client-side filtering for the current page)
  const filteredAndSortedProducts = products
    .filter(product => {
      // Text search filter
      const matchesSearch = !query || 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      
      // Price filter
      const matchesPrice = 
        (priceRange.min === '' || product.price >= parseFloat(priceRange.min)) &&
        (priceRange.max === '' || product.price <= parseFloat(priceRange.max));
      
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name);
      }
    });

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
            {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? 's' : ''} found
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
          {filteredAndSortedProducts.map(product => (
            <ProductCard key={product.pid} product={product} />
          ))}
        </div>
        
        {filteredAndSortedProducts.length === 0 && (
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
