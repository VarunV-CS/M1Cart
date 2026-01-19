import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import withLogger from '../hocs/withLogger';
import './Cart.css';

const Cart = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const total = getCartTotal();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1>Your Cart</h1>
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <button onClick={() => navigate('/categories')} className="shop-button">
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Your Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</h1>
          <button onClick={clearCart} className="clear-cart-button">
            Clear Cart
          </button>
        </div>
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map(item => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
          <CartSummary />
          <button
            onClick={() => navigate('/categories')}
            className="continue-shopping-button"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default withLogger(Cart, 'Cart');
