import { useEffect, useRef, useState } from 'react';
import { createProduct, getLatestProductId, getMyProducts } from '../services/api';
import ProductModal from './ProductModal';
import './SellerProducts.css';

function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    pid: '',
    name: '',
    category: '',
    price: '',
    image: '',
    description: '',
    inStock: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [expandedProduct, setExpandedProduct] = useState(null);

  const isFetchingProductsRef = useRef(false);

  useEffect(() => {
    fetchMyProducts();
  }, [statusFilter]);

  const fetchMyProducts = async (filter = statusFilter) => {
    if (isFetchingProductsRef.current) return;

    setProductsLoading(true);
    isFetchingProductsRef.current = true;

    try {
      const response = await getMyProducts(filter);
      if (response.success) {
        setProducts(response.products || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products. Please try again.');
    } finally {
      setProductsLoading(false);
      isFetchingProductsRef.current = false;
    }
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
  };

  const fetchLatestPid = async () => {
    try {
      const response = await getLatestProductId();
      const nextPid = (response.latestPid || 0) + 1;
      setFormData((prev) => ({
        ...prev,
        pid: nextPid,
      }));
    } catch (err) {
      console.error('Error fetching latest PID:', err);
      setFormData((prev) => ({
        ...prev,
        pid: Date.now(),
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    const fieldErrors = { ...formErrors };

    if (name === 'name') {
      if (value.trim().length > 0 && value.trim().length < 2) {
        fieldErrors.name = 'Name must be at least 2 characters';
      } else {
        delete fieldErrors.name;
      }
    }

    if (name === 'category') {
      if (value.trim().length > 0 && value.trim().length < 3) {
        fieldErrors.category = 'Category must be at least 3 characters';
      } else {
        delete fieldErrors.category;
      }
    }

    if (name === 'price') {
      if (value && parseFloat(value) < 0) {
        fieldErrors.price = 'Price cannot be negative';
      } else {
        delete fieldErrors.price;
      }
    }

    if (name === 'image') {
      if (value.trim() === '') {
        fieldErrors.image = 'Image URL is required';
      } else {
        delete fieldErrors.image;
      }
    }

    setFormErrors(fieldErrors);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Product Name must be at least 2 characters';
    }

    if (!formData.category || formData.category.trim().length < 3) {
      errors.category = 'Category must be at least 3 characters';
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      errors.price = 'Price cannot be negative';
    }

    if (!formData.image || formData.image.trim() === '') {
      errors.image = 'Image URL is required';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setError('Please fix the validation errors before submitting.');
      setIsSubmitting(false);
      return;
    }

    try {
      const productData = {
        ...formData,
        pid: parseInt(formData.pid, 10) || Date.now(),
        price: parseFloat(formData.price),
      };

      await createProduct(productData);
      await fetchMyProducts();

      setFormData({
        pid: '',
        name: '',
        category: '',
        price: '',
        image: '',
        description: '',
        inStock: true,
      });
      setFormErrors({});
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="seller-products-section">
      <div className="seller-products-header">
        <h2>Products</h2>
        <div className="seller-products-header-actions">
          <div className="seller-products-status-filters">
            <button
              className={`seller-products-status-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleStatusFilterChange('all')}
            >
              All
            </button>
            <button
              className={`seller-products-status-filter-btn ${statusFilter === 'Submitted' ? 'active' : ''}`}
              onClick={() => handleStatusFilterChange('Submitted')}
            >
              Submitted
            </button>
            <button
              className={`seller-products-status-filter-btn ${statusFilter === 'Approved' ? 'active' : ''}`}
              onClick={() => handleStatusFilterChange('Approved')}
            >
              Approved
            </button>
            <button
              className={`seller-products-status-filter-btn ${statusFilter === 'Rejected' ? 'active' : ''}`}
              onClick={() => handleStatusFilterChange('Rejected')}
            >
              Rejected
            </button>
            <button
              className={`seller-products-status-filter-btn ${statusFilter === 'Deleted' ? 'active' : ''}`}
              onClick={() => handleStatusFilterChange('Deleted')}
            >
              Deleted
            </button>
          </div>
          <button
            className="seller-products-add-product-btn"
            onClick={async () => {
              if (!showForm) {
                await fetchLatestPid();
              } else {
                setFormErrors({});
              }
              setShowForm(!showForm);
            }}
          >
            {showForm ? 'Cancel' : '+ Add Product'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="seller-products-form-container">
          <h3>Add New Product</h3>
          {error && <div className="seller-products-form-error">{error}</div>}
          <form onSubmit={handleSubmit} className="seller-products-form">
            <div className="seller-products-form-row">
              <div className="seller-products-form-group">
                <label htmlFor="pid">Product ID</label>
                <input
                  type="number"
                  id="pid"
                  name="pid"
                  value={formData.pid}
                  onChange={handleInputChange}
                  placeholder="Product ID"
                  disabled
                  className="seller-products-pid-disabled"
                />
              </div>
              <div className="seller-products-form-group">
                <label htmlFor="name">
                  Product Name * <span className="seller-products-required-mark">(min 2 characters)</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className={formErrors.name ? 'seller-products-input-error' : ''}
                />
                {formErrors.name && <span className="seller-products-field-error">{formErrors.name}</span>}
              </div>
            </div>

            <div className="seller-products-form-row">
              <div className="seller-products-form-group">
                <label htmlFor="category">
                  Category * <span className="seller-products-required-mark">(min 3 characters)</span>
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Enter category"
                  className={formErrors.category ? 'seller-products-input-error' : ''}
                />
                {formErrors.category && <span className="seller-products-field-error">{formErrors.category}</span>}
              </div>
              <div className="seller-products-form-group">
                <label htmlFor="price">
                  Price * <span className="seller-products-required-mark">(cannot be negative)</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  step="0.01"
                  min="0"
                  className={formErrors.price ? 'seller-products-input-error' : ''}
                />
                {formErrors.price && <span className="seller-products-field-error">{formErrors.price}</span>}
              </div>
            </div>

            <div className="seller-products-form-group">
              <label htmlFor="image">Image URL *</label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="Enter image URL"
                className={formErrors.image ? 'seller-products-input-error' : ''}
              />
              {formErrors.image && <span className="seller-products-field-error">{formErrors.image}</span>}
            </div>

            <div className="seller-products-form-group">
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

            <div className="seller-products-form-group seller-products-checkbox-group">
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

            <button type="submit" className="seller-products-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Product'}
            </button>
          </form>
        </div>
      )}

      <div className="seller-products-list">
        {productsLoading ? (
          <div className="seller-products-loading-spinner">
            <div className="seller-products-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="seller-products-empty">
            <p>No products found</p>
          </div>
        ) : (
          <div className="seller-products-grid">
            {products.map((product) => (
              <div
                key={product.pid}
                className="seller-product-card"
                onClick={() => setExpandedProduct(product)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setExpandedProduct(product);
                  }
                }}
              >
                <div className="seller-product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <div className="seller-product-no-image">No Image</div>
                  )}
                </div>
                <div className="seller-product-info">
                  <h4>{product.name}</h4>
                  <p className="seller-product-category">{product.category}</p>
                  <p className="seller-product-price">${product.price?.toFixed(2)}</p>
                  <p className={`seller-product-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </p>
                  <p className={`seller-product-status status-${product.status?.toLowerCase() || 'submitted'}`}>
                    {product.status || 'Submitted'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {expandedProduct && <ProductModal product={expandedProduct} onClose={() => setExpandedProduct(null)} />}
    </div>
  );
}

export default SellerProducts;
