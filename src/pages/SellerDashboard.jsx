import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { isAuthenticated, getUser, getMyProducts, createProduct, getLatestProductId } from '../services/api';
import ProductModal from '../components/ProductModal';
import './SellerDashboard.css';

function SellerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    pid: '',
    name: '',
    category: '',
    price: '',
    image: '',
    description: '',
    inStock: true
  });
  const [error, setError] = useState('');
  const [expandedProduct, setExpandedProduct] = useState(null);

  useEffect(() => {
    // Check authentication and authorization
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const userData = getUser();
    setUser(userData);
    
    // Only allow seller users
    if (userData?.role !== 'seller') {
      // Redirect to appropriate dashboard based on role
      if (userData?.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
      return;
    }

    setIsAuthorized(true);
    fetchMyProducts();
  }, [navigate, location]);

  const fetchMyProducts = async () => {
    try {
      const response = await getMyProducts();
      if (response.success) {
        setProducts(response.products || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLatestPid = async () => {
    try {
      const response = await getLatestProductId();
      const nextPid = (response.latestPid || 0) + 1;
      setFormData(prev => ({
        ...prev,
        pid: nextPid
      }));
    } catch (err) {
      console.error('Error fetching latest PID:', err);
      // Fallback to Date.now() if API fails
      setFormData(prev => ({
        ...prev,
        pid: Date.now()
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const productData = {
        ...formData,
        pid: parseInt(formData.pid) || Date.now(),
        price: parseFloat(formData.price)
      };

      await createProduct(productData);
      
      // Refresh products list
      await fetchMyProducts();
      
      // Reset form
      setFormData({
        pid: '',
        name: '',
        category: '',
        price: '',
        image: '',
        description: '',
        inStock: true
      });
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`seller-dashboard-container ${isDark ? 'dark' : ''}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className={`seller-dashboard-container ${isDark ? 'dark' : ''}`}>
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Seller Dashboard</h1>
          <p>Manage your products</p>
        </div>
        <div className="dashboard-header-right">
          <div className="account-info">
            <span className="account-name">{user?.name || user?.businessName}</span>
            <span className="account-email">{user?.email}</span>
            <span className="business-name">{user?.businessName}</span>
            <span className="role-badge">{user?.role || 'seller'}</span>
          </div>
        </div>
      </div>

      <div className="products-section">
        <div className="products-header">
          <h2>Your Products</h2>
          <button 
            className="add-product-btn"
            onClick={async () => {
              if (!showForm) {
                await fetchLatestPid();
              }
              setShowForm(!showForm);
            }}
          >
            {showForm ? 'Cancel' : '+ Add Product'}
          </button>
        </div>

        {showForm && (
          <div className="product-form-container">
            <h3>Add New Product</h3>
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pid">Product ID</label>
                  <input
                    type="number"
                    id="pid"
                    name="pid"
                    value={formData.pid}
                    onChange={handleInputChange}
                    placeholder="Product ID"
                    disabled
                    className="pid-disabled"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="name">Product Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Enter category"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="price">Price *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="image">Image URL</label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="Enter image URL"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows="3"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleInputChange}
                  />
                  In Stock
                </label>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Product'}
              </button>
            </form>
          </div>
        )}

        <div className="products-list">
          {products.length === 0 ? (
            <div className="no-products">
              <p>None</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <div 
                  key={product.pid} 
                  className="product-card"
                  onClick={() => setExpandedProduct(product)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setExpandedProduct(product);
                    }
                  }}
                >
                  <div className="product-image">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p className="product-category">{product.category}</p>
                    <p className="product-price">${product.price?.toFixed(2)}</p>
                    <p className={`product-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </p>
                    <p className={`product-status status-${product.status?.toLowerCase() || 'submitted'}`}>
                      {product.status || 'Submitted'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Modal for expanded view */}
      {expandedProduct && (
        <ProductModal 
          product={expandedProduct} 
          onClose={() => setExpandedProduct(null)} 
        />
      )}
    </div>
  );
}

export default SellerDashboard;

