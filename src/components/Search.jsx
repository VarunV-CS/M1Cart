import { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../services/api';
import { useWindowSize } from '../hooks/useWindowSize';
import ProductCard from './ProductCard';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const query = searchParams.get('q') || '';
  const windowSize = useWindowSize();
  const isMobile = windowSize.width < 768;
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('name-asc');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(),
          fetchCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [location.search]);

  // Filter and sort products
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
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
                onChange={(e) => setSelectedCategory(e.target.value)}
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
        
        <div className="products-count">
          {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? 's' : ''} found
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
      </div>
    </div>
  );
};

export default Search;