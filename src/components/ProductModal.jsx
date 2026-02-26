import { useEffect, useCallback, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import './ProductModal.css';

const ProductModal = ({ 
  product, 
  onClose, 
  isRejectionMode = false, 
  onReject, 
  onCancel, 
  isSubmitting = false,
  onStatusChange,
  updatingProduct
}) => {
  const { isDark } = useTheme();
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  // Check if this is expanded mode (not rejection mode)
  const isExpandedMode = !isRejectionMode && onStatusChange;

  // Handle escape key press
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Handle click outside the modal content
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('product-modal-overlay')) {
      onClose();
    }
  };

  // Handle rejection reason submission
  const handleRejectSubmit = (e) => {
    e.preventDefault();
    
    // Validate rejection reason
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    if (rejectionReason.trim().length < 10) {
      setError('Rejection reason must be at least 10 characters long');
      return;
    }
    
    setError('');
    onReject(rejectionReason.trim());
  };

  // Handle cancel in rejection mode
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  // Handle status change button click
  const handleStatusButtonClick = (newStatus) => {
    if (onStatusChange) {
      onStatusChange(product.pid, newStatus);
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

  if (!product) return null;

  return (
    <div 
      className={`product-modal-overlay ${isDark ? 'dark' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className="product-modal-content">
        <button 
          className="product-modal-close" 
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        
        <div className="product-modal-body">
          <div className="product-modal-image">
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <div className="product-modal-no-image">
                <span>No Image Available</span>
              </div>
            )}
          </div>
          
          <div className="product-modal-details">
            <h2 className="product-modal-title">{product.name}</h2>
            
            <div className="product-modal-meta">
              <span className="product-modal-category">{product.category}</span>
              <span className={`product-modal-status status-${product.status?.toLowerCase() || 'submitted'}`}>
                {product.status || 'Submitted'}
              </span>
              <button 
                className="product-modal-refresh" 
                aria-label="Refresh status"
                onClick={(e) => e.stopPropagation()}
              >
                Q
              </button>
            </div>
            
            <div className="product-modal-price">
              ${product.price?.toFixed(2)}
            </div>
            
            <div className="product-modal-rating">
              <span className="star">⭐</span>
              <span>{product.rating || '4.5'}</span>
            </div>
            
            <div className={`product-modal-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
              {product.inStock ? '✓ In Stock' : '✕ Out of Stock'}
            </div>
            
            <div className="product-modal-description">
              <h4>Description</h4>
              <p>{product.description || 'No description available.'}</p>
            </div>

            {/* Submitted By Section - Shown in Expanded Mode */}
            {isExpandedMode && (product.user || product.username) && (
              <div className="product-modal-submitted-by">
                <span className="submitted-by-label">Submitted by :</span>
                <span className="submitted-by-value">
                  {product.user?.name || ''}
                  {(product.user?.name && product.user?.businessName) && ' - '}
                  {product.user?.businessName || product.username || ''}
                </span>
              </div>
            )}

            {/* Action Buttons - Shown in Expanded Mode */}
            {isExpandedMode && (
              <div className="product-modal-actions">
                {product.status !== 'Approved' && (
                  <button
                    className="modal-action-btn approve-btn"
                    onClick={() => handleStatusButtonClick('Approved')}
                    disabled={updatingProduct === product.pid}
                  >
                    {updatingProduct === product.pid ? '...' : '✓ Approve'}
                  </button>
                )}
                {product.status !== 'Rejected' && (
                  <button
                    className="modal-action-btn reject-btn"
                    onClick={() => handleStatusButtonClick('Rejected')}
                    disabled={updatingProduct === product.pid}
                  >
                    {updatingProduct === product.pid ? '...' : '⚠ Reject'}
                  </button>
                )}
                {product.status !== 'Deleted' && (
                  <button
                    className="modal-action-btn delete-btn"
                    onClick={() => handleStatusButtonClick('Deleted')}
                    disabled={updatingProduct === product.pid}
                  >
                    {updatingProduct === product.pid ? '...' : '✗ Delete'}
                  </button>
                )}
              </div>
            )}
            
            <div className="product-modal-id">
              <span>Product ID: </span>
              <strong>{product.pid}</strong>
            </div>

            {/* Rejection Form */}
            {isRejectionMode && (
              <div className="product-modal-rejection-form">
                <h4>Reason for Rejection</h4>
                <p className="rejection-form-description">
                  Please provide a reason for rejecting this product. This will be visible to the seller.
                </p>
                <form onSubmit={handleRejectSubmit}>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => {
                      setRejectionReason(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter reason for rejection (minimum 10 characters)..."
                    rows={4}
                    className="rejection-textarea"
                    disabled={isSubmitting}
                  />
                  {error && <div className="rejection-error">{error}</div>}
                  <div className="rejection-form-actions">
                    <button 
                      type="button" 
                      className="rejection-cancel-btn"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="rejection-submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Rejection'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;

