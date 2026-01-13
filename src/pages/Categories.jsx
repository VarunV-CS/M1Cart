import { useState, useEffect } from 'react';
import { fetchProducts, fetchCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import './Categories.css';

const Categories = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
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
  }, []);

  let filteredProducts = products;

  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(q));
  }

  if (selectedCategory && selectedCategory !== 'All') {
    filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
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
    <div className="categories-page">
      <div className="container">
        <h1>Shop by Category</h1>
        <div className="filters-row">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category}
                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="price-sort-filters">
            <input
              type="number"
              placeholder="Min price"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              min="0"
            />
            <input
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              min="0"
            />
            <select value={sortOption} onChange={e => setSortOption(e.target.value)}>
              <option value="">Sort By</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A → Z</option>
              <option value="name-desc">Name: Z → A</option>
            </select>
            <button className="reset-button" onClick={() => { setSearchTerm(''); setMinPrice(''); setMaxPrice(''); setSortOption(''); setSelectedCategory('All'); }}>Reset</button>
          </div>
        </div>
        <div className="products-count">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </div>
        <div className="products-grid">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="no-products">
            <p>No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
