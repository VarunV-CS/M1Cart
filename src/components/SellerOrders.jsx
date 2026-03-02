import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getSellerOrders, updateSellerOrderStatus } from '../services/api';
import OrderModal from './OrderModal';
import Pagination from './Pagination';
import './SellerOrders.css';

const PAGE_SIZE_OPTIONS = [5, 10, 20];
const ORDER_STATUS_FILTERS = ['all', 'completed', 'pending', 'failed', 'cancelled', 'dispatched', 'delivered'];

function SellerOrders() {
  const { isDark } = useTheme();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLimit, setOrdersLimit] = useState(10);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [ordersTotal, setOrdersTotal] = useState(0);

  const isFetchingOrdersRef = useRef(false);

  const fetchOrders = useCallback(async (
    fetchPage = ordersPage,
    fetchLimit = ordersLimit,
    fetchStatus = orderStatusFilter
  ) => {
    if (isFetchingOrdersRef.current) return;

    setOrdersLoading(true);
    setOrdersError('');
    isFetchingOrdersRef.current = true;

    try {
      const response = await getSellerOrders(fetchPage, fetchLimit, fetchStatus);
      setOrders(response.orders || []);
      setOrdersTotal(response.pagination?.total || response.orders?.length || 0);
      setOrdersTotalPages(response.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrdersError('Failed to fetch orders. Please try again.');
    } finally {
      setOrdersLoading(false);
      isFetchingOrdersRef.current = false;
    }
  }, [ordersPage, ordersLimit, orderStatusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOrderStatusFilterChange = (newStatus) => {
    setOrderStatusFilter(newStatus);
    setOrdersPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrdersPageChange = (newPage) => {
    setOrdersPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrdersLimitChange = (newLimit) => {
    setOrdersLimit(newLimit);
    setOrdersPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    setOrdersError('');

    try {
      await updateSellerOrderStatus(orderId, newStatus);
      await fetchOrders();
      setExpandedOrder(null);
    } catch (err) {
      console.error('Error updating order status:', err);
      setOrdersError(err.message || 'Failed to update order status');
    }
  };

  return (
    <div className={`seller-orders-section ${isDark ? 'dark' : ''}`}>
      <div className="orders-header">
        <h2>My Orders</h2>
        <div className="header-actions">
          <div className="status-filters">
            {ORDER_STATUS_FILTERS.map((status) => (
              <button
                key={status}
                className={`status-filter-btn ${orderStatusFilter === status ? 'active' : ''}`}
                onClick={() => handleOrderStatusFilterChange(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
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
          <div className="results-header">
            <div className="results-count">
              {ordersTotal} order{ordersTotal !== 1 ? 's' : ''} found
              <span className="total-count"> (showing {orders.length} of {ordersTotal})</span>
            </div>

            <div className="page-size-selector">
              <label htmlFor="seller-orders-page-size">Show:</label>
              <select
                id="seller-orders-page-size"
                value={ordersLimit}
                onChange={(e) => handleOrdersLimitChange(Number(e.target.value))}
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
                    key={order.id || order._id}
                    className="order-row"
                    onClick={() => setExpandedOrder(order)}
                  >
                    <td>
                      <span className="order-id">#{order.id?.slice(0, 8).toUpperCase() || 'N/A'}</span>
                    </td>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-name">{order.user?.name || 'Unknown'}</span>
                        {order.user?.email && <span className="customer-email">{order.user.email}</span>}
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
                      <span className={`order-status status-${order.status || 'unknown'}`}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <span className="order-date">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
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

export default SellerOrders;
