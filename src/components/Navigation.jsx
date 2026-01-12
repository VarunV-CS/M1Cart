import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const { getCartItemsCount } = useCart();
  const cartCount = getCartItemsCount();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="logo">
          M1Cart
        </Link>
        <div className="nav-links">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            Home
          </Link>
          <Link 
            to="/categories" 
            className={location.pathname === '/categories' ? 'active' : ''}
          >
            Categories
          </Link>
          <Link 
            to="/cart" 
            className={`cart-link ${location.pathname === '/cart' ? 'active' : ''}`}
          >
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
