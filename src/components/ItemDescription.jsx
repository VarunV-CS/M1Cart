import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import Comments from './Comments';
import './ItemDescription.css';

const ItemDescription = () => {
  const { pid } = useParams();
  console.log(pid)
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, cartItems } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProductById(Number(pid));
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [pid, location.pathname]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="item-description-page">
        <div className="container">
          <div className="not-found">
            <h2>Product not found</h2>
            <button onClick={() => navigate('/categories')} className="back-button">
              Back to Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cartItem = cartItems.find(item => item.pid === product.pid);
  const inCart = !!cartItem;

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div className="item-description-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <div className="product-detail">
          <div className="product-image-large">
            <img src={product.image} alt={product.name} />
            {!product.inStock && (
              <div className="out-of-stock-overlay">Out of Stock</div>
            )}
          </div>
          <div className="product-details">
            <h1>{product.name}</h1>
            <div className="product-meta">
              <span className="product-category-badge">{product.category}</span>
              <div className="product-rating-large">
                <span>⭐</span>
                <span>{product.rating}</span>
              </div>
            </div>
            <div className="product-price-large">${product.price.toFixed(2)}</div>
            {product.sellerBusinessName && (
              <div className="provided-by">
                <span className="provided-by-label">Provided by:</span>
                <span className="provided-by-business-name">{product.sellerBusinessName}</span>
              </div>
            )}
            <p className="product-description">{product.description}</p>
            <div className="product-actions">
              <button
                className={`add-to-cart-button ${inCart ? 'in-cart' : ''}`}
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {inCart ? '✓ Added to Cart' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button
                className="view-cart-button"
                onClick={() => navigate('/cart')}
              >
                View Cart
              </button>
            </div>
            <div className="product-features">
              <div className="feature">
                <strong>Category:</strong> {product.category}
              </div>
              <div className="feature">
                <strong>Availability:</strong> {product.inStock ? 'In Stock' : 'Out of Stock'}
              </div>
              <div className="feature">
                <strong>Rating:</strong> {product.rating} / 5.0
              </div>
            </div>
          </div>
        </div>
        
        {/* Comments Section */}
        <div className="product-comments-section">
          <Comments productId={product.pid} />
        </div>
      </div>
    </div>
  );
};

export default ItemDescription;
