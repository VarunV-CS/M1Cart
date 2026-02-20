import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getOrders, isAuthenticated } from '../services/api';
import { Spinner, Card } from '../components/patterns';
import Pagination from '../components/Pagination';
import './Orders.css';

// Order status options
const ORDER_STATUSES = ['All', 'pending', 'completed', 'failed'];

// Page size options
const PAGE_SIZE_OPTIONS = [5, 10, 20];

function Orders() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch orders with filter and pagination
  const fetchOrders = useCallback(async (pageNum, limitNum, status) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Convert 'All' to null for API
      const statusFilter = status === 'All' ? null : status;
      
      const response = await getOrders(pageNum, limitNum, statusFilter);
      
      if (response.success) {
        setOrders(response.orders || []);
        setTotal(response.pagination?.total || response.orders?.length || 0);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setError(response.message || 'Failed to load orders');
        setOrders([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check authentication and fetch orders on mount and when filters/pagination change
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    fetchOrders(page, limit, selectedStatus);
  }, [navigate, page, limit, selectedStatus, fetchOrders]);

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
  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setPage(1); // Reset to first page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-default';
    }
  };

  if (isLoading) {
    return (
      <div className={`orders-page ${isDark ? 'dark' : ''}`}>
        <div className="orders-container">
          <div className="loading-container">
            <Spinner size="large" text="Loading your orders..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`orders-page ${isDark ? 'dark' : ''}`}>
      <div className="orders-container">
        <div className="orders-header">
          <h1>Your Orders</h1>
          <button 
            className="back-btn"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Order Status Filter */}
        <div className="status-filters">
          <div className="filter-buttons">
            {ORDER_STATUSES.map(status => (
              <button
                key={status}
                className={`status-filter-btn ${selectedStatus === status ? 'active' : ''}`}
                onClick={() => handleStatusChange(status)}
              >
                {status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info and Page Size Selector */}
        <div className="results-header">
          <div className="results-count">
            {total} order{total !== 1 ? 's' : ''} found
            {total > 0 && <span className="total-count"> (showing {orders.length} of {total})</span>}
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

        {orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h2>No orders found</h2>
            <p>Try changing the filter or place a new order.</p>
            <button 
              className="shop-now-btn"
              onClick={() => navigate('/categories')}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="orders-list">
              {orders.map((order) => (
                <Card key={order.id} className="order-card">
                  <Card.Header>
                    <div className="order-header-content">
                      <div className="order-info">
                        <span className="order-id">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                        <span className={`order-status ${getStatusBadgeClass(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="order-date">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <div className="order-items">
                      {order.items && order.items.map((item, index) => (
                        <div key={index} className="order-item-row">
                          <div className="item-image">
                            {item.image ? (
                              <img src={item.image} alt={item.name} />
                            ) : (
                              <div className="no-image">No Image</div>
                            )}
                          </div>
                          <div className="item-details">
                            <h4>{item.name}</h4>
                            <p className="item-category">{item.category}</p>
                          </div>
                          <div className="item-quantity">x{item.quantity}</div>
                          <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="order-summary">
                      <div className="summary-row items">
                        <span>Items:</span>
                        <span>{order.items?.reduce((total, item) => total + item.quantity, 0) || 0}</span>
                      </div>
                      <div className="summary-row total">
                        <span>Total:</span>
                        <span className="total-amount">${order.amount?.toFixed(2)}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
            
            {/* Pagination Controls */}
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
    </div>
  );
}

export default Orders;

