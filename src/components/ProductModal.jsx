import { useEffect, useCallback } from 'react';
import './ProductModal.css';

const ProductModal = ({ product, onClose }) => {
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
      className="product-modal-overlay" 
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
            
            <div className="product-modal-id">
              <span>Product ID: </span>
              <strong>{product.pid}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;

