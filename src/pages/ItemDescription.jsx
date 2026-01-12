import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import './ItemDescription.css';

const ItemDescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  
  const product = products.find(p => p.id === parseInt(id));

  if (!product) {
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

  const cartItem = cartItems.find(item => item.id === product.id);
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
      </div>
    </div>
  );
};

export default ItemDescription;
