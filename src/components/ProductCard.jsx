import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product, children, className = '', ...props }) => {
  if (children) {
    return (
      <Link 
        to={`/product/${product.id}`} 
        className={`product-card ${className}`}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <ProductCard.Image product={product} />
      <ProductCard.Info product={product} />
    </Link>
  );
};

ProductCard.Image = ({ product, showBadge = true, className = '' }) => {
  return (
    <div className={`product-image-container ${className}`}>
      <img src={product.image} alt={product.name} className="product-image" />
      {showBadge && !product.inStock && (
        <div className="out-of-stock-badge">Out of Stock</div>
      )}
    </div>
  );
};

ProductCard.Info = ({ product, children, className = '' }) => {
  if (children) {
    return (
      <div className={`product-info ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`product-info ${className}`}>
      <ProductCard.Name product={product} />
      <ProductCard.Category product={product} />
      <ProductCard.Footer product={product} />
      <ProductCard.Button product={product} />
    </div>
  );
};

ProductCard.Name = ({ product, className = '' }) => {
  return (
    <h3 className={`product-name ${className}`}>
      {product.name}
    </h3>
  );
};

ProductCard.Category = ({ product, className = '' }) => {
  return (
    <p className={`product-category ${className}`}>
      {product.category}
    </p>
  );
};

ProductCard.Price = ({ product, className = '' }) => {
  return (
    <span className={`product-price ${className}`}>
      ${product.price.toFixed(2)}
    </span>
  );
};

ProductCard.Rating = ({ product, className = '' }) => {
  return (
    <div className={`product-rating ${className}`}>
      <span>⭐</span>
      <span>{product.rating}</span>
    </div>
  );
};

ProductCard.Footer = ({ product, children, className = '' }) => {
  if (children) {
    return (
      <div className={`product-footer ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`product-footer ${className}`}>
      <ProductCard.Price product={product} />
      <ProductCard.Rating product={product} />
    </div>
  );
};

ProductCard.Button = ({ product, onAddToCart, className = '' }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCart(product);
    }
  };

  return (
    <button 
      className={`add-to-cart-btn ${className}`}
      onClick={handleAddToCart}
      disabled={!product.inStock}
    >
      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
    </button>
  );
};

export default ProductCard;

// Implemented compound components and a default implementation for backward compatibility
