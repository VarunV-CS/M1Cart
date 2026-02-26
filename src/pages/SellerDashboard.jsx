import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { isAuthenticated, getUser, getMyProducts, createProduct, getLatestProductId, getSellerOrders, updateSellerOrderStatus } from '../services/api';
import ProductModal from '../components/ProductModal';
import OrderModal from '../components/OrderModal';
import Pagination from '../components/Pagination';
import './SellerDashboard.css';

// Page size options
const PAGE_SIZE_OPTIONS = [5, 10, 20];

function SellerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'
  const [formData, setFormData] = useState({
    pid: '',
    name: '',
    category: '',
    price: '',
    image: '',
    description: '',
    inStock: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [expandedProduct, setExpandedProduct] = useState(null);
  
  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('completed');
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  // Orders pagination state
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLimit, setOrdersLimit] = useState(10);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [ordersTotal, setOrdersTotal] = useState(0);
  
  // Ref to prevent duplicate fetches
  const isFetchingRef = useRef(false);
  const isInitialLoadRef = useRef(true);

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
    // Don't call fetchMyProducts here - it will be called by the second useEffect
  }, [navigate, location]);

  // Fetch products when status filter changes or when authorized (initial load)
  useEffect(() => {
    if (isAuthorized && activeTab === 'products') {
      fetchMyProducts();
    }
  }, [statusFilter, activeTab, isAuthorized]);

  // Fetch orders when Orders tab is active or when status filter or pagination changes
  useEffect(() => {
    if (isAuthorized && activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, isAuthorized, orderStatusFilter, ordersPage, ordersLimit]);

  // Fetch orders function
  const fetchOrders = async () => {
    if (isFetchingRef.current) return;
    
    setOrdersLoading(true);
    setOrdersError('');
    isFetchingRef.current = true;
    
    try {
      const response = await getSellerOrders(ordersPage, ordersLimit, orderStatusFilter);
      setOrders(response.orders || []);
      setOrdersTotal(response.pagination?.total || response.orders?.length || 0);
      setOrdersTotalPages(response.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrdersError('Failed to fetch orders. Please try again.');
    } finally {
      setOrdersLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Handle order status filter change
  const handleOrderStatusFilterChange = (newStatus) => {
    setOrderStatusFilter(newStatus);
    setOrdersPage(1); // Reset to first page when changing filter
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle orders page change
  const handleOrdersPageChange = (newPage) => {
    setOrdersPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle orders page size change
  const handleOrdersLimitChange = (newLimit) => {
    setOrdersLimit(newLimit);
    setOrdersPage(1); // Reset to first page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle order status change from OrderModal
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await updateSellerOrderStatus(orderId, newStatus);
      setError('');
      
      // Refresh the orders list
      await fetchOrders();
      
      // Clear the expanded order to close modal
      setExpandedOrder(null);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.message || 'Failed to update order status');
    }
  };

  const fetchMyProducts = async () => {
    // Prevent duplicate fetches
    if (isFetchingRef.current) return;
    
    setProductsLoading(true);
    isFetchingRef.current = true;
    
    try {
      const response = await getMyProducts(statusFilter);
      if (response.success) {
        setProducts(response.products || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products. Please try again.');
    } finally {
      setProductsLoading(false);
      isFetchingRef.current = false;
      // Set isLoading to false after first load
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        setIsLoading(false);
      }
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
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
    
    // Real-time validation for the field being changed
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

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    // Validate Name - must be at least 2 characters
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Product Name must be at least 2 characters';
    }
    
    // Validate Category - must be at least 3 characters
    if (!formData.category || formData.category.trim().length < 3) {
      errors.category = 'Category must be at least 3 characters';
    }
    
    // Validate Price - must be present and cannot be negative
    if (!formData.price || parseFloat(formData.price) < 0) {
      errors.price = 'Price cannot be negative';
    }
    
    // Validate Image - must be present
    if (!formData.image || formData.image.trim() === '') {
      errors.image = 'Image URL is required';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validate form
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
      setFormErrors({});
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
        </div>
        <div className="dashboard-header-right">
          <div className="account-info">
            <div className="name-badge-container">
              <span className="account-name">{user?.name || user?.businessName}</span>
              <span className="role-badge">{user?.role || 'seller'}</span>
            </div>
            <span className="account-email">{user?.email}</span>
            <span className="business-name">{user?.businessName}</span>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="category-filters">
        <button
          className={`category-filter-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={`category-filter-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
      </div>

      {activeTab === 'products' && (
      <div className="products-section">
        <div className="products-header">
          <h2>Products</h2>
          <div className="header-actions">
            <div className="status-filters">
              <button
                className={`status-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleStatusFilterChange('all')}
              >
                All
              </button>
              <button
                className={`status-filter-btn ${statusFilter === 'Submitted' ? 'active' : ''}`}
                onClick={() => handleStatusFilterChange('Submitted')}
              >
                Submitted
              </button>
              <button
                className={`status-filter-btn ${statusFilter === 'Approved' ? 'active' : ''}`}
                onClick={() => handleStatusFilterChange('Approved')}
              >
                Approved
              </button>
              <button
                className={`status-filter-btn ${statusFilter === 'Rejected' ? 'active' : ''}`}
                onClick={() => handleStatusFilterChange('Rejected')}
              >
                Rejected
              </button>
              <button
                className={`status-filter-btn ${statusFilter === 'Deleted' ? 'active' : ''}`}
                onClick={() => handleStatusFilterChange('Deleted')}
              >
                Deleted
              </button>
            </div>
            <button 
              className="add-product-btn"
              onClick={async () => {
                if (!showForm) {
                  await fetchLatestPid();
                } else {
                  // Clear form errors when cancelling
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
                  <label htmlFor="name">Product Name * <span className="required-mark">(min 2 characters)</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className={formErrors.name ? 'input-error' : ''}
                  />
                  {formErrors.name && <span className="field-error">{formErrors.name}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category * <span className="required-mark">(min 3 characters)</span></label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Enter category"
                    className={formErrors.category ? 'input-error' : ''}
                  />
                  {formErrors.category && <span className="field-error">{formErrors.category}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="price">Price * <span className="required-mark">(cannot be negative)</span></label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    step="0.01"
                    min="0"
                    className={formErrors.price ? 'input-error' : ''}
                  />
                  {formErrors.price && <span className="field-error">{formErrors.price}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="image">Image URL *</label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="Enter image URL"
                  className={formErrors.image ? 'input-error' : ''}
                />
                {formErrors.image && <span className="field-error">{formErrors.image}</span>}
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
          {productsLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <p>No products found</p>
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
      )}

      {/* Orders Section */}
      {activeTab === 'orders' && (
        <div className="orders-section">
          <div className="orders-header">
            <h2>My Orders</h2>
            <div className="header-actions">
              <div className="status-filters">
                <button
                  className={`status-filter-btn ${orderStatusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => handleOrderStatusFilterChange('all')}
                >
                  All
                </button>
                <button
                  className={`status-filter-btn ${orderStatusFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => handleOrderStatusFilterChange('completed')}
                >
                  Completed
                </button>
                <button
                  className={`status-filter-btn ${orderStatusFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => handleOrderStatusFilterChange('pending')}
                >
                  Pending
                </button>
                <button
                  className={`status-filter-btn ${orderStatusFilter === 'failed' ? 'active' : ''}`}
                  onClick={() => handleOrderStatusFilterChange('failed')}
                >
                  Failed
                </button>
                <button
                  className={`status-filter-btn ${orderStatusFilter === 'cancelled' ? 'active' : ''}`}
                  onClick={() => handleOrderStatusFilterChange('cancelled')}
                >
                  Cancelled
                </button>
                <button
                  className={`status-filter-btn ${orderStatusFilter === 'dispatched' ? 'active' : ''}`}
                  onClick={() => handleOrderStatusFilterChange('dispatched')}
                >
                  Dispatched
                </button>
                <button
                  className={`status-filter-btn ${orderStatusFilter === 'delivered' ? 'active' : ''}`}
                  onClick={() => handleOrderStatusFilterChange('delivered')}
                >
                  Delivered
                </button>
              </div>
            </div>
          </div>

          {ordersError && <div className="error-message">{ordersError}</div>}

          {ordersLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="no-orders">
              <div className="empty-icon">📦</div>
              <h3>No orders found</h3>
              <p>There are no orders with status "{orderStatusFilter}"</p>
            </div>
          ) : (
            <>
              {/* Results Info and Page Size Selector */}
              {orders.length > 0 && (
                <div className="results-header">
                  <div className="results-count">
                    {ordersTotal} order{ordersTotal !== 1 ? 's' : ''} found
                    <span className="total-count"> (showing {orders.length} of {ordersTotal})</span>
                  </div>
                  
                  <div className="page-size-selector">
                    <label htmlFor="orders-page-size">Show:</label>
                    <select
                      id="orders-page-size"
                      value={ordersLimit}
                      onChange={(e) => handleOrdersLimitChange(Number(e.target.value))}
                      className="filter-select"
                    >
                      {PAGE_SIZE_OPTIONS.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr 
                        key={order.id} 
                        className="order-row"
                        onClick={() => setExpandedOrder(order)}
                      >
                        <td>
                          <span className="order-id">#{order.id?.slice(0, 8).toUpperCase() || 'N/A'}</span>
                        </td>
                        <td>
                          <div className="customer-cell">
                            <span className="customer-name">{order.user?.name || 'Unknown'}</span>
                            {order.user?.email && (
                              <span className="customer-email">{order.user.email}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="items-count">
                            {order.items?.reduce((total, item) => total + item.quantity, 0) || 0} items
                          </span>
                        </td>
                        <td>
                          <span className="order-amount">${order.amount?.toFixed(2) || '0.00'}</span>
                        </td>
                        <td>
                          <span className={`order-status status-${order.status}`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                          </span>
                        </td>
                        <td>
                          <span className="order-date">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {ordersTotalPages > 1 && (
                <Pagination
                  currentPage={ordersPage}
                  totalPages={ordersTotalPages}
                  onPageChange={handleOrdersPageChange}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Product Modal for expanded view */}
      {expandedProduct && (
        <ProductModal 
          product={expandedProduct} 
          onClose={() => setExpandedProduct(null)} 
        />
      )}

      {/* Order Modal for expanded view */}
      {expandedOrder && (
        <OrderModal 
          order={expandedOrder} 
          onClose={() => setExpandedOrder(null)}
          userRole="seller"
          onStatusChange={handleOrderStatusChange}
        />
      )}
    </div>
  );
}

export default SellerDashboard;

