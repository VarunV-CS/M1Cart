import { useEffect, useCallback, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import './OrderModal.css';

// Status options based on user role
const SELLER_STATUS_OPTIONS = [
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'returned', label: 'Returned' },
  { value: 'unfilled', label: 'Unfilled' }
];

const ADMIN_STATUS_OPTIONS = [
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' }
];

const OrderModal = ({ order, onClose, userRole, onStatusChange }) => {
  const { isDark } = useTheme();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle escape key press
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Handle click outside the modal content
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('order-modal-overlay')) {
      onClose();
    }
  };

  // Add event listeners for escape key and body scroll lock
  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [handleEscape]);

  // Handle status change from dropdown
  const handleStatusSelect = async (e) => {
    const newStatus = e.target.value;
    if (!newStatus || newStatus === order.status) return;

    setIsUpdating(true);
    try {
      await onStatusChange(order.id, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Determine if user can change status
  const canChangeStatus = userRole === 'seller' || userRole === 'admin';
  
  // Get status options based on role
  const getStatusOptions = () => {
    if (userRole === 'seller') {
      return SELLER_STATUS_OPTIONS;
    } else if (userRole === 'admin') {
      return ADMIN_STATUS_OPTIONS;
    }
    return [];
  };

  if (!order) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
      case 'cancelled':
        return 'status-cancelled';
      case 'dispatched':
        return 'status-dispatched';
      case 'delivered':
        return 'status-delivered';
      case 'returned':
        return 'status-returned';
      case 'unfilled':
        return 'status-unfilled';
      case 'refunded':
        return 'status-refunded';
      default:
        return 'status-default';
    }
  };

  const getTotalItems = () => {
    if (!order.items) return 0;
    return order.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalAmount = () => {
    if (!order.items) return 0;
    return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const statusOptions = getStatusOptions();

  return (
    <div 
      className={`order-modal-overlay ${isDark ? 'dark' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className="order-modal-content">
        <button 
          className="order-modal-close" 
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        
        <div className="order-modal-header">
          <h2>Order Details</h2>
          <div className="order-modal-id">
            <span>Order #</span>
            <strong>{order.id?.slice(0, 8).toUpperCase() || 'N/A'}</strong>
          </div>
        </div>

        <div className="order-modal-body">
          {/* Order Status Section */}
          <div className="order-modal-section">
            <div className="section-header">
              <h3>Status</h3>
              <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
              </span>
            </div>
            
            {/* Status Change Dropdown for Seller/Admin */}
            {canChangeStatus && statusOptions.length > 0 && (
              <div className="status-change-container">
                <label htmlFor="status-select">Change Status:</label>
                <select
                  id="status-select"
                  value={selectedStatus}
                  onChange={handleStatusSelect}
                  disabled={isUpdating}
                  className="status-select"
                >
                  <option value="">Select new status...</option>
                  {statusOptions.map(option => (
                    <option 
                      key={option.value} 
                      value={option.value}
                      disabled={order.status === option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                {isUpdating && <span className="updating-status">Updating...</span>}
              </div>
            )}
          </div>

          {/* Order Date Section */}
          <div className="order-modal-section">
            <div className="section-row">
              <div className="section-item">
                <span className="section-label">Order Date</span>
                <span className="section-value">{formatDate(order.createdAt)}</span>
              </div>
              {order.updatedAt && (
                <div className="section-item">
                  <span className="section-label">Last Updated</span>
                  <span className="section-value">{formatDate(order.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Details Section */}
          {order.user && (
            <div className="order-modal-section">
              <h3>Customer Details</h3>
              <div className="customer-info">
                <div className="info-row">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{order.user.name || 'N/A'}</span>
                </div>
                {order.user.businessName && (
                  <div className="info-row">
                    <span className="info-label">Business:</span>
                    <span className="info-value">{order.user.businessName}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{order.user.email || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Role:</span>
                  <span className="info-value">{order.user.role || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details Section */}
          <div className="order-modal-section">
            <h3>Payment Details</h3>
            <div className="payment-info">
              <div className="info-row">
                <span className="info-label">Payment ID:</span>
                <span className="info-value payment-id">{order.paymentIntentId || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Currency:</span>
                <span className="info-value">{order.currency?.toUpperCase() || 'USD'}</span>
              </div>
            </div>
          </div>

          {/* Order Items Section */}
          <div className="order-modal-section">
            <h3>Order Items ({getTotalItems()})</h3>
            <div className="order-items-list">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      <div className="item-meta">
                        <span className="item-category">{item.category || 'Uncategorized'}</span>
                        <span className="item-pid">ID: {item.pid}</span>
                      </div>
                    </div>
                    <div className="item-quantity">×{item.quantity}</div>
                    <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))
              ) : (
                <div className="no-items">No items in this order</div>
              )}
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="order-modal-section order-summary">
            <div className="summary-row">
              <span>Subtotal ({getTotalItems()} items)</span>
              <span>${getTotalAmount().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span className="total-amount">${order.amount?.toFixed(2) || getTotalAmount().toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="order-modal-footer">
          <button className="order-modal-btn close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;

