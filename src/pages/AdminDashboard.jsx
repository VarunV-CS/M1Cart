import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { isAuthenticated, getUser, getAllProducts, updateProductStatus, createProduct, getLatestProductId, getAllUsers, getAllOrders, updateAdminOrderStatus } from '../services/api';
import ProductModal from '../components/ProductModal';
import UserModal from '../components/UserModal';
import OrderModal from '../components/OrderModal';
import Pagination from '../components/Pagination';
import './AdminDashboard.css';

// Page size options
const PAGE_SIZE_OPTIONS = [5, 10, 20];

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis', 'users', 'products', 'orders'
  
  // Products state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingProduct, setUpdatingProduct] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Rejection Modal state
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmittingRejection, setIsSubmittingRejection] = useState(false);
  
  // Expanded Product Modal state
  const [expandedProduct, setExpandedProduct] = useState(null);
  
  // Add Product form state
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
  const [formErrors, setFormErrors] = useState({});
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Users pagination state
  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit, setUsersLimit] = useState(10);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  
  // Expanded User Modal state
  const [expandedUser, setExpandedUser] = useState(null);

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

  useEffect(() => {
    // Check authentication and authorization
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const userData = getUser();
    setUser(userData);
    
    // Only allow admin users
    if (userData?.role !== 'admin') {
      // Redirect to appropriate dashboard based on role
      if (userData?.role === 'seller') {
        navigate('/seller-dashboard');
      } else {
        navigate('/dashboard');
      }
      return;
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, [navigate, location]);

  // Fetch products when Products tab is active or when status filter changes
  useEffect(() => {
    if (activeTab === 'products' && isAuthorized) {
      fetchProducts();
    }
  }, [activeTab, statusFilter, isAuthorized, page, limit]);

  // Fetch users when Users tab is active or when role filter or pagination changes
  useEffect(() => {
    if (activeTab === 'users' && isAuthorized) {
      fetchUsers();
    }
  }, [activeTab, isAuthorized, roleFilter, usersPage, usersLimit]);

  // Fetch orders when Orders tab is active or when status filter or pagination changes
  useEffect(() => {
    if (activeTab === 'orders' && isAuthorized) {
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
      const response = await getAllOrders(ordersPage, ordersLimit, orderStatusFilter);
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


  const fetchProducts = async (fetchPage = page, fetchLimit = limit, fetchStatus = statusFilter) => {
    // Prevent duplicate fetches
    if (isFetchingRef.current) return;
    
    setProductsLoading(true);
    setError('');
    isFetchingRef.current = true;
    
    try {
      const response = await getAllProducts(fetchPage, fetchLimit, { status: fetchStatus });
      setProducts(response.products || []);
      setTotal(response.pagination?.total || response.products?.length || 0);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products. Please try again.');
    } finally {
      setProductsLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Fetch all users with optional role filter and pagination
  const fetchUsers = async (fetchPage = usersPage, fetchLimit = usersLimit, fetchRoleFilter = roleFilter) => {
    setUsersLoading(true);
    setUsersError('');
    
    try {
      const response = await getAllUsers(fetchPage, fetchLimit, fetchRoleFilter);
      setUsers(response.users || []);
      setUsersTotal(response.pagination?.total || response.users?.length || 0);
      setUsersTotalPages(response.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsersError('Failed to fetch users. Please try again.');
    } finally {
      setUsersLoading(false);
    }
  };

  // Handle role filter change
  const handleRoleFilterChange = (newRole) => {
    setRoleFilter(newRole);
    setUsersPage(1); // Reset to first page when changing filter
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle users page change
  const handleUsersPageChange = (newPage) => {
    setUsersPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle users page size change
  const handleUsersLimitChange = (newLimit) => {
    setUsersLimit(newLimit);
    setUsersPage(1); // Reset to first page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle page size change
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle status filter change
  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setPage(1); // Reset to first page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusChange = async (pid, newStatus) => {
    setUpdatingProduct(pid);
    setError('');
    setSuccessMessage('');
    
    try {
      await updateProductStatus(pid, newStatus);
      setSuccessMessage(`Product ${newStatus.toLowerCase()} successfully!`);
      
      // Refresh the products list
      await fetchProducts();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating product status:', err);
      setError(err.message || 'Failed to update product status');
    } finally {
      setUpdatingProduct(null);
    }
  };

  // Handle opening the rejection modal
  const handleRejectClick = (product) => {
    setSelectedProduct(product);
    setShowRejectionModal(true);
  };

  // Handle closing the rejection modal
  const handleCloseRejectionModal = () => {
    setShowRejectionModal(false);
    setSelectedProduct(null);
  };

  // Handle rejection with reason
  const handleRejectWithReason = async (rejectionReason) => {
    if (!selectedProduct) return;
    
    setIsSubmittingRejection(true);
    setError('');
    
    try {
      await updateProductStatus(selectedProduct.pid, 'Rejected', rejectionReason);
      setSuccessMessage('Product rejected successfully!');
      
      // Refresh the products list
      await fetchProducts();
      
      // Close the modal
      handleCloseRejectionModal();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error rejecting product:', err);
      setError(err.message || 'Failed to reject product');
    } finally {
      setIsSubmittingRejection(false);
    }
  };

  // Handle order status change from OrderModal
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await updateAdminOrderStatus(orderId, newStatus);
      setSuccessMessage(`Order status updated to ${newStatus}!`);
      
      // Refresh the orders list
      await fetchOrders();
      
      // Clear the expanded order to close modal
      setExpandedOrder(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.message || 'Failed to update order status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'status-approved';
      case 'Rejected':
        return 'status-rejected';
      case 'Deleted':
        return 'status-deleted';
      case 'Submitted':
      default:
        return 'status-submitted';
    }
  };

  // Fetch latest product ID for the form
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

  // Handle form input changes with real-time validation
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

  // Handle form submission
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
      await fetchProducts();
      
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
      setSuccessMessage('Product created successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`admin-dashboard-container ${isDark ? 'dark' : ''}`}>
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
    <div className={`admin-dashboard-container ${isDark ? 'dark' : ''}`}>
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="dashboard-header-right">
          <div className="account-info">
            <div className="name-badge-container">
              <span className="account-name">{user?.name || user?.businessName}</span>
              <span className="role-badge">{user?.role || 'admin'}</span>
            </div>
            <span className="account-email">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="category-filters">
        <button
          className={`category-filter-btn ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          Analysis
        </button>
        <button
          className={`category-filter-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
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

      {activeTab === 'analysis' && (
        <div className="content-section">
          <div className="section-card">
            <h2>Analysis</h2>
            <p>Analysis dashboard content will be displayed here.</p>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="content-section">
          <div className="users-header">
            <h2>User Management</h2>
            <div className="header-actions">
              <div className="role-filters">
                <button
                  className={`status-filter-btn ${roleFilter === 'all' ? 'active' : ''}`}
                  onClick={() => handleRoleFilterChange('all')}
                >
                  All
                </button>
                <button
                  className={`status-filter-btn ${roleFilter === 'admin' ? 'active' : ''}`}
                  onClick={() => handleRoleFilterChange('admin')}
                >
                  Admin
                </button>
                <button
                  className={`status-filter-btn ${roleFilter === 'seller' ? 'active' : ''}`}
                  onClick={() => handleRoleFilterChange('seller')}
                >
                  Seller
                </button>
                <button
                  className={`status-filter-btn ${roleFilter === 'buyer' ? 'active' : ''}`}
                  onClick={() => handleRoleFilterChange('buyer')}
                >
                  Buyer
                </button>
              </div>
            </div>
          </div>

          {usersError && <div className="error-message">{usersError}</div>}

          {usersLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="no-users">
              <p>No users found.</p>
            </div>
          ) : (
            <>
              {/* Results Info and Page Size Selector */}
              {users.length > 0 && (
                <div className="results-header">
                  <div className="results-count">
                    {usersTotal} user{usersTotal !== 1 ? 's' : ''} found
                    <span className="total-count"> (showing {users.length} of {usersTotal})</span>
                  </div>
                  
                  <div className="page-size-selector">
                    <label htmlFor="users-page-size">Show:</label>
                    <select
                      id="users-page-size"
                      value={usersLimit}
                      onChange={(e) => handleUsersLimitChange(Number(e.target.value))}
                      className="filter-select"
                    >
                      {PAGE_SIZE_OPTIONS.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              <div className="admin-users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr 
                        key={user._id} 
                        className="user-row"
                        onClick={() => setExpandedUser(user)}
                      >
                        <td>
                          <div className="user-name-cell">
                            <span className="user-name">{user.name}</span>
                            {user.businessName && (
                              <span className="user-business">{user.businessName}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge-cell role-${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{user.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {usersTotalPages > 1 && (
                <Pagination
                  currentPage={usersPage}
                  totalPages={usersTotalPages}
                  onPageChange={handleUsersPageChange}
                />
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="content-section">
          <div className="products-header">
            <h2>Product Management</h2>
            <div className="header-actions">
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

          {error && !showForm && <div className="error-message">{error}</div>}
          {successMessage && !showForm && <div className="success-message">{successMessage}</div>}

          {/* Results Info and Page Size Selector */}
          {products.length > 0 && (
            <div className="results-header">
              <div className="results-count">
                {total} product{total !== 1 ? 's' : ''} found
                <span className="total-count"> (showing {products.length} of {total})</span>
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
          )}

          {productsLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <p>No products found.</p>
            </div>
          ) : (
            <>
              <div className="admin-products-table">
                <table>
                <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Seller</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr 
                        key={product.pid} 
                        onClick={() => setExpandedProduct(product)}
                        className="product-row-clickable"
                      >
                        <td>
                          <div className="product-image-cell">
                            {product.image ? (
                              <img src={product.image} alt={product.name} />
                            ) : (
                              <div className="no-image">No Image</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="product-name-cell">
                            <span className="product-name">{product.name}</span>
                            {product.description && (
                              <span className="product-description">
                                {product.description.substring(0, 50)}...
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{product.category}</td>
                        <td>{product.username || 'Unknown'}</td>
                        <td>${product.price?.toFixed(2)}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(product.status)}`}>
                            {product.status || 'Submitted'}
                          </span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="action-buttons">
                            {product.status !== 'Approved' && (
                              <button
                                className="approve-btn"
                                onClick={() => handleStatusChange(product.pid, 'Approved')}
                                disabled={updatingProduct === product.pid}
                              >
                                {updatingProduct === product.pid ? '...' : '✓ Approve'}
                              </button>
                            )}
                            {product.status !== 'Rejected' && (
                              <button
                                className="reject-btn"
                                onClick={() => handleRejectClick(product)}
                                disabled={updatingProduct === product.pid}
                              >
                                {updatingProduct === product.pid ? '...' : '⚠ Reject'}
                              </button>
                            )}
                            {product.status !== 'Deleted' && (
                              <button
                                className="delete-btn"
                                onClick={() => handleStatusChange(product.pid, 'Deleted')}
                                disabled={updatingProduct === product.pid}
                              >
                                {updatingProduct === product.pid ? '...' : '✗ Delete'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="content-section">
          <div className="orders-header">
            <h2>Order Management</h2>
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

      {/* Rejection Modal */}
      {showRejectionModal && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseRejectionModal}
          isRejectionMode={true}
          onReject={handleRejectWithReason}
          onCancel={handleCloseRejectionModal}
          isSubmitting={isSubmittingRejection}
        />
      )}

      {/* Expanded Product Modal */}
      {expandedProduct && (
        <ProductModal
          product={expandedProduct}
          onClose={() => setExpandedProduct(null)}
          onStatusChange={handleStatusChange}
          updatingProduct={updatingProduct}
        />
      )}

      {/* Expanded User Modal */}
      {expandedUser && (
        <UserModal
          user={expandedUser}
          onClose={() => setExpandedUser(null)}
          onUserUpdated={(updatedUser) => {
            // Refresh users list after update
            fetchUsers();
            setExpandedUser(null);
          }}
        />
      )}

      {/* Expanded Order Modal */}
      {expandedOrder && (
        <OrderModal
          order={expandedOrder}
          onClose={() => setExpandedOrder(null)}
          userRole="admin"
          onStatusChange={handleOrderStatusChange}
        />
      )}
    </div>
  );
}

export default AdminDashboard;

