import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../services/api';
import ProductCard from './ProductCard';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (e) {
        // ignore category errors
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  let filteredProducts = products;

  if (searchTerm && searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(q));
  }

  if (selectedCategory && selectedCategory !== 'All') {
    filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
  }

  if (minPrice !== '') {
    const min = parseFloat(minPrice);
    if (!Number.isNaN(min)) filteredProducts = filteredProducts.filter(p => p.price >= min);
  }

  if (maxPrice !== '') {
    const max = parseFloat(maxPrice);
    if (!Number.isNaN(max)) filteredProducts = filteredProducts.filter(p => p.price <= max);
  }

  if (sortOption) {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      switch (sortOption) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="search-page">
      <div className="container">
        <h1>Search Results</h1>
        <div className="search-controls">
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            <option>All</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input type="number" placeholder="Min price" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
          <input type="number" placeholder="Max price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          <select value={sortOption} onChange={e => setSortOption(e.target.value)}>
            <option value="">Sort By</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A → Z</option>
            <option value="name-desc">Name: Z → A</option>
          </select>
          <button onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setMinPrice(''); setMaxPrice(''); setSortOption(''); }}>Reset</button>
        </div>
        {searchTerm && (
          <p className="search-query">Searching for: "{searchTerm}"</p>
        )}
        <div className="products-count">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </div>
        <div className="products-grid">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {filteredProducts.length === 0 && query && (
          <div className="no-products">
            <p>No products found matching "{query}".</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;