import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  createProduct,
  getAllProducts,
  getLatestProductId,
  updateProductStatus,
} from '../services/api';
import Pagination from './Pagination';
import ProductModal from './ProductModal';
import './Products.css';

const PAGE_SIZE_OPTIONS = [5, 10, 20];

function Products() {
  const { isDark } = useTheme();

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingProduct, setUpdatingProduct] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmittingRejection, setIsSubmittingRejection] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(null);

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

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const isFetchingProductsRef = useRef(false);

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, page, limit]);

  const fetchProducts = async (fetchPage = page, fetchLimit = limit, fetchStatus = statusFilter) => {
    if (isFetchingProductsRef.current) return;

    setProductsLoading(true);
    setError('');
    isFetchingProductsRef.current = true;

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
      isFetchingProductsRef.current = false;
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusChange = async (pid, newStatus) => {
    setUpdatingProduct(pid);
    setError('');
    setSuccessMessage('');

    try {
      await updateProductStatus(pid, newStatus);
      setSuccessMessage(`Product ${newStatus.toLowerCase()} successfully!`);
      await fetchProducts();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating product status:', err);
      setError(err.message || 'Failed to update product status');
    } finally {
      setUpdatingProduct(null);
    }
  };

  const handleRejectClick = (product) => {
    setSelectedProduct(product);
    setShowRejectionModal(true);
  };

  const handleCloseRejectionModal = () => {
    setShowRejectionModal(false);
    setSelectedProduct(null);
  };

  const handleRejectWithReason = async (rejectionReason) => {
    if (!selectedProduct) return;

    setIsSubmittingRejection(true);
    setError('');

    try {
      await updateProductStatus(selectedProduct.pid, 'Rejected', rejectionReason);
      setSuccessMessage('Product rejected successfully!');
      await fetchProducts();
      handleCloseRejectionModal();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error rejecting product:', err);
      setError(err.message || 'Failed to reject product');
    } finally {
      setIsSubmittingRejection(false);
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

  const fetchLatestPid = async () => {
    try {
      const response = await getLatestProductId();
      const nextPid = (response.latestPid || 0) + 1;
      setFormData((prev) => ({ ...prev, pid: nextPid }));
    } catch (err) {
      console.error('Error fetching latest PID:', err);
      setFormData((prev) => ({ ...prev, pid: Date.now() }));
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
      await fetchProducts();

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
      setSuccessMessage('Product created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={`content-section ${isDark ? 'dark' : ''}`}>
        <div className="products-header">
          <h2>Product Management</h2>
          <div className="header-actions">
            <button
              className="add-product-btn"
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
                  <label htmlFor="name">
                    Product Name * <span className="required-mark">(min 2 characters)</span>
                  </label>
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
                  <label htmlFor="category">
                    Category * <span className="required-mark">(min 3 characters)</span>
                  </label>
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
                  <label htmlFor="price">
                    Price * <span className="required-mark">(cannot be negative)</span>
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

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Product'}
              </button>
            </form>
          </div>
        )}

        {error && !showForm && <div className="error-message">{error}</div>}
        {successMessage && !showForm && <div className="success-message">{successMessage}</div>}

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
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
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

      {expandedProduct && (
        <ProductModal
          product={expandedProduct}
          onClose={() => setExpandedProduct(null)}
          onStatusChange={handleStatusChange}
          updatingProduct={updatingProduct}
        />
      )}
    </>
  );
}

export default Products;
