import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Spinner } from '../components/patterns';
import { useTheme } from '../context/ThemeContext';
import './Home.css';

const Home = () => {
  const location = useLocation();
  const { isDark } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Exponential backoff for retries
  const getRetryDelay = (count) => Math.min(1000 * Math.pow(2, count), 8000);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      //Display products New - Old on Home
      // const data = await fetchProducts();
      
      //Display products Old - New on Home
      const data = await fetchProducts(1, 10, { sortBy: 'createdAt-asc' });
      
      // Handle the new response format with pagination
      const productsArray = Array.isArray(data) ? data : (data.products || []);
      setProducts(productsArray);
      
      setError(null);
      setRetryCount(0);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [location.pathname]);

  // Auto-retry with exponential backoff
  useEffect(() => {
    if (error && retryCount > 0 && retryCount <= 4) {
      const timer = setTimeout(() => {
        console.log(`Retrying fetch (attempt ${retryCount}/${4})...`);
        loadProducts();
      }, getRetryDelay(retryCount - 1));

      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    if (retryCount === 0) {
      loadProducts();
    }
  };

  const featuredProducts = products.slice(0, 6);

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner size="large" text="Loading products..." />
      </div>
    );
  }

  if (error) {
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
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>
            Welcome to 
            <img src={isDark ? "/White_Name.png" : "/logo_small.png"} alt="M1Cart Logo" className="hero-logo" />
            !
          </h1>
          <p>Discover amazing products at great prices</p>
          <p>See you at the Billing line!</p>
          <Link to="/categories" className="cta-button">
            Shop Now
          </Link>
        </div>
      </section>

      <section className="featured-products">
        <div className="container">
          <h2>Featured Products</h2>
          <div className="products-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.pid} product={product} />
            ))}
          </div>
          <div className="view-all">
            <Link to="/categories" className="view-all-button">
              View All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
