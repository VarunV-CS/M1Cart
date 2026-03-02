import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getOrders, isAuthenticated } from '../services/api';
import { Spinner } from '../components/patterns';
import OrderModal from '../components/OrderModal';
import Pagination from '../components/Pagination';
import './Orders.css';

// Order status options
const ORDER_STATUSES = ['All', 'pending', 'completed', 'failed', 'cancelled', 'dispatched', 'delivered', 'refunded'];

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

  // Expanded order modal state
  const [expandedOrder, setExpandedOrder] = useState(null);

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
      day: 'numeric'
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
      case 'cancelled':
        return 'status-cancelled';
      case 'dispatched':
        return 'status-dispatched';
      case 'delivered':
        return 'status-delivered';
      case 'refunded':
        return 'status-refunded';
      default:
        return 'status-default';
    }
  };

  const getTotalItems = (order) => {
    if (!order.items) return 0;
    return order.items.reduce((total, item) => total + item.quantity, 0);
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
        {orders.length > 0 && (
          <div className="results-header">
            <div className="results-count">
              {total} order{total !== 1 ? 's' : ''} found
              <span className="total-count"> (showing {orders.length} of {total})</span>
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
            {/* Orders Table */}
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
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
                        <span className="items-count">
                          {getTotalItems(order)} item{getTotalItems(order) !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td>
                        <span className="order-amount">${order.amount?.toFixed(2) || '0.00'}</span>
                      </td>
                      <td>
                        <span className={`order-status ${getStatusBadgeClass(order.status)}`}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <span className="order-date">
                          {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {/* Expanded Order Modal */}
      {expandedOrder && (
        <OrderModal
          order={expandedOrder}
          onClose={() => setExpandedOrder(null)}
          userRole="buyer"
        />
      )}
    </div>
  );
}

export default Orders;
